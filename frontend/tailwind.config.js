/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chiliz: {
          red: '#CD2424',
          dark: '#1a1a1a',
          gray: '#2d2d2d'
        }
      }
    },
  },
  plugins: [],
}