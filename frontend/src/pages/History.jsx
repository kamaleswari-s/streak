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

  const formatTime = (ts) => {
    if (!ts) return '--'
    return new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '36px', color: 'var(--primary)', marginBottom: '0.5rem' }}>session history</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>every minute of effort, logged.</p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            {['all', 'week', 'month'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
                  border: '2px solid var(--border)', fontSize: '14px',
                  background: filter === f ? 'var(--primary)' : 'transparent',
                  color: filter === f ? 'var(--bg)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)', fontWeight: '500', transition: 'all 0.2s'
                }}>
                {f === 'all' ? 'all time' : `this ${f}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-pixel)', color: 'var(--primary)' }}>loading...</div>
          ) : sessions.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🪑</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--primary)' }}>no sessions yet</div>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>start a session from the dashboard</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map((s, i) => (
                <motion.div key={s.id} className="glass"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--primary)', marginBottom: '4px' }}>{formatDate(s.date)}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{formatTime(s.start_time)} — {formatTime(s.end_time)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)' }}>{formatDuration(s.duration_minutes)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>duration</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)' }}>{Math.round(s.momentum_score)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>momentum</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--accent-dark)' }}>{Math.round(s.aura_score)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>aura</div>
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