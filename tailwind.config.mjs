/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Mirror the --mx-* CSS custom properties so Tailwind utilities
        // and raw `var(--mx-*)` references stay in lockstep.
        mx: {
          bg: '#07040d',
          'bg-2': '#0d0719',
          surface: '#150b29',
          'surface-2': '#1f1138',
          purple: '#a855f7',
          'purple-2': '#c084fc',
          'purple-deep': '#7c3aed',
          gold: '#fbbf24',
          'gold-2': '#f59e0b',
          'gold-warm': '#d4a73a',
          text: '#fafafa',
          'text-2': '#d4d4d8',
          'text-muted': '#a1a1aa',
          'text-dim': '#71717a',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Monaco', 'monospace'],
      },
      borderRadius: {
        'mx-sm': '10px',
        mx: '16px',
        'mx-lg': '22px',
        'mx-xl': '28px',
      },
      screens: {
        // Match the existing breakpoints used by public_ui.py
        xs: '480px',
      },
    },
  },
  plugins: [],
};
