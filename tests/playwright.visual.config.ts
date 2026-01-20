import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const isLocalBaseURL =
  baseURL.startsWith('http://localhost') || baseURL.startsWith('http://127.0.0.1')

const authFile = path.join(__dirname, '.playwright/.auth/user.json')

/**
 * Playwright configuration for visual regression tests with Percy
 *
 * Run public pages only:
 *   npx percy exec -- npx playwright test --config=tests/playwright.visual.config.ts --grep-invert "Dashboard|Inventory|Reports|Settings|Tasks|Navigation"
 *
 * Run authenticated (dashboard) pages:
 *   E2E_TEST_EMAIL=email E2E_TEST_PASSWORD=pass npx percy exec -- npx playwright test --config=tests/playwright.visual.config.ts --grep "Dashboard|Inventory|Reports|Settings|Tasks|Navigation"
 *
 * Run all:
 *   E2E_TEST_EMAIL=email E2E_TEST_PASSWORD=pass npx percy exec -- npx playwright test --config=tests/playwright.visual.config.ts
 */
export default defineConfig({
  testDir: './visual',
  fullyParallel: false, // Percy works better with sequential tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker for consistent Percy snapshots
  reporter: [['html', { outputFolder: '../playwright-report-visual' }], ['list']],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Disable animations for consistent snapshots
    launchOptions: {
      args: ['--disable-animations'],
    },
  },

  /* Configure projects */
  projects: [
    // Auth setup project - runs first for authenticated tests
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Public pages - no authentication needed
    {
      name: 'public-desktop',
      testMatch: /^(?!.*dashboard\.spec).*\.spec\.ts$/,
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'public-tablet',
      testMatch: /^(?!.*dashboard\.spec).*\.spec\.ts$/,
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['iPad'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'public-mobile',
      testMatch: /^(?!.*dashboard\.spec).*\.spec\.ts$/,
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 667 },
      },
    },

    // Authenticated pages - requires login
    {
      name: 'auth-desktop',
      testMatch: /dashboard\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        storageState: authFile,
      },
    },
    {
      name: 'auth-tablet',
      testMatch: /dashboard\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['iPad'],
        viewport: { width: 768, height: 1024 },
        storageState: authFile,
      },
    },
    {
      name: 'auth-mobile',
      testMatch: /dashboard\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 667 },
        storageState: authFile,
      },
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: isLocalBaseURL
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      }
    : undefined,

  /* Increase timeout for visual tests */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
})
