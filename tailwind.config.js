/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0f0f0f',
        'surface-2': '#161616',
        border: 'rgba(255,255,255,0.08)',
        muted: 'rgba(255,255,255,0.45)',
        subtle: 'rgba(255,255,255,0.20)',
        pink: '#e040fb',
        purple: '#a855f7',
        cyan: '#00e5ff',
        teal: '#00d4aa',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      backgroundImage: {
        'grad': 'linear-gradient(90deg, #e040fb 0%, #a855f7 40%, #38bdf8 80%, #00e5ff 100%)',
        'grad-subtle': 'linear-gradient(135deg, rgba(224,64,251,0.15) 0%, rgba(56,189,248,0.15) 100%)',
        'grad-radial-pink': 'radial-gradient(circle, rgba(224,64,251,0.12) 0%, transparent 70%)',
        'grad-radial-blue': 'radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease both',
        'pulse-slow': 'pulse 2s infinite',
        'scroll-track': 'scrollTrack 20s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        scrollTrack: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
