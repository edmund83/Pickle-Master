import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flyonui/dist/js/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // FlyonUI config - using module augmentation for type safety
} as Config & {
  flyonui?: {
    themes: (string | Record<string, Record<string, string>>)[]
  }
}

// Add flyonui config
;(config as Config & { flyonui?: unknown }).flyonui = {
  themes: [
    'corporate',
    'dark',
    {
      'pickle-red': {
        primary: '#de4a4a',
        'primary-content': '#ffffff',
        secondary: '#c73e3e',
        'secondary-content': '#ffffff',
        accent: '#f87171',
        'accent-content': '#1f2937',
        neutral: '#374151',
        'neutral-content': '#f3f4f6',
        'base-100': '#ffffff',
        'base-200': '#f9fafb',
        'base-300': '#f3f4f6',
        'base-content': '#1f2937',
        info: '#3b82f6',
        'info-content': '#ffffff',
        success: '#22c55e',
        'success-content': '#ffffff',
        warning: '#f59e0b',
        'warning-content': '#1f2937',
        error: '#ef4444',
        'error-content': '#ffffff',
      },
    },
  ],
}

export default config
