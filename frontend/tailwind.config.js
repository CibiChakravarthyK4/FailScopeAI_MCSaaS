/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0A5CD8',
          'blue-dark': '#063D8F',
          'blue-light': '#EAF1FD',
        },
        ink: '#1B1F26',
        muted: '#6B7280',
        line: '#E3E7EE',
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
