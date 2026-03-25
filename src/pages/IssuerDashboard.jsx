import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { issuerService } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

// ── Constants ─────────────────────────────────────────────────
const DEGREE_GROUPS = [
  { group: 'Engineering & Technology', degrees: [
    'B.Tech Computer Science and Engineering',
    'B.Tech Electronics and Communication Engineering',
    'B.Tech Electrical and Electronics Engineering',
    'B.Tech Mechanical Engineering', 'B.Tech Civil Engineering',
    'B.Tech Information Technology',
    'B.Tech Artificial Intelligence and Data Science',
    'B.Tech Robotics and Automation',
    'M.Tech Computer Science and Engineering',
    'M.Tech VLSI and Embedded Systems', 'M.Tech Structural Engineering',
  ]},
  { group: 'Computer Applications', degrees: [
    'MCA — Master of Computer Applications',
    'BCA — Bachelor of Computer Applications',
  ]},
  { group: 'Science', degrees: [
    'B.Sc Computer Science', 'B.Sc Mathematics', 'B.Sc Physics',
    'B.Sc Chemistry', 'M.Sc Computer Science',
    'M.Sc Data Science', 'M.Sc Artificial Intelligence',
  ]},
  { group: 'Business & Management', degrees: [
    'MBA — Master of Business Administration',
    'BBA — Bachelor of Business Administration',
    'MBA Finance', 'MBA Marketing', 'MBA Human Resources',
  ]},
  { group: 'Arts & Humanities', degrees: [
    'BA English Literature', 'BA Economics', 'BA History',
    'MA English', 'MA Economics',
  ]},
  { group: 'Other / Custom', degrees: ['Other (type below)'] },
]
const GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F']

const EMPTY_FORM = {
  studentName: '', studentEmail: '', courseSelected: '',
  courseCustom: '', yearOfCompletion: new Date().getFullYear().toString(),
  grade: '', cgpa: '',
}

const fmt = ts =>
  ts ? new Date(ts).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) : '—'

// ── Tiny spinner ──────────────────────────────────────────────
function Spin({ size = 5, color = 'border-t-white' }) {
  return (
    <div className={`w-${size} h-${size} rounded-full border-2 border-white/20 ${color} animate-spin`} />
  )
}

// ── Input base class ──────────────────────────────────────────
const iCls = 'w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[14px] placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all'

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.06em] uppercase text-white/30 mb-2">{label}</label>
      {children}
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────
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

// ── Certificate row ───────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════
export default function IssuerDashboard() {
  const { user, logout } = useAuth()
  const { toast }        = useToast()

  const [tab,          setTab]          = useState('dashboard')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [stats,        setStats]        = useState(null)
  const [certificates, setCertificates] = useState([])
  const [loadingCerts, setLoadingCerts] = useState(false)
  const [showForm,     setShowForm]     = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [issuing,      setIssuing]      = useState(false)
  const [file,         setFile]         = useState(null)
  const [drag,         setDrag]         = useState(false)
  const [uploadedData, setUploadedData] = useState(null)
  const [formData,     setFormData]     = useState(EMPTY_FORM)
  const [degreeSearch, setDegreeSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const dropRef = useRef(null)

  useEffect(() => { fetchStats(); fetchCertificates() }, [])

  // Close degree dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    const handler = e => { if (!dropRef.current?.contains(e.target)) setShowDropdown(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
    if (!uploadedData)      return toast({ variant: 'destructive', description: 'Please upload the certificate PDF first.' })
    if (!formData.studentEmail) return toast({ variant: 'destructive', description: 'Student email is required.' })
    if (!course)            return toast({ variant: 'destructive', description: 'Please select a degree programme.' })
    if (!formData.yearOfCompletion) return toast({ variant: 'destructive', description: 'Year of completion is required.' })

    setIssuing(true)
    try {
      const { data } = await issuerService.issueCertificate({
        ...uploadedData,
        studentName:      formData.studentName,
        studentEmail:     formData.studentEmail,
        courseName:       course,
        yearOfCompletion: formData.yearOfCompletion,
        grade:            formData.grade   || undefined,
        cgpa:             formData.cgpa    || undefined,
      })
      if (data.success) {
        toast({
          description: data.blockchainMock
            ? '🎓 Certificate saved! (Blockchain mock — see console)'
            : '🎓 Certificate issued on blockchain!'
        })
        setShowForm(false)
        resetForm()
        fetchStats()
        fetchCertificates()
      }
    } catch (e) {
      toast({ variant: 'destructive', description: e?.response?.data?.message || 'Failed to issue certificate.' })
    } finally { setIssuing(false) }
  }

  const handleRevoke = async certId => {
    if (!window.confirm('Revoke this certificate? This action cannot be undone.')) return
    try {
      const { data } = await issuerService.revokeCertificate(certId)
      if (data.success) {
        toast({ description: 'Certificate revoked and student notified.' })
        fetchCertificates(); fetchStats()
      }
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
    { id: 'certs',     icon: '◎', label: 'Certificates' },
  ]

  // ── Sidebar content (shared by desktop + mobile drawer) ────
  const SidebarContent = () => (
    <>
      <Link to="/" className="flex items-center gap-2.5 mb-10" onClick={() => setSidebarOpen(false)}>
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>⬡</div>
        <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
      </Link>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false) }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
            style={{
              background: tab === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color:      tab === item.id ? 'white' : 'rgba(255,255,255,0.35)',
            }}>
            <span className="text-[16px]">{item.icon}</span>
            {item.label}
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

      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside className="hidden md:flex w-[220px] shrink-0 border-r border-white/[0.06] flex-col py-8 px-5 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ ease: [0.16,1,0.3,1], duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col py-8 px-5 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto min-w-0">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-10 h-14 flex items-center justify-between gap-3">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden flex flex-col gap-1.5 p-1" aria-label="Open menu">
            <span className="w-5 h-0.5 bg-white/60 rounded" />
            <span className="w-5 h-0.5 bg-white/60 rounded" />
            <span className="w-3.5 h-0.5 bg-white/60 rounded" />
          </button>

          <h1 className="text-[14px] md:text-[15px] font-semibold flex-1 truncate">
            {tab === 'dashboard' ? 'Issuer Dashboard' : 'Issued Certificates'}
          </h1>

          <button onClick={() => setShowForm(true)}
            className="btn-shine h-8 px-4 md:px-5 rounded-full text-[12px] md:text-[13px] font-semibold text-white whitespace-nowrap shrink-0"
            style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>
            + Issue
          </button>
        </div>

        <div className="px-4 md:px-10 py-6 md:py-8">

          {/* ── Dashboard tab ──────────────────────────────── */}
          {tab === 'dashboard' && (
            <div>
              {/* Stats — 1 col mobile, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 md:mb-8">
                {[
                  { label: 'Issued',  value: stats?.totalIssued, color: '#4ade80' },
                  { label: 'Pending', value: stats?.pending,     color: '#38bdf8' },
                  { label: 'Revoked', value: stats?.revoked,     color: '#f87171' },
                ].map(s => (
                  <div key={s.label} className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-5 md:p-7 hover:border-white/[0.12] transition-colors">
                    <p className="text-[11px] tracking-[0.06em] uppercase text-white/30 mb-3">{s.label}</p>
                    <p className="text-[36px] md:text-[44px] font-[800] leading-none tracking-[-0.05em]"
                      style={{ color: s.color }}>
                      {s.value ?? <span className="text-white/20 text-[24px]">—</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent certs */}
              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-5 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[14px] font-semibold">Recent Certificates</h3>
                  <button onClick={() => setTab('certs')} className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
                    View all →
                  </button>
                </div>
                {loadingCerts ? (
                  <div className="flex justify-center py-12"><Spin /></div>
                ) : certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[15px] font-semibold mb-2">No certificates yet</p>
                    <p className="text-[13px] text-white/40 mb-6">Issue your first certificate to get started.</p>
                    <button onClick={() => setShowForm(true)}
                      className="btn-shine h-10 px-6 rounded-full text-[13px] font-semibold text-white"
                      style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>
                      Issue Certificate →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {certificates.slice(0, 5).map(c => (
                      <CertRow key={c._id} c={c} onRevoke={handleRevoke} onResend={handleResendClaim} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Certs tab ──────────────────────────────────── */}
          {tab === 'certs' && (
            <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-5 md:p-7">
              <h3 className="text-[14px] font-semibold mb-5">
                All Certificates
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

      {/* ── Issue Certificate Modal ──────────────────────────── */}
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
              {/* Modal header */}
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-[18px] sm:text-[20px] font-[700]">Issue Certificate</h2>
                <button onClick={() => { setShowForm(false); resetForm() }}
                  className="text-white/30 hover:text-white transition-colors p-1 text-lg leading-none" aria-label="Close">
                  ✕
                </button>
              </div>
              <p className="text-[13px] text-white/40 mb-6">Upload PDF to IPFS, then write to blockchain.</p>

              {/* Student info */}
              <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-3">Student Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field label="Student Name *">
                  <input value={formData.studentName} onChange={e => set('studentName', e.target.value)}
                    placeholder="Full name" className={iCls} />
                </Field>
                <Field label="Student Email *">
                  <input type="email" value={formData.studentEmail} onChange={e => set('studentEmail', e.target.value)}
                    placeholder="student@example.com" className={iCls} />
                </Field>
              </div>

              {/* Academic info */}
              <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-3">Academic Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                {/* Degree dropdown */}
                <div className="col-span-1 sm:col-span-2" ref={dropRef}>
                  <Field label="Degree / Programme *">
                    <div className="relative">
                      <input
                        value={formData.courseSelected === 'Other (type below)' ? 'Other (type below)' : formData.courseSelected}
                        readOnly
                        onClick={() => setShowDropdown(v => !v)}
                        placeholder="Select a degree…"
                        className={`${iCls} cursor-pointer pr-10`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-[11px]">▾</span>
                      <AnimatePresence>
                        {showDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-[#161616] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden"
                          >
                            <div className="p-2 border-b border-white/[0.06]">
                              <input autoFocus value={degreeSearch}
                                onChange={e => setDegreeSearch(e.target.value)}
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
                                        formData.courseSelected === d
                                          ? 'bg-[#a855f7]/15 text-white'
                                          : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                      }`}>
                                      {formData.courseSelected === d && <span className="mr-2 text-[#a855f7]">✓</span>}
                                      {d}
                                    </button>
                                  ))}
                                </div>
                              ))}
                              {filteredGroups.length === 0 && (
                                <p className="px-4 py-6 text-[13px] text-white/30 text-center">No match. Select "Other" to type manually.</p>
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
                      <input value={formData.courseCustom} onChange={e => set('courseCustom', e.target.value)}
                        placeholder="e.g. B.Sc Biotechnology" className={iCls} />
                    </Field>
                  </div>
                )}

                <Field label="Year of Completion *">
                  <select value={formData.yearOfCompletion} onChange={e => set('yearOfCompletion', e.target.value)}
                    className={`${iCls} appearance-none`}>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y} className="bg-[#161616]">{y}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Grade">
                  <select value={formData.grade} onChange={e => set('grade', e.target.value)}
                    className={`${iCls} appearance-none`}>
                    <option value="" className="bg-[#161616]">Select grade</option>
                    {GRADES.map(g => <option key={g} value={g} className="bg-[#161616]">{g}</option>)}
                  </select>
                </Field>

                <div className="col-span-1 sm:col-span-2">
                  <Field label="CGPA (optional)">
                    <input type="number" step="0.01" min="0" max="10"
                      value={formData.cgpa} onChange={e => set('cgpa', e.target.value)}
                      placeholder="e.g. 8.5 (out of 10)" className={iCls} />
                  </Field>
                </div>
              </div>

              {/* PDF upload */}
              <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-3">Certificate PDF</p>
              <div
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center mb-6 transition-all cursor-pointer ${
                  drag           ? 'border-[#a855f7]/50 bg-[#a855f7]/[0.04]'
                  : uploadedData ? 'border-green-500/30 bg-green-500/[0.04]'
                  : uploading    ? 'border-white/[0.1] bg-white/[0.02]'
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
                  {uploading    ? 'Uploading to IPFS…'
                  : uploadedData ? file?.name ?? 'Uploaded'
                  : file        ? file.name
                  : 'Drop PDF here or click to browse'}
                </p>
                <p className="text-[12px] text-white/30">
                  {uploadedData ? `✓ IPFS: ${uploadedData.ipfsHash.slice(0, 20)}…` : 'PDF only · max 10 MB'}
                </p>
                {uploading && <div className="mt-4 flex justify-center"><Spin color="border-t-[#a855f7]" /></div>}
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-6">
                <Step n={1} done={!!uploadedData} active={!uploadedData} label="PDF uploaded to IPFS" />
                <div className="h-px flex-1 bg-white/[0.06]" />
                <Step n={2} done={false} active={!!uploadedData} label="Write to blockchain" />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleIssue}
                  disabled={issuing || uploading || !uploadedData}
                  className="btn-shine flex-1 h-11 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>
                  {issuing ? <><Spin size={4} /> Writing to blockchain…</> : 'Issue on Blockchain →'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm() }}
                  disabled={issuing}
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
