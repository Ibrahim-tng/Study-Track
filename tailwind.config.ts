import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#818cf8",
          soft: "#eef2ff",
        },
        clay: {
          white: "#ffffff",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          pink: "#f472b6",
        },
        premium: {
          indigo: "#6366f1",
          violet: "#8b5cf6",
          blue: "#3b82f6",
          purple: "#a855f7",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-clay': 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'clay-sm': '8px 8px 16px rgba(0,0,0,0.05), inset -4px -4px 8px rgba(255,255,255,0.8), inset 4px 4px 8px rgba(0,0,0,0.02)',
        'clay-md': '12px 12px 24px rgba(0,0,0,0.08), inset -6px -6px 12px rgba(255,255,255,0.9), inset 6px 6px 12px rgba(0,0,0,0.03)',
        'clay-lg': '20px 20px 40px rgba(0,0,0,0.1), inset -10px -10px 20px rgba(255,255,255,0.95), inset 10px 10px 20px rgba(0,0,0,0.05)',
        'clay-btn': '4px 4px 8px rgba(99, 102, 241, 0.3), inset -3px -3px 6px rgba(255,255,255,0.3), inset 3px 3px 6px rgba(0,0,0,0.1)',
      },
      backdropBlur: {
        'premium': '12px',
      },
      animation: {
        'spring-in': 'spring-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        'spring-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
