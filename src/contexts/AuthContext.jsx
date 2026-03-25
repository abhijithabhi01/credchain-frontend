import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token')
      if (!token) { setLoading(false); return }
      try {
        const res = await authService.getProfile()
        setUser(res.data.user)
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const register = useCallback(async (userData) => {
    const res = await authService.register(userData)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    setUser(user)
    return { user, token }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    setUser(user)
    return { user, token }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  // ✅ Used by ClaimCertificate to swap sessions atomically.
  // Sets both the localStorage token AND the in-memory user at once,
  // so there's zero window where the old user is in context with the new token.
  const setSession = useCallback((token, userData) => {
    localStorage.removeItem('token')   // clear old token first
    localStorage.setItem('token', token)
    setUser(userData)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated: !!user,
      register, login, logout,
      setSession,   // ← expose for claim flow
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}