import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flyonui/dist/js/*.js',
  ],
  theme: {
    extend: {
      animation: {
        'arrow-nudge': 'arrow-nudge 1.5s ease-in-out infinite',
      },
      keyframes: {
        'arrow-nudge': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
  // FlyonUI config - using module augmentation for type safety
} as Config & {
  flyonui?: {
    themes: (string | Record<string, Record<string, string>>)[]
  }
}

// Add flyonui config - using corporate theme as default
;(config as Config & { flyonui?: unknown }).flyonui = {
  themes: ['corporate', 'dark'],
}

export default config
