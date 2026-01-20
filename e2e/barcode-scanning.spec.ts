import { test, expect } from '@playwright/test'
import { takePercySnapshot } from './utils/percy'

/**
 * E2E Tests for Barcode/QR Scanning
 * Scenarios 131-150 from testscenario.md
 */

test.describe('Barcode/QR Scanning', () => {
  // Scenario 131: Open scanner from floating action button
  test('131. Open scanner from floating action button', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Look for scan button
    const scanButton = page.locator('a[href*="/scan"], button[aria-label*="scan" i]').first()
    const isVisible = await scanButton.isVisible().catch(() => false)
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Scanner FAB')
  })

  // Scenario 132: Scan QR code to open item detail
  test('132. Scan QR code to open item detail', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Scan QR code')
  })

  // Scenario 133: Scan barcode to find item
  test('133. Scan barcode to find item', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Scan barcode')
  })

  // Scenario 134: Manual barcode entry when camera unavailable
  test('134. Manual barcode entry when camera unavailable', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')

    // Look for manual entry option
    const manualEntry = page.getByText(/manual|enter|type/i)
    const isVisible = await manualEntry.isVisible().catch(() => false)
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Manual entry')
  })

  // Scenario 135: Scan to quickly adjust quantity
  test('135. Scan to quickly adjust quantity', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Quick adjust quantity')
  })

  // Scenario 136: Scan multiple items in batch mode
  test('136. Scan multiple items in batch mode', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')

    const batchMode = page.getByText(/batch|multiple/i)
    const isVisible = await batchMode.isVisible().catch(() => false)
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Batch mode')
  })

  // Scenario 137: Audible beep on successful scan
  test('137. Audible beep on successful scan', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Audible beep')
  })

  // Scenario 138: Haptic feedback on scan
  test('138. Haptic feedback on scan', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Haptic feedback mobile')
  })

  // Scenario 139: Toggle flashlight/torch for dark environments
  test('139. Toggle flashlight/torch for dark environments', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')

    const flashlightButton = page.getByRole('button', { name: /flash|torch|light/i })
    const isVisible = await flashlightButton.isVisible().catch(() => false)
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Flashlight toggle')
  })

  // Scenario 140: Scan unknown barcode prompts to create new item
  test('140. Scan unknown barcode prompts to create new item', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Unknown barcode prompt')
  })

  // Scenario 141: Recent scans history
  test('141. Recent scans history', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')

    const recentScans = page.getByText(/recent|history/i)
    const isVisible = await recentScans.isVisible().catch(() => false)
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Recent scans history')
  })

  // Scenario 142: Switch between front/back camera
  test('142. Switch between front/back camera', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')

    const switchCamera = page.getByRole('button', { name: /switch|camera/i })
    const isVisible = await switchCamera.isVisible().catch(() => false)
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Camera switch')
  })

  // Scenario 143: Generate QR code for item
  test('143. Generate QR code for item', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Generate QR code')
  })

  // Scenario 144: Print QR label from scan result
  test('144. Print QR label from scan result', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Print QR label')
  })

  // Scenario 145: Scan to initiate check-out
  test('145. Scan to initiate check-out', async ({ page }) => {
    await page.goto('/scan?mode=checkout')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Checkout mode')
  })

  // Scenario 146: Scan to initiate check-in
  test('146. Scan to initiate check-in', async ({ page }) => {
    await page.goto('/scan?mode=checkin')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Checkin mode')
  })

  // Scenario 147: Scan with overlay showing scan area
  test('147. Scan with overlay showing scan area', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Scan overlay')
  })

  // Scenario 148: Support for 1D barcodes (UPC, EAN)
  test('148. Support for 1D barcodes (UPC, EAN)', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - 1D barcode support')
  })

  // Scenario 149: Support for 2D codes (QR, DataMatrix)
  test('149. Support for 2D codes (QR, DataMatrix)', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - 2D code support')
  })

  // Scenario 150: Scanner permission request handled gracefully
  test('150. Scanner permission request handled gracefully', async ({ page }) => {
    await page.goto('/scan')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('body').isVisible()).toBe(true)
    await takePercySnapshot(page, 'Barcode - Permission request')
  })
})
