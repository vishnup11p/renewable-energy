/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f3460',
        secondary: '#16213e',
        accent: '#e94560',
      },
    },
  },
  plugins: [],
}
