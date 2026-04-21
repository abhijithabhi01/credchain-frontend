import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentPortal } from '@/contexts/StudentPortalContext'
import { studentPortalService } from '@/services/api'
import { ArrowLeft, GraduationCap, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
      <AlertCircle size={10} /> {message}
    </p>
  )
}

export default function StudentLogin() {
  const { studentLogin, isStudentAuthenticated } = useStudentPortal()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ registerNumber: '', dob: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  if (isStudentAuthenticated) {
    navigate('/student-portal', { replace: true })
    return null
  }

  const validate = () => {
    const e = {}
    if (!form.registerNumber.trim()) e.registerNumber = 'Register number is required'
    if (!form.dob)                   e.dob = 'Date of birth is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (k) => (ev) => {
    setForm(prev => ({ ...prev, [k]: ev.target.value }))
    setErrors(prev => ({ ...prev, [k]: '' }))
    setApiError('')
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')
    try {
      const res = await studentPortalService.login({
        registerNumber: form.registerNumber.trim(),
        dob: form.dob,
      })
      const { token, student, eligibility } = res.data

// merge eligibility into student
studentLogin(token, {
  ...student,
  eligible: eligibility?.eligible,
  eligibilityReason: eligibility?.reason
})
      navigate('/student-portal', { replace: true })
    } catch (err) {
      setApiError(err?.response?.data?.message ?? 'Invalid credentials. Please check your register number and date of birth.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Back */}
        <Link to="/">
          <button className="group inline-flex items-center gap-2.5 h-9 pl-3 pr-5 mb-12 rounded-full border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.2] transition-all duration-200">
            <ArrowLeft size={14} className="text-white/40 group-hover:text-white/80 group-hover:-translate-x-0.5 transition-all duration-200" />
            <span className="text-[13px] font-medium text-white/40 group-hover:text-white/80 transition-colors duration-200">
              Back to home
            </span>
          </button>
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-white/30">Student Portal</p>
              <p className="text-[13px] text-white/50">CredChain</p>
            </div>
          </div>
          <h1 className="text-[36px] font-[800] tracking-[-0.04em] leading-tight mb-2">
            Student Sign In
          </h1>
          <p className="text-[15px] text-white/40">
            Request your academic certificates online
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-8">
          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-[13px] text-red-400 leading-relaxed">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Register Number */}
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-2">
                Register Number
              </label>
              <input
                type="text"
                value={form.registerNumber}
                onChange={handleChange('registerNumber')}
                placeholder="e.g. KTU2020CS001"
                className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] font-mono placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                  errors.registerNumber
                    ? 'border-red-500/50 focus:border-red-500/70'
                    : 'border-white/[0.08] focus:border-white/20'
                }`}
              />
              <FieldError message={errors.registerNumber} />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dob}
                onChange={handleChange('dob')}
                className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] outline-none transition-all focus:bg-white/[0.06] ${
                  errors.dob
                    ? 'border-red-500/50 focus:border-red-500/70'
                    : 'border-white/[0.08] focus:border-white/20'
                }`}
                style={{ colorScheme: 'dark' }}
              />
              <FieldError message={errors.dob} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-shine relative h-12 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verifying…
                </span>
              ) : 'Sign in to Portal →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-[12px] text-white/25 text-center leading-relaxed">
              This portal is for students to request academic certificates.
              <br />For other roles,{' '}
              <Link to="/login" className="text-white/50 hover:text-white transition-colors">sign in here</Link>.
            </p>
          </div>
        </div>

        {/* Track status without login */}
        <div className="mt-4 text-center">
          <Link to="/student-portal/status" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
            Track an existing request without login →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
