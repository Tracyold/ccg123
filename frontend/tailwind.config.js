/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        oranienbaum: ['Oranienbaum', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        comfortaa: ['Comfortaa', 'sans-serif'],
        cormorant: ['Cormorant', 'serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        gold: '#d4af37',
        'gold-alt': '#cfb040',
        teal: 'rgba(45, 212, 191, 1)',
        charcoal: '#222831',
        slate: '#393E46',
        amber: '#FFD369',
        cream: '#EEEEEE',
      },
      keyframes: {
        'gold-glow': {
          '0%, 100%': { boxShadow: '0 0 40px rgba(214,180,70,0.08)' },
          '50%': { boxShadow: '0 0 60px rgba(214,180,70,0.18)' },
        },
      },
      animation: {
        'gold-glow': 'gold-glow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
