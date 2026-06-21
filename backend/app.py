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
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

IST = ZoneInfo("Asia/Kolkata")

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")

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
        WHERE user_id = %s AND duration_minutes > 0
        ORDER BY date DESC
    """, (user_id,))
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

# ── SESSION STATE ─────────────────────────────────────────
active_sessions = {}

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

    token = jwt.encode({"user_id": user_id}, JWT_SECRET, algorithm="HS256")
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

    token = jwt.encode({"user_id": user["id"]}, JWT_SECRET, algorithm="HS256")
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

# ── SESSION ROUTES ────────────────────────────────────────
@app.route("/session/start", methods=["POST"])
@token_required
def start_session():
    user_id = request.user_id
    if user_id in active_sessions:
        return jsonify({"error": "Session already active"}), 400

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

    active_sessions[user_id] = {
        "session_id": session_id,
        "start_time": now
    }

    socketio.emit(f"session_started_{user_id}", {"start_time": now.isoformat()})
    return jsonify({"status": "started", "session_id": session_id, "start_time": now.isoformat()})

@app.route("/session/end", methods=["POST"])
@token_required
def end_session():
    user_id = request.user_id
    if user_id not in active_sessions:
        return jsonify({"error": "No active session"}), 400

    now = datetime.now(IST)
    session_data = active_sessions[user_id]
    duration = (now - session_data["start_time"]).total_seconds() / 60

    streak = get_streak(user_id)

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT COUNT(DISTINCT date) as count FROM sessions
        WHERE user_id = %s AND date >= %s AND duration_minutes > 0
    """, (user_id, (datetime.now(IST).date() - timedelta(days=7)).isoformat()))
    sessions_this_week = cur.fetchone()["count"]

    score = calculate_momentum(duration, sessions_this_week, streak)

    cur.execute("""
        SELECT AVG(duration_minutes) as avg_dur FROM sessions
        WHERE user_id = %s AND duration_minutes > 0
    """, (user_id,))
    avg_dur = cur.fetchone()["avg_dur"] or 0

    cur.execute("""
        SELECT COUNT(*) as total_days
        FROM (SELECT DISTINCT date FROM sessions WHERE user_id = %s) d
    """, (user_id,))
    day_data = cur.fetchone()
    consistency = 1.0

    cur.execute("""
        SELECT COUNT(*) as peak FROM sessions
        WHERE user_id = %s AND duration_minutes >= 60
    """, (user_id,))
    peak_sessions = cur.fetchone()["peak"]

    aura = calculate_aura(streak, avg_dur, consistency, peak_sessions)

    cur2 = conn.cursor()
    cur2.execute("""
        UPDATE sessions SET end_time=%s, duration_minutes=%s,
        momentum_score=%s, aura_score=%s WHERE id=%s
    """, (now, round(duration, 2), score, aura, session_data["session_id"]))
    conn.commit()
    cur.close()
    cur2.close()
    conn.close()

    del active_sessions[user_id]

    socketio.emit(f"session_ended_{user_id}", {
        "duration_minutes": round(duration, 2),
        "momentum_score": score,
        "aura_score": aura,
        "streak": streak
    })

    return jsonify({
        "status": "ended",
        "duration_minutes": round(duration, 2),
        "momentum_score": score,
        "aura_score": aura,
        "streak": streak
    })

# ── DASHBOARD ─────────────────────────────────────────────
@app.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    user_id = request.user_id
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT name, theme, daily_goal_minutes, device_name FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()

    today_ist = datetime.now(IST).date()

    cur.execute("""
        SELECT date, SUM(duration_minutes) as total_mins,
        MAX(momentum_score) as score
        FROM sessions WHERE user_id=%s
        AND date >= %s
        GROUP BY date ORDER BY date ASC
    """, (user_id, (today_ist - timedelta(days=7)).isoformat()))
    weekly_data = cur.fetchall()

    cur.execute("""
        SELECT DISTINCT date FROM sessions
        WHERE user_id=%s AND duration_minutes > 0
    """, (user_id,))
    all_dates = [r["date"] for r in cur.fetchall()]

    cur.execute("""
        SELECT SUM(duration_minutes) as total
        FROM sessions WHERE user_id=%s AND date=%s
    """, (user_id, today_ist.isoformat()))
    today_row = cur.fetchone()
    today_minutes = round(today_row["total"] or 0, 1)

    cur.execute("""
        SELECT MAX(aura_score) as aura FROM sessions WHERE user_id=%s
    """, (user_id,))
    aura_row = cur.fetchone()
    aura_score = aura_row["aura"] or 0

    cur.close()
    conn.close()

    streak = get_streak(user_id)

    return jsonify({
        "user": dict(user),
        "streak": streak,
        "today_minutes": today_minutes,
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
        SELECT EXTRACT(HOUR FROM start_time AT TIME ZONE 'Asia/Kolkata') as hour,
        COUNT(*) as count, AVG(duration_minutes) as avg_dur
        FROM sessions WHERE user_id=%s AND duration_minutes > 0
        GROUP BY hour ORDER BY count DESC
    """, (user_id,))
    by_hour = cur.fetchall()

    cur.execute("""
        SELECT TO_CHAR(start_time AT TIME ZONE 'Asia/Kolkata', 'Day') as day,
        COUNT(*) as count, AVG(duration_minutes) as avg_dur
        FROM sessions WHERE user_id=%s AND duration_minutes > 0
        GROUP BY day ORDER BY count DESC
    """, (user_id,))
    by_day = cur.fetchall()

    today_ist = datetime.now(IST).date()
    cur.execute("""
        SELECT date, SUM(duration_minutes) as total,
        MAX(momentum_score) as score
        FROM sessions WHERE user_id=%s AND duration_minutes > 0
        AND date >= %s
        GROUP BY date ORDER BY date ASC
    """, (user_id, (today_ist - timedelta(days=30)).isoformat()))
    monthly = cur.fetchall()

    cur.execute("""
        SELECT AVG(duration_minutes) as avg,
        MAX(duration_minutes) as best,
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_mins
        FROM sessions WHERE user_id=%s AND duration_minutes > 0
    """, (user_id,))
    stats = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify({
        "by_hour": [dict(r) for r in by_hour],
        "by_day": [dict(r) for r in by_day],
        "monthly_trend": [dict(r) for r in monthly],
        "stats": dict(stats)
    })

# ── HISTORY ───────────────────────────────────────────────
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
        start_time AT TIME ZONE 'Asia/Kolkata' as start_time,
        end_time AT TIME ZONE 'Asia/Kolkata' as end_time,
        duration_minutes, momentum_score, aura_score
        FROM sessions WHERE user_id=%s AND duration_minutes > 0
        AND date >= %s ORDER BY start_time DESC
    """, (user_id, since))
    sessions = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"sessions": [dict(s) for s in sessions]})

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
        WHERE s.date >= %s AND s.duration_minutes > 0
        GROUP BY u.id, u.name, u.anonymous_mode
        ORDER BY aura_score DESC
        LIMIT 20
    """, ((today_ist - timedelta(days=7)).isoformat(),))
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
    cur.execute("SELECT name, email, theme, daily_goal_minutes, device_name, anonymous_mode FROM users WHERE id=%s", (request.user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify(dict(user))

@app.route("/settings", methods=["PUT"])
@token_required
def update_settings():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE users SET name=%s, theme=%s,
        daily_goal_minutes=%s, device_name=%s, anonymous_mode=%s
        WHERE id=%s
    """, (
        data.get("name"),
        data.get("theme"),
        data.get("daily_goal_minutes"),
        data.get("device_name"),
        data.get("anonymous_mode"),
        request.user_id
    ))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "updated"})

# ── RUN ───────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print("STRËAK backend running on http://localhost:5000")
    socketio.run(app, debug=True, port=5000)