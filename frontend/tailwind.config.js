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
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        tealaccent: {
          500: '#14B8A6',
          700: '#0F766E',
        },
        slatecanvas: {
          light: '#F8FAFC',
          dark: '#090E1A',
        },
      },
      fontFamily: {
        display: [
          '"Plus Jakarta Sans"',
          '"Inter"',
          'system-ui',
          'sans-serif'
        ],
        serif: [
          '"Fraunces"',
          'Georgia',
          'serif'
        ],
        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace'
        ]
      },
      boxShadow: {
        'card-light': '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.06)',
        'card-dark': '0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 16px 32px -12px rgba(0, 0, 0, 0.65)',
        'focus-ring': '0 0 0 3px rgba(29, 78, 216, 0.35)',
      },
      borderRadius: {
        'ui-sm': '8px',
        'ui-md': '12px',
        'ui-lg': '16px',
        'ui-xl': '20px',
      }
    },
  },
  plugins: [],
}
