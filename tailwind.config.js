/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Area colors - más sutiles
    'bg-green-25',
    'text-green-600',
    'border-green-100',
    'bg-pink-25',
    'text-pink-600',
    'border-pink-100',
    'bg-blue-25',
    'text-blue-600',
    'border-blue-100',
    'bg-amber-25',
    'text-amber-600',
    'border-amber-100',
    // Dark mode variants
    'dark:bg-green-900/20',
    'dark:text-green-300',
    'dark:border-green-800',
    'dark:bg-pink-900/20',
    'dark:text-pink-300',
    'dark:border-pink-800',
    'dark:bg-blue-900/20',
    'dark:text-blue-300',
    'dark:border-blue-800',
    'dark:bg-amber-900/20',
    'dark:text-amber-300',
    'dark:border-amber-800',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        elegant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'],
      },
      colors: {
        // Arrebol Weddings Palette
        arrebol: {
          beige: {
            50: '#fefdfb',
            100: '#fcf8f2',
            200: '#f7f0e4',
            300: '#f2e7d3',
            400: '#ebdcc0',
            500: '#e3cfaa',  // Main beige
            600: '#d4b894',
            700: '#c4a27c',
            800: '#a68660',
            900: '#8b6f4a',
          },
          terracota: {
            50: '#fdf5f3',
            100: '#fae8e4',
            200: '#f5d5cd',
            300: '#edb9a8',
            400: '#e39478',
            500: '#d87254',  // Main terracota
            600: '#c85a3a',
            700: '#a8472f',
            800: '#8b3c2b',
            900: '#73342a',
          },
          cream: {
            50: '#fffef7',
            100: '#fffceb',
            200: '#fef9d3',
            300: '#fdf4ab',
            400: '#fbec7e',
            500: '#f9e651',
            600: '#f0d943',
            700: '#dcc432',
            800: '#b79f2a',
            900: '#947f26',
          },
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#d87254',  // Terracota principal
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f5f5f7',
          foreground: '#1d1d1f',
        },
        destructive: {
          DEFAULT: '#ff3b30',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f5f5f7',
          foreground: '#86868b',
        },
        accent: {
          DEFAULT: '#007aff',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [],
}