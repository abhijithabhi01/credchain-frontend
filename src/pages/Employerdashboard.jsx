import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { publicService } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

const fmt = ts => new Date(ts).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })

export default function EmployerDashboard() {
  const { user, logout } = useAuth()
  const { toast }        = useToast()
  const [tab,            setTab]     = useState('verify')
  const [certId,         setCertId]  = useState('')
  const [loading,        setLoading] = useState(false)
  const [result,         setResult]  = useState(null)
  const [history,        setHistory] = useState([])   // local session history

  const handleVerify = async () => {
    if (!certId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res  = await publicService.verifyCertificate(certId.trim())
      const data = res.data
      setResult(data)
      
      // Prepend to session history
      setHistory(prev => [{
        certId:    certId.trim(),
        verified:  data.verified,
        status:    data.status,
        name:      data.certificate?.studentName ?? '—',
        course:    data.certificate?.courseName  ?? '—',
        checkedAt: new Date().toISOString(),
      }, ...prev.slice(0, 19)])
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Verification failed.'
      setResult({ verified: false, notFound: true, message: msg })
    } finally {
      setLoading(false)
    }
  }

  const NAV = [
    { id: 'verify',  icon: '◎', label: 'Verify Certificate' },
    { id: 'history', icon: '▦', label: 'Verification History' },
    { id: 'profile', icon: '◉', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 border-r border-white/[0.06] flex flex-col py-8 px-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(90deg, #00d4aa 0%, #38bdf8 100%)' }}>⬡</div>
          <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(item => (
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
            <div className="w-8 h-8 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa]/30 flex items-center justify-center text-sm">🏢</div>
            <div>
              <p className="text-[13px] font-medium leading-tight truncate max-w-[120px]">{user?.name ?? 'Employer'}</p>
              <p className="text-[11px] text-white/30">{user?.company ?? 'Employer'}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-left text-[12px] text-white/25 hover:text-white/50 transition-colors py-1">
            → Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-10 h-14 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold">
            {tab === 'verify' ? 'Verify Certificate' : tab === 'history' ? 'Verification History' : 'Profile'}
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-mono text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            Blockchain live
          </div>
        </div>

        <div className="px-10 py-8">

          {/* ── Verify tab ────────────────────────────── */}
          {tab === 'verify' && (
            <div className="max-w-[640px]">
              {/* Search card */}
              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 mb-5">
                <h3 className="text-[16px] font-[650] mb-2">Instant Certificate Verification</h3>
                <p className="text-[13px] text-white/40 mb-6 leading-relaxed">
                  Enter a candidate's Certificate ID to verify it directly on the Ethereum blockchain. No login required for the candidate.
                </p>

                <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-white/30 mb-2">
                  Certificate ID
                </label>
                <div className="flex gap-3">
                  <input
                    value={certId}
                    onChange={e => setCertId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerify()}
                    placeholder="e.g. CERT-2024-001"
                    className="flex-1 h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-mono placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  />
                  <button onClick={handleVerify} disabled={loading || !certId.trim()}
                    className="btn-shine h-12 px-7 rounded-xl text-[14px] font-semibold text-white disabled:opacity-40"
                    style={{ background: 'linear-gradient(90deg, #00d4aa, #38bdf8)' }}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Checking…
                      </span>
                    ) : 'Verify'}
                  </button>
                </div>
              </div>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Not found */}
                    {result.notFound && (
                      <div className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mx-auto mb-4">✗</div>
                        <h3 className="text-[18px] font-[700] text-red-400 mb-2">Certificate Not Found</h3>
                        <p className="text-[13px] text-white/40">{result.message}</p>
                      </div>
                    )}

                    {/* Revoked */}
                    {!result.notFound && !result.verified && (
                      <div className="bg-[#0a0a0a] border border-yellow-500/20 rounded-2xl p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl mx-auto mb-4">⚠</div>
                        <h3 className="text-[18px] font-[700] text-yellow-400 mb-2">Certificate Revoked</h3>
                        <p className="text-[13px] text-white/40">
                          This certificate was revoked by the issuing institution
                          {result.certificate?.revokedAt && ` on ${fmt(result.certificate.revokedAt)}`}.
                        </p>
                        {result.certificate?.revokeReason && (
                          <p className="text-[12px] text-white/30 mt-2">Reason: {result.certificate.revokeReason}</p>
                        )}
                      </div>
                    )}

                    {/* Valid */}
                    {!result.notFound && result.verified && (
                      <div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/[0.07] border border-green-500/20 mb-5">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                          <span className="text-[13px] font-medium text-green-400">Certificate Verified on Ethereum Blockchain</span>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden">
                          <div className="h-1" style={{ background: 'linear-gradient(90deg, #00d4aa, #38bdf8, #a855f7)' }} />
                          <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                              <div>
                                <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-2">Certificate ID</p>
                                <p className="text-[15px] font-[650] font-mono text-white/80">{certId}</p>
                              </div>
                              <span className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-[11px] font-semibold text-green-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Valid
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                              {[
                                { l: 'Student Name',   v: result.certificate?.studentName      },
                                { l: 'Course',         v: result.certificate?.courseName        },
                                { l: 'University',     v: result.certificate?.university ?? 'KTU' },
                                { l: 'Year',           v: result.certificate?.yearOfCompletion  },
                                { l: 'Issued',         v: result.certificate?.issuedAt ? fmt(result.certificate.issuedAt) : '—' },
                                { l: 'Tx Hash',        v: result.certificate?.txHash ? `${result.certificate.txHash.slice(0,10)}…` : '—', mono: true },
                              ].map(f => (
                                <div key={f.l}>
                                  <p className="text-[11px] tracking-[0.06em] uppercase text-white/25 mb-1.5">{f.l}</p>
                                  <p className={`text-[14px] font-[550] ${f.mono ? 'font-mono text-white/60' : 'text-white'}`}>{f.v ?? '—'}</p>
                                </div>
                              ))}
                            </div>

                            {result.warnings?.length > 0 && (
                              <div className="mt-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-[12px] text-yellow-400">
                                ⚠ {result.warnings[0]}
                              </div>
                            )}

                            {result.certificate?.ipfsUrl && (
                              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                                <a href={result.certificate.ipfsUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.1] text-[13px] font-medium text-white/50 hover:text-white hover:border-white/25 transition-all">
                                  📄 View Certificate PDF
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── History tab ───────────────────────────── */}
          {tab === 'history' && (
            <div>
              {history.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-16 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-[16px] font-semibold mb-2">No verifications yet</p>
                  <p className="text-[13px] text-white/40">Your verification history for this session will appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {history.map((h, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl px-7 py-4 flex items-center gap-5 hover:border-white/[0.12] transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${h.verified ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-0.5">
                          <p className="text-[13px] font-semibold font-mono">{h.certId}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            h.verified
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {h.verified ? 'Valid' : h.status === 'revoked' ? 'Revoked' : 'Not Found'}
                          </span>
                        </div>
                        {h.name !== '—' && (
                          <p className="text-[12px] text-white/35">{h.name} · {h.course}</p>
                        )}
                      </div>
                      <p className="text-[11px] text-white/25 shrink-0">{fmt(h.checkedAt)}</p>
                      <button onClick={() => { setCertId(h.certId); setTab('verify') }}
                        className="text-[12px] text-white/30 hover:text-white/60 transition-colors shrink-0">
                        Re-verify →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Profile tab ───────────────────────────── */}
          {tab === 'profile' && (
            <div className="max-w-[480px]">
              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/[0.06]">
                  <div className="w-14 h-14 rounded-2xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center text-2xl">🏢</div>
                  <div>
                    <p className="text-[18px] font-[700] mb-0.5">{user?.name}</p>
                    <p className="text-[13px] text-white/40">{user?.email}</p>
                  </div>
                </div>

                {[
                  ['Role',        'Employer'],
                  ['Company',     user?.company     ?? '—'],
                  ['Designation', user?.designation ?? '—'],
                  ['Joined',      user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'],
                  ['Verifications (session)', history.length],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-3 border-b border-white/[0.05] text-[13px]">
                    <span className="text-white/30">{k}</span>
                    <span className="text-white/70 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}