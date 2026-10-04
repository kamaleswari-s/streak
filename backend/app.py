from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
import bcrypt
import jwt
import os
import ssl
import json
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

IST = ZoneInfo("Asia/Kolkata")

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")

# Sessions shorter than this many minutes (quick tests, accidental taps) stay in
# History but are ignored in streaks, analytics, scores and the leaderboard.
MIN_REAL_SESSION_MIN = 2.0

# A gap between two sessions on the same day counts as a break if it is shorter
# than this. Longer gaps mean you were away, not on a break.
BREAK_MAX_MIN = 180.0

EYE_REST_KINDS = ("eye_rest_done", "eye_rest_skipped")

# ── MQTT CONFIG ───────────────────────────────────────────
MQTT_HOST = "hb67af32.ala.asia-southeast1.emqxsl.com"
MQTT_PORT = 8883
MQTT_USER = "streak_esp32"
MQTT_PASS = os.getenv("MQTT_PASSWORD")

# ── DATABASE ──────────────────────────────────────────────
def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            daily_goal_minutes INTEGER DEFAULT 60,
            device_name TEXT DEFAULT 'My STRËAK Device',
            theme TEXT DEFAULT 'berry_dreams',
            anonymous_mode BOOLEAN DEFAULT FALSE,
            onboarded BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    # personal goals and preferences (added later, safe to run every start)
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS sessions_goal INTEGER DEFAULT 3")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS active_days_goal INTEGER DEFAULT 5")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS focus_goal_minutes INTEGER DEFAULT 45")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS eye_rest_enabled BOOLEAN DEFAULT TRUE")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS eye_rest_minutes INTEGER DEFAULT 20")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS why_line TEXT DEFAULT ''")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            date TEXT NOT NULL,
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE,
            duration_minutes REAL DEFAULT 0,
            momentum_score REAL DEFAULT 0,
            aura_score REAL DEFAULT 0
        )
    """)
    cur.execute("ALTER TABLE sessions ADD COLUMN IF NOT EXISTS stand_up_reason TEXT")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS wellbeing_events (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            session_id INTEGER,
            kind TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("Database ready.")

# ── AUTH MIDDLEWARE ───────────────────────────────────────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "No token provided"}), 401
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user_id = data["user_id"]
        except:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

# ── MOMENTUM SCORING ──────────────────────────────────────
def calculate_momentum(duration_minutes, sessions_this_week, streak_days):
    duration_score = min(duration_minutes / 60, 2.0) * 50
    streak_score = min(streak_days / 7, 1.0) * 35
    frequency_score = min(sessions_this_week / 5, 1.0) * 15
    recency_score = 10
    total = duration_score + streak_score + frequency_score + recency_score
    return round(min(total, 100), 1)

# ── AURA SCORE ────────────────────────────────────────────
def calculate_aura(streak_days, avg_duration, consistency_rate, peak_sessions):
    streak_factor = min(streak_days / 30, 1.0) * 40
    duration_factor = min(avg_duration / 90, 1.0) * 25
    consistency_factor = consistency_rate * 25
    peak_factor = min(peak_sessions / 10, 1.0) * 10
    total = streak_factor + duration_factor + consistency_factor + peak_factor
    return round(min(total, 100), 1)

# ── STREAK DETECTION ──────────────────────────────────────
def get_streak(user_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT DISTINCT date FROM sessions
        WHERE user_id = %s AND duration_minutes >= %s
        ORDER BY date DESC
    """, (user_id, MIN_REAL_SESSION_MIN))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return 0

    streak = 0
    check_date = datetime.now(IST).date()

    for row in rows:
        session_date = date.fromisoformat(row["date"])
        if session_date == check_date:
            streak += 1
            check_date -= timedelta(days=1)
        elif session_date == check_date - timedelta(days=1):
            check_date = session_date
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    return streak

# ── SLEEP PATTERN ──────────────────────────────────────────
def get_sleep_pattern(user_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT date, MIN(start_time) as first_start, MAX(end_time) as last_end
        FROM sessions
        WHERE user_id = %s AND duration_minutes >= %s
        AND date >= %s
        GROUP BY date ORDER BY date ASC
    """, (user_id, MIN_REAL_SESSION_MIN, (datetime.now(IST).date() - timedelta(days=14)).isoformat()))
    days = cur.fetchall()
    cur.close()
    conn.close()

    if len(days) < 3:
        return None

    late_night_dates = set()
    for d in days:
        start_hour = d["first_start"].astimezone(IST).hour
        end_hour = d["last_end"].astimezone(IST).hour if d["last_end"] else start_hour
        if (start_hour >= 23 or start_hour < 4) or (end_hour >= 23 or end_hour < 4):
            late_night_dates.add(d["date"])

    gaps = []
    for i in range(len(days) - 1):
        this_day = days[i]
        next_day = days[i + 1]
        if not this_day["last_end"] or not next_day["first_start"]:
            continue
        d1 = date.fromisoformat(this_day["date"])
        d2 = date.fromisoformat(next_day["date"])
        if (d2 - d1).days != 1:
            continue
        gap_hours = (next_day["first_start"] - this_day["last_end"]).total_seconds() / 3600
        if 0 < gap_hours < 16:
            gaps.append(gap_hours)

    avg_gap = round(sum(gaps) / len(gaps), 1) if gaps else None

    sorted_late = sorted(late_night_dates)
    longest_streak = 0
    current_streak = 0
    prev_date = None
    for d_str in sorted_late:
        d = date.fromisoformat(d_str)
        if prev_date and (d - prev_date).days == 1:
            current_streak += 1
        else:
            current_streak = 1
        longest_streak = max(longest_streak, current_streak)
        prev_date = d

    return {
        "late_night_days": len(late_night_dates),
        "days_tracked": len(days),
        "avg_rest_gap_hours": avg_gap,
        "longest_late_streak": longest_streak
    }

# ── DAILY SUMMARIES AND BREAKS ────────────────────────────
# Break length = real gap between the end of one session and the start of the
# next on the same day. The break kind is the reason saved on the earlier session.
def get_day_and_break_stats(user_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT date, start_time, end_time, duration_minutes, stand_up_reason
        FROM sessions
        WHERE user_id=%s AND duration_minutes >= %s AND end_time IS NOT NULL
        ORDER BY start_time ASC
    """, (user_id, MIN_REAL_SESSION_MIN))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    days = {}
    breaks = []
    prev = None
    for r in rows:
        d = r["date"]
        day = days.setdefault(d, {
            "sessions": 0, "study_min": 0.0, "longest_session": 0.0,
            "breaks": 0, "break_min": 0.0, "first_start": None, "last_end": None
        })
        day["sessions"] += 1
        day["study_min"] += r["duration_minutes"]
        day["longest_session"] = max(day["longest_session"], r["duration_minutes"])
        start_ist = r["start_time"].astimezone(IST)
        end_ist = r["end_time"].astimezone(IST)
        if day["first_start"] is None:
            day["first_start"] = start_ist.strftime("%H:%M")
        day["last_end"] = end_ist.strftime("%H:%M")

        if prev is not None and prev["date"] == d:
            gap = (r["start_time"] - prev["end_time"]).total_seconds() / 60
            if 0 < gap < BREAK_MAX_MIN:
                reason = (prev["stand_up_reason"] or "Not specified").strip() or "Not specified"
                breaks.append({"date": d, "minutes": gap, "reason": reason})
                day["breaks"] += 1
                day["break_min"] += gap
        prev = r

    return days, breaks

def get_eye_rest_counts(user_id, since_date=None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT kind, created_at FROM wellbeing_events
        WHERE user_id=%s AND kind = ANY(%s)
    """, (user_id, list(EYE_REST_KINDS)))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    per_day = {}
    for r in rows:
        d = r["created_at"].astimezone(IST).date().isoformat()
        if since_date and d < since_date:
            continue
        bucket = per_day.setdefault(d, {"done": 0, "skipped": 0})
        if r["kind"] == "eye_rest_done":
            bucket["done"] += 1
        else:
            bucket["skipped"] += 1
    return per_day

# ── SESSION STATE ─────────────────────────────────────────
active_sessions = {}

# ── SESSION LOGIC (reusable — called from routes AND from MQTT) ──
def do_start_session(user_id):
    if user_id in active_sessions:
        return {"error": "Session already active"}

    now = datetime.now(IST)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions (user_id, date, start_time) VALUES (%s, %s, %s) RETURNING id",
        (user_id, now.date().isoformat(), now)
    )
    session_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    active_sessions[user_id] = {"session_id": session_id, "start_time": now}
    socketio.emit(f"session_started_{user_id}", {"start_time": now.isoformat()})
    return {"status": "started", "session_id": session_id, "start_time": now.isoformat()}

def do_end_session(user_id, reason=None):
    if user_id not in active_sessions:
        return {"error": "No active session"}

    now = datetime.now(IST)
    session_data = active_sessions[user_id]
    duration = (now - session_data["start_time"]).total_seconds() / 60

    streak = get_streak(user_id)

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT COUNT(DISTINCT date) as count FROM sessions
        WHERE user_id = %s AND date >= %s AND duration_minutes >= %s
    """, (user_id, (datetime.now(IST).date() - timedelta(days=7)).isoformat(), MIN_REAL_SESSION_MIN))
    sessions_this_week = cur.fetchone()["count"]

    score = calculate_momentum(duration, sessions_this_week, streak)

    cur.execute("""
        SELECT AVG(duration_minutes) as avg_dur FROM sessions
        WHERE user_id = %s AND duration_minutes >= %s
    """, (user_id, MIN_REAL_SESSION_MIN))
    avg_dur = cur.fetchone()["avg_dur"] or 0

    cur.execute("""
        SELECT COUNT(*) as peak FROM sessions
        WHERE user_id = %s AND duration_minutes >= 60
    """, (user_id,))
    peak_sessions = cur.fetchone()["peak"]

    consistency = 1.0
    aura = calculate_aura(streak, avg_dur, consistency, peak_sessions)

    cur2 = conn.cursor()
    cur2.execute("""
        UPDATE sessions SET end_time=%s, duration_minutes=%s,
        momentum_score=%s, aura_score=%s, stand_up_reason=%s WHERE id=%s
    """, (now, round(duration, 2), score, aura, reason, session_data["session_id"]))
    conn.commit()
    cur.close()
    cur2.close()
    conn.close()

    del active_sessions[user_id]

    result = {
        "status": "ended",
        "duration_minutes": round(duration, 2),
        "momentum_score": score,
        "aura_score": aura,
        "streak": streak
    }
    socketio.emit(f"session_ended_{user_id}", result)
    return result

# ── AUTH ROUTES ───────────────────────────────────────────
@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (name, email, password_hash)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "Email already registered"}), 409

    token = jwt.encode({
        "user_id": user_id,
        "exp": datetime.now(IST) + timedelta(days=30)
    }, JWT_SECRET, algorithm="HS256")
    return jsonify({"token": token, "user_id": user_id, "name": name, "onboarded": False})

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode({
        "user_id": user["id"],
        "exp": datetime.now(IST) + timedelta(days=30)
    }, JWT_SECRET, algorithm="HS256")
    return jsonify({
        "token": token,
        "user_id": user["id"],
        "name": user["name"],
        "onboarded": user["onboarded"],
        "theme": user["theme"]
    })

# ── ONBOARDING ────────────────────────────────────────────
@app.route("/auth/onboard", methods=["POST"])
@token_required
def onboard():
    data = request.json
    theme = data.get("theme", "berry_dreams")
    daily_goal = data.get("daily_goal_minutes", 60)
    device_name = data.get("device_name", "My STRËAK Device")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE users SET theme=%s, daily_goal_minutes=%s,
        device_name=%s, onboarded=TRUE WHERE id=%s
    """, (theme, daily_goal, device_name, request.user_id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": "onboarded"})

# ── ACCOUNT DELETION ──────────────────────────────────────
# Permanently deletes the account and everything that belongs to it.
# The password must be sent again as a safety check. Nothing is deleted if
# anything goes wrong, because all three deletes happen in one transaction.
@app.route("/account/delete", methods=["POST"])
@token_required
def delete_account():
    data = request.json or {}
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "Enter your password to confirm"}), 400

    conn = get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT password_hash FROM users WHERE id=%s", (request.user_id,))
        user = cur.fetchone()
        cur.close()

        if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
            conn.close()
            return jsonify({"error": "That password is not right"}), 401

        cur2 = conn.cursor()
        cur2.execute("DELETE FROM wellbeing_events WHERE user_id=%s", (request.user_id,))
        cur2.execute("DELETE FROM sessions WHERE user_id=%s", (request.user_id,))
        cur2.execute("DELETE FROM users WHERE id=%s", (request.user_id,))
        conn.commit()
        cur2.close()
        conn.close()
    except Exception as err:
        conn.rollback()
        conn.close()
        print("Account deletion failed:", err)
        return jsonify({"error": "Something went wrong, nothing was deleted"}), 500

    active_sessions.pop(request.user_id, None)
    return jsonify({"status": "deleted"})

# ── SESSION ROUTES ────────────────────────────────────────
@app.route("/session/start", methods=["POST"])
@token_required
def start_session():
    result = do_start_session(request.user_id)
    return jsonify(result), (400 if "error" in result else 200)

@app.route("/session/end", methods=["POST"])
@token_required
def end_session():
    data = request.json or {}
    reason = data.get("reason")
    result = do_end_session(request.user_id, reason)
    return jsonify(result), (400 if "error" in result else 200)

# saves the stand-up reason onto the most recently ended session
# (used when the sensor ended the session before the reason was picked)
@app.route("/session/reason", methods=["POST"])
@token_required
def save_session_reason():
    data = request.json or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"error": "No reason provided"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE sessions SET stand_up_reason=%s
        WHERE id = (
            SELECT id FROM sessions
            WHERE user_id=%s AND end_time IS NOT NULL
            ORDER BY end_time DESC LIMIT 1
        )
    """, (reason, request.user_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "saved"})

# logs a wellbeing event, for now the 20-20-20 eye rest (done or skipped)
@app.route("/events", methods=["POST"])
@token_required
def log_event():
    data = request.json or {}
    kind = data.get("kind")
    if kind not in EYE_REST_KINDS:
        return jsonify({"error": "Unknown event kind"}), 400

    session_id = active_sessions.get(request.user_id, {}).get("session_id")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO wellbeing_events (user_id, session_id, kind) VALUES (%s, %s, %s)",
        (request.user_id, session_id, kind)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "logged"})

# ── DASHBOARD ─────────────────────────────────────────────
@app.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    user_id = request.user_id
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT name, theme, daily_goal_minutes, device_name,
               sessions_goal, active_days_goal, focus_goal_minutes,
               eye_rest_enabled, eye_rest_minutes, why_line
        FROM users WHERE id=%s
    """, (user_id,))
    user = cur.fetchone()

    today_ist = datetime.now(IST).date()

    cur.execute("""
        SELECT date, SUM(duration_minutes) as total_mins,
        MAX(momentum_score) as score
        FROM sessions WHERE user_id=%s
        AND duration_minutes >= %s
        AND date >= %s
        GROUP BY date ORDER BY date ASC
    """, (user_id, MIN_REAL_SESSION_MIN, (today_ist - timedelta(days=7)).isoformat()))
    weekly_data = cur.fetchall()

    cur.execute("""
        SELECT DISTINCT date FROM sessions
        WHERE user_id=%s AND duration_minutes >= %s
    """, (user_id, MIN_REAL_SESSION_MIN))
    all_dates = [r["date"] for r in cur.fetchall()]

    cur.execute("""
        SELECT SUM(duration_minutes) as total
        FROM sessions WHERE user_id=%s AND date=%s AND duration_minutes >= %s
    """, (user_id, today_ist.isoformat(), MIN_REAL_SESSION_MIN))
    today_row = cur.fetchone()
    today_minutes = round(today_row["total"] or 0, 1)

    cur.execute("""
        SELECT COUNT(*) as n FROM sessions
        WHERE user_id=%s AND date=%s AND duration_minutes >= %s
    """, (user_id, today_ist.isoformat(), MIN_REAL_SESSION_MIN))
    today_sessions = cur.fetchone()["n"]

    cur.execute("""
        SELECT MAX(aura_score) as aura FROM sessions
        WHERE user_id=%s AND duration_minutes >= %s
    """, (user_id, MIN_REAL_SESSION_MIN))
    aura_row = cur.fetchone()
    aura_score = aura_row["aura"] or 0

    cur.close()
    conn.close()

    streak = get_streak(user_id)

    return jsonify({
        "user": dict(user),
        "streak": streak,
        "today_minutes": today_minutes,
        "today_sessions": today_sessions,
        "aura_score": aura_score,
        "weekly_data": [dict(r) for r in weekly_data],
        "all_dates": all_dates,
        "session_active": user_id in active_sessions,
        "session_start": active_sessions[user_id]["start_time"].isoformat() if user_id in active_sessions else None
    })

# ── ANALYTICS ─────────────────────────────────────────────
@app.route("/analytics", methods=["GET"])
@token_required
def analytics():
    user_id = request.user_id
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT start_time, duration_minutes
        FROM sessions WHERE user_id=%s AND duration_minutes >= %s
    """, (user_id, MIN_REAL_SESSION_MIN))
    raw_sessions = cur.fetchall()

    hour_stats = {}
    for s in raw_sessions:
        h = s["start_time"].astimezone(IST).hour
        if h not in hour_stats:
            hour_stats[h] = {"count": 0, "total": 0}
        hour_stats[h]["count"] += 1
        hour_stats[h]["total"] += s["duration_minutes"]

    by_hour = sorted(
        [{"hour": h, "count": v["count"], "avg_dur": v["total"] / v["count"]} for h, v in hour_stats.items()],
        key=lambda x: -x["count"]
    )

    cur.execute("""
        SELECT TO_CHAR(start_time AT TIME ZONE 'Asia/Kolkata', 'Day') as day,
        COUNT(*) as count, AVG(duration_minutes) as avg_dur
        FROM sessions WHERE user_id=%s AND duration_minutes >= %s
        GROUP BY day ORDER BY count DESC
    """, (user_id, MIN_REAL_SESSION_MIN))
    by_day = cur.fetchall()

    today_ist = datetime.now(IST).date()
    cur.execute("""
        SELECT date, SUM(duration_minutes) as total,
        MAX(momentum_score) as score
        FROM sessions WHERE user_id=%s AND duration_minutes >= %s
        AND date >= %s
        GROUP BY date ORDER BY date ASC
    """, (user_id, MIN_REAL_SESSION_MIN, (today_ist - timedelta(days=30)).isoformat()))
    monthly = cur.fetchall()

    cur.execute("""
        SELECT AVG(duration_minutes) as avg,
        MAX(duration_minutes) as best,
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_mins
        FROM sessions WHERE user_id=%s AND duration_minutes >= %s
    """, (user_id, MIN_REAL_SESSION_MIN))
    stats = cur.fetchone()

    cur.close()
    conn.close()

    sleep_pattern = get_sleep_pattern(user_id)

    # per-day summaries, breaks and eye rests
    days, breaks = get_day_and_break_stats(user_id)
    eye = get_eye_rest_counts(user_id)

    daily = []
    for d in sorted(days.keys(), reverse=True)[:30]:
        day = days[d]
        e = eye.get(d, {"done": 0, "skipped": 0})
        daily.append({
            "date": d,
            "sessions": day["sessions"],
            "study_min": round(day["study_min"], 1),
            "longest_session": round(day["longest_session"], 1),
            "breaks": day["breaks"],
            "break_min": round(day["break_min"], 1),
            "first_start": day["first_start"],
            "last_end": day["last_end"],
            "eye_rests_done": e["done"],
            "eye_rests_skipped": e["skipped"],
        })

    by_reason = {}
    for b in breaks:
        r = by_reason.setdefault(b["reason"], {"count": 0, "total": 0.0})
        r["count"] += 1
        r["total"] += b["minutes"]
    breaks_by_reason = sorted(
        [{"reason": k, "count": v["count"], "avg_min": round(v["total"] / v["count"], 1)} for k, v in by_reason.items()],
        key=lambda x: -x["count"]
    )

    total_break = sum(b["minutes"] for b in breaks)
    total_study = sum(d["study_min"] for d in days.values())

    break_summary = {
        "count": len(breaks),
        "total_min": round(total_break, 1),
        "avg_min": round(total_break / len(breaks), 1) if breaks else None,
        "longest_min": round(max(b["minutes"] for b in breaks), 1) if breaks else None,
        "by_reason": breaks_by_reason,
    }

    focus_summary = {
        "study_min": round(total_study, 1),
        "days_with_sessions": len(days),
        "avg_sessions_per_day": round(sum(d["sessions"] for d in days.values()) / len(days), 1) if days else None,
        "focus_percent": round(100 * total_study / (total_study + total_break)) if (total_study + total_break) > 0 else None,
    }

    eye_done = sum(v["done"] for v in eye.values())
    eye_skipped = sum(v["skipped"] for v in eye.values())
    eye_summary = {
        "done": eye_done,
        "skipped": eye_skipped,
        "done_percent": round(100 * eye_done / (eye_done + eye_skipped)) if (eye_done + eye_skipped) > 0 else None,
    }

    return jsonify({
        "by_hour": by_hour,
        "by_day": [dict(r) for r in by_day],
        "monthly_trend": [dict(r) for r in monthly],
        "stats": dict(stats),
        "sleep_pattern": sleep_pattern,
        "daily": daily,
        "breaks": break_summary,
        "focus": focus_summary,
        "eye_rest": eye_summary,
    })

# ── HISTORY (raw log, shows every session including short ones) ──
@app.route("/history", methods=["GET"])
@token_required
def history():
    user_id = request.user_id
    filter_by = request.args.get("filter", "all")

    today_ist = datetime.now(IST).date()

    if filter_by == "week":
        since = (today_ist - timedelta(days=7)).isoformat()
    elif filter_by == "month":
        since = (today_ist - timedelta(days=30)).isoformat()
    else:
        since = "2000-01-01"

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT id, date,
        to_char(start_time AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS') as start_time,
        to_char(end_time AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS') as end_time,
        duration_minutes, momentum_score, aura_score, stand_up_reason
        FROM sessions WHERE user_id=%s AND duration_minutes > 0
        AND date >= %s ORDER BY start_time DESC
    """, (user_id, since))
    sessions = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({
        "sessions": [dict(s) for s in sessions],
        "eye_rests": get_eye_rest_counts(user_id, since),
        "min_real_minutes": MIN_REAL_SESSION_MIN,
        "break_max_minutes": BREAK_MAX_MIN,
    })

# ── LEADERBOARD ───────────────────────────────────────────
@app.route("/leaderboard", methods=["GET"])
@token_required
def leaderboard():
    user_id = request.user_id
    today_ist = datetime.now(IST).date()

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT u.id, u.name, u.anonymous_mode,
        MAX(s.aura_score) as aura_score,
        COUNT(DISTINCT s.date) as active_days,
        SUM(s.duration_minutes) as total_mins
        FROM users u
        JOIN sessions s ON s.user_id = u.id
        WHERE s.date >= %s AND s.duration_minutes >= %s
        GROUP BY u.id, u.name, u.anonymous_mode
        ORDER BY aura_score DESC
        LIMIT 20
    """, ((today_ist - timedelta(days=7)).isoformat(), MIN_REAL_SESSION_MIN))
    board = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for i, row in enumerate(board):
        result.append({
            "rank": i + 1,
            "name": "Anonymous" if row["anonymous_mode"] else row["name"],
            "aura_score": row["aura_score"],
            "active_days": row["active_days"],
            "total_mins": round(row["total_mins"], 1),
            "is_you": row["id"] == user_id
        })

    return jsonify({"leaderboard": result})

# ── SETTINGS ──────────────────────────────────────────────
@app.route("/settings", methods=["GET"])
@token_required
def get_settings():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT name, email, theme, daily_goal_minutes, device_name, anonymous_mode,
               sessions_goal, active_days_goal, focus_goal_minutes,
               eye_rest_enabled, eye_rest_minutes, why_line
        FROM users WHERE id=%s
    """, (request.user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify(dict(user))

@app.route("/settings", methods=["PUT"])
@token_required
def update_settings():
    data = request.json or {}

    def clamp(value, low, high):
        try:
            return max(low, min(high, int(value)))
        except (TypeError, ValueError):
            return None

    # any value that is missing or invalid stays as it is in the database
    name = (data.get("name") or "").strip() or None
    anonymous = data.get("anonymous_mode")
    if not isinstance(anonymous, bool):
        anonymous = None
    eye_enabled = data.get("eye_rest_enabled")
    if not isinstance(eye_enabled, bool):
        eye_enabled = None
    why_line = data.get("why_line")
    why_line = str(why_line).strip()[:140] if why_line is not None else None

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE users SET
            name = COALESCE(%s, name),
            theme = COALESCE(%s, theme),
            daily_goal_minutes = COALESCE(%s, daily_goal_minutes),
            device_name = COALESCE(%s, device_name),
            anonymous_mode = COALESCE(%s, anonymous_mode),
            sessions_goal = COALESCE(%s, sessions_goal),
            active_days_goal = COALESCE(%s, active_days_goal),
            focus_goal_minutes = COALESCE(%s, focus_goal_minutes),
            eye_rest_enabled = COALESCE(%s, eye_rest_enabled),
            eye_rest_minutes = COALESCE(%s, eye_rest_minutes),
            why_line = COALESCE(%s, why_line)
        WHERE id = %s
    """, (
        name,
        data.get("theme"),
        clamp(data.get("daily_goal_minutes"), 10, 480),
        data.get("device_name"),
        anonymous,
        clamp(data.get("sessions_goal"), 1, 12),
        clamp(data.get("active_days_goal"), 1, 7),
        clamp(data.get("focus_goal_minutes"), 10, 240),
        eye_enabled,
        clamp(data.get("eye_rest_minutes"), 10, 60),
        why_line,
        request.user_id
    ))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "updated"})

@app.route('/health')
def health():
    return "OK", 200

# ── MQTT — handles tap, live status, and AI anomaly suggestions too ──
def get_user_id_by_email(email):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None

def on_mqtt_connect(client, userdata, flags, rc):
    if rc == 0:
        print("MQTT connected to broker.")
        client.subscribe("streak/+/presence")
        client.subscribe("streak/+/phone")
        client.subscribe("streak/+/break")
        client.subscribe("streak/+/environment")
        client.subscribe("streak/+/tap")
        client.subscribe("streak/+/status")
        client.subscribe("streak/+/anomaly")
    else:
        print(f"MQTT connection failed, code {rc}")

def on_mqtt_message(client, userdata, msg):
    parts = msg.topic.split("/")
    if len(parts) != 3:
        return
    _, email, event_type = parts
    payload = msg.payload.decode()

    user_id = get_user_id_by_email(email)
    if user_id is None:
        print(f"MQTT message from unrecognized email: {email}")
        return

    if event_type == "presence":
        if payload == "start":
            do_start_session(user_id)
        elif payload == "end":
            do_end_session(user_id, reason="Stood up (sensor detected)")
    elif event_type == "break" and payload == "forced":
        socketio.emit(f"forced_break_{user_id}", {})
    elif event_type == "environment" and payload == "danger":
        socketio.emit(f"environment_danger_{user_id}", {})
    elif event_type == "phone":
        socketio.emit(f"phone_{payload}_{user_id}", {})
    elif event_type == "tap":
        socketio.emit(f"tap_{user_id}", {})
    elif event_type == "anomaly":
        socketio.emit(f"anomaly_{user_id}", {"suggested": True})
    elif event_type == "status":
        try:
            status_data = json.loads(payload)
            socketio.emit(f"status_{user_id}", status_data)
        except:
            pass

def start_mqtt():
    if not MQTT_PASS:
        print("MQTT_PASSWORD not set - skipping MQTT connection.")
        return
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    client.tls_set(cert_reqs=ssl.CERT_NONE)
    client.tls_insecure_set(True)
    client.on_connect = on_mqtt_connect
    client.on_message = on_mqtt_message
    client.connect(MQTT_HOST, MQTT_PORT, 60)
    client.loop_start()

# ── RUN ───────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    start_mqtt()
    print("STRËAK backend running on http://localhost:5000")
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)