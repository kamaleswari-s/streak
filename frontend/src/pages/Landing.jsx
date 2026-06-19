import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const features = [
  {
    icon: '🪑',
    title: 'zero interaction',
    desc: 'Sit down. That is it. No app to open, no timer to start, no button to press. STRËAK detects your presence automatically using PIR and ultrasonic sensors.',
    color: '#BF1E62'
  },
  {
    icon: '💡',
    title: 'physically ambient',
    desc: 'Not a notification. Not a screen. A glowing object that lives on your desk and changes colour based on your momentum. Your brain reads it in 0.5 seconds.',
    color: '#95D5D1'
  },
  {
    icon: '📈',
    title: 'consistency over intensity',
    desc: '30 minutes every day scores higher than 5 hours once a week. Our momentum algorithm rewards showing up — which is what habit science actually says works.',
    color: '#BF1E62'
  },
  {
    icon: '✦',
    title: 'aura score',
    desc: 'A composite score built from your streak, consistency, session duration, and peak performance hours. The longer you show up, the more your aura grows.',
    color: '#95D5D1'
  },
  {
    icon: '🔒',
    title: 'privacy by design',
    desc: 'No camera. No microphone. No face data. Just anonymous presence detection and time. Your data stays yours — always.',
    color: '#BF1E62'
  },
  {
    icon: '📡',
    title: 'full iot architecture',
    desc: 'Sensing → MQTT → intelligence → actuation. A complete closed-loop system. When hardware arrives, everything connects seamlessly. No rebuild needed.',
    color: '#95D5D1'
  }
]

export default function Landing() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i === 0 ? features.length - 1 : i - 1))
  const next = () => setCurrent(i => (i === features.length - 1 ? 0 : i + 1))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(254,240,244,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          fontFamily: 'var(--font-logo)',
          fontSize: '32px',
          color: 'var(--primary)'
        }}>strëak</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline"
            onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', fontSize: '15px' }}>
            log in
          </button>
          <button className="btn-primary"
            onClick={() => navigate('/signup')}
            style={{ padding: '10px 24px', fontSize: '15px' }}>
            get started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '6rem 2rem 8rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* background blobs — bigger and more of them */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '600px', height: '600px',
          background: 'var(--primary-light)',
          borderRadius: '50%', filter: 'blur(100px)',
          opacity: 0.35, zIndex: 0, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: '500px', height: '500px',
          background: 'var(--accent)',
          borderRadius: '50%', filter: 'blur(100px)',
          opacity: 0.3, zIndex: 0, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translateX(-50%)',
          width: '700px', height: '300px',
          background: 'var(--primary)',
          borderRadius: '50%', filter: 'blur(120px)',
          opacity: 0.08, zIndex: 0, pointerEvents: 'none'
        }} />

        {/* floating dots decoration */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? '10px' : '6px',
              height: i % 3 === 0 ? '10px' : '6px',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)',
              left: `${8 + i * 7.5}%`,
              top: `${15 + (i % 4) * 20}%`,
              zIndex: 0, pointerEvents: 'none'
            }}
          />
        ))}

        {/* logo icon */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.svg
            width="140" height="140" viewBox="0 0 100 100"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.circle cx="50" cy="8" r="2.5" fill="var(--accent)"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
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
            <motion.circle cx="50" cy="16" r="2.5" fill="var(--primary-light)"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
            <motion.circle cx="66" cy="22" r="2.5" fill="var(--primary-light)"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <motion.circle cx="34" cy="22" r="2.5" fill="var(--primary-light)"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.7 }} />
            <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" />
            <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
            <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
            <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" />
            <rect x="34" y="48" width="32" height="12" rx="3" fill="white" opacity="0.5" />
            <motion.circle cx="50" cy="38" r="7" fill="var(--accent)"
              animate={{ r: [6, 8, 6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
            <circle cx="50" cy="38" r="3" fill="white" />
          </motion.svg>
        </motion.div>

        {/* wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-logo)',
            fontSize: 'clamp(64px, 12vw, 120px)',
            color: 'var(--primary)',
            lineHeight: 1,
            position: 'relative',
            zIndex: 1
          }}>
          strëak
        </motion.div>

        {/* tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(18px, 3vw, 28px)',
            color: 'var(--text-secondary)',
            marginTop: '1.2rem',
            position: 'relative',
            zIndex: 1
          }}>
          your effort, made visible
        </motion.div>

        {/* description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            maxWidth: '580px',
            color: 'var(--text-secondary)',
            fontSize: '18px',
            lineHeight: 1.8,
            marginTop: '1.5rem',
            position: 'relative',
            zIndex: 1
          }}>
          A physical desk device that passively detects when you study and transforms your effort into a living, glowing momentum signature. No apps. No timers. No interaction required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            display: 'flex', gap: '16px',
            marginTop: '3rem',
            position: 'relative', zIndex: 1,
            flexWrap: 'wrap', justifyContent: 'center'
          }}>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/signup')}
            style={{ padding: '16px 36px', fontSize: '18px' }}>
            start farming aura
          </motion.button>
          <motion.button
            className="btn-outline"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{ padding: '16px 36px', fontSize: '18px' }}>
            already have an account
          </motion.button>
        </motion.div>

        {/* scroll hint — fixed at bottom, won't overlap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{
            marginTop: '4rem',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px',
            color: 'var(--primary)', opacity: 0.45,
            zIndex: 1
          }}>
          <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)' }}>scroll to see more</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}>
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        padding: '7rem 2rem',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            color: 'var(--primary)',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
          how it works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '4rem',
            fontSize: '18px'
          }}>
          three steps. zero effort from you.
        </motion.p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '28px'
        }}>
          {[
            {
              icon: '🪑',
              title: 'sit down',
              desc: 'PIR + ultrasonic sensors detect your presence automatically. No buttons. No apps. Just sit at your desk.',
              delay: 0
            },
            {
              icon: '✦',
              title: 'strëak tracks',
              desc: 'Session timer starts. Momentum builds. Your LED device shifts from dim to glowing as effort accumulates.',
              delay: 0.15
            },
            {
              icon: '📈',
              title: 'aura grows',
              desc: 'Consistency compounds. Your Aura Score rises. The dashboard reflects every minute of real effort — no fluff.',
              delay: 0.3
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              className="glass"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.delay }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              style={{ padding: '2.5rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '48px', marginBottom: '1.2rem' }}>{step.icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '26px',
                color: 'var(--primary)',
                marginBottom: '1rem'
              }}>{step.title}</h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '17px',
                lineHeight: 1.8
              }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURE CAROUSEL */}
      <section style={{
        padding: '7rem 2rem',
        background: 'rgba(255,255,255,0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px',
          background: 'var(--accent)',
          borderRadius: '50%', filter: 'blur(100px)',
          opacity: 0.2, pointerEvents: 'none'
        }} />

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(30px, 5vw, 50px)',
            color: 'var(--primary)',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
          what makes strëak different
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '4rem',
            fontSize: '18px'
          }}>
          swipe through to find out
        </motion.p>

        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          position: 'relative'
        }}>
          {/* carousel card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="glass"
              style={{
                padding: '3.5rem',
                textAlign: 'center',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ fontSize: '56px', marginBottom: '1.5rem' }}>
                {features[current].icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '30px',
                color: 'var(--primary)',
                marginBottom: '1.2rem'
              }}>
                {features[current].title}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '18px',
                lineHeight: 1.8,
                maxWidth: '520px'
              }}>
                {features[current].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* arrows */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            marginTop: '2rem'
          }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prev}
              style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                cursor: 'pointer',
                fontSize: '22px',
                color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              ←
            </motion.button>

            {/* dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {features.map((_, i) => (
                <motion.div
                  key={i}
                  onClick={() => setCurrent(i)}
                  animate={{
                    width: i === current ? '24px' : '8px',
                    background: i === current ? 'var(--primary)' : 'var(--primary-light)'
                  }}
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                cursor: 'pointer',
                fontSize: '22px',
                color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              →
            </motion.button>
          </div>

          {/* counter */}
          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            fontFamily: 'var(--font-pixel)',
            fontSize: '16px',
            color: 'var(--primary)',
            opacity: 0.5
          }}>
            {current + 1} / {features.length}
          </div>
        </div>
      </section>

      {/* LED STATES */}
      <section style={{ padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: 'var(--primary)',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
            your desk speaks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginBottom: '3.5rem',
              fontSize: '18px'
            }}>
            the LED glow changes with your momentum. no explanation needed.
          </motion.p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px'
          }}>
            {[
              { color: '#888', label: 'dim', desc: 'no session today', glow: '#888' },
              { color: '#EF9F27', label: 'amber', desc: 'building — under 30 mins', glow: '#EF9F27' },
              { color: '#B5D4F4', label: 'cool white', desc: '30–60 mins logged', glow: '#B5D4F4' },
              { color: '#7F77DD', label: 'deep purple', desc: '60+ mins. full flow.', glow: '#7F77DD' },
              { color: '#639922', label: 'pulse green', desc: 'milestone hit', glow: '#639922' },
              { color: '#E24B4A', label: 'slow red', desc: '3 days off. streak at risk.', glow: '#E24B4A' },
            ].map((led, i) => (
              <motion.div
                key={i}
                className="glass"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  style={{
                    width: '22px', height: '22px',
                    borderRadius: '50%',
                    background: led.color,
                    boxShadow: `0 0 16px ${led.glow}`,
                    flexShrink: 0
                  }} />
                <div>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '18px',
                    color: 'var(--primary)',
                    marginBottom: '4px'
                  }}>{led.label}</div>
                  <div style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5
                  }}>{led.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        padding: '8rem 2rem',
        textAlign: 'center',
        background: 'var(--primary)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '400px', height: '400px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-60px',
          width: '500px', height: '500px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            color: 'white',
            marginBottom: '1.2rem',
            position: 'relative', zIndex: 1
          }}>
          start your streak today
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '20px',
            marginBottom: '3rem',
            position: 'relative', zIndex: 1
          }}>
          your effort deserves to be seen.
        </motion.p>
        <motion.button
          className="btn-primary"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/signup')}
          style={{
            background: 'white',
            color: 'var(--primary)',
            padding: '18px 48px',
            fontSize: '20px',
            position: 'relative', zIndex: 1
          }}>
          get started — it's free
        </motion.button>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '2.5rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          fontFamily: 'var(--font-logo)',
          fontSize: '26px',
          color: 'var(--primary)'
        }}>strëak</div>
        <div style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          opacity: 0.7
        }}>built with love by a girl who wanted proof her grind was real.</div>
      </footer>

    </div>
  )
}