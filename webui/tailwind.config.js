/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-color-scheme="dark"]'],
  theme: {
    extend: {
      colors: {
        'background-base': 'var(--background-base)',
        'background-weak': 'var(--background-weak)',
        'background-strong': 'var(--background-strong)',
        'surface-base': 'var(--surface-base)',
        'surface-strong': 'var(--surface-strong)',
        'surface-weak': 'var(--surface-weak)',
        'text-base': 'var(--text-base)',
        'text-strong': 'var(--text-strong)',
        'text-weak': 'var(--text-weak)',
        'text-weaker': 'var(--text-weaker)',
        'border-base': 'var(--border-base)',
        'border-weak': 'var(--border-weak-base)',
        'border-hover': 'var(--border-hover)',
        'icon-base': 'var(--icon-base)',
        'icon-strong': 'var(--icon-strong-base)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      spacing: {
        'sidebar': 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
        'topbar': 'var(--topbar-height)',
        'statusbar': 'var(--statusbar-height)',
      },
    },
  },
  plugins: [],
}
