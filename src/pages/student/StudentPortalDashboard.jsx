import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStudentPortal } from '@/contexts/StudentPortalContext'
import {
  GraduationCap, FileText, Search, LogOut,
  CheckCircle2, XCircle, ChevronRight, User, BookOpen, Clock,
} from 'lucide-react'

function Sidebar({ active, onNav, onLogout, student, hasSubmittedRequest }) {
  const eligible = student?.eligible

  const NAV = [
    { id: 'dashboard', icon: <GraduationCap size={15} />, label: 'Dashboard' },
    // Show "Request Certificate" only if eligible AND hasn't submitted yet
    ...(eligible && !hasSubmittedRequest ? [
      { id: 'request', icon: <FileText size={15} />, label: 'Request Certificate' },
    ] : []),
    // Show "Track Request" only if a request has been submitted
    ...(hasSubmittedRequest ? [
      { id: 'status', icon: <Search size={15} />, label: 'Track Request' },
    ] : []),
  ]

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/[0.06] flex flex-col py-8 px-5 sticky top-0 h-screen">
      <Link to="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)' }}>⬡</div>
        <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
      </Link>

      <div className="flex-1 flex flex-col gap-1">
        {NAV.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
            style={{
              background: active === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color:      active === item.id ? 'white' : 'rgba(255,255,255,0.35)',
            }}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/30 flex items-center justify-center">
            <User size={14} className="text-[#38bdf8]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-tight truncate">{student?.name ?? 'Student'}</p>
            <p className="text-[11px] text-white/30 font-mono truncate">{student?.registerNumber ?? '—'}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 text-left text-[12px] text-white/25 hover:text-white/60 transition-colors py-1">
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  )
}

function DashboardTab({ student, onNav, hasSubmittedRequest, submittedRequestIds }) {
  const eligible = student?.eligible
  const reason   = student?.eligibilityReason ?? student?.reason

  const info = [
    ['Register Number', student?.registerNumber ?? '—'],
    ['Name',            student?.name           ?? '—'],
    ['Department',      student?.department      ?? student?.course ?? '—'],
    ['Batch',           student?.batch           ?? student?.year   ?? '—'],
    ['Institution',     student?.institution     ?? student?.college ?? 'KTU'],
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[720px]"
    >
      {/* Eligibility Banner */}
      <div className={`rounded-2xl p-6 mb-6 border flex items-start gap-4 ${
        eligible ? 'bg-green-500/[0.06] border-green-500/20' : 'bg-red-500/[0.06] border-red-500/20'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          eligible ? 'bg-green-500/15' : 'bg-red-500/15'
        }`}>
          {eligible
            ? <CheckCircle2 size={20} className="text-green-400" />
            : <XCircle size={20} className="text-red-400" />}
        </div>
        <div>
          <p className={`text-[14px] font-semibold mb-1 ${eligible ? 'text-green-400' : 'text-red-400'}`}>
            {eligible ? 'Eligible to Request Certificates' : 'Not Eligible'}
          </p>
          <p className="text-[13px] text-white/50 leading-relaxed">
            {eligible
              ? 'Your academic records are verified. You can submit a certificate request.'
              : reason ?? 'You do not currently meet the eligibility criteria for certificate requests.'}
          </p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-7 mb-5">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/[0.06]">
          <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center">
            <BookOpen size={20} className="text-[#38bdf8]" />
          </div>
          <div>
            <p className="text-[17px] font-[700]">{student?.name ?? 'Student'}</p>
            <p className="text-[12px] text-white/35 font-mono">{student?.registerNumber}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0">
          {info.map(([k, v]) => (
            <div key={k} className="py-3 border-b border-white/[0.05] pr-6">
              <p className="text-[11px] text-white/30 mb-0.5 uppercase tracking-[0.06em]">{k}</p>
              <p className="text-[13px] text-white/80 font-medium">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA area */}
      {eligible && !hasSubmittedRequest && (
        <button
          onClick={() => onNav('request')}
          className="btn-shine h-12 px-7 rounded-xl text-[14px] font-semibold text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}
        >
          Request a Certificate <ChevronRight size={16} />
        </button>
      )}

      {hasSubmittedRequest && (
        <div className="bg-[#0a0a0a] border border-[#38bdf8]/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-[#38bdf8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white mb-1">Certificate Request Submitted</p>
              <p className="text-[12px] text-white/40 mb-1">Your Degree + Provisional Certificate request is being processed.</p>
              {submittedRequestIds.length > 0 && (
                <p className="text-[11px] text-white/25 font-mono truncate">
                  ID: {submittedRequestIds.join(', ')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onNav('status')}
            className="mt-5 h-11 px-6 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}
          >
            <Search size={14} /> Track Request Status
          </button>
        </div>
      )}

      {!eligible && (
        <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-6 text-center">
          <p className="text-[13px] text-white/40 leading-relaxed">
            If you believe this is an error, please contact your institution's examination department.
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default function StudentPortalDashboard() {
  const { studentUser, studentLogout, hasSubmittedRequest, submittedRequestIds } = useStudentPortal()
  const navigate = useNavigate()

  const [tab, setTab] = (function() {
    const [t, s] = [
      typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get('tab') ?? 'dashboard')
        : 'dashboard',
      (v) => navigate(`/student-portal?tab=${v}`, { replace: true }),
    ]
    return [t, s]
  })()

  const handleNav = (id) => {
    if (id === 'request') { navigate('/student-portal/request'); return }
    if (id === 'status')  { navigate('/student-portal/status');  return }
    setTab(id)
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar
        active={tab}
        onNav={handleNav}
        onLogout={studentLogout}
        student={studentUser}
        hasSubmittedRequest={hasSubmittedRequest}
      />

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-10 h-14 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold">Student Dashboard</h1>
          <span className="text-[12px] text-white/25 font-mono">{studentUser?.registerNumber}</span>
        </div>

        <div className="px-10 py-8">
          <DashboardTab
            student={studentUser}
            onNav={handleNav}
            hasSubmittedRequest={hasSubmittedRequest}
            submittedRequestIds={submittedRequestIds}
          />
        </div>
      </main>
    </div>
  )
}  