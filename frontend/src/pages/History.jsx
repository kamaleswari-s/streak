import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/layout/Navbar'
import API from '../config'

export default function History() {
  const { token, logout } = useAuth()
  const [sessions, setSessions] = useState([])
  const [eyeRests, setEyeRests] = useState({})
  const [minReal, setMinReal] = useState(2)
  const [breakMax, setBreakMax] = useState(180)
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
      setEyeRests(res.data.eye_rests || {})
      setMinReal(res.data.min_real_minutes != null ? res.data.min_real_minutes : 2)
      setBreakMax(res.data.break_max_minutes != null ? res.data.break_max_minutes : 180)
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
  try {
    // format is "2026-07-24T18:28:00" — pure IST no timezone label
    const timePart = ts.includes('T') ? ts.split('T')[1] : ts.split(' ')[1]
    if (!timePart) return '--'
    const [hourStr, minStr] = timePart.split(':')
    const hour = parseInt(hourStr)
    if (isNaN(hour)) return '--'
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 === 0 ? 12 : hour % 12
    return `${String(displayHour).padStart(2, '0')}:${String(minStr).padStart(2, '0')} ${ampm}`
  } catch {
    return '--'
  }
}

  const formatDate = (dateStr) => {
    if (!dateStr) return '--'
    const [y, m, d] = dateStr.split('-')
    const date = new Date(+y, +m - 1, +d)
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const toMs = (ts) => {
    if (!ts) return null
    const t = new Date(ts).getTime()
    return isNaN(t) ? null : t
  }

  const isReal = (s) => (s.duration_minutes || 0) >= minReal

  // ── group sessions by day and work out breaks ──
  const dayGroups = []
  sessions.forEach(s => {
    const last = dayGroups[dayGroups.length - 1]
    if (last && last.date === s.date) last.items.push(s)
    else dayGroups.push({ date: s.date, items: [s] })
  })

  const breakBefore = {}   // id of the later session -> the break that came right before it
  const reasonBreakStats = {}   // reason -> total minutes and count of real breaks

  dayGroups.forEach(g => {
    const real = g.items.filter(isReal).slice().reverse()   // oldest first
    g.sessionCount = real.length
    g.study = real.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    g.longest = real.reduce((m, s) => Math.max(m, s.duration_minutes || 0), 0)
    g.breaks = []
    for (let i = 1; i < real.length; i++) {
      const prev = real[i - 1]
      const cur = real[i]
      const a = toMs(prev.end_time)
      const b = toMs(cur.start_time)
      if (a === null || b === null) continue
      const gap = (b - a) / 60000
      if (gap > 0 && gap < breakMax) {
        const reason = prev.stand_up_reason || 'Not specified'
        const info = { minutes: gap, reason }
        g.breaks.push(info)
        breakBefore[cur.id] = info
        if (!reasonBreakStats[reason]) reasonBreakStats[reason] = { total: 0, n: 0 }
        reasonBreakStats[reason].total += gap
        reasonBreakStats[reason].n += 1
      }
    }
    g.breakMin = g.breaks.reduce((sum, b) => sum + b.minutes, 0)
    const e = eyeRests[g.date] || { done: 0, skipped: 0 }
    g.eyeDone = e.done
    g.eyeSkipped = e.skipped
  })

  const totalSessions = dayGroups.reduce((sum, g) => sum + g.sessionCount, 0)
  const totalStudy = dayGroups.reduce((sum, g) => sum + g.study, 0)
  const totalBreaks = dayGroups.reduce((sum, g) => sum + g.breaks.length, 0)
  const totalBreakMin = dayGroups.reduce((sum, g) => sum + g.breakMin, 0)
  const avgBreak = totalBreaks > 0 ? totalBreakMin / totalBreaks : 0
  const totalEyeDone = dayGroups.reduce((sum, g) => sum + g.eyeDone, 0)
  const totalEyeAll = dayGroups.reduce((sum, g) => sum + g.eyeDone + g.eyeSkipped, 0)

  // ── why you stood up (counts of the reason on each real session) ──
  const reasonCounts = {}
  sessions.filter(isReal).forEach(s => {
    const r = (s.stand_up_reason || '').trim()
    if (!r) return
    reasonCounts[r] = (reasonCounts[r] || 0) + 1
  })
  const reasonList = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])
  const maxReasonCount = reasonList.length > 0 ? reasonList[0][1] : 1

  const SeatIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="28" width="32" height="4" rx="2" fill="var(--primary)" opacity="0.3"/>
      <rect x="10" y="32" width="4" height="10" rx="2" fill="var(--primary)" opacity="0.3"/>
      <rect x="34" y="32" width="4" height="10" rx="2" fill="var(--primary)" opacity="0.3"/>
      <rect x="14" y="18" width="20" height="12" rx="3" fill="var(--primary)" opacity="0.2"/>
      <circle cx="24" cy="14" r="5" fill="var(--primary)" opacity="0.2"/>
    </svg>
  )

  const tileStyle = { padding: '1.1rem', textAlign: 'center' }
  const tileNumber = { fontFamily: 'var(--font-pixel)', fontSize: '26px', color: 'var(--primary)', lineHeight: 1, fontWeight: '700' }
  const tileLabel = { fontSize: '11px', color: 'var(--text-primary)', opacity: 0.65, fontWeight: '700', letterSpacing: '1px', marginTop: '6px' }
  const chipStyle = {
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
    border: '1.5px solid var(--border)', background: 'var(--surface-2)',
    fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)', opacity: 0.9
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)', fontSize: '36px',
            color: 'var(--primary)', marginBottom: '0.5rem'
          }}>
            session history
          </h1>
          <p style={{
            fontSize: '16px', color: 'var(--text-primary)',
            marginBottom: '2rem', opacity: 0.85, fontWeight: '500'
          }}>
            every minute of effort, logged.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            {['all', 'week', 'month'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
                  border: '2px solid var(--border)', fontSize: '14px', fontWeight: '700',
                  background: filter === f ? 'var(--primary)' : 'var(--surface)',
                  color: filter === f ? 'white' : 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s'
                }}>
                {f === 'all' ? 'all time' : `this ${f}`}
              </button>
            ))}
          </div>

          {!loading && sessions.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
              <div className="glass" style={tileStyle}>
                <div style={tileNumber}>{totalSessions}</div>
                <div style={tileLabel}>SESSIONS</div>
              </div>
              <div className="glass" style={tileStyle}>
                <div style={tileNumber}>{formatDuration(totalStudy)}</div>
                <div style={tileLabel}>STUDIED</div>
              </div>
              <div className="glass" style={tileStyle}>
                <div style={tileNumber}>{totalBreaks}</div>
                <div style={tileLabel}>BREAKS</div>
              </div>
              <div className="glass" style={tileStyle}>
                <div style={tileNumber}>{totalBreaks > 0 ? formatDuration(avgBreak) : '--'}</div>
                <div style={tileLabel}>AVG BREAK</div>
              </div>
              <div className="glass" style={tileStyle}>
                <div style={tileNumber}>{totalEyeAll > 0 ? `${totalEyeDone}/${totalEyeAll}` : '--'}</div>
                <div style={tileLabel}>EYE RESTS</div>
              </div>
            </div>
          )}

          {!loading && reasonList.length > 0 && (
            <motion.div className="glass"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
              <div style={{
                fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)',
                letterSpacing: '2px', marginBottom: '14px', opacity: 0.7
              }}>
                WHY YOU STOOD UP
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reasonList.map(([reason, count]) => {
                  const rb = reasonBreakStats[reason]
                  return (
                    <div key={reason} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '190px', fontSize: '13px', fontWeight: '600',
                        color: 'var(--text-primary)', opacity: 0.85, flexShrink: 0
                      }}>
                        {reason}
                      </div>
                      <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((count / maxReasonCount) * 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                      </div>
                      <div style={{
                        width: '24px', textAlign: 'right', fontFamily: 'var(--font-pixel)',
                        fontSize: '16px', color: 'var(--primary)', fontWeight: '700'
                      }}>
                        {count}
                      </div>
                      <div style={{ width: '96px', fontSize: '11px', color: 'var(--text-primary)', opacity: 0.6 }}>
                        {rb ? `avg break ${formatDuration(rb.total / rb.n)}` : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {loading ? (
            <div style={{
              textAlign: 'center', padding: '4rem',
              fontFamily: 'var(--font-pixel)', color: 'var(--primary)'
            }}>
              loading...
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <SeatIcon />
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)', fontSize: '20px',
                color: 'var(--primary)', marginBottom: '8px'
              }}>
                no sessions yet
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', opacity: 0.75, fontWeight: '500' }}>
                start a session from the dashboard
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {dayGroups.map(g => (
                <div key={g.date}>
                  <div style={{ marginBottom: '12px', padding: '0 4px' }}>
                    <div style={{
                      fontFamily: 'var(--font-pixel)', fontSize: '20px',
                      color: 'var(--primary)', marginBottom: '8px', fontWeight: '700'
                    }}>
                      {formatDate(g.date)}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {g.sessionCount === 0 ? (
                        <span style={chipStyle}>only short test sessions</span>
                      ) : (
                        <>
                          <span style={chipStyle}>{g.sessionCount} {g.sessionCount === 1 ? 'session' : 'sessions'}</span>
                          <span style={chipStyle}>{formatDuration(g.study)} studied</span>
                          <span style={chipStyle}>longest {formatDuration(g.longest)}</span>
                          <span style={chipStyle}>
                            {g.breaks.length} {g.breaks.length === 1 ? 'break' : 'breaks'}
                            {g.breaks.length > 0 ? ` · ${formatDuration(g.breakMin)}` : ''}
                          </span>
                          {(g.eyeDone + g.eyeSkipped) > 0 && (
                            <span style={chipStyle}>eye rests {g.eyeDone}/{g.eyeDone + g.eyeSkipped}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {g.items.map((s, i) => (
                      <div key={s.id}>
                        <motion.div className="glass"
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: isReal(s) ? 1 : 0.5, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ y: -3 }}
                          style={{
                            padding: '1.25rem 1.5rem',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '12px'
                          }}>
                          <div>
                            <div style={{
                              fontSize: '15px', color: 'var(--text-primary)',
                              opacity: 0.85, fontWeight: '600'
                            }}>
                              {formatTime(s.start_time)} — {formatTime(s.end_time)}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {s.stand_up_reason && <span style={chipStyle}>{s.stand_up_reason}</span>}
                              {!isReal(s) && <span style={chipStyle}>too short to count</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                fontFamily: 'var(--font-pixel)', fontSize: '22px',
                                color: 'var(--primary)', fontWeight: '700', lineHeight: 1
                              }}>
                                {formatDuration(s.duration_minutes)}
                              </div>
                              <div style={{
                                fontSize: '11px', color: 'var(--text-primary)',
                                opacity: 0.65, fontWeight: '700',
                                letterSpacing: '1px', marginTop: '4px'
                              }}>
                                DURATION
                              </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                fontFamily: 'var(--font-pixel)', fontSize: '22px',
                                color: 'var(--primary)', fontWeight: '700', lineHeight: 1
                              }}>
                                {Math.round(s.momentum_score)}
                              </div>
                              <div style={{
                                fontSize: '11px', color: 'var(--text-primary)',
                                opacity: 0.65, fontWeight: '700',
                                letterSpacing: '1px', marginTop: '4px'
                              }}>
                                MOMENTUM
                              </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                fontFamily: 'var(--font-pixel)', fontSize: '22px',
                                color: 'var(--accent-dark)', fontWeight: '700', lineHeight: 1
                              }}>
                                {Math.round(s.aura_score)}
                              </div>
                              <div style={{
                                fontSize: '11px', color: 'var(--text-primary)',
                                opacity: 0.65, fontWeight: '700',
                                letterSpacing: '1px', marginTop: '4px'
                              }}>
                                AURA
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {breakBefore[s.id] && (
                          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 0' }}>
                            <span style={{ ...chipStyle, background: 'transparent', borderStyle: 'dashed' }}>
                              break · {formatDuration(breakBefore[s.id].minutes)} · {breakBefore[s.id].reason}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}