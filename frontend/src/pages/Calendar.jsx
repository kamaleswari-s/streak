import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

const STORAGE_KEY = 'streak_calendar_events'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DURATIONS = ['30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours']
const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

export default function Calendar() {
  const navigate = useNavigate()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [form, setForm] = useState({ title: '', date: '', time: '', duration: '1 hour', notes: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showDayPanel, setShowDayPanel] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setEvents(JSON.parse(saved))
  }, [])

  const saveEvents = (updated) => {
    setEvents(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const openAddModal = (date) => {
    setEditEvent(null)
    setForm({ title: '', date, time: '', duration: '1 hour', notes: '' })
    setShowModal(true)
  }

  const openEditModal = (event) => {
    setEditEvent(event)
    setForm({ title: event.title, date: event.date, time: event.time || '', duration: event.duration || '1 hour', notes: event.notes || '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditEvent(null)
    setForm({ title: '', date: '', time: '', duration: '1 hour', notes: '' })
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    if (editEvent) {
      const updated = events.map(e => e.id === editEvent.id ? { ...e, ...form } : e)
      saveEvents(updated)
    } else {
      const newEvent = { id: generateId(), ...form, completed: false, createdAt: new Date().toISOString() }
      saveEvents([...events, newEvent])
    }
    closeModal()
  }

  const handleComplete = (eventId) => {
    if (window.confirm('mark this session as complete? it will be removed from upcoming.')) {
      const updated = events.map(e => e.id === eventId ? { ...e, completed: true } : e)
      saveEvents(updated)
    }
  }

  const handleDelete = (eventId) => {
    const updated = events.filter(e => e.id !== eventId)
    saveEvents(updated)
    setConfirmDelete(null)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const todayStr = today.toISOString().split('T')[0]

  const getDateStr = (day) => {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${viewYear}-${m}-${d}`
  }

  const getEventsForDate = (dateStr) =>
    events.filter(e => e.date === dateStr && !e.completed)

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const upcomingEvents = events
    .filter(e => e.date >= todayStr && !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const formatDateShort = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    const isToday = dateStr === todayStr
    const isTomorrow = dateStr === new Date(Date.now() + 86400000).toISOString().split('T')[0]
    if (isToday) return 'today'
    if (isTomorrow) return 'tomorrow'
    return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const inputStyle = {
    background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: '10px', padding: '10px 14px',
    fontFamily: 'var(--font-body)', fontSize: '14px',
    color: 'var(--text-primary)', width: '100%', outline: 'none',
  }

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: 'var(--text-primary)', marginBottom: '5px', opacity: 0.8
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '36px', color: 'var(--primary)', marginBottom: '0.4rem' }}>
            calendar
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2rem', opacity: 0.75 }}>
            plan your sessions. stay ahead of your streak.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

            {/* CALENDAR */}
            <div>
              <div className="glass" style={{ padding: '1.5rem' }}>

                {/* month nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={prevMonth}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--primary)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ←
                  </motion.button>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', fontWeight: '700' }}>
                    {MONTHS[viewMonth]} {viewYear}
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={nextMonth}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--primary)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    →
                  </motion.button>
                </div>

                {/* day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {DAYS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', opacity: 0.5, padding: '4px' }}>{d}</div>
                  ))}
                </div>

                {/* days grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1
                    const dateStr = getDateStr(day)
                    const dayEvents = getEventsForDate(dateStr)
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedDate
                    const isPast = dateStr < todayStr

                    return (
                      <motion.div key={day}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedDate(dateStr)
                          setShowDayPanel(true)
                        }}
                        style={{
                          aspectRatio: '1', borderRadius: '10px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                          background: isToday ? 'var(--primary)' : isSelected ? 'rgba(96,96,210,0.12)' : 'var(--surface)',
                          border: isSelected && !isToday ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                          opacity: isPast && !isToday ? 0.5 : 1,
                          transition: 'all 0.15s'
                        }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: isToday ? 'white' : 'var(--text-primary)', lineHeight: 1 }}>{day}</div>
                        {dayEvents.length > 0 && (
                          <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                            {dayEvents.slice(0, 3).map((_, ei) => (
                              <div key={ei} style={{ width: '5px', height: '5px', borderRadius: '50%', background: isToday ? 'white' : 'var(--accent)' }} />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* legend */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '1.25rem', fontSize: '12px', color: 'var(--text-primary)', opacity: 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--primary)' }} /> today
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} /> has session
                  </div>
                </div>
              </div>

              {/* day panel */}
              <AnimatePresence>
                {showDayPanel && selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="glass"
                    style={{ padding: '1.5rem', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--primary)' }}>
                        {formatDate(selectedDate)}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => openAddModal(selectedDate)}
                          className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: '13px' }}>
                          + add session
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }}
                          onClick={() => setShowDayPanel(false)}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '16px' }}>
                          ×
                        </motion.button>
                      </div>
                    </div>

                    {selectedDateEvents.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-primary)', opacity: 0.5, fontSize: '14px' }}>
                        no sessions planned for this day.
                        <br />
                        <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                          onClick={() => openAddModal(selectedDate)}>add one →</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedDateEvents.map(event => (
                          <motion.div key={event.id}
                            layout
                            style={{
                              padding: '12px 16px', borderRadius: '12px',
                              background: 'var(--surface)', border: '1.5px solid var(--border)',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                            }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--primary)', marginBottom: '3px' }}>{event.title}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-primary)', opacity: 0.7 }}>
                                {event.time && `${event.time} · `}{event.duration}
                                {event.notes && <span style={{ opacity: 0.6 }}> · {event.notes}</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <motion.button whileHover={{ scale: 1.05 }} onClick={() => openEditModal(event)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontWeight: '600' }}>
                                edit
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleComplete(event.id)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #639922', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#639922', fontFamily: 'var(--font-body)', fontWeight: '600' }}>
                                done
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setConfirmDelete(event.id)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #E24B4A', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#E24B4A', fontFamily: 'var(--font-body)', fontWeight: '600' }}>
                                delete
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT — upcoming */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--primary)', marginBottom: '1rem' }}>upcoming</div>

                {upcomingEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.55, marginBottom: '1rem', lineHeight: 1.6 }}>
                      no sessions planned yet. click any date to add one.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {upcomingEvents.map((event, i) => {
                      const isToday = event.date === todayStr
                      return (
                        <motion.div key={event.id}
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            padding: '12px 14px', borderRadius: '12px',
                            background: isToday ? 'rgba(96,96,210,0.08)' : 'var(--surface)',
                            border: isToday ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedDate(event.date)
                            setViewMonth(new Date(event.date).getMonth())
                            setViewYear(new Date(event.date).getFullYear())
                            setShowDayPanel(true)
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--primary)', marginBottom: '3px' }}>{event.title}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-primary)', opacity: 0.7 }}>
                                {formatDateShort(event.date)}{event.time ? ` · ${event.time}` : ''}
                              </div>
                              {event.duration && (
                                <div style={{ fontSize: '11px', color: 'var(--text-primary)', opacity: 0.5, marginTop: '2px' }}>{event.duration}</div>
                              )}
                            </div>
                            {isToday && (
                              <div style={{ fontSize: '10px', background: 'var(--primary)', color: 'white', padding: '3px 8px', borderRadius: '20px', fontWeight: '700', flexShrink: 0 }}>
                                today
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* quick add */}
              <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => openAddModal(todayStr)}
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                + plan a session today
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
            }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              style={{
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                {editEvent ? 'edit session' : 'plan a session'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>session name</label>
                  <input style={inputStyle} placeholder="e.g. OS exam preparation"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleSave()} />
                </div>

                <div>
                  <label style={labelStyle}>date</label>
                  <input style={inputStyle} type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>time (optional)</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }}
                      value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}>
                      <option value="">no specific time</option>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>duration</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }}
                      value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                      {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>notes (optional)</label>
                  <input style={inputStyle} placeholder="what are you studying?"
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave} disabled={!form.title.trim() || !form.date}
                  style={{ flex: 1, padding: '12px', fontSize: '15px', opacity: !form.title.trim() || !form.date ? 0.5 : 1 }}>
                  {editEvent ? 'save changes' : 'add session'}
                </motion.button>
                <motion.button className="btn-outline" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  style={{ flex: 1, padding: '12px', fontSize: '15px' }}>
                  cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1001,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: 'var(--surface)', border: '1.5px solid #E24B4A',
                borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '380px',
                textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: '#E24B4A', marginBottom: '0.75rem' }}>delete session?</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.75, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                this cannot be undone. the session will be removed from your calendar.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => handleDelete(confirmDelete)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#E24B4A', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: '700' }}>
                  delete
                </motion.button>
                <motion.button className="btn-outline" whileHover={{ scale: 1.02 }} onClick={() => setConfirmDelete(null)}
                  style={{ flex: 1, padding: '12px', fontSize: '15px' }}>
                  cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}