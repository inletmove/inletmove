import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        black: {
          DEFAULT: '#050810',
          soft: '#0A0F1A',
        },
        inlet: {
          deep: '#0E1F36',
          navy: '#14385C',
          mid: '#1F4D7A',
        },
        pacific: '#1F7A8C',
        teal: {
          glow: '#4FB3C7',
          soft: '#B7DEE5',
        },
        ember: {
          DEFAULT: '#E76F51',
          warm: '#F5A48F',
          soft: '#FCE3DA',
        },
        bone: {
          DEFAULT: '#F4F1ED',
          warm: '#ECE7DF',
        },
        paper: '#FAF7F2',
        graphite: '#5C6064',
        charcoal: '#2A2D34',
        mist: {
          DEFAULT: '#B8BCC2',
          dim: '#6B7080',
        },
        success: '#4D8B6E',
        amber: '#D4A347',
        error: '#C0392B',
        line: {
          light: 'rgba(14, 42, 71, 0.08)',
          mid: 'rgba(14, 42, 71, 0.14)',
          dark: 'rgba(255, 255, 255, 0.08)',
          darker: 'rgba(255, 255, 255, 0.16)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['"Hanken Grotesk"', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-1': ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.97', letterSpacing: '-0.04em' }],
        'display-2': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-3': ['1.5rem', { lineHeight: '1.3' }],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      maxWidth: {
        container: '1280px',
        prose: '65ch',
      },
      boxShadow: {
        'phone': '0 30px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(31, 122, 140, 0.2)',
        'cta': '0 8px 24px rgba(231, 111, 81, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
      },
      animation: {
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
