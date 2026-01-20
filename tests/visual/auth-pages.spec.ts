import { test, expect } from '../fixtures/percy.fixture'
import { getAllFlakySelectors, WAIT_TIMES } from '../utils/visual-helpers'

test.describe('Authentication Pages Visual Tests', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('login page renders correctly', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify key elements
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('input[type="email"], input#email, input[name="email"]').first()).toBeVisible()
      await expect(page.locator('input[type="password"]').first()).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in|log in/i }).first()).toBeVisible()

      await percySnapshots(page, 'Login Page - Default State')
    })

    test('login page shows OAuth options', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Check for OAuth buttons
      const googleButton = page.getByRole('button', { name: /google/i })
      const appleButton = page.getByRole('button', { name: /apple/i })

      if (await googleButton.isVisible() || await appleButton.isVisible()) {
        await percySnapshots(page, 'Login Page - OAuth Options', {
          viewports: ['desktop', 'mobile'],
        })
      }
    })

    test('login page form validation styles', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Submit empty form to trigger validation
      const submitButton = page.getByRole('button', { name: /sign in|log in/i })
      await submitButton.click()

      // Wait for validation states to appear
      await page.waitForTimeout(300)

      await percySnapshots(page, 'Login Page - Validation State', {
        viewports: ['desktop', 'mobile'],
      })
    })

    test('login page responsive layout', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Login Page - Responsive', {
        viewports: ['desktop', 'tablet', 'mobile'],
      })
    })

    test('login page forgot password link visible', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      const forgotLink = page.getByRole('link', { name: /forgot|reset/i })
      await expect(forgotLink).toBeVisible()

      await percySnapshots(page, 'Login Page - With Links', {
        viewports: ['desktop'],
      })
    })
  })

  test.describe('Signup Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/signup')
    })

    test('signup page renders correctly', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify key elements
      await expect(page.locator('form')).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i).first()).toBeVisible()

      await percySnapshots(page, 'Signup Page - Default State')
    })

    test('signup page shows password requirements', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Focus on password field to potentially show requirements
      const passwordField = page.getByLabel(/password/i).first()
      await passwordField.focus()
      await page.waitForTimeout(300)

      await percySnapshots(page, 'Signup Page - Password Focus', {
        viewports: ['desktop', 'mobile'],
      })
    })

    test('signup page responsive layout', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Signup Page - Responsive', {
        viewports: ['desktop', 'tablet', 'mobile'],
      })
    })

    test('signup page terms and privacy links visible', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Check for terms/privacy links
      const termsLink = page.getByRole('link', { name: /terms/i })
      const privacyLink = page.getByRole('link', { name: /privacy/i })

      if (await termsLink.isVisible() || await privacyLink.isVisible()) {
        await percySnapshots(page, 'Signup Page - Legal Links', {
          viewports: ['desktop'],
        })
      }
    })
  })

  test.describe('Forgot Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/forgot-password')
    })

    test('forgot password page renders correctly', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify key elements
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('input[type="email"], input#email, input[name="email"]').first()).toBeVisible()

      await percySnapshots(page, 'Forgot Password Page - Default State')
    })

    test('forgot password page responsive layout', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Forgot Password Page - Responsive', {
        viewports: ['desktop', 'tablet', 'mobile'],
      })
    })

    test('forgot password page back to login link', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      const backLink = page.getByRole('link', { name: /back|login|sign in/i })
      await expect(backLink).toBeVisible()

      await percySnapshots(page, 'Forgot Password Page - Navigation Links', {
        viewports: ['desktop'],
      })
    })
  })
})
