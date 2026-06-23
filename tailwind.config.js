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
          50: '#FDF2EF',
          100: '#F9DCD6',
          200: '#F2B5A8',
          300: '#E88874',
          400: '#C85A3A',
          500: '#B54A3A',
          600: '#963828',
          700: '#7A2A1C',
          800: '#5E1E14',
          900: '#3D120C',
        },
        accent: {
          100: '#FAF0D8',
          200: '#F2DDA8',
          300: '#E0B840',
          400: '#D4A030',
          500: '#B58820',
          600: '#8F6C18',
        },
        surface: '#FFFFFF',
        background: '#FAF5F0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
