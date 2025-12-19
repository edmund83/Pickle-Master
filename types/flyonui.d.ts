import 'tailwindcss'

declare module 'tailwindcss' {
  interface Config {
    flyonui?: {
      themes?: (string | Record<string, Record<string, string>>)[]
    }
  }
}
