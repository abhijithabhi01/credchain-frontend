# CredChain Frontend v2.0

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Design Preview (No build required)
Open `DESIGN_PREVIEW.html` directly in browser for instant design preview.

## Pages
- `/` — Landing page (hero + 3D wave mesh + features)
- `/login` — Unified login with 4-role selector (Admin, Issuer, Student, Employer)
- `/verify` — Public certificate verification
- `/admin` — Admin dashboard (login as admin)
- `/issuer` — Issuer dashboard (login as issuer)

## Demo Credentials
Any email/password works in demo mode. Select your role, click "Use demo credentials".

## Tech Stack
- React 18 + Vite
- Three.js (animated 3D wave mesh)
- Framer Motion
- TailwindCSS
- Ethers.js v6
- Geist font (Vercel's font)

## Design System
- Pure black (#000) background
- Gradient: pink → purple → cyan (#e040fb → #a855f7 → #38bdf8 → #00e5ff)
- Font: Geist (sans) + Geist Mono
- Glassmorphism panels, custom cursor, scroll animations
