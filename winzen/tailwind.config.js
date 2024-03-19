/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  extend: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};