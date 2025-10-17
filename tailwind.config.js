/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        secondary: "#ffe1a7",
        primary: {
          DEFAULT: "#ffa800",
          50:  "#fffaef",
          500: "#ffe1a7",
        },
      },
      fontFamily: {
        satoshi: ["Satoshi-Regular"],
        satoshiLight: ["Satoshi-Light"],
        satoshiMedium: ["Satoshi-Medium"],
        satoshiMediumItalic: ["Satoshi-MediumItalic"],
        satoshiBold: ["Satoshi-Bold"],
        sans: ["Satoshi-Regular", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
