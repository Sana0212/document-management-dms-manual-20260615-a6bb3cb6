/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f1419',
        foreground: '#e7e9ea',
        muted: '#8b98a5',
        accent: '#1d9bf0',
      },
    },
  },
  plugins: [],
};
