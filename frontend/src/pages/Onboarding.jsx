import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:5000'

const themes = [
  {
    id: 'berry_dreams',
    name: 'berry dreams',
    colors: ['#FEF0F4', '#F8B6BF', '#BF1E62', '#95D5D1'],
    desc: 'soft, whimsy, aura farming default'
  },
  {
    id: 'pacific_coast',
    name: 'pacific coast',
    colors: ['#051C36', '#34617F', '#5F8FA5', '#E6D3AB'],
    desc: 'dark, clean, serious energy'
  },
  {
    id: 'majorelle',
    name: 'majorelle',
    colors: ['#E8EDDF', '#6060D2', '#FF7247', '#CFDBD5'],
    desc: 'bold, artistic, retro european'
  },
  {
    id: 'olive_garden',
    name: 'olive garden',
    colors: ['#CDE9FF', '#463500', '#C6A100', '#FFB8E5'],
    desc: 'indie, earthy, y2k vibes'
  },
  {
    id: 'cerise_spark',
    name: 'cerise spark',
    colors: ['#F2F2F1', '#E30163', '#CDDC39', '#F04D8E'],
    desc: 'electric, bold, maximalist pop'
  }
]

const goals = [30, 45, 60, 90, 120]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, token, updateTheme } = useAuth()
  const [step, setStep] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState('berry_dreams')
  const [selectedGoal, setSelectedGoal] = useState(60)
  const [deviceName, setDeviceName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId)
    document.documentElement.setAttribute('data-theme', themeId)
  }

  const finish = async () => {
    setLoading(true)
    try {
      await axios.post(`${API}/auth/onboard`, {
        theme: selectedTheme,
        daily_goal_minutes: selectedGoal,
        device_name: deviceName || `${user?.name}'s STRËAK Device`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateTheme(selectedTheme)
      navigate('/dashboard')
    } catch (err) {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const steps = [
    {
      title: 'pick your vibe',
      subtitle: 'choose a theme — you can always change it later',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {themes.map(theme => (
            <motion.div
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect(theme.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: '16px',
                cursor: 'pointer',
                border: selectedTheme === theme.id
                  ? '2px solid var(--primary)'
                  : '2px solid var(--border)',
                background: selectedTheme === theme.id
                  ? 'rgba(191,30,98,0.06)'
                  : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                {theme.colors.map((c, i) => (
                  <div key={i} style={{
                    width: '22px', height: '38px',
                    borderRadius: '6px',
                    background: c,
                    border: '1px solid rgba(0,0,0,0.06)'
                  }} />
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '18px',
                  color: 'var(--primary)',
                  marginBottom: '3px'
                }}>{theme.name}</div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>{theme.desc}</div>
              </div>
              {selectedTheme === theme.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: '24px', height: '24px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white', fontSize: '14px'
                  }}>
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: 'set your daily goal',
      subtitle: 'how long do you want to study each day?',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {goals.map(goal => (
            <motion.div
              key={goal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGoal(goal)}
              style={{
                padding: '20px 24px',
                borderRadius: '16px',
                cursor: 'pointer',
                border: selectedGoal === goal
                  ? '2px solid var(--primary)'
                  : '2px solid var(--border)',
                background: selectedGoal === goal
                  ? 'rgba(191,30,98,0.06)'
                  : 'rgba(255,255,255,0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '22px',
                  color: 'var(--primary)'
                }}>
                  {goal >= 60 ? `${goal / 60}h${goal % 60 ? ` ${goal % 60}m` : ''}` : `${goal}m`}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginTop: '3px'
                }}>
                  {goal === 30 && 'just getting started'}
                  {goal === 45 && 'building the habit'}
                  {goal === 60 && 'solid commitment'}
                  {goal === 90 && 'serious grinder'}
                  {goal === 120 && 'full aura mode'}
                </div>
              </div>
              {selectedGoal === goal && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: '24px', height: '24px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white', fontSize: '14px'
                  }}>
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: 'name your device',
      subtitle: 'give your STRËAK device a name — or skip and we\'ll name it for you',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.div
            className="glass"
            style={{ padding: '2rem', textAlign: 'center' }}
          >
            <motion.svg
              width="100" height="100" viewBox="0 0 100 100"
              style={{ margin: '0 auto 1rem', display: 'block' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.circle cx="50" cy="8" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <motion.circle cx="73" cy="15" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
              <motion.circle cx="27" cy="15" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
              <motion.circle cx="82" cy="38" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
              <motion.circle cx="18" cy="38" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
              <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" />
              <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
              <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
              <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" />
              <motion.circle cx="50" cy="38" r="7" fill="var(--accent)"
                animate={{ r: [6, 8, 6] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
              <circle cx="50" cy="38" r="3" fill="white" />
            </motion.svg>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '16px',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem'
            }}>
              your physical device will connect here when it arrives
            </div>
            <input
              placeholder={`${user?.name || 'my'}'s STRËAK device`}
              value={deviceName}
              onChange={e => setDeviceName(e.target.value)}
              style={{ textAlign: 'center', fontSize: '16px' }}
            />
          </motion.div>
        </div>
      )
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.4s ease'
    }}>

      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '500px', height: '500px',
        background: 'var(--primary-light)',
        borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.3, pointerEvents: 'none',
        transition: 'background 0.4s ease'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '400px', height: '400px',
        background: 'var(--accent)',
        borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.25, pointerEvents: 'none',
        transition: 'background 0.4s ease'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '560px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-logo)',
            fontSize: '32px',
            color: 'var(--primary)',
            marginBottom: '0.5rem'
          }}>strëak</div>

          {/* step indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '1rem'
          }}>
            {steps.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === step ? '32px' : '8px',
                  background: i <= step ? 'var(--primary)' : 'var(--primary-light)'
                }}
                style={{ height: '8px', borderRadius: '4px' }}
              />
            ))}
          </div>

          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            opacity: 0.6
          }}>
            step {step + 1} of {steps.length}
          </div>
        </div>

        {/* card */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '28px',
                color: 'var(--primary)',
                marginBottom: '0.5rem'
              }}>
                {steps[step].title}
              </h2>
              <p style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: 1.6
              }}>
                {steps[step].subtitle}
              </p>
              {steps[step].content}
            </motion.div>
          </AnimatePresence>

          {/* navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem'
          }}>
            {step > 0 ? (
              <button
                className="btn-outline"
                onClick={() => setStep(s => s - 1)}
                style={{ padding: '12px 24px', fontSize: '15px' }}>
                ← back
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => s + 1)}
                style={{ padding: '12px 28px', fontSize: '15px' }}>
                next →
              </motion.button>
            ) : (
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={finish}
                disabled={loading}
                style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  opacity: loading ? 0.7 : 1
                }}>
                {loading ? 'setting up...' : 'enter strëak →'}
              </motion.button>
            )}
          </div>
        </div>

        {/* skip */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          opacity: 0.6,
          cursor: 'pointer'
        }}
          onClick={() => navigate('/dashboard')}>
          skip for now
        </div>
      </motion.div>
    </div>
  )
}