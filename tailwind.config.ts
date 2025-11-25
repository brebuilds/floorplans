import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Boho-neutral palette
        neutral: {
          50: '#FAF9F7',
          100: '#F5F3F0',
          200: '#E8E5E0',
          300: '#D4CFC7',
          400: '#B8B1A6',
          500: '#9C9485',
          600: '#7A7264',
          700: '#5F584D',
          800: '#3F3A33',
          900: '#2A2621',
        },
        charcoal: {
          DEFAULT: '#36454F',
          50: '#F4F6F7',
          100: '#E8EBED',
          200: '#D1D7DB',
          300: '#BAC3C9',
          400: '#6B7D8A',
          500: '#36454F',
          600: '#2D3840',
          700: '#242B31',
          800: '#1B1E22',
          900: '#121213',
        },
        accent: {
          beige: '#F5E6D3',
          taupe: '#C9B99B',
          sage: '#A8B5A0',
          terracotta: '#C97D60',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        'boho': '0.5rem',
        'boho-lg': '0.75rem',
      },
      boxShadow: {
        'boho': '0 2px 8px rgba(54, 69, 79, 0.08)',
        'boho-md': '0 4px 12px rgba(54, 69, 79, 0.12)',
        'boho-lg': '0 8px 24px rgba(54, 69, 79, 0.16)',
      },
    },
  },
  plugins: [],
};
export default config;

