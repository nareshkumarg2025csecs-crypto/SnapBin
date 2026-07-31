/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFCF9",
          100: "#F7F5F1",
          200: "#EDE9E0",
          300: "#DDD8CB",
        },
        ink: {
          900: "#1A1714",
          800: "#2C2925",
          700: "#403C37",
          600: "#5A5550",
          500: "#7A756F",
        },
        amber: {
          accent: "#C1512D",
          hover: "#A8431F",
          light: "#F2D5C8",
          muted: "#E8B89E",
        },
        dark: {
          bg: "#111010",
          surface: "#1C1B1A",
          border: "#2E2C2A",
          muted: "#3D3B38",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Menlo", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
