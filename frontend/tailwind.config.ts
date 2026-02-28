import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(60px, -80px) scale(1.1)" },
          "50%": { transform: "translate(-40px, 40px) scale(0.9)" },
          "75%": { transform: "translate(80px, 60px) scale(1.05)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-60px, 60px) scale(1.15)" },
          "66%": { transform: "translate(40px, -40px) scale(0.85)" },
        },
        "gradient-shift": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        float: "float 20s ease-in-out infinite",
        "float-slow": "float-slow 25s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
