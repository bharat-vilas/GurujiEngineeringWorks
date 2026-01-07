/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#486A47",
        secondary: "#f0f9f0",
      },
    },
  },
  plugins: [],
}

