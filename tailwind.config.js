/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#EFE6DA",
        surface: "#F8F3EC",
        primary: "#2F1E14",
        "primary-foreground": "#FFFFFF",
        accent: "#B88A2F",
        "accent-foreground": "#2F1E14",
        dark: "#1E130D",
        border: "#D9CBB8",
        "muted-foreground": "#6E5A4C",
      },
    },
  },
  plugins: [],
};
