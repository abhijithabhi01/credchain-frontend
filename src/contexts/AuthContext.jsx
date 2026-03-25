import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Restore session on mount ──────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token')
      if (!token) { setLoading(false); return }
      try {
        const res = await authService.getProfile()   // GET /api/auth/me
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

  // ── register → POST /api/auth/register ───────────────────
  const register = useCallback(async (userData) => {
    const res = await authService.register(userData)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    setUser(user)
    return { user, token }
  }, [])

  // ── login → POST /api/auth/login ─────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    setUser(user)
    return { user, token }
  }, [])

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}