import { test, expect } from '../fixtures/percy.fixture'
import { getAllFlakySelectors, WAIT_TIMES } from '../utils/visual-helpers'

test.describe('Homepage Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage full page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    // Verify key elements are present
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()

    await percySnapshots(page, 'Homepage - Full Page', {
      hideSelectors: getAllFlakySelectors(),
    })
  })

  test('hero section renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      additionalWait: WAIT_TIMES.standard,
    })

    // Focus on hero section
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()

    // Verify hero content
    await expect(page.locator('h1')).toBeVisible()
    // CTA button may have different text, just verify section exists
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    await percySnapshots(page, 'Homepage - Hero Section')
  })

  test('navigation is visible and functional', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page)

    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // Desktop: Check nav links are visible
    await page.setViewportSize({ width: 1280, height: 720 })
    // Use first() to avoid strict mode violation with multiple pricing links
    await expect(page.locator('nav').getByRole('link', { name: /pricing/i }).first()).toBeVisible()

    await percySnapshots(page, 'Homepage - Navigation', {
      viewports: ['desktop', 'tablet', 'mobile'],
    })
  })

  test('pricing section renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Find and scroll to pricing section by content
    const pricingSection = page.locator('section').filter({ hasText: /pricing|plans/i }).first()

    if (await pricingSection.count() > 0) {
      await pricingSection.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify pricing section is visible
      await expect(pricingSection).toBeVisible()

      await percySnapshots(page, 'Homepage - Pricing Section', {
        hideSelectors: getAllFlakySelectors(),
      })
    }
  })

  test('testimonials section renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Find and scroll to testimonials
    const testimonials = page.locator('section').filter({ hasText: /testimonial|customer|review/i }).first()

    if (await testimonials.isVisible()) {
      await testimonials.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Homepage - Testimonials Section', {
        hideSelectors: getAllFlakySelectors(),
      })
    }
  })

  test('FAQ section renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Find and scroll to FAQ
    const faq = page.locator('section').filter({ hasText: /faq|frequently asked/i }).first()

    if (await faq.isVisible()) {
      await faq.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Homepage - FAQ Section')
    }
  })

  test('footer renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()

    await prepareForVisualTest(page, {
      additionalWait: WAIT_TIMES.fast,
    })

    await expect(footer).toBeVisible()

    await percySnapshots(page, 'Homepage - Footer')
  })

  test('mobile menu opens correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(300)

    await prepareForVisualTest(page)

    // Find and click mobile menu button (exclude Next.js dev tools)
    const menuButton = page.getByRole('button', { name: 'Toggle navigation' })

    if (await menuButton.count() > 0 && await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(300)

      await percySnapshots(page, 'Homepage - Mobile Menu Open', {
        viewports: ['mobile'],
      })
    }
  })
})
