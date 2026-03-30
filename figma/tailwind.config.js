/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF', // 品牌蓝
        secondary: '#F3F4F6', // 浅灰底色
        lightBlue: '#EFF6FF', // 浅蓝色背景
      },
    },
  },
  plugins: [],
}