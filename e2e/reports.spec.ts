import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Reports
 *
 * These tests verify that the reports pages load correctly and display
 * the expected UI elements. They require a running development server
 * with authenticated user session and test data.
 *
 * Run with: npm run test:e2e
 */

test.describe('Reports Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reports page (requires authentication)
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
  })

  test('displays reports hub page with title', async ({ page }) => {
    // Wait for page content to load
    await expect(page.getByRole('heading', { name: 'Reports' }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Analyze your inventory data')).toBeVisible()
  })

  test('displays all 8 report cards', async ({ page }) => {
    const reportTitles = [
      'Low Stock Alert',
      'Inventory Summary',
      'Inventory Value',
      'Profit Margin',
      'Activity Log',
      'Inventory Trends',
      'Stock Movement',
      'Expiring Items',
    ]

    for (const title of reportTitles) {
      await expect(page.getByText(title)).toBeVisible()
    }
  })

  test('report cards have correct links', async ({ page }) => {
    const reportLinks = [
      { name: 'Low Stock Alert', href: '/reports/low-stock' },
      { name: 'Inventory Summary', href: '/reports/inventory-summary' },
      { name: 'Inventory Value', href: '/reports/inventory-value' },
      { name: 'Profit Margin', href: '/reports/profit-margin' },
      { name: 'Activity Log', href: '/reports/activity' },
      { name: 'Inventory Trends', href: '/reports/trends' },
      { name: 'Stock Movement', href: '/reports/stock-movement' },
      { name: 'Expiring Items', href: '/reports/expiring' },
    ]

    for (const report of reportLinks) {
      const link = page.locator(`a[href="${report.href}"]`)
      await expect(link).toBeVisible()
    }
  })
})

test.describe('Low Stock Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/low-stock')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Low Stock Report' })).toBeVisible()
  })

  test('displays back button', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /back/i })
    await expect(backButton).toBeVisible()
  })

  test('displays summary cards for out of stock and low stock', async ({ page }) => {
    // Use paragraph role to specifically target the summary card text
    await expect(page.getByRole('paragraph').filter({ hasText: 'Out of Stock' }).first()).toBeVisible()
    await expect(page.getByRole('paragraph').filter({ hasText: 'Low Stock' }).first()).toBeVisible()
  })

  test('back button navigates to reports hub', async ({ page }) => {
    await page.getByRole('button', { name: /back/i }).click()
    await expect(page).toHaveURL('/reports')
  })
})

test.describe('Inventory Summary Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/inventory-summary')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory Summary' })).toBeVisible()
  })

  test('displays summary stats', async ({ page }) => {
    await expect(page.getByText('Total Items')).toBeVisible()
    await expect(page.getByText('Total Value')).toBeVisible()
    await expect(page.getByText('In Stock')).toBeVisible()
    await expect(page.getByText('Need Attention')).toBeVisible()
  })

  test('displays By Category section', async ({ page }) => {
    await expect(page.getByText('By Category')).toBeVisible()
  })
})

test.describe('Inventory Value Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/inventory-value')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory Value Report' })).toBeVisible()
  })

  test('displays value stats', async ({ page }) => {
    await expect(page.getByText('Total Value', { exact: true })).toBeVisible()
    await expect(page.getByText('Total Items', { exact: true })).toBeVisible()
    await expect(page.getByText('Total Quantity', { exact: true })).toBeVisible()
    await expect(page.getByText('Avg Value/Item', { exact: true })).toBeVisible()
  })

  test('displays Value by Folder section', async ({ page }) => {
    await expect(page.getByText('Value by Folder')).toBeVisible()
  })

  test('displays Top 10 Valuable Items section', async ({ page }) => {
    await expect(page.getByText('Top 10 Valuable Items')).toBeVisible()
  })
})

test.describe('Profit Margin Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/profit-margin')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Profit Margin Report' })).toBeVisible()
  })

  test('displays margin stats', async ({ page }) => {
    await expect(page.getByText('Total Potential Profit', { exact: true })).toBeVisible()
    await expect(page.getByText('Average Margin', { exact: true })).toBeVisible()
    await expect(page.getByText('Items with Cost Data', { exact: true })).toBeVisible()
    await expect(page.getByText('Total Cost Value', { exact: true })).toBeVisible()
  })

  test('displays Highest Margin Items section', async ({ page }) => {
    await expect(page.getByText('Highest Margin Items')).toBeVisible()
  })

  test('displays Lowest Margin Items section', async ({ page }) => {
    await expect(page.getByText('Lowest Margin Items')).toBeVisible()
  })

  test('displays Top Profit Contributors section', async ({ page }) => {
    await expect(page.getByText('Top Profit Contributors')).toBeVisible()
  })
})

test.describe('Activity Log Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/activity')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Activity Log' })).toBeVisible()
  })

  test('displays filter button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible()
  })

  test('displays export CSV button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible()
  })

  test('filter panel shows when clicked', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click()

    // Filter options should be visible
    await expect(page.getByText('Action:')).toBeVisible()
    await expect(page.getByText('Entity:')).toBeVisible()
    await expect(page.getByText('Period:')).toBeVisible()
  })

  test('can filter by action type', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click()

    const actionSelect = page.locator('select').first()
    await actionSelect.selectOption('create')

    // Wait for filter to apply
    await page.waitForTimeout(500)
  })
})

test.describe('Inventory Trends Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/trends')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory Trends' })).toBeVisible()
  })

  test('displays trend stats', async ({ page }) => {
    await expect(page.getByText('Total Items')).toBeVisible()
    await expect(page.getByText('Weekly Activity')).toBeVisible()
    await expect(page.getByText('Low Stock')).toBeVisible()
    await expect(page.getByText('Out of Stock')).toBeVisible()
  })

  test('displays Activity Last 7 Days section', async ({ page }) => {
    await expect(page.getByText('Activity Last 7 Days')).toBeVisible()
  })

  test('displays Action Breakdown section', async ({ page }) => {
    await expect(page.getByText('Action Breakdown')).toBeVisible()
  })

  test('displays Most Active Items section', async ({ page }) => {
    await expect(page.getByText('Most Active Items')).toBeVisible()
  })
})

test.describe('Stock Movement Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/stock-movement')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Stock Movement Report' })).toBeVisible()
  })

  test('displays movement stats', async ({ page }) => {
    await expect(page.getByText('Total Moves', { exact: true })).toBeVisible()
    await expect(page.getByText('Quantity Adjustments', { exact: true })).toBeVisible()
    await expect(page.getByText('Net Quantity Change', { exact: true })).toBeVisible()
  })

  test('displays date range selector', async ({ page }) => {
    const dateSelect = page.locator('select').first()
    await expect(dateSelect).toBeVisible()

    // Verify options exist
    const options = await dateSelect.locator('option').allTextContents()
    expect(options.some(opt => opt.includes('7'))).toBe(true)
    expect(options.some(opt => opt.includes('30'))).toBe(true)
    expect(options.some(opt => opt.includes('90'))).toBe(true)
  })

  test('displays export CSV button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible()
  })

  test('can change date range', async ({ page }) => {
    const dateSelect = page.locator('select')
    await dateSelect.selectOption('7')

    // Wait for data reload
    await page.waitForTimeout(500)
  })
})

test.describe('Expiring Items Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/expiring')
  })

  test('displays report title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Expiring Items Report' })).toBeVisible()
  })

  test('displays expiry summary stats', async ({ page }) => {
    await expect(page.getByText('Expired', { exact: true })).toBeVisible()
    await expect(page.getByText('Expiring (7 days)', { exact: true })).toBeVisible()
    await expect(page.getByText('Expiring (30 days)', { exact: true })).toBeVisible()
    await expect(page.getByText('Value at Risk', { exact: true })).toBeVisible()
  })

  test('shows empty state or expired lots section', async ({ page }) => {
    // Either shows "All clear!" or "Expired Lots" depending on data
    const hasExpiredLots = await page.getByText('Expired Lots').isVisible().catch(() => false)
    const hasAllClear = await page.getByText('All clear!').isVisible().catch(() => false)

    expect(hasExpiredLots || hasAllClear).toBe(true)
  })
})

test.describe('Navigation', () => {
  test('can navigate from reports hub to each report and back', async ({ page }) => {
    // Increase timeout for this test that navigates to 8 pages
    test.setTimeout(120000)

    const reports = [
      { url: '/reports/low-stock', title: 'Low Stock Report' },
      { url: '/reports/inventory-summary', title: 'Inventory Summary' },
      { url: '/reports/inventory-value', title: 'Inventory Value Report' },
      { url: '/reports/profit-margin', title: 'Profit Margin Report' },
      { url: '/reports/activity', title: 'Activity Log' },
      { url: '/reports/trends', title: 'Inventory Trends' },
      { url: '/reports/stock-movement', title: 'Stock Movement Report' },
      { url: '/reports/expiring', title: 'Expiring Items Report' },
    ]

    for (const report of reports) {
      await page.goto('/reports', { waitUntil: 'networkidle' })
      await page.goto(report.url, { waitUntil: 'networkidle' })
      await expect(page).toHaveURL(report.url)

      // Check title is visible
      const heading = page.getByRole('heading', { name: report.title })
      await expect(heading).toBeVisible()
    }
  })
})

test.describe('Responsive Design', () => {
  test('reports hub displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/reports')

    // Use main content area heading to avoid matching sidebar heading
    await expect(page.getByRole('main').getByRole('heading', { name: 'Reports' })).toBeVisible()

    // Cards should stack on mobile
    const cards = page.locator('.grid > a')
    const count = await cards.count()
    expect(count).toBe(8)
  })

  test('reports hub displays correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/reports')

    await expect(page.getByRole('main').getByRole('heading', { name: 'Reports' })).toBeVisible()
  })

  test('reports hub displays correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/reports')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()
  })
})
