import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/layout/Navbar'

const API = 'http://localhost:5000'

export default function History() {
  const { token, logout } = useAuth()
  const [sessions, setSessions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchHistory() }, [filter])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/history?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(res.data.sessions)
    } catch (err) {
      if (err.response?.status === 401) logout()
    }
    setLoading(false)
  }

  const formatDuration = (mins) => {
    if (!mins) return '0m'
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    if (h === 0) return `${m}m`
    return m === 0 ? `${h}h` : `${h}h ${m}m`
  }

  // IST fix — backend now sends IST timestamps directly
  const formatTime = (ts) => {
    if (!ts) return '--'
    const d = new Date(ts)
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
      hour12: true, timeZone: 'Asia/Kolkata'
    })
  }

  const formatDate = (dateStr) => {
    // dateStr is YYYY-MM-DD — parse without timezone shift
    const [y, m, d] = dateStr.split('-')
    const date = new Date(+y, +m - 1, +d)
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const SeatIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="28" width="32" height="4" rx="2" fill="var(--primary)" opacity="0.3"/>
      <rect x="10" y="32" width="4" height="10" rx="2" fill="var(--primary)" opacity="0.3"/>
      <rect x="34" y="32" width="4" height="10" rx="2" fill="var(--primary)" opacity="0.3"/>
      <rect x="14" y="18" width="20" height="12" rx="3" fill="var(--primary)" opacity="0.2"/>
      <circle cx="24" cy="14" r="5" fill="var(--primary)" opacity="0.2"/>
    </svg>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '36px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            session history
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2rem', opacity: 0.8 }}>
            every minute of effort, logged.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            {['all', 'week', 'month'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
                  border: '2px solid var(--border)', fontSize: '14px', fontWeight: '600',
                  background: filter === f ? 'var(--primary)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s'
                }}>
                {f === 'all' ? 'all time' : `this ${f}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-pixel)', color: 'var(--primary)' }}>
              loading...
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <SeatIcon />
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--primary)', marginBottom: '8px' }}>
                no sessions yet
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', opacity: 0.7 }}>
                start a session from the dashboard
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map((s, i) => (
                <motion.div key={s.id} className="glass"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px'
                  }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-pixel)', fontSize: '18px',
                      color: 'var(--primary)', marginBottom: '4px', fontWeight: '700'
                    }}>
                      {formatDate(s.date)}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.8, fontWeight: '500' }}>
                      {formatTime(s.start_time)} — {formatTime(s.end_time)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', fontWeight: '700' }}>
                        {formatDuration(s.duration_minutes)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-primary)', opacity: 0.6, fontWeight: '600', letterSpacing: '1px', marginTop: '2px' }}>
                        DURATION
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', fontWeight: '700' }}>
                        {Math.round(s.momentum_score)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-primary)', opacity: 0.6, fontWeight: '600', letterSpacing: '1px', marginTop: '2px' }}>
                        MOMENTUM
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--accent-dark)', fontWeight: '700' }}>
                        {Math.round(s.aura_score)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-primary)', opacity: 0.6, fontWeight: '600', letterSpacing: '1px', marginTop: '2px' }}>
                        AURA
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}