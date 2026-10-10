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
        background: "#0F172A",
        surface: "#1E293B",
        "surface-raised": "#334155",
        "emergency-red": {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#B91C1C",
          glow: "rgba(239, 68, 68, 0.35)",
        },
        "success-green": {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#047857",
        },
        "accent-blue": {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#1D4ED8",
        },
        "warning-amber": {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#B45309",
        },
      },
      animation: {
        pulse_fast: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ping_slow: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        beacon: "beacon 1.5s ease-in-out infinite",
      },
      keyframes: {
        beacon: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};
