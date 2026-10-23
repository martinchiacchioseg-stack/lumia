/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        patita: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f5b978',
          400: '#ee9241',
          500: '#ea731b',
          600: '#db5812',
          700: '#b64111',
          800: '#913415',
          900: '#752d15',
        },
        sage: {
          50: '#f3f7f4',
          100: '#e3eee6',
          200: '#c8ddce',
          300: '#a1c4ab',
          400: '#73a481',
          500: '#548762',
          600: '#406c4c',
          700: '#34563d',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
