import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'

const schema = z.object({
  name:            z.string().min(2, 'Full name is required'),
  email:           z.string().email('Enter a valid email address'),
  password:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  company:         z.string().optional(),
  designation:     z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
})

const ROLES = [
  { id: 'employer', icon: '🏢', label: 'Employer',  desc: 'Verify candidate credentials',     color: '#00d4aa' },
]

const ROLE_ROUTES = { employer: '/employer' }

export default function Register() {
  const [selectedRole, setSelectedRole] = useState('employer')
  const [loading,      setLoading]      = useState(false)
  const [showPw,       setShowPw]       = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)

  // ✅ Use register() — NOT login()
  const { register: registerUser } = useAuth()
  const { toast }  = useToast()
  const navigate   = useNavigate()
  const role       = ROLES.find(r => r.id === selectedRole)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        name:        data.name,
        email:       data.email,
        password:    data.password,
        role:        'employer',
        company:     data.company     || undefined,
        designation: data.designation || undefined,
      }

      const { user } = await registerUser(payload)
      toast({ description: `Welcome to CredChain, ${user.name}!` })
      navigate('/employer', { replace: true })
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Registration failed. Please try again.'
      toast({ variant: 'destructive', description: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20 relative overflow-hidden" style={{marginTop:"-70px"}}>
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-50 pointer-events-none"
        style={{ background: `radial-gradient(circle, #00d4aa18 0%, transparent 70%)` }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(224,64,251,0.10) 0%, transparent 70%)' }} />

      <div className="w-full max-w-[480px] relative z-10">

        {/* Back */}
        <Link to="/" data-hover>
          <button className="group inline-flex items-center gap-2.5 h-9 pl-3 pr-5 mb-12 rounded-full border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.2] transition-all duration-200">
            <ArrowLeft size={14} className="text-white/40 group-hover:text-white/80 group-hover:-translate-x-0.5 transition-all duration-200" />
            <span className="text-[13px] font-medium text-white/40 group-hover:text-white/80 transition-colors duration-200">Back to home</span>
          </button>
        </Link>

        <div className="mb-8">
          <h1 className="text-[36px] font-[800] tracking-[-0.04em] leading-tight mb-2">Create account.</h1>
          <p className="text-[15px] text-white/40">Join CredChain as an Employer to verify candidate credentials</p>
        </div>

        {/* Form */}
        <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

            <Field label="Full Name" error={errors.name?.message}>
              <input type="text" autoComplete="name" placeholder="John Doe"
                {...register('name')} className={iCls(errors.name)} />
            </Field>

            <Field label="Email Address" error={errors.email?.message}>
              <input type="email" autoComplete="email" placeholder="you@example.com"
                {...register('email')} className={iCls(errors.email)} />
            </Field>

            {/* Employer fields */}
            <Field label="Company" error={errors.company?.message}>
              <input type="text" placeholder="e.g. TCS, Infosys"
                {...register('company')} className={iCls(errors.company)} />
            </Field>
            <Field label="Designation" error={errors.designation?.message}>
              <input type="text" placeholder="e.g. HR Manager"
                {...register('designation')} className={iCls(errors.designation)} />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="••••••••••" {...register('password')} className={`${iCls(errors.password)} pr-12`} />
                <EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} />
              </div>
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="••••••••••" {...register('confirmPassword')} className={`${iCls(errors.confirmPassword)} pr-12`} />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              </div>
            </Field>

            <button type="submit" disabled={loading} data-hover
              className="btn-shine relative h-12 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 mt-2"
              style={{ background: `linear-gradient(90deg, #00d4aa 0%, #a855f7 50%, #38bdf8 100%)` }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : `Create Employer account →`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[13px] text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-white/70 hover:text-white font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6">
          By creating an account you agree to our{' '}
          <a href="#" className="hover:text-white/40 transition-colors">Terms</a>{' '}and{' '}
          <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-2">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  )
}

function iCls(err) {
  return `w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
    err ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/[0.08] focus:border-white/20'
  }`
}

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} tabIndex={-1}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )
}