import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:5000'

const themes = [
  { id: 'berry_dreams', name: 'berry dreams', colors: ['#FEF0F4', '#F8B6BF', '#BF1E62', '#95D5D1'] },
  { id: 'pacific_coast', name: 'pacific coast', colors: ['#051C36', '#34617F', '#5F8FA5', '#E6D3AB'] },
  { id: 'majorelle', name: 'majorelle', colors: ['#E8EDDF', '#6060D2', '#FF7247', '#CFDBD5'] },
  { id: 'olive_garden', name: 'olive garden', colors: ['#CDE9FF', '#463500', '#C6A100', '#FFB8E5'] },
  { id: 'cerise_spark', name: 'cerise spark', colors: ['#F2F2F1', '#E30163', '#CDDC39', '#F04D8E'] },
]

export default function Settings() {
  const { token, user, logout, updateTheme } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', theme: 'berry_dreams',
    daily_goal_minutes: 60, device_name: '', anonymous_mode: false
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setForm(res.data)
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

      <div style={{ padding: '2rem 2.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)', fontSize: '36px',
            color: 'var(--primary)', marginBottom: '0.5rem'
          }}>settings</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            make strëak yours.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-pixel)', color: 'var(--primary)' }}>loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* profile */}
              <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1rem', opacity: 0.7 }}>PROFILE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>device name</label>
                    <input value={form.device_name} onChange={e => setForm(f => ({ ...f, device_name: e.target.value }))} placeholder="my strëak device" />
                  </div>
                </div>
              </div>

              {/* theme */}
              <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1rem', opacity: 0.7 }}>THEME</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {themes.map(theme => (
                    <motion.div
                      key={theme.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleTheme(theme.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                        border: form.theme === theme.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                        background: form.theme === theme.id ? 'rgba(191,30,98,0.05)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {theme.colors.map((c, i) => (
                          <div key={i} style={{ width: '18px', height: '30px', borderRadius: '4px', background: c }} />
                        ))}
                      </div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--primary)' }}>{theme.name}</div>
                      {form.theme === theme.id && (
                        <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* goal */}
              <div className="glass" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1rem', opacity: 0.7 }}>DAILY GOAL</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[30, 45, 60, 90, 120].map(g => (
                    <button key={g} onClick={() => setForm(f => ({ ...f, daily_goal_minutes: g }))}
                      style={{
                        padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        border: '2px solid var(--border)', fontSize: '15px',
                        fontFamily: 'var(--font-pixel)',
                        background: form.daily_goal_minutes === g ? 'var(--primary)' : 'transparent',
                        color: form.daily_goal_minutes === g ? 'white' : 'var(--primary)',
                        transition: 'all 0.2s'
                      }}>
                      {g >= 60 ? `${g / 60}h` : `${g}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* anonymous */}
              <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--primary)', marginBottom: '4px' }}>anonymous mode</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>hide your name on the leaderboard</div>
                </div>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setForm(f => ({ ...f, anonymous_mode: !f.anonymous_mode }))}
                  style={{
                    width: '52px', height: '28px', borderRadius: '14px',
                    background: form.anonymous_mode ? 'var(--primary)' : 'var(--border)',
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                  }}
                >
                  <motion.div
                    animate={{ x: form.anonymous_mode ? 26 : 2 }}
                    style={{
                      position: 'absolute', top: '2px',
                      width: '24px', height: '24px',
                      borderRadius: '50%', background: 'white'
                    }}
                  />
                </motion.div>
              </div>

              {/* save */}
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={save}
                style={{ width: '100%', padding: '16px', fontSize: '17px' }}>
                {saved ? 'saved ✓' : 'save changes'}
              </motion.button>

              {/* logout */}
              <button
                onClick={logout}
                style={{
                  width: '100%', padding: '14px', fontSize: '15px',
                  background: 'none', border: '2px solid var(--border)',
                  borderRadius: '16px', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-body)'
                }}>
                log out
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}