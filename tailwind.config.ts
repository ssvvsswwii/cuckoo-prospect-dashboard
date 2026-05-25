import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7e171b',
          dark:    '#5c1013',
          light:   '#fdf2f2',
          muted:   '#f9e8e8',
        },
      },
    },
  },
  plugins: [],
}
export default config
