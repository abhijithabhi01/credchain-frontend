import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { issuerService } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import {
  CheckCircle2, XCircle, Clock, Loader2, RefreshCw,
  ChevronDown, AlertCircle, Package, FileCheck, Upload, X,
} from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────
const DEGREE_GROUPS = [
  { group: 'Computer Applications', degrees: ['MCA — Master of Computer Applications'] }
]
const GRADES    = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F']
const EMPTY_FORM = {
  studentName: '', studentEmail: '', courseSelected: '',
  courseCustom: '', yearOfCompletion: new Date().getFullYear().toString(),
  grade: '', cgpa: '',
}

const fmt = ts =>
  ts ? new Date(ts).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

const REQUEST_STATUS = {
  pending:    { label: 'Pending',    color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: <Clock size={14} className="text-amber-400" /> },
  processing: { label: 'Processing', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: <Loader2 size={14} className="text-blue-400 animate-spin" /> },
  approved:   { label: 'Approved',   color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: <CheckCircle2 size={14} className="text-green-400" /> },
  rejected:   { label: 'Rejected',   color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: <XCircle size={14} className="text-red-400" /> },
  dispatched: { label: 'Dispatched', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <Package size={14} className="text-purple-400" /> },
}

// ── Helpers ───────────────────────────────────────────────────
function Spin({ size = 5, color = 'border-t-white' }) {
  return <div className={`w-${size} h-${size} rounded-full border-2 border-white/20 ${color} animate-spin`} />
}

const iCls = 'w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[14px] placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.06em] uppercase text-white/30 mb-2">{label}</label>
      {children}
    </div>
  )
}

function Step({ n, done, active, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
        done   ? 'bg-green-500/20 border-green-500/40 text-green-400'
        : active ? 'bg-[#a855f7]/20 border-[#a855f7]/40 text-[#a855f7]'
        : 'bg-white/[0.04] border-white/[0.1] text-white/25'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-[12px] font-medium ${done ? 'text-green-400' : active ? 'text-white/70' : 'text-white/25'}`}>
        {label}
      </span>
    </div>
  )
}

// ── Approve Upload Modal ──────────────────────────────────────
// Shown when the issuer clicks "Approve" on a processing request.
// The issuer picks the certificate PDF here; on submit the frontend
// calls PATCH /certificate-requests/:id/status with multipart/form-data
// containing status=approved + the PDF file.
function ApproveModal({ req, onClose, onApprove }) {
  const [pdfFile,   setPdfFile]   = useState(null)
  const [drag,      setDrag]      = useState(false)
  const [busy,      setBusy]      = useState(false)
  const [error,     setError]     = useState('')
  const fileInputRef = useRef(null)

  const student = req.student

  const handleFile = (file) => {
    setError('')
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.')
      return
    }
    setPdfFile(file)
  }

  const handleSubmit = async () => {
    if (!pdfFile) { setError('Please select the certificate PDF before approving.'); return }
    setBusy(true)
    setError('')
    try {
      await onApprove(req._id, pdfFile)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Approval failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={() => !busy && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#0f0f0f] border border-white/[0.1] rounded-2xl p-6 sm:p-8 w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-green-400" />
              </div>
              <h2 className="text-[17px] font-[700]">Approve Request</h2>
            </div>
            <p className="text-[12px] text-white/35 ml-9">
              Upload the signed certificate PDF — it will be issued to IPFS,
              recorded on the blockchain, and emailed to the student.
            </p>
          </div>
          <button onClick={onClose} disabled={busy}
            className="text-white/30 hover:text-white transition-colors p-1 disabled:opacity-40 ml-3 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Student info summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-sm shrink-0">
              {student?.documents?.find(d => d.type === 'photo')?.dataUri
                ? <img src={student.documents.find(d => d.type === 'photo').dataUri} alt="Photo" className="w-full h-full object-cover rounded-full" />
                : '👤'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate">{student?.name ?? req.registerNumber}</p>
              <p className="text-[11px] text-white/35 truncate">{req.email} · {req.certificateType}</p>
            </div>
            <div className="ml-auto shrink-0 text-right">
              <p className="text-[10px] text-white/25 uppercase tracking-wide">Reg No.</p>
              <p className="text-[12px] font-mono text-white/60">{req.registerNumber}</p>
            </div>
          </div>
          {student?.cgpa != null && (
            <div className="mt-3 pt-3 border-t border-white/[0.05] flex gap-4 text-[11px]">
              <span className="text-white/30">CGPA <span className="text-[#38bdf8] font-semibold">{student.cgpa.toFixed(2)}</span></span>
              {student.course && <span className="text-white/30">{student.course}</span>}
              {student.yearOfCompletion && <span className="text-white/30">Batch {student.yearOfCompletion}</span>}
            </div>
          )}
        </div>

        {/* PDF upload area */}
        <p className="text-[11px] tracking-[0.08em] uppercase text-white/25 mb-2">Certificate PDF *</p>
        <div
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer mb-4 ${
            drag       ? 'border-green-500/50 bg-green-500/[0.04]'
            : pdfFile  ? 'border-green-500/30 bg-green-500/[0.03]'
            : 'border-white/[0.1] hover:border-white/[0.2]'
          }`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => !busy && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            disabled={busy}
            onChange={e => handleFile(e.target.files[0])}
          />

          {pdfFile ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={20} className="text-green-400" />
              </div>
              <p className="text-[13px] font-semibold text-green-400 mb-1">{pdfFile.name}</p>
              <p className="text-[11px] text-white/30">{(pdfFile.size / 1024).toFixed(1)} KB · Click to change</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
                <Upload size={18} className="text-white/30" />
              </div>
              <p className="text-[13px] font-medium text-white/60 mb-1">Drop PDF here or click to browse</p>
              <p className="text-[11px] text-white/25">PDF only · max 10 MB</p>
            </>
          )}
        </div>

        {/* What happens next info */}
        <div className="bg-[#a855f7]/[0.04] border border-[#a855f7]/15 rounded-xl p-4 mb-5">
          <p className="text-[11px] text-white/40 mb-2 font-semibold uppercase tracking-wide">What happens on approve</p>
          <div className="flex flex-col gap-1.5">
            {[
              { step: '1', text: 'PDF is uploaded to IPFS via Pinata', icon: '📦' },
              { step: '2', text: 'Certificate is recorded on the blockchain', icon: '⛓️' },
              { step: '3', text: 'Student receives email with PDF + claim link', icon: '📧' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-2.5">
                <span className="text-[14px]">{s.icon}</span>
                <span className="text-[12px] text-white/50">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/[0.08] border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={busy || !pdfFile}
            className="btn-shine flex-1 h-11 rounded-xl text-[14px] font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
            style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}
          >
            {busy ? (
              <><Spin size={4} color="border-t-white" /> Issuing Certificate…</>
            ) : (
              <><CheckCircle2 size={16} /> Approve & Issue</>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            className="h-11 px-5 rounded-xl border border-white/[0.1] text-[13px] text-white/40 hover:text-white transition-all disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Certificate row (issued certs) ────────────────────────────
function CertRow({ c, onRevoke, onResend }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all">
      <div className="w-9 h-9 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-sm shrink-0">🎓</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-[14px] font-semibold truncate">{c.studentName}</p>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            c.status === 'issued'  ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : c.status === 'revoked' ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-white/[0.04] text-white/30 border-white/[0.08]'
          }`}>{c.status}</span>
          {c.blockchainMock && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">mock chain</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-white/35">
          <span className="font-mono truncate max-w-[160px]">{c.certId}</span>
          <span className="truncate max-w-[200px]">{c.courseName}</span>
          <span>{c.yearOfCompletion}</span>
          {c.grade && <span>Grade: {c.grade}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <span className="text-[11px] text-white/20">{fmt(c.createdAt)}</span>
        {c.status === 'issued' && (
          <>
            <button onClick={() => onResend(c.certId)}
              className="h-7 px-3 rounded-lg border border-[#38bdf8]/20 text-[11px] text-[#38bdf8]/70 hover:bg-[#38bdf8]/10 transition-all">
              Resend Email
            </button>
            <button onClick={() => onRevoke(c.certId)}
              className="h-7 px-3 rounded-lg border border-red-500/20 text-[11px] text-red-400/80 hover:bg-red-500/10 transition-all">
              Revoke
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Request row ───────────────────────────────────────────────
function RequestRow({ req, onAction, onApprove }) {
  const [expanded,     setExpanded]     = useState(false)
  const [rejReason,    setRejReason]    = useState('')
  const [showReject,   setShowReject]   = useState(false)
  const [showApprove,  setShowApprove]  = useState(false)   // ← approve modal
  const [busy,         setBusy]         = useState(false)
  const [docPreview,   setDocPreview]   = useState(null)
  const st = REQUEST_STATUS[req.status] ?? REQUEST_STATUS.pending

  const student = req.student

  const doAction = async (status, extra = {}) => {
    setBusy(true)
    await onAction(req._id, status, extra)
    setBusy(false)
    setShowReject(false)
  }

  // ── Eligibility badges ───────────────────────────────────────────────────
  const isActuallyEligible = student
    ? (!student.hasBacklogs && !!student.resultsPublished)
    : false
  const badges = student ? [
    {
      label:  student.hasBacklogs      ? 'Has Backlogs'        : 'No Backlogs',
      ok:     !student.hasBacklogs,
      icon:   student.hasBacklogs      ? '✕'                   : '✓',
    },
    {
      label:  student.resultsPublished ? 'Results Published'   : 'Results Pending',
      ok:     !!student.resultsPublished,
      icon:   student.resultsPublished ? '✓'                   : '!',
    },
    {
      label:  isActuallyEligible       ? 'Degree Eligible'     : 'Not Eligible',
      ok:     isActuallyEligible,
      icon:   isActuallyEligible       ? '✓'                   : '✕',
    },
  ] : []

  // ── Subjects grouped by semester ─────────────────────────────────────────
  const semGroups = {}
  if (student?.subjects?.length) {
    for (const s of student.subjects) {
      if (!semGroups[s.semester]) semGroups[s.semester] = []
      semGroups[s.semester].push(s)
    }
  }
  const allCleared = student?.subjects?.length
    ? student.subjects.every(s => s.cleared)
    : null

  // ── Documents ────────────────────────────────────────────────────────────
  const documents    = student?.documents ?? []
  const requiredDocs = ['aadhar', 'hallticket', 'photo']
  const docMap       = {}
  for (const d of documents) docMap[d.type] = d
  const allDocsPresent  = requiredDocs.every(t => !!docMap[t])
  const studentPhoto    = docMap['photo']
  const DOC_LABELS      = { aadhar: 'Aadhar Card', hallticket: 'Hall Ticket', photo: 'Passport Photo' }

  const gradeColor = (grade) => {
    if (!grade || grade === 'F') return 'text-red-400'
    if (grade === 'O' || grade === 'A+') return 'text-green-400'
    if (grade === 'A')  return 'text-emerald-400'
    if (grade === 'B+') return 'text-blue-400'
    return 'text-white/60'
  }

  return (
    <>
      <div className="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-all">

        {/* ── Row header ── */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${st.bg} ${st.border} ${st.color}`}>
            {st.icon} {st.label}
          </span>

          {/* Student photo thumbnail */}
          <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden border border-white/[0.1] bg-white/[0.04] flex items-center justify-center">
            {studentPhoto?.dataUri
              ? <img src={studentPhoto.dataUri} alt="Photo" className="w-full h-full object-cover" />
              : <span className="text-[14px] text-white/20">👤</span>
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[13px] font-semibold truncate">
                {student?.name ?? req.registerNumber}
              </p>
              <span className="text-[11px] text-white/40 font-mono shrink-0">{req.registerNumber}</span>
              <span className="text-[12px] text-white/40 shrink-0">{req.certificateType}</span>
            </div>
            <div className="flex gap-3 text-[11px] text-white/25 flex-wrap">
              <span>{req.email}</span>
              <span>{fmt(req.createdAt)}</span>
              <span className="font-mono">{req.requestId}</span>
              {student?.course && <span>{student.course}</span>}
              {student?.cgpa != null && (
                <span className="text-[#38bdf8]/70">CGPA {student.cgpa.toFixed(2)}</span>
              )}
            </div>
          </div>

          {/* Eligibility mini-badges */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {badges.map(b => (
              <span key={b.label}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  b.ok
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {req.status === 'pending' && (
              <button onClick={() => doAction('processing')} disabled={busy}
                className="h-7 px-3 rounded-lg border border-blue-500/25 text-[11px] text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-40">
                {busy ? <Spin size={3} /> : 'Start Review'}
              </button>
            )}

            {/* ── APPROVE button opens the PDF-upload modal ── */}
            {req.status === 'processing' && (
              <button
                onClick={() => setShowApprove(true)}
                disabled={busy}
                className="h-7 px-3 rounded-lg border border-green-500/25 text-[11px] text-green-400 hover:bg-green-500/10 transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                <CheckCircle2 size={11} />
                {busy ? <Spin size={3} /> : 'Approve'}
              </button>
            )}

            {req.status === 'approved' && (
              <button onClick={() => doAction('dispatched')} disabled={busy}
                className="h-7 px-3 rounded-lg border border-purple-500/25 text-[11px] text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-40">
                {busy ? <Spin size={3} /> : 'Mark Dispatched'}
              </button>
            )}

            {['pending', 'processing'].includes(req.status) && (
              <button onClick={() => setShowReject(v => !v)}
                className="h-7 px-3 rounded-lg border border-red-500/20 text-[11px] text-red-400/70 hover:bg-red-500/10 transition-all">
                Reject
              </button>
            )}

            <button onClick={() => setExpanded(v => !v)}
              className="h-7 w-7 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all">
              <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Reject reason ── */}
        <AnimatePresence>
          {showReject && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
              <div className="px-4 pb-3 pt-1 bg-red-500/[0.04] border-t border-red-500/10">
                <p className="text-[11px] text-white/35 mb-2">Rejection reason (required)</p>
                <div className="flex gap-2">
                  <input value={rejReason} onChange={e => setRejReason(e.target.value)}
                    placeholder="e.g. Incomplete documents, backlogs not cleared…"
                    className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder:text-white/20 outline-none focus:border-red-500/30" />
                  <button onClick={() => { if (rejReason.trim()) doAction('rejected', { rejectionReason: rejReason.trim() }) }}
                    disabled={!rejReason.trim() || busy}
                    className="h-9 px-4 rounded-lg bg-red-500/15 border border-red-500/30 text-[12px] text-red-400 font-semibold disabled:opacity-40">
                    Confirm Reject
                  </button>
                  <button onClick={() => setShowReject(false)} className="h-9 px-3 rounded-lg border border-white/[0.08] text-[12px] text-white/30">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Expanded details ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
              <div className="border-t border-white/[0.05] bg-white/[0.01]">

                {/* Section 1: Eligibility summary */}
                {student && (
                  <div className="px-5 pt-5 pb-4">
                    <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-3">Eligibility Summary</p>
                    <div className="flex flex-wrap gap-2">
                      {badges.map(b => (
                        <span key={b.label}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${
                            b.ok
                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                          <span className="text-[14px]">{b.ok ? '✓' : '✕'}</span> {b.label}
                        </span>
                      ))}
                      {allCleared !== null && (
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${
                          allCleared
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {allCleared ? '✓' : '!'} {allCleared ? 'All Subjects Cleared' : 'Subjects Pending'}
                        </span>
                      )}
                      {allDocsPresent !== null && (
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${
                          allDocsPresent
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {allDocsPresent ? '✓' : '✕'} {allDocsPresent ? 'All Docs Uploaded' : 'Docs Missing'}
                        </span>
                      )}
                    </div>
                    {student.cgpa != null && (
                      <p className="mt-3 text-[12px] text-white/40">
                        CGPA <span className="text-[#38bdf8] font-semibold text-[14px]">{student.cgpa.toFixed(2)}</span>
                        <span className="ml-3 text-white/25">/ {student.totalCredits} credits · {student.course} · {student.yearOfCompletion}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Section 2: Documents */}
                {documents.length > 0 && (
                  <div className="px-5 pb-5">
                    <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-3">Uploaded Documents</p>
                    <div className="flex gap-3 flex-wrap">
                      {requiredDocs.map(type => {
                        const doc = docMap[type]
                        if (!doc) {
                          return (
                            <div key={type}
                              className="w-36 h-24 rounded-xl border border-red-500/20 bg-red-500/[0.04] flex flex-col items-center justify-center gap-1">
                              <span className="text-[18px]">✕</span>
                              <span className="text-[10px] text-red-400">{DOC_LABELS[type]}</span>
                              <span className="text-[9px] text-red-400/50">Missing</span>
                            </div>
                          )
                        }
                        return (
                          <button key={type} onClick={() => setDocPreview({ label: doc.label, dataUri: doc.dataUri })}
                            className="w-36 h-24 rounded-xl border border-white/[0.08] overflow-hidden relative group hover:border-white/20 transition-all bg-white/[0.02]">
                            {doc.dataUri && (
                              <img src={doc.dataUri} alt={doc.label}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-end pb-2 pointer-events-none">
                              <span className="text-[9px] text-white font-semibold px-2 text-center leading-tight">{doc.label}</span>
                              {doc.verified && (
                                <span className="text-[8px] text-green-400 mt-0.5">✓ Verified</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Section 3: Subjects */}
                {Object.keys(semGroups).length > 0 && (
                  <div className="px-5 pb-5">
                    <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-3">
                      Academic Record — {student.subjects.length} Subjects
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.keys(semGroups).sort((a, b) => a - b).map(sem => (
                        <div key={sem} className="bg-black/30 rounded-xl border border-white/[0.05] overflow-hidden">
                          <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                            <span className="text-[10px] text-white/40 uppercase tracking-[0.08em] font-semibold">
                              Semester {sem}
                            </span>
                          </div>
                          <div className="divide-y divide-white/[0.03]">
                            {semGroups[sem].map(s => (
                              <div key={s.code} className="px-3 py-2 flex items-center gap-2">
                                <span className={`text-[11px] font-bold w-5 shrink-0 ${s.cleared ? 'text-green-400' : 'text-red-400'}`}>
                                  {s.cleared ? '✓' : '✕'}
                                </span>
                                <span className="text-[10px] font-mono text-white/30 w-14 shrink-0">{s.code}</span>
                                <span className="text-[11px] text-white/70 flex-1 truncate">{s.name}</span>
                                <span className="text-[10px] text-white/25 w-8 text-right shrink-0">{s.credits}cr</span>
                                <span className={`text-[11px] font-bold w-8 text-right shrink-0 ${gradeColor(s.grade)}`}>
                                  {s.grade}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: Request details */}
                <div className="px-5 pb-5">
                  <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-3">Request Details</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                    {[
                      ['Request ID',       req.requestId],
                      ['Mobile',           req.mobile],
                      ['Email',            req.email],
                      ['Delivery Address', req.address],
                      ['Pincode',          req.pincode],
                      ['Submitted',        fmt(req.createdAt)],
                      ...(req.rejectionReason ? [['Rejection Reason', req.rejectionReason]] : []),
                      ...(req.txHash ? [['Tx Hash', req.txHash.slice(0, 20) + '…']] : []),
                    ].map(([k, v]) => v ? (
                      <div key={k}>
                        <p className="text-[10px] text-white/25 uppercase tracking-[0.06em] mb-0.5">{k}</p>
                        <p className="text-[12px] text-white/70 break-all">{v}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Document preview modal ── */}
        <AnimatePresence>
          {docPreview && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
              onClick={() => setDocPreview(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0f0f0f] border border-white/[0.1] rounded-2xl p-4 max-w-lg w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold">{docPreview.label}</p>
                  <button onClick={() => setDocPreview(null)} className="text-white/30 hover:text-white text-[18px] leading-none">×</button>
                </div>
                <img src={docPreview.dataUri} alt={docPreview.label}
                  className="w-full rounded-xl border border-white/[0.07]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Approve modal (rendered outside the row so it's not clipped) ── */}
      <AnimatePresence>
        {showApprove && (
          <ApproveModal
            req={req}
            onClose={() => setShowApprove(false)}
            onApprove={onApprove}
          />
        )}
      </AnimatePresence>
    </>
  )
}


// ── Status filter tabs ────────────────────────────────────────
function FilterTabs({ active, onChange, stats }) {
  const tabs = [
    { key: 'all',        label: 'All',        count: stats?.total },
    { key: 'pending',    label: 'Pending',    count: stats?.pending },
    { key: 'processing', label: 'Processing', count: stats?.processing },
    { key: 'approved',   label: 'Approved',   count: stats?.approved },
    { key: 'dispatched', label: 'Dispatched', count: stats?.dispatched },
    { key: 'rejected',   label: 'Rejected',   count: stats?.rejected },
  ]
  return (
    <div className="flex gap-2 flex-wrap mb-5">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`h-8 px-3 rounded-full text-[12px] font-medium transition-all border flex items-center gap-1.5 ${
            active === t.key
              ? 'bg-white/[0.08] border-white/20 text-white'
              : 'border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/10'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              active === t.key ? 'bg-white/10' : 'bg-white/[0.05]'
            }`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
export default function IssuerDashboard() {
  const { user, logout } = useAuth()
  const { toast }        = useToast()

  const [tab,           setTab]           = useState('dashboard')
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [stats,         setStats]         = useState(null)
  const [certificates,  setCertificates]  = useState([])
  const [loadingCerts,  setLoadingCerts]  = useState(false)
  const [showForm,      setShowForm]      = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [issuing,       setIssuing]       = useState(false)
  const [file,          setFile]          = useState(null)
  const [drag,          setDrag]          = useState(false)
  const [uploadedData,  setUploadedData]  = useState(null)
  const [formData,      setFormData]      = useState(EMPTY_FORM)
  const [degreeSearch,  setDegreeSearch]  = useState('')
  const [showDropdown,  setShowDropdown]  = useState(false)

  // Certificate Requests state
  const [requests,       setRequests]       = useState([])
  const [reqStats,       setReqStats]       = useState(null)
  const [loadingReqs,    setLoadingReqs]    = useState(false)
  const [reqFilter,      setReqFilter]      = useState('all')
  const [reqPage,        setReqPage]        = useState(1)
  const [reqTotalPages,  setReqTotalPages]  = useState(1)

  const dropRef = useRef(null)

  useEffect(() => { fetchStats(); fetchCertificates() }, [])
  useEffect(() => {
    if (tab === 'requests') { fetchRequests(); fetchReqStats() }
  }, [tab, reqFilter, reqPage])

  useEffect(() => {
    if (!showDropdown) return
    const h = e => { if (!dropRef.current?.contains(e.target)) setShowDropdown(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showDropdown])

  const fetchStats = async () => {
    try {
      const { data } = await issuerService.getDashboardStats()
      if (data.success) setStats(data.stats)
    } catch {}
  }

  const fetchCertificates = async () => {
    setLoadingCerts(true)
    try {
      const { data } = await issuerService.getCertificates()
      if (data.success) setCertificates(data.certificates)
    } catch { toast({ variant: 'destructive', description: 'Failed to load certificates.' }) }
    finally  { setLoadingCerts(false) }
  }

  const fetchReqStats = async () => {
    try {
      const { data } = await issuerService.getCertificateRequestStats()
      if (data.success) setReqStats(data.stats)
    } catch {}
  }

  const fetchRequests = async () => {
    setLoadingReqs(true)
    try {
      const params = { page: reqPage, limit: 15 }
      if (reqFilter !== 'all') params.status = reqFilter
      const { data } = await issuerService.getCertificateRequests(params)
      if (data.success) {
        setRequests(data.requests)
        setReqTotalPages(data.pages ?? 1)
      }
    } catch { toast({ variant: 'destructive', description: 'Failed to load requests.' }) }
    finally  { setLoadingReqs(false) }
  }

  // Generic status change (processing / rejected / dispatched)
  const handleRequestAction = async (id, status, extra = {}) => {
    try {
      await issuerService.updateRequestStatus(id, { status, ...extra })
      toast({
        description: status === 'rejected'   ? '❌ Request rejected.'
          : status === 'dispatched' ? '📦 Marked as dispatched.'
          : `Status updated to ${status}.`
      })
      fetchRequests()
      fetchReqStats()
    } catch (err) {
      toast({ variant: 'destructive', description: err?.response?.data?.message ?? 'Action failed.' })
    }
  }

  // Approve: upload PDF + issue on blockchain in one backend call
  const handleApproveRequest = async (id, pdfFile) => {
    const { data } = await issuerService.approveRequest(id, pdfFile)
    toast({
      description: data.blockchainMock
        ? '✅ Approved! Certificate saved (mock chain) and email sent.'
        : '✅ Approved! Certificate issued on blockchain and emailed to student.',
    })
    fetchRequests()
    fetchReqStats()
    fetchStats()
    fetchCertificates()
  }

  const handleFileSelect = async selectedFile => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      return toast({ variant: 'destructive', description: 'Please select a PDF file.' })
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      return toast({ variant: 'destructive', description: 'File size must be under 10 MB.' })
    }
    setFile(selectedFile)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('certificate', selectedFile)
      const { data } = await issuerService.uploadCertificate(fd)
      if (data.success) {
        setUploadedData({ certId: data.certId, ipfsHash: data.ipfsHash, ipfsUrl: data.ipfsUrl })
        toast({ description: '✓ PDF uploaded to IPFS successfully.' })
      }
    } catch (e) {
      toast({ variant: 'destructive', description: e?.response?.data?.message || 'Upload failed.' })
      setFile(null)
    } finally { setUploading(false) }
  }

  const resolvedCourse = () =>
    formData.courseSelected === 'Other (type below)' ? formData.courseCustom : formData.courseSelected

  const handleIssue = async () => {
    const course = resolvedCourse()
    if (!uploadedData)           return toast({ variant: 'destructive', description: 'Please upload the certificate PDF first.' })
    if (!formData.studentEmail)  return toast({ variant: 'destructive', description: 'Student email is required.' })
    if (!course)                 return toast({ variant: 'destructive', description: 'Please select a degree programme.' })
    if (!formData.yearOfCompletion) return toast({ variant: 'destructive', description: 'Year of completion is required.' })

    setIssuing(true)
    try {
      const { data } = await issuerService.issueCertificate({
        ...uploadedData,
        studentName:      formData.studentName,
        studentEmail:     formData.studentEmail,
        courseName:       course,
        yearOfCompletion: formData.yearOfCompletion,
        grade:            formData.grade  || undefined,
        cgpa:             formData.cgpa   || undefined,
      })
      if (data.success) {
        toast({ description: data.blockchainMock ? '🎓 Certificate saved! (mock chain)' : '🎓 Certificate issued on blockchain!' })
        setShowForm(false); resetForm(); fetchStats(); fetchCertificates()
      }
    } catch (e) {
      toast({ variant: 'destructive', description: e?.response?.data?.message || 'Failed to issue certificate.' })
    } finally { setIssuing(false) }
  }

  const handleRevoke = async certId => {
    if (!window.confirm('Revoke this certificate? This action cannot be undone.')) return
    try {
      const { data } = await issuerService.revokeCertificate(certId)
      if (data.success) { toast({ description: 'Certificate revoked.' }); fetchCertificates(); fetchStats() }
    } catch (e) {
      toast({ variant: 'destructive', description: e?.response?.data?.message || 'Revoke failed.' })
    }
  }

  const handleResendClaim = async certId => {
    try {
      await issuerService.resendClaim(certId)
      toast({ description: '📧 Claim link resent to student.' })
    } catch (e) {
      toast({ variant: 'destructive', description: e?.response?.data?.message || 'Failed to resend.' })
    }
  }

  const resetForm = () => { setFormData(EMPTY_FORM); setFile(null); setUploadedData(null); setDegreeSearch('') }
  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const filteredGroups = DEGREE_GROUPS.map(g => ({
    ...g,
    degrees: g.degrees.filter(d => d.toLowerCase().includes(degreeSearch.toLowerCase())),
  })).filter(g => g.degrees.length > 0)

  const NAV = [
    { id: 'dashboard', icon: '◈', label: 'Dashboard' },
    { id: 'requests',  icon: '📋', label: 'Certificate Requests',
      badge: reqStats?.pending > 0 ? reqStats.pending : null },
    { id: 'certs',     icon: '◎', label: 'Issued Certificates' },
  ]

  const SidebarContent = () => (
    <>
      <Link to="/" className="flex items-center gap-2.5 mb-10" onClick={() => setSidebarOpen(false)}>
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>⬡</div>
        <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
      </Link>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(item => (
          <button key={item.id}
            onClick={() => { setTab(item.id); setSidebarOpen(false) }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
            style={{
              background: tab === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color:      tab === item.id ? 'white' : 'rgba(255,255,255,0.35)',
            }}>
            <span className="text-[16px]">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="border-t border-white/[0.06] pt-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/30 flex items-center justify-center text-sm">🏫</div>
          <div>
            <p className="text-[13px] font-medium leading-tight truncate max-w-[140px]">{user?.name ?? 'Issuer'}</p>
            <p className="text-[11px] text-white/30 truncate max-w-[140px]">{user?.university ?? 'Institution'}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full text-left text-[12px] text-white/25 hover:text-white/50 transition-colors py-1">
          → Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 border-r border-white/[0.06] flex-col py-8 px-5 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ ease: [0.16,1,0.3,1], duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col py-8 px-5 md:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-10 h-14 flex items-center justify-between gap-3">
          <button onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden flex flex-col gap-1.5 p-1" aria-label="menu">
            <span className="w-5 h-0.5 bg-white/60 rounded" />
            <span className="w-5 h-0.5 bg-white/60 rounded" />
            <span className="w-3.5 h-0.5 bg-white/60 rounded" />
          </button>

          <h1 className="text-[14px] md:text-[15px] font-semibold flex-1 truncate">
            {tab === 'dashboard' ? 'Issuer Dashboard'
              : tab === 'requests' ? 'Certificate Requests'
              : 'Issued Certificates'}
            {user?.role === 'issuer' && (
              <><br /><span className="text-[11px] text-white/30">{user.name}</span></>
            )}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            {tab === 'requests' && (
              <button onClick={() => { fetchRequests(); fetchReqStats() }}
                className="h-8 w-8 rounded-full border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all">
                <RefreshCw size={14} />
              </button>
            )}
            <button onClick={() => setShowForm(true)}
              className="btn-shine h-8 px-4 md:px-5 rounded-full text-[12px] md:text-[13px] font-semibold text-white whitespace-nowrap"
              style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>
              + Issue
            </button>
          </div>
        </div>

        <div className="px-4 md:px-10 py-6 md:py-8">

          {/* ── Dashboard tab ────────────────────────── */}
          {tab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 md:mb-8">
                {[
                  { label: 'Issued',            value: stats?.totalIssued,    color: '#4ade80' },
                  { label: 'Pending Requests',  value: reqStats?.pending,     color: '#fbbf24' },
                  { label: 'Revoked',           value: stats?.revoked,        color: '#f87171' },
                  { label: 'Total Requests',    value: reqStats?.total,       color: '#38bdf8' },
                ].map(s => (
                  <div key={s.label} className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-5 md:p-6 hover:border-white/[0.12] transition-colors">
                    <p className="text-[11px] tracking-[0.06em] uppercase text-white/30 mb-3">{s.label}</p>
                    <p className="text-[32px] md:text-[40px] font-[800] leading-none tracking-[-0.05em]"
                      style={{ color: s.color }}>
                      {s.value ?? <span className="text-white/20 text-[24px]">—</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pending requests preview */}
              {(reqStats?.pending ?? 0) > 0 && (
                <div className="bg-[#0a0a0a] border border-amber-500/20 rounded-2xl p-5 md:p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <AlertCircle size={15} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">
                          {reqStats.pending} Pending Request{reqStats.pending > 1 ? 's' : ''}
                        </p>
                        <p className="text-[11px] text-white/35">Student certificate requests awaiting review</p>
                      </div>
                    </div>
                    <button onClick={() => setTab('requests')}
                      className="h-8 px-4 rounded-full border border-amber-500/25 text-[12px] text-amber-400 hover:bg-amber-500/10 transition-all">
                      Review All →
                    </button>
                  </div>
                </div>
              )}

              {/* Recent issued certs */}
              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-5 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[14px] font-semibold">Recent Certificates</h3>
                  <button onClick={() => setTab('certs')} className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
                    View all →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Certificate Requests tab ──────────────── */}
          {tab === 'requests' && (
            <div>
              {/* Stats mini-row */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                {[
                  { label: 'Pending',    value: reqStats?.pending,    color: '#fbbf24' },
                  { label: 'Processing', value: reqStats?.processing, color: '#38bdf8' },
                  { label: 'Approved',   value: reqStats?.approved,   color: '#4ade80' },
                  { label: 'Dispatched', value: reqStats?.dispatched, color: '#c084fc' },
                  { label: 'Rejected',   value: reqStats?.rejected,   color: '#f87171' },
                ].map(s => (
                  <div key={s.label} className="bg-[#0a0a0a] border border-white/[0.07] rounded-xl p-4">
                    <p className="text-[10px] tracking-[0.06em] uppercase text-white/25 mb-1">{s.label}</p>
                    <p className="text-[26px] font-[800] leading-none" style={{ color: s.color }}>
                      {s.value ?? '—'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-5 md:p-7">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold">Student Certificate Requests</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-white/30">{requests.length} shown</span>
                  </div>
                </div>

                <FilterTabs active={reqFilter} onChange={v => { setReqFilter(v); setReqPage(1) }} stats={reqStats} />

                {loadingReqs ? (
                  <div className="flex justify-center py-16"><Spin /></div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                      <FileCheck size={20} className="text-white/20" />
                    </div>
                    <p className="text-[14px] font-medium text-white/30 mb-1">
                      {reqFilter === 'all' ? 'No requests yet' : `No ${reqFilter} requests`}
                    </p>
                    <p className="text-[12px] text-white/20">Certificate requests from students will appear here.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {requests.map(r => (
                      <RequestRow
                        key={r._id}
                        req={r}
                        onAction={handleRequestAction}
                        onApprove={handleApproveRequest}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {reqTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-6 pt-5 border-t border-white/[0.05]">
                    <button onClick={() => setReqPage(p => Math.max(1, p - 1))}
                      disabled={reqPage === 1}
                      className="h-8 px-4 rounded-full border border-white/[0.08] text-[12px] text-white/40 hover:text-white disabled:opacity-30 transition-all">
                      ← Prev
                    </button>
                    <span className="text-[12px] text-white/30">
                      Page {reqPage} of {reqTotalPages}
                    </span>
                    <button onClick={() => setReqPage(p => Math.min(reqTotalPages, p + 1))}
                      disabled={reqPage === reqTotalPages}
                      className="h-8 px-4 rounded-full border border-white/[0.08] text-[12px] text-white/40 hover:text-white disabled:opacity-30 transition-all">
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Issued Certs tab ──────────────────────── */}
          {tab === 'certs' && (
            <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-5 md:p-7">
              <h3 className="text-[14px] font-semibold mb-5">
                All Issued Certificates
                {certificates.length > 0 && (
                  <span className="ml-2 text-[12px] text-white/30 font-normal">({certificates.length})</span>
                )}
              </h3>
              {loadingCerts ? (
                <div className="flex justify-center py-12"><Spin /></div>
              ) : certificates.length === 0 ? (
                <p className="text-center text-white/30 py-12 text-[13px]">No certificates issued yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {certificates.map(c => (
                    <CertRow key={c._id} c={c} onRevoke={handleRevoke} onResend={handleResendClaim} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Issue Certificate Modal (manual flow) ────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
            onClick={() => !issuing && !uploading && (setShowForm(false), resetForm())}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ ease: [0.16,1,0.3,1] }}
              className="bg-[#0f0f0f] border border-white/[0.1] rounded-none sm:rounded-2xl p-5 sm:p-8 w-full sm:max-w-[640px] max-h-screen sm:max-h-[92vh] overflow-y-auto"
              style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem', marginTop: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-[18px] sm:text-[20px] font-[700]">Issue Certificate</h2>
                <button onClick={() => { setShowForm(false); resetForm() }}
                  className="text-white/30 hover:text-white transition-colors p-1 text-lg leading-none">✕</button>
              </div>
              <p className="text-[13px] text-white/40 mb-6">Upload PDF to IPFS, then write to blockchain.</p>

              <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-3">Student Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field label="Student Name *">
                  <input value={formData.studentName} onChange={e => set('studentName', e.target.value)} placeholder="Full name" className={iCls} />
                </Field>
                <Field label="Student Email *">
                  <input type="email" value={formData.studentEmail} onChange={e => set('studentEmail', e.target.value)} placeholder="student@example.com" className={iCls} />
                </Field>
              </div>

              <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-3">Academic Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="col-span-1 sm:col-span-2" ref={dropRef}>
                  <Field label="Degree / Programme *">
                    <div className="relative">
                      <input
                        value={formData.courseSelected === 'Other (type below)' ? 'Other (type below)' : formData.courseSelected}
                        readOnly onClick={() => setShowDropdown(v => !v)}
                        placeholder="Select a degree…" className={`${iCls} cursor-pointer pr-10`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-[11px]">▾</span>
                      <AnimatePresence>
                        {showDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-[#161616] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden">
                            <div className="p-2 border-b border-white/[0.06]">
                              <input autoFocus value={degreeSearch} onChange={e => setDegreeSearch(e.target.value)}
                                placeholder="Search degree…"
                                className="w-full h-9 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-[13px] placeholder:text-white/25 outline-none"
                                onClick={e => e.stopPropagation()} />
                            </div>
                            <div className="max-h-[240px] overflow-y-auto">
                              {filteredGroups.map(g => (
                                <div key={g.group}>
                                  <p className="px-4 pt-3 pb-1 text-[10px] tracking-[0.1em] uppercase text-white/25 font-semibold">{g.group}</p>
                                  {g.degrees.map(d => (
                                    <button key={d} type="button"
                                      onClick={() => { set('courseSelected', d); setShowDropdown(false); setDegreeSearch('') }}
                                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                                        formData.courseSelected === d ? 'bg-[#a855f7]/15 text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                      }`}>
                                      {formData.courseSelected === d && <span className="mr-2 text-[#a855f7]">✓</span>}
                                      {d}
                                    </button>
                                  ))}
                                </div>
                              ))}
                              {filteredGroups.length === 0 && (
                                <p className="px-4 py-6 text-[13px] text-white/30 text-center">No match found.</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Field>
                </div>

                {formData.courseSelected === 'Other (type below)' && (
                  <div className="col-span-1 sm:col-span-2">
                    <Field label="Enter Degree Name *">
                      <input value={formData.courseCustom} onChange={e => set('courseCustom', e.target.value)} placeholder="e.g. B.Sc Biotechnology" className={iCls} />
                    </Field>
                  </div>
                )}

                <Field label="Year of Completion *">
                  <select value={formData.yearOfCompletion} onChange={e => set('yearOfCompletion', e.target.value)} className={`${iCls} appearance-none`}>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y} className="bg-[#161616]">{y}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Grade">
                  <select value={formData.grade} onChange={e => set('grade', e.target.value)} className={`${iCls} appearance-none`}>
                    <option value="" className="bg-[#161616]">Select grade</option>
                    {GRADES.map(g => <option key={g} value={g} className="bg-[#161616]">{g}</option>)}
                  </select>
                </Field>

                <div className="col-span-1 sm:col-span-2">
                  <Field label="CGPA (optional)">
                    <input type="number" step="0.01" min="0" max="10" value={formData.cgpa}
                      onChange={e => set('cgpa', e.target.value)} placeholder="e.g. 8.5 (out of 10)" className={iCls} />
                  </Field>
                </div>
              </div>

              <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-3">Certificate PDF</p>
              <div
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center mb-6 transition-all cursor-pointer ${
                  drag ? 'border-[#a855f7]/50 bg-[#a855f7]/[0.04]'
                  : uploadedData ? 'border-green-500/30 bg-green-500/[0.04]'
                  : uploading ? 'border-white/[0.1] bg-white/[0.02]'
                  : 'border-white/[0.08] hover:border-white/[0.18]'
                }`}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); handleFileSelect(e.dataTransfer.files[0]) }}
                onClick={() => !uploading && document.getElementById('file-in').click()}
              >
                <input id="file-in" type="file" accept=".pdf" className="hidden"
                  onChange={e => handleFileSelect(e.target.files[0])} disabled={uploading} />
                <div className="text-3xl mb-3">{uploading ? '⏳' : uploadedData ? '✅' : '📄'}</div>
                <p className="text-[14px] font-medium mb-1.5">
                  {uploading ? 'Uploading to IPFS…' : uploadedData ? (file?.name ?? 'Uploaded') : (file ? file.name : 'Drop PDF here or click to browse')}
                </p>
                <p className="text-[12px] text-white/30">
                  {uploadedData ? `✓ IPFS: ${uploadedData.ipfsHash.slice(0, 20)}…` : 'PDF only · max 10 MB'}
                </p>
                {uploading && <div className="mt-4 flex justify-center"><Spin color="border-t-[#a855f7]" /></div>}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Step n={1} done={!!uploadedData} active={!uploadedData} label="PDF uploaded to IPFS" />
                <div className="h-px flex-1 bg-white/[0.06]" />
                <Step n={2} done={false} active={!!uploadedData} label="Write to blockchain" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleIssue} disabled={issuing || uploading || !uploadedData}
                  className="btn-shine flex-1 h-11 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>
                  {issuing ? <><Spin size={4} /> Writing to blockchain…</> : 'Issue on Blockchain →'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm() }} disabled={issuing}
                  className="h-11 px-6 rounded-xl border border-white/[0.1] text-[14px] text-white/40 hover:text-white transition-all disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}