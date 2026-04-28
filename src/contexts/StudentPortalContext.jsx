import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { studentPortalService } from '@/services/api'

const StudentPortalContext = createContext(null)

const STORAGE_KEY  = 'studentPortalToken'
const USER_KEY     = 'studentPortalUser'
const REQUESTS_KEY = 'studentPortalRequests'

// Statuses considered "terminal" — no further action needed from student
const TERMINAL_STATUSES = ['dispatched', 'completed']

export function StudentPortalProvider({ children }) {
  const [studentUser,    setStudentUser]    = useState(null)
  const [studentToken,   setStudentToken]   = useState(null)
  const [loadingStudent, setLoadingStudent] = useState(true)
  const [submittedRequestIds, setSubmittedRequestIds] = useState([])

  // Map of requestId -> status string (fetched from backend)
  const [requestStatuses, setRequestStatuses] = useState({})

  // Fetch live statuses for all saved request IDs
  const refreshStatuses = useCallback(async (ids, token) => {
    if (!ids?.length || !token) return
    try {
      const results = await Promise.allSettled(
        ids.map(id => studentPortalService.getRequestStatus(id, token))
      )
      const map = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const req = r.value?.data?.request ?? r.value?.data
          map[ids[i]] = req?.status?.toLowerCase() ?? 'pending'
        }
      })
      setRequestStatuses(map)
    } catch {
      // silently ignore — UI falls back gracefully
    }
  }, [])

useEffect(() => {
  const init = async () => {
    try {
      const t = localStorage.getItem(STORAGE_KEY)
      const u = localStorage.getItem(USER_KEY)

      if (t && u) {
        setStudentToken(t)
        setStudentUser(JSON.parse(u))

        // ✅ THIS LINE WAS MISSING
        const res = await studentPortalService.getMyRequests(t)

        const requests = res.data?.requests || []

        const ids = requests.map(req => req.requestId)

        setSubmittedRequestIds(ids)
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(ids))

        refreshStatuses(ids, t)
      }
    } catch (err) {
      console.error("Init error:", err)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(USER_KEY)
    } finally {
      setLoadingStudent(false)
    }
  }

  init()
}, [refreshStatuses])

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
    setRequestStatuses({})
  }, [])

  const saveRequestIds = useCallback((ids) => {
    setSubmittedRequestIds(prev => {
      const merged = [...new Set([...prev, ...ids])]
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(merged))
      const token = localStorage.getItem(STORAGE_KEY)
      refreshStatuses(merged, token)
      return merged
    })
  }, [refreshStatuses])

  // True only when every submitted request has a terminal status
  const allRequestsTerminal =
    submittedRequestIds.length > 0 &&
    submittedRequestIds.every(id => TERMINAL_STATUSES.includes(requestStatuses[id]))

  return (
    <StudentPortalContext.Provider value={{
      studentUser,
      studentToken,
      loadingStudent,
      isStudentAuthenticated: !!studentToken,
      submittedRequestIds,
      hasSubmittedRequest: submittedRequestIds.length > 0,
      requestStatuses,
      allRequestsTerminal,
      refreshStatuses,
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
