import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'

export default function Device() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '2rem 2.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '36px', color: 'var(--primary)', marginBottom: '0.5rem' }}>your device</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>connect your physical STRËAK device here.</p>

          <div className="glass" style={{ padding: '3rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <motion.svg width="120" height="120" viewBox="0 0 100 100"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ display: 'block', margin: '0 auto 1.5rem' }}>
              <circle cx="50" cy="8" r="2.5" fill="var(--accent)" opacity="0.4" />
              <circle cx="73" cy="15" r="2.5" fill="var(--accent)" opacity="0.4" />
              <circle cx="27" cy="15" r="2.5" fill="var(--accent)" opacity="0.4" />
              <circle cx="82" cy="38" r="2.5" fill="var(--accent)" opacity="0.4" />
              <circle cx="18" cy="38" r="2.5" fill="var(--accent)" opacity="0.4" />
              <rect x="20" y="62" width="60" height="7" rx="3.5" fill="var(--primary)" />
              <rect x="24" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
              <rect x="70" y="69" width="6" height="16" rx="3" fill="var(--primary)" />
              <rect x="30" y="44" width="40" height="20" rx="5" fill="var(--primary-light)" />
              <circle cx="50" cy="38" r="7" fill="var(--border)" />
              <circle cx="50" cy="38" r="3" fill="white" />
            </motion.svg>

            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {user?.device_name || "my strëak device"}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', background: 'rgba(191,30,98,0.08)', marginBottom: '1.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF9F27' }} />
              <span style={{ fontSize: '14px', color: 'var(--primary)' }}>simulation mode — hardware not connected</span>
            </div>

            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
              your ESP32 device will connect here once it arrives. until then, use the sit down and stand up buttons on the dashboard to simulate sessions. everything works exactly the same.
            </p>

            <div style={{ background: 'rgba(149,213,209,0.1)', border: '1.5px solid var(--accent)', borderRadius: '16px', padding: '1.5rem', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--accent-dark)', marginBottom: '1rem' }}>when your hardware arrives</div>
              {['Flash the STRËAK firmware to your ESP32', 'Connect to the same WiFi network', 'Enter your device token below', 'The device pairs automatically'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px', fontSize: '15px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--accent-dark)', minWidth: '24px' }}>{i + 1}.</div>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}