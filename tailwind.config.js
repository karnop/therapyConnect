/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F6", // Warm Alabaster
        primary: "#2D2D2D", // Soft Charcoal (Text)
        secondary: "#6B8E78", // Sage Leaf (Brand/Trust)
        accent: "#E09F7D", // Warm Clay (Buttons/Highlights)
        surface: "#FFFFFF", // Pure White (Cards)
        muted: "#A3A3A3", // Light Gray (Placeholder text)
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)", // Super gentle shadow
      },
    },
  },
  plugins: [],
};
