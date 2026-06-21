import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import io from 'socket.io-client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Navbar from '../components/layout/Navbar'

const API = 'http://localhost:5000'

function StatCard({ label, value, sub, accent }) {
  return (
    <motion.div
      className="glass"
      whileHover={{ y: -4 }}
      style={{ padding: '1.5rem', textAlign: 'center' }}
    >
      <div style={{
        fontSize: '12px', fontWeight: '600',
        color: accent ? 'var(--accent-dark)' : 'var(--text-secondary)',
        letterSpacing: '2px', marginBottom: '8px', opacity: 0.7
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-pixel)', fontSize: '42px',
        color: accent ? 'var(--accent-dark)' : 'var(--primary)', lineHeight: 1
      }}>{value}</div>
      {sub && <div style={{
        fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', opacity: 0.6
      }}>{sub}</div>}
    </motion.div>
  )
}

function LEDDevice({ score, sessionActive }) {
  const getLEDColor = () => {
    if (!sessionActive && score === 0) return { color: '#555', glow: '#555', label: 'dim', desc: 'no session today' }
    if (!sessionActive) return { color: '#888', glow: '#888', label: 'dim', desc: 'session ended' }
    if (score < 30) return { color: '#EF9F27', glow: '#EF9F27', label: 'amber', desc: 'building momentum' }
    if (score < 60) return { color: '#B5D4F4', glow: '#B5D4F4', label: 'cool white', desc: 'momentum growing' }
    if (score < 80) return { color: '#7F77DD', glow: '#7F77DD', label: 'deep purple', desc: 'full flow state' }
    return { color: '#639922', glow: '#639922', label: 'pulse green', desc: 'milestone hit' }
  }
  const led = getLEDColor()

  return (
    <motion.div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>DEVICE STATE</div>
      <motion.svg width="120" height="120" viewBox="0 0 100 100"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ display: 'block', margin: '0 auto 1rem' }}>
        <motion.circle cx="50" cy="8" r="2.5"
          animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }}
          transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="73" cy="15" r="2.5"
          animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
        <motion.circle cx="27" cy="15" r="2.5"
          animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
        <motion.circle cx="82" cy="38" r="2.5"
          animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
        <motion.circle cx="18" cy="38" r="2.5"
          animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
        <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" />
        <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
        <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
        <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" />
        <rect x="34" y="48" width="32" height="12" rx="3" fill="white" opacity="0.5" />
        <motion.circle cx="50" cy="38" r="7"
          animate={{
            fill: led.color,
            r: sessionActive ? [6, 9, 6] : 6,
          }}
          transition={{ duration: 1.8, repeat: Infinity }} />
        <circle cx="50" cy="38" r="3" fill="white" />
      </motion.svg>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--primary)', marginBottom: '4px' }}>{led.label}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.7 }}>{led.desc}</div>
    </motion.div>
  )
}

function AuraRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <motion.div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>AURA SCORE</div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
          <motion.circle cx="70" cy="70" r={radius} fill="none"
            stroke="var(--primary)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '32px', color: 'var(--primary)', lineHeight: 1 }}>{Math.round(score)}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '1rem', opacity: 0.7 }}>
        {score < 30 && 'keep going, aura is building'}
        {score >= 30 && score < 60 && 'solid momentum, stay consistent'}
        {score >= 60 && score < 80 && 'strong aura, you are on a roll'}
        {score >= 80 && 'maximum aura unlocked'}
      </div>
    </motion.div>
  )
}

function StreakCalendar({ dates }) {
  const today = new Date()
  const days = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    days.push({ iso, isToday: i === 0, hasSession: dates.includes(iso) })
  }

  return (
    <motion.div className="glass" style={{ padding: '1.5rem' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1rem', opacity: 0.7 }}>28-DAY STREAK CALENDAR</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {days.map((day, i) => (
          <motion.div key={day.iso}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            title={day.iso}
            style={{
              aspectRatio: '1', borderRadius: '6px',
              background: day.isToday ? 'var(--primary)' : day.hasSession ? 'var(--primary-light)' : 'rgba(191,30,98,0.08)',
              border: day.isToday ? '2px solid var(--primary)' : 'none'
            }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '1rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(191,30,98,0.08)' }} /> no session
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary-light)' }} /> studied
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} /> today
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const [data, setData] = useState(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionStart, setSessionStart] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const timerRef = useRef(null)

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
      setSessionActive(res.data.session_active)
      if (res.data.session_active && res.data.session_start) {
        const start = new Date(res.data.session_start)
        setSessionStart(start)
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }
    } catch (err) {
      if (err.response?.status === 401) logout()
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboard()
    socketRef.current = io(API)
    socketRef.current.on(`session_started_${user?.user_id}`, (d) => {
      setSessionActive(true)
      const start = new Date(d.start_time)
      setSessionStart(start)
      setElapsed(0)
    })
    socketRef.current.on(`session_ended_${user?.user_id}`, () => {
      setSessionActive(false)
      setSessionStart(null)
      setElapsed(0)
      fetchDashboard()
    })
    return () => socketRef.current?.disconnect()
  }, [])

  useEffect(() => {
    if (sessionActive && sessionStart) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - sessionStart) / 1000))
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [sessionActive, sessionStart])

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatMins = (mins) => {
    if (!mins) return '0m'
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    if (h === 0) return `${m}m`
    return m === 0 ? `${h}h` : `${h}h ${m}m`
  }

  // ── INSTANT session buttons ──────────────────────────────
  const startSession = async () => {
    if (sessionActive) return
    const now = new Date()
    setSessionActive(true)
    setSessionStart(now)
    setElapsed(0)
    try {
      await axios.post(`${API}/session/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      setSessionActive(false)
      setSessionStart(null)
      console.error(err)
    }
  }

  const endSession = async () => {
    if (!sessionActive) return
    setSessionActive(false)
    setSessionStart(null)
    setElapsed(0)
    try {
      await axios.post(`${API}/session/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchDashboard()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '24px', color: 'var(--primary)' }}>
        loading strëak...
      </motion.div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--primary)', marginBottom: '6px' }}>
            {new Date().getHours() < 12 ? 'good morning' : new Date().getHours() < 17 ? 'good afternoon' : 'good evening'}, {user?.name?.split(' ')[0]} ✦
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', opacity: 0.7 }}>
            {sessionActive ? 'session in progress. keep going.' : data?.streak > 0 ? `you are on a ${data.streak}-day streak. don't break it.` : 'sit down and start your streak today.'}
          </p>
        </motion.div>

        {/* stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
          <StatCard label="STREAK" value={data?.streak || 0} sub="consecutive days" />
          <StatCard label="TODAY" value={formatMins(data?.today_minutes)} sub="logged so far" accent />
          <StatCard label="AURA" value={Math.round(data?.aura_score || 0)} sub="out of 100" />
          <StatCard label="THIS WEEK" value={data?.weekly_data?.length || 0} sub="active days" accent />
        </div>

        {/* session + device + aura */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '2rem' }}>

          <motion.div className="glass" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>CURRENT SESSION</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}>
                <motion.div
                  animate={{ opacity: sessionActive ? [0.5, 1, 0.5] : 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: sessionActive ? '#639922' : 'var(--border)' }} />
                <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {sessionActive ? 'session active' : 'no active session'}
                </span>
              </div>

              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '48px', color: 'var(--primary)', letterSpacing: '2px', marginBottom: '1.5rem' }}>
                {sessionActive ? formatTime(elapsed) : '00:00:00'}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button className="btn-primary"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={startSession} disabled={sessionActive}
                  style={{ flex: 1, padding: '12px', fontSize: '15px', opacity: sessionActive ? 0.4 : 1 }}>
                  sit down
                </motion.button>
                <motion.button className="btn-outline"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={endSession} disabled={!sessionActive}
                  style={{ flex: 1, padding: '12px', fontSize: '15px', opacity: !sessionActive ? 0.4 : 1 }}>
                  stand up
                </motion.button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.5, marginTop: '1rem' }}>
                simulating PIR sensor — hardware connects later
              </div>
            </div>
          </motion.div>

          <LEDDevice score={elapsed / 60} sessionActive={sessionActive} />
          <AuraRing score={data?.aura_score || 0} />
        </div>

        {/* graph + calendar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <motion.div className="glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>7-DAY MOMENTUM</div>
            {data?.weekly_data?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.weekly_data}>
                  <XAxis dataKey="date"
                    tickFormatter={d => new Date(d).toLocaleDateString('en', { weekday: 'short' })}
                    tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                    axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => [`${Math.round(v)} mins`, 'studied']}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontFamily: 'var(--font-body)', fontSize: '13px' }} />
                  <Bar dataKey="total_mins" radius={[6, 6, 0, 0]}>
                    {data.weekly_data.map((_, i) => (
                      <Cell key={i} fill={i === data.weekly_data.length - 1 ? 'var(--primary)' : 'var(--primary-light)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '32px' }}>🪑</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--primary)', opacity: 0.6 }}>your desk is quiet</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', opacity: 0.5 }}>sit down and change that</div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StreakCalendar dates={data?.all_dates || []} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}