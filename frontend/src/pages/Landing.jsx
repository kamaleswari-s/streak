import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const features = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="28" width="32" height="4" rx="2" fill="var(--primary)"/>
        <rect x="10" y="32" width="4" height="10" rx="2" fill="var(--primary)"/>
        <rect x="34" y="32" width="4" height="10" rx="2" fill="var(--primary)"/>
        <rect x="14" y="18" width="20" height="12" rx="3" fill="var(--primary-light)"/>
        <circle cx="24" cy="14" r="5" fill="var(--accent)"/>
        <circle cx="24" cy="8" r="2" fill="var(--accent)" opacity="0.5"/>
        <circle cx="32" cy="10" r="2" fill="var(--accent)" opacity="0.5"/>
        <circle cx="16" cy="10" r="2" fill="var(--accent)" opacity="0.5"/>
      </svg>
    ),
    title: 'zero interaction',
    desc: 'Sit down. That is it. No app to open, no timer to start. STRËAK detects your presence automatically using PIR and IR sensors. The session starts itself.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" stroke="var(--border)" strokeWidth="4" fill="none"/>
        <circle cx="24" cy="24" r="16" stroke="var(--primary)" strokeWidth="4" fill="none"
          strokeDasharray="60 40" strokeLinecap="round"/>
        <text x="24" y="29" textAnchor="middle" fill="var(--primary)" fontSize="12" fontWeight="bold">A</text>
      </svg>
    ),
    title: 'aura score',
    desc: 'A composite score built from your streak, consistency, session duration, and peak performance hours. The longer you show up, the more your aura grows.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="36" width="6" height="8" rx="1" fill="var(--primary-light)"/>
        <rect x="15" y="28" width="6" height="16" rx="1" fill="var(--primary-light)"/>
        <rect x="24" y="20" width="6" height="24" rx="1" fill="var(--primary)"/>
        <rect x="33" y="12" width="6" height="32" rx="1" fill="var(--primary)"/>
        <polyline points="9,32 18,24 27,16 36,8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    title: 'consistency over intensity',
    desc: '30 minutes every day scores higher than 5 hours once a week. The momentum algorithm rewards showing up — which is what habit science actually says works.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="8" width="16" height="28" rx="3" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
        <line x1="16" y1="14" x2="24" y2="14" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="19" x2="24" y2="19" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="10" fill="var(--accent)" opacity="0.15" stroke="var(--accent)" strokeWidth="2"/>
        <line x1="32" y1="26" x2="32" y2="38" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="26" y1="32" x2="38" y2="32" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'phone detection',
    desc: 'STRËAK detects if your phone lands on the desk mid-session. Timer pauses automatically. A 60-second grace period handles emergency calls. Zero surveillance — distance only.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="14" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
        <path d="M24 10 L24 24 L34 24" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="24" cy="24" r="3" fill="var(--primary)"/>
      </svg>
    ),
    title: 'focus environment index',
    desc: 'MQ135 air quality and DHT22 temperature sensors log your study environment. STRËAK tells you when poor air quality or heat is affecting your focus — something no other tool tracks.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="12" height="12" rx="2" fill="var(--primary)" opacity="0.3"/>
        <rect x="28" y="8" width="12" height="12" rx="2" fill="var(--primary)"/>
        <rect x="8" y="28" width="12" height="12" rx="2" fill="var(--primary)"/>
        <rect x="28" y="28" width="12" height="12" rx="2" fill="var(--primary)" opacity="0.3"/>
        <line x1="20" y1="14" x2="28" y2="14" stroke="var(--primary)" strokeWidth="2" strokeDasharray="2 2"/>
        <line x1="14" y1="20" x2="14" y2="28" stroke="var(--primary)" strokeWidth="2" strokeDasharray="2 2"/>
        <line x1="34" y1="20" x2="34" y2="28" stroke="var(--primary)" strokeWidth="2" strokeDasharray="2 2"/>
        <line x1="20" y1="34" x2="28" y2="34" stroke="var(--primary)" strokeWidth="2" strokeDasharray="2 2"/>
      </svg>
    ),
    title: 'full iot architecture',
    desc: 'Sensing → MQTT → intelligence → actuation. A complete closed-loop system. ESP32 edge processing, Mosquitto broker, Flask backend, PostgreSQL, React dashboard — all connected.'
  }
]

const leds = [
  { color: '#ffffff', label: 'white', desc: 'device on — no active session. standby mode.', glow: '#aaaaaa' },
  { color: '#EF9F27', label: 'yellow', desc: 'session started — building momentum. under 30 mins.', glow: '#EF9F27' },
  { color: '#4A90D9', label: 'blue', desc: 'momentum growing — 30 to 60 minutes logged.', glow: '#4A90D9' },
  { color: '#639922', label: 'green', desc: 'full flow state — 60+ mins or streak goal hit.', glow: '#639922' },
  { color: '#E24B4A', label: 'red', desc: 'phone detected on desk — session paused. or streak at risk.', glow: '#E24B4A' },
]

const stats = [
  { number: '0', label: 'buttons to press', desc: 'fully passive detection' },
  { number: '5', label: 'led states', desc: 'momentum made visible' },
  { number: '4', label: 'scoring factors', desc: 'momentum algorithm' },
  { number: '∞', label: 'streaks possible', desc: 'consistency is everything' },
]

const trusts = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke="var(--primary)" strokeWidth="2" fill="none"/>
        <line x1="10" y1="10" x2="26" y2="26" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="18" cy="14" r="4" stroke="var(--primary)" strokeWidth="2" fill="none"/>
        <path d="M10 26 Q18 20 26 26" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    title: 'no camera ever',
    desc: 'STRËAK uses infrared heat sensing and distance measurement. No visual data. No images. Ever.'
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="13" y="6" width="10" height="16" rx="5" stroke="var(--primary)" strokeWidth="2" fill="none"/>
        <path d="M8 20 Q8 28 18 28 Q28 28 28 20" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <line x1="18" y1="28" x2="18" y2="32" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="10" x2="26" y2="26" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'no microphone',
    desc: 'Sound is never recorded or processed. The device is completely silent and passive.'
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="13" r="5" stroke="var(--primary)" strokeWidth="2" fill="none"/>
        <path d="M8 30 Q8 22 18 22 Q28 22 28 30" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <rect x="22" y="20" width="10" height="8" rx="2" fill="var(--primary)" opacity="0.2" stroke="var(--primary)" strokeWidth="1.5"/>
        <line x1="25" y1="23" x2="29" y2="23" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="25" y1="26" x2="29" y2="26" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'anonymous by default',
    desc: 'Presence detection is anonymous. The device knows someone is there — not who.'
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="8" y="14" width="20" height="16" rx="3" stroke="var(--primary)" strokeWidth="2" fill="none"/>
        <path d="M13 14 L13 10 Q13 6 18 6 Q23 6 23 10 L23 14" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="18" cy="22" r="3" fill="var(--primary)"/>
      </svg>
    ),
    title: 'your data stays yours',
    desc: 'Session data stored securely in your account only. Never sold, never shared.'
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i === 0 ? features.length - 1 : i - 1))
  const next = () => setCurrent(i => (i === features.length - 1 ? 0 : i + 1))
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 3rem', position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--surface)', backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid var(--border)'
      }}>
        <div style={{ fontFamily: 'var(--font-logo)', fontSize: '28px', color: 'var(--primary)', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          strëak
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[
            { label: 'about', id: 'about' },
            { label: 'how it works', id: 'howitworks' },
            { label: 'features', id: 'features' },
            { label: 'led states', id: 'led' },
          ].map(item => (
            <motion.button key={item.id}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '15px', color: 'var(--text-primary)', padding: '8px 16px',
                borderRadius: '20px', fontFamily: 'var(--font-body)', fontWeight: '600',
                transition: 'color 0.2s', opacity: 0.8
              }}>
              {item.label}
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button className="btn-outline"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', fontSize: '15px' }}>
            log in
          </motion.button>
          <motion.button className="btn-primary"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/signup')}
            style={{ padding: '10px 24px', fontSize: '15px' }}>
            sign up free
          </motion.button>
        </div>
      </nav>

      {/* HERO */}
      <section id="about" style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '6rem 2rem 8rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {[...Array(10)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? '10px' : '6px',
              height: i % 3 === 0 ? '10px' : '6px',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)',
              left: `${8 + i * 8}%`,
              top: `${15 + (i % 4) * 18}%`,
              zIndex: 0, pointerEvents: 'none'
            }} />
        ))}

        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }} style={{ position: 'relative', zIndex: 1 }}>
          <motion.svg width="130" height="130" viewBox="0 0 100 100"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
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
            <rect x="34" y="48" width="32" height="12" rx="3" fill="white" opacity="0.5" />
            <motion.circle cx="50" cy="38" r="7" fill="var(--accent)"
              animate={{ r: [6, 8, 6] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
            <circle cx="50" cy="38" r="3" fill="white" />
          </motion.svg>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-logo)', fontSize: 'clamp(60px, 12vw, 110px)',
            color: 'var(--primary)', lineHeight: 1, position: 'relative', zIndex: 1
          }}>
          strëak
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontFamily: 'var(--font-pixel)', fontSize: 'clamp(18px, 3vw, 26px)',
            color: 'var(--text-primary)', marginTop: '1rem',
            position: 'relative', zIndex: 1, opacity: 0.85
          }}>
          your effort, made visible
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            maxWidth: '580px', color: 'var(--text-primary)', fontSize: '18px',
            lineHeight: 1.8, marginTop: '1.5rem',
            position: 'relative', zIndex: 1, opacity: 0.8
          }}>
          You already study hard. You just have nothing to show for it. STRËAK changes that — it sits on your desk, silently tracks every session, and turns your consistency into something you can actually see and feel proud of.
        </motion.p>

        {/* SINGLE CTA — just one button in hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{ marginTop: '3rem', position: 'relative', zIndex: 1 }}>
          <motion.button className="btn-primary"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/signup')}
            style={{ padding: '18px 48px', fontSize: '19px' }}>
            get started — it's free
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          onClick={() => scrollTo('howitworks')}
          style={{
            marginTop: '5rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px', color: 'var(--primary)',
            zIndex: 1, cursor: 'pointer', opacity: 0.7
          }}>
          <span style={{ fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: '600' }}>scroll to see more</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ fontSize: '20px' }}>↓</motion.div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: 'var(--primary)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '48px', color: 'white', lineHeight: 1 }}>{s.number}</div>
              <div style={{ fontSize: '16px', color: 'white', fontWeight: '700', marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '3px' }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks" style={{ padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.75rem' }}>
            how it works
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '4rem', fontSize: '18px', opacity: 0.8 }}>
            three steps. zero effort from you.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="28" width="32" height="4" rx="2" fill="var(--primary)"/>
                    <rect x="10" y="32" width="4" height="10" rx="2" fill="var(--primary)"/>
                    <rect x="34" y="32" width="4" height="10" rx="2" fill="var(--primary)"/>
                    <circle cx="24" cy="18" r="8" stroke="var(--accent)" strokeWidth="2.5" fill="none"/>
                    <circle cx="24" cy="18" r="3" fill="var(--accent)"/>
                  </svg>
                ),
                step: '01', title: 'sit down',
                desc: 'PIR and IR sensors detect your presence automatically. No buttons. No apps. Just sit at your desk and the system starts itself.'
              },
              {
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="14" stroke="var(--border)" strokeWidth="4" fill="none"/>
                    <motion.circle cx="24" cy="24" r="14" stroke="var(--primary)" strokeWidth="4" fill="none"
                      strokeDasharray="50 38" strokeLinecap="round"
                      style={{ transformOrigin: '24px 24px', transform: 'rotate(-90deg)' }}/>
                    <rect x="20" y="16" width="8" height="2" rx="1" fill="var(--primary)"/>
                    <rect x="20" y="21" width="8" height="2" rx="1" fill="var(--primary)"/>
                    <rect x="20" y="26" width="5" height="2" rx="1" fill="var(--primary)"/>
                  </svg>
                ),
                step: '02', title: 'strëak tracks',
                desc: 'Session timer starts. Momentum builds. Your LED changes colour as effort accumulates. Real time, every second — no interaction needed.'
              },
              {
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <polyline points="8,36 18,24 28,28 40,12" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="40" cy="12" r="4" fill="var(--accent)"/>
                    <line x1="8" y1="42" x2="40" y2="42" stroke="var(--border)" strokeWidth="2"/>
                  </svg>
                ),
                step: '03', title: 'aura grows',
                desc: 'Consistency compounds. Your Aura Score rises. The dashboard reflects every minute of real effort — no fluff, no fake data.'
              },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                style={{
                  padding: '2.5rem', textAlign: 'center',
                  background: 'var(--surface)',
                  border: '2px solid var(--primary)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  position: 'relative'
                }}>
                <div style={{
                  position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--primary)', color: 'white', fontFamily: 'var(--font-pixel)',
                  fontSize: '13px', padding: '4px 14px', borderRadius: '20px'
                }}>{step.step}</div>
                <div style={{ marginBottom: '1.2rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '24px', color: 'var(--primary)', marginBottom: '1rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: 1.8, opacity: 0.85 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CAROUSEL */}
      <section id="features" style={{ padding: '7rem 2rem', background: 'var(--surface-2)' }}>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(26px, 5vw, 46px)', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.75rem' }}>
          what makes strëak different
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '4rem', fontSize: '18px', opacity: 0.8 }}>
          click through to find out
        </motion.p>

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{
                padding: '3.5rem', textAlign: 'center', minHeight: '300px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'var(--surface)', border: '2px solid var(--primary)',
                borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)'
              }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{features[current].icon}</div>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '28px', color: 'var(--primary)', marginBottom: '1.2rem' }}>{features[current].title}</h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '17px', lineHeight: 1.8, maxWidth: '500px', opacity: 0.85 }}>{features[current].desc}</p>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '2rem' }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={prev}
              style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--border)', cursor: 'pointer', fontSize: '22px', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</motion.button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {features.map((_, i) => (
                <motion.div key={i} onClick={() => setCurrent(i)}
                  animate={{ width: i === current ? '24px' : '8px', background: i === current ? 'var(--primary)' : 'var(--border)' }}
                  style={{ height: '8px', borderRadius: '4px', cursor: 'pointer' }} />
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={next}
              style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--border)', cursor: 'pointer', fontSize: '22px', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</motion.button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem', fontFamily: 'var(--font-pixel)', fontSize: '15px', color: 'var(--primary)', opacity: 0.5 }}>
            {current + 1} / {features.length}
          </div>
        </div>
      </section>

      {/* LED STATES */}
      <section id="led" style={{ padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(26px, 4vw, 46px)', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.75rem' }}>
            your desk speaks
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '3.5rem', fontSize: '18px', opacity: 0.8 }}>
            5 LEDs. one lights up at a time. you always know where you stand.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {leds.map((led, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '16px',
                  background: 'var(--surface)',
                  border: `2px solid ${led.color === '#ffffff' ? 'var(--border)' : led.color}`,
                  borderRadius: '16px',
                  boxShadow: `0 4px 20px ${led.glow}22`
                }}>
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: led.color,
                    boxShadow: `0 0 14px ${led.glow}`,
                    flexShrink: 0,
                    border: led.color === '#ffffff' ? '1.5px solid var(--border)' : 'none'
                  }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '17px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '600' }}>{led.label}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, opacity: 0.85 }}>{led.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: '7rem 2rem', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(26px, 4vw, 42px)', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.75rem' }}>
            built to be trusted
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '3.5rem', fontSize: '18px', opacity: 0.8 }}>
            no cameras. no microphones. no face data. just you and your desk.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {trusts.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: '2rem', textAlign: 'center',
                  background: 'var(--surface)',
                  border: '2px solid var(--border)',
                  borderRadius: '18px'
                }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{t.icon}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '17px', color: 'var(--primary)', marginBottom: '0.75rem' }}>{t.title}</div>
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.7, opacity: 0.85 }}>{t.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        padding: '8rem 2rem', textAlign: 'center',
        background: 'var(--primary)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '-60px', width: '500px', height: '500px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(28px, 5vw, 52px)', color: 'white', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
          start your streak today
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ color: 'rgba(255,255,255,0.9)', fontSize: '20px', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
          your effort deserves to be seen.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
          free forever. no credit card. no commitment.
        </motion.p>
        <motion.button className="btn-primary"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/signup')}
          style={{ background: 'white', color: 'var(--primary)', padding: '18px 52px', fontSize: '20px', position: 'relative', zIndex: 1, fontWeight: '700' }}>
          get started free
        </motion.button>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '2.5rem 3rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderTop: '1.5px solid var(--border)',
        flexWrap: 'wrap', gap: '12px', background: 'var(--surface)'
      }}>
        <div style={{ fontFamily: 'var(--font-logo)', fontSize: '24px', color: 'var(--primary)' }}>strëak</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'about', id: 'about' },
            { label: 'how it works', id: 'howitworks' },
            { label: 'features', id: 'features' },
            { label: 'led states', id: 'led' },
          ].map(item => (
            <span key={item.id} onClick={() => scrollTo(item.id)}
              style={{ fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500', opacity: 0.8 }}>
              {item.label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.65, fontWeight: '500' }}>
          built with love by a girl who wanted proof her grind was real.
        </div>
      </footer>

    </div>
  )
}