import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Cursor             from '@/components/Cursor'
import Navbar             from '@/components/layout/Navbar'
import Home               from '@/pages/Home'
import Login              from '@/pages/Login'
import Register           from '@/pages/Register'
import Verify             from '@/pages/Verify'
import AdminDashboard     from '@/pages/AdminDashboard'
import IssuerDashboard    from '@/pages/IssuerDashboard'
import StudentDashboard   from '@/pages/Studentdashboard'
import EmployerDashboard  from '@/pages/Employerdashboard'
import ClaimCertificate   from '@/pages/ClaimCertificate'

const Spinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
  </div>
)

const ROLE_ROUTES = {
  admin: '/admin', issuer: '/issuer', student: '/student', employer: '/employer',
}

const Guard = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading)         return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to={ROLE_ROUTES[user?.role] ?? '/'} replace />
  return children
}

const GuestOnly = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading)          return <Spinner />
  if (isAuthenticated)  return <Navigate to={ROLE_ROUTES[user.role] ?? '/'} replace />
  return children
}

const DASHBOARD_PREFIXES = ['/admin', '/issuer', '/student', '/employer', '/login', '/register', '/claim']

function AppShell() {
  const location    = useLocation()
  const isDashboard = DASHBOARD_PREFIXES.some(p => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-black text-white">
      <Cursor />
      {!isDashboard && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/"       element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/claim"  element={<ClaimCertificate />} />

        {/* Guest only */}
        <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* Protected */}
        <Route path="/admin"    element={<Guard role="admin">   <AdminDashboard />   </Guard>} />
        <Route path="/issuer"   element={<Guard role="issuer">  <IssuerDashboard />  </Guard>} />
        <Route path="/student"  element={<Guard role="student"> <StudentDashboard /> </Guard>} />
        <Route path="/employer" element={<Guard role="employer"><EmployerDashboard /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
