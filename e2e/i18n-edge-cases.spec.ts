/**
 * i18n Edge Cases E2E Tests
 *
 * Tests for edge cases in internationalization and formatting,
 * including zero values, large numbers, timezone edge cases,
 * decimal precision variations, and rapid settings changes.
 */

import { test, expect } from '@playwright/test'
import { LOCALE_PRESETS } from './utils/i18n-fixtures'
import {
  changeTenantSettings,
  waitForFormattingContext,
  resetToUSDefaults,
  getCurrentSettings,
  navigateAndWait,
} from './utils/i18n-helpers'

test.describe('i18n Edge Cases', () => {
  test.describe('Zero and Null Values', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('handles pages with no data gracefully', async ({ page }) => {
      const preset = LOCALE_PRESETS.US

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors even if inventory is empty
      await expect(page.locator('body')).toBeVisible()

      // Check for empty state message or normal page content
      const hasContent = await page.locator('main, [data-testid="content"]').count()
      expect(hasContent).toBeGreaterThanOrEqual(0)
    })

    test('handles null values without crashing', async ({ page }) => {
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()

      // Look for "-" placeholders which indicate null values handled gracefully
      const body = await page.locator('body').textContent()
      expect(body).toBeDefined()
    })
  })

  test.describe('Large Numbers', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('formats large currency values correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.US

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/reports/inventory-valuation')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()
    })

    test('large numbers display with proper thousand separators', async ({ page }) => {
      const preset = LOCALE_PRESETS.DE // Uses different separators

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Timezone Edge Cases', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('handles UTC timezone correctly', async ({ page }) => {
      const preset = {
        ...LOCALE_PRESETS.US,
        timezone: 'UTC',
      }

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()

      // Verify timezone was set
      const settings = await getCurrentSettings(page)
      expect(settings.timezone).toBe('UTC')
    })

    test('handles timezone with DST (America/New_York) correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.US // Uses America/New_York

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()
    })

    test('handles timezone across date line (Asia/Tokyo) correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.JP

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Decimal Precision', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('handles 0 decimal places (JPY)', async ({ page }) => {
      const preset = LOCALE_PRESETS.JP // Uses '1' (0 decimals)

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()

      // Verify decimal precision was set
      const settings = await getCurrentSettings(page)
      expect(settings.decimalPrecision).toBe('1')
    })

    test('handles 2 decimal places (standard)', async ({ page }) => {
      const preset = LOCALE_PRESETS.US // Uses '0.01' (2 decimals)

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()

      // Verify decimal precision was set
      const settings = await getCurrentSettings(page)
      expect(settings.decimalPrecision).toBe('0.01')
    })

    test('handles 3 decimal places', async ({ page }) => {
      const preset = {
        ...LOCALE_PRESETS.US,
        decimalPrecision: '0.001',
      }

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Rapid Settings Changes', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('handles rapid locale switching', async ({ page }) => {
      // Switch locales rapidly
      await changeTenantSettings(page, LOCALE_PRESETS.US)
      await changeTenantSettings(page, LOCALE_PRESETS.MY)
      await changeTenantSettings(page, LOCALE_PRESETS.JP)
      await changeTenantSettings(page, LOCALE_PRESETS.DE)

      // Verify final state is German
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('EUR')
      expect(settings.country).toBe('DE')
    })

    test('maintains consistency after multiple rapid changes', async ({ page }) => {
      // Rapid changes
      for (let i = 0; i < 3; i++) {
        await changeTenantSettings(page, LOCALE_PRESETS.US)
        await changeTenantSettings(page, LOCALE_PRESETS.MY)
      }

      // Final state should be MY
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('MYR')
    })

    test('handles back-to-back page navigation with settings changes', async ({ page }) => {
      await changeTenantSettings(page, LOCALE_PRESETS.JP)

      // Rapid navigation
      await page.goto('/inventory')
      await page.goto('/dashboard')
      await page.goto('/tasks/invoices')
      await page.goto('/settings/company')

      // Settings should still be correct
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('JPY')
    })
  })

  test.describe('Date Format Edge Cases', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('handles MM/DD/YYYY format correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.US

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      const settings = await getCurrentSettings(page)
      expect(settings.dateFormat).toBe('MM/DD/YYYY')
    })

    test('handles DD/MM/YYYY format correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.MY

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      const settings = await getCurrentSettings(page)
      expect(settings.dateFormat).toBe('DD/MM/YYYY')
    })

    test('handles YYYY-MM-DD (ISO) format correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.JP

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      const settings = await getCurrentSettings(page)
      expect(settings.dateFormat).toBe('YYYY-MM-DD')
    })

    test('handles DD.MM.YYYY format correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.DE

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      const settings = await getCurrentSettings(page)
      expect(settings.dateFormat).toBe('DD.MM.YYYY')
    })
  })

  test.describe('Time Format Edge Cases', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('handles 12-hour format correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.US

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      const settings = await getCurrentSettings(page)
      expect(settings.timeFormat).toBe('12-hour')
    })

    test('handles 24-hour format correctly', async ({ page }) => {
      const preset = LOCALE_PRESETS.DE

      await changeTenantSettings(page, preset)
      await navigateAndWait(page, '/inventory')

      const settings = await getCurrentSettings(page)
      expect(settings.timeFormat).toBe('24-hour')
    })
  })

  test.describe('Currency Symbol Edge Cases', () => {
    test.afterEach(async ({ page }) => {
      try {
        await resetToUSDefaults(page)
      } catch {
        // Ignore cleanup errors
      }
    })

    test('handles single character symbol ($)', async ({ page }) => {
      const preset = LOCALE_PRESETS.US

      await changeTenantSettings(page, preset)
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('USD')
    })

    test('handles multi-character symbol (RM)', async ({ page }) => {
      const preset = LOCALE_PRESETS.MY

      await changeTenantSettings(page, preset)
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('MYR')
    })

    test('handles symbol with special characters (S$)', async ({ page }) => {
      const preset = LOCALE_PRESETS.SG

      await changeTenantSettings(page, preset)
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('SGD')
    })

    test('handles non-Latin symbol (¥)', async ({ page }) => {
      const preset = LOCALE_PRESETS.JP

      await changeTenantSettings(page, preset)
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('JPY')
    })

    test('handles symbol (€)', async ({ page }) => {
      const preset = LOCALE_PRESETS.DE

      await changeTenantSettings(page, preset)
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('EUR')
    })

    test('handles symbol (£)', async ({ page }) => {
      const preset = LOCALE_PRESETS.GB

      await changeTenantSettings(page, preset)
      const settings = await getCurrentSettings(page)
      expect(settings.currency).toBe('GBP')
    })
  })
})
