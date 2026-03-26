/**
 * /verify  —  Public certificate verification page.
 *
 * Calls GET /api/public/verify/:certId (real backend + blockchain).
 * Also reads ?certId= from the URL so email verify-links work directly.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { publicService } from '@/services/api'

// ── helpers ───────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
const shortAddr = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—'

export default function Verify() {
  const [searchParams] = useSearchParams()

  const [certId,  setCertId]  = useState(searchParams.get('certId') ?? '')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)   // null | { status, certificate, blockchain, warnings, message }

  // Auto-verify if certId came from the URL (e.g. email link)
  useEffect(() => {
    const id = searchParams.get('certId')
    if (id) {
      setCertId(id)
      doVerify(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doVerify = async (id) => {
    const query = (id ?? certId).trim()
    if (!query) return

    setLoading(true)
    setResult(null)

    try {
      const res  = await publicService.verifyCertificate(query)
      const data = res.data   // { success, verified, status, certificate, blockchain, warnings }

      setResult({
        found:       true,
        valid:       data.verified && data.status === 'valid',
        revoked:     data.status === 'revoked',
        certificate: data.certificate,
        blockchain:  data.blockchain,
        warnings:    data.warnings ?? [],
      })
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        setResult({ found: false })
      } else {
        setResult({ found: false, error: err?.response?.data?.message ?? 'Verification failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = () => doVerify(certId)

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-[680px] mx-auto px-6">

        {/* ── Back ─────────────────────────────────────── */}
        <Link to="/" data-hover>
          <button className="group inline-flex items-center gap-2.5 h-9 pl-3 pr-5 mb-12 rounded-full border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.2] transition-all duration-200">
            <ArrowLeft size={14} className="text-white/40 group-hover:text-white/80 group-hover:-translate-x-0.5 transition-all duration-200" />
            <span className="text-[13px] font-medium text-white/40 group-hover:text-white/80 transition-colors duration-200">Back to home</span>
          </button>
        </Link>

        {/* ── Header ───────────────────────────────────── */}
        <div className="mb-12">
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-white/25 mb-5 flex items-center gap-3">
            <span className="w-6 h-px bg-white/20" /> Public Verification
          </p>
          <h1 className="text-[48px] font-[800] tracking-[-0.04em] leading-tight mb-3">
            Verify a<br /><span className="grad-text">Certificate.</span>
          </h1>
          <p className="text-[15px] text-white/40 leading-relaxed">
            Enter a certificate ID to verify its authenticity directly on the Ethereum blockchain. No login required.
          </p>
        </div>

        {/* ── Search ───────────────────────────────────── */}
        <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-2xl p-6 mb-4">
          <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-white/30 mb-3">
            Certificate ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={certId}
              onChange={e => setCertId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="Paste your Certificate ID here"
              className="flex-1 h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-mono placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !certId.trim()}
              data-hover
              className="btn-shine h-12 px-7 rounded-xl text-[14px] font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(90deg, #e040fb 0%, #a855f7 50%, #38bdf8 100%)' }}
            >
              {loading ? '…' : 'Verify'}
            </button>
          </div>
        </div>

        {/* ── Loading ───────────────────────────────────── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 py-12 text-white/30 text-[14px]"
          >
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Querying blockchain…
          </motion.div>
        )}

        {/* ── Results ───────────────────────────────────── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >

              {/* ── Not found / error ── */}
              {!result.found && (
                <div className="bg-[#0c0c0c] border border-red-500/20 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mx-auto mb-4">✗</div>
                  <h3 className="text-[20px] font-[700] text-red-400 mb-2">Certificate Not Found</h3>
                  <p className="text-[13px] text-white/40">
                    {result.error ?? 'No certificate with this ID exists in CredChain.'}
                  </p>
                </div>
              )}

              {/* ── Revoked ── */}
              {result.found && result.revoked && (
                <div className="bg-[#0c0c0c] border border-yellow-500/20 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl">⚠</div>
                    <div>
                      <h3 className="text-[20px] font-[700] text-yellow-400">Certificate Revoked</h3>
                      <p className="text-[13px] text-white/40">This certificate is no longer valid.</p>
                    </div>
                  </div>
                  {result.certificate && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
                      <Row label="Student"    value={result.certificate.studentName} />
                      <Row label="Programme"  value={result.certificate.courseName} />
                      <Row label="Cert ID"    value={result.certificate.certId} mono />
                      {result.certificate.revokedAt && (
                        <Row label="Revoked On" value={fmtDate(result.certificate.revokedAt)} />
                      )}
                      {result.certificate.revokeReason && (
                        <Row label="Reason" value={result.certificate.revokeReason} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Valid ── */}
              {result.found && result.valid && (
                <div>
                  {/* Warnings (blockchain/DB mismatch) */}
                  {result.warnings?.length > 0 && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/20 mb-4">
                      <span className="text-yellow-400 shrink-0">⚠</span>
                      <p className="text-[13px] text-yellow-300/80">{result.warnings[0]}</p>
                    </div>
                  )}

                  {/* Status bar */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/[0.07] border border-green-500/20 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] shrink-0" />
                    <span className="text-[13px] font-medium text-green-400">Certificate Verified on Ethereum Blockchain</span>
                    <span className="ml-auto text-[11px] font-mono text-white/25 shrink-0">
                      {fmtDate(result.certificate?.issuedAt)}
                    </span>
                  </div>

                  {/* Certificate card */}
                  <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <div className="h-1" style={{ background: 'linear-gradient(90deg,#e040fb,#a855f7,#38bdf8,#00e5ff)' }} />

                    <div className="p-8">
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-2">Certificate ID</p>
                          <p className="text-[15px] font-[650] font-mono text-white/80 break-all">{result.certificate?.certId}</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-[11px] font-semibold text-green-400 flex items-center gap-1.5 shrink-0 ml-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Valid
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        {[
                          { l: 'Student Name',      v: result.certificate?.studentName },
                          { l: 'Programme',         v: result.certificate?.courseName },
                          { l: 'Year of Completion',v: result.certificate?.yearOfCompletion },
                          { l: 'Grade',             v: result.certificate?.grade },
                          { l: 'Issue Date',        v: fmtDate(result.certificate?.issuedAt) },
                          { l: 'Issuer Address',    v: shortAddr(result.blockchain?.issuedBy ?? result.certificate?.txHash), mono: true },
                        ].filter(f => f.v).map(f => (
                          <div key={f.l}>
                            <p className="text-[11px] tracking-[0.06em] uppercase text-white/25 mb-1.5">{f.l}</p>
                            <p className={`text-[14px] font-[550] ${f.mono ? 'font-mono text-white/60' : 'text-white'}`}>{f.v}</p>
                          </div>
                        ))}
                      </div>

                      {/* Tx hash */}
                      {result.certificate?.txHash && (
                        <div className="mt-6 pt-5 border-t border-white/[0.06]">
                          <p className="text-[11px] uppercase tracking-[0.06em] text-white/25 mb-1.5">Transaction Hash</p>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${result.certificate.txHash}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-[12px] font-mono text-[#38bdf8]/60 hover:text-[#38bdf8] transition-colors break-all"
                          >
                            {result.certificate.txHash}
                          </a>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 pt-6 border-t border-white/[0.06] flex gap-3 flex-wrap">
                        {result.certificate?.ipfsUrl && (
                          <a
                            href={result.certificate.ipfsUrl}
                            target="_blank" rel="noopener noreferrer"
                            data-hover
                            className="flex-1 min-w-[160px] h-11 rounded-xl border border-white/[0.1] text-[13px] font-medium text-white/50 hover:text-white hover:border-white/25 transition-all flex items-center justify-center gap-2"
                          >
                            📄 View Certificate PDF
                          </a>
                        )}
                        <button
                          data-hover
                          onClick={() => navigator.clipboard.writeText(window.location.href)}
                          className="h-11 px-5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] font-medium text-white/40 hover:text-white/70 transition-all"
                        >
                          Copy Link
                        </button>
                      </div>

                      <div className="mt-4">
                        <Link to="/" data-hover>
                          <button className="group w-full h-11 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all flex items-center justify-center gap-2">
                            <ArrowLeft size={13} className="text-white/30 group-hover:text-white/60 transition-all duration-200" />
                            <span className="text-[13px] font-medium text-white/30 group-hover:text-white/60 transition-colors duration-200">
                              Back to home
                            </span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ── tiny helper ───────────────────────────────────────────────
function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[12px] text-white/30 uppercase tracking-wide shrink-0">{label}</span>
      <span className={`text-[13px] font-medium text-right break-all ${mono ? 'font-mono text-white/60' : ''}`}>{value}</span>
    </div>
  )
}