import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.playwright/.auth/user.json')
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const isLocalBaseURL =
  baseURL.startsWith('http://localhost') || baseURL.startsWith('http://127.0.0.1')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project - runs authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Main tests - depend on auth setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
  ],
  webServer: isLocalBaseURL
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      }
    : undefined,
})
