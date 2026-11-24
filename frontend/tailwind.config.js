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
        // Apple HIG System Palette
        ios: {
          blue: {
            DEFAULT: '#0071e3',
            dark: '#0a84ff',
            light: '#e8f2ff',
            hover: '#0077ed'
          },
          green: {
            DEFAULT: '#34c759',
            dark: '#30d158',
            light: '#eafaf0'
          },
          orange: {
            DEFAULT: '#ff9500',
            dark: '#ff9f0a',
            light: '#fff6e8'
          },
          red: {
            DEFAULT: '#ff3b30',
            dark: '#ff453a',
            light: '#ffebee'
          },
          purple: {
            DEFAULT: '#af52de',
            dark: '#bf5af2',
            light: '#f8efff'
          },
          canvas: {
            light: '#f5f5f7',
            dark: '#000000'
          },
          card: {
            light: '#ffffff',
            dark: '#1c1c1e',
            secondaryLight: '#f2f2f7',
            secondaryDark: '#2c2c2e',
            tertiaryLight: '#e5e5ea',
            tertiaryDark: '#3a3a3c'
          },
          label: {
            primaryLight: '#1d1d1f',
            primaryDark: '#f5f5f7',
            secondaryLight: '#86868b',
            secondaryDark: '#98989d',
            tertiaryLight: '#aeaeb2',
            tertiaryDark: '#636366'
          },
          separator: {
            light: 'rgba(60, 60, 67, 0.12)',
            dark: 'rgba(84, 84, 88, 0.36)'
          }
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a6f6',
          500: '#0071e3',
          600: '#006ac9',
          700: '#0155a3',
          800: '#054885',
          900: '#0a3d6f',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'apple-card-dark': '0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'apple-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        'apple-hover-dark': '0 16px 40px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'apple-modal': '0 24px 64px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)'
      },
      borderRadius: {
        'apple': '18px',
        'apple-lg': '22px',
        'apple-xl': '28px',
        'apple-pill': '9999px'
      }
    },
  },
  plugins: [],
}
