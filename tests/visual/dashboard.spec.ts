import { test, expect } from '../fixtures/percy.fixture'
import { getAllFlakySelectors, getFlakySelectors, WAIT_TIMES } from '../utils/visual-helpers'

/**
 * Dashboard Visual Tests
 * These tests require authentication and test the main dashboard pages
 */

// Common selectors to hide in dashboard (dynamic content)
const DASHBOARD_FLAKY_SELECTORS = [
  ...getAllFlakySelectors(),
  '[data-testid="last-updated"]',
  '[data-testid="sync-status"]',
  '.realtime-indicator',
  '[data-count]', // Live counters
]

test.describe('Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle')
  })

  test('dashboard main page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.heavy,
    })

    // Verify dashboard loaded
    await expect(page.locator('h1, h2').first()).toBeVisible()

    await percySnapshots(page, 'Dashboard - Main Page', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })

  test('dashboard stats cards render correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    // Look for stats/metrics cards
    const statsSection = page.locator('[data-testid="stats"], .stats, .metrics, .card').first()

    if (await statsSection.count() > 0) {
      await percySnapshots(page, 'Dashboard - Stats Cards', {
        hideSelectors: DASHBOARD_FLAKY_SELECTORS,
        viewports: ['desktop', 'tablet'],
      })
    }
  })

  test('dashboard responsive layout', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Dashboard - Responsive', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })
})

test.describe('Inventory Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
  })

  test('inventory list page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.heavy,
    })

    // Verify inventory page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible()

    await percySnapshots(page, 'Inventory - List Page', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })

  test('inventory table/grid view renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    // Look for table or grid view
    const itemsView = page.locator('table, [role="table"], .grid, [data-testid="items-list"]').first()

    if (await itemsView.count() > 0) {
      await percySnapshots(page, 'Inventory - Items View', {
        hideSelectors: DASHBOARD_FLAKY_SELECTORS,
        viewports: ['desktop', 'tablet'],
      })
    }
  })

  test('inventory mobile layout', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Inventory - Mobile Layout', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      viewports: ['mobile'],
    })
  })
})

test.describe('Reports Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
  })

  test('reports main page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.heavy,
    })

    await expect(page.locator('h1, h2').first()).toBeVisible()

    await percySnapshots(page, 'Reports - Main Page', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })

  test('reports responsive layout', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Reports - Responsive', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })
})

test.describe('Settings Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('settings main page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    // Wait for settings page content to load - look for Profile Settings or Account section
    await expect(
      page.getByRole('heading', { name: /profile settings|account/i }).first()
    ).toBeVisible({ timeout: 10000 })

    await percySnapshots(page, 'Settings - Main Page', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })

  test('settings profile page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.goto('/settings/profile')
    await page.waitForLoadState('networkidle')

    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Settings - Profile Page', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })

  test('settings responsive layout', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Settings - Responsive', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })
})

test.describe('Tasks Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks')
    await page.waitForLoadState('networkidle')
  })

  test('tasks hub page renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    await expect(page.locator('h1, h2').first()).toBeVisible()

    await percySnapshots(page, 'Tasks - Hub Page', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })

  test('tasks responsive layout', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    await percySnapshots(page, 'Tasks - Responsive', {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
    })
  })
})

test.describe('Navigation Visual Tests', () => {
  test('sidebar navigation renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    // Look for sidebar/nav
    const sidebar = page.locator('nav, aside, [role="navigation"]').first()

    if (await sidebar.count() > 0) {
      await percySnapshots(page, 'Dashboard - Sidebar Navigation', {
        hideSelectors: DASHBOARD_FLAKY_SELECTORS,
        viewports: ['desktop'],
      })
    }
  })

  test('mobile navigation renders correctly', async ({
    page,
    percySnapshots,
    prepareForVisualTest,
  }) => {
    await page.goto('/dashboard')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForLoadState('networkidle')

    await prepareForVisualTest(page, {
      hideSelectors: DASHBOARD_FLAKY_SELECTORS,
      additionalWait: WAIT_TIMES.standard,
    })

    // Look for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu|toggle/i }).first()

    if (await menuButton.count() > 0 && await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(300)

      await percySnapshots(page, 'Dashboard - Mobile Navigation Open', {
        hideSelectors: DASHBOARD_FLAKY_SELECTORS,
        viewports: ['mobile'],
      })
    }
  })
})
