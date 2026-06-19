/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        amber: {
          DEFAULT: "#E8A33D",
          deep: "#C8821F",
          soft: "#F6D9A8",
          tint: "#FBEFCD",
        },
        paper: {
          DEFAULT: "#FAF6EE",
          shade: "#F1E9D6",
          line: "#E4D9BF",
          ink: "#1F1A14",
          muted: "#6E6553",
        },
        morning: {
          DEFAULT: "#F0892E",
          soft: "#FBD9B6",
          ink: "#7A3A0A",
        },
        noon: {
          DEFAULT: "#3FAE7A",
          soft: "#C7EAD4",
          ink: "#11573A",
        },
        evening: {
          DEFAULT: "#4C6FB1",
          soft: "#C6D6EE",
          ink: "#1E3160",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        sticker: "0 6px 0 0 rgba(31,26,20,0.08), 0 14px 30px -12px rgba(31,26,20,0.25)",
        inset: "inset 0 2px 6px rgba(31,26,20,0.08)",
        panel: "0 1px 0 rgba(31,26,20,0.06), 0 18px 40px -28px rgba(31,26,20,0.45)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 20%, rgba(232,163,61,0.06), transparent 40%), radial-gradient(circle at 80% 0%, rgba(76,111,177,0.05), transparent 45%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pop-in": "pop-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
