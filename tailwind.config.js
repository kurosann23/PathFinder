/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'base': ['18px', { lineHeight: '1.75', letterSpacing: '-0.01em' }],
        'lg': ['20px', { lineHeight: '1.75', letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [],
  // Use class-based dark mode with custom light-mode class
  darkMode: ['class', '.dark-mode'],
}

