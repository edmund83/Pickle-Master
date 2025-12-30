import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.playwright/.auth/user.json')

// E2E Test credentials - set these in your .env.local or environment
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || ''
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || ''

setup('authenticate', async ({ page }) => {
  // Skip auth setup if no test credentials are provided
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.log('\n========================================')
    console.log('E2E_TEST_EMAIL and E2E_TEST_PASSWORD not set.')
    console.log('To run E2E tests with authentication:')
    console.log('  E2E_TEST_EMAIL=your@email.com E2E_TEST_PASSWORD=yourpass pnpm test:e2e')
    console.log('========================================\n')

    // Create empty auth state file so tests can still try to run
    await page.context().storageState({ path: authFile })
    return
  }

  console.log(`Authenticating as ${TEST_EMAIL}...`)

  // Navigate to login page
  await page.goto('/login')

  // Wait for the form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })

  // Fill in credentials using placeholder selectors
  await page.getByPlaceholder('Email address').fill(TEST_EMAIL)
  await page.getByPlaceholder('Password').fill(TEST_PASSWORD)

  // Click login button
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/\/(dashboard|inventory|reports)/, { timeout: 15000 })

  console.log('Authentication successful!')

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
