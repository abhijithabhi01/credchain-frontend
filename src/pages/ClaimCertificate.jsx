/**
 * /claim?token=xxx
 *
 * Magic-link landing page.
 * 1. Reads token from URL.
 * 2. Validates it (preview cert info, check expiry).
 * 3. On "Claim", calls POST /api/claim → gets JWT back.
 * 4. Stores JWT in localStorage → redirects to /student.
 */
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { claimService } from '@/services/api'

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#a855f7] animate-spin" />
    </div>
  )
}

export default function ClaimCertificate() {
  const [params]        = useSearchParams()
  const navigate        = useNavigate()

  const token = params.get('token')

  const [status,   setStatus]   = useState('loading') // loading | valid | invalid | expired | claimed | done | error
  const [preview,  setPreview]  = useState(null)
  const [message,  setMessage]  = useState('')
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('invalid'); setMessage('No claim token found in this link.'); return }
    claimService.validateToken(token)
      .then(({ data }) => {
        if (data.valid) { setStatus('valid'); setPreview(data.preview) }
        else             setStatus('invalid')
      })
      .catch(err => {
        const msg = err?.response?.data?.message || 'Invalid or expired link.'
        if (msg.toLowerCase().includes('expired'))    setStatus('expired')
        else if (msg.toLowerCase().includes('used'))  setStatus('claimed')
        else                                          setStatus('invalid')
        setMessage(msg)
      })
  }, [token])

  const handleClaim = async () => {
    setClaiming(true)
    try {
      const { data } = await claimService.claimCert(token)
      if (data.success) {
        // Log the student in immediately
        localStorage.setItem('token', data.token)
        setStatus('done')
        setTimeout(() => navigate('/student'), 2000)
      }
    } catch (err) {
      setStatus('error')
      setMessage(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-base font-bold text-white"
          style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>⬡</div>
        <span className="text-[16px] font-semibold tracking-[0.04em]">CredChain</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0f0f0f] border border-white/[0.08] rounded-2xl overflow-hidden"
      >
        {status === 'loading' && <Spinner />}

        {status === 'valid' && preview && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎓</div>
              <h1 className="text-[20px] font-[700] mb-1">Claim Your Certificate</h1>
              <p className="text-[13px] text-white/40">Click below to link this certificate to your account.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 mb-6">
              <dl className="space-y-3">
                {[
                  ['Student',    preview.studentName],
                  ['Programme',  preview.courseName],
                  ['Year',       preview.yearOfCompletion],
                  ['Cert ID',    preview.certId],
                ].map(([label, value]) => value && (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-[12px] text-white/30 uppercase tracking-wide shrink-0">{label}</dt>
                    <dd className="text-[13px] font-medium text-right break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <button onClick={handleClaim} disabled={claiming}
              className="w-full h-12 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg,#a855f7,#38bdf8)' }}>
              {claiming
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Claiming…</>
                : '📥 Claim Certificate →'}
            </button>

            <p className="text-center text-[11px] text-white/25 mt-4">
              We'll create your CredChain account (or log you in) automatically.
            </p>
          </div>
        )}

        {status === 'done' && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-[18px] font-[700] mb-2">Certificate Claimed!</h2>
            <p className="text-[13px] text-white/40">Redirecting to your dashboard…</p>
          </div>
        )}

        {(status === 'invalid' || status === 'expired' || status === 'claimed' || status === 'error') && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">
              {status === 'claimed' ? '🔒' : status === 'expired' ? '⏰' : '❌'}
            </div>
            <h2 className="text-[18px] font-[700] mb-2">
              {status === 'claimed'  ? 'Already Claimed'
               : status === 'expired' ? 'Link Expired'
               : 'Invalid Link'}
            </h2>
            <p className="text-[13px] text-white/40 mb-6">
              {message ||
                (status === 'claimed'  ? 'This claim link has already been used.' :
                 status === 'expired'  ? 'This link has expired. Contact your issuer for a new one.' :
                 'This claim link is invalid or does not exist.')}
            </p>
            <Link to="/login"
              className="inline-block h-10 px-6 rounded-full border border-white/10 text-[13px] text-white/50 hover:text-white hover:border-white/30 transition-all">
              Go to Login →
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}