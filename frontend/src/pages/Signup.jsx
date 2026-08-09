import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'https://streak-backend-823y.onrender.com'

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: 'var(--border)' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { score, label: 'weak', color: '#E24B4A' }
    if (score <= 2) return { score, label: 'fair', color: '#EF9F27' }
    if (score <= 3) return { score, label: 'good', color: '#4A90D9' }
    return { score, label: 'strong', color: '#639922' }
  }
  const { score, label, color } = getStrength()
  if (!password) return null
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i <= score ? color : 'var(--border)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      <div style={{ fontSize: '12px', color, fontWeight: '600' }}>{label}</div>
    </div>
  )
}

function BrandPanel() {
  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="14" width="18" height="3" rx="1.5" fill="#B44FFF"/>
          <rect x="4" y="17" width="3" height="5" rx="1.5" fill="#B44FFF"/>
          <rect x="17" y="17" width="3" height="5" rx="1.5" fill="#B44FFF"/>
          <rect x="7" y="9" width="10" height="6" rx="2" fill="#220F30" stroke="#B44FFF" strokeWidth="1"/>
          <circle cx="12" cy="7" r="3" fill="#FF2D78"/>
          <circle cx="12" cy="3" r="1.2" fill="#FF2D78" opacity="0.5"/>
          <circle cx="17" cy="4.5" r="1.2" fill="#FF2D78" opacity="0.5"/>
          <circle cx="7" cy="4.5" r="1.2" fill="#FF2D78" opacity="0.5"/>
        </svg>
      ),
      text: 'sits on your desk. detects you automatically.'
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#B44FFF" strokeWidth="1.5" fill="none"/>
          <circle cx="12" cy="12" r="9" stroke="#FF2D78" strokeWidth="1.5" fill="none"
            strokeDasharray="20 38" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3" fill="#B44FFF"/>
        </svg>
      ),
      text: 'LED changes colour as your momentum grows.'
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="7" y="2" width="7" height="14" rx="3.5" stroke="#B44FFF" strokeWidth="1.5" fill="none"/>
          <line x1="7" y1="9" x2="14" y2="9" stroke="#FF2D78" strokeWidth="1.5"/>
          <circle cx="17" cy="17" r="5" fill="#FF2D78" opacity="0.2" stroke="#FF2D78" strokeWidth="1.5"/>
          <line x1="17" y1="14" x2="17" y2="20" stroke="#FF2D78" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="14" y1="17" x2="20" y2="17" stroke="#FF2D78" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      text: 'detects phone on desk. keeps you honest.'
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polyline points="3,18 8,12 13,14 20,6" stroke="#B44FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="20" cy="6" r="2.5" fill="#FF2D78"/>
        </svg>
      ),
      text: 'your aura grows with every consistent day.'
    },
  ]

  return (
    <div style={{
      flex: 1, background: '#0A0A0F',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '3rem', position: 'relative', overflow: 'hidden',
      minHeight: '100vh'
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '30%',
        width: '400px', height: '400px', background: '#B44FFF',
        borderRadius: '50%', filter: 'blur(120px)',
        opacity: 0.12, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '20%',
        width: '300px', height: '300px', background: '#FF2D78',
        borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.08, pointerEvents: 'none'
      }} />

      {[...Array(10)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? '8px' : '5px',
            height: i % 3 === 0 ? '8px' : '5px',
            borderRadius: '50%',
            background: i % 2 === 0 ? '#B44FFF' : '#FF2D78',
            left: `${8 + i * 8}%`,
            top: `${10 + (i % 5) * 16}%`,
            pointerEvents: 'none'
          }} />
      ))}

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <motion.circle cx="50" cy="8" r="2.5" fill="#FF2D78"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.circle cx="73" cy="15" r="2.5" fill="#FF2D78"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
          <motion.circle cx="27" cy="15" r="2.5" fill="#FF2D78"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
          <motion.circle cx="82" cy="38" r="2.5" fill="#FF2D78"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
          <motion.circle cx="18" cy="38" r="2.5" fill="#FF2D78"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
          <rect x="20" y="62" width="60" height="7" rx="3.5" fill="#B44FFF" />
          <rect x="24" y="69" width="6" height="16" rx="3" fill="#B44FFF" />
          <rect x="70" y="69" width="6" height="16" rx="3" fill="#B44FFF" />
          <rect x="30" y="44" width="40" height="20" rx="5" fill="#220F30" />
          <rect x="34" y="48" width="32" height="12" rx="3" fill="white" opacity="0.15" />
          <motion.circle cx="50" cy="38" r="7" fill="#B44FFF"
            animate={{ r: [6, 9, 6], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity }} />
          <circle cx="50" cy="38" r="3" fill="white" />
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: 'var(--font-logo)', fontSize: '52px',
          color: '#B44FFF', marginBottom: '0.5rem',
          position: 'relative', zIndex: 1, lineHeight: 1
        }}>
        strëak
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: 'var(--font-pixel)', fontSize: '14px',
          color: '#C0A8E0', marginBottom: '3rem',
          position: 'relative', zIndex: 1
        }}>
        your effort, made visible
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 1, width: '100%', maxWidth: '340px' }}>
        {features.map((f, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 18px',
              background: 'rgba(180, 79, 255, 0.08)',
              border: '1px solid rgba(180, 79, 255, 0.2)',
              borderRadius: '14px'
            }}>
            <div style={{ flexShrink: 0 }}>{f.icon}</div>
            <div style={{ fontSize: '14px', color: '#C0A8E0', lineHeight: 1.5, fontWeight: '500' }}>{f.text}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const submit = async () => {
    setError('')
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('all fields are required')
      return
    }
    if (!validateEmail(form.email)) {
      setError('please enter a valid email address')
      return
    }
    if (form.password.length < 6) {
      setError('password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API}/auth/signup`, {
        name: form.name,
        email: form.email,
        password: form.password
      })
      login({
        user_id: res.data.user_id,
        name: res.data.name,
        onboarded: false,
        theme: 'neon_noir'
      }, res.data.token)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'something went wrong')
    }
    setLoading(false)
  }

  const eyeIcon = (show) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      )}
    </svg>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <BrandPanel />

      <div style={{
        width: '500px', flexShrink: 0,
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 3rem', minHeight: '100vh', overflowY: 'auto'
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '400px', paddingTop: '1rem', paddingBottom: '1rem' }}>

          <div onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--font-logo)', fontSize: '32px',
              color: 'var(--primary)', marginBottom: '0.5rem', cursor: 'pointer'
            }}>strëak</div>

          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '22px',
            color: 'var(--primary)', marginBottom: '0.4rem'
          }}>create your account</div>

          <div style={{
            fontSize: '15px', color: 'var(--text-primary)',
            marginBottom: '2rem', opacity: 0.75
          }}>
            join strëak and make your effort visible.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Name */}
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '6px'
              }}>your name</label>
              <input
                name="name"
                placeholder="what should we call you?"
                value={form.name}
                onChange={handle}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '6px'
              }}>email address</label>
              <input
                name="email" type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handle}
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{
                  borderColor: form.email && !validateEmail(form.email) ? '#E24B4A' : undefined
                }}
              />
              {form.email && !validateEmail(form.email) && (
                <div style={{ fontSize: '12px', color: '#E24B4A', marginTop: '4px', fontWeight: '500' }}>
                  please enter a valid email address
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '6px'
              }}>create password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="at least 6 characters"
                  value={form.password}
                  onChange={handle}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ paddingRight: '44px' }}
                />
                <button onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', padding: '4px'
                  }}>
                  {eyeIcon(showPassword)}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '6px'
              }}>repeat password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="same password again"
                  value={form.confirmPassword}
                  onChange={handle}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{
                    paddingRight: '44px',
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword
                      ? '#E24B4A'
                      : form.confirmPassword && form.password === form.confirmPassword
                        ? '#639922'
                        : undefined
                  }}
                />
                <button onClick={() => setShowConfirm(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', padding: '4px'
                  }}>
                  {eyeIcon(showConfirm)}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div style={{ fontSize: '12px', color: '#E24B4A', marginTop: '4px', fontWeight: '500' }}>
                  passwords do not match
                </div>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <div style={{ fontSize: '12px', color: '#639922', marginTop: '4px', fontWeight: '500' }}>
                  passwords match
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(226,75,74,0.08)',
                  border: '1.5px solid rgba(226,75,74,0.3)',
                  borderRadius: '10px', padding: '12px 16px',
                  fontSize: '14px', color: '#E24B4A',
                  textAlign: 'center', fontWeight: '500'
                }}>
                {error}
              </motion.div>
            )}

            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                fontSize: '17px', marginTop: '4px',
                opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'creating your account...' : 'start farming aura →'}
            </motion.button>
          </div>

          <div style={{
            textAlign: 'center', marginTop: '1.5rem',
            fontSize: '15px', color: 'var(--text-primary)', opacity: 0.8
          }}>
            already have an account?{' '}
            <Link to="/login" style={{
              color: 'var(--primary)', fontWeight: '700', textDecoration: 'none'
            }}>log in</Link>
          </div>

          <div style={{
            textAlign: 'center', marginTop: '0.75rem',
            fontSize: '13px', color: 'var(--text-primary)',
            opacity: 0.4, cursor: 'pointer'
          }} onClick={() => navigate('/')}>
            ← back to home
          </div>
        </motion.div>
      </div>
    </div>
  )
}