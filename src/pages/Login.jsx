import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Role → dashboard route mapping
const ROLE_ROUTES = {
  admin:    '/admin',
  issuer:   '/issuer',
  student:  '/student',
  employer: '/employer',
}

export default function Login() {
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login }    = useAuth()
  const { toast }    = useToast()
  const navigate     = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      // login() calls POST /api/auth/login and returns { user, token }
      // The role comes from the backend — not guessed from the email
      const { user } = await login({ email, password })

      const destination = ROLE_ROUTES[user.role] ?? '/'

      toast({
        description: `Welcome back, ${user.name}!`,
      })
      navigate(destination, { replace: true })
    } catch (error) {
      // Show the server error message if available, otherwise a generic one
      const message =
        error?.response?.data?.message ?? 'Invalid email or password. Please try again.'
      toast({
        variant:     'destructive',
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20 relative overflow-hidden"style={{marginTop:"-70px"}}>

      {/* Background glows */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-50 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(224,64,251,0.18) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-[420px] relative z-10">

        {/* ── Back to home ──────────────────────────────── */}
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

        {/* ── Heading ───────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-[36px] font-[800] tracking-[-0.04em] leading-tight mb-2">
            Welcome back.
          </h1>
          <p className="text-[15px] text-white/40">Sign in to your account</p>
        </div>

        {/* ── Form card ─────────────────────────────────── */}
        <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-2">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                  errors.email
                    ? 'border-red-500/50 focus:border-red-500/70'
                    : 'border-white/[0.08] focus:border-white/20'
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase text-white/35 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  {...register('password')}
                  className={`w-full h-12 pl-4 pr-12 rounded-xl bg-white/[0.04] border text-white text-[14px] placeholder:text-white/20 outline-none transition-all focus:bg-white/[0.06] ${
                    errors.password
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/[0.08] focus:border-white/20'
                  }`}
                />
                {/* Show / hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              data-hover
              className="btn-shine relative h-12 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(90deg, #e040fb 0%, #a855f7 50%, #38bdf8 100%)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          {/* ── Footer links ────────────────────────────── */}
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[13px] text-white/40">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-white/70 hover:text-white font-medium transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/verify"
              className="text-[12px] text-white/30 hover:text-white/60 transition-colors"
            >
              Verify a certificate without login →
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6">
          By signing in you agree to our{' '}
          <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
          {' '}and{' '}
          <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}