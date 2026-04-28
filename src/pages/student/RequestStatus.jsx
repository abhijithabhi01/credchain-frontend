import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { studentPortalService } from '@/services/api'
import { useStudentPortal } from '@/contexts/StudentPortalContext'
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  Clock, XCircle, Link2, Package, ExternalLink, RefreshCw, GraduationCap,
} from 'lucide-react'

const STATUS_CONFIG = {
  pending: {
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    icon: <Clock size={20} className="text-amber-400" />, label: 'Pending Review',
  },
  processing: {
    color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    icon: <Loader2 size={20} className="text-blue-400 animate-spin" />, label: 'Processing',
  },
  approved: {
    color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20',
    icon: <CheckCircle2 size={20} className="text-green-400" />, label: 'Approved',
  },
  dispatched: {
    color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
    icon: <Package size={20} className="text-purple-400" />, label: 'Dispatched',
  },
  completed: {
    color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20',
    icon: <CheckCircle2 size={20} className="text-green-400" />, label: 'Completed',
  },
  issued: {
    color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20',
    icon: <GraduationCap size={20} className="text-green-400" />, label: 'Certificate Issued',
  },
  rejected: {
    color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20',
    icon: <XCircle size={20} className="text-red-400" />, label: 'Rejected',
  },
}

function InfoRow({ label, value, mono, href }) {
  if (!value || value === '—') return null
  return (
    <div className="flex justify-between items-start py-3.5 border-b border-white/[0.05] last:border-0 text-[13px] gap-4">
      <span className="text-white/35 shrink-0">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="text-[#38bdf8]/70 hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 font-medium">
          {mono ? <span className="font-mono text-right break-all">{value}</span> : value}
          <ExternalLink size={11} />
        </a>
      ) : (
        <span className={`text-white/70 text-right break-all ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
      )}
    </div>
  )
}

function Timeline({ status }) {
  const STAGES = [
    { key: 'pending',    label: 'Request Received', desc: 'Your request is queued for review' },
    { key: 'processing', label: 'Under Review',      desc: 'Verification in progress' },
    { key: 'approved',   label: 'Approved',          desc: 'Request approved by institution' },
    { key: 'dispatched', label: 'Dispatched',        desc: 'Certificate has been dispatched' },
    { key: 'issued',     label: 'Issued',            desc: 'Certificate issued on blockchain' },
    { key: 'completed',  label: 'Delivered',         desc: 'Certificate delivered successfully' },
  ]
  const ORDER    = ['pending', 'processing', 'approved', 'dispatched', 'issued', 'completed']
  const normalised = status?.toLowerCase() ?? 'pending'
  const curIndex = ORDER.indexOf(normalised)

  return (
    <div className="space-y-0">
      {STAGES.map((s, i) => {
        const done    = i <= curIndex
        const current = i === curIndex
        return (
          <div key={s.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border transition-all ${
                done ? 'border-[#38bdf8]/50 bg-[#38bdf8]/15 text-[#38bdf8]' : 'border-white/[0.08] bg-transparent text-white/20'
              }`}>
                {i < curIndex ? '✓' : i + 1}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`w-px flex-1 my-1 ${i < curIndex ? 'bg-[#38bdf8]/30' : 'bg-white/[0.06]'}`} style={{ minHeight: 24 }} />
              )}
            </div>
            <div className="pb-5 pt-1.5">
              <p className={`text-[13px] font-semibold mb-0.5 ${done ? (current ? 'text-white' : 'text-white/60') : 'text-white/20'}`}>
                {s.label}
                {current && <span className="ml-2 text-[10px] font-medium text-[#38bdf8] uppercase tracking-wider">← Current</span>}
              </p>
              <p className={`text-[12px] ${done ? 'text-white/35' : 'text-white/15'}`}>{s.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// One request card
function RequestCard({ requestId, token }) {
  const [loading, setLoading] = useState(true)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const fetch = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await studentPortalService.getRequestStatus(requestId, token)
      setResult(res.data?.request ?? res.data)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Could not load status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [requestId])

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 flex items-center justify-center gap-3">
        <Loader2 size={18} className="animate-spin text-white/30" />
        <span className="text-[13px] text-white/30">Loading {requestId}…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
        <AlertCircle size={16} className="text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-mono text-white/40 truncate">{requestId}</p>
          <p className="text-[13px] text-red-400">{error}</p>
        </div>
        <button onClick={fetch} className="text-[12px] text-white/30 hover:text-white flex items-center gap-1">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[result?.status?.toLowerCase()] ?? STATUS_CONFIG.pending

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-3 gap-5"
    >
      {/* Left: Status + Details */}
      <div className="col-span-2 flex flex-col gap-4">
        <div className={`rounded-2xl p-6 border flex items-start gap-4 ${cfg.bg} ${cfg.border}`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-[11px] text-white/30 uppercase tracking-[0.1em] mb-1">Current Status</p>
            <p className={`text-[20px] font-[800] tracking-[-0.03em] ${cfg.color}`}>{cfg.label}</p>
          </div>
          <button onClick={fetch} className="ml-auto text-white/20 hover:text-white/60 transition-colors p-1">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-7">
          <p className="text-[11px] text-white/30 uppercase tracking-[0.1em] mb-5">Request Details</p>
          <InfoRow label="Request ID"       value={result?.requestId ?? result?._id} mono />
          <InfoRow label="Certificate Type" value={result?.certificateType} />
          <InfoRow label="Submitted"        value={(result?.submittedAt ?? result?.createdAt)
            ? new Date(result.submittedAt ?? result.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : '—'} />
          <InfoRow label="Register Number"  value={result?.registerNumber} mono />
        </div>

        {(result?.blockchain?.txHash ?? result?.txHash ?? result?.blockchain?.certId ?? result?.certId) && (
          <div className="bg-[#0a0a0a] border border-[#38bdf8]/15 rounded-2xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <Link2 size={14} className="text-[#38bdf8]/60" />
              <p className="text-[11px] text-[#38bdf8]/60 uppercase tracking-[0.1em]">Blockchain Record</p>
            </div>
            <InfoRow label="Transaction Hash"
              value={result?.blockchain?.txHash ?? result?.txHash}
              mono
              href={(result?.blockchain?.txHash ?? result?.txHash)
                ? `https://sepolia.etherscan.io/tx/${result.blockchain?.txHash ?? result.txHash}`
                : undefined}
            />
            <InfoRow label="Certificate ID" value={result?.blockchain?.certId ?? result?.blockchainCertId ?? result?.certId} mono />
            <InfoRow label="IPFS Hash" value={result?.blockchain?.ipfsHash ?? result?.ipfsHash} mono />
          </div>
        )}
      </div>

      {/* Right: Timeline */}
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-7 self-start">
        <p className="text-[11px] text-white/30 uppercase tracking-[0.1em] mb-6">Progress</p>
        <Timeline status={result?.status} />
      </div>
    </motion.div>
  )
}

export default function RequestStatus() {
  const { studentToken, submittedRequestIds } = useStudentPortal()
  const token = studentToken ?? localStorage.getItem('studentPortalToken')

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(56,189,248,0.06) 0%, transparent 60%)' }} />

      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link  className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)' }}>⬡</div>
            <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
          </Link>
          <span className="text-white/15">|</span>
          <span className="text-[13px] text-white/40">Request Status</span>
        </div>
        <Link to="/student-portal">
          <button className="h-8 px-4 rounded-full border border-white/[0.1] text-[12px] text-white/40 hover:text-white/70 transition-all flex items-center gap-1.5">
            <ArrowLeft size={12} /> Dashboard
          </button>
        </Link>
      </div>

      <div className="max-w-[1000px] mx-auto px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-[32px] font-[800] tracking-[-0.04em] mb-2">Certificate Request Status</h1>
          <p className="text-[14px] text-white/40 mb-10">
            Showing live status for your submitted certificate requests.
          </p>
        </motion.div>

        {submittedRequestIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-5">
              <Clock size={24} className="text-white/20" />
            </div>
            <p className="text-[15px] font-medium text-white/30 mb-2">No requests submitted yet</p>
            <p className="text-[13px] text-white/20 mb-6">
              Submit a certificate request from your dashboard to track it here.
            </p>
            <Link to="/student-portal">
              <button className="h-10 px-5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
                Go to Dashboard
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {submittedRequestIds.map(id => (
              <div key={id}>
                <p className="text-[11px] text-white/25 uppercase tracking-[0.08em] mb-4 font-mono">{id}</p>
                <RequestCard requestId={id} token={token} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}