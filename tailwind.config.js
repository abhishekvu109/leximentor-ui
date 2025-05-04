/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}", "./public/**/*.html",],
    theme: {
        extend: {
            keyframes: {
                blink: {
                    '0%, 100%': {opacity: '1'}, '50%': {opacity: '0'},
                },
            }, animation: {
                blink: 'blink 1s step-start infinite',
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
