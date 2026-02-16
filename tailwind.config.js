/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#000000",
        card: "rgba(22, 22, 23, 0.6)", // #161617 with opacity
        "card-hover": "rgba(30, 30, 32, 0.8)",
        "white-10": "rgba(255, 255, 255, 0.1)",
        "white-5": "rgba(255, 255, 255, 0.05)",
        // Apple-like accent colors
        accent: {
          blue: "#007AFF",
          green: "#34C759",
          red: "#FF3B30",
          orange: "#FF9500",
          purple: "#AF52DE",
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #000000, #161617)',
      }
    },
  },
  plugins: [],
}

