import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Arial Black", "Impact", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        acid: "#d7ff2f",
        cyanpop: "#20f6ff",
        hotpink: "#ff2bd6",
        ink: "#05040a",
        volt: "#fff34a",
      },
      boxShadow: {
        hyper: "0 0 0 1px rgba(255,255,255,.14), 0 0 35px rgba(32,246,255,.22), 0 0 80px rgba(255,43,214,.16)",
      },
    },
  },
  plugins: [],
};

export default config;
