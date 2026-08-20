import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function OledStatusPopup({ data, forceOpen }) {
  const isAlert = data.phoneAlerted || data.aqiAlerted
  const isSettling = data.session === 'settling'
  const expanded = forceOpen || isSettling || isAlert

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 997 }}>
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div key="popup"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="glass"
            style={{
              width: '260px', padding: '1.25rem',
              borderLeft: `4px solid ${isAlert ? 'var(--accent)' : 'var(--primary)'}`
            }}>
            <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.6, marginBottom: '8px', letterSpacing: '1px' }}>
              STRËAK LIVE
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--primary)', marginBottom: '10px' }}>
              {data.sessionText}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>ir: {data.ir}  pir: {data.pir}</div>
              <div>gas value: {data.aqi}</div>
              <div>temp: {data.temp}  hum: {data.hum}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                led:
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: data.led, display: 'inline-block' }} />
                {data.ledName}
              </div>
              <div>speaker: {data.lastVoice}</div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.08 }}
            className="glass"
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
            onClick={() => {}}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: data.led }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- demo harness, tonight only, to actually see it work ---
export default function OledPopupDemo() {
  const [state, setState] = useState('idle')

  const demoData = {
    idle:    { session: 'active', sessionText: '4:12 active', ir: 1, pir: 0, aqi: 812, temp: 27.4, hum: 55, led: '#EF9F27', ledName: 'yellow', lastVoice: 'Session started', phoneAlerted: false, aqiAlerted: false },
    settle:  { session: 'settling', sessionText: 'getting ready 42s', ir: 1, pir: 1, aqi: 790, temp: 27.2, hum: 54, led: '#ffffff', ledName: 'white', lastVoice: '-', phoneAlerted: false, aqiAlerted: false },
    phone:   { session: 'active', sessionText: 'phone detected', ir: 1, pir: 0, aqi: 800, temp: 27.4, hum: 55, led: '#e04545', ledName: 'red', lastVoice: 'Object detected', phoneAlerted: true, aqiAlerted: false },
    badair:  { session: 'active', sessionText: '12:03 active', ir: 1, pir: 0, aqi: 1950, temp: 29.1, hum: 61, led: '#4A90D9', ledName: 'blue', lastVoice: 'Air quality bad', phoneAlerted: false, aqiAlerted: true },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        <button className="btn-outline" onClick={() => setState('settle')}>settling</button>
        <button className="btn-outline" onClick={() => setState('idle')}>normal (collapsed)</button>
        <button className="btn-outline" onClick={() => setState('phone')}>phone detected</button>
        <button className="btn-outline" onClick={() => setState('badair')}>bad air quality</button>
      </div>
      <OledStatusPopup data={demoData[state]} />
    </div>
  )
}