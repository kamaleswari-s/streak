import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/layout/Navbar'

const API = 'http://localhost:5000'

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

export default function Settings() {
  const { token, logout, updateTheme } = useAuth()
  const [form, setForm] = useState({
    name: '', theme: 'berry_dreams',
    daily_goal_minutes: 60, device_name: '', anonymous_mode: false
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [themeMode, setThemeMode] = useState('light')
  const [themeOpen, setThemeOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')
  const [activeSection, setActiveSection] = useState('profile')

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setForm(res.data)
      const isDark = darkThemes.some(t => t.id === res.data.theme)
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
                      color: activeSection === s.id ? 'var(--bg)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '500',
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
                          <input value={form.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.5, marginTop: '4px' }}>email cannot be changed</div>
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
                                color: themeMode === mode ? 'var(--bg)' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-body)', fontWeight: '500',
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
                            <span style={{ fontSize: '12px', opacity: 0.5 }}>{themeOpen ? '▲' : '▼'}</span>
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
                                      color: form.theme === theme.id ? 'var(--bg)' : 'var(--text-primary)',
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
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>set your daily study target. strëak tracks your progress against it.</p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                        {[30, 45, 60, 90, 120].map(g => (
                          <motion.button key={g}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setForm(f => ({ ...f, daily_goal_minutes: g }))}
                            style={{
                              padding: '16px 8px', borderRadius: '12px', cursor: 'pointer',
                              border: '2px solid var(--border)', fontSize: '16px',
                              fontFamily: 'var(--font-pixel)',
                              background: form.daily_goal_minutes === g ? 'var(--primary)' : 'var(--surface)',
                              color: form.daily_goal_minutes === g ? 'var(--bg)' : 'var(--primary)',
                              transition: 'all 0.2s', textAlign: 'center'
                            }}>
                            <div>{g >= 60 ? `${g / 60}h` : `${g}m`}</div>
                            <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', fontFamily: 'var(--font-body)' }}>
                              {g === 30 && 'starter'}
                              {g === 45 && 'building'}
                              {g === 60 && 'solid'}
                              {g === 90 && 'grinder'}
                              {g === 120 && 'aura max'}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
                        style={{ padding: '12px 28px', fontSize: '15px' }}>
                        {saved ? 'saved ✓' : 'save goal'}
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
                          <motion.div whileTap={{ scale: 0.95 }}
                            onClick={() => setForm(f => ({ ...f, anonymous_mode: !f.anonymous_mode }))}
                            style={{
                              width: '52px', height: '28px', borderRadius: '14px',
                              background: form.anonymous_mode ? 'var(--primary)' : 'var(--border)',
                              cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
                            }}>
                            <motion.div animate={{ x: form.anonymous_mode ? 26 : 2 }}
                              style={{ position: 'absolute', top: '2px', width: '24px', height: '24px', borderRadius: '50%', background: 'white' }} />
                          </motion.div>
                        </div>

                        <div className="glass" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '17px', color: 'var(--primary)', marginBottom: '4px' }}>session history visibility</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>coming soon — control who sees your sessions</div>
                          </div>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF9F27' }} />
                            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '15px', color: 'var(--primary)' }}>simulation mode active</div>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            your ESP32 device hasn't connected yet. all sessions are being tracked via the dashboard buttons. when your hardware arrives, it will auto-connect here.
                          </div>
                        </div>

                        <div className="glass" style={{ padding: '1.25rem', opacity: 0.5 }}>
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '15px', color: 'var(--primary)', marginBottom: '8px' }}>device token</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>available once hardware connects</div>
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
                            <div style={{ fontSize: '13px', color: 'var(--primary)', padding: '8px 12px', background: 'rgba(191,30,98,0.08)', borderRadius: '8px' }}>
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

                      <div className="glass" style={{ padding: '2rem', border: '1.5px solid rgba(255,60,60,0.2)' }}>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: '#E02020', marginBottom: '0.5rem' }}>danger zone</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                          deleting your account is permanent. all your sessions, streaks, and aura scores will be lost forever.
                        </p>
                        <button
                          onClick={() => { if (window.confirm('are you sure? this cannot be undone.')) logout() }}
                          style={{
                            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                            border: '2px solid #E02020', background: 'transparent',
                            color: '#E02020', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600'
                          }}>
                          delete account
                        </button>
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