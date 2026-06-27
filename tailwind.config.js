/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: { extend: { colors: { brand: { DEFAULT: '#7c3aed', dark: '#6d28d9' } } } },
  plugins: [],
};
