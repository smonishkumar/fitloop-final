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
          "primary": "#6366f1", // Refined Indigo
          "primary-dim": "#4f46e5",
          "on-primary": "#ffffff",
          "secondary": "#10b981", // Emerald
          "background": "#fafafa", // Zinc 50
          "on-background": "#09090b", // Zinc 950
          "surface": "#ffffff",
          "on-surface": "#18181b", // Zinc 900
          "on-surface-variant": "#71717a", // Zinc 500
          "surface-container": "#f4f4f5", // Zinc 100
          "surface-container-high": "#e4e4e7", // Zinc 200
          "surface-container-highest": "#d4d4d8", // Zinc 300
          "outline-variant": "#e4e4e7", // Zinc 200
          "zinc": {
            "50": "#fafafa",
            "100": "#f4f4f5",
            "200": "#e4e4e7",
            "300": "#d4d4d8",
            "400": "#a1a1aa",
            "500": "#71717a",
            "600": "#52525b",
            "700": "#3f3f46",
            "800": "#27272a",
            "900": "#18181b",
            "950": "#09090b"
          },
          "primary-container": "#e0e7ff",
          "secondary-container": "#dcfce7",
          "tertiary": "#0ea5e9", // Sky
          "tertiary-dim": "#0284c7",
          "error": "#ef4444",
      },
      "borderRadius": {
          "sm": "0.375rem",
          "DEFAULT": "0.5rem",
          "lg": "0.75rem",
          "xl": "1rem",
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
        "2.5": "0.625rem",
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
