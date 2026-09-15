/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#C9A227',
        secondary: '#0EA57A',
        accent: '#E8C874',
        void: {
          DEFAULT: '#050505',
          light: '#0a0a0a',
          card: '#111113',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 30px -8px rgba(201, 162, 39, 0.45)',
        'glow-cyan': '0 0 30px -8px rgba(14, 165, 122, 0.4)',
        'glow-pink': '0 0 30px -8px rgba(232, 200, 116, 0.4)',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #C9A227 0%, #0EA57A 100%)',
      },
    },
  },
  plugins: [],
}
