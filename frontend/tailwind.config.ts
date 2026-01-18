import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          teal: '#a8c9c3',
          lavender: '#d4c9e0',
          gold: '#e8d9b8',
          text: '#4a4a48',
          'text-light': '#8a8a88',
          'bg-start': '#fafaf8',
          'bg-mid': '#f0efe8',
          'bg-end': '#e8ebe5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      backdropBlur: {
        '20': '20px',
      },
    },
  },
  plugins: [],
}
export default config
