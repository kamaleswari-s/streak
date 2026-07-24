import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:5000'

function BrandPanel() {
  const features = [
    { icon: '🪑', text: 'sits on your desk. detects you automatically.' },
    { icon: '💡', text: 'LED glows brighter the harder you study.' },
    { icon: '📱', text: 'detects phone distraction. keeps you honest.' },
    { icon: '✦', text: 'your aura grows with every consistent day.' },
  ]

  return (
    <div style={{
      flex: 1, background: '#0A0A0F',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '3rem', position: 'relative', overflow: 'hidden',
      minHeight: '100vh'
    }}>
      {/* background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '30%',
        width: '400px', height: '400px',
        background: '#B44FFF',
        borderRadius: '50%', filter: 'blur(120px)',
        opacity: 0.12, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '20%',
        width: '300px', height: '300px',
        background: '#FF2D78',
        borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.08, pointerEvents: 'none'
      }} />

      {/* floating particles */}
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

      {/* device animation */}
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

      {/* logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: 'var(--font-logo)', fontSize: '52px',
          color: '#B44FFF', marginBottom: '0.5rem',
          position: 'relative', zIndex: 1, lineHeight: 1
        }}>
        strëak
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: 'var(--font-pixel)', fontSize: '14px',
          color: '#C0A8E0', marginBottom: '3rem',
          position: 'relative', zIndex: 1
        }}>
        your effort, made visible
      </motion.div>

      {/* features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1, width: '100%', maxWidth: '340px' }}>
        {features.map((f, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 18px',
              background: 'rgba(180, 79, 255, 0.08)',
              border: '1px solid rgba(180, 79, 255, 0.15)',
              borderRadius: '14px'
            }}>
            <div style={{ fontSize: '22px', flexShrink: 0 }}>{f.icon}</div>
            <div style={{ fontSize: '14px', color: '#C0A8E0', lineHeight: 1.5 }}>{f.text}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError('')
    if (!form.email || !form.password) {
      setError('both fields are required')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API}/auth/login`, form)
      login({
        user_id: res.data.user_id,
        name: res.data.name,
        onboarded: res.data.onboarded,
        theme: res.data.theme
      }, res.data.token)
      navigate(res.data.onboarded ? '/dashboard' : '/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* LEFT — brand panel */}
      <BrandPanel />

      {/* RIGHT — form */}
      <div style={{
        width: '480px', flexShrink: 0,
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', minHeight: '100vh'
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '380px' }}>

          <div onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--font-logo)', fontSize: '32px',
              color: 'var(--primary)', marginBottom: '0.5rem',
              cursor: 'pointer'
            }}>strëak</div>

          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '22px',
            color: 'var(--primary)', marginBottom: '0.4rem'
          }}>welcome back</div>

          <div style={{
            fontSize: '15px', color: 'var(--text-secondary)',
            marginBottom: '2.5rem', opacity: 0.7
          }}>
            your streak is waiting. log in to continue.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600',
                color: 'var(--text-primary)', marginBottom: '6px'
              }}>email</label>
              <input
                name="email" type="email"
                placeholder="your@email.com"
                value={form.email} onChange={handle}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600',
                color: 'var(--text-primary)', marginBottom: '6px'
              }}>password</label>
              <input
                name="password" type="password"
                placeholder="your password"
                value={form.password} onChange={handle}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(191,30,98,0.08)',
                  border: '1px solid rgba(191,30,98,0.2)',
                  borderRadius: '10px', padding: '12px 16px',
                  fontSize: '14px', color: 'var(--primary)', textAlign: 'center'
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
                fontSize: '17px', marginTop: '8px',
                opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'logging you in...' : 'log in →'}
            </motion.button>
          </div>

          <div style={{
            textAlign: 'center', marginTop: '2rem',
            fontSize: '15px', color: 'var(--text-secondary)'
          }}>
            don't have an account?{' '}
            <Link to="/signup" style={{
              color: 'var(--primary)', fontWeight: '600', textDecoration: 'none'
            }}>sign up free</Link>
          </div>

          <div style={{
            textAlign: 'center', marginTop: '1rem',
            fontSize: '13px', color: 'var(--text-secondary)',
            opacity: 0.4, cursor: 'pointer'
          }} onClick={() => navigate('/')}>
            ← back to home
          </div>
        </motion.div>
      </div>
    </div>
  )
}