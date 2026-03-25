import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const MOCK = {
  'CERT-2024-001': {
    valid: true, revoked: false,
    studentName: 'Alexandra Chen', rollNo: '2024CS001', course: 'Computer Science', year: '2024',
    issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    timestamp: 1706745600,
  },
  'CERT-2024-002': {
    valid: true, revoked: false,
    studentName: 'James Rodriguez', rollNo: '2024MBA002', course: 'Business Administration', year: '2024',
    issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    timestamp: 1709424000,
  },
  'CERT-2024-003': {
    valid: false, revoked: true,
    studentName: 'Sam Taylor', rollNo: '2024ENG003', course: 'Engineering', year: '2024',
    issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    ipfsHash: 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51',
    timestamp: 1704067200,
  }
}

const fmt = (ts) => new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const shortAddr = (a) => `${a.slice(0,6)}…${a.slice(-4)}`

export default function Verify() {
  const [certId, setCertId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleVerify = async () => {
    if (!certId.trim()) return
    setLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 900))
    const cert = MOCK[certId.trim()]
    setResult(cert ? { found: true, ...cert } : { found: false })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-[680px] mx-auto px-6">

        {/* ── Back to Home ─────────────────────────────── */}
        <Link to="/" data-hover>
          <button className="group inline-flex items-center gap-2.5 h-9 pl-3 pr-5 mb-12 rounded-full border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.2] transition-all duration-200">
            <ArrowLeft
              size={14}
              className="text-white/40 group-hover:text-white/80 group-hover:-translate-x-0.5 transition-all duration-200"
            />
            <span className="text-[13px] font-medium text-white/40 group-hover:text-white/80 transition-colors duration-200">
              Back to home
            </span>
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
              placeholder="e.g. CERT-2024-001"
              className="flex-1 h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-mono placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
              style={{ fontFamily: 'Geist Mono, monospace' }}
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

          {/* Sample IDs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-[11px] text-white/25 mr-1">Try:</span>
            {Object.keys(MOCK).map(id => (
              <button
                key={id}
                onClick={() => setCertId(id)}
                data-hover
                className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[12px] font-mono text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading ───────────────────────────────────── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 py-12 text-white/30 text-[14px]"
          >
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Querying blockchain…
          </motion.div>
        )}

        {/* ── Result ────────────────────────────────────── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Not Found */}
              {!result.found && (
                <div className="bg-[#0c0c0c] border border-red-500/20 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mx-auto mb-4">✗</div>
                  <h3 className="text-[20px] font-[700] text-red-400 mb-2">Certificate Not Found</h3>
                  <p className="text-[13px] text-white/40">No certificate with this ID exists on the blockchain.</p>
                </div>
              )}

              {/* Revoked */}
              {result.found && result.revoked && (
                <div className="bg-[#0c0c0c] border border-yellow-500/20 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl mx-auto mb-4">⚠</div>
                  <h3 className="text-[20px] font-[700] text-yellow-400 mb-2">Certificate Revoked</h3>
                  <p className="text-[13px] text-white/40">This certificate was revoked by the issuing institution.</p>
                  <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
                    <p className="text-[12px] text-white/30 mb-1">Student</p>
                    <p className="text-[15px] font-semibold">{result.studentName}</p>
                  </div>
                </div>
              )}

              {/* Valid */}
              {result.found && result.valid && !result.revoked && (
                <div>
                  {/* Status bar */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/[0.07] border border-green-500/20 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    <span className="text-[13px] font-medium text-green-400">Certificate Verified on Ethereum Blockchain</span>
                    <span className="ml-auto text-[11px] font-mono text-white/25">{fmt(result.timestamp)}</span>
                  </div>

                  {/* Certificate card */}
                  <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <div className="h-1" style={{ background: 'linear-gradient(90deg, #e040fb, #a855f7, #38bdf8, #00e5ff)' }} />

                    <div className="p-8">
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <p className="text-[11px] tracking-[0.1em] uppercase text-white/25 mb-2">Certificate ID</p>
                          <p className="text-[15px] font-[650] font-mono text-white/80">{certId}</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-[11px] font-semibold text-green-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          Valid
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        {[
                          { l: 'Student Name',    v: result.studentName },
                          { l: 'Roll Number',     v: result.rollNo },
                          { l: 'Course',          v: result.course },
                          { l: 'Year',            v: result.year },
                          { l: 'Issue Date',      v: fmt(result.timestamp) },
                          { l: 'Issuer Address',  v: shortAddr(result.issuer), mono: true },
                        ].map(f => (
                          <div key={f.l}>
                            <p className="text-[11px] tracking-[0.06em] uppercase text-white/25 mb-1.5">{f.l}</p>
                            <p className={`text-[14px] font-[550] ${f.mono ? 'font-mono text-white/60' : 'text-white'}`}>{f.v}</p>
                          </div>
                        ))}
                      </div>

                      {/* IPFS + back */}
                      <div className="mt-8 pt-6 border-t border-white/[0.06] flex gap-3">
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-hover
                          className="flex-1 h-11 rounded-xl border border-white/[0.1] text-[13px] font-medium text-white/50 hover:text-white hover:border-white/25 transition-all flex items-center justify-center gap-2"
                        >
                          📄 View Certificate PDF
                        </a>
                        <button
                          data-hover
                          onClick={() => navigator.clipboard.writeText(result.ipfsHash)}
                          className="h-11 px-5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] font-medium text-white/40 hover:text-white/70 transition-all"
                        >
                          Copy IPFS
                        </button>
                      </div>

                      {/* Back to home — inside card after result */}
                      <div className="mt-4">
                        <Link to="/" data-hover>
                          <button className="group w-full h-11 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all flex items-center justify-center gap-2">
                            <ArrowLeft size={13} className="text-white/30 group-hover:text-white/60 group-hover:-translate-x-0.5 transition-all duration-200" />
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