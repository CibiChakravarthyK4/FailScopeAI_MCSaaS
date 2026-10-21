/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Values live in one place, src/theme/tokens.css (CLAUDE.md 4.2) - these
        // utilities just read the CSS variables, so brand-blue etc. and iv-blue
        // etc. below are always the same color, never two sources of truth.
        brand: {
          blue: 'var(--iv-blue)',
          'blue-dark': 'var(--iv-blue-deep)',
          'blue-light': 'var(--iv-blue-50)',
        },
        ink: 'var(--iv-text)',
        muted: 'var(--iv-text-2)',
        line: 'var(--iv-border)',
        iv: {
          blue: 'var(--iv-blue)',
          'blue-hover': 'var(--iv-blue-hover)',
          'blue-deep': 'var(--iv-blue-deep)',
          'blue-100': 'var(--iv-blue-100)',
          'blue-50': 'var(--iv-blue-50)',
          bg: 'var(--iv-bg)',
          text: 'var(--iv-text)',
          'text-2': 'var(--iv-text-2)',
          border: 'var(--iv-border)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
};
