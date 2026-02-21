import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- QAi Talks Stitch Design System ---
        'paper-white': '#F0F0FC',         // Background / canvas
        'deep-navy': '#0A2540',           // Ink / structured text
        'deep-blueprint': '#001B44',      // Legacy deep blueprint/navy
        'electric-cyan': '#00C4FF',       // Accent / active states
        'logic-cyan': '#005F6B',          // Accent (legacy)
        'logic-cyan-bright': '#006A86',   // Bright cyan - hover states
        'signal-yellow': '#FFB600',       // Alerts / caution areas
        'warning-amber': '#FFB600',       // Amber - main accent (legacy, alias to signal-yellow)
        'growth-green': '#22C55E',        // Green - success
        'purple-accent': '#3F2AA8',       // Purple - secondary accent
        'bg-cloud': '#F8FAFC',            // Cloud white - backgrounds
        'text-slate': '#1E293B',          // Slate - body text
        // Add more Stitch palette if needed
      },
      fontFamily: {
        // Inter is the Stitch default
        primary: ["'Inter'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
        hand: ["'Indie Flower'", 'cursive'],
      },
      borderRadius: {
        // Stitch uses a mix of modest and legacy roundness
        'sm': '2px',         // Design spec corner radius
        'stitch': '1rem',    // legacy roundness 16px
        'stitch-lg': '1.5rem', // 24px
        'stitch-xl': '2rem',   // 32px
      },
      spacing: {
        'grid': '16px',
        'grid-major': '32px',
      },
      animation: {
        'grid-move': 'gridMove 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(32px, 32px)' },
        },
        float: {
          '0%, 100%': { transform: 'rotate(-2deg) translateY(0px)' },
          '50%': { transform: 'rotate(-2deg) translateY(-10px)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(10, 37, 64, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(10, 37, 64, 0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
    },
  },
  plugins: [],
}

export default config
