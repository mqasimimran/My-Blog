import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./mdx-components.tsx",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
module.exports = {
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
}