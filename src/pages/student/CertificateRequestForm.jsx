import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudentPortal } from '@/contexts/StudentPortalContext'
import { studentPortalService } from '@/services/api'
import {
  ArrowLeft, AlertCircle, Loader2, CheckCircle2,
  CreditCard, ShieldCheck, Copy, ExternalLink,
} from 'lucide-react'

// Degree + Provisional are always requested together — fixed fee
const CERT_AMOUNT = 2500   // ₹2000 Degree + ₹500 Provisional
const CERT_TYPES  = ['Degree Certificate', 'Provisional Certificate']

const STEPS = ['Details', 'Payment', 'Confirm']

// ── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
            i < current ? 'text-green-400' : i === current ? 'text-white' : 'text-white/25'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              i < current
                ? 'bg-green-500/20 border border-green-500/40'
                : i === current
                  ? 'border border-white/30 bg-white/10'
                  : 'border border-white/[0.1] bg-transparent'
            }`}>
              {i < current ? '✓' : i + 1}
            </span>
            {s}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px transition-colors ${i < current ? 'bg-green-500/40' : 'bg-white/[0.08]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
      <AlertCircle size={10} /> {msg}
    </p>
  )
}

function InputField({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-2">
        {label}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  )
}

// ── Step 1: Details ───────────────────────────────────────────────────────────
function DetailsStep({ form, errors, onChange, onNext }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 mb-5">
        <h2 className="text-[16px] font-[650] mb-1">Request Details</h2>
        <p className="text-[13px] text-white/40 mb-7">Fill in your delivery and contact information.</p>

        <div className="grid grid-cols-2 gap-5">
          <InputField label="Mobile Number" error={errors.mobile}>
            <input
              type="tel"
              value={form.mobile}
              onChange={onChange('mobile')}
              placeholder="+91 9876543210"
              className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                errors.mobile ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'
              }`}
            />
          </InputField>

          <InputField label="Email Address" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={onChange('email')}
              placeholder="you@example.com"
              className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                errors.email ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'
              }`}
            />
          </InputField>

          <div className="col-span-2">
            <InputField label="Delivery Address" error={errors.address}>
              <textarea
                value={form.address}
                onChange={onChange('address')}
                placeholder="House No., Street, City, State"
                rows={3}
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] resize-none ${
                  errors.address ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'
                }`}
              />
            </InputField>
          </div>

          <InputField label="Pincode" error={errors.pincode}>
            <input
              type="text"
              value={form.pincode}
              onChange={onChange('pincode')}
              placeholder="682001"
              maxLength={6}
              className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] font-mono placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                errors.pincode ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'
              }`}
            />
          </InputField>
        </div>

        {/* Certificate selection — fixed checkbox, cannot be unchecked */}
        <div className="mt-7">
          <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-3">Certificate Type</p>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="mt-0.5 w-5 h-5 rounded-md border-2 border-[#38bdf8]/60 bg-[#38bdf8]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} className="text-[#38bdf8]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Degree Certificate + Provisional Certificate</p>
              <p className="text-[12px] text-white/40 mt-0.5">Both certificates are issued together as part of the same request</p>
            </div>
          </label>
          <FieldError msg={errors.certificateType} />
        </div>

        {/* Fee preview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 px-5 py-4 rounded-xl bg-[#38bdf8]/[0.05] border border-[#38bdf8]/15 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] text-[#38bdf8]/60 uppercase tracking-[0.08em] mb-1">Total Certificate Fee</p>
            <div className="flex items-center gap-2 text-[12px] text-white/40">
              <span>Degree ₹2,000</span>
              <span className="text-white/20">+</span>
              <span>Provisional ₹500</span>
            </div>
          </div>
          <p className="text-[24px] font-[800] tracking-[-0.04em]"
            style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ₹{CERT_AMOUNT.toLocaleString('en-IN')}
          </p>
        </motion.div>
      </div>

      <button
        onClick={onNext}
        className="btn-shine h-12 px-8 rounded-xl text-[14px] font-semibold text-white"
        style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}
      >
        Proceed to Payment →
      </button>
    </motion.div>
  )
}

// ── Step 2: Payment ───────────────────────────────────────────────────────────
function PaymentStep({ form, onPay, paying, paid }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 mb-5 max-w-[540px]">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
            <CreditCard size={18} className="text-[#a855f7]" />
          </div>
          <div>
            <p className="text-[15px] font-[650]">Payment</p>
            <p className="text-[12px] text-white/35">Secure mock payment gateway</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {[
            ['Certificate', 'Degree + Provisional Certificate'],
            ['Delivery To', form.address ? `${form.address}, ${form.pincode}` : '—'],
            ['Contact',     form.email],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[13px]">
              <span className="text-white/35">{k}</span>
              <span className="text-white/70 text-right max-w-[260px] truncate">{v}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center">
            <span className="text-[13px] text-white/35">Total Amount</span>
            <span className="text-[22px] font-[800] tracking-[-0.04em]"
              style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{CERT_AMOUNT.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="rounded-xl p-5 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #38bdf8, transparent)', transform: 'translate(30%, -30%)' }} />
          <p className="text-[11px] text-white/40 tracking-[0.1em] uppercase mb-4">Demo Card</p>
          <p className="text-[18px] font-mono text-white/80 tracking-[0.15em] mb-4">•••• •••• •••• 4242</p>
          <div className="flex justify-between text-[11px] text-white/50">
            <span>DEMO STUDENT</span><span>12/28</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <ShieldCheck size={14} className="text-green-400 shrink-0" />
          <p className="text-[12px] text-white/35">This is a simulated payment for demonstration. No real transaction occurs.</p>
        </div>

        <AnimatePresence mode="wait">
          {paid ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/25">
              <CheckCircle2 size={20} className="text-green-400 shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-green-400">Payment Successful</p>
                <p className="text-[12px] text-green-400/60">₹{CERT_AMOUNT.toLocaleString('en-IN')} — MOCK-{Date.now().toString(36).toUpperCase()}</p>
              </div>
            </motion.div>
          ) : (
            <motion.button key="pay" onClick={onPay} disabled={paying}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg, #a855f7, #38bdf8)' }}>
              {paying
                ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing…</span>
                : `Pay Now  ₹${CERT_AMOUNT.toLocaleString('en-IN')}`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Step 3: Confirm ───────────────────────────────────────────────────────────
function ConfirmStep({ paid, submitting, submitted, requestResult, onSubmit }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(requestResult?.requestId ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (submitted && requestResult) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }} className="max-w-[520px]">
        <div className="bg-[#0a0a0a] border border-green-500/25 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-[22px] font-[800] tracking-[-0.04em] mb-2">Request Submitted!</h2>
          <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
            Both your Degree Certificate and Provisional Certificate requests have been received.
            You will receive updates at your registered email.
          </p>

          <div className="bg-[#111] border border-white/[0.07] rounded-xl px-6 py-5 mb-6 text-left">
            {[
              ['Request ID(s)',  requestResult.requestId ?? requestResult._id ?? '—'],
              ['Status',         requestResult.status ?? 'pending'],
              ['Certificates',   'Degree + Provisional'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-white/[0.05] last:border-0 text-[13px]">
                <span className="text-white/35 shrink-0">{k}</span>
                <span className={`font-mono font-medium text-right break-all ml-4 ${k === 'Status' ? 'text-yellow-400' : 'text-white/70'}`}>{v}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleCopy}
              className="flex-1 h-11 rounded-xl border border-white/[0.1] text-[13px] text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy ID'}
            </button>
            <Link to="/student-portal/status" className="flex-1">
              <button className="w-full h-11 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
                <ExternalLink size={14} /> Track Status
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 max-w-[520px] mb-5">
        <h2 className="text-[16px] font-[650] mb-2">Final Confirmation</h2>
        <p className="text-[13px] text-white/40 mb-7 leading-relaxed">
          Review your request and submit. Both certificates will be recorded on-chain.
        </p>
        {!paid && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertCircle size={14} className="text-amber-400 shrink-0" />
            <p className="text-[13px] text-amber-400">Complete payment in the previous step to enable submission.</p>
          </div>
        )}
        {paid && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            <p className="text-[13px] text-green-400">Payment confirmed. You can now submit your request.</p>
          </div>
        )}
        <button
          onClick={onSubmit}
          disabled={!paid || submitting}
          className="w-full h-12 rounded-xl text-[14px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: paid ? 'linear-gradient(90deg, #38bdf8, #a855f7)' : 'rgba(255,255,255,0.05)' }}
        >
          {submitting
            ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Submitting…</span>
            : 'Submit Certificate Request →'}
        </button>
      </div>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CertificateRequestForm() {
  const { studentUser, studentToken, saveRequestIds } = useStudentPortal()
  const navigate = useNavigate()

  const [step,          setStep]          = useState(0)
  const [form,          setForm]          = useState({ mobile: '', email: '', address: '', pincode: '' })
  const [errors,        setErrors]        = useState({})
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [submitting,    setSubmitting]    = useState(false)
  const [submitted,     setSubmitted]     = useState(false)
  const [requestResult, setRequestResult] = useState(null)
  const [apiError,      setApiError]      = useState('')

  const handleChange = (k) => (ev) => {
    setForm(prev => ({ ...prev, [k]: ev.target.value }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const validateDetails = () => {
    const e = {}
    if (!form.mobile.trim())   e.mobile  = 'Mobile number is required'
    else if (!/^\+?[\d\s-]{8,}$/.test(form.mobile)) e.mobile = 'Enter a valid mobile number'
    if (!form.email.trim())    e.email   = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.address.trim())  e.address = 'Delivery address is required'
    if (!form.pincode.trim())  e.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateDetails()) return
    setStep(s => Math.min(s + 1, 2))
  }

  const handlePay = async () => {
    setPaymentStatus('processing')
    await new Promise(r => setTimeout(r, 2000))
    setPaymentStatus('paid')
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setApiError('')
    try {
      // Submit both Degree + Provisional in parallel
      const results = await Promise.all(
        CERT_TYPES.map(type =>
          studentPortalService.requestCertificate({
            mobile:          form.mobile,
            email:           form.email,
            address:         form.address,
            pincode:         form.pincode,
            certificateType: type,
            amount:          type === 'Degree Certificate' ? 2000 : 500,
            paymentStatus:   'paid',
          }, studentToken)
        )
      )

      const allIds = results
        .map(r => (r.data?.request ?? r.data)?.requestId)
        .filter(Boolean)

      // Save request IDs to context + localStorage so Track page can auto-load
      if (allIds.length) saveRequestIds(allIds)

      const primary = results[0].data?.request ?? results[0].data
      primary.requestId = allIds.join(', ')

      setRequestResult(primary)
      setSubmitted(true)
    } catch (err) {
      setApiError(err?.response?.data?.message ?? 'Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-[220px] shrink-0 border-r border-white/[0.06] flex flex-col py-8 px-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)' }}>⬡</div>
          <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
        </Link>
        <div className="flex-1">
          <p className="text-[11px] text-white/25 uppercase tracking-[0.08em] mb-3 px-3">Request Certificate</p>
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] mb-1 transition-all ${
              i === step ? 'bg-white/[0.06] text-white' : i < step ? 'text-green-400/70' : 'text-white/25'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                i < step ? 'bg-green-500/20 border border-green-500/40' : i === step ? 'border border-white/30' : 'border border-white/10'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] pt-5">
          <Link to="/student-portal">
            <button className="w-full flex items-center gap-2 text-left text-[12px] text-white/25 hover:text-white/60 transition-colors py-1">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-10 h-14 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold">Request a Certificate</h1>
          <span className="text-[12px] text-white/25 font-mono">{studentUser?.registerNumber}</span>
        </div>

        <div className="px-10 py-8 max-w-[800px]">
          <StepBar current={step} />

          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-[13px] text-red-400">{apiError}</p>
            </div>
          )}

          {step === 0 && (
            <DetailsStep form={form} errors={errors} onChange={handleChange} onNext={handleNext} />
          )}

          {step === 1 && (
            <>
              <PaymentStep form={form} onPay={handlePay} paying={paymentStatus === 'processing'} paid={paymentStatus === 'paid'} />
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(0)}
                  className="h-12 px-6 rounded-xl border border-white/[0.1] text-[14px] text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={handleNext} disabled={paymentStatus !== 'paid'}
                  className="btn-shine h-12 px-8 rounded-xl text-[14px] font-semibold text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <ConfirmStep paid={paymentStatus === 'paid'} submitting={submitting}
                submitted={submitted} requestResult={requestResult} onSubmit={handleSubmit} />
              {!submitted && (
                <button onClick={() => setStep(1)}
                  className="mt-3 h-12 px-6 rounded-xl border border-white/[0.1] text-[14px] text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}