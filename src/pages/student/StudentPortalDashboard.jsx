import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { studentPortalService } from '@/services/api'
import { motion } from 'framer-motion'
import { useStudentPortal } from '@/contexts/StudentPortalContext'
import {
  GraduationCap, FileText, Search, LogOut,
  CheckCircle2, XCircle, ChevronRight, User, BookOpen, Clock,
  AlertCircle, Package, RefreshCw,
} from 'lucide-react'


function Sidebar({ active, onNav, onLogout, student, hasSubmittedRequest, allRequestsTerminal }) {
  const eligible = student?.eligible

  const NAV = [
    { id: 'dashboard', icon: <GraduationCap size={15} />, label: 'Dashboard' },
    // Show "Request Certificate" only if eligible, hasn't submitted yet, OR all previous requests are terminal
    ...(eligible && (!hasSubmittedRequest) ? [
      { id: 'request', icon: <FileText size={15} />, label: 'Request Certificate' },
    ] : []),
    // Show "Track Request" only if a request has been submitted and is not yet terminal
    ...(hasSubmittedRequest && !allRequestsTerminal ? [
      { id: 'status', icon: <Search size={15} />, label: 'Track Request' },
    ] : []),
    // Always show "Track Request" if there are submitted requests (for history)
    ...(hasSubmittedRequest && allRequestsTerminal ? [
      { id: 'status', icon: <Package size={15} />, label: 'View Certificates' },
    ] : []),
  ]

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/[0.06] flex flex-col py-8 px-5 sticky top-0 h-screen">
      <Link className="flex items-center gap-2.5 mb-10">
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

const STATUS_DISPLAY = {
  pending:    { label: 'Pending Review',  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: <Clock size={16} className="text-amber-400" /> },
  processing: { label: 'Under Review',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: <Clock size={16} className="text-blue-400 animate-pulse" /> },
  approved:   { label: 'Approved',       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: <CheckCircle2 size={16} className="text-green-400" /> },
  dispatched: { label: 'Dispatched',     color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <Package size={16} className="text-purple-400" /> },
  completed:  { label: 'Completed',      color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: <CheckCircle2 size={16} className="text-green-400" /> },
  rejected:   { label: 'Rejected',       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: <XCircle size={16} className="text-red-400" /> },
}

function RequestStatusCard({ requestId, token }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!requestId) return
    studentPortalService.getRequestStatus(requestId, token)
      .then(res => setData(res.data?.request ?? res.data))
      .catch(err => setError(err?.response?.data?.message ?? 'Could not load status'))
      .finally(() => setLoading(false))
  }, [requestId])

  if (loading) return (
    <div className="flex items-center gap-2 py-2 text-[12px] text-white/30">
      <Clock size={13} className="animate-spin" /> Loading {requestId}…
    </div>
  )
  if (error) return (
    <div className="flex items-center gap-2 py-2 text-[12px] text-red-400">
      <AlertCircle size={13} /> {requestId}: {error}
    </div>
  )

  const st = STATUS_DISPLAY[data?.status] ?? STATUS_DISPLAY.pending
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${st.bg} ${st.border} mb-2`}>
      <div className="flex items-center gap-3">
        {st.icon}
        <div>
          <p className="text-[12px] font-mono text-white/50">{requestId}</p>
          <p className="text-[11px] text-white/30">{data?.certificateType ?? '—'}</p>
        </div>
      </div>
      <span className={`text-[12px] font-semibold ${st.color}`}>{st.label}</span>
    </div>
  )
}

function DashboardTab({ student, onNav, hasSubmittedRequest, allRequestsTerminal, submittedRequestIds, studentToken, requestStatuses }) {
  const eligible = student?.eligible
  const reason   = student?.eligibilityReason ?? student?.reason

  const info = [
    ['Register Number', student?.registerNumber ?? '—'],
    ['Name',            student?.name           ?? '—'],
    ['Department',      student?.department      ?? student?.course ?? '—'],
    ['Batch',           student?.batch           ?? student?.year   ?? (student?.yearOfCompletion ? String(student.yearOfCompletion) : '—')],
    ['Institution',     student?.institution     ?? student?.college ?? 'KTU'],
  ]

  // Determine which banner to show
  const showEligibilityBanner = !hasSubmittedRequest || allRequestsTerminal
  const showDispatchedBanner  = hasSubmittedRequest && allRequestsTerminal

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[720px]"
    >
      {/* Dispatched / Completed Banner */}
      {showDispatchedBanner && (() => {
        // Determine the dominant terminal status
        const statuses = Object.values(requestStatuses ?? {})
        const isApproved = statuses.length > 0 && statuses.every(s => s === 'approved')
        return isApproved ? (
          <div className="rounded-2xl p-6 mb-6 border bg-green-500/[0.06] border-green-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-500/15">
              <CheckCircle2 size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-[14px] font-semibold mb-1 text-green-400">Certificate Request Completed</p>
              <p className="text-[13px] text-white/50 leading-relaxed">
                Your certificate request has been approved and is now complete.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 mb-6 border bg-purple-500/[0.06] border-purple-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/15">
              <Package size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[14px] font-semibold mb-1 text-purple-400">Certificate(s) Dispatched</p>
              <p className="text-[13px] text-white/50 leading-relaxed">
                Your certificate(s) have been dispatched. Check your email or contact your institution for delivery details.
              </p>
            </div>
          </div>
        )
      })()}

      {/* Eligibility Banner — only when no pending/in-progress request exists */}
      {showEligibilityBanner && !showDispatchedBanner && (
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
      )}

      {/* Active request banner (pending/processing/approved) */}
      {hasSubmittedRequest && !allRequestsTerminal && (
        <div className="rounded-2xl p-6 mb-6 border bg-blue-500/[0.06] border-blue-500/20 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/15">
            <Clock size={20} className="text-blue-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[14px] font-semibold mb-1 text-blue-400">Certificate Request In Progress</p>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Your certificate request is being processed. You will be notified once it's dispatched.
            </p>
          </div>
        </div>
      )}

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
      {/* Show "Request a Certificate" only when eligible and no active (non-terminal) request exists */}
      {eligible && (!hasSubmittedRequest) && (
        <button
          onClick={() => onNav('request')}
          className="btn-shine h-12 px-7 rounded-xl text-[14px] font-semibold text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}
        >
          Request a Certificate <ChevronRight size={16} />
        </button>
      )}

      {/* Show request status cards when there are active requests */}
      {hasSubmittedRequest && !allRequestsTerminal && (
        <div className="bg-[#0a0a0a] border border-[#38bdf8]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center shrink-0">
              <Search size={16} className="text-[#38bdf8]" />
            </div>
            <p className="text-[14px] font-semibold text-white">Your Certificate Requests</p>
          </div>
          <div className="mb-4">
            {submittedRequestIds.map(id => (
              <RequestStatusCard key={id} requestId={id} token={studentToken} />
            ))}
          </div>
          <button
            onClick={() => onNav('status')}
            className="h-10 px-5 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}
          >
            <Search size={14} /> View Full Status Details
          </button>
        </div>
      )}

      {/* Show dispatched/completed certificates summary */}
      {hasSubmittedRequest && allRequestsTerminal && (() => {
        const statuses = Object.values(requestStatuses ?? {})
        const isApproved = statuses.length > 0 && statuses.every(s => s === 'approved')
        return (
          <div className={`bg-[#0a0a0a] border rounded-2xl p-6 ${isApproved ? 'border-green-500/20' : 'border-purple-500/20'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isApproved ? 'bg-green-500/10 border border-green-500/20' : 'bg-purple-500/10 border border-purple-500/20'}`}>
                {isApproved
                  ? <CheckCircle2 size={16} className="text-green-400" />
                  : <Package size={16} className="text-purple-400" />}
              </div>
              <p className="text-[14px] font-semibold text-white">
                {isApproved ? 'Completed Requests' : 'Dispatched Certificates'}
              </p>
            </div>
            <div className="mb-4">
              {submittedRequestIds.map(id => (
                <RequestStatusCard key={id} requestId={id} token={studentToken} />
              ))}
            </div>
            <button
              onClick={() => onNav('status')}
              className="h-10 px-5 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2"
              style={{ background: isApproved ? 'linear-gradient(90deg, #38bdf8, #22c55e)' : 'linear-gradient(90deg, #a855f7, #38bdf8)' }}
            >
              {isApproved
                ? <><CheckCircle2 size={14} /> View Certificate Details</>
                : <><Package size={14} /> View Certificate Details</>}
            </button>
          </div>
        )
      })()}

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
  const { studentUser, studentToken, studentLogout, hasSubmittedRequest, submittedRequestIds, allRequestsTerminal, requestStatuses } = useStudentPortal()
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
        allRequestsTerminal={allRequestsTerminal}
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
            allRequestsTerminal={allRequestsTerminal}
            submittedRequestIds={submittedRequestIds}
            studentToken={studentToken ?? localStorage.getItem('studentPortalToken')}
            requestStatuses={requestStatuses}
          />
        </div>
      </main>
    </div>
  )
}