import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./mdx-components.tsx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#800020',
          dark: '#5c0017',
          light: '#fdf2f2',
        },
      },
    },
  },
  plugins: [
    typography,
  ],
} satisfies Config;
