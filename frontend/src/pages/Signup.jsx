import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('all fields are required')
      return
    }
    if (form.password.length < 6) {
      setError('password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API}/auth/signup`, form)
      login({
        user_id: res.data.user_id,
        name: res.data.name,
        onboarded: res.data.onboarded,
        theme: 'berry_dreams'
      }, res.data.token)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '500px', height: '500px',
        background: 'var(--primary-light)',
        borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.3, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '400px', height: '400px',
        background: 'var(--accent)',
        borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.25, pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass"
        style={{
          width: '100%', maxWidth: '460px',
          padding: '3rem', position: 'relative', zIndex: 1
        }}
      >
        <div onClick={() => navigate('/')} style={{
          fontFamily: 'var(--font-logo)', fontSize: '36px',
          color: 'var(--primary)', textAlign: 'center',
          marginBottom: '0.5rem', cursor: 'pointer'
        }}>strëak</div>

        <div style={{
          fontFamily: 'var(--font-pixel)', fontSize: '14px',
          color: 'var(--text-secondary)', textAlign: 'center',
          marginBottom: '2.5rem', opacity: 0.7
        }}>create your account</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: '600',
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

          <div>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: '600',
              color: 'var(--text-primary)', marginBottom: '6px'
            }}>email</label>
            <input
              name="email" type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handle}
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
              placeholder="at least 6 characters"
              value={form.password}
              onChange={handle}
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
            {loading ? 'creating your account...' : 'start farming aura →'}
          </motion.button>
        </div>

        <div style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '15px', color: 'var(--text-secondary)'
        }}>
          already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--primary)', fontWeight: '600', textDecoration: 'none'
          }}>log in</Link>
        </div>
      </motion.div>
    </div>
  )
}