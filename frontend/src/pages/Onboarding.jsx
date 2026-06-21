import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:5000'

const lightThemes = [
  { id: 'lavender_haze', name: 'lavender haze', desc: 'soft purple + gold — the default ✦' },
  { id: 'berry_dreams', name: 'berry dreams', desc: 'pink + seafoam — whimsy and warmth' },
  { id: 'majorelle', name: 'majorelle', desc: 'linen + blue + coral — bold and artistic' },
  { id: 'olive_garden', name: 'olive garden', desc: 'sky + olive + mustard — indie earthy' },
  { id: 'matcha_latte', name: 'matcha latte', desc: 'cream + green + brown — calm and cozy' },
  { id: 'desert_sun', name: 'desert sun', desc: 'sand + rust + cactus — warm rustic' },
  { id: 'mint_chip', name: 'mint chip', desc: 'mint + forest green + chocolate — fresh' },
  { id: 'cloud_nine', name: 'cloud nine', desc: 'sky + cobalt + sunshine — airy bright' },
  { id: 'ocean_breeze', name: 'ocean breeze', desc: 'seafoam + teal + coral — coastal calm' },
]

const darkThemes = [
  { id: 'galaxy', name: 'galaxy', desc: 'deep space + purple + pink — aura max' },
  { id: 'midnight_garden', name: 'midnight garden', desc: 'near black + emerald + rose' },
  { id: 'forest', name: 'forest', desc: 'deep green + warm brown + cream' },
  { id: 'mocha', name: 'mocha', desc: 'espresso + terracotta + gold' },
  { id: 'neon_noir', name: 'neon noir', desc: 'pure black + electric purple + pink' },
  { id: 'cyber_gold', name: 'cyber gold', desc: 'near black + gold + amber glow' },
  { id: 'blood_orange', name: 'blood orange', desc: 'near black + fire orange + coral' },
  { id: 'arctic', name: 'arctic', desc: 'deep navy + cyan + ice blue' },
  { id: 'obsidian', name: 'obsidian', desc: 'pure black + white — ultra minimal' },
]

const goals = [30, 45, 60, 90, 120]
const goalLabels = { 30: 'just getting started', 45: 'building the habit', 60: 'solid commitment', 90: 'serious grinder', 120: 'full aura mode' }

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, token, updateTheme } = useAuth()
  const [step, setStep] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState('lavender_haze')
  const [themeMode, setThemeMode] = useState('light')
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
      }, { headers: { Authorization: `Bearer ${token}` } })
      updateTheme(selectedTheme)
      navigate('/dashboard')
    } catch (err) {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const currentThemes = themeMode === 'light' ? lightThemes : darkThemes

  const steps = [
    {
      title: 'pick your vibe',
      subtitle: 'this is how strëak looks every time you open it. you can always change it later.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* mode toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            {['light', 'dark'].map(mode => (
              <button key={mode} onClick={() => setThemeMode(mode)}
                style={{
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
                  border: '2px solid var(--border)', fontSize: '13px',
                  background: themeMode === mode ? 'var(--primary)' : 'transparent',
                  color: themeMode === mode ? 'white' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)', fontWeight: '500', transition: 'all 0.2s'
                }}>
                {mode === 'light' ? '☀️ light' : '🌙 dark'}
              </button>
            ))}
          </div>

          {/* theme list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            <AnimatePresence mode="wait">
              <motion.div key={themeMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentThemes.map(theme => (
                  <motion.div key={theme.id}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => handleThemeSelect(theme.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderRadius: '14px', cursor: 'pointer',
                      border: selectedTheme === theme.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                      background: selectedTheme === theme.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                      transition: 'all 0.2s ease'
                    }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {theme.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.7 }}>
                        {theme.desc}
                      </div>
                    </div>
                    {selectedTheme === theme.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', flexShrink: 0 }}>
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )
    },
    {
      title: 'set your daily goal',
      subtitle: 'how long do you want to study each day? strëak tracks your progress against this.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map(goal => (
            <motion.div key={goal}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedGoal(goal)}
              style={{
                padding: '18px 22px', borderRadius: '14px', cursor: 'pointer',
                border: selectedGoal === goal ? '2px solid var(--primary)' : '2px solid var(--border)',
                background: selectedGoal === goal ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s ease'
              }}>
              <div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)' }}>
                  {goal >= 60 ? `${goal / 60}h${goal % 60 ? ` ${goal % 60}m` : ''}` : `${goal}m`}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {goalLabels[goal]}
                </div>
              </div>
              {selectedGoal === goal && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px' }}>
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
      subtitle: "give your physical STRËAK device a personality. or skip — we'll handle it.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <motion.svg width="100" height="100" viewBox="0 0 100 100"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ display: 'block', margin: '0 auto 1.2rem' }}>
              <motion.circle cx="50" cy="8" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.circle cx="73" cy="15" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
              <motion.circle cx="27" cy="15" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
              <motion.circle cx="82" cy="38" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
              <motion.circle cx="18" cy="38" r="2.5" fill="var(--accent)"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
              <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" />
              <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
              <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
              <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" />
              <motion.circle cx="50" cy="38" r="7" fill="var(--accent)"
                animate={{ r: [6, 8, 6] }} transition={{ duration: 1.8, repeat: Infinity }} />
              <circle cx="50" cy="38" r="3" fill="white" />
            </motion.svg>

            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.6 }}>
              your physical device will auto-connect here when it arrives. for now, sit down and stand up buttons on the dashboard simulate it perfectly.
            </div>

            <input
              placeholder={`${user?.name || 'my'}'s strëak device`}
              value={deviceName}
              onChange={e => setDeviceName(e.target.value)}
              style={{ textAlign: 'center', fontSize: '16px' }}
            />
          </motion.div>

          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--primary)', marginBottom: '10px' }}>what strëak tracks automatically</div>
            {[
              '🪑  when you sit down at your desk',
              '⏱️  how long each session lasts',
              '📈  your momentum and aura score',
              '🔥  your daily streak',
            ].map((item, i) => (
              <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.5 }}>{item}</div>
            ))}
          </div>
        </div>
      )
    }
  ]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
      transition: 'background 0.4s ease'
    }}>
      {/* background blobs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '600px', height: '600px', background: 'var(--primary-light)',
        borderRadius: '50%', filter: 'blur(120px)', opacity: 0.25,
        pointerEvents: 'none', transition: 'background 0.4s ease'
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '500px', height: '500px', background: 'var(--accent)',
        borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15,
        pointerEvents: 'none', transition: 'background 0.4s ease'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}
      >
        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-logo)', fontSize: '36px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            strëak
          </motion.div>

          <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
            {step === 0 && `hey ${user?.name?.split(' ')[0] || 'there'} 👋 let's make this yours`}
            {step === 1 && 'how ambitious are you feeling?'}
            {step === 2 && 'one last thing'}
          </div>

          {/* step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {steps.map((_, i) => (
              <motion.div key={i}
                animate={{
                  width: i === step ? '28px' : '8px',
                  background: i < step ? 'var(--accent)' : i === step ? 'var(--primary)' : 'var(--border)'
                }}
                style={{ height: '8px', borderRadius: '4px', transition: 'all 0.3s' }}
              />
            ))}
          </div>
        </div>

        {/* card */}
        <div className="glass" style={{ padding: '2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}>
              <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '26px', color: 'var(--primary)', marginBottom: '6px' }}>
                {steps[step].title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, opacity: 0.8 }}>
                {steps[step].subtitle}
              </p>
              {steps[step].content}
            </motion.div>
          </AnimatePresence>

          {/* navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            {step > 0 ? (
              <motion.button className="btn-outline"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => s - 1)}
                style={{ padding: '10px 22px', fontSize: '14px' }}>
                ← back
              </motion.button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <motion.button className="btn-primary"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => s + 1)}
                style={{ padding: '10px 24px', fontSize: '14px' }}>
                next →
              </motion.button>
            ) : (
              <motion.button className="btn-primary"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={finish} disabled={loading}
                style={{ padding: '10px 24px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'setting up...' : 'enter strëak →'}
              </motion.button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}>
          skip for now
        </div>
      </motion.div>
    </div>
  )
}