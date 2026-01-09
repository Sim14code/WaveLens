/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00f0ff',
        secondary: '#7000ff',
        dark: '#0a0a0a',
        surface: '#1a1a1a',
      }
    },
  },
  plugins: [],
}
