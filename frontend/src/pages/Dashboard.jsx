import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import io from 'socket.io-client'
import Navbar from '../components/layout/Navbar'

const API = 'http://localhost:5000'

const quotes = [
  { text: 'small daily improvements are the key to staggering long-term results.', author: 'Robin Sharma' },
  { text: 'you do not rise to the level of your goals. you fall to the level of your systems.', author: 'James Clear' },
  { text: 'the secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'it is not about having time. it is about making time.', author: 'unknown' },
  { text: 'discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
  { text: 'the pain of discipline is far less than the pain of regret.', author: 'unknown' },
  { text: 'focus on progress, not perfection.', author: 'unknown' },
  { text: 'your future is created by what you do today, not tomorrow.', author: 'Robert Kiyosaki' },
  { text: 'motivation gets you going, but discipline keeps you growing.', author: 'John C. Maxwell' },
  { text: 'the harder you work for something, the greater you will feel when you achieve it.', author: 'unknown' },
]

const tourSlides = [
  { isLogo: true },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="10" y="38" width="44" height="6" rx="3" fill="var(--primary)"/>
        <rect x="13" y="44" width="6" height="12" rx="3" fill="var(--primary)"/>
        <rect x="45" y="44" width="6" height="12" rx="3" fill="var(--primary)"/>
        <rect x="18" y="24" width="28" height="16" rx="4" fill="var(--primary-light)"/>
        <circle cx="32" cy="20" r="8" fill="var(--accent)"/>
        <circle cx="32" cy="10" r="3" fill="var(--accent)" opacity="0.5"/>
        <circle cx="44" cy="13" r="3" fill="var(--accent)" opacity="0.5"/>
        <circle cx="20" cy="13" r="3" fill="var(--accent)" opacity="0.5"/>
      </svg>
    ),
    title: 'sit down to start.',
    subtitle: 'stand up to stop.',
    desc: 'that is literally it. no timers to set. no apps to open. strëak detects you automatically using PIR and IR sensors.',
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="20" stroke="var(--border)" strokeWidth="6" fill="none"/>
        <circle cx="32" cy="32" r="20" stroke="var(--primary)" strokeWidth="6" fill="none"
          strokeDasharray="50 76" strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }}/>
        <circle cx="32" cy="32" r="6" fill="var(--accent)"/>
        <circle cx="32" cy="32" r="2" fill="white"/>
      </svg>
    ),
    title: 'your aura grows.',
    subtitle: 'consistency is everything.',
    desc: 'show up every day, even for 30 minutes, and watch your streak, momentum score, and aura rise over time.',
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="10" y="18" width="10" height="6" rx="2" fill="var(--primary-light)"/>
        <rect x="10" y="20" width="10" height="24" rx="2" fill="var(--primary-light)"/>
        <rect x="27" y="14" width="10" height="30" rx="2" fill="var(--primary-light)"/>
        <rect x="44" y="8" width="10" height="36" rx="2" fill="var(--primary)"/>
        <polyline points="12,36 30,24 48,12" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <circle cx="48" cy="12" r="4" fill="var(--accent)"/>
      </svg>
    ),
    title: 'your desk speaks.',
    subtitle: '5 LEDs. one glows at a time.',
    desc: 'white means standby. yellow builds. blue grows. green means flow. red means your phone is on the desk.',
  },
]

function WelcomeTour({ userName, onDone }) {
  const [slide, setSlide] = useState(0)
  const next = () => slide < tourSlides.length - 1 ? setSlide(s => s + 1) : onDone()
  const current = tourSlides[slide]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999, background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '2rem'
      }}>
      {[...Array(10)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], opacity: [0, 0.4, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
            background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)',
            left: `${8 + i * 9}%`, top: `${15 + (i % 4) * 18}%`, pointerEvents: 'none'
          }} />
      ))}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '3rem' }}>
        {tourSlides.map((_, i) => (
          <motion.div key={i}
            animate={{ width: i === slide ? '28px' : '8px', background: i <= slide ? 'var(--primary)' : 'var(--border)' }}
            style={{ height: '8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => setSlide(i)} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={slide}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.96 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ maxWidth: '560px', width: '100%' }}>

          {current.isLogo ? (
            <>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ marginBottom: '2rem' }}>
                <svg width="120" height="120" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                  <motion.circle cx="50" cy="8" r="2.5" fill="var(--accent)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                  <motion.circle cx="73" cy="15" r="2.5" fill="var(--accent)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
                  <motion.circle cx="27" cy="15" r="2.5" fill="var(--accent)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
                  <motion.circle cx="82" cy="38" r="2.5" fill="var(--accent)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
                  <motion.circle cx="18" cy="38" r="2.5" fill="var(--accent)" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
                  <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" />
                  <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
                  <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
                  <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" />
                  <motion.circle cx="50" cy="38" r="7" fill="var(--accent)" animate={{ r: [6, 8, 6] }} transition={{ duration: 1.8, repeat: Infinity }} />
                  <circle cx="50" cy="38" r="3" fill="white" />
                </svg>
              </motion.div>
              <div style={{ fontFamily: 'var(--font-logo)', fontSize: 'clamp(48px, 10vw, 80px)', color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1 }}>strëak</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '0.75rem', opacity: 0.9 }}>
                welcome, {userName?.split(' ')[0]} ✦
              </div>
              <div style={{ fontSize: '16px', color: 'var(--text-primary)', opacity: 0.7, lineHeight: 1.7 }}>
                your effort is about to become visible.
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>{current.icon}</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(24px, 4vw, 38px)', color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {current.title}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--accent-dark)', marginBottom: '1.5rem', fontWeight: '600' }}>
                {current.subtitle}
              </div>
              <div style={{ fontSize: '17px', color: 'var(--text-primary)', lineHeight: 1.8, opacity: 0.85 }}>
                {current.desc}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div style={{ marginTop: '3rem', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <motion.button className="btn-primary"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={next}
          style={{ padding: '16px 40px', fontSize: '18px' }}>
          {slide === 0 ? "let's go →" : slide === tourSlides.length - 1 ? 'enter strëak →' : 'next →'}
        </motion.button>
        {slide > 0 && slide < tourSlides.length - 1 && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={onDone}
            style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.4, cursor: 'pointer' }}>
            skip
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  )
}

function ColdStart({ onEnter }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
      style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4rem 2rem',
        position: 'relative', overflow: 'hidden'
      }}>
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -24, 0], opacity: [0, 0.35, 0], x: [0, (i % 2 === 0 ? 12 : -12), 0] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.6 }}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? '10px' : '6px', height: i % 3 === 0 ? '10px' : '6px',
            borderRadius: '50%',
            background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)',
            left: `${10 + i * 10}%`, top: `${20 + (i % 4) * 18}%`, pointerEvents: 'none'
          }} />
      ))}

      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <svg width="180" height="180" viewBox="0 0 100 100">
          <motion.circle cx="50" cy="8" r="2.5" animate={{ opacity: [0.1, 0.3, 0.1], fill: 'var(--border)' }} transition={{ duration: 3, repeat: Infinity }} />
          <motion.circle cx="73" cy="15" r="2.5" animate={{ opacity: [0.1, 0.3, 0.1], fill: 'var(--border)' }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} />
          <motion.circle cx="27" cy="15" r="2.5" animate={{ opacity: [0.1, 0.3, 0.1], fill: 'var(--border)' }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
          <motion.circle cx="82" cy="38" r="2.5" animate={{ opacity: [0.1, 0.3, 0.1], fill: 'var(--border)' }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
          <motion.circle cx="18" cy="38" r="2.5" animate={{ opacity: [0.1, 0.3, 0.1], fill: 'var(--border)' }} transition={{ duration: 3, repeat: Infinity, delay: 2 }} />
          <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" opacity="0.2" />
          <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" opacity="0.2" />
          <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" opacity="0.2" />
          <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" opacity="0.2" />
          <rect x="34" y="48" width="32" height="12" rx="3" fill="white" opacity="0.15" />
          <motion.circle cx="50" cy="38" r="6" fill="var(--border)" animate={{ opacity: [0.2, 0.5, 0.2], r: [5, 7, 5] }} transition={{ duration: 3, repeat: Infinity }} />
          <circle cx="50" cy="38" r="2.5" fill="white" opacity="0.3" />
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(28px, 5vw, 52px)', color: 'var(--primary)', marginBottom: '1.2rem', lineHeight: 1.2, position: 'relative', zIndex: 1 }}>
        your desk is quiet.
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
        style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: 1.8, maxWidth: '480px', marginBottom: '0.75rem', position: 'relative', zIndex: 1, opacity: 0.85 }}>
        you already study hard. you just have nothing to show for it.
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
        style={{ fontSize: '16px', color: 'var(--text-primary)', opacity: 0.5, marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        explore your dashboard, set up a session, and start your streak.
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.6, type: 'spring', stiffness: 200 }}
        style={{ position: 'relative', zIndex: 1 }}>
        <motion.button className="btn-primary"
          animate={{ boxShadow: ['0 0 0px var(--primary)', '0 0 40px var(--primary)', '0 0 0px var(--primary)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}
          onClick={onEnter}
          style={{ padding: '20px 52px', fontSize: '20px', letterSpacing: '1px' }}>
          enter dashboard →
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}
        style={{ marginTop: '2rem', fontSize: '14px', color: 'var(--text-primary)', opacity: 0.3, position: 'relative', zIndex: 1 }}>
        your journey starts when you are ready
      </motion.div>
    </motion.div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <motion.div className="glass" whileHover={{ y: -4 }} style={{ padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: accent ? 'var(--accent-dark)' : 'var(--text-primary)', letterSpacing: '2px', marginBottom: '8px', opacity: 0.7 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '42px', color: accent ? 'var(--accent-dark)' : 'var(--primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '6px', opacity: 0.65 }}>{sub}</div>}
    </motion.div>
  )
}

function LEDDevice({ score, sessionActive }) {
  const getLEDColor = () => {
    if (!sessionActive) return { color: '#ffffff', border: '#888', label: 'white', desc: 'standby — no active session' }
    if (score < 30) return { color: '#EF9F27', label: 'yellow', desc: 'building — under 30 mins' }
    if (score < 60) return { color: '#4A90D9', label: 'blue', desc: 'momentum growing — 30 to 60 mins' }
    if (score < 80) return { color: '#639922', label: 'green', desc: 'full flow state — 60+ mins' }
    return { color: '#639922', label: 'green', desc: 'milestone hit' }
  }
  const led = getLEDColor()

  return (
    <motion.div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>DEVICE STATE</div>
      <motion.svg width="120" height="120" viewBox="0 0 100 100"
        animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}
        style={{ display: 'block', margin: '0 auto 1rem' }}>
        <motion.circle cx="50" cy="8" r="2.5" animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="73" cy="15" r="2.5" animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
        <motion.circle cx="27" cy="15" r="2.5" animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
        <motion.circle cx="82" cy="38" r="2.5" animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
        <motion.circle cx="18" cy="38" r="2.5" animate={{ opacity: sessionActive ? [0.3, 1, 0.3] : 0.2, fill: led.color }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
        <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" />
        <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
        <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
        <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" />
        <rect x="34" y="48" width="32" height="12" rx="3" fill="white" opacity="0.5" />
        <motion.circle cx="50" cy="38" r="7" animate={{ fill: led.color, r: sessionActive ? [6, 9, 6] : 6 }} transition={{ duration: 1.8, repeat: Infinity }} />
        <circle cx="50" cy="38" r="3" fill="white" />
      </motion.svg>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>{led.label}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-primary)', opacity: 0.75 }}>{led.desc}</div>
    </motion.div>
  )
}

function AuraRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <motion.div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>AURA SCORE</div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
          <motion.circle cx="70" cy="70" r={radius} fill="none"
            stroke="var(--primary)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '32px', color: 'var(--primary)', lineHeight: 1 }}>{Math.round(score)}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-primary)', opacity: 0.6 }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '1rem', opacity: 0.75 }}>
        {score < 30 && 'keep going, aura is building'}
        {score >= 30 && score < 60 && 'solid momentum, stay consistent'}
        {score >= 60 && score < 80 && 'strong aura, you are on a roll'}
        {score >= 80 && 'maximum aura unlocked'}
      </div>
    </motion.div>
  )
}

function DailyQuote() {
  const quote = quotes[new Date().getDate() % quotes.length]
  return (
    <motion.div className="glass"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '2px', marginBottom: '0.75rem', opacity: 0.6 }}>TODAY'S QUOTE</div>
      <div style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '0.5rem', opacity: 0.9 }}>
        "{quote.text}"
      </div>
      <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>— {quote.author}</div>
    </motion.div>
  )
}

function StreakBanner({ streak }) {
  if (!streak || streak === 0) return null
  const getMessage = () => {
    if (streak === 1) return 'streak started. show up tomorrow.'
    if (streak < 7) return `${streak} days in. the habit is forming.`
    if (streak < 14) return `${streak} days. one full week done. keep going.`
    if (streak < 30) return `${streak} days. you are building something real.`
    if (streak < 60) return `${streak} days. one month of showing up. respect.`
    return `${streak} days. this is who you are now.`
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      style={{
        padding: '1.25rem 1.75rem',
        background: 'var(--primary)',
        borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px'
      }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'white', fontWeight: '700' }}>
        {streak} day streak
      </div>
      <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
        {getMessage()}
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white', flexShrink: 0 }} />
    </motion.div>
  )
}

function UpcomingSessions({ navigate }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('streak_calendar_events')
    if (saved) {
      const all = JSON.parse(saved)
      const today = new Date().toISOString().split('T')[0]
      const upcoming = all
        .filter(e => e.date >= today && !e.completed)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3)
      setEvents(upcoming)
    }
  }, [])

  return (
    <motion.div className="glass" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '2px', opacity: 0.7 }}>UPCOMING SESSIONS</div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/calendar')}
          style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'var(--font-body)' }}>
          view all →
        </motion.button>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.6, marginBottom: '8px' }}>no upcoming sessions planned</div>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/calendar')}
            style={{
              fontSize: '13px', color: 'var(--primary)', background: 'rgba(96,96,210,0.08)',
              border: '1.5px solid var(--primary)', borderRadius: '10px',
              cursor: 'pointer', padding: '8px 16px', fontFamily: 'var(--font-body)', fontWeight: '600'
            }}>
            plan a session
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.map((event, i) => {
            const date = new Date(event.date)
            const isToday = event.date === new Date().toISOString().split('T')[0]
            const isTomorrow = event.date === new Date(Date.now() + 86400000).toISOString().split('T')[0]
            const label = isToday ? 'today' : isTomorrow ? 'tomorrow' : date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
            return (
              <motion.div key={event.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: '10px',
                  background: isToday ? 'rgba(96,96,210,0.08)' : 'var(--surface)',
                  border: isToday ? '1.5px solid var(--primary)' : '1.5px solid var(--border)'
                }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--primary)', marginBottom: '2px' }}>{event.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', opacity: 0.6 }}>
                    {label}{event.time ? ` · ${event.time}` : ''}
                    {event.duration ? ` · ${event.duration}` : ''}
                  </div>
                </div>
                {isToday && (
                  <div style={{ fontSize: '11px', background: 'var(--primary)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                    today
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const [data, setData] = useState(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionStart, setSessionStart] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTour, setShowTour] = useState(false)
  const [tourDone, setTourDone] = useState(false)
  const [coldStartDone, setColdStartDone] = useState(false)
  const socketRef = useRef(null)
  const timerRef = useRef(null)
  const navigate = (path) => window.location.href = path

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      setData(res.data)
      setSessionActive(res.data.session_active)
      if (res.data.session_active && res.data.session_start) {
        const start = new Date(res.data.session_start)
        setSessionStart(start)
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }
    } catch (err) {
      if (err.response?.status === 401) logout()
    }
    setLoading(false)
  }

  useEffect(() => {
    const currentTheme = user?.theme || 'neon_noir'
    document.documentElement.setAttribute('data-theme', currentTheme)
    const tourSeen = localStorage.getItem(`streak_tour_${user?.user_id}`)
    const coldDone = localStorage.getItem(`streak_cold_${user?.user_id}`)
    if (!tourSeen) setShowTour(true)
    else setTourDone(true)
    if (coldDone) setColdStartDone(true)
    fetchDashboard()
    socketRef.current = io(API)
    socketRef.current.on(`session_started_${user?.user_id}`, (d) => {
      setSessionActive(true)
      const start = new Date(d.start_time)
      setSessionStart(start)
      setElapsed(0)
    })
    socketRef.current.on(`session_ended_${user?.user_id}`, () => {
      setSessionActive(false)
      setSessionStart(null)
      setElapsed(0)
      fetchDashboard()
    })
    return () => socketRef.current?.disconnect()
  }, [])

  useEffect(() => {
    if (sessionActive && sessionStart) {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000)
    } else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [sessionActive, sessionStart])

  const handleTourDone = () => {
    localStorage.setItem(`streak_tour_${user?.user_id}`, 'true')
    setShowTour(false)
    setTourDone(true)
  }

  const handleColdStartEnter = () => {
    localStorage.setItem(`streak_cold_${user?.user_id}`, 'true')
    setColdStartDone(true)
  }

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatMins = (mins) => {
    if (!mins) return '0m'
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    if (h === 0) return `${m}m`
    return m === 0 ? `${h}h` : `${h}h ${m}m`
  }

  const startSession = async () => {
    if (sessionActive) return
    const now = new Date()
    setSessionActive(true)
    setSessionStart(now)
    setElapsed(0)
    try {
      await axios.post(`${API}/session/start`, {}, { headers: { Authorization: `Bearer ${token}` } })
    } catch (err) {
      setSessionActive(false)
      setSessionStart(null)
    }
  }

  const endSession = async () => {
    if (!sessionActive) return
    setSessionActive(false)
    setSessionStart(null)
    setElapsed(0)
    try {
      await axios.post(`${API}/session/end`, {}, { headers: { Authorization: `Bearer ${token}` } })
      fetchDashboard()
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '24px', color: 'var(--primary)' }}>
        loading strëak...
      </motion.div>
    </div>
  )

  if (showTour) return <WelcomeTour userName={user?.name} onDone={handleTourDone} />

  const hasNoSessions = !data?.all_dates?.length && !sessionActive && tourDone && !coldStartDone
  if (hasNoSessions) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <ColdStart onEnter={handleColdStartEnter} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--primary)', marginBottom: '6px' }}>
            {new Date().getHours() < 12 ? 'good morning' : new Date().getHours() < 17 ? 'good afternoon' : 'good evening'}, {user?.name?.split(' ')[0]} ✦
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-primary)', opacity: 0.75 }}>
            {sessionActive ? 'session in progress. keep going.' : 'what are you studying today?'}
          </p>
        </motion.div>

        {/* streak banner */}
        {data?.streak > 0 && <StreakBanner streak={data.streak} />}

        {/* daily quote */}
        <div style={{ marginBottom: '1.5rem' }}>
          <DailyQuote />
        </div>

        {/* stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '1.5rem' }}>
          <StatCard label="STREAK" value={data?.streak || 0} sub="consecutive days" />
          <StatCard label="TODAY" value={formatMins(data?.today_minutes)} sub="logged so far" accent />
          <StatCard label="AURA" value={Math.round(data?.aura_score || 0)} sub="out of 100" />
          <StatCard label="THIS WEEK" value={data?.weekly_data?.length || 0} sub="active days" accent />
        </div>

        {/* main grid — session + device + aura | upcoming */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>

          {/* left — session controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* session card */}
            <motion.div className="glass" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.7 }}>CURRENT SESSION</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <motion.div
                    animate={{ opacity: sessionActive ? [0.5, 1, 0.5] : 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: '10px', height: '10px', borderRadius: '50%', background: sessionActive ? '#639922' : 'var(--border)' }} />
                  <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600', opacity: 0.85 }}>
                    {sessionActive ? 'session active' : 'no active session'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '52px', color: 'var(--primary)', letterSpacing: '2px', marginBottom: '1.5rem', lineHeight: 1 }}>
                  {sessionActive ? formatTime(elapsed) : '00:00:00'}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <motion.button className="btn-primary"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={startSession} disabled={sessionActive}
                    style={{ flex: 1, padding: '14px', fontSize: '16px', opacity: sessionActive ? 0.4 : 1 }}>
                    sit down
                  </motion.button>
                  <motion.button className="btn-outline"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={endSession} disabled={!sessionActive}
                    style={{ flex: 1, padding: '14px', fontSize: '16px', opacity: !sessionActive ? 0.4 : 1 }}>
                    stand up
                  </motion.button>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', opacity: 0.45, marginTop: '1rem' }}>
                  hardware connects automatically when ESP32 is ready
                </div>
              </div>
            </motion.div>

            {/* device + aura side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <LEDDevice score={elapsed / 60} sessionActive={sessionActive} />
              <AuraRing score={data?.aura_score || 0} />
            </div>
          </div>

          {/* right — upcoming sessions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <UpcomingSessions navigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  )
}