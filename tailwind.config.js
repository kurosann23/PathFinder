/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  // Use class-based dark mode with custom light-mode class
  darkMode: ['class', '.dark-mode'],
}

