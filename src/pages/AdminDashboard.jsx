import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { adminService } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

// ── Helpers ───────────────────────────────────────────────────
const fmt = (ts) =>
  ts ? new Date(ts).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-7 hover:border-white/[0.12] transition-colors">
      <p className="text-[12px] tracking-[0.06em] uppercase text-white/30 mb-4">{label}</p>
      <p className="text-[44px] font-[800] leading-none tracking-[-0.05em] grad-text">
        {value ?? <span className="text-white/20 text-[28px]">—</span>}
      </p>
      {sub && <p className="text-[12px] text-white/30 mt-3">{sub}</p>}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  )
}

export default function AdminDashboard() {
  const { logout }   = useAuth()
  const { toast }    = useToast()
  const [tab,        setTab]        = useState('overview')
  const [stats,      setStats]      = useState(null)
  const [issuers,    setIssuers]    = useState([])
  const [certs,      setCerts]      = useState([])
  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState({})
  const [addOpen,    setAddOpen]    = useState(false)

  // New issuer form state
  const [newName,     setNewName]     = useState('')
  const [newEmail,    setNewEmail]    = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newUni,      setNewUni]      = useState('')
  const [adding,      setAdding]      = useState(false)

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }))

  // ── Fetch stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoad('stats', true)
    try {
      const res = await adminService.getDashboardStats()
      setStats(res.data.stats)
    } catch (e) {
      toast({ variant: 'destructive', description: 'Failed to load stats.' })
    } finally {
      setLoad('stats', false)
    }
  }, [])

  // ── Fetch issuers ─────────────────────────────────────────
  const fetchIssuers = useCallback(async () => {
    setLoad('issuers', true)
    try {
      const res = await adminService.getIssuers()
      setIssuers(res.data.issuers)
    } catch (e) {
      toast({ variant: 'destructive', description: 'Failed to load issuers.' })
    } finally {
      setLoad('issuers', false)
    }
  }, [])

  // ── Fetch certificates ────────────────────────────────────
  const fetchCerts = useCallback(async () => {
    setLoad('certs', true)
    try {
      const res = await adminService.getCertificates({ limit: 50 })
      setCerts(res.data.certificates)
    } catch (e) {
      toast({ variant: 'destructive', description: 'Failed to load certificates.' })
    } finally {
      setLoad('certs', false)
    }
  }, [])

  // ── Fetch activity logs ───────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoad('logs', true)
    try {
      const res = await adminService.getActivityLogs({ limit: 30 })
      setLogs(res.data.logs)
    } catch (e) {
      toast({ variant: 'destructive', description: 'Failed to load logs.' })
    } finally {
      setLoad('logs', false)
    }
  }, [])

  // Load data based on active tab
  useEffect(() => {
    if (tab === 'overview') { fetchStats(); fetchCerts() }
    if (tab === 'issuers')  { fetchStats(); fetchIssuers() }
    if (tab === 'certs')    fetchCerts()
    if (tab === 'logs')     fetchLogs()
  }, [tab])

  // ── Add issuer ────────────────────────────────────────────
  const handleAddIssuer = async () => {
    if (!newName || !newEmail || !newPassword) {
      toast({ variant: 'destructive', description: 'Name, email, and password are required.' })
      return
    }
    setAdding(true)
    try {
      await adminService.addIssuer({
        name:       newName,
        email:      newEmail,
        password:   newPassword,
        university: newUni || undefined,
      })
      toast({ description: 'Issuer account created successfully.' })
      setAddOpen(false)
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewUni('')
      fetchIssuers()
      fetchStats()
    } catch (e) {
      toast({ variant: 'destructive', description: e?.response?.data?.message ?? 'Failed to add issuer.' })
    } finally {
      setAdding(false)
    }
  }

  // ── Remove issuer ─────────────────────────────────────────
  const handleRemoveIssuer = async (issuerId, name) => {
    if (!window.confirm(`Remove issuer "${name}"? This cannot be undone.`)) return
    try {
      await adminService.removeIssuer(issuerId)
      toast({ description: 'Issuer removed.' })
      setIssuers(prev => prev.filter(i => i._id !== issuerId))
      fetchStats()
    } catch (e) {
      toast({ variant: 'destructive', description: e?.response?.data?.message ?? 'Failed to remove issuer.' })
    }
  }

  // ── Log dot colour ────────────────────────────────────────
  const logColor = (action) => {
    if (action?.includes('ISSUED'))   return '#4ade80'
    if (action?.includes('REVOKED'))  return '#f87171'
    if (action?.includes('LOGIN') || action?.includes('REGISTERED')) return '#38bdf8'
    return '#e040fb'
  }

  const logLabel = (action) =>
    (action ?? '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 border-r border-white/[0.06] flex flex-col py-8 px-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(90deg, #e040fb 0%, #38bdf8 100%)' }}>⬡</div>
          <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {[
            { id: 'overview', icon: '◈', label: 'Overview' },
            { id: 'issuers',  icon: '◉', label: 'Issuers' },
            // { id: 'certs',    icon: '◎', label: 'Certificates' },
            // { id: 'logs',     icon: '▦', label: 'Activity Logs' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
              style={{
                background: tab === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                color:      tab === item.id ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            >
              <span className="text-[16px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] pt-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#e040fb]/20 border border-[#e040fb]/30 flex items-center justify-center text-sm">👑</div>
            <div>
              <p className="text-[13px] font-medium leading-tight">Admin</p>
              <p className="text-[11px] text-white/30">Platform control</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-left text-[12px] text-white/25 hover:text-white/50 transition-colors py-1">
            → Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-10 h-14 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold capitalize">
            {tab === 'overview' ? 'Dashboard' : tab === 'issuers' ? 'Manage Issuers' : tab === 'certs' ? 'Certificates' : 'Activity Logs'}
          </h1>
          <Link to="/verify">
            <button className="h-8 px-4 rounded-full border border-white/[0.1] text-[12px] text-white/40 hover:text-white/70 transition-all">
              Public Verify →
            </button>
          </Link>
        </div>

        <div className="px-10 py-8">

          {/* ── OVERVIEW ──────────────────────────────── */}
          {tab === 'overview' && (
            <div>
              {loading.stats ? <Spinner /> : (
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <StatCard label="Total Issuers"    value={stats?.totalIssuers}    sub="Registered institutions" />
                  <StatCard label="Certificates"     value={stats?.totalCerts}      sub="All time issued" />
                  <StatCard label="Active"           value={stats?.activeCerts}     sub="Currently valid" />
                  <StatCard label="Revoked"          value={stats?.revokedCerts}    sub="Total revocations" />
                </div>
              )}

              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-7">
                <h3 className="text-[14px] font-semibold mb-6">Recent Certificates</h3>
                {loading.certs ? <Spinner /> : certs.length === 0 ? (
                  <p className="text-[13px] text-white/30 py-8 text-center">No certificates issued yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Cert ID', 'Student', 'Course', 'Issuer', 'Date', 'Status'].map(h => (
                          <th key={h} className="text-left text-[11px] tracking-[0.06em] uppercase text-white/25 font-medium pb-4 pr-6">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {certs.slice(0, 10).map((c, i) => (
                        <tr key={c._id ?? i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-6 font-mono text-[13px] text-white/60">{c.certId}</td>
                          <td className="py-4 pr-6 text-[13px] font-medium">{c.studentName}</td>
                          <td className="py-4 pr-6 text-[13px] text-white/50">{c.courseName}</td>
                          <td className="py-4 pr-6 text-[13px] text-white/50">{c.issuedBy?.name ?? c.university ?? '—'}</td>
                          <td className="py-4 pr-6 text-[13px] text-white/40">{fmt(c.createdAt)}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                              c.status === 'issued'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : c.status === 'revoked'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-white/[0.04] text-white/30 border-white/[0.08]'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── ISSUERS ───────────────────────────────── */}
          {tab === 'issuers' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-[14px] text-white/40">
                  {loading.issuers ? '…' : `${issuers.length} authorized issuers`}
                </p>
                <button onClick={() => setAddOpen(true)}
                  className="btn-shine h-9 px-5 rounded-full text-[13px] font-semibold text-white"
                  style={{ background: 'linear-gradient(90deg, #e040fb, #a855f7)' }}>
                  + Add Issuer
                </button>
              </div>

              {loading.issuers ? <Spinner /> : issuers.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-16 text-center">
                  <p className="text-[16px] font-semibold mb-2">No issuers yet</p>
                  <p className="text-[13px] text-white/40">Add your first issuer to get started.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {issuers.map(issuer => (
                    <div key={issuer._id}
                      className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl px-7 py-5 flex items-center gap-6 hover:border-white/[0.12] transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-[#e040fb]/10 border border-[#e040fb]/20 flex items-center justify-center text-lg shrink-0">🏫</div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold mb-0.5">{issuer.name}</p>
                        <p className="text-[12px] text-white/35">{issuer.email}</p>
                        {issuer.university && (
                          <p className="text-[11px] text-white/25 mt-0.5">{issuer.university}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-white/30 mb-1">Joined</p>
                        <p className="text-[13px] font-medium">{fmt(issuer.createdAt)}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${
                          issuer.isActive
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-white/[0.04] text-white/30 border-white/[0.08]'
                        }`}>
                          {issuer.isActive ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveIssuer(issuer._id, issuer.name)}
                        className="h-8 px-4 rounded-full border border-red-500/20 text-[12px] text-red-400 hover:bg-red-500/10 transition-all">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CERTS ─────────────────────────────────── */}
          {tab === 'certs' && (
            <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-7">
              <h3 className="text-[14px] font-semibold mb-6">All Certificates</h3>
              {loading.certs ? <Spinner /> : certs.length === 0 ? (
                <p className="text-[13px] text-white/30 py-8 text-center">No certificates found.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Cert ID', 'Student', 'Email', 'Course', 'Issuer', 'Date', 'Status'].map(h => (
                        <th key={h} className="text-left text-[11px] tracking-[0.06em] uppercase text-white/25 font-medium pb-4 pr-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {certs.map((c, i) => (
                      <tr key={c._id ?? i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pr-5 font-mono text-[12px] text-white/60">{c.certId}</td>
                        <td className="py-4 pr-5 text-[13px] font-medium">{c.studentName}</td>
                        <td className="py-4 pr-5 text-[12px] text-white/40">{c.studentEmail}</td>
                        <td className="py-4 pr-5 text-[13px] text-white/50">{c.courseName}</td>
                        <td className="py-4 pr-5 text-[13px] text-white/50">{c.issuedBy?.name ?? '—'}</td>
                        <td className="py-4 pr-5 text-[13px] text-white/40">{fmt(c.createdAt)}</td>
                        <td className="py-4 pr-5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                            c.status === 'issued'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : c.status === 'revoked'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-white/[0.04] text-white/30 border-white/[0.08]'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── LOGS ──────────────────────────────────── */}
          {tab === 'logs' && (
            loading.logs ? <Spinner /> : logs.length === 0 ? (
              <p className="text-[13px] text-white/30 py-8 text-center">No activity logs yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {logs.map((log, i) => (
                  <div key={log._id ?? i} className="bg-[#0a0a0a] border border-white/[0.07] rounded-xl px-6 py-4 flex items-center gap-5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: logColor(log.action) }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-medium">{logLabel(log.action)}</p>
                        {log.performedByRole && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 border border-white/[0.07]">
                            {log.performedByRole}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-white/35">
                        {log.performedBy?.name
                          ? `${log.performedBy.name} · ${log.performedBy.email}`
                          : log.targetCertId
                          ? `Cert: ${log.targetCertId}`
                          : '—'}
                      </p>
                    </div>
                    <span className="text-[11px] text-white/25 shrink-0">{fmt(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* ── Add Issuer Modal ─────────────────────────── */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => setAddOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f0f] border border-white/[0.1] rounded-2xl p-8 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-[20px] font-[700] mb-1">Add New Issuer</h2>
              <p className="text-[13px] text-white/40 mb-6">Creates a login account for the issuing institution.</p>

              {[
                { label: 'Full Name',    val: newName,     set: setNewName,     ph: 'e.g. KTU Admin',         type: 'text' },
                { label: 'Email',        val: newEmail,    set: setNewEmail,    ph: 'issuer@ktu.ac.in',       type: 'email' },
                { label: 'Password',     val: newPassword, set: setNewPassword, ph: '••••••••',               type: 'password' },
                { label: 'University (optional)', val: newUni, set: setNewUni, ph: 'Kerala Technological University', type: 'text' },
              ].map(f => (
                <div key={f.label} className="mb-4">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-white/30 mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[14px] placeholder:text-white/20 outline-none focus:border-white/20 transition-all"
                  />
                </div>
              ))}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddIssuer}
                  disabled={adding}
                  className="btn-shine flex-1 h-11 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #e040fb, #a855f7)' }}
                >
                  {adding ? 'Creating…' : 'Create Issuer Account'}
                </button>
                <button
                  onClick={() => setAddOpen(false)}
                  className="h-11 px-6 rounded-xl border border-white/[0.1] text-[14px] text-white/40 hover:text-white transition-all"
                >
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