/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "ink" = page background layer (light theme)
        ink: {
          DEFAULT: "#F3F5F8",
          2: "#FFFFFF",
          3: "#E4E9F0",
          text: "#1E293B",
        },
        // "paper" = elevated card surface
        paper: {
          DEFAULT: "#FFFFFF",
          2: "#F8FAFC",
          3: "#EEF2F7",
        },
        // "brass" repurposed as primary brand blue
        brass: {
          DEFAULT: "#0F4C81",
          deep: "#0B3A63",
          light: "#3E76A8",
        },
        // "emerald" = success green
        emerald: {
          DEFAULT: "#16A34A",
          deep: "#0F7C38",
        },
        // "oxblood" = danger red
        oxblood: {
          DEFAULT: "#DC2626",
          deep: "#B91C1C",
        },
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        stamp: "none",
        card: "0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.08)",
        soft: "0 4px 16px -4px rgba(15,23,42,0.10)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        riseIn: "riseIn 0.4s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
}
