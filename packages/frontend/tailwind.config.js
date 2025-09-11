/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          deep: '#0B0E14',
          dark: '#1A1F2E',
          medium: '#2D3748',
          light: '#4A5568',
        },
        cosmic: {
          blue: '#1E3A8A',
          purple: '#7C3AED',
          violet: '#A855F7',
          indigo: '#4338CA',
        },
        satellite: {
          communication: '#3B82F6',
          weather: '#10B981',
          military: '#EF4444',
          scientific: '#8B5CF6',
          navigation: '#F59E0B',
          'space-station': '#EC4899',
          debris: '#6B7280',
          other: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
