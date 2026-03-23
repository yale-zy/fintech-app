/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        'apple-blue': '#971b2f',
        'apple-green': '#34C759',
        'apple-red': '#c0392b',
        'apple-orange': '#e67e22',
        apple: {
          blue: '#971b2f',
          green: '#34C759',
          red: '#c0392b',
          orange: '#e67e22',
          gray: {
            1: '#8E8E93',
            2: '#AEAEB2',
            3: '#C7C7CC',
            4: '#D1D1D6',
            5: '#E5E5EA',
            6: '#F2F2F7',
          },
        },
      },
    },
  },
  plugins: [],
}
