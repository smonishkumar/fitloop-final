/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
          "primary": "var(--primary)",
          "primary-dim": "var(--primary-dim)",
          "on-primary": "var(--on-primary)",
          "secondary": "var(--secondary)",
          "background": "var(--background)",
          "on-background": "var(--on-background)",
          "surface": "var(--surface)",
          "on-surface": "var(--on-surface)",
          "on-surface-variant": "var(--on-surface-variant)",
          "surface-container": "var(--surface-container)",
          "surface-container-high": "var(--surface-container-high)",
          "surface-container-highest": "var(--surface-container-highest)",
          "outline-variant": "var(--outline-variant)",
          "primary-container": "#ae8dff",
          "secondary-container": "#006d35",
          "tertiary": "#57bcff",
          "tertiary-dim": "#00a7f2",
          "error": "#ff6e84",
      },
      "borderRadius": {
          "sm": "0.5rem",
          "DEFAULT": "0.75rem",
          "lg": "1rem",
          "xl": "1.25rem",
          "2xl": "1.5rem",
          "full": "9999px"
      },
      "spacing": {
        "px": "1px",
        "0": "0",
        "0.5": "0.125rem",
        "1": "0.25rem",
        "1.5": "0.375rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "8": "2rem",
        "10": "2.5rem",
        "12": "3rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
        "32": "8rem",
        "40": "10rem",
        "48": "12rem",
        "56": "14rem",
        "64": "16rem",
      },
      "boxShadow": {
        "premium": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "premium-hover": "0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      "fontFamily": {
          "headline": ["Space Grotesk", "sans-serif"],
          "body": ["Manrope", "sans-serif"],
          "label": ["Manrope", "sans-serif"]
      }
    },
  },
  plugins: [],
}
