/**
 * i18n Test Helpers
 *
 * Helper functions for Playwright E2E tests related to internationalization.
 */

import { Page, expect } from '@playwright/test'
import type { LocalePreset } from './i18n-fixtures'
import { LOCALE_PRESETS, DATE_FORMAT_PATTERNS } from './i18n-fixtures'

/**
 * Change tenant locale settings via the settings page
 */
export async function changeTenantSettings(page: Page, preset: LocalePreset): Promise<void> {
  // Navigate to company settings
  await page.goto('/settings/company')
  await page.waitForLoadState('networkidle')

  // Wait for form to load
  await expect(page.locator('h1:has-text("Company"), h2:has-text("Company")')).toBeVisible({
    timeout: 10000,
  })

  // Small delay to ensure form is interactive
  await page.waitForTimeout(500)

  // Change Country (this may trigger a confirmation dialog)
  const countrySelect = page.locator('select[name="country"], label:has-text("Business Location") ~ select, label:has-text("Country") ~ select, label:has-text("Country") + * select').first()
  if (await countrySelect.isVisible()) {
    const currentCountry = await countrySelect.inputValue()
    if (currentCountry !== preset.country) {
      await countrySelect.selectOption(preset.country)

      // Handle the region change confirmation dialog if it appears
      const confirmDialog = page.locator('[role="alertdialog"]')
      try {
        await confirmDialog.waitFor({ state: 'visible', timeout: 2000 })
        // Click the confirm button to proceed with the region change
        const confirmButton = confirmDialog.locator('button:has-text("Change Region")')
        await confirmButton.click()
        await confirmDialog.waitFor({ state: 'hidden', timeout: 3000 })
      } catch {
        // Dialog may not appear if no data exists - this is expected
      }
    }
  }

  // Expand the "Customize formatting" collapsible section if collapsed
  const customizeButton = page.locator('button:has-text("Customize formatting")')
  if (await customizeButton.isVisible()) {
    // Check if the section is collapsed by looking for the currency select
    const currencySelectCheck = page.locator('label:has-text("Currency") ~ select').first()
    if (!(await currencySelectCheck.isVisible())) {
      await customizeButton.click()
      await page.waitForTimeout(300) // Wait for animation
    }
  }

  // Change Currency
  const currencySelect = page.locator('select[name="currency"], label:has-text("Currency") ~ select, label:has-text("Currency") + * select').first()
  if (await currencySelect.isVisible()) {
    await currencySelect.selectOption(preset.currency)
  }

  // Change Timezone
  const timezoneSelect = page.locator('select[name="timezone"], label:has-text("Time zone") ~ select, label:has-text("Timezone") ~ select').first()
  if (await timezoneSelect.isVisible()) {
    await timezoneSelect.selectOption(preset.timezone)
  }

  // Change Date Format
  const dateFormatSelect = page.locator('select[name="date_format"], label:has-text("Date Format") ~ select, label:has-text("Date format") ~ select').first()
  if (await dateFormatSelect.isVisible()) {
    await dateFormatSelect.selectOption(preset.dateFormat)
  }

  // Change Time Format
  const timeFormatSelect = page.locator('select[name="time_format"], label:has-text("Time Format") ~ select, label:has-text("Time format") ~ select').first()
  if (await timeFormatSelect.isVisible()) {
    await timeFormatSelect.selectOption(preset.timeFormat)
  }

  // Change Decimal Precision
  const decimalSelect = page.locator('select[name="decimal_precision"], label:has-text("Decimals") ~ select, label:has-text("Price precision") ~ select, label:has-text("Decimal") ~ select').first()
  if (await decimalSelect.isVisible()) {
    await decimalSelect.selectOption(preset.decimalPrecision)
  }

  // Save settings
  const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first()
  await saveButton.click()

  // Wait for success message or for the save to complete
  await Promise.race([
    page.waitForSelector('text=updated successfully', { timeout: 10000 }),
    page.waitForSelector('text=saved', { timeout: 10000 }),
    page.waitForTimeout(3000), // Fallback timeout
  ])

  // Wait for page to settle after save
  await page.waitForTimeout(500)
}

/**
 * Verify currency formatting on a page
 */
export async function verifyCurrencyFormat(
  page: Page,
  selector: string,
  expectedPattern: RegExp | string
): Promise<void> {
  const element = page.locator(selector).first()
  await expect(element).toBeVisible({ timeout: 5000 })

  const text = await element.textContent()
  if (typeof expectedPattern === 'string') {
    expect(text).toContain(expectedPattern)
  } else {
    expect(text).toMatch(expectedPattern)
  }
}

/**
 * Verify date formatting on a page
 */
export async function verifyDateFormat(
  page: Page,
  selector: string,
  expectedFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY' | 'DD-MM-YYYY'
): Promise<void> {
  const element = page.locator(selector).first()
  await expect(element).toBeVisible({ timeout: 5000 })

  const text = await element.textContent()
  const pattern = DATE_FORMAT_PATTERNS[expectedFormat]
  expect(text).toMatch(pattern)
}

/**
 * Wait for formatting context to load
 */
export async function waitForFormattingContext(page: Page): Promise<void> {
  // Wait for TenantSettingsContext to finish loading
  // This is indicated by the absence of loading states
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500) // Buffer for React hydration
}

/**
 * Get all visible currency values on page
 */
export async function getAllCurrencyValues(page: Page): Promise<string[]> {
  // Look for common currency patterns
  const currencyElements = page.locator(
    '[data-testid*="price"], [data-testid*="amount"], [data-testid*="cost"], [data-testid*="value"], [data-testid*="currency"]'
  )
  const count = await currencyElements.count()

  const values: string[] = []
  for (let i = 0; i < count; i++) {
    const text = await currencyElements.nth(i).textContent()
    if (text) values.push(text)
  }

  return values
}

/**
 * Check if any element on page contains currency symbol
 */
export async function pageContainsCurrencySymbol(page: Page, symbol: string): Promise<boolean> {
  const bodyText = await page.locator('body').textContent()
  return bodyText?.includes(symbol) ?? false
}

/**
 * Reset tenant settings to US defaults
 */
export async function resetToUSDefaults(page: Page): Promise<void> {
  await changeTenantSettings(page, LOCALE_PRESETS.US)
}

/**
 * Get current settings values from the settings page
 */
export async function getCurrentSettings(
  page: Page
): Promise<{
  country?: string
  currency?: string
  timezone?: string
  dateFormat?: string
  timeFormat?: string
  decimalPrecision?: string
}> {
  await page.goto('/settings/company')
  await page.waitForLoadState('networkidle')

  const settings: Record<string, string | undefined> = {}

  // Get Country value
  const countrySelect = page.locator('select[name="country"], label:has-text("Country") ~ select').first()
  if (await countrySelect.isVisible()) {
    settings.country = await countrySelect.inputValue()
  }

  // Get Currency value
  const currencySelect = page.locator('select[name="currency"], label:has-text("Currency") ~ select').first()
  if (await currencySelect.isVisible()) {
    settings.currency = await currencySelect.inputValue()
  }

  // Get Timezone value
  const timezoneSelect = page.locator('select[name="timezone"], label:has-text("Time zone") ~ select').first()
  if (await timezoneSelect.isVisible()) {
    settings.timezone = await timezoneSelect.inputValue()
  }

  // Get Date Format value
  const dateFormatSelect = page.locator('select[name="date_format"], label:has-text("Date Format") ~ select').first()
  if (await dateFormatSelect.isVisible()) {
    settings.dateFormat = await dateFormatSelect.inputValue()
  }

  // Get Time Format value
  const timeFormatSelect = page.locator('select[name="time_format"], label:has-text("Time Format") ~ select').first()
  if (await timeFormatSelect.isVisible()) {
    settings.timeFormat = await timeFormatSelect.inputValue()
  }

  // Get Decimal Precision value
  const decimalSelect = page.locator('select[name="decimal_precision"], label:has-text("Decimals") ~ select').first()
  if (await decimalSelect.isVisible()) {
    settings.decimalPrecision = await decimalSelect.inputValue()
  }

  return settings
}

/**
 * Navigate to a page and wait for it to be ready
 */
export async function navigateAndWait(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await waitForFormattingContext(page)
}

/**
 * Check if an element contains text matching a currency pattern
 */
export async function elementHasCurrency(
  page: Page,
  selector: string,
  currencySymbol: string
): Promise<boolean> {
  const element = page.locator(selector).first()

  if (!(await element.isVisible())) {
    return false
  }

  const text = await element.textContent()
  return text?.includes(currencySymbol) ?? false
}

/**
 * Find all elements with formatted currency and verify they use the expected symbol
 */
export async function verifyAllCurrenciesOnPage(page: Page, expectedSymbol: string): Promise<{
  total: number
  matching: number
  mismatched: string[]
}> {
  const currencyElements = await getAllCurrencyValues(page)
  let matching = 0
  const mismatched: string[] = []

  for (const value of currencyElements) {
    if (value.includes(expectedSymbol)) {
      matching++
    } else {
      mismatched.push(value)
    }
  }

  return {
    total: currencyElements.length,
    matching,
    mismatched,
  }
}
