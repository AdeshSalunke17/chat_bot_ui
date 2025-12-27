// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        typingDotBounce: {
          "0%, 80%, 100%": {
            transform: "translateY(0)",
            opacity: "0.3",
          },
          "40%": {
            transform: "translateY(-6px)",
            opacity: "1",
          },
        },
      },
      animation: {
        "typing-dot-bounce": "typingDotBounce 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [],
};
