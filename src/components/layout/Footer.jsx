import { Link } from 'react-router-dom'

const LINKS = {
  Platform: [
    { label: 'How It Works', href: '/#how' },
    { label: 'Ecosystem', href: '/#roles' },
    { label: 'Verify Certificate', href: '/verify' },
    { label: 'Smart Contracts', href: '#' },
  ],
  Access: [
    { label: 'Admin Login', href: '/login' },
    { label: 'Issuer Portal', href: '/login' },
    { label: 'Student Dashboard', href: '/login' },
    { label: 'Employer Verify', href: '/login' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Whitepaper', href: '#' },
    { label: 'Audit Report', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black">
      {/* Top section */}
      <div className="max-w-[1200px] mx-auto px-8 pt-20 pb-14 grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Brand col */}
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-5">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(90deg, #e040fb 0%, #a855f7 50%, #38bdf8 100%)' }}
            >
              ⬡
            </div>
            <span className="text-[16px] font-semibold tracking-[0.04em] text-white">CredChain</span>
          </Link>
          <p className="text-[13px] text-white/35 leading-relaxed max-w-[280px] mb-8">
            The most trusted blockchain certificate platform. Tamper-proof credentials secured by Ethereum and IPFS.
          </p>

          {/* Status pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.07]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
            <span className="text-[12px] text-white/40 font-medium">All systems operational</span>
          </div>
        </div>

        {/* Link cols */}
        {Object.entries(LINKS).map(([group, items]) => (
          <div key={group}>
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/25 mb-5">{group}</p>
            <ul className="flex flex-col gap-3">
              {items.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-[13px] text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Gradient line */}
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(224,64,251,0.3), rgba(56,189,248,0.3), transparent)' }} />
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[12px] text-white/20">
          © 2026 CredChain. Secured by Ethereum &amp; IPFS.
        </p>

        {/* Chain badge */}
        <div className="flex items-center gap-4">
          {['Ethereum', 'IPFS', 'Solidity'].map(tag => (
            <span
              key={tag}
              className="text-[11px] font-mono text-white/20 px-2.5 py-1 rounded-md border border-white/[0.06] bg-white/[0.02]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
