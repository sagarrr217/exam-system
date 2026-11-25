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
        signal: {
          DEFAULT: '#E04F2D',
          bright: '#FF5A36',
          hover: '#EB5532',
          muted: 'rgba(255, 90, 54, 0.14)',
        },
        telemetry: {
          DEFAULT: '#0891B2',
          bright: '#22D3EE',
          muted: 'rgba(34, 211, 238, 0.12)',
        },
        verify: {
          DEFAULT: '#15803D',
          bright: '#10B981',
        },
        paper: {
          canvas: '#F3F1EC',
          surface: '#FFFFFF',
          tray: '#EAE7DF',
          ink: '#141413',
          muted: '#5C5A54',
        },
        obsidian: {
          canvas: '#0A0B0E',
          surface: '#12141A',
          tray: '#191C24',
          ink: '#F4F3EF',
          muted: '#8E93A0',
        },
        // Keep compatibility aliases where legacy classes exist
        ios: {
          blue: {
            DEFAULT: '#E04F2D',
            dark: '#FF5A36',
            light: '#FFF1ED',
            hover: '#EB5532'
          },
          green: {
            DEFAULT: '#15803D',
            dark: '#10B981',
            light: '#ECFDF5'
          },
          orange: {
            DEFAULT: '#D97706',
            dark: '#F59E0B',
            light: '#FFFBEB'
          },
          red: {
            DEFAULT: '#DC2626',
            dark: '#EF4444',
            light: '#FEF2F2'
          },
          purple: {
            DEFAULT: '#0891B2',
            dark: '#22D3EE',
            light: '#ECFEFF'
          },
        },
      },
      fontFamily: {
        display: [
          '"Bricolage Grotesque"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif'
        ],
        serif: [
          '"Instrument Serif"',
          'Georgia',
          'serif'
        ],
        sans: [
          '"Plus Jakarta Sans"',
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
        'surface-light': '0 1px 2px rgba(20, 20, 19, 0.04), 0 8px 24px -6px rgba(20, 20, 19, 0.06)',
        'surface-dark': '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 12px 32px -8px rgba(0, 0, 0, 0.65)',
        'signal-glow': '0 8px 28px -6px rgba(255, 90, 54, 0.35)',
        'telemetry-glow': '0 8px 28px -6px rgba(34, 211, 238, 0.25)',
      },
      borderRadius: {
        'studio': '14px',
        'studio-lg': '20px',
        'studio-xl': '26px',
      }
    },
  },
  plugins: [],
}
