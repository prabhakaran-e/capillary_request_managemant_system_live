/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from 'tailwind-scrollbar';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#80c242",
      },
      fontFamily: {
        prima: ["Prima Sans", "sans-serif"],
      },
    },
  },
  plugins: [tailwindScrollbar],
};
