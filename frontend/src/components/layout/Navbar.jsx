import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const links = [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'history', path: '/history' },
    { label: 'analytics', path: '/analytics' },
    { label: 'leaderboard', path: '/leaderboard' },
    { label: 'device', path: '/device' },
    { label: 'settings', path: '/settings' },
  ]

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--surface)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          fontFamily: 'var(--font-logo)',
          fontSize: '26px',
          color: 'var(--primary)',
          cursor: 'pointer'
        }}>
        strëak
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {links.map(link => {
          const active = location.pathname === link.path
          return (
            <motion.button
              key={link.path}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(link.path)}
              style={{
                background: active ? 'var(--primary)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: active ? 'var(--bg)' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontFamily: 'var(--font-body)',
                fontWeight: active ? '600' : '400',
                transition: 'all 0.2s'
              }}>
              {link.label}
            </motion.button>
          )
        })}
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={logout}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--border)',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontFamily: 'var(--font-body)',
            marginLeft: '4px'
          }}>
          log out
        </motion.button>
      </div>
    </nav>
  )
}