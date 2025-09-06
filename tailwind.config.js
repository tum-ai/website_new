module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#891fdb", // Set primary color for text
        accent: "#891fdb",  // Set accent color for text
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};