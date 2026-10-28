/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/data/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        navy: {
          950: '#040711',
          900: '#060B17',
          850: '#080E1E',
          800: '#0D172F',
          700: '#152342',
        },
        fintech: {
          emerald: '#00D47E',
          blue: '#2563EB',
          cyan: '#38BDF8',
          amber: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};

