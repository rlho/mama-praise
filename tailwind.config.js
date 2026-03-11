/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ベージュ/アイボリーベース + テラコッタアクセント
        ivory: {
          50: '#FDFBF7',   // ほぼ白のアイボリー
          100: '#FAF6EE',  // うすいベージュ
          200: '#F3ECDE',  // ベージュ
          300: '#E8DECE',  // 濃いめベージュ
        },
        accent: {
          100: '#F5E6DA',  // うすいテラコッタ
          200: '#EACDB8',  // ライトテラコッタ
          300: '#D4A882',  // テラコッタ
          400: '#C4906A',  // 濃いめテラコッタ
          500: '#B07A55',  // ディープテラコッタ
        },
      },
      fontFamily: {
        sans: ['"Rounded Mplus 1c"', '-apple-system', 'BlinkMacSystemFont', '"Hiragino Sans"', '"Hiragino Kaku Gothic ProN"', '"Noto Sans JP"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(180, 160, 130, 0.1)',
        'soft': '0 1px 6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'gentle-bounce': 'gentleBounce 0.6s ease-out',
        'bloom': 'bloom 0.8s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentleBounce: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bloom: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        sparkle: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
