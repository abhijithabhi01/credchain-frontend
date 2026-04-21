import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label: 'About', href: '/#about' },
    { label: 'How It Works',   href: '/#how' },
    { label: 'Ecosystem',      href: '/#roles' },
    { label: 'Connect us',     href: '/#connectus' },
  ]

  const dashPath =
    user?.role === 'admin'    ? '/admin'    :
    user?.role === 'issuer'   ? '/issuer'   :
    user?.role === 'student'  ? '/student'  :
    '/employer'

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/70 backdrop-blur-2xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-10 h-16 flex items-center justify-between">

        {/* ── Logo ──────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 group" data-hover>
          <div className="w-7 h-7 rounded-[7px] bg-grad flex items-center justify-center text-sm font-bold text-white">
            ⬡
          </div>
          <span className="text-[15px] font-semibold tracking-[0.04em] text-white">
            CredChain
          </span>
        </Link>

        {/* ── Desktop Nav ────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              data-hover
              className="text-[13px] font-normal text-white/40 hover:text-white transition-colors duration-200 tracking-[0.02em]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* ── Right Side ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          

          {!isAuthenticated ? (
            <>
              <Link to="/login" data-hover>
                <button className="h-8 px-5 rounded-full border border-white/[0.12] text-white/50 hover:text-white hover:border-white/25 text-[13px] font-medium transition-all">
                  Sign in
                </button>
              </Link>
              <Link to="/register" data-hover>
                <button
                  className="h-8 px-5 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/85 transition-all"
                >
                  Get started
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to={dashPath} data-hover>
                <button className="h-8 px-5 rounded-full border border-white/[0.12] text-white/70 hover:text-white hover:border-white/25 text-[13px] font-medium transition-all">
                  Dashboard
                </button>
              </Link>
              <button
                onClick={logout}
                data-hover
                className="h-8 px-5 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/85 transition-all"
              >
                Sign out
              </button>
            </>
          )}
        </div>

        {/* ── Mobile Toggle ──────────────────────────────── */}
        <button
          className="md:hidden text-white/50 hover:text-white p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-black/90 backdrop-blur-2xl border-b border-white/[0.06] overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[14px] text-white/50 hover:text-white py-1 transition-colors"
                >
                  {l.label}
                </a>
              ))}

              <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 rounded-xl border border-white/10 text-white/60 text-sm">
                        Sign in
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold">
                        Get started
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={dashPath} onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-2.5 rounded-xl border border-white/10 text-white/60 text-sm">
                        Dashboard
                      </button>
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false) }}
                      className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold"
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}