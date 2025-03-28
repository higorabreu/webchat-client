/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      borderWidth: {
        '0': '0',
        '1': '1px',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
      colors: {
        'primary': '#1E293B',
        'secondary': '#2D3748',
        'tertiary': '#0EA5E9',
        'quaternary': '#17202D',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],  
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        'custom-small': ['0.7rem', { lineHeight: '1rem' }], 
        'custom-large': ['2.8rem', { lineHeight: '3rem' }],
      },
      screens: {
        'xs': '475px',
        'sm1': '635px',
      },
    },
  },
  plugins: [],
}
