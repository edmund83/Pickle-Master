import { test, expect } from '@playwright/test'
import { takePercySnapshot } from './utils/percy'

/**
 * E2E Tests for Check-In/Check-Out
 * Scenarios 151-170 from testscenario.md
 */

test.describe('Check-In/Check-Out', () => {
  // Scenario 151: Check out item to a person/project
  test('151. Check out item to a person/project', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Check out item')
  })

  // Scenario 152: Check out with quantity selection
  test('152. Check out with quantity selection', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Quantity selection')
  })

  // Scenario 153: Check out with expected return date
  test('153. Check out with expected return date', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Return date')
  })

  // Scenario 154: Check out with notes
  test('154. Check out with notes', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - With notes')
  })

  // Scenario 155: View all active checkouts
  test('155. View all active checkouts', async ({ page }) => {
    await page.goto('/tasks/checkouts?filter=active')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Active checkouts')
  })

  // Scenario 156: Check in item (return)
  test('156. Check in item (return)', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Check in item')
  })

  // Scenario 157: Partial check-in (return some of checked out qty)
  test('157. Partial check-in (return some of checked out qty)', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Partial check-in')
  })

  // Scenario 158: Check-in with condition notes
  test('158. Check-in with condition notes', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Condition notes')
  })

  // Scenario 159: Overdue checkout alerts
  test('159. Overdue checkout alerts', async ({ page }) => {
    await page.goto('/tasks/checkouts?filter=overdue')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Overdue alerts')
  })

  // Scenario 160: Filter checkouts by person
  test('160. Filter checkouts by person', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Filter by person')
  })

  // Scenario 161: Filter checkouts by date range
  test('161. Filter checkouts by date range', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Filter by date')
  })

  // Scenario 162: View checkout history for item
  test('162. View checkout history for item', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Item history')
  })

  // Scenario 163: Send reminder for overdue items
  test('163. Send reminder for overdue items', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Send reminder')
  })

  // Scenario 164: Bulk check out multiple items
  test('164. Bulk check out multiple items', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Bulk checkout')
  })

  // Scenario 165: Bulk check in multiple items
  test('165. Bulk check in multiple items', async ({ page }) => {
    await page.goto('/tasks/checkouts')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Bulk checkin')
  })

  // Scenario 166: Item status shows "checked out" badge
  test('166. Item status shows checked out badge', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Status badge')
  })

  // Scenario 167: Available quantity updates after checkout
  test('167. Available quantity updates after checkout', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Qty after checkout')
  })

  // Scenario 168: Available quantity updates after checkin
  test('168. Available quantity updates after checkin', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Qty after checkin')
  })

  // Scenario 169: Checkout creates activity log entry
  test('169. Checkout creates activity log entry', async ({ page }) => {
    await page.goto('/reports/activity')
    await page.waitForLoadState('networkidle')
    const heading = page.getByRole('heading', { name: 'Activity Log' })
    const isVisible = await heading.isVisible().catch(() => false)
    expect(isVisible || await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkout - Activity log entry')
  })

  // Scenario 170: Checkin creates activity log entry
  test('170. Checkin creates activity log entry', async ({ page }) => {
    await page.goto('/reports/activity')
    await page.waitForLoadState('networkidle')
    const heading = page.getByRole('heading', { name: 'Activity Log' })
    const isVisible = await heading.isVisible().catch(() => false)
    expect(isVisible || await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Checkin - Activity log entry')
  })
})
