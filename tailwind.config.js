/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        // that is animation class
        animation: {
            fade: 'fadeOut 1s ease-in-out',
        },

        // that is actual animation
        keyframes: theme => ({
            fadeOut: {
                '0%': { backgroundColor: theme('colors.gray.800') },
                '100%': { backgroundColor: theme('colors.transparent') },
            },
        })
    }
  },
  plugins: [],
  darkMode: 'class'
}
