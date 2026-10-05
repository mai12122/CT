/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        md: {
          primary: '#D0BCFF',
          onPrimary: '#381E72',
          primaryContainer: '#4F378B',
          onPrimaryContainer: '#EADDFF',
          
          secondary: '#CCC2DC',
          onSecondary: '#332D41',
          secondaryContainer: '#4A4458',
          onSecondaryContainer: '#E8DEF8',
          
          tertiary: '#EFB8C8',
          onTertiary: '#492532',
          tertiaryContainer: '#633B48',
          onTertiaryContainer: '#FFD8E4',
          
          surface: '#141218',
          onSurface: '#E6E0E9',
          surfaceVariant: '#49454F',
          onSurfaceVariant: '#CAC4D0',
          
          surfaceContainerLowest: '#0F0D13',
          surfaceContainerLow: '#1D1B20',
          surfaceContainer: '#211F26',
          surfaceContainerHigh: '#2B2930',
          surfaceContainerHighest: '#36343B',
          
          outline: '#938F99',
          outlineVariant: '#49454F',
          
          error: '#F2B8B5',
          onError: '#601410',
          errorContainer: '#8C1D18',
          onErrorContainer: '#F9DEDC',
        },
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