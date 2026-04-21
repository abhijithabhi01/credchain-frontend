import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { publicService } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const { toast }        = useToast()
  const [tab,            setTab]            = useState('certificates')
  const [certificates,   setCertificates]   = useState([])
  const [loading,        setLoading]        = useState(true)
  const [linkInput,      setLinkInput]      = useState('')
  const [linking,        setLinking]        = useState(false)
  const [selected,       setSelected]       = useState(null)

  useEffect(() => {
    // Use certificates already populated via /api/auth/me
    if (user?.linkedCertificates) {
      setCertificates(user.linkedCertificates)
    }
    setLoading(false)
  }, [user])

  const handleLink = async () => {
    if (!linkInput.trim()) return
    setLinking(true)
    try {
      const res = await publicService.linkCertificate(linkInput.trim())
      setCertificates(res.data.linkedCertificates)
      setLinkInput('')
      toast({ description: 'Certificate linked to your account!' })
    } catch (err) {
      toast({
        variant:     'destructive',
        description: err?.response?.data?.message ?? 'Could not link certificate.',
      })
    } finally {
      setLinking(false)
    }
  }

  const copyLink = (certId) => {
    navigator.clipboard.writeText(`${window.location.origin}/verify?id=${certId}`)
    toast({ description: 'Verification link copied!' })
  }

  const NAV = [
    { id: 'certificates', icon: '◎', label: 'My Certificates' },
    { id: 'link',         icon: '◈', label: 'Link Certificate' },
    { id: 'profile',      icon: '◉', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 border-r border-white/[0.06] flex flex-col py-8 px-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)' }}>⬡</div>
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
            <div className="w-8 h-8 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/30 flex items-center justify-center text-sm">🎓</div>
            <div>
              <p className="text-[13px] font-medium leading-tight truncate max-w-[120px]">{user?.name ?? 'Student'}</p>
              <p className="text-[11px] text-white/30">{user?.course ?? 'Student'}</p>
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
          <h1 className="text-[15px] font-semibold">
            {tab === 'certificates' ? 'My Certificates' : tab === 'link' ? 'Link Certificate' : 'Profile'}
          </h1>
          <Link to="/verify">
            <button className="h-8 px-4 rounded-full border border-white/[0.1] text-[12px] text-white/40 hover:text-white/70 transition-all">
              Public Verify →
            </button>
          </Link>
        </div>

        <div className="px-10 py-8">

          {/* ── Stats row ─────────────────────────────── */}
          {tab === 'certificates' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total',   value: certificates.length,                                         color: '#38bdf8' },
                  { label: 'Active',  value: certificates.filter(c => c.status === 'issued').length,       color: '#4ade80' },
                  { label: 'Revoked', value: certificates.filter(c => c.status === 'revoked').length,      color: '#f87171' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-7 hover:border-white/[0.12] transition-colors">
                    <p className="text-[12px] tracking-[0.06em] uppercase text-white/30 mb-4">{s.label}</p>
                    <p className="text-[44px] font-[800] leading-none tracking-[-0.05em]" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Certificate list */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                </div>
              ) : certificates.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-16 text-center">
                  <div className="text-4xl mb-4">🎓</div>
                  <p className="text-[16px] font-semibold mb-2">No certificates yet</p>
                  <p className="text-[13px] text-white/40 mb-6">Link a certificate using your Certificate ID to get started.</p>
                  <button onClick={() => setTab('link')}
                    className="btn-shine h-10 px-6 rounded-full text-[13px] font-semibold text-white"
                    style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
                    Link Certificate →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {certificates.map((cert, i) => (
                    <motion.div key={cert._id ?? i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl px-7 py-5 flex items-center gap-5 hover:border-white/[0.12] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-lg shrink-0">🎓</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-[14px] font-semibold">{cert.courseName ?? cert.course ?? '—'}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            cert.status === 'issued'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {cert.status === 'issued' ? 'Valid' : 'Revoked'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-[12px] text-white/35 flex-wrap">
                          <span className="font-mono">{cert.certId}</span>
                          <span>{cert.university ?? 'KTU'}</span>
                          <span>{cert.yearOfCompletion ?? cert.year ?? '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => copyLink(cert.certId)}
                          className="h-8 px-4 rounded-lg border border-white/[0.1] text-[12px] text-white/40 hover:text-white hover:border-white/25 transition-all">
                          Copy Link
                        </button>
                        {cert.ipfsUrl && (
                          <a href={cert.ipfsUrl} target="_blank" rel="noopener noreferrer">
                            <button className="h-8 px-4 rounded-lg border border-[#38bdf8]/20 text-[12px] text-[#38bdf8]/70 hover:bg-[#38bdf8]/10 transition-all">
                              View PDF
                            </button>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Link Certificate tab ──────────────────── */}
          {tab === 'link' && (
            <div className="max-w-[560px]">
              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 mb-5">
                <h3 className="text-[16px] font-[650] mb-2">Link a Certificate</h3>
                <p className="text-[13px] text-white/40 mb-6 leading-relaxed">
                  Enter the Certificate ID provided by your institution. The certificate email must match your registered email address.
                </p>
                <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-white/30 mb-2">
                  Certificate ID
                </label>
                <div className="flex gap-3">
                  <input
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLink()}
                    placeholder="e.g. CERT-2024-001"
                    className="flex-1 h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-mono placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  />
                  <button onClick={handleLink} disabled={linking || !linkInput.trim()}
                    className="btn-shine h-12 px-6 rounded-xl text-[14px] font-semibold text-white disabled:opacity-40"
                    style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
                    {linking ? '…' : 'Link'}
                  </button>
                </div>
              </div>

              {/* Info card */}
              <div className="bg-[#0a0a0a] border border-[#38bdf8]/15 rounded-2xl p-6">
                <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#38bdf8]/60 mb-3">How it works</p>
                {[
                  'Your institution issues a certificate and records it on the Ethereum blockchain.',
                  'They give you a Certificate ID (e.g. CERT-2024-001).',
                  'You enter it above — the system checks that the certificate email matches yours.',
                  'Once linked, it appears in your dashboard and you can share a verification link.',
                ].map((s, i) => (
                  <div key={i} className="flex gap-3 mb-3 last:mb-0">
                    <span className="text-[11px] font-mono text-[#38bdf8]/50 mt-0.5 shrink-0">0{i + 1}</span>
                    <p className="text-[13px] text-white/40 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Profile tab ───────────────────────────── */}
          {tab === 'profile' && (
            <div className="max-w-[480px]">
              <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/[0.06]">
                  <div className="w-14 h-14 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-2xl">🎓</div>
                  <div>
                    <p className="text-[18px] font-[700] mb-0.5">{user?.name}</p>
                    <p className="text-[13px] text-white/40">{user?.email}</p>
                  </div>
                </div>

                {[
                  ['Role',       'Student'],
                  ['Course',     user?.course     ?? '—'],
                  ['Student ID', user?.studentId  ?? '—'],
                  ['University', user?.university ?? 'KTU'],
                  ['Joined',     user?.createdAt  ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-3 border-b border-white/[0.05] text-[13px]">
                    <span className="text-white/30">{k}</span>
                    <span className="text-white/70 font-medium">{v}</span>
                  </div>
                ))}

                <div className="mt-6">
                  <p className="text-[11px] text-white/25 mb-3 tracking-[0.08em] uppercase">Linked Certificates</p>
                  <p className="text-[32px] font-[800] tracking-[-0.04em]"
                    style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {certificates.length}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}