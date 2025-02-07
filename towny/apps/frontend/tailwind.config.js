/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6758ff",
        "primary-hover": "#5246cc",
        "primary-btn-text": "#ffffff",
        secondary: "#f3f2ff",
        "secondary-hover": "#e9e8ff",
        "secondary-btn-text": "#6758ff",
      }
    },
  },
  plugins: [],
}