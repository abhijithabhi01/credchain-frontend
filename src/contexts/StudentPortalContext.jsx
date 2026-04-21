import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const StudentPortalContext = createContext(null)

const STORAGE_KEY  = 'studentPortalToken'
const USER_KEY     = 'studentPortalUser'
const REQUESTS_KEY = 'studentPortalRequests'

export function StudentPortalProvider({ children }) {
  const [studentUser,    setStudentUser]    = useState(null)
  const [studentToken,   setStudentToken]   = useState(null)
  const [loadingStudent, setLoadingStudent] = useState(true)
  const [submittedRequestIds, setSubmittedRequestIds] = useState([])

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEY)
      const u = localStorage.getItem(USER_KEY)
      const r = localStorage.getItem(REQUESTS_KEY)
      if (t && u) {
        setStudentToken(t)
        setStudentUser(JSON.parse(u))
      }
      if (r) setSubmittedRequestIds(JSON.parse(r))
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(USER_KEY)
    } finally {
      setLoadingStudent(false)
    }
  }, [])

  const studentLogin = useCallback((token, user) => {
    localStorage.setItem(STORAGE_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setStudentToken(token)
    setStudentUser(user)
  }, [])

  const studentLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(REQUESTS_KEY)
    setStudentToken(null)
    setStudentUser(null)
    setSubmittedRequestIds([])
  }, [])

  const saveRequestIds = useCallback((ids) => {
    setSubmittedRequestIds(prev => {
      const merged = [...new Set([...prev, ...ids])]
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(merged))
      return merged
    })
  }, [])

  return (
    <StudentPortalContext.Provider value={{
      studentUser,
      studentToken,
      loadingStudent,
      isStudentAuthenticated: !!studentToken,
      submittedRequestIds,
      hasSubmittedRequest: submittedRequestIds.length > 0,
      studentLogin,
      studentLogout,
      saveRequestIds,
    }}>
      {children}
    </StudentPortalContext.Provider>
  )
}

export function useStudentPortal() {
  const ctx = useContext(StudentPortalContext)
  if (!ctx) throw new Error('useStudentPortal must be inside StudentPortalProvider')
  return ctx
}