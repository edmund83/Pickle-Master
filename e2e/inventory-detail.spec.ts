import { test, expect } from '@playwright/test'
import { takePercySnapshot } from './utils/percy'

/**
 * E2E Tests for Inventory Detail Page
 * Tests the /inventory/[itemId] page functionality
 */

// Known test item ID (Test Item No Tracking)
const TEST_ITEM_ID = 'c0accf5f-d3f5-4360-b901-93cdd2bac038'

test.describe('Inventory Detail Page', () => {
  test('shows 404 for non-existent item', async ({ page }) => {
    await page.goto('/inventory/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Page not found')).toBeVisible()
  })

  test('loads successfully with valid item', async ({ page }) => {
    await page.goto(`/inventory/${TEST_ITEM_ID}`)
    await page.waitForLoadState('networkidle')

    // Should not show 404
    await expect(page.getByText('Page not found')).not.toBeVisible()

    // Should show item content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Percy snapshot
    await takePercySnapshot(page, 'Inventory Detail - Item Page')
  })

  test.describe('Basic Item Display', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/inventory/${TEST_ITEM_ID}`)
      await page.waitForLoadState('networkidle')
    })

    test('displays item header correctly', async ({ page }) => {
      // Item name should be in heading
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toBeVisible()

      // Back button should link to inventory
      const backLink = page.getByRole('link', { name: /back/i })
      await expect(backLink).toHaveAttribute('href', '/inventory')

      // Edit button should be visible
      const editLink = page.getByRole('link', { name: /edit/i })
      await expect(editLink).toBeVisible()

      // Status badge should be visible
      const statusBadge = page.getByText(/in stock|low stock|out of stock/i).first()
      await expect(statusBadge).toBeVisible()

      await takePercySnapshot(page, 'Inventory Detail - Header')
    })

    test('displays inventory card with quantity', async ({ page }) => {
      // Inventory heading (h2 in ItemDetailCard)
      await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible()

      // "On hand" label should be visible
      await expect(page.getByText('On hand')).toBeVisible()

      // Quick action buttons for non-tracked items
      await expect(page.getByRole('button', { name: /increase quantity/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /decrease quantity/i })).toBeVisible()
    })

    test('displays pricing card', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible()
      await expect(page.getByText('Selling Price')).toBeVisible()
      await expect(page.getByText('Cost Price')).toBeVisible()
      await expect(page.getByText('Total Value')).toBeVisible()
    })

    test('displays identifiers card', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /identifiers/i })).toBeVisible()
      await expect(page.getByText('SKU')).toBeVisible()
      await expect(page.getByText('Barcode')).toBeVisible()
    })

    test('displays location card', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /location/i })).toBeVisible()
    })
  })
})
