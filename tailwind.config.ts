import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F0",
        espresso: "#3D2B1F",
        "dark-roast": "#5C4033",
        terracotta: "#C4703F",
        latte: "#8B7355",
        sand: "#F0E6D6",
        milk: "#FFFFFF",
        "line-green": "#06C755",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
