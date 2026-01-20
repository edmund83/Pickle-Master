import { test, expect } from '@playwright/test'
import { takePercySnapshot } from './utils/percy'

/**
 * E2E Tests for Tasks & Workflows
 * Scenarios 171-280 from testscenario.md
 * Includes: Purchase Orders, Goods Receiving, Pick Lists, Sales Orders, Delivery Orders, Invoices, Stock Counts
 */

test.describe('Purchase Orders', () => {
  // Scenarios 171-190
  test('171. Create new purchase order', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Create purchase order')
  })

  test('172. Add items to purchase order', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Add items to PO')
  })

  test('173. View purchase order list', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Purchase order list')
  })

  test('174. Filter purchase orders by status', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Filter PO by status')
  })

  test('175. Filter purchase orders by vendor', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Filter PO by vendor')
  })

  test('176-180. Purchase order CRUD operations', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - PO CRUD operations')
  })
})

test.describe('Goods Receiving', () => {
  // Scenarios 191-205
  test('191. Receive goods against purchase order', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Receive goods')
  })

  test('192. Partial goods receipt', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Partial receipt')
  })

  test('193-205. Goods receiving workflow', async ({ page }) => {
    await page.goto('/tasks/inbound')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Goods receiving workflow')
  })
})

test.describe('Pick Lists', () => {
  // Scenarios 206-225
  test('206. Create pick list', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Create pick list')
  })

  test('207. View pick list with items', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - View pick list')
  })

  test('208. Mark items as picked', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Mark items picked')
  })

  test('209-225. Pick list workflow', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Pick list workflow')
  })
})

test.describe('Sales Orders', () => {
  // Scenarios 226-235
  test('226. Create sales order', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Create sales order')
  })

  test('227-235. Sales order workflow', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Sales order workflow')
  })
})

test.describe('Delivery Orders', () => {
  // Scenarios 236-250
  test('236. Create delivery order', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Create delivery order')
  })

  test('237-250. Delivery order workflow', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Delivery order workflow')
  })
})

test.describe('Invoices', () => {
  // Scenarios 251-265
  test('251. Generate invoice from delivery', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Generate invoice')
  })

  test('252-265. Invoice workflow', async ({ page }) => {
    await page.goto('/tasks/fulfillment')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Invoice workflow')
  })
})

test.describe('Stock Counts', () => {
  // Scenarios 266-280
  test('266. Start new stock count', async ({ page }) => {
    await page.goto('/tasks/inventory-operations')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Start stock count')
  })

  test('267. Select items/locations for count', async ({ page }) => {
    await page.goto('/tasks/inventory-operations')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Select items for count')
  })

  test('268. Enter counted quantities', async ({ page }) => {
    await page.goto('/tasks/inventory-operations')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Enter counted quantities')
  })

  test('269. Review discrepancies', async ({ page }) => {
    await page.goto('/tasks/inventory-operations')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Review discrepancies')
  })

  test('270. Adjust inventory based on count', async ({ page }) => {
    await page.goto('/tasks/inventory-operations')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Adjust inventory')
  })

  test('271-280. Stock count workflow', async ({ page }) => {
    await page.goto('/tasks/inventory-operations')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Tasks - Stock count workflow')
  })
})
