/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#0B0E1A",
        surface: "#131628",
        "surface-raised": "#1B1F38",
        border: "#262B4A",
        signal: {
          DEFAULT: "#7C6FFF",
          dim: "#5A4FD9",
          glow: "#A79CFF",
        },
        match: {
          DEFAULT: "#2DD4BF",
          dim: "#1FA895",
        },
        spark: {
          DEFAULT: "#FFB454",
          dim: "#E09A3E",
        },
        ink: {
          DEFAULT: "#F5F6FA",
          muted: "#9CA3C0",
          faint: "#5B6284",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(circle at 50% 0%, rgba(124,111,255,0.15), transparent 60%)",
        "signal-gradient": "linear-gradient(135deg, #7C6FFF 0%, #2DD4BF 100%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 111, 255, 0.25)",
        "glow-teal": "0 0 40px rgba(45, 212, 191, 0.2)",
      },
      keyframes: {
        "pulse-line": {
          "0%, 100%": { strokeDashoffset: "0" },
          "50%": { strokeDashoffset: "20" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pulse-line": "pulse-line 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
      },
    },
  },
  plugins: [],
};
