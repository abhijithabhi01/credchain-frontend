import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudentPortal } from '@/contexts/StudentPortalContext'
import { studentPortalService } from '@/services/api'
import {
  ArrowLeft, AlertCircle, Loader2, CheckCircle2,
  CreditCard, ShieldCheck, Copy, ExternalLink,
  Upload, User, FileText, CreditCard as IdCard, X, Eye,
  MapPin, Phone, Mail, Hash, GraduationCap, Calendar,
} from 'lucide-react'

const CERT_AMOUNT = 2500
const CERT_TYPES  = ['Degree Certificate', 'Provisional Certificate']
const STEPS       = ['Details', 'Documents', 'Payment', 'Summary', 'Submit']

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Step Bar ──────────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10 flex-wrap gap-y-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-semibold transition-all ${
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
            <div className={`w-6 h-px transition-colors ${i < current ? 'bg-green-500/40' : 'bg-white/[0.08]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Document Uploader ─────────────────────────────────────────────────────────
function DocUploader({ docKey, label, hint, icon: Icon, value, onChange, error }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)

  const processFile = (file) => {
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowed.includes(file.type)) {
      onChange(docKey, null, 'Only JPG, PNG or PDF files are accepted.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      onChange(docKey, null, 'File must be under 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUri = e.target.result
      onChange(docKey, { name: file.name, type: file.type, dataUri, size: file.size }, null)
      if (file.type.startsWith('image/')) setPreview(dataUri)
      else setPreview(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  const remove = (e) => {
    e.stopPropagation()
    onChange(docKey, null, null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
          value
            ? 'border-green-500/40 bg-green-500/[0.04] cursor-default'
            : dragging
              ? 'border-[#38bdf8]/60 bg-[#38bdf8]/[0.06] cursor-pointer'
              : error
                ? 'border-red-500/40 bg-red-500/[0.03] cursor-pointer hover:border-red-500/60'
                : 'border-white/[0.1] bg-white/[0.02] cursor-pointer hover:border-white/[0.2] hover:bg-white/[0.04]'
        }`}
        style={{ minHeight: 140 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          className="hidden"
          onChange={(e) => processFile(e.target.files[0])}
        />

        {value ? (
          /* Uploaded state */
          <div className="flex items-center gap-4 p-5">
            {/* Thumbnail or PDF icon */}
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/[0.08] bg-black/40 flex items-center justify-center">
              {preview
                ? <img src={preview} alt={label} className="w-full h-full object-cover" />
                : <FileText size={28} className="text-white/40" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                <span className="text-[13px] font-semibold text-green-400">{label}</span>
              </div>
              <p className="text-[11px] text-white/40 truncate">{value.name}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{(value.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={remove}
                className="mt-2 flex items-center gap-1 text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
              >
                <X size={11} /> Remove
              </button>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              dragging ? 'bg-[#38bdf8]/15 border-[#38bdf8]/30' : 'bg-white/[0.04] border-white/[0.08]'
            }`}>
              <Icon size={20} className={dragging ? 'text-[#38bdf8]' : 'text-white/30'} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/70">{label}</p>
              <p className="text-[11px] text-white/35 mt-0.5">{hint}</p>
              <p className="text-[10px] text-white/20 mt-1">JPG, PNG or PDF · Max 5 MB</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03]">
              <Upload size={11} className="text-white/40" />
              <span className="text-[11px] text-white/40">Click or drag to upload</span>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
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
            <input type="tel" value={form.mobile} onChange={onChange('mobile')} placeholder="9876543210"
            maxLength={10}
              className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                errors.mobile ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'}`} />
          </InputField>

          <InputField label="Email Address" error={errors.email}>
            <input type="email" value={form.email} onChange={onChange('email')} placeholder="you@example.com"
              className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                errors.email ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'}`} />
          </InputField>

          <div className="col-span-2">
            <InputField label="Delivery Address" error={errors.address}>
              <textarea value={form.address} onChange={onChange('address')} placeholder="House No., Street, City, State"
                rows={3}
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] resize-none ${
                  errors.address ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'}`} />
            </InputField>
          </div>

          <InputField label="Pincode" error={errors.pincode}>
            <input type="text" value={form.pincode} onChange={onChange('pincode')} placeholder="682001" maxLength={6}
              className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] font-mono placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                errors.pincode ? 'border-red-500/50' : 'border-white/[0.08] focus:border-white/20'}`} />
          </InputField>
        </div>

        {/* Certificate type — fixed */}
        <div className="mt-7">
          <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-3">Certificate Type</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5 w-5 h-5 rounded-md border-2 border-[#38bdf8]/60 bg-[#38bdf8]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} className="text-[#38bdf8]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Degree Certificate + Provisional Certificate</p>
              <p className="text-[12px] text-white/40 mt-0.5">Both certificates are issued together</p>
            </div>
          </label>
        </div>

        {/* Fee */}
        <div className="mt-5 px-5 py-4 rounded-xl bg-[#38bdf8]/[0.05] border border-[#38bdf8]/15 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#38bdf8]/60 uppercase tracking-[0.08em] mb-1">Total Certificate Fee</p>
            <div className="flex items-center gap-2 text-[12px] text-white/40">
              <span>Degree ₹2,000</span><span className="text-white/20">+</span><span>Provisional ₹500</span>
            </div>
          </div>
          <p className="text-[24px] font-[800] tracking-[-0.04em]"
            style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ₹{CERT_AMOUNT.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <button onClick={onNext}
        className="btn-shine h-12 px-8 rounded-xl text-[14px] font-semibold text-white"
        style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
        Next: Upload Documents →
      </button>
    </motion.div>
  )
}

// ── Step 2: Documents ─────────────────────────────────────────────────────────
function DocumentsStep({ docs, docErrors, onDocChange, onNext, onBack }) {
  const allUploaded = docs.aadhar && docs.hallticket && docs.photo

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 mb-5">
        <h2 className="text-[16px] font-[650] mb-1">Upload Required Documents</h2>
        <p className="text-[13px] text-white/40 mb-2">
          Three documents are mandatory to process your certificate request.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-7">
          {['aadhar', 'hallticket', 'photo'].map((k) => (
            <div key={k} className={`h-1 flex-1 rounded-full transition-all ${docs[k] ? 'bg-green-500/60' : 'bg-white/[0.07]'}`} />
          ))}
          <span className="text-[11px] text-white/30 ml-1">
            {[docs.aadhar, docs.hallticket, docs.photo].filter(Boolean).length}/3
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {/* Aadhar */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IdCard size={14} className="text-[#38bdf8]/70" />
              <span className="text-[12px] font-semibold text-white/60 uppercase tracking-[0.06em]">Aadhar Card</span>
              <span className="text-[10px] text-red-400 ml-1">Required</span>
            </div>
            <DocUploader
              docKey="aadhar"
              label="Aadhar Card"
              hint="Front side of your Aadhar card"
              icon={IdCard}
              value={docs.aadhar}
              onChange={onDocChange}
              error={docErrors.aadhar}
            />
          </div>

          {/* Hall Ticket */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-[#a855f7]/70" />
              <span className="text-[12px] font-semibold text-white/60 uppercase tracking-[0.06em]">Hall Ticket</span>
              <span className="text-[10px] text-red-400 ml-1">Required</span>
            </div>
            <DocUploader
              docKey="hallticket"
              label="Recent Hall Ticket"
              hint="Latest semester / final exam hall ticket"
              icon={FileText}
              value={docs.hallticket}
              onChange={onDocChange}
              error={docErrors.hallticket}
            />
          </div>

          {/* Passport Photo */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-emerald-400/70" />
              <span className="text-[12px] font-semibold text-white/60 uppercase tracking-[0.06em]">Passport Photo</span>
              <span className="text-[10px] text-red-400 ml-1">Required</span>
            </div>
            <DocUploader
              docKey="photo"
              label="Passport Size Photo"
              hint="Recent passport-size photograph on white background"
              icon={User}
              value={docs.photo}
              onChange={onDocChange}
              error={docErrors.photo}
            />
          </div>
        </div>

        {allUploaded && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 size={15} className="text-green-400 shrink-0" />
            <p className="text-[13px] text-green-400">All documents uploaded successfully.</p>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="h-12 px-6 rounded-xl border border-white/[0.1] text-[14px] text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={onNext} disabled={!allUploaded}
          className="btn-shine h-12 px-8 rounded-xl text-[14px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
          Next: Payment →
        </button>
      </div>
    </motion.div>
  )
}

// ── Step 3: Payment ───────────────────────────────────────────────────────────
function PaymentStep({ form, onPay, paying, paid, onBack, onNext }) {
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

        {/* <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <ShieldCheck size={14} className="text-green-400 shrink-0" />
          <p className="text-[12px] text-white/35">Simulated payment — no real transaction occurs.</p>
        </div> */}

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

      <div className="flex gap-3">
        <button onClick={onBack}
          className="h-12 px-6 rounded-xl border border-white/[0.1] text-[14px] text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={onNext} disabled={!paid}
          className="btn-shine h-12 px-8 rounded-xl text-[14px] font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
          Review Summary →
        </button>
      </div>
    </motion.div>
  )
}

// ── Step 4: Summary ───────────────────────────────────────────────────────────
function SummaryStep({ form, docs, student, onBack, onSubmit, submitting, apiError }) {
  const [docPreview, setDocPreview] = useState(null)

  const DOC_META = {
    aadhar:     { label: 'Aadhar Card',        color: 'border-[#38bdf8]/30 bg-[#38bdf8]/[0.05]' },
    hallticket: { label: 'Hall Ticket',         color: 'border-[#a855f7]/30 bg-[#a855f7]/[0.05]' },
    photo:      { label: 'Passport Photo',      color: 'border-emerald-500/30 bg-emerald-500/[0.05]' },
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>

      {/* Header banner */}
      <div className="bg-[#0a0a0a] border border-[#38bdf8]/20 rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center shrink-0">
            <GraduationCap size={17} className="text-[#38bdf8]" />
          </div>
          <div>
            <p className="text-[15px] font-[700]">Review Your Application</p>
            <p className="text-[12px] text-white/35">Verify all details before final submission.</p>
          </div>
        </div>
      </div>

      {/* Student identity */}
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-6 mb-4">
        <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-4">Student Identity</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: <Hash size={13} />,          label: 'Register No.',  val: student?.registerNumber ?? '—' },
            { icon: <User size={13} />,           label: 'Name',          val: student?.name ?? '—' },
            { icon: <GraduationCap size={13} />,  label: 'Course',        val: student?.course ?? '—' },
            { icon: <Calendar size={13} />,       label: 'Year',          val: student?.yearOfCompletion ?? '—' },
            { icon: <Phone size={13} />,          label: 'Mobile',        val: form.mobile },
            { icon: <Mail size={13} />,           label: 'Email',         val: form.email },
          ].map(({ icon, label, val }) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-[0.06em] mb-1">
                {icon} {label}
              </div>
              <p className="text-[13px] text-white/80 font-medium truncate">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-6 mb-4">
        <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-4">Delivery Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <div className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-[0.06em] mb-1">
              <MapPin size={13} /> Address
            </div>
            <p className="text-[13px] text-white/80">{form.address}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.06em] mb-1">Pincode</p>
            <p className="text-[13px] text-white/80 font-mono">{form.pincode}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.06em] mb-1">Certificate Types</p>
            <p className="text-[13px] text-white/80">Degree + Provisional</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.06em] mb-1">Amount Paid</p>
            <p className="text-[13px] font-bold text-green-400">₹{CERT_AMOUNT.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-6 mb-5">
        <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-4">Uploaded Documents</p>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(DOC_META).map(([key, { label, color }]) => {
            const doc = docs[key]
            const isImg = doc?.type?.startsWith('image/')
            return (
              <div key={key} className={`rounded-xl border p-3 ${color}`}>
                {/* Thumbnail */}
                <div
                  className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-black/30 flex items-center justify-center cursor-pointer group relative"
                  onClick={() => doc && isImg && setDocPreview({ label, dataUri: doc.dataUri })}
                >
                  {isImg && doc ? (
                    <>
                      <img src={doc.dataUri} alt={label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye size={18} className="text-white" />
                      </div>
                    </>
                  ) : doc ? (
                    <div className="flex flex-col items-center gap-1">
                      <FileText size={24} className="text-white/40" />
                      <span className="text-[9px] text-white/30">PDF</span>
                    </div>
                  ) : (
                    <AlertCircle size={20} className="text-red-400/50" />
                  )}
                </div>
                {/* Info */}
                <div className="flex items-center gap-1.5">
                  {doc
                    ? <CheckCircle2 size={11} className="text-green-400 shrink-0" />
                    : <X size={11} className="text-red-400 shrink-0" />
                  }
                  <span className="text-[11px] font-semibold text-white/70">{label}</span>
                </div>
                {doc && (
                  <p className="text-[10px] text-white/30 mt-0.5 truncate">{doc.name}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment confirmed banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-5">
        <CheckCircle2 size={14} className="text-green-400 shrink-0" />
        <p className="text-[13px] text-green-400">Payment of ₹{CERT_AMOUNT.toLocaleString('en-IN')} confirmed. Ready to submit.</p>
      </div>

      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-[13px] text-red-400">{apiError}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={submitting}
          className="h-12 px-6 rounded-xl border border-white/[0.1] text-[14px] text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 disabled:opacity-40">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={onSubmit} disabled={submitting}
          className="btn-shine h-12 px-8 rounded-xl text-[14px] font-bold text-white disabled:opacity-60 flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }}>
          {submitting
            ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            : 'Submit Certificate Request →'}
        </button>
      </div>

      {/* Doc preview modal */}
      <AnimatePresence>
        {docPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={() => setDocPreview(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0f0f] border border-white/[0.1] rounded-2xl p-4 max-w-lg w-full"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-semibold">{docPreview.label}</p>
                <button onClick={() => setDocPreview(null)} className="text-white/30 hover:text-white text-[20px] leading-none">×</button>
              </div>
              <img src={docPreview.dataUri} alt={docPreview.label} className="w-full rounded-xl border border-white/[0.07]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Step 5: Success ───────────────────────────────────────────────────────────
function SuccessStep({ requestResult }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(requestResult?.requestId ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }} className="max-w-[520px]">
      <div className="bg-[#0a0a0a] border border-green-500/25 rounded-2xl p-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-green-400" />
        </motion.div>
        <h2 className="text-[22px] font-[800] tracking-[-0.04em] mb-2">Request Submitted!</h2>
        <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
          Both your Degree Certificate and Provisional Certificate requests have been received.
          You will receive updates at your registered email.
        </p>

        <div className="bg-[#111] border border-white/[0.07] rounded-xl px-6 py-5 mb-6 text-left">
          {[
            ['Request ID(s)',  requestResult?.requestId ?? '—'],
            ['Status',         requestResult?.status ?? 'pending'],
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CertificateRequestForm() {
  const { studentUser, studentToken, saveRequestIds } = useStudentPortal()
  const navigate = useNavigate()

  const [step,          setStep]          = useState(0)
  const [form,          setForm]          = useState({ mobile: '', email: '', address: '', pincode: '' })
  const [errors,        setErrors]        = useState({})
  const [docs,          setDocs]          = useState({ aadhar: null, hallticket: null, photo: null })
  const [docErrors,     setDocErrors]     = useState({})
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [submitting,    setSubmitting]    = useState(false)
  const [submitted,     setSubmitted]     = useState(false)
  const [requestResult, setRequestResult] = useState(null)
  const [apiError,      setApiError]      = useState('')

  const handleChange = (k) => (ev) => {
    setForm(prev => ({ ...prev, [k]: ev.target.value }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const handleDocChange = (key, file, err) => {
    setDocs(prev => ({ ...prev, [key]: file }))
    setDocErrors(prev => ({ ...prev, [key]: err ?? '' }))
  }

  const validateDetails = () => {
    const e = {}
    if (!form.mobile.trim())  e.mobile  = 'Mobile number is required'
    else if (!/^\+?[\d\s-]{8,}$/.test(form.mobile)) e.mobile = 'Enter a valid mobile number'
    if (!form.email.trim())   e.email   = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.address.trim()) e.address = 'Delivery address is required'
    if (!form.pincode.trim()) e.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateDocs = () => {
    const e = {}
    if (!docs.aadhar)     e.aadhar     = 'Aadhar card is required'
    if (!docs.hallticket) e.hallticket = 'Hall ticket is required'
    if (!docs.photo)      e.photo      = 'Passport photo is required'
    setDocErrors(e)
    return Object.keys(e).length === 0
  }

  const goNext = () => {
    if (step === 0 && !validateDetails()) return
    if (step === 1 && !validateDocs()) return
    setStep(s => s + 1)
  }

  const goBack = () => setStep(s => Math.max(s - 1, 0))

  const handlePay = async () => {
    setPaymentStatus('processing')
    await new Promise(r => setTimeout(r, 2000))
    setPaymentStatus('paid')
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setApiError('')
    try {
      // Build documents array to send to backend
      const documents = [
        { type: 'aadhar',     label: 'Aadhar Card',       dataUri: docs.aadhar?.dataUri,     mimeType: docs.aadhar?.type },
        { type: 'hallticket', label: 'Recent Hall Ticket', dataUri: docs.hallticket?.dataUri, mimeType: docs.hallticket?.type },
        { type: 'photo',      label: 'Passport Photo',     dataUri: docs.photo?.dataUri,      mimeType: docs.photo?.type },
      ].filter(d => d.dataUri)

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
            documents,
          }, studentToken)
        )
      )

      const allIds = results.map(r => (r.data?.request ?? r.data)?.requestId).filter(Boolean)
      if (allIds.length) saveRequestIds(allIds)

      const primary = results[0].data?.request ?? results[0].data
      primary.requestId = allIds.join(', ')

      setRequestResult(primary)
      setSubmitted(true)
      setStep(4)
    } catch (err) {
      setApiError(err?.response?.data?.message ?? 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Sidebar step labels
  const SIDEBAR_STEPS = [
    { label: 'Details',   desc: 'Contact & delivery' },
    { label: 'Documents', desc: 'Aadhar, hall ticket, photo' },
    { label: 'Payment',   desc: 'Fee payment' },
    { label: 'Summary',   desc: 'Review & confirm' },
    { label: 'Done',      desc: 'Submitted' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 border-r border-white/[0.06] flex flex-col py-8 px-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)' }}>⬡</div>
          <span className="text-[15px] font-semibold tracking-[0.04em]">CredChain</span>
        </Link>

        <p className="text-[11px] text-white/25 uppercase tracking-[0.08em] mb-3 px-3">Request Certificate</p>
        <div className="flex-1 flex flex-col gap-0.5">
          {SIDEBAR_STEPS.map((s, i) => (
            <div key={s.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${
              i === step ? 'bg-white/[0.06] text-white'
              : i < step ? 'text-green-400/70'
              : 'text-white/25'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                i < step  ? 'bg-green-500/20 border border-green-500/40'
                : i === step ? 'border border-white/30 bg-white/[0.08]'
                : 'border border-white/10'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              <div>
                <p className="text-[13px] font-medium leading-tight">{s.label}</p>
                <p className={`text-[10px] leading-tight mt-0.5 ${i === step ? 'text-white/35' : 'text-white/20'}`}>{s.desc}</p>
              </div>
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-10 h-14 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold">Request a Certificate</h1>
          <span className="text-[12px] text-white/25 font-mono">{studentUser?.registerNumber}</span>
        </div>

        <div className="px-10 py-8 max-w-[820px]">
          {step < 4 && <StepBar current={step} />}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <DetailsStep key="details" form={form} errors={errors} onChange={handleChange} onNext={goNext} />
            )}
            {step === 1 && (
              <DocumentsStep key="docs" docs={docs} docErrors={docErrors}
                onDocChange={handleDocChange} onNext={goNext} onBack={goBack} />
            )}
            {step === 2 && (
              <PaymentStep key="payment" form={form} onPay={handlePay}
                paying={paymentStatus === 'processing'} paid={paymentStatus === 'paid'}
                onBack={goBack} onNext={goNext} />
            )}
            {step === 3 && (
              <SummaryStep key="summary" form={form} docs={docs} student={studentUser}
                onBack={goBack} onSubmit={handleSubmit}
                submitting={submitting} apiError={apiError} />
            )}
            {step === 4 && (
              <SuccessStep key="success" requestResult={requestResult} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}