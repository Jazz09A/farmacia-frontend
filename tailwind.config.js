/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-white',
  ],
  theme: {
    extend: {
      colors: {
        // Medical Primary Palette
        medical: {
          blue: {
            50: '#f2fbfe',
            100: '#e5f6fd',
            200: '#d8f2fd',
            300: '#cbeifc',
            400: '#bee9fb',
            500: '#24ace9',
            600: '#2098d0',
            700: '#1c83b7',
            800: '#186e9e',
            900: '#145a85',
          },
          green: {
            50: '#E8F5E8',
            100: '#C8E6C9',
            200: '#A5D6A7',
            300: '#81C784',
            400: '#66BB6A',
            500: '#4CAF50',
            600: '#43A047',
            700: '#388E3C',
            800: '#2E7D32',
            900: '#1B5E20',
          },
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          }
        },
        // Custom gradients for medical theme
        'gradient-blue': 'linear-gradient(135deg, #f2fbfe 0%, #e5f6fd 100%)',
        'gradient-green': 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
        'gradient-medical': 'linear-gradient(135deg, #f2fbfe 0%, #E8F5E8 100%)',
        
        // Theme color aliases
        'medical-primary': '#24ace9',
        'medical-primary-dark': '#248ccb',
        'medical-accent': '#4CAF50',
        'medical-accent-dark': '#388E3C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'morphing': 'morphing 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(36, 172, 233, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(36, 172, 233, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        morphing: {
          '0%': { borderRadius: '0.5rem' },
          '50%': { borderRadius: '1rem' },
          '100%': { borderRadius: '0.5rem' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'medical': '0 4px 20px 0 rgba(36, 172, 233, 0.15)',
        'medical-hover': '0 8px 30px 0 rgba(36, 172, 233, 0.25)',
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.08)',
        'elegant': '0 10px 40px 0 rgba(0, 0, 0, 0.1)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '4xl': '2000px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      transitionTimingFunction: {
        'medical': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Nueva utilidad de Glassmorphism mejorada
        '.glass-bg': {
          '@defaults backdrop-filter': {},
          '--tw-backdrop-blur': 'var(--tw-backdrop-blur)',
          '--tw-backdrop-brightness': 'var(--tw-backdrop-brightness)',
          '--tw-backdrop-contrast': 'var(--tw-backdrop-contrast)',
          '--tw-backdrop-grayscale': 'var(--tw-backdrop-grayscale)',
          '--tw-backdrop-hue-rotate': 'var(--tw-backdrop-hue-rotate)',
          '--tw-backdrop-invert': 'var(--tw-backdrop-invert)',
          '--tw-backdrop-opacity': 'var(--tw-backdrop-opacity)',
          '--tw-backdrop-saturate': 'var(--tw-backdrop-saturate)',
          '--tw-backdrop-sepia': 'var(--tw-backdrop-sepia)',
          backdropFilter: [
            'blur(var(--tw-backdrop-blur, 12px))',
            'brightness(var(--tw-backdrop-brightness, 1))',
            'contrast(var(--tw-backdrop-contrast, 1))',
            'grayscale(var(--tw-backdrop-grayscale, 0))',
            'hue-rotate(var(--tw-backdrop-hue-rotate, 0deg))',
            'invert(var(--tw-backdrop-invert, 0))',
            'opacity(var(--tw-backdrop-opacity, 1))',
            'saturate(var(--tw-backdrop-saturate, 1))',
            'sepia(var(--tw-backdrop-sepia, 0))',
          ].join(' '),
          // El color de fondo se aplica con las utilidades de Tailwind (e.g., bg-black/30)
        },
        // Glassmorphism específico para búsqueda médica
        '.glass-medical': {
          '@defaults backdrop-filter': {},
          backdropFilter: 'blur(10px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        // Glassmorphism para tarjetas
        '.glass-card': {
          '@defaults backdrop-filter': {},
          backdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        // Medical gradient backgrounds
        '.bg-medical-gradient': {
          background: 'linear-gradient(135deg, #f2fbfe 0%, #E8F5E8 100%)',
        },
        '.bg-medical-blue-gradient': {
          background: 'linear-gradient(135deg, #24ace9 0%, #248ccb 100%)',
        },
        '.bg-medical-green-gradient': {
          background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
        },
        // Premium hover effects
        '.hover-lift': {
          transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.15)',
          },
        },
        '.hover-glow': {
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 20px rgba(36, 172, 233, 0.5)',
          },
        },
        // Text gradients
        '.text-medical-gradient': {
          background: 'linear-gradient(135deg, #24ace9 0%, #4CAF50 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        // Ocultar scrollbar
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
