const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['"JetBrains Mono"', ...fontFamily.mono],
      },
      colors: {
        ink: '#0F172A',
        paper: '#F8FAFC',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        muted: {
          DEFAULT: '#64748B',
          bg: '#F1F5F9',
        },
        status: {
          pending: '#B45309',
          'pending-bg': '#FFFBEB',
          confirmed: '#047857',
          'confirmed-bg': '#ECFDF5',
          cancelled: '#B91C1C',
          'cancelled-bg': '#FEF2F2',
          completed: '#047857',
          'completed-bg': '#ECFDF5',
          failed: '#B91C1C',
          'failed-bg': '#FEF2F2',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        dropdown: '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        none: 'none',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.18s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
