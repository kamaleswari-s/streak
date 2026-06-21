import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/layout/Navbar'

const API = 'http://localhost:5000'

export default function Leaderboard() {
  const { token, logout } = useAuth()
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBoard() }, [])

  const fetchBoard = async () => {
    try {
      const res = await axios.get(`${API}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBoard(res.data.leaderboard)
    } catch (err) {
      if (err.response?.status === 401) logout()
    }
    setLoading(false)
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '36px', color: 'var(--primary)', marginBottom: '0.5rem' }}>leaderboard</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>weekly aura rankings. who's showing up?</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-pixel)', color: 'var(--primary)' }}>loading...</div>
          ) : board.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🏆</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--primary)' }}>no one on the board yet</div>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>complete sessions this week to appear here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {board.map((entry, i) => (
                <motion.div key={i} className="glass"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '16px',
                    border: entry.is_you ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    background: entry.is_you ? 'rgba(191,30,98,0.05)' : 'rgba(255,255,255,0.6)'
                  }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '24px', minWidth: '40px', textAlign: 'center' }}>
                    {i < 3 ? medals[i] : `#${entry.rank}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--primary)', marginBottom: '3px' }}>
                      {entry.name} {entry.is_you && '(you)'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {entry.active_days} days active · {Math.round(entry.total_mins)}m studied
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '28px', color: 'var(--primary)' }}>{Math.round(entry.aura_score)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>aura</div>
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