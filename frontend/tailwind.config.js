/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#12203D",
          800: "#1A2C4D",
          700: "#233A63",
        },
        parchment: "#F6F2E9",
        stamp: {
          approve: "#2F6E4F",
          reject: "#B23A2E",
          pending: "#C9A227",
        },
        ink: "#3A3226",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
