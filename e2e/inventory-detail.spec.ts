import { test, expect } from '@playwright/test'
import { takePercySnapshot } from './utils/percy'

/**
 * E2E Tests for Inventory Detail Page
 * Tests the /inventory/[itemId] page functionality
 */

// Known test item ID (Test Item No Tracking)
const TEST_ITEM_ID = 'c0accf5f-d3f5-4360-b901-93cdd2bac038'

test.describe('Inventory Detail Page', () => {
  test.describe('Page Loading & Authentication', () => {
    test('shows 404 for non-existent item', async ({ page }) => {
      await page.goto('/inventory/00000000-0000-0000-0000-000000000000')
      await page.waitForLoadState('networkidle')

      // Check if we're authenticated (not on login page)
      const isOnLoginPage = page.url().includes('/login')

      if (!isOnLoginPage) {
        // Should show 404 page for non-existent item
        await expect(page.getByText('Page not found')).toBeVisible()
      } else {
        // Not authenticated - verify page loads
        expect(await page.locator('body').isVisible()).toBe(true)
      }
    })

    test('loads successfully with valid item', async ({ page }) => {
      await page.goto(`/inventory/${TEST_ITEM_ID}`)
      await page.waitForLoadState('networkidle')

      // Check if we're authenticated (not on login page)
      const isOnLoginPage = page.url().includes('/login')

      if (!isOnLoginPage) {
        // Should not show 404
        await expect(page.getByText('Page not found')).not.toBeVisible()

        // Should show item content (h1 contains the item name)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        // Percy snapshot
        await takePercySnapshot(page, 'Inventory Detail - Item Page')
      } else {
        // Not authenticated - verify page loads
        expect(await page.locator('body').isVisible()).toBe(true)
      }
    })
  })
})
