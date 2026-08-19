/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Obsidian Primary Palette
        primary: {
          50: '#F6F5F2',
          100: '#EAE8E3',
          200: '#DEDAD3',
          300: '#CFCAC1',
          400: '#85817A',
          500: '#625E57',
          600: '#4A4742',
          700: '#35332F',
          800: '#252421',
          900: '#1A1917',
          950: '#111110',
          DEFAULT: '#1A1917',
        },
        // Muted Champagne / Burnished Gold Accent
        accent: {
          50: '#FDFBF7',
          100: '#FAF3E6',
          200: '#F3E5C8',
          300: '#EAD5AA',
          400: '#DEC28C',
          500: '#C7A66A',
          600: '#A7834A',
          700: '#806638',
          800: '#5A492B',
          900: '#3D321F',
          950: '#2B2418',
          DEFAULT: '#C7A66A',
        },
        // Warm Neutral Background System
        crm: {
          bg: '#F6F5F2',
          'bg-subtle': '#F1F0EC',
          'bg-muted': '#EAE8E3',
          surface: '#FFFFFF',
          'surface-secondary': '#FAF9F6',
          'surface-tertiary': '#F3F1EC',
          border: '#E9E6E0',
          'border-default': '#DEDAD3',
          'border-strong': '#CFCAC1',
        },
        // Typography tokens
        neutral: {
          primary: '#1A1917',
          secondary: '#5F5C56',
          tertiary: '#85817A',
          muted: '#85817A',
          disabled: '#AAA69F',
          inverse: '#FFFFFF',
        },
        // Muted Semantic Statuses
        status: {
          success: '#64705B',
          'success-bg': '#EEF0EA',
          'success-border': '#D8DDD0',
          warning: '#9A6B2F',
          'warning-bg': '#FAF1E4',
          'warning-border': '#ECD8BA',
          error: '#A64B45',
          'error-bg': '#FAECEA',
          'error-border': '#EBCBC7',
          info: '#5F5C56',
          'info-bg': '#F0EFEB',
          'info-border': '#DCD9D2',
        },
        // Backward compatibility / Brand aliases mapped to Obsidian & Champagne
        brand: {
          50: '#FAF3E6',
          100: '#F3E5C8',
          200: '#EAD5AA',
          300: '#DEC28C',
          400: '#C7A66A',
          500: '#1A1917',
          600: '#1A1917',
          700: '#252421',
          800: '#35332F',
          900: '#111110',
          950: '#111110',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(26, 25, 23, 0.04)',
        card: '0 1px 3px rgba(26, 25, 23, 0.06), 0 1px 2px rgba(26, 25, 23, 0.04)',
        dropdown: '0 4px 12px rgba(26, 25, 23, 0.08)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
