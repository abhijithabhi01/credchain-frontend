import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import WaveMesh from '@/components/WaveMesh'
import Footer from '@/components/layout/Footer'

/* ─── Ticker data ───────────────────────────────────────────── */
const TICKER = [
  'Tamper-Proof Certificates', 'Ethereum Blockchain', 'IPFS Decentralized Storage',
  'Instant Verification', 'Role-Based Access', 'MetaMask Integration',
  'Zero Forgery', 'Global Trust Layer', 'zkProof Ready', 'Solidity Smart Contracts'
]

/* ─── Shared helpers ────────────────────────────────────────── */
function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="border-t border-b border-white/[0.07] py-5 overflow-hidden bg-white/[0.01]">
      <div className="flex gap-14 w-max ticker-track">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-[12.5px] font-medium text-white/35 tracking-[0.03em] whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-[#e040fb] opacity-80 shrink-0" />
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="flex items-center gap-4 text-[11px] font-medium tracking-[0.14em] uppercase text-white/25 mb-10">
      <span className="w-8 h-px bg-white/20" />
      {children}
    </p>
  )
}

/* ─── About section data ────────────────────────────────────── */
const PILLARS = [
  {
    icon: '⬡',
    label: 'Blockchain Layer',
    body: 'Ethereum smart contracts store every certificate hash permanently on-chain. No one — not even us — can alter or delete a record.',
    color: '#e040fb',
  },
  {
    icon: '◈',
    label: 'Decentralised Storage',
    body: 'PDFs live on IPFS via Pinata. Each file gets a unique content address. If the file changes, the address changes — fraud is mathematically impossible.',
    color: '#a855f7',
  },
  {
    icon: '◎',
    label: 'Verified Identity',
    body: 'Only KTU-authorised issuers can write certificates. Students verify ownership by email. Employers get cryptographic proof — no phone calls needed.',
    color: '#38bdf8',
  },
]

/* ─── Why Blockchain data ───────────────────────────────────── */
const PROBLEMS = [
  {
    title: 'Fake Certificates',
    body: 'Traditional paper or PDF certificates can be scanned, edited, and reprinted in minutes. Credential fraud costs institutions crores annually.',
    color: '#e040fb',
  },
  {
    title: 'Slow Verification',
    body: 'Employers call universities, wait days for replies, and still can\'t be certain. Some institutions never respond at all.',
    color: '#a855f7',
  },
  {
    title: 'No Ownership',
    body: 'Students have no portable, self-sovereign record of their achievements. Credentials are locked inside databases they don\'t control.',
    color: '#38bdf8',
  },
]

const SOLUTIONS = [
  {
    icon: '⬡',
    title: 'Immutable Records',
    body: 'Once written to Ethereum, a certificate cannot be changed, deleted, or forged — by anyone, ever. The record is permanent by design.',
    tag: 'Smart contract enforced at protocol level',
    color: '#e040fb',
  },
  {
    icon: '◎',
    title: 'Instant Verification',
    body: 'Anyone can verify any certificate in under 3 seconds. No phone calls. No waiting. Just a certificate ID and a blockchain read.',
    tag: 'One API call from the blockchain',
    color: '#a855f7',
  },
  {
    icon: '◈',
    title: 'Student Ownership',
    body: 'Certificates stored on IPFS are permanently accessible. Students can share their link forever — even if CredChain shuts down.',
    tag: 'Content-addressed: the link IS the proof',
    color: '#38bdf8',
  },
  {
    icon: '⬗',
    title: 'Cryptographic Trust',
    body: 'Every certificate is signed by KTU\'s private key. Forging one would require breaking 256-bit elliptic curve cryptography.',
    tag: 'Same security as Ethereum itself',
    color: '#00d4aa',
  },
]

const COMPARISON = [
  { feature: 'Can be forged',          paper: true,  pdf: true,  credchain: false },
  { feature: 'Instant verification',   paper: false, pdf: false, credchain: true  },
  { feature: 'Permanently accessible', paper: false, pdf: false, credchain: true  },
  { feature: 'No middleman needed',    paper: false, pdf: false, credchain: true  },
  { feature: 'Student-owned',          paper: false, pdf: false, credchain: true  },
  { feature: 'Tamper-evident',         paper: false, pdf: true,  credchain: true  },
]

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [activeStep, setActiveStep] = useState(null)

  const flowSteps = [
    { label: 'KTU uploads PDF',       sub: 'Pinata IPFS',       n: '01' },
    { label: 'IPFS hash generated',   sub: 'Content address',   n: '02' },
    { label: 'Smart contract called', sub: 'Ethereum network',  n: '03' },
    { label: 'Certificate sealed',    sub: 'On-chain forever',  n: '04' },
    { label: 'Student links cert',    sub: 'Email verified',    n: '05' },
    { label: 'Employer verifies',     sub: '3-second check',    n: '06' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Three.js wave mesh */}
        <div className="absolute bottom-0 left-0 right-0 h-[55%]">
          <WaveMesh />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[1] pointer-events-none" />

        <div className="relative z-[2] px-6 max-w-[900px] mx-auto" style={{ marginTop: '-40px' }}>
          

          {/* ── Heading: two distinct lines ── */}
          <h1 className="anim-fade-up anim-delay-1 font-[800] leading-[1.0] tracking-[-0.045em]">
            {/* Line 1 */}
            <span
              className="grad-text block"
              style={{ fontSize: 'clamp(52px, 9vw, 84px)' }}
            >
              Blockchain Powered
            </span>
            {/* Line 2 */}
            <span
              className="text-white block"
              style={{ fontSize: 'clamp(52px, 9vw, 80px)' }}
            >
              Certificate System.
            </span>
          </h1>

          <p className="anim-fade-up anim-delay-3 mt-8 text-[15px] leading-[1.75] text-white/45 max-w-[460px] mx-auto">
            Issue, manage, and instantly verify tamper-proof academic &amp; professional credentials on-chain. Zero forgery. Infinite trust.
          </p>

          <div className="anim-fade-up anim-delay-4 flex flex-wrap items-center justify-center gap-3 mt-12">
            <Link to="/login">
              <button
                data-hover
                className="btn-shine h-12 px-8 rounded-full text-[14px] font-semibold text-white relative"
                style={{ background: 'linear-gradient(90deg, #e040fb 0%, #a855f7 50%, #38bdf8 100%)' }}
              >
                Get started
              </button>
            </Link>
            <a href="#how">
              <button
                data-hover
                className="h-12 px-8 rounded-full text-[14px] font-medium text-white border border-white/[0.12] hover:text-black hover:border-white/25 transition-all hover:bg-white"
              >
                Explore Ecosystem
              </button>
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
          <span className="text-[10px] tracking-[0.14em] uppercase text-white/20 font-medium">Scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TICKER
      ══════════════════════════════════════════════════════ */}
      <Ticker />

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-8 py-[120px]">
        <FadeIn><SectionLabel>By the numbers</SectionLabel></FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {[
            { n: '50K+', l: 'Certificates Issued' },
            { n: '2.1K', l: 'Verified Issuers' },
            { n: '180+', l: 'Countries Covered' },
            { n: '99.9%', l: 'Network Uptime' },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="bg-[#0a0a0a] hover:bg-[#111] transition-colors duration-300 px-10 py-12">
                <div className="text-[52px] font-[800] leading-none tracking-[-0.05em] grad-text">{s.n}</div>
                <p className="mt-3 text-[13px] text-white/40 font-normal">{s.l}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════════ */}
      <section id='about' className="max-w-[1200px] mx-auto px-8 py-[100px] border-t border-white/[0.06]">
        <FadeIn><SectionLabel>About CredChain</SectionLabel></FadeIn>

        {/* Two-col intro */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <FadeIn>
            <h2 className="text-[clamp(36px,4vw,58px)] font-[800] tracking-[-0.04em] leading-[1.08] mb-6">
              Credentials that<br />
              <span className="grad-text">cannot be faked.</span>
            </h2>
            <p className="text-[15px] text-white/40 leading-[1.8] mb-4">
              CredChain is an academic certificate management platform built for Kerala Technological University.
              Every certificate is cryptographically sealed on the Ethereum blockchain and stored permanently on
              IPFS — making forgery <span className="text-white/70">mathematically impossible.</span>
            </p>
            <p className="text-[14px] text-white/30 leading-[1.8]">
              Students own their credentials. Employers verify in seconds. KTU remains in full control — with
              a complete audit trail of every action taken on the platform.
            </p>
            <div className="flex gap-3 mt-10 flex-wrap">
              <Link to="/login">
                <button
                  data-hover
                  className="btn-shine h-11 px-7 rounded-full text-[13px] font-semibold text-white"
                  style={{ background: 'linear-gradient(90deg, #e040fb 0%, #a855f7 50%, #38bdf8 100%)' }}
                >
                  Verify a Certificate
                </button>
              </Link>
              <a href="#why">
                <button
                  data-hover
                  className="h-11 px-7 rounded-full text-[13px] font-medium text-white/50 border border-white/[0.1] hover:text-white hover:border-white/25 transition-all"
                >
                  Why Blockchain?
                </button>
              </a>
            </div>
          </FadeIn>

          {/* Live certificate preview card */}
          <FadeIn delay={0.15}>
            <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 overflow-hidden">
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-30"
                style={{ background: 'linear-gradient(135deg, rgba(224,64,251,0.08) 0%, rgba(56,189,248,0.06) 100%)' }}
              />
              {/* Animated scan line */}
              <div
                className="absolute left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(224,64,251,0.5), rgba(56,189,248,0.5), transparent)',
                  animation: 'scanline 3s ease-in-out infinite',
                }}
              />
              <style>{`
                @keyframes scanline {
                  0%   { top: 0%;   opacity: 0; }
                  10%  { opacity: 1; }
                  90%  { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
              `}</style>

              <div className="relative z-10">
                <div className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/25 mb-6">
                  Certificate · On-Chain Record
                </div>
                {[
                  ['Student',  'Arjun Krishnan'],
                  ['Course',   'MCA — KTU'],
                  ['Year',     '2024'],
                  ['Status',   '✓  VALID'],
                  ['Tx Hash',  '0x3f7a...c94e'],
                  ['IPFS',     'QmXk...9fWr'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between items-center py-3 border-b border-white/[0.05] text-[13px]"
                  >
                    <span className="text-white/30 font-normal">{k}</span>
                    <span
                      className={`font-medium ${k === 'Status' ? 'text-[#00d4aa]' : 'text-white/70'} ${['Tx Hash', 'IPFS'].includes(k) ? 'font-mono text-[12px]' : ''}`}
                    >
                      {v}
                    </span>
                  </div>
                ))}
                <div
                  className="mt-6 py-3 px-4 rounded-xl text-center text-[11px] font-[600] tracking-[0.1em] uppercase"
                  style={{
                    background: 'rgba(0,212,170,0.08)',
                    border: '1px solid rgba(0,212,170,0.2)',
                    color: '#00d4aa',
                  }}
                >
                  Blockchain Verified — Ethereum Sepolia
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-5">
          {PILLARS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                data-hover
                className="relative bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 overflow-hidden group transition-all duration-300 hover:border-white/[0.14] hover:-translate-y-1"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${p.color}08 0%, transparent 70%)` }}
                />
                <div className="relative z-10">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-6 border"
                    style={{ background: `${p.color}12`, borderColor: `${p.color}25`, color: p.color }}
                  >
                    {p.icon}
                  </div>
                  <h3 className="text-[16px] font-[650] tracking-[-0.02em] mb-3">{p.label}</h3>
                  <p className="text-[13px] text-white/40 leading-[1.75]">{p.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="how" className="max-w-[1200px] mx-auto px-8 py-[100px] border-t border-white/[0.06]">
        <FadeIn><SectionLabel>Process</SectionLabel></FadeIn>
        <FadeIn>
          <h2 className="text-[clamp(36px,4vw,58px)] font-[800] tracking-[-0.04em] leading-[1.08] mb-20">
            How <span className="grad-text">CredChain</span><br />works.
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: '01', icon: '📤',
              title: 'Upload Certificate',
              body: 'Authorized issuers upload PDF certificates. Files are pinned to IPFS for permanent decentralized storage using content-addressed hashing.'
            },
            {
              n: '02', icon: '⛓',
              title: 'On-Chain Record',
              body: 'Certificate metadata and the IPFS hash are recorded immutably on Ethereum via smart contract — timestamped and verifiable forever.'
            },
            {
              n: '03', icon: '✅',
              title: 'Instant Verify',
              body: 'Anyone can enter a Certificate ID and instantly verify authenticity directly from the blockchain. No login required. Zero trust needed.'
            },
          ].map((step, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                data-hover
                className="relative bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-10 overflow-hidden group transition-all duration-300 hover:border-white/[0.14] hover:-translate-y-1"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(224,64,251,0.06) 0%, rgba(56,189,248,0.06) 100%)' }} />
                <div className="relative z-10">
                  <div className="text-[64px] font-[900] leading-none tracking-[-0.06em] text-white/[0.04] mb-6 select-none">{step.n}</div>
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl mb-5">{step.icon}</div>
                  <h3 className="text-[17px] font-[650] tracking-[-0.02em] mb-3">{step.title}</h3>
                  <p className="text-[13px] text-white/40 leading-[1.75]">{step.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY BLOCKCHAIN
      ══════════════════════════════════════════════════════ */}
      <section id="why" className="max-w-[1200px] mx-auto px-8 py-[100px] border-t border-white/[0.06]">
        <FadeIn><SectionLabel>Why Blockchain</SectionLabel></FadeIn>
        <FadeIn>
          <h2 className="text-[clamp(36px,4vw,58px)] font-[800] tracking-[-0.04em] leading-[1.08] mb-5">
            The problem with<br />
            <span style={{
              background: 'linear-gradient(90deg, #e040fb, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              traditional credentials.
            </span>
          </h2>
          <p className="text-[15px] text-white/40 mb-16 max-w-[480px] leading-relaxed">
            Paper certificates and PDFs rely on trust in a central authority. Blockchain removes the need for trust entirely.
          </p>
        </FadeIn>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {PROBLEMS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div
                className="relative bg-[#0a0a0a] rounded-2xl p-8 overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: `${p.color}20` }}
              >
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)` }} />
                <div
                  className="text-[28px] font-[900] leading-none mb-5"
                  style={{ color: p.color }}
                >✗</div>
                <h3 className="text-[16px] font-[650] tracking-[-0.02em] mb-3">{p.title}</h3>
                <p className="text-[13px] text-white/40 leading-[1.75]">{p.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* VS divider */}
        <FadeIn>
          <div className="flex items-center gap-6 my-14">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.08]" />
            <span className="text-[28px] font-[800] tracking-[0.1em] text-white/[0.12]">VS</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.08]" />
          </div>
        </FadeIn>

        {/* Solution heading */}
        <FadeIn>
          <h3 className="text-[clamp(28px,3vw,44px)] font-[800] tracking-[-0.04em] leading-[1.08] mb-16">
            How CredChain <span className="grad-text">solves it.</span>
          </h3>
        </FadeIn>

        {/* Solution cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-20">
          {SOLUTIONS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                data-hover
                className="relative bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-10 overflow-hidden group transition-all duration-300 hover:border-white/[0.14] hover:-translate-y-1"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${s.color}06 0%, transparent 70%)` }}
                />
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-8 bottom-8 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(180deg, transparent, ${s.color}, transparent)` }}
                />
                <div className="relative z-10">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-6 border"
                    style={{ background: `${s.color}12`, borderColor: `${s.color}25`, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <h3 className="text-[17px] font-[650] tracking-[-0.02em] mb-3">{s.title}</h3>
                  <p className="text-[13px] text-white/40 leading-[1.75] mb-5">{s.body}</p>
                  <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.05em]"
                    style={{ color: s.color, opacity: 0.7 }}>
                    <span>→</span>
                    <span>{s.tag}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ── Transaction Flow ───────────────────────────── */}
        <FadeIn>
          <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-10 mb-16">
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-white/25 mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-white/20" />
              Certificate Flow
            </p>
            <h3 className="text-[22px] font-[700] tracking-[-0.03em] mb-10">From upload to verification.</h3>

            <div className="relative">
              {/* Connector */}
              <div
                className="absolute top-7 left-[5%] right-[5%] h-px hidden md:block"
                style={{ background: 'linear-gradient(90deg, rgba(224,64,251,0.15), rgba(56,189,248,0.15))' }}
              />
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
                {flowSteps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                    className={`flex flex-col items-center gap-3 text-center group cursor-pointer transition-transform duration-200 hover:scale-105 ${activeStep === i ? 'scale-105' : ''}`}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-[11px] font-[600] tracking-[0.05em] border transition-all duration-300"
                      style={{
                        background: activeStep === i
                          ? 'linear-gradient(135deg, rgba(224,64,251,0.2), rgba(56,189,248,0.2))'
                          : 'rgba(255,255,255,0.03)',
                        borderColor: activeStep === i ? 'rgba(224,64,251,0.4)' : 'rgba(255,255,255,0.08)',
                        color: activeStep === i ? '#e040fb' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {step.n}
                    </div>
                    <div className="text-[12px] font-[500] text-white/60 leading-[1.3]">{step.label}</div>
                    <div className="text-[10px] font-medium tracking-[0.05em]"
                      style={{
                        background: 'linear-gradient(90deg, #e040fb, #38bdf8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        opacity: 0.6,
                      }}>
                      {step.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {activeStep !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[13px] text-white/50"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: 'linear-gradient(90deg, #e040fb, #38bdf8)', animation: 'pulse 2s infinite' }}
                />
                Step {flowSteps[activeStep].n} · {flowSteps[activeStep].label} — {flowSteps[activeStep].sub}
              </motion.div>
            )}
          </div>
        </FadeIn>

        {/* ── Comparison Table ───────────────────────────── */}
        <FadeIn>
          <h3 className="text-[22px] font-[700] tracking-[-0.03em] mb-8">
            CredChain vs everything else.
          </h3>
          <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 px-6 py-4 border-b border-white/[0.08] bg-black/30">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/25">Feature</div>
              {['Paper', 'PDF / Email', 'CredChain'].map((col, i) => (
                <div key={col} className="text-center">
                  <span
                    className="text-[10px] font-[600] tracking-[0.1em] uppercase"
                    style={i === 2 ? {
                      background: 'linear-gradient(90deg, #e040fb, #38bdf8)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    } : { color: 'rgba(255,255,255,0.25)' }}
                  >
                    {i === 2 && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-px"
                        style={{ background: 'linear-gradient(90deg, #e040fb, #38bdf8)' }}
                      />
                    )}
                    {col}
                  </span>
                </div>
              ))}
            </div>

            {COMPARISON.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-200 last:border-0"
              >
                <div className="text-[13px] text-white/50 font-normal">{row.feature}</div>
                <div className="text-center text-[15px]">
                  {row.paper
                    ? <span className="text-[#e040fb] opacity-60">✗</span>
                    : <span className="text-[#00d4aa]">✓</span>}
                </div>
                <div className="text-center text-[15px]">
                  {row.pdf
                    ? <span className="text-[#fbbf24] opacity-70">~</span>
                    : <span className="text-[#e040fb] opacity-60">✗</span>}
                </div>
                <div className="text-center text-[15px]">
                  {row.credchain
                    ? <span className="text-[#00d4aa]">✓</span>
                    : <span className="text-[#e040fb] opacity-60">✗</span>}
                </div>
              </div>
            ))}

            <div className="flex gap-6 px-6 py-3 bg-black/20 text-[10px] font-medium text-white/25 tracking-[0.06em]">
              <span><span className="text-[#00d4aa]">✓</span> Yes</span>
              <span><span className="text-[#e040fb] opacity-60">✗</span> No</span>
              <span><span className="text-[#fbbf24] opacity-70">~</span> Partial</span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════════
          ECOSYSTEM / ROLES
      ══════════════════════════════════════════════════════ */}
      <section id="roles" className="max-w-[1200px] mx-auto px-8 py-[100px] border-t border-white/[0.06]">
        <FadeIn><SectionLabel>Ecosystem</SectionLabel></FadeIn>
        <FadeIn>
          <h2 className="text-[clamp(36px,4vw,58px)] font-[800] tracking-[-0.04em] leading-[1.08] mb-4">
            Built for every<br /><span className="grad-text">stakeholder.</span>
          </h2>
          <p className="text-[15px] text-white/40 mb-16 max-w-[400px] leading-relaxed">
            Four distinct user types, each with purpose-built dashboards and tools.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: '👑', badge: 'Admin', color: '#e040fb',
              title: 'Platform Administrator',
              body: 'Full platform control. Manage authorized issuers and monitor all on-chain activity with real-time analytics.',
              features: ['Add & remove authorized issuers on-chain', 'View analytics & certificate logs', 'Monitor issuer activity in real-time', 'Platform-wide revocation controls']
            },
            {
              icon: '🏫', badge: 'Issuer', color: '#a855f7',
              title: 'Certificate Issuer',
              body: 'Universities, bootcamps, and organizations. Issue blockchain certificates from your dashboard. Track all credentials.',
              features: ['Upload PDFs and store on IPFS', 'Issue certs via smart contract', 'View full certificate history', 'Revoke certificates when needed']
            },
            {
              icon: '🎓', badge: 'Student', color: '#38bdf8',
              title: 'Certificate Holder',
              body: 'Students and graduates. View all your credentials, share verified links, and control your credential visibility.',
              features: ['View all issued certificates', 'Share tamper-proof credential links', 'Download original PDF documents', 'Privacy controls for credentials']
            },
            {
              icon: '🏢', badge: 'Employer', color: '#00d4aa',
              title: 'Credential Verifier',
              body: 'Employers and HR teams. Instantly verify candidate credentials without contacting issuing institutions.',
              features: ['Instant certificate verification', 'Bulk verification of candidate pool', 'Detailed issuer & timestamp info', 'Verification audit trail export']
            }
          ].map((role, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                data-hover
                className="relative bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-10 overflow-hidden group transition-all duration-300 hover:border-white/[0.14] hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="text-3xl">{role.icon}</span>
                  <span
                    className="text-[10px] font-[600] tracking-[0.14em] uppercase px-3 py-1 rounded-full border"
                    style={{ color: role.color, borderColor: `${role.color}30`, background: `${role.color}12` }}
                  >
                    {role.badge}
                  </span>
                </div>
                <h3 className="text-[20px] font-[700] tracking-[-0.025em] mb-3">{role.title}</h3>
                <p className="text-[13px] text-white/40 leading-[1.75] mb-7">{role.body}</p>
                <ul className="flex flex-col gap-2.5">
                  {role.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-[13px] text-white/45">
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px]"
                        style={{ background: `${role.color}18`, color: role.color, border: `1px solid ${role.color}30` }}
                      >✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-8 pb-[120px]">
        <FadeIn>
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(224,64,251,0.12) 0%, rgba(56,189,248,0.08) 100%)' }} />
            <div className="absolute inset-0 bg-[#080808]/80" />

            <div className="relative z-10 px-16 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div>
                <h2 className="text-[clamp(28px,3vw,42px)] font-[800] tracking-[-0.04em] mb-3">
                  Ready to issue your first<br /><span className="grad-text">blockchain certificate?</span>
                </h2>
                <p className="text-[14px] text-white/40 max-w-[400px] leading-relaxed">
                  Join thousands of institutions using CredChain for tamper-proof credential management.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link to="/login">
                  <button
                    data-hover
                    className="btn-shine h-12 px-8 rounded-full text-[14px] font-semibold text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(90deg, #e040fb 0%, #a855f7 50%, #38bdf8 100%)' }}
                  >
                    Start issuing →
                  </button>
                </Link>
                <Link to="/verify">
                  <button
                    data-hover
                    className="h-12 px-8 rounded-full text-[14px] font-medium text-white/50 border border-white/[0.1] hover:text-white hover:border-white/25 transition-all whitespace-nowrap text-center"
                  >
                    Verify a certificate
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
<div id='connectus'>

</div>
      <Footer />
    </div>
  )
}