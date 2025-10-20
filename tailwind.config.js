/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#4a4a4a',
          400: '#5a5a5a',
        },
        crypto: {
          green: '#00d4aa',
          red: '#ff6b6b',
          bitcoin: '#f7931a',
          ethereum: '#627eea',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.08)',
          dark: 'rgba(0, 0, 0, 0.2)',
          border: 'rgba(255, 255, 255, 0.15)',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.85)',
          tertiary: 'rgba(255, 255, 255, 0.65)',
          muted: 'rgba(255, 255, 255, 0.45)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-crypto': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        'crypto-pattern': 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.08), transparent 50%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))',
        'section-separator': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'strong': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.08)',
        'neon-blue': '0 0 20px rgba(14, 165, 233, 0.5)',
        'neon-green': '0 0 20px rgba(0, 212, 170, 0.5)',
        'neon-red': '0 0 20px rgba(255, 107, 107, 0.5)',
        'section': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'elevated': '0 8px 24px 0 rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'expand': 'expand 0.3s ease-out',
        'collapse': 'collapse 0.3s ease-in',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        expand: {
          '0%': { maxHeight: '0', opacity: '0' },
          '100%': { maxHeight: '500px', opacity: '1' },
        },
        collapse: {
          '0%': { maxHeight: '500px', opacity: '1' },
          '100%': { maxHeight: '0', opacity: '0' },
        },
      },
      spacing: {
        'section': '3rem',
        'component': '2rem',
      }
    },
  },
  plugins: [],
}
