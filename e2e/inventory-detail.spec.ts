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

  test.describe('Quick Actions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/inventory/${TEST_ITEM_ID}`)
      await page.waitForLoadState('networkidle')
    })

    test('increase quantity button is clickable', async ({ page }) => {
      const increaseBtn = page.getByRole('button', { name: /increase quantity/i })
      await expect(increaseBtn).toBeVisible()
      await expect(increaseBtn).toBeEnabled()

      // Click and verify no error
      await increaseBtn.click()
      await page.waitForLoadState('networkidle')

      // Page should still be functional
      await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible()
    })

    test('decrease quantity button is clickable', async ({ page }) => {
      const decreaseBtn = page.getByRole('button', { name: /decrease quantity/i })
      await expect(decreaseBtn).toBeVisible()
      await expect(decreaseBtn).toBeEnabled()

      // Click and verify no error
      await decreaseBtn.click()
      await page.waitForLoadState('networkidle')

      // Page should still be functional
      await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible()
    })

    test('lend button opens modal', async ({ page }) => {
      const lendBtn = page.getByRole('button', { name: /lend/i })
      await expect(lendBtn).toBeVisible()

      await lendBtn.click()

      // Modal or dialog should appear
      const modal = page.getByRole('dialog')
      const modalVisible = await modal.isVisible().catch(() => false)

      // Either modal appears or navigation happens
      expect(modalVisible || page.url().includes('checkout')).toBeTruthy()
    })
  })

  test.describe('Additional Sections', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/inventory/${TEST_ITEM_ID}`)
      await page.waitForLoadState('networkidle')
    })

    test('displays activity history section', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible()

      // View All link should be present
      const viewAllLink = page.getByRole('link', { name: /view all/i })
      await expect(viewAllLink).toBeVisible()
      await expect(viewAllLink).toHaveAttribute('href', new RegExp(`/inventory/${TEST_ITEM_ID}/activity`))
    })

    test('displays tags section', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible()
    })

    test('displays chatter panel', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Chatter' })).toBeVisible()

      // Message input should be present
      await expect(page.getByPlaceholder(/write a message/i)).toBeVisible()

      // Follow button should be present
      await expect(page.getByRole('button', { name: /follow/i })).toBeVisible()
    })

    test('displays QR & Barcode section', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'QR & Barcode' })).toBeVisible()
    })

    test('displays description & notes section', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Description & Notes' })).toBeVisible()
    })

    test('displays metadata footer with dates and ID', async ({ page }) => {
      // Created date
      await expect(page.getByText(/created:/i)).toBeVisible()

      // Updated date
      await expect(page.getByText(/updated:/i)).toBeVisible()

      // Item ID
      await expect(page.getByText(/id:/i)).toBeVisible()
      await expect(page.getByText(TEST_ITEM_ID)).toBeVisible()
    })

    test('print label button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: /print label/i })).toBeVisible()
    })
  })

  test.describe('Tracking Modes', () => {
    test('standard item shows no tracking cards', async ({ page }) => {
      // Test item has tracking_mode = 'none'
      await page.goto(`/inventory/${TEST_ITEM_ID}`)
      await page.waitForLoadState('networkidle')

      // Should NOT show serial or batch tracking cards
      const serialCard = page.getByRole('heading', { name: /serial tracking/i })
      const batchCard = page.getByRole('heading', { name: /batch tracking/i })

      await expect(serialCard).not.toBeVisible()
      await expect(batchCard).not.toBeVisible()

      // Should show standard inventory card
      await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible()
    })

    // Note: These tests require items with specific tracking modes
    // Uncomment and update TEST_ITEM_SERIALIZED_ID when available
    /*
    test('serialized item shows serial tracking card', async ({ page }) => {
      const TEST_ITEM_SERIALIZED_ID = 'your-serialized-item-id'
      await page.goto(`/inventory/${TEST_ITEM_SERIALIZED_ID}`)
      await page.waitForLoadState('networkidle')

      // Should show serial tracking section
      await expect(page.getByText(/serial/i)).toBeVisible()
      await expect(page.getByText(/available/i)).toBeVisible()
      await expect(page.getByText(/checked out/i)).toBeVisible()
    })

    test('lot tracked item shows batch tracking card', async ({ page }) => {
      const TEST_ITEM_LOT_ID = 'your-lot-item-id'
      await page.goto(`/inventory/${TEST_ITEM_LOT_ID}`)
      await page.waitForLoadState('networkidle')

      // Should show batch/lot tracking section
      await expect(page.getByText(/batch|lot/i)).toBeVisible()
      await expect(page.getByText(/active/i)).toBeVisible()
    })
    */
  })

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/inventory/${TEST_ITEM_ID}`)
      await page.waitForLoadState('networkidle')
    })

    test('back button navigates to inventory list', async ({ page }) => {
      await page.getByRole('link', { name: /back/i }).click()
      await page.waitForLoadState('networkidle')

      expect(page.url()).toMatch(/\/inventory$/)
    })

    test('edit button navigates to edit page', async ({ page }) => {
      await page.getByRole('link', { name: /edit/i }).click()
      await page.waitForLoadState('networkidle')

      expect(page.url()).toMatch(new RegExp(`/inventory/${TEST_ITEM_ID}/edit`))
    })

    test('view all activity link navigates to activity page', async ({ page }) => {
      await page.getByRole('link', { name: /view all/i }).click()
      await page.waitForLoadState('networkidle')

      expect(page.url()).toMatch(new RegExp(`/inventory/${TEST_ITEM_ID}/activity`))
    })
  })
})
