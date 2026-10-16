/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        milk: '#FFFCF7',
        oat: '#F1E6D6',
        oatdeep: '#E4D3BC',
        cocoa: '#2B1911',
        cocoa2: '#5A3E30',
        raspberry: '#E3405E',
        raspberry2: '#C22A47',
        caramel: '#E4A64A',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { hero: '2rem', tile: '1.25rem', chip: '999px' },
      boxShadow: {
        lift: '0 18px 40px -20px rgba(43,25,17,0.35)',
        glass: '0 8px 32px -12px rgba(43,25,17,0.25)',
      },
    },
  },
  plugins: [],
}
