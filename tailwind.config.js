/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        knot: {
          black: '#000000',
          cream: '#FDFAF3',
          yellow: '#F7CB46',
          pink: '#FE90E8',
          mint: '#C0F7FE',
          green: '#99E885',
          peach: '#FFDC8B',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'neo': '6px 6px 0px 0px #000000',
        'neo-sm': '4px 4px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}