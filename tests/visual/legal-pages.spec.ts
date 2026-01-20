import { test, expect } from '../fixtures/percy.fixture'
import { getAllFlakySelectors, WAIT_TIMES } from '../utils/visual-helpers'

test.describe('Legal Pages Visual Tests', () => {
  test.describe('Privacy Policy Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/privacy')
    })

    test('privacy page renders correctly', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify key elements
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('h1')).toContainText(/privacy/i)

      await percySnapshots(page, 'Privacy Policy - Full Page', {
        hideSelectors: getAllFlakySelectors(),
      })
    })

    test('privacy page typography is readable', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Check that content sections exist (use div or section as fallback)
      const mainContent = page.locator('main, article, .prose, section, div.container').first()
      await expect(mainContent).toBeVisible()

      await percySnapshots(page, 'Privacy Policy - Typography', {
        viewports: ['desktop', 'mobile'],
      })
    })

    test('privacy page table of contents (if exists)', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Look for TOC
      const toc = page.locator('nav[aria-label*="table"], .toc, [data-toc]')

      if (await toc.count() > 0 && await toc.isVisible()) {
        await percySnapshots(page, 'Privacy Policy - Table of Contents', {
          viewports: ['desktop'],
        })
      }
    })
  })

  test.describe('Terms of Service Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/terms')
    })

    test('terms page renders correctly', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify key elements
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('h1')).toContainText(/terms/i)

      await percySnapshots(page, 'Terms of Service - Full Page', {
        hideSelectors: getAllFlakySelectors(),
      })
    })

    test('terms page responsive layout', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Terms of Service - Responsive', {
        viewports: ['desktop', 'tablet', 'mobile'],
      })
    })

    test('terms page sections are navigable', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Check for section headings (h2, h3)
      const headings = page.locator('h2, h3')
      const headingCount = await headings.count()

      expect(headingCount).toBeGreaterThan(0)

      await percySnapshots(page, 'Terms of Service - Sections', {
        viewports: ['desktop'],
      })
    })
  })

  test.describe('Security Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/security')
    })

    test('security page renders correctly', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify key elements
      await expect(page.locator('h1')).toBeVisible()

      await percySnapshots(page, 'Security Page - Full Page', {
        hideSelectors: getAllFlakySelectors(),
      })
    })

    test('security page responsive layout', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page, {
        additionalWait: WAIT_TIMES.standard,
      })

      await percySnapshots(page, 'Security Page - Responsive', {
        viewports: ['desktop', 'tablet', 'mobile'],
      })
    })

    test('security page trust badges/certifications (if any)', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await prepareForVisualTest(page)

      // Look for security badges or certification logos
      const badges = page.locator('[data-badge], .badge, .certification, img[alt*="secure"], img[alt*="certified"]')

      if (await badges.count() > 0) {
        await percySnapshots(page, 'Security Page - Trust Badges', {
          viewports: ['desktop'],
        })
      }
    })
  })

  test.describe('Legal Pages Cross-Page Consistency', () => {
    test('all legal pages have consistent header/footer', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      const legalPages = ['/privacy', '/terms', '/security']

      for (const pagePath of legalPages) {
        await page.goto(pagePath)
        await prepareForVisualTest(page, {
          additionalWait: WAIT_TIMES.fast,
        })

        // Verify consistent structure
        await expect(page.locator('nav')).toBeVisible()
        await expect(page.locator('footer')).toBeVisible()
        await expect(page.locator('h1')).toBeVisible()
      }

      // Take snapshot of last page to verify structure
      await percySnapshots(page, 'Legal Pages - Consistent Structure', {
        viewports: ['desktop'],
      })
    })

    test('legal pages are accessible on mobile', async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const legalPages = [
        { path: '/privacy', name: 'Privacy' },
        { path: '/terms', name: 'Terms' },
        { path: '/security', name: 'Security' },
      ]

      for (const { path, name } of legalPages) {
        await page.goto(path)
        await prepareForVisualTest(page, {
          additionalWait: WAIT_TIMES.fast,
        })

        // Verify content is not overflowing
        const body = page.locator('body')
        const bodyWidth = await body.evaluate((el) => el.scrollWidth)
        expect(bodyWidth).toBeLessThanOrEqual(375 + 10)

        await percySnapshots(page, `Legal - ${name} Mobile`, {
          viewports: ['mobile'],
        })
      }
    })
  })
})
