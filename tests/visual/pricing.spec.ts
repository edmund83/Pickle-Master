import { test, expect } from '../fixtures/percy.fixture'
import { getAllFlakySelectors, WAIT_TIMES } from '../utils/visual-helpers'

test.describe('Pricing Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing')
  })

  test('pricing page full layout renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    // Verify page loaded
    await expect(page).toHaveTitle(/pricing/i)
    await expect(page.locator('h1')).toBeVisible()

    await percySnapshots(page, 'Pricing Page - Full Layout', {
      hideSelectors: getAllFlakySelectors(),
    })
  })

  test('pricing cards display correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      additionalWait: WAIT_TIMES.standard,
    })

    // Find pricing cards/plans section
    const pricingSection = page.locator('section').filter({
      hasText: /starter|growth|scale|month/i,
    }).first()

    await expect(pricingSection).toBeVisible()

    // Verify multiple pricing tiers are visible
    await expect(page.getByText(/starter/i).first()).toBeVisible()
    // Use first() to avoid strict mode with multiple price elements
    await expect(page.getByText(/\$\d+/).first()).toBeVisible()

    await percySnapshots(page, 'Pricing Page - Pricing Cards')
  })

  test('pricing toggle (monthly/annual) works correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page)

    // Look for billing toggle (monthly/annual)
    const toggle = page.getByRole('button', { name: /annual|yearly/i }).or(
      page.locator('[data-testid="billing-toggle"]')
    ).or(
      page.locator('label').filter({ hasText: /annual/i })
    )

    if (await toggle.isVisible()) {
      // Capture monthly state
      await percySnapshots(page, 'Pricing Page - Monthly Billing', {
        viewports: ['desktop'],
      })

      // Click toggle to switch to annual
      await toggle.click()
      await page.waitForTimeout(300)

      // Capture annual state
      await percySnapshots(page, 'Pricing Page - Annual Billing', {
        viewports: ['desktop'],
      })
    }
  })

  test('pricing FAQ section renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Scroll to FAQ section
    const faqSection = page.locator('section').filter({
      hasText: /frequently asked|faq/i,
    }).first()

    if (await faqSection.count() > 0) {
      await faqSection.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Pricing Page - FAQ Section')
    }
  })

  test('pricing FAQ accordion expands correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Scroll to FAQ section
    const faqSection = page.locator('section').filter({
      hasText: /frequently asked|faq/i,
    }).first()

    if (await faqSection.count() > 0) {
      await faqSection.scrollIntoViewIfNeeded()
      await prepareForVisualTest(page)

      // Find and click first FAQ item
      const faqItem = page.locator('[data-accordion], .collapse, details, [role="button"]')
        .filter({ hasText: /what|how|can/i })
        .first()

      if (await faqItem.isVisible()) {
        await faqItem.click()
        await page.waitForTimeout(300)

        await percySnapshots(page, 'Pricing Page - FAQ Expanded', {
          viewports: ['desktop', 'mobile'],
        })
      }
    }
  })

  test('CTA buttons are visible and styled correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page)

    // Verify CTA buttons exist
    const ctaButtons = page.getByRole('link', { name: /get started|start free|try free|sign up/i })
    await expect(ctaButtons.first()).toBeVisible()

    await percySnapshots(page, 'Pricing Page - CTA Buttons', {
      viewports: ['desktop', 'mobile'],
    })
  })

  test('pricing comparison table (if exists) renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Look for comparison table
    const table = page.locator('table').or(
      page.locator('[role="table"]')
    ).or(
      page.locator('[data-testid="comparison-table"]')
    )

    if (await table.count() > 0 && await table.isVisible()) {
      await table.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Pricing Page - Comparison Table')
    }
  })

  test('mobile pricing layout is optimized', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    // Verify content is not overflowing
    const body = page.locator('body')
    const bodyWidth = await body.evaluate((el) => el.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 10) // Small tolerance

    await percySnapshots(page, 'Pricing Page - Mobile Optimized', {
      viewports: ['mobile'],
    })
  })
})
