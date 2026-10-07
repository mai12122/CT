/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Deep navy surface scale — single cool family, tinted to match the CT logo (#000033)
        night: '#0B1020',      // page background
        abyss: '#070B16',      // wells, seat-map basin, deepest surfaces
        card: '#121829',       // card surface
        card2: '#1A2237',      // raised surface / inputs / pressed
        line: '#202A45',       // hairline border
        line2: '#31406B',      // emphasized border
        // Iris — the one accent (calmer than violet-600)
        iris: {
          300: '#B6ACF9',
          400: '#9282F4',
          500: '#6C5CE7',
          600: '#5A4BD1',
          700: '#483BAA',
        },
        // Blue-gray text ramp (same cool family as surfaces)
        mist: '#93A0BE',   // secondary text
        dim:  '#5D6A8C',   // tertiary text
      },
      borderRadius: {
        'md-xs': '4px',
        'md-sm': '8px',
        'md-md': '12px',
        'md-lg': '16px',
        'md-xl': '28px',
        'md-full': '9999px',
      },
    },
  },
  plugins: [],
}
