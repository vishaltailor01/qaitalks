import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Blueprint Design System Colors
        'deep-blueprint': '#001B44',      // Navy - primary brand color
        'logic-cyan': '#00B4D8',          // Cyan - accent/highlight
        'logic-cyan-bright': '#00D4FF',   // Bright cyan - hover states
        'warning-amber': '#FFB700',       // Amber - accents & warnings
        'growth-green': '#22C55E',        // Green - success states
        'purple-accent': '#8B5CF6',       // Purple - secondary accent
        'bg-cloud': '#F8FAFC',            // Cloud white - light backgrounds
        'text-slate': '#1E293B',          // Slate - body text
      },
      fontFamily: {
        primary: ["'Inter'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
        hand: ["'Indie Flower'", 'cursive'],
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
