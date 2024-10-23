/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/views/**/*.{pug,html,js}'],
  theme: {
    extend: {
      boxShadow: {
        lg: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
      },
    },
  },
  plugins: [],
};
