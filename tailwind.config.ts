import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          dark: "var(--accent-dark)",
          soft: "var(--accent-soft)",
          border: "var(--accent-border)",
          text: "var(--accent-text)",
          secondary: "var(--accent-secondary)",
          "secondary-soft": "var(--accent-secondary-soft)",
          "secondary-text": "var(--accent-secondary-text)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
