import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const features = [
  { icon: '🪑', title: 'zero interaction', desc: 'Sit down. That is it. No app to open, no timer to start, no button to press. STRËAK detects your presence automatically using PIR and ultrasonic sensors.' },
  { icon: '💡', title: 'physically ambient', desc: 'Not a notification. Not a screen. A glowing object that lives on your desk and changes colour based on your momentum. Your brain reads it in 0.5 seconds.' },
  { icon: '📈', title: 'consistency over intensity', desc: '30 minutes every day scores higher than 5 hours once a week. Our momentum algorithm rewards showing up — which is what habit science actually says works.' },
  { icon: '✦', title: 'aura score', desc: 'A composite score built from your streak, consistency, session duration, and peak performance hours. The longer you show up, the more your aura grows.' },
  { icon: '🔒', title: 'privacy by design', desc: 'No camera. No microphone. No face data. Just anonymous presence detection and time. Your data stays yours — always.' },
  { icon: '📡', title: 'full iot architecture', desc: 'Sensing → MQTT → intelligence → actuation. A complete closed-loop system. When hardware arrives, everything connects seamlessly. No rebuild needed.' }
]

const leds = [
  { color: '#888', label: 'dim', desc: 'no session today', glow: '#888' },
  { color: '#EF9F27', label: 'amber', desc: 'building — under 30 mins', glow: '#EF9F27' },
  { color: '#B5D4F4', label: 'cool white', desc: '30–60 mins logged', glow: '#B5D4F4' },
  { color: '#7F77DD', label: 'deep purple', desc: '60+ mins. full flow.', glow: '#7F77DD' },
  { color: '#639922', label: 'pulse green', desc: 'milestone hit', glow: '#639922' },
  { color: '#E24B4A', label: 'slow red', desc: '3 days off. streak at risk.', glow: '#E24B4A' },
]

const stats = [
  { number: '0', label: 'buttons to press', desc: 'fully passive detection' },
  { number: '18', label: 'themes', desc: 'make it yours' },
  { number: '4', label: 'scoring factors', desc: 'momentum algorithm' },
  { number: '∞', label: 'streaks possible', desc: 'consistency is everything' },
]

const trusts = [
  { icon: '🚫📷', title: 'no camera ever', desc: 'STRËAK uses infrared heat sensing and distance measurement. No visual data. No images. Ever.' },
  { icon: '🔇', title: 'no microphone', desc: 'Sound is never recorded or processed. The device is completely silent and passive.' },
  { icon: '👤', title: 'anonymous by default', desc: 'Presence detection is anonymous. The device knows someone is there — not who.' },
  { icon: '🗄️', title: 'your data stays yours', desc: 'Session data is stored securely in your account only. Never sold, never shared.' },
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
                fontSize: '15px', color: 'var(--text-secondary)', padding: '8px 16px',
                borderRadius: '20px', fontFamily: 'var(--font-body)', fontWeight: '500',
                transition: 'color 0.2s'
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

      {/* HERO — ABOUT */}
      <section id="about" style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '6rem 2rem 8rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {[...Array(10)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -12, 0], opacity: [0.15, 0.45, 0.15] }}
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
            <motion.circle cx="50" cy="16" r="2.5" fill="var(--primary-light)"
              animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
            <motion.circle cx="66" cy="22" r="2.5" fill="var(--primary-light)"
              animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <motion.circle cx="34" cy="22" r="2.5" fill="var(--primary-light)"
              animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.7 }} />
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
            color: 'var(--text-secondary)', marginTop: '1rem', position: 'relative', zIndex: 1
          }}>
          your effort, made visible
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            maxWidth: '580px', color: 'var(--text-secondary)', fontSize: '18px',
            lineHeight: 1.8, marginTop: '1.5rem', position: 'relative', zIndex: 1
          }}>
          You already study hard. You just have nothing to show for it. STRËAK changes that — it sits on your desk, silently tracks every session, and turns your consistency into something you can actually see and feel proud of.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{ display: 'flex', gap: '16px', marginTop: '3rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.button className="btn-primary"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/signup')}
            style={{ padding: '16px 40px', fontSize: '18px' }}>
            get started — it's free
          </motion.button>
          <motion.button className="btn-outline"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{ padding: '16px 40px', fontSize: '18px' }}>
            log in
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          onClick={() => scrollTo('howitworks')}
          style={{
            marginTop: '5rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px', color: 'var(--primary)',
            opacity: 0.5, zIndex: 1, cursor: 'pointer'
          }}>
          <span style={{ fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: '500' }}>scroll to see more</span>
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
              <div style={{ fontSize: '16px', color: 'white', fontWeight: '600', marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks" style={{ padding: '7rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.75rem' }}>
          how it works
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '4rem', fontSize: '18px' }}>
          three steps. zero effort from you.
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🪑', step: '01', title: 'sit down', desc: 'PIR + ultrasonic sensors detect your presence automatically. No buttons. No apps. Just sit at your desk and the system starts itself.' },
            { icon: '✦', step: '02', title: 'strëak tracks', desc: 'Session timer starts. Momentum builds. Your LED device shifts from dim to glowing as effort accumulates. Real time, every second.' },
            { icon: '📈', step: '03', title: 'aura grows', desc: 'Consistency compounds. Your Aura Score rises. The dashboard reflects every minute of real effort — no fluff, no fake data.' },
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
                boxShadow: '0 4px 24px rgba(96,96,210,0.1)',
                position: 'relative'
              }}>
              <div style={{
                position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--primary)', color: 'white', fontFamily: 'var(--font-pixel)',
                fontSize: '13px', padding: '4px 14px', borderRadius: '20px'
              }}>{step.step}</div>
              <div style={{ fontSize: '48px', marginBottom: '1.2rem', marginTop: '0.5rem' }}>{step.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '24px', color: 'var(--primary)', marginBottom: '1rem' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.8 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURE CAROUSEL */}
      <section id="features" style={{ padding: '7rem 2rem', background: 'var(--surface-2)' }}>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(26px, 5vw, 46px)', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.75rem' }}>
          what makes strëak different
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '4rem', fontSize: '18px' }}>
          swipe through to find out
        </motion.p>

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{
                padding: '3.5rem', textAlign: 'center', minHeight: '280px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'var(--surface)', border: '2px solid var(--primary)',
                borderRadius: '24px', boxShadow: '0 8px 40px rgba(96,96,210,0.12)'
              }}>
              <div style={{ fontSize: '56px', marginBottom: '1.5rem' }}>{features[current].icon}</div>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '28px', color: 'var(--primary)', marginBottom: '1.2rem' }}>{features[current].title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: 1.8, maxWidth: '500px' }}>{features[current].desc}</p>
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

          <div style={{ textAlign: 'center', marginTop: '1rem', fontFamily: 'var(--font-pixel)', fontSize: '15px', color: 'var(--primary)', opacity: 0.4 }}>
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
            style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3.5rem', fontSize: '18px' }}>
            the LED glow changes with your momentum. no explanation needed.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {leds.map((led, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '16px',
                  background: 'var(--surface)', border: `2px solid ${led.color}`,
                  borderRadius: '16px', boxShadow: `0 4px 20px ${led.glow}22`
                }}>
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', background: led.color, boxShadow: `0 0 14px ${led.glow}`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '17px', color: 'var(--primary)', marginBottom: '3px' }}>{led.label}</div>
                  <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{led.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section style={{ padding: '7rem 2rem', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(26px, 4vw, 42px)', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.75rem' }}>
            built to be trusted
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3.5rem', fontSize: '18px' }}>
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
                <div style={{ fontSize: '36px', marginBottom: '1rem' }}>{t.icon}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '17px', color: 'var(--primary)', marginBottom: '0.75rem' }}>{t.title}</div>
                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.desc}</div>
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
          style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
          your effort deserves to be seen.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
          free forever. no credit card. no commitment.
        </motion.p>
        <motion.button className="btn-primary"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/signup')}
          style={{ background: 'white', color: 'var(--primary)', padding: '18px 52px', fontSize: '20px', position: 'relative', zIndex: 1 }}>
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
          {['about', 'how it works', 'features', 'led states'].map(item => (
            <span key={item} onClick={() => scrollTo(item.replace(' ', ''))}
              style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.7 }}>
              {item}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', opacity: 0.5 }}>
          built with love by a girl who wanted proof her grind was real.
        </div>
      </footer>

    </div>
  )
}