/**
 * i18n Visual Regression E2E Tests
 *
 * Visual regression tests using Percy to capture screenshots of pages
 * with different locale settings. This helps detect unintended visual
 * changes to formatting across locales.
 */

import { test, expect } from '@playwright/test'
import { LOCALE_PRESETS, PAGES_TO_TEST } from './utils/i18n-fixtures'
import {
  changeTenantSettings,
  waitForFormattingContext,
  resetToUSDefaults,
} from './utils/i18n-helpers'
import { takePercySnapshot, preparePageForSnapshot } from './utils/percy'

// Skip these tests if Percy token is not set
const skipPercy = !process.env.PERCY_TOKEN

test.describe('i18n Visual Regression', () => {
  test.describe.configure({ mode: 'serial' })

  // Test US locale (default)
  test.describe('US Locale', () => {
    test.beforeAll(async ({ browser }) => {
      if (skipPercy) {
        test.skip()
      }
    })

    const preset = LOCALE_PRESETS.US

    test.beforeEach(async ({ page }) => {
      await changeTenantSettings(page, preset)
    })

    test('Dashboard - US locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/dashboard')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Dashboard - US')
    })

    test('Inventory - US locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/inventory')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Inventory - US')
    })

    test('Invoices - US locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/tasks/invoices')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Invoices - US')
    })

    test('Settings - US locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/settings/company')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Settings - US')
    })

    test('Stock Movement Report - US locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/reports/stock-movement')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Stock Movement - US')
    })
  })

  // Test Malaysian locale
  test.describe('MY Locale', () => {
    const preset = LOCALE_PRESETS.MY

    test.beforeEach(async ({ page }) => {
      await changeTenantSettings(page, preset)
    })

    test.afterAll(async ({ browser }) => {
      const page = await browser.newPage()
      await resetToUSDefaults(page)
      await page.close()
    })

    test('Dashboard - MY locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/dashboard')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Dashboard - MY')
    })

    test('Inventory - MY locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/inventory')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Inventory - MY')
    })

    test('Invoices - MY locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/tasks/invoices')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Invoices - MY')
    })

    test('Settings - MY locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/settings/company')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Settings - MY')
    })

    test('Stock Movement Report - MY locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/reports/stock-movement')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Stock Movement - MY')
    })
  })

  // Test Japanese locale
  test.describe('JP Locale', () => {
    const preset = LOCALE_PRESETS.JP

    test.beforeEach(async ({ page }) => {
      await changeTenantSettings(page, preset)
    })

    test.afterAll(async ({ browser }) => {
      const page = await browser.newPage()
      await resetToUSDefaults(page)
      await page.close()
    })

    test('Dashboard - JP locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/dashboard')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Dashboard - JP')
    })

    test('Inventory - JP locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/inventory')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Inventory - JP')
    })

    test('Invoices - JP locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/tasks/invoices')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Invoices - JP')
    })

    test('Settings - JP locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/settings/company')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Settings - JP')
    })

    test('Stock Movement Report - JP locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/reports/stock-movement')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Stock Movement - JP')
    })
  })

  // Test German locale
  test.describe('DE Locale', () => {
    const preset = LOCALE_PRESETS.DE

    test.beforeEach(async ({ page }) => {
      await changeTenantSettings(page, preset)
    })

    test.afterAll(async ({ browser }) => {
      const page = await browser.newPage()
      await resetToUSDefaults(page)
      await page.close()
    })

    test('Dashboard - DE locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/dashboard')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Dashboard - DE')
    })

    test('Inventory - DE locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/inventory')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Inventory - DE')
    })

    test('Invoices - DE locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/tasks/invoices')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Invoices - DE')
    })

    test('Settings - DE locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/settings/company')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Settings - DE')
    })

    test('Stock Movement Report - DE locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/reports/stock-movement')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Stock Movement - DE')
    })
  })

  // Test UK locale
  test.describe('GB Locale', () => {
    const preset = LOCALE_PRESETS.GB

    test.beforeEach(async ({ page }) => {
      await changeTenantSettings(page, preset)
    })

    test.afterAll(async ({ browser }) => {
      const page = await browser.newPage()
      await resetToUSDefaults(page)
      await page.close()
    })

    test('Dashboard - GB locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/dashboard')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Dashboard - GB')
    })

    test('Inventory - GB locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/inventory')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Inventory - GB')
    })

    test('Invoices - GB locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/tasks/invoices')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Invoices - GB')
    })

    test('Settings - GB locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/settings/company')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Settings - GB')
    })

    test('Stock Movement Report - GB locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/reports/stock-movement')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Stock Movement - GB')
    })
  })

  // Test Singapore locale
  test.describe('SG Locale', () => {
    const preset = LOCALE_PRESETS.SG

    test.beforeEach(async ({ page }) => {
      await changeTenantSettings(page, preset)
    })

    test.afterAll(async ({ browser }) => {
      const page = await browser.newPage()
      await resetToUSDefaults(page)
      await page.close()
    })

    test('Dashboard - SG locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/dashboard')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Dashboard - SG')
    })

    test('Inventory - SG locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/inventory')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Inventory - SG')
    })

    test('Invoices - SG locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/tasks/invoices')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Invoices - SG')
    })

    test('Settings - SG locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/settings/company')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Settings - SG')
    })

    test('Stock Movement Report - SG locale', async ({ page }) => {
      if (skipPercy) test.skip()

      await page.goto('/reports/stock-movement')
      await waitForFormattingContext(page)
      await takePercySnapshot(page, 'Stock Movement - SG')
    })
  })
})
