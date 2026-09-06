import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lg-magenta": "#E6007E",
        "lg-magenta-dark": "#C4006A",
        "lg-gray": "#333333",
      },
    },
  },
  plugins: [],
};
export default config;
