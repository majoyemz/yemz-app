import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        coral: "#E86C52",
        "gem-empty": "#E8E8E8",
        yemz: {
          50: "#FEF2F0",
          100: "#FDE5E0",
          200: "#FBCBC1",
          300: "#F5A797",
          400: "#EF8A77",
          500: "#E86C52",
          600: "#D4523A",
          700: "#B03D2B",
          800: "#8C3122",
          900: "#72291D",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
