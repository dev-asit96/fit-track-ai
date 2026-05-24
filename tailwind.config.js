/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1215',
        surface: '#131F24',
        surfaceHighlight: '#1B2A31',
        primary: '#10B981',
        primaryHover: '#059669',
        secondary: '#0EA5E9',
        accent: '#F59E0B',
        text: '#F8FAFC',
        textMuted: '#94A3B8'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
