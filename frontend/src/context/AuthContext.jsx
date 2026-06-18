import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('streak_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('streak_user')
    const savedToken = localStorage.getItem('streak_token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('streak_user', JSON.stringify(userData))
    localStorage.setItem('streak_token', authToken)
    document.documentElement.setAttribute('data-theme', userData.theme || 'berry_dreams')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('streak_user')
    localStorage.removeItem('streak_token')
    document.documentElement.removeAttribute('data-theme')
  }

  const updateTheme = (theme) => {
    setUser(prev => ({ ...prev, theme }))
    localStorage.setItem('streak_user', JSON.stringify({ ...user, theme }))
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