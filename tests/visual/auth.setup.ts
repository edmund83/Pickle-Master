import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.playwright/.auth/user.json')

// E2E Test credentials - set these in your .env.local or environment
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'edmund.tong@myrpd.com'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'A3101621-a'

setup('authenticate for visual tests', async ({ page }) => {
  console.log(`Authenticating as ${TEST_EMAIL}...`)

  // Navigate to login page
  await page.goto('/login')

  // Wait for the form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })

  // Fill in credentials using ID selectors
  await page.locator('#userEmail').fill(TEST_EMAIL)
  await page.locator('#userPassword').fill(TEST_PASSWORD)

  // Click login button
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/\/(dashboard|inventory|reports)/, { timeout: 15000 })

  console.log('Authentication successful!')

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
