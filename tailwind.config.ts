
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        quiz: {
          primary: '#9b87f5',
          secondary: '#7E69AB',
          accent: '#F97316',
          light: '#E5DEFF',
          dark: '#1A1F2C'
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.12)',
          dark: 'rgba(20,23,30,0.7)'
        },
        glow: {
          purple: '#b09cff',
          blue: '#7efaf8'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        glass: "0 4px 32px 0 rgba(100,100,255,0.15), 0 2px 4px rgba(0,0,0,0.04)",
        'glow-purple': "0 0 16px 2px #b09cff77, 0 2px 4px rgba(0,0,0,0.05)"
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.07)' },
        },
        'glow-border': {
          '0%': { boxShadow: '0 0 4px #b09cff66, 0 0 12px #7efaf866' },
          '50%': { boxShadow: '0 0 20px 6px #b09cff99, 0 0 48px 8px #7efaf833' },
          '100%': { boxShadow: '0 0 4px #b09cff66, 0 0 12px #7efaf866' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'glow-border': 'glow-border 2.8s linear infinite',
        'float': 'float 3s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

