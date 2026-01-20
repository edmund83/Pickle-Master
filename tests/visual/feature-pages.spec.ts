import { test, expect } from '../fixtures/percy.fixture'
import { getAllFlakySelectors, WAIT_TIMES, PUBLIC_PAGES } from '../utils/visual-helpers'

test.describe('Feature Pages Visual Tests', () => {
  const featurePages = [
    { path: PUBLIC_PAGES.features.barcodeScanning, name: 'Barcode Scanning' },
    { path: PUBLIC_PAGES.features.offlineMobile, name: 'Offline Mobile' },
    { path: PUBLIC_PAGES.features.lowStockAlerts, name: 'Low Stock Alerts' },
    { path: PUBLIC_PAGES.features.bulkEditing, name: 'Bulk Editing' },
    { path: PUBLIC_PAGES.features.checkInCheckOut, name: 'Check In Check Out' },
  ]

  for (const { path, name } of featurePages) {
    test(`${name} feature page renders correctly`, async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await page.goto(path)

      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify page loaded
      await expect(page.locator('h1')).toBeVisible()

      await percySnapshots(page, `Feature - ${name}`, {
        hideSelectors: getAllFlakySelectors(),
      })
    })
  }

  test('feature pages have consistent structure', async ({
    page,
    prepareForVisualTest,
  }) => {
    for (const { path } of featurePages) {
      await page.goto(path)
      await prepareForVisualTest(page)

      // All feature pages should have:
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()

      // Should have at least one CTA
      const cta = page.getByRole('link', { name: /get started|try free|start/i })
      await expect(cta.first()).toBeVisible()
    }
  })
})

test.describe('Solution Pages Visual Tests', () => {
  const solutionPages = [
    { path: PUBLIC_PAGES.solutions.warehouse, name: 'Warehouse Inventory' },
    { path: PUBLIC_PAGES.solutions.ecommerce, name: 'Ecommerce Inventory' },
    { path: PUBLIC_PAGES.solutions.smallBusiness, name: 'Small Business' },
    { path: PUBLIC_PAGES.solutions.assetTracking, name: 'Asset Tracking' },
    { path: PUBLIC_PAGES.solutions.mobileApp, name: 'Mobile App' },
  ]

  for (const { path, name } of solutionPages) {
    test(`${name} solution page renders correctly`, async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await page.goto(path)

      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify page loaded
      await expect(page.locator('h1')).toBeVisible()

      await percySnapshots(page, `Solution - ${name}`, {
        hideSelectors: getAllFlakySelectors(),
      })
    })
  }

  test('solution pages mobile responsiveness', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Test first solution page on mobile
    await page.goto(PUBLIC_PAGES.solutions.warehouse)

    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Solution Page - Mobile Layout', {
      viewports: ['mobile'],
    })
  })
})

test.describe('Compare Pages Visual Tests', () => {
  const comparePages = [
    { path: PUBLIC_PAGES.compare.sortly, name: 'Sortly Alternative' },
    { path: PUBLIC_PAGES.compare.boxhero, name: 'BoxHero Alternative' },
  ]

  for (const { path, name } of comparePages) {
    test(`${name} comparison page renders correctly`, async ({
      page,
      percySnapshots,
      prepareForVisualTest,
    }) => {
      await page.goto(path)

      await prepareForVisualTest(page, {
        hideSelectors: getAllFlakySelectors(),
        additionalWait: WAIT_TIMES.standard,
      })

      // Verify page loaded
      await expect(page.locator('h1')).toBeVisible()

      await percySnapshots(page, `Compare - ${name}`, {
        hideSelectors: getAllFlakySelectors(),
        viewports: ['desktop', 'mobile'],
      })
    })
  }

  test('comparison table (if exists) renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.goto(PUBLIC_PAGES.compare.sortly)

    await prepareForVisualTest(page)

    // Look for comparison table
    const table = page.locator('table, [role="table"], .comparison-table')

    if (await table.count() > 0 && await table.isVisible()) {
      await table.scrollIntoViewIfNeeded()

      await percySnapshots(page, 'Compare - Comparison Table', {
        viewports: ['desktop'],
      })
    }
  })
})

test.describe('Integrations Page Visual Tests', () => {
  test('integrations page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.goto('/integrations')

    await prepareForVisualTest(page, {
      hideSelectors: getAllFlakySelectors(),
      additionalWait: WAIT_TIMES.standard,
    })

    // Verify page loaded
    await expect(page.locator('h1')).toBeVisible()

    await percySnapshots(page, 'Integrations Page', {
      hideSelectors: getAllFlakySelectors(),
    })
  })

  test('integration cards display correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.goto('/integrations')

    await prepareForVisualTest(page, {
      additionalWait: WAIT_TIMES.standard,
    })

    // Look for integration cards/logos
    const cards = page.locator('[data-integration], .integration-card, .card')

    if (await cards.count() > 0) {
      await percySnapshots(page, 'Integrations - Cards', {
        viewports: ['desktop', 'tablet'],
      })
    }
  })
})
