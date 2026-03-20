export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#edf2f8',
          100: '#d8e3f0',
          600: '#1f4a74',
          700: '#183a5b',
          800: '#112c45',
          900: '#0b1e31'
        }
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true })
  ]
};
