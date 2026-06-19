import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const API = 'http://localhost:5000'

export default function Analytics() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
    } catch (err) {
      if (err.response?.status === 401) logout()
    }
    setLoading(false)
  }

  const formatMins = (m) => {
    if (!m) return '0m'
    const h = Math.floor(m / 60)
    const min = Math.round(m % 60)
    return h === 0 ? `${min}m` : `${h}h ${min}m`
  }

  const tooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: 'var(--font-body)',
    fontSize: '13px'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 2.5rem', position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(254,240,244,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div onClick={() => navigate('/dashboard')} style={{
          fontFamily: 'var(--font-logo)', fontSize: '28px',
          color: 'var(--primary)', cursor: 'pointer'
        }}>strëak</div>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '15px', color: 'var(--primary)', fontFamily: 'var(--font-body)'
        }}>← back to dashboard</button>
      </nav>

      <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)', fontSize: '36px',
            color: 'var(--primary)', marginBottom: '0.5rem'
          }}>analytics</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            your real study patterns, no fluff.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-pixel)', color: 'var(--primary)' }}>loading...</div>
          ) : !data?.stats?.total_sessions ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📊</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--primary)' }}>
                not enough data yet
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                complete a few sessions to see your patterns
              </div>
            </div>
          ) : (
            <>
              {/* stat summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px', marginBottom: '2rem'
              }}>
                {[
                  { label: 'TOTAL SESSIONS', value: data.stats.total_sessions },
                  { label: 'TOTAL STUDIED', value: formatMins(data.stats.total_mins) },
                  { label: 'AVG SESSION', value: formatMins(data.stats.avg) },
                  { label: 'LONGEST SESSION', value: formatMins(data.stats.best) },
                ].map((s, i) => (
                  <motion.div key={i} className="glass"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '8px', opacity: 0.6 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '32px', color: 'var(--primary)' }}>{s.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* 30 day trend */}
              <motion.div className="glass"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>30-DAY MOMENTUM TREND</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.monthly_trend}>
                    <XAxis dataKey="date"
                      tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                      axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={v => [`${Math.round(v)} mins`, 'studied']} />
                    <Line type="monotone" dataKey="total"
                      stroke="var(--primary)" strokeWidth={2.5}
                      dot={{ fill: 'var(--primary)', r: 4 }}
                      activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* by hour */}
                <motion.div className="glass"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>BEST STUDY HOURS</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.by_hour.slice(0, 8)}>
                      <XAxis dataKey="hour"
                        tickFormatter={h => `${h}:00`}
                        tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                        axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={v => [v, 'sessions']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.by_hour.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={i === 0 ? 'var(--primary)' : 'var(--primary-light)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* by day */}
                <motion.div className="glass"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>MOST PRODUCTIVE DAYS</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.by_day}>
                      <XAxis dataKey="day"
                        tickFormatter={d => d?.trim().slice(0, 3)}
                        tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                        axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={v => [v, 'sessions']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.by_day.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? 'var(--primary)' : 'var(--primary-light)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}