/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Oficial LUMIA - Color Corporativo Fijo: #C94A2A (Terracota Vívido)
        lumia: {
          50: '#FAF0ED',
          100: '#F5DDD6',
          200: '#EBBBB0',
          300: '#E09482',
          400: '#D56D55',
          500: '#C94A2A', // COLOR OFICIAL FIJO
          600: '#B53D1F',
          700: '#963016',
          800: '#7A2712',
          900: '#631F0F',
          dark: '#2B2321'
        },
        patita: {
          50: '#FAF0ED',
          100: '#F5DDD6',
          200: '#EBBBB0',
          300: '#E09482',
          400: '#D56D55',
          500: '#C94A2A', // Redirigido a LUMIA Oficial
          600: '#B53D1F',
          700: '#963016',
          800: '#7A2712',
          900: '#631F0F',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
