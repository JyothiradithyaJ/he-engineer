/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1E23',
        'ink-2': '#123338',
        'ink-3': '#1B4249',
        mist: '#F4FBFA',
        paper: '#FFFFFF',
        teal: {
          DEFAULT: '#0E7C86',
          light: '#56C2C0',
          dark: '#0A5A62',
        },
        amber: {
          DEFAULT: '#F5B500',
          deep: '#D99A00',
        },
        moss: '#2FAE60',
        coral: '#E1553F',
        slate: {
          DEFAULT: '#123338',
          muted: '#5B7A7D',
          faint: '#9DB6B8',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(11,30,35,0.25)',
        card: '0 1px 2px rgba(11,30,35,0.06), 0 8px 24px -12px rgba(11,30,35,0.12)',
      },
      backgroundImage: {
        'flow-gradient': 'linear-gradient(135deg, #0B1E23 0%, #0E7C86 55%, #1B4249 100%)',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-200' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        flow: 'flow 6s linear infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
