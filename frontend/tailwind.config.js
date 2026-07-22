/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#F7931E', // Primary Orange
        },
        green: {
          900: '#1A3322', // Dark Green
        },
        cream: {
          50: '#FAFAFA', // Very light cream/gray for subtle backgrounds
          100: '#F5F5F5',
        },
        dark: '#111111', // Dark Gray
        gold: {
          500: '#D4AF37', // Gold Accent
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], // Headings
        inter: ['Inter', 'sans-serif'], // Body
      },
      fontSize: {
        'hero': ['56px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'page': ['42px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'section': ['36px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'sub': ['24px', { lineHeight: '1.4' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'small': ['14px', { lineHeight: '1.5' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 40px -10px rgba(247, 147, 30, 0.15)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
      },
    },
  },
  plugins: [],
};
