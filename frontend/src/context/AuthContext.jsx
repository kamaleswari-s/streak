import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Public pages use Majorelle — warm, inviting
// App pages use Neon Noir — dark, focused, serious
const PUBLIC_THEME = 'majorelle'
const APP_THEME = 'neon_noir'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('streak_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('streak_user')
    const savedToken = localStorage.getItem('streak_token')
    if (savedUser && savedToken) {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      setToken(savedToken)
      // user is logged in — apply their saved theme or app default
      document.documentElement.setAttribute('data-theme', parsed.theme || APP_THEME)
    } else {
      // no user — apply public theme
      document.documentElement.setAttribute('data-theme', PUBLIC_THEME)
    }
    setLoading(false)
  }, [])

  const login = (userData, authToken) => {
    // on login — immediately switch to app theme
    const appTheme = userData.theme || APP_THEME
    const updated = { ...userData, theme: appTheme }
    setUser(updated)
    setToken(authToken)
    localStorage.setItem('streak_user', JSON.stringify(updated))
    localStorage.setItem('streak_token', authToken)
    document.documentElement.setAttribute('data-theme', appTheme)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('streak_user')
    localStorage.removeItem('streak_token')
    // back to public theme on logout
    document.documentElement.setAttribute('data-theme', PUBLIC_THEME)
  }

  const updateTheme = (theme) => {
    const updated = { ...user, theme }
    setUser(updated)
    localStorage.setItem('streak_user', JSON.stringify(updated))
    document.documentElement.setAttribute('data-theme', theme)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateTheme, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}