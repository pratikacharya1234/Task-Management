import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FORGE Industrial Color Palette
        primary: {
          DEFAULT: '#8B1538', // Deep Burgundy
          50: '#FFF1F4',
          100: '#FFE3E9',
          200: '#FFC7D4',
          300: '#FF9AB4',
          400: '#FF5D89',
          500: '#E63868',
          600: '#C7174F',
          700: '#8B1538',
          800: '#6B1029',
          900: '#4A0B1C',
        },
        secondary: {
          DEFAULT: '#B87333', // Warm Copper
          50: '#FDF7F3',
          100: '#FBEEE6',
          200: '#F4D9C8',
          300: '#E8BEA0',
          400: '#D69767',
          500: '#B87333',
          600: '#995F2B',
          700: '#7A4C22',
          800: '#5C391A',
          900: '#3D2611',
        },
        accent: {
          DEFAULT: '#E97451', // Burnt Sienna
          50: '#FEF4F1',
          100: '#FCE9E3',
          200: '#F9D3C7',
          300: '#F5B39F',
          400: '#EF8D6F',
          500: '#E97451',
          600: '#D85433',
          700: '#B13E22',
          800: '#8A3119',
          900: '#5D2111',
        },
        background: {
          DEFAULT: '#2C2420', // Warm Charcoal
          50: '#F5F4F3',
          100: '#E8E6E4',
          200: '#D0CBC7',
          300: '#AFA5A0',
          400: '#7D6F68',
          500: '#564B44',
          600: '#3E3530',
          700: '#2C2420',
          800: '#1F1A17',
          900: '#14110F',
        },
        surface: {
          DEFAULT: '#4A4238', // Taupe Gray
          50: '#F7F6F5',
          100: '#EEEDEB',
          200: '#DBD9D5',
          300: '#C3BFB9',
          400: '#9D968D',
          500: '#7A7268',
          600: '#5F5850',
          700: '#4A4238',
          800: '#36312A',
          900: '#25221C',
        },
        text: {
          primary: '#F5F1E8',   // Cream
          secondary: '#D4C5B0',  // Soft Beige
        },
        success: '#2D5016',      // Forest Green
        warning: '#FFBF00',      // Amber Gold
        error: '#C04000',        // Terracotta
        info: '#4682B4',         // Steel Blue
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Lexend', 'sans-serif'],
        display: ['Clash Display', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'forge-glow': {
          '0%, 100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        'ember-float': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(0.5)', opacity: '0' },
        },
        'spark': {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(var(--x), var(--y)) scale(0)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'forge-glow': 'forge-glow 3s ease-in-out infinite',
        'ember-float': 'ember-float 4s ease-out infinite',
        'spark': 'spark 0.6s ease-out forwards',
      },
      boxShadow: {
        'forge': '0 8px 32px rgba(139, 21, 56, 0.4), 0 2px 8px rgba(0, 0, 0, 0.6)',
        'forge-hover': '0 12px 48px rgba(184, 115, 51, 0.5), 0 4px 16px rgba(0, 0, 0, 0.7)',
        'ember': '0 0 20px rgba(233, 116, 81, 0.6), 0 0 40px rgba(233, 116, 81, 0.3)',
        'metal': 'inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
