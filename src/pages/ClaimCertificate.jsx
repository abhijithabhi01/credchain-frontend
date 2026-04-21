/**
 * /claim?token=xxx  —  Magic-link landing page.
 *
 * Key behaviour:
 *  1. On mount, any currently-logged-in user is signed out first.
 *     This prevents role-guard conflicts (e.g. issuer tab open).
 *  2. The claim token is validated without consuming it (GET /api/claim/validate).
 *  3. When the student clicks "Claim", the token is consumed (POST /api/claim).
 *  4. The returned JWT is written to localStorage and the page hard-navigates
 *     to /student — guaranteeing AuthContext re-hydrates cleanly.
 */
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { claimService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

/* ── tiny helpers ────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#a855f7] animate-spin" />
    </div>
  )
}

function StatusIcon({ status }) {
  const map = { claimed: '🔒', expired: '⏰', done: '✅' }
  return <div className="text-5xl mb-4">{map[status] ?? '❌'}</div>
}

/* ── component ───────────────────────────────────────────────── */
export default function ClaimCertificate() {
  const [params]      = useSearchParams()
  const token         = params.get('token')

  // Pull whatever is available from AuthContext.
  // We only use `logout` — we never rely on `setSession` being present
  // because its absence is exactly what caused the original silent failure.
  const auth = useAuth()
  const logout = auth?.logout

  const [status,   setStatus]   = useState('loading')   // loading | valid | claiming | done | invalid | expired | claimed | error
  const [preview,  setPreview]  = useState(null)
  const [message,  setMessage]  = useState('')
  const [claiming, setClaiming] = useState(false)

  // Prevent double-init in React StrictMode
  const initialised = useRef(false)

  /* ── Step 1: sign out whoever is currently logged in ───────── */
  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    const init = async () => {
      // Sign out any currently logged-in user (issuer, admin, another student…)
      // so the Guard on /student won't bounce us with the wrong role.
      try {
        if (logout) await logout()
      } catch (_) {
        // logout failed or wasn't needed — always clear storage manually
      }
      // Belt-and-braces: wipe token from every common key name
      ;['token', 'authToken', 'jwt', 'credchain_token'].forEach(k =>
        localStorage.removeItem(k)
      )

      /* ── Step 2: validate claim token ── */
      if (!token) {
        setStatus('invalid')
        setMessage('No claim token found in this link. Please use the link from your email.')
        return
      }

      try {
        const { data } = await claimService.validateToken(token)
        if (data.valid) {
          setPreview(data.preview)
          setStatus('valid')
        } else {
          setStatus('invalid')
          setMessage(data.message || 'This claim link is invalid.')
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Invalid or expired link.'
        if (msg.toLowerCase().includes('expired'))        setStatus('expired')
        else if (msg.toLowerCase().includes('used') ||
                 msg.toLowerCase().includes('already'))   setStatus('claimed')
        else                                              setStatus('invalid')
        setMessage(msg)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  /* ── Step 3: consume token ──────────────────────────────────── */
  const handleClaim = async () => {
    if (claiming) return
    setClaiming(true)
    setStatus('claiming')

    try {
      const { data } = await claimService.claimCert(token)

      if (!data.success) {
        throw new Error(data.message || 'Claim failed. Please try again.')
      }

      /* ── Persist the new student session ── */
      // Try the context's setSession first (if it exists and works).
      // Otherwise fall back to writing directly to localStorage.
      const sessionSaved = (() => {
        try {
          if (typeof auth?.setSession === 'function') {
            auth.setSession(data.token, data.user)
            return true
          }
        } catch (_) { /* fall through */ }
        return false
      })()

      if (!sessionSaved) {
        // Direct localStorage write — works regardless of context implementation
        localStorage.setItem('token', data.token)
        // Some apps also store the user object
        try { localStorage.setItem('user', JSON.stringify(data.user)) } catch (_) {}
      }

      setStatus('done')

      // Hard navigation after a short success flash.
      // Using window.location instead of navigate() guarantees AuthContext
      // re-hydrates from localStorage with the new student token —
      // no stale-closure / wrong-role issues.
      setTimeout(() => {
        window.location.replace('/student')
      }, 1500)

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'

      if (msg.toLowerCase().includes('used') || msg.toLowerCase().includes('already')) {
        setStatus('claimed')
      } else if (msg.toLowerCase().includes('expired')) {
        setStatus('expired')
      } else {
        setStatus('error')
      }

      setMessage(msg)
      setClaiming(false)
    }
  }

  /* ── UI ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-12">
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-base font-bold text-white"
          style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}
        >⬡</div>
        <span className="text-[16px] font-semibold tracking-[0.04em]">CredChain</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0f0f0f] border border-white/[0.08] rounded-2xl overflow-hidden"
      >

        {/* ── Loading / validating ── */}
        {(status === 'loading') && (
          <div className="p-8 text-center">
            <Spinner />
            <p className="text-[13px] text-white/40 mt-4">Validating your claim link…</p>
          </div>
        )}

        {/* ── Ready to claim ── */}
        {status === 'valid' && preview && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎓</div>
              <h1 className="text-[20px] font-[700] mb-1">Claim Your Certificate</h1>
              <p className="text-[13px] text-white/40">
                You've been signed out. Click below to claim and log in as this student.
              </p>
            </div>

            {/* Certificate preview */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 mb-6">
              <dl className="space-y-3">
                {[
                  ['Student',   preview.studentName],
                  ['Programme', preview.courseName],
                  ['Year',      preview.yearOfCompletion],
                  ['Cert ID',   preview.certId],
                ].map(([label, value]) => value && (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-[12px] text-white/30 uppercase tracking-wide shrink-0">{label}</dt>
                    <dd className="text-[13px] font-medium text-right break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full h-12 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
              style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}
            >
              {claiming
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Claiming…</>
                : '📥 Claim Certificate →'}
            </button>

            <p className="text-center text-[11px] text-white/25 mt-4">
              We'll create your CredChain student account automatically if you don't have one.
            </p>
          </div>
        )}

        {/* ── Claiming in progress (button already shown spinner, this covers full-page) ── */}
        {status === 'claiming' && (
          <div className="p-8 text-center">
            <Spinner />
            <p className="text-[13px] text-white/40 mt-4">Linking certificate to your account…</p>
          </div>
        )}

        {/* ── Success ── */}
        {status === 'done' && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-[18px] font-[700] mb-2">Certificate Claimed!</h2>
            <p className="text-[13px] text-white/40">Redirecting to your student dashboard…</p>
          </div>
        )}

        {/* ── Error states ── */}
        {['invalid', 'expired', 'claimed', 'error'].includes(status) && (
          <div className="p-8 text-center">
            <StatusIcon status={status} />
            <h2 className="text-[18px] font-[700] mb-2">
              {status === 'claimed'  ? 'Already Claimed'
               : status === 'expired' ? 'Link Expired'
               : status === 'error'   ? 'Something Went Wrong'
               :                        'Invalid Link'}
            </h2>
            <p className="text-[13px] text-white/40 mb-6">
              {message || (
                status === 'claimed'  ? 'This claim link has already been used.' :
                status === 'expired'  ? 'This link has expired. Contact your issuer to resend it.' :
                status === 'error'    ? 'An unexpected error occurred. Please try again or contact support.' :
                                        'This claim link is invalid or does not exist.'
              )}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="inline-block h-10 px-6 rounded-full border border-white/10 text-[13px] text-white/50 hover:text-white hover:border-white/30 transition-all text-center"
              >
                Go to Login →
              </Link>
              <Link
                to="/"
                className="inline-block h-10 px-6 rounded-full text-[12px] text-white/25 hover:text-white/50 transition-all text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}