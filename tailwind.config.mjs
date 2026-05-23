import starlightPlugin from '@astrojs/starlight-tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      opacity: {
        6: '0.06',
        8: '0.08',
        12: '0.12',
      },
      colors: {
        'vk-bg': 'rgb(var(--vk-bg) / <alpha-value>)',
        'vk-surface': 'rgb(var(--vk-surface) / <alpha-value>)',
        'vk-surface-2': 'rgb(var(--vk-surface-2) / <alpha-value>)',
        'vk-elevated': 'rgb(var(--vk-elevated) / <alpha-value>)',
        'vk-text': 'rgb(var(--vk-text) / <alpha-value>)',
        'vk-text-muted': 'rgb(var(--vk-text-muted) / <alpha-value>)',
        'vk-text-subtle': 'rgb(var(--vk-text-subtle) / <alpha-value>)',
        'vk-border': 'rgb(var(--vk-border) / <alpha-value>)',
        'vk-border-strong': 'rgb(var(--vk-border-strong) / <alpha-value>)',
        'vk-accent': 'rgb(var(--vk-accent) / <alpha-value>)',
        'vk-brand-gold': '#e9c46a',
        'vk-brand-teal': '#2a9d8f',
        'vk-brand-gold-soft': '#d4a373',
        'vk-brand-teal-soft': '#3ab8a8',
        'vk-brand-gold-light': '#f4e4a6',
      },
      fontFamily: {
        sans: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [starlightPlugin()],
};
