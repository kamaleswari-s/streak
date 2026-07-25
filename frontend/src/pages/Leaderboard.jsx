import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/layout/Navbar'
import API from '../config'

function RankBadge({ rank }) {
  const colors = {
    1: { bg: '#FFD700', text: '#7A5800' },
    2: { bg: '#C0C0C0', text: '#444444' },
    3: { bg: '#CD7F32', text: '#5A2D00' },
  }
  const style = colors[rank]
  if (style) {
    return (
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: style.text, fontWeight: '700' }}>
          {rank}
        </span>
      </div>
    )
  }
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      background: 'var(--surface-2)', border: '1.5px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '700', opacity: 0.8 }}>
        {rank}
      </span>
    </div>
  )
}

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

  const TrophyIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M14 8h20v16a10 10 0 0 1-20 0V8z" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.4"/>
      <path d="M14 12H8a4 4 0 0 0 0 8h6" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M34 12h6a4 4 0 0 1 0 8h-6" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <line x1="24" y1="34" x2="24" y2="40" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="16" y1="40" x2="32" y2="40" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '36px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            leaderboard
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2rem', opacity: 0.8 }}>
            weekly aura rankings. who's showing up?
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-pixel)', color: 'var(--primary)' }}>
              loading...
            </div>
          ) : board.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <TrophyIcon />
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--primary)', marginBottom: '8px' }}>
                no one on the board yet
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', opacity: 0.7 }}>
                complete sessions this week to appear here
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {board.map((entry, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: entry.is_you ? 'var(--primary)' : 'var(--surface)',
                    border: entry.is_you ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: entry.is_you ? '0 4px 20px rgba(0,0,0,0.15)' : 'none'
                  }}>

                  <RankBadge rank={entry.rank} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-pixel)', fontSize: '20px',
                      color: entry.is_you ? 'white' : 'var(--primary)',
                      marginBottom: '3px', fontWeight: '700'
                    }}>
                      {entry.name} {entry.is_you && (
                        <span style={{ fontSize: '13px', opacity: 0.85, fontFamily: 'var(--font-body)' }}>
                          (you)
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '13px', fontWeight: '600',
                      color: entry.is_you ? 'rgba(255,255,255,0.8)' : 'var(--text-primary)',
                      opacity: entry.is_you ? 1 : 0.75
                    }}>
                      {entry.active_days} days active · {Math.round(entry.total_mins)}m studied
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-pixel)', fontSize: '28px', fontWeight: '700',
                      color: entry.is_you ? 'white' : 'var(--primary)',
                      lineHeight: 1
                    }}>
                      {Math.round(entry.aura_score)}
                    </div>
                    <div style={{
                      fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginTop: '3px',
                      color: entry.is_you ? 'rgba(255,255,255,0.7)' : 'var(--text-primary)',
                      opacity: entry.is_you ? 1 : 0.6
                    }}>
                      AURA
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