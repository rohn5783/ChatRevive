/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          teal: {
            DEFAULT: '#075E54',
            dark: '#054740',
            light: '#128C7E',
          },
          green: {
            DEFAULT: '#25D366',
            hover: '#20BA5A',
            dark: '#00A884',
            light: '#E7FFDB',
          },
          bg: '#EFEAE2',
          panel: '#F0F2F5',
          panelDark: '#111B21',
          border: '#E9EDEF',
          borderDark: '#222E35',
          bubble: {
            in: '#FFFFFF',
            out: '#D9FDD3',
            inDark: '#202C33',
            outDark: '#005C4B',
          },
          text: {
            primary: '#111B21',
            secondary: '#667781',
            muted: '#8696A0',
          },
          blue: {
            ticks: '#53BDEB',
          },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'wa-bubble': '0 1px 0.5px rgba(11, 20, 26, 0.13)',
        'wa-dropdown': '0 4px 12px rgba(11, 20, 26, 0.15)',
        'wa-card': '0 2px 8px rgba(11, 20, 26, 0.08)',
      },
    },
  },
  plugins: [],
};

