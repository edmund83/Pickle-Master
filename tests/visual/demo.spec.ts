import { test, expect } from '../fixtures/percy.fixture'
import { getAllFlakySelectors, getFlakySelectors, WAIT_TIMES } from '../utils/visual-helpers'

test.describe('Demo Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
  })

  test('demo page full layout renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    // Verify page loaded
    await expect(page).toHaveTitle(/demo/i)
    await expect(page.locator('h1')).toBeVisible()

    await percySnapshots(page, 'Demo Page - Full Layout', {
      hideSelectors: getAllFlakySelectors(),
    })
  })

  test('demo hero section renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      additionalWait: WAIT_TIMES.standard,
    })

    // Verify hero content
    await expect(page.locator('h1')).toBeVisible()

    await percySnapshots(page, 'Demo Page - Hero Section')
  })

  test('workflow showcase sections render correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: [...getFlakySelectors('carousels', 'loaders')],
      additionalWait: WAIT_TIMES.standard,
    })

    // Look for workflow sections (Scan & Adjust, Stock Count, Check-Out)
    const workflowSection = page.locator('section').filter({
      hasText: /scan|workflow|stock count|check-out/i,
    }).first()

    if (await workflowSection.isVisible()) {
      await workflowSection.scrollIntoViewIfNeeded()

      await percySnapshots(page, 'Demo Page - Workflow Showcase', {
        hideSelectors: getFlakySelectors('carousels', 'loaders'),
      })
    }
  })

  test('video placeholders/embeds display correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Look for video elements or placeholders
    const videoElements = page.locator('video, iframe, [data-video], .video-placeholder')

    if (await videoElements.count() > 0) {
      const firstVideo = videoElements.first()
      await firstVideo.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.heavy,
      })

      await percySnapshots(page, 'Demo Page - Video Section', {
        viewports: ['desktop', 'mobile'],
      })
    }
  })

  test('feature cards display correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Find feature cards section
    const featureSection = page.locator('section').filter({
      hasText: /feature|capability|benefit/i,
    }).first()

    if (await featureSection.isVisible()) {
      await featureSection.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Demo Page - Feature Cards')
    }
  })

  test('demo page FAQ section renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    // Scroll to FAQ section
    const faqSection = page.locator('section').filter({
      hasText: /frequently asked|faq|question/i,
    }).first()

    if (await faqSection.count() > 0) {
      await faqSection.scrollIntoViewIfNeeded()

      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Demo Page - FAQ Section')
    }
  })

  test('CTA sections display correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page)

    // Find CTA sections
    const ctaSection = page.locator('section').filter({
      hasText: /get started|try free|start free|sign up/i,
    }).first()

    if (await ctaSection.isVisible()) {
      await ctaSection.scrollIntoViewIfNeeded()

      await percySnapshots(page, 'Demo Page - CTA Section')
    }
  })

  test('demo page mobile layout is responsive', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    // Verify content fits on mobile
    await expect(page.locator('h1')).toBeVisible()

    await percySnapshots(page, 'Demo Page - Mobile Layout', {
      viewports: ['mobile'],
    })
  })

  test('demo page tablet layout is responsive', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Demo Page - Tablet Layout', {
      viewports: ['tablet'],
    })
  })
})
