/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  darkMode: ['selector'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    extend: {
      keyframes: {},
      animation: {
        spinnerColor: 'color 6s ease-in-out infinite',
        spinnerDash: 'dash 1.5s ease-in-out infinite',
        spinFaster: 'spin 1.5s linear infinite',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'dark-blue': '#003063',
        'light-blue': '#0074c8',
        'profile-gray': '#E2E0E0',
        'events-yellow': 'rgb(234,179,8)',
        'event-acc-gray': 'rgb(209,213,219)',
        'main-sidebar': '#f8f9fa',
      },
      gridTemplateColumns: {
        sidebar: '300px auto', //for sidebar layout
        eventList: '200px 3fr 1fr',
      },
      gridTemplateRows: {
        header: '64px auto', //for the navbar layout
        main: 'auto 64px', // layout row configuration
      },
      spacing: {
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
        '1/6': '16.666667%',
        '2/6': '33.333333%',
        '3/6': '50%',
        '4/6': '66.666667%',
        '5/6': '83.333333%',
        '1/12': '8.333333%',
        '2/12': '16.666667%',
        '3/12': '25%',
        '4/12': '33.333333%',
        '5/12': '41.666667%',
        '6/12': '50%',
        '7/12': '58.333333%',
        '8/12': '66.666667%',
        '9/12': '75%',
        '10/12': '83.333333%',
        '11/12': '91.666667%',
      },
    },
  },
};
