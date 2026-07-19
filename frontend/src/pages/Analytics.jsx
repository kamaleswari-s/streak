import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import Navbar from '../components/layout/Navbar'

const API = 'http://localhost:5000'

function BehavioralInsights({ data }) {
  if (!data?.stats?.total_sessions || data.stats.total_sessions < 3) return null

  const insights = []

  if (data.by_hour?.length > 0) {
    const bestHour = data.by_hour[0]
    const hour = parseInt(bestHour.hour)
    const timeStr = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`
    insights.push({
      icon: '⏰',
      title: 'peak study time',
      text: `you study best around ${timeStr}. your sessions starting at this hour are consistently your longest and most focused.`
    })
  }

  if (data.by_day?.length > 0) {
    const bestDay = data.by_day[0].day?.trim()
    const worstDay = data.by_day[data.by_day.length - 1]?.day?.trim()
    insights.push({
      icon: '📅',
      title: 'most productive day',
      text: `${bestDay} is your strongest study day. you show up more consistently and for longer on ${bestDay} than any other day of the week.`
    })
    if (worstDay && worstDay !== bestDay) {
      insights.push({
        icon: '📉',
        title: 'weakest day',
        text: `${worstDay} is your lightest study day. consider protecting this day from distractions or scheduling shorter focused sessions to keep the streak alive.`
      })
    }
  }

  if (data.stats?.avg) {
    const avg = Math.round(data.stats.avg)
    const h = Math.floor(avg / 60)
    const m = avg % 60
    const avgStr = h > 0 ? `${h}h ${m}m` : `${m}m`
    insights.push({
      icon: '📊',
      title: 'average session length',
      text: avg >= 60
        ? `your average session is ${avgStr}. that is above 60 minutes — you are consistently hitting deep focus territory. keep it up.`
        : avg >= 45
          ? `your average session is ${avgStr}. solid. you are close to the 60-minute threshold where deep focus and real retention kick in.`
          : `your average session is ${avgStr}. try extending by just 10 minutes each time — small increases compound fast over a week.`
    })
  }

  if (data.stats?.total_mins) {
    const totalHours = Math.round(data.stats.total_mins / 60)
    const totalSessions = data.stats.total_sessions
    insights.push({
      icon: '🔥',
      title: 'total effort logged',
      text: `${totalHours} hours across ${totalSessions} sessions. that is not a number you can fake. strëak has the proof — and so do you.`
    })
  }

  if (data.stats?.best) {
    const best = Math.round(data.stats.best)
    const bh = Math.floor(best / 60)
    const bm = best % 60
    const bestStr = bh > 0 ? `${bh}h ${bm}m` : `${bm}m`
    insights.push({
      icon: '🏆',
      title: 'personal best session',
      text: `your longest session ever was ${bestStr}. that is your benchmark. every session is a chance to get closer to it again.`
    })
  }

  if (data.monthly_trend?.length >= 5) {
    const recent = data.monthly_trend.slice(-3)
    const older = data.monthly_trend.slice(-6, -3)
    const recentAvg = recent.reduce((a, b) => a + (b.total || 0), 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + (b.total || 0), 0) / older.length
    if (recentAvg > olderAvg * 1.1) {
      insights.push({
        icon: '📈',
        title: 'momentum trending up',
        text: `your recent sessions are longer than your earlier ones. your consistency is compounding. this is exactly how habits form — keep going.`
      })
    } else if (recentAvg < olderAvg * 0.7) {
      insights.push({
        icon: '⚠️',
        title: 'momentum dipping',
        text: `your recent sessions are shorter than usual. this is normal — life happens. even showing up for 20 minutes today resets the pattern and protects your streak.`
      })
    } else {
      insights.push({
        icon: '➡️',
        title: 'momentum steady',
        text: `your session lengths have been consistent recently. consistency is the foundation — now try pushing duration by 10 minutes to build upward momentum.`
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass"
      style={{ padding: '2rem', marginBottom: '2rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-pixel)', fontSize: '22px',
          color: 'var(--primary)'
        }}>
          behavioral intelligence
        </div>
        <div style={{
          fontSize: '10px', fontWeight: '700', letterSpacing: '2px',
          background: 'var(--primary)', color: 'white',
          padding: '3px 10px', borderRadius: '20px'
        }}>NOVEL</div>
      </div>

      <p style={{
        fontSize: '14px', color: 'var(--text-secondary)',
        marginBottom: '1.5rem', opacity: 0.7, lineHeight: 1.6
      }}>
        strëak has been watching your patterns. here is what it found.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px'
      }}>
        {insights.map((insight, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            style={{
              padding: '1.25rem',
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '14px',
              display: 'flex', gap: '14px', alignItems: 'flex-start'
            }}>
            <div style={{
              fontSize: '28px', flexShrink: 0,
              width: '44px', height: '44px',
              background: 'var(--surface-2)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{insight.icon}</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-pixel)', fontSize: '14px',
                color: 'var(--primary)', marginBottom: '6px'
              }}>{insight.title}</div>
              <div style={{
                fontSize: '13px', color: 'var(--text-secondary)',
                lineHeight: 1.7
              }}>{insight.text}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Analytics() {
  const { token, logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAnalytics() }, [])

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
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', fontFamily: 'var(--font-body)', fontSize: '13px'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)', fontSize: '36px',
            color: 'var(--primary)', marginBottom: '0.5rem'
          }}>analytics</h1>
          <p style={{
            fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '2rem'
          }}>your real study patterns, no fluff.</p>

          {loading ? (
            <div style={{
              textAlign: 'center', padding: '4rem',
              fontFamily: 'var(--font-pixel)', color: 'var(--primary)'
            }}>loading...</div>

          ) : !data?.stats?.total_sessions ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📊</div>
              <div style={{
                fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--primary)'
              }}>not enough data yet</div>
              <div style={{
                fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px'
              }}>complete at least 3 sessions to unlock behavioral intelligence</div>
            </div>

          ) : (
            <>
              {/* BEHAVIORAL INTELLIGENCE — shown first, most important */}
              <BehavioralInsights data={data} />

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
                    <div style={{
                      fontSize: '11px', fontWeight: '600',
                      color: 'var(--text-secondary)', letterSpacing: '2px',
                      marginBottom: '8px', opacity: 0.6
                    }}>{s.label}</div>
                    <div style={{
                      fontFamily: 'var(--font-pixel)', fontSize: '32px',
                      color: 'var(--primary)'
                    }}>{s.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* 30 day trend */}
              <motion.div className="glass"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{
                  fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)',
                  letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7
                }}>30-DAY MOMENTUM TREND</div>
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

              {/* best hours + best days */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <motion.div className="glass"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1.5rem' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)',
                    letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7
                  }}>BEST STUDY HOURS</div>
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
                          <Cell key={i}
                            fill={i === 0 ? 'var(--primary)' : 'var(--primary-light)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div className="glass"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1.5rem' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)',
                    letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7
                  }}>MOST PRODUCTIVE DAYS</div>
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
                          <Cell key={i}
                            fill={i === 0 ? 'var(--primary)' : 'var(--primary-light)'} />
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