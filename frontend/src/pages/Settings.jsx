import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/layout/Navbar'
import API from '../config'

const lightThemes = [
  { id: 'berry_dreams', name: 'Berry Dreams' },
  { id: 'majorelle', name: 'Majorelle' },
  { id: 'olive_garden', name: 'Olive Garden' },
  { id: 'matcha_latte', name: 'Matcha Latte' },
  { id: 'desert_sun', name: 'Desert Sun' },
  { id: 'mint_chip', name: 'Mint Chip' },
  { id: 'lavender_haze', name: 'Lavender Haze' },
  { id: 'cloud_nine', name: 'Cloud Nine' },
  { id: 'ocean_breeze', name: 'Ocean Breeze' },
]

const darkThemes = [
  { id: 'midnight_garden', name: 'Midnight Garden' },
  { id: 'forest', name: 'Forest' },
  { id: 'mocha', name: 'Mocha' },
  { id: 'neon_noir', name: 'Neon Noir' },
  { id: 'cyber_gold', name: 'Cyber Gold' },
  { id: 'blood_orange', name: 'Blood Orange' },
  { id: 'arctic', name: 'Arctic' },
  { id: 'obsidian', name: 'Obsidian' },
  { id: 'galaxy', name: 'Galaxy' },
]

// picks black or white text so it stays readable on whatever colour a theme uses
function readableTextOn(cssColor) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.fillStyle = cssColor
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    const lin = (v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    return luminance > 0.179 ? '#111111' : '#ffffff'
  } catch {
    return '#ffffff'
  }
}

function formatMins(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function Toggle({ on, onClick }) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} onClick={onClick}
      style={{
        width: '52px', height: '28px', borderRadius: '14px',
        background: on ? 'var(--primary)' : 'var(--border)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}>
      <motion.div animate={{ x: on ? 26 : 2 }}
        style={{
          position: 'absolute', top: '2px', width: '24px', height: '24px',
          borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.35)'
        }} />
    </motion.div>
  )
}

export default function Settings() {
  const { token, logout, updateTheme } = useAuth()
  const [form, setForm] = useState({
    name: '', theme: 'berry_dreams',
    daily_goal_minutes: 60, device_name: '', anonymous_mode: false,
    sessions_goal: 3, active_days_goal: 5, focus_goal_minutes: 45,
    eye_rest_enabled: true, eye_rest_minutes: 20, why_line: ''
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [themeMode, setThemeMode] = useState('light')
  const [themeOpen, setThemeOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')
  const [activeSection, setActiveSection] = useState('profile')
  const [onPrimary, setOnPrimary] = useState('#ffffff')
  const [showDelete, setShowDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMsg, setDeleteMsg] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchSettings() }, [])

  // work out readable text for the current theme's main colour
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let primary = ''
      for (const el of [document.documentElement, document.body]) {
        primary = getComputedStyle(el).getPropertyValue('--primary').trim()
        if (primary) break
      }
      if (primary) setOnPrimary(readableTextOn(primary))
    })
    return () => cancelAnimationFrame(frame)
  }, [form.theme, loading])

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = res.data
      setForm({
        ...d,
        daily_goal_minutes: d.daily_goal_minutes ?? 60,
        sessions_goal: d.sessions_goal ?? 3,
        active_days_goal: d.active_days_goal ?? 5,
        focus_goal_minutes: d.focus_goal_minutes ?? 45,
        eye_rest_enabled: d.eye_rest_enabled ?? true,
        eye_rest_minutes: d.eye_rest_minutes ?? 20,
        why_line: d.why_line || '',
      })
      const isDark = darkThemes.some(t => t.id === d.theme)
      setThemeMode(isDark ? 'dark' : 'light')
    } catch (err) {
      if (err.response?.status === 401) logout()
    }
    setLoading(false)
  }

  const save = async () => {
    try {
      await axios.put(`${API}/settings`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateTheme(form.theme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) { console.error(err) }
  }

  // permanently deletes the account. needs the password as a safety check.
  const deleteAccount = async () => {
    if (!deletePassword) {
      setDeleteMsg('enter your password to confirm')
      return
    }
    setDeleting(true)
    setDeleteMsg('')
    try {
      await axios.post(`${API}/account/delete`, { password: deletePassword }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      logout()
    } catch (err) {
      setDeleteMsg(err.response?.data?.error || 'something went wrong, nothing was deleted')
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDelete(false)
    setDeletePassword('')
    setDeleteMsg('')
  }

  const handleTheme = (themeId) => {
    setForm(f => ({ ...f, theme: themeId }))
    document.documentElement.setAttribute('data-theme', themeId)
    setThemeOpen(false)
  }

  const currentThemeList = themeMode === 'light' ? lightThemes : darkThemes
  const currentThemeName = [...lightThemes, ...darkThemes].find(t => t.id === form.theme)?.name || 'Berry Dreams'

  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'device', label: 'Device', icon: '📡' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ]

  // option buttons that stay readable on every theme
  const chipStyle = (selected) => ({
    padding: '12px 8px', borderRadius: '12px', cursor: 'pointer',
    border: '2px solid var(--border)', fontSize: '16px',
    fontFamily: 'var(--font-pixel)',
    background: selected ? 'var(--primary)' : 'var(--surface)',
    color: selected ? onPrimary : 'var(--text-primary)',
    transition: 'all 0.2s', textAlign: 'center'
  })
  const chipGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))', gap: '10px' }
  const blockLabel = { display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }
  const blockHelp = { fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }
  const divider = { height: '1px', background: 'var(--border)', opacity: 0.6, margin: '1.5rem 0' }
  const soonTag = {
    display: 'inline-block', marginLeft: '8px', padding: '2px 8px', borderRadius: '10px',
    border: '1.5px solid var(--border)', fontSize: '10px', fontWeight: '700',
    color: 'var(--text-secondary)', letterSpacing: '1px', verticalAlign: 'middle'
  }
  const dangerButton = {
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
    border: 'none', background: '#C81E1E', color: '#ffffff',
    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '700'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ padding: '2rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)', fontSize: '36px',
            color: 'var(--primary)', marginBottom: '0.5rem'
          }}>settings</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            your strëak, your rules.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-pixel)', color: 'var(--primary)' }}>loading...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>

              {/* sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sections.map(s => (
                  <motion.button
                    key={s.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveSection(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '12px', cursor: 'pointer',
                      border: 'none', textAlign: 'left',
                      background: activeSection === s.id ? 'var(--primary)' : 'transparent',
                      color: activeSection === s.id ? onPrimary : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600',
                      transition: 'all 0.2s'
                    }}>
                    <span>{s.icon}</span>
                    {s.label}
                  </motion.button>
                ))}

                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={logout}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '12px',
                      border: '1.5px solid var(--border)', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)', fontSize: '14px'
                    }}>
                    log out
                  </motion.button>
                </div>
              </div>

              {/* content */}
              <div>
                <AnimatePresence mode="wait">

                  {/* PROFILE */}
                  {activeSection === 'profile' && (
                    <motion.div key="profile"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass" style={{ padding: '2rem' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '1.5rem' }}>profile</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>display name</label>
                          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="your name" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>email</label>
                          <input value={form.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>email cannot be changed</div>
                        </div>
                        <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
                          style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: '15px' }}>
                          {saved ? 'saved ✓' : 'save changes'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* APPEARANCE */}
                  {activeSection === 'appearance' && (
                    <motion.div key="appearance"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass" style={{ padding: '2rem' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '1.5rem' }}>appearance</div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>theme mode</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['light', 'dark'].map(mode => (
                            <button key={mode} onClick={() => setThemeMode(mode)}
                              style={{
                                padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
                                border: '2px solid var(--border)', fontSize: '14px',
                                background: themeMode === mode ? 'var(--primary)' : 'transparent',
                                color: themeMode === mode ? onPrimary : 'var(--text-secondary)',
                                fontFamily: 'var(--font-body)', fontWeight: '600',
                                transition: 'all 0.2s'
                              }}>
                              {mode === 'light' ? '☀️ light' : '🌙 dark'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>theme</label>
                        <div style={{ position: 'relative' }}>
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setThemeOpen(!themeOpen)}
                            style={{
                              width: '100%', padding: '12px 16px', borderRadius: '12px',
                              border: '2px solid var(--border)', cursor: 'pointer',
                              background: 'var(--surface)', color: 'var(--text-primary)',
                              fontFamily: 'var(--font-pixel)', fontSize: '16px',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                            {currentThemeName}
                            <span style={{ fontSize: '12px', opacity: 0.6 }}>{themeOpen ? '▲' : '▼'}</span>
                          </motion.button>

                          <AnimatePresence>
                            {themeOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                style={{
                                  position: 'absolute', top: '110%', left: 0, right: 0,
                                  background: 'var(--surface)', border: '2px solid var(--border)',
                                  borderRadius: '12px', overflow: 'hidden', zIndex: 50,
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                                }}>
                                {currentThemeList.map(theme => (
                                  <motion.button
                                    key={theme.id}
                                    whileHover={{ background: 'var(--surface-2)' }}
                                    onClick={() => handleTheme(theme.id)}
                                    style={{
                                      width: '100%', padding: '12px 16px', border: 'none',
                                      cursor: 'pointer', background: form.theme === theme.id ? 'var(--primary)' : 'transparent',
                                      color: form.theme === theme.id ? onPrimary : 'var(--text-primary)',
                                      fontFamily: 'var(--font-pixel)', fontSize: '15px',
                                      textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                                      alignItems: 'center', transition: 'all 0.15s'
                                    }}>
                                    {theme.name}
                                    {form.theme === theme.id && <span>✓</span>}
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
                        style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: '15px' }}>
                        {saved ? 'saved ✓' : 'save theme'}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* GOALS */}
                  {activeSection === 'goals' && (
                    <motion.div key="goals"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass" style={{ padding: '2rem' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '0.5rem' }}>goals</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        set targets that fit how you actually study. strëak tracks your progress against them.
                      </p>

                      <div style={{
                        padding: '10px 14px', borderRadius: '12px', marginBottom: '1.5rem',
                        border: '1.5px solid var(--border)', background: 'var(--surface-2)',
                        fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.6
                      }}>
                        your day: {formatMins(form.daily_goal_minutes)} of study · {form.sessions_goal} {form.sessions_goal === 1 ? 'session' : 'sessions'} · longest {form.focus_goal_minutes}m · {form.active_days_goal} days a week
                      </div>

                      {/* daily goal */}
                      <label style={blockLabel}>daily study goal</label>
                      <div style={blockHelp}>how much focused time you want each day. pick a preset or slide to any value.</div>
                      <div style={{ ...chipGrid, marginBottom: '14px' }}>
                        {[30, 45, 60, 90, 120].map(g => (
                          <motion.button key={g}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setForm(f => ({ ...f, daily_goal_minutes: g }))}
                            style={{ ...chipStyle(form.daily_goal_minutes === g), padding: '14px 8px' }}>
                            <div>{g >= 60 ? `${g / 60}h` : `${g}m`}</div>
                            <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '4px', fontFamily: 'var(--font-body)' }}>
                              {g === 30 && 'starter'}
                              {g === 45 && 'building'}
                              {g === 60 && 'solid'}
                              {g === 90 && 'grinder'}
                              {g === 120 && 'aura max'}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      <input type="range" min="15" max="240" step="5"
                        value={form.daily_goal_minutes}
                        onChange={e => setForm(f => ({ ...f, daily_goal_minutes: Number(e.target.value) }))}
                        style={{ width: '100%', padding: 0, border: 'none', background: 'transparent', accentColor: 'var(--primary)' }} />
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '4px', textAlign: 'center' }}>
                        {formatMins(form.daily_goal_minutes)} a day
                      </div>

                      <div style={divider} />

                      {/* sessions per day */}
                      <label style={blockLabel}>sessions per day</label>
                      <div style={blockHelp}>how many separate sittings you want. several shorter sessions beat one marathon you dread.</div>
                      <div style={chipGrid}>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <motion.button key={n} whileTap={{ scale: 0.96 }}
                            onClick={() => setForm(f => ({ ...f, sessions_goal: n }))}
                            style={chipStyle(form.sessions_goal === n)}>
                            {n}
                          </motion.button>
                        ))}
                      </div>

                      <div style={divider} />

                      {/* longest focus */}
                      <label style={blockLabel}>longest focus target</label>
                      <div style={blockHelp}>the length of one unbroken session you are working up to.</div>
                      <div style={chipGrid}>
                        {[25, 45, 60, 90].map(n => (
                          <motion.button key={n} whileTap={{ scale: 0.96 }}
                            onClick={() => setForm(f => ({ ...f, focus_goal_minutes: n }))}
                            style={chipStyle(form.focus_goal_minutes === n)}>
                            <div>{n}m</div>
                            <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '4px', fontFamily: 'var(--font-body)' }}>
                              {n === 25 && 'pomodoro'}
                              {n === 45 && 'deep'}
                              {n === 60 && 'flow'}
                              {n === 90 && 'marathon'}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      <div style={divider} />

                      {/* active days */}
                      <label style={blockLabel}>active days per week</label>
                      <div style={blockHelp}>how many days you aim to show up. five of seven is a kind, realistic target.</div>
                      <div style={chipGrid}>
                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                          <motion.button key={n} whileTap={{ scale: 0.96 }}
                            onClick={() => setForm(f => ({ ...f, active_days_goal: n }))}
                            style={chipStyle(form.active_days_goal === n)}>
                            {n}
                          </motion.button>
                        ))}
                      </div>

                      <div style={divider} />

                      {/* eye rest */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <div>
                          <label style={blockLabel}>eye rest reminder</label>
                          <div style={{ ...blockHelp, marginBottom: 0 }}>a short look-away break (20 seconds at something far away) while you study.</div>
                        </div>
                        <Toggle on={form.eye_rest_enabled}
                          onClick={() => setForm(f => ({ ...f, eye_rest_enabled: !f.eye_rest_enabled }))} />
                      </div>
                      {form.eye_rest_enabled && (
                        <>
                          <div style={{ ...chipGrid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            {[20, 30, 45].map(n => (
                              <motion.button key={n} whileTap={{ scale: 0.96 }}
                                onClick={() => setForm(f => ({ ...f, eye_rest_minutes: n }))}
                                style={chipStyle(form.eye_rest_minutes === n)}>
                                <div>every {n}m</div>
                                {n === 20 && (
                                  <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '4px', fontFamily: 'var(--font-body)' }}>
                                    standard
                                  </div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </>
                      )}

                      <div style={divider} />

                      {/* why line */}
                      <label style={blockLabel}>your why</label>
                      <div style={blockHelp}>one sentence about why you are doing this. strëak shows it on your dashboard when motivation dips.</div>
                      <input value={form.why_line} maxLength={140}
                        onChange={e => setForm(f => ({ ...f, why_line: e.target.value }))}
                        placeholder="e.g. i want that rank so i can choose my own path" />
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'right' }}>
                        {form.why_line.length}/140
                      </div>

                      <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
                        style={{ marginTop: '1.5rem', padding: '12px 28px', fontSize: '15px' }}>
                        {saved ? 'saved ✓' : 'save goals'}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* PRIVACY */}
                  {activeSection === 'privacy' && (
                    <motion.div key="privacy"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass" style={{ padding: '2rem' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '0.5rem' }}>privacy</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>control how you appear to others on strëak.</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="glass" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '17px', color: 'var(--primary)', marginBottom: '4px' }}>anonymous mode</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>your name appears as "Anonymous" on the leaderboard</div>
                          </div>
                          <Toggle on={form.anonymous_mode}
                            onClick={() => setForm(f => ({ ...f, anonymous_mode: !f.anonymous_mode }))} />
                        </div>

                        <div className="glass" style={{ padding: '1.25rem' }}>
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '17px', color: 'var(--primary)', marginBottom: '4px' }}>
                            session history visibility<span style={soonTag}>SOON</span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>control who sees your sessions</div>
                        </div>
                      </div>

                      <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
                        style={{ marginTop: '1.5rem', padding: '12px 28px', fontSize: '15px' }}>
                        {saved ? 'saved ✓' : 'save privacy settings'}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* DEVICE */}
                  {activeSection === 'device' && (
                    <motion.div key="device"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass" style={{ padding: '2rem' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '0.5rem' }}>device</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>manage your physical STRËAK device settings.</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>device nickname</label>
                          <input value={form.device_name} onChange={e => setForm(f => ({ ...f, device_name: e.target.value }))} placeholder="my strëak device" />
                        </div>

                        <div className="glass" style={{ padding: '1.25rem' }}>
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '15px', color: 'var(--primary)', marginBottom: '8px' }}>how your device connects</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            your STRËAK device sends its readings over WiFi. when it is connected, the "device live" badge on the dashboard turns green and the device state card shows what your desk is doing. if the badge says offline, check the device's WiFi. sessions started from the dashboard buttons work either way.
                          </div>
                        </div>

                        <div className="glass" style={{ padding: '1.25rem' }}>
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '15px', color: 'var(--primary)', marginBottom: '8px' }}>
                            device token<span style={soonTag}>SOON</span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>a personal key for linking more than one device</div>
                        </div>
                      </div>

                      <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
                        style={{ marginTop: '1.5rem', padding: '12px 28px', fontSize: '15px' }}>
                        {saved ? 'saved ✓' : 'save device settings'}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* ACCOUNT */}
                  {activeSection === 'account' && (
                    <motion.div key="account"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                      <div className="glass" style={{ padding: '2rem' }}>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '0.5rem' }}>account</div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>manage your account security.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>current password</label>
                            <input type="password" value={passwordForm.current}
                              onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                              placeholder="enter current password" />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>new password</label>
                            <input type="password" value={passwordForm.new}
                              onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                              placeholder="at least 6 characters" />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>confirm new password</label>
                            <input type="password" value={passwordForm.confirm}
                              onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                              placeholder="repeat new password" />
                          </div>
                          {passwordMsg && (
                            <div style={{ fontSize: '13px', color: 'var(--text-primary)', padding: '8px 12px', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: '8px' }}>
                              {passwordMsg}
                            </div>
                          )}
                          <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (passwordForm.new !== passwordForm.confirm) { setPasswordMsg('passwords do not match'); return }
                              if (passwordForm.new.length < 6) { setPasswordMsg('password too short'); return }
                              setPasswordMsg('password change coming soon')
                            }}
                            style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: '15px' }}>
                            update password
                          </motion.button>
                        </div>
                      </div>

                      <div className="glass" style={{ padding: '2rem', border: '1.5px solid rgba(200,30,30,0.45)' }}>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>danger zone</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                          deleting your account is permanent. all your sessions, streaks, eye rest records and aura scores will be erased and cannot be recovered. to just sign out, use the log out button instead.
                        </p>

                        {!showDelete ? (
                          <button onClick={() => setShowDelete(true)} style={dangerButton}>
                            delete account
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                              type your password to confirm
                            </div>
                            <input type="password" value={deletePassword} autoComplete="off"
                              onChange={e => setDeletePassword(e.target.value)}
                              placeholder="your password" />
                            {deleteMsg && (
                              <div style={{ fontSize: '13px', color: 'var(--text-primary)', padding: '8px 12px', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: '8px' }}>
                                {deleteMsg}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button onClick={deleteAccount} disabled={deleting}
                                style={{ ...dangerButton, opacity: deleting ? 0.6 : 1 }}>
                                {deleting ? 'deleting...' : 'delete forever'}
                              </button>
                              <button onClick={cancelDelete} disabled={deleting}
                                style={{
                                  padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                                  border: '1.5px solid var(--border)', background: 'transparent',
                                  color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                                  fontSize: '14px', fontWeight: '600'
                                }}>
                                cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}