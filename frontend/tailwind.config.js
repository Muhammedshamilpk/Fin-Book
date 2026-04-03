/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080c14',
        'bg-secondary': '#0d1220',
        card: '#111827',
        'card-hover': '#161e2e',
        accent: '#6366f1',
        'accent-2': '#06b6d4',
        border: 'rgba(99, 130, 255, 0.12)',
        'border-bright': 'rgba(99, 130, 255, 0.3)',
        primary: '#6366f1',
        'primary-foreground': '#ffffff',
        foreground: '#f0f4ff',
        'muted-foreground': '#8892b0',
        muted: '#1f2937',
        green: '#10d9a8',
        red: '#f43f5e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 48px rgba(99, 102, 241, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}
