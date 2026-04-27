/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                carbon: {
                    bg: '#0a0f1e',
                    surface: '#111827',
                    card: '#1a2332',
                    border: '#1e293b',
                    hover: '#243044',
                },
                teal: {
                    DEFAULT: '#00d4aa',
                    light: '#00f5c8',
                    dark: '#00b894',
                    glow: 'rgba(0, 212, 170, 0.15)',
                },
                accent: {
                    blue: '#3b82f6',
                    amber: '#f59e0b',
                    red: '#ef4444',
                    purple: '#8b5cf6',
                }
            },
            fontFamily: {
                mono: ['"Space Mono"', 'monospace'],
                sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.1)' },
                    '50%': { boxShadow: '0 0 40px rgba(0, 212, 170, 0.3)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backgroundImage: {
                'grid-pattern': 'linear-gradient(rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 41, 59, 0.5) 1px, transparent 1px)',
            },
            backgroundSize: {
                'grid': '40px 40px',
            },
        },
    },
    plugins: [],
}
