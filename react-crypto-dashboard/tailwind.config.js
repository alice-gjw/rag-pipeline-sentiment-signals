/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#1a1b23",
        card: "#22232d",
        border: "#2e3040",
      },
    },
  },
  plugins: [],
};
