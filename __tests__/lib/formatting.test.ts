import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeDate,
  formatShortDate,
  getCurrencySymbol,
  getCurrencyDisplay,
  DEFAULT_TENANT_SETTINGS,
  CURRENCY_SYMBOLS,
  type TenantSettings,
} from '@/lib/formatting'

// Non-breaking space used in currency formatting to prevent line breaks between symbol and number
const NBSP = '\u00A0'

/**
 * Formatting Library Tests
 *
 * Tests for all formatting functions that format values according to tenant settings.
 * These are pure functions that can be tested without mocking dependencies.
 */

describe('Formatting Library', () => {
  describe('getCurrencySymbol', () => {
    it('returns correct symbol for major currencies', () => {
      expect(getCurrencySymbol('USD')).toBe('$')
      expect(getCurrencySymbol('EUR')).toBe('€')
      expect(getCurrencySymbol('GBP')).toBe('£')
      expect(getCurrencySymbol('JPY')).toBe('¥')
      expect(getCurrencySymbol('MYR')).toBe('RM')
      expect(getCurrencySymbol('SGD')).toBe('S$')
    })

    it('returns currency code for unknown currencies', () => {
      expect(getCurrencySymbol('XYZ')).toBe('XYZ')
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN')
    })

    it('handles all documented currencies', () => {
      // Verify each currency in the map returns its symbol
      for (const [code, symbol] of Object.entries(CURRENCY_SYMBOLS)) {
        expect(getCurrencySymbol(code)).toBe(symbol)
      }
    })
  })

  describe('formatCurrency', () => {
    it('formats positive values correctly with default settings', () => {
      const result = formatCurrency(1234.56)
      expect(result).toBe(`RM${NBSP}1,234.56`)
    })

    it('formats negative values correctly', () => {
      const result = formatCurrency(-1234.56)
      expect(result).toBe(`RM${NBSP}-1,234.56`)
    })

    it('formats zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toBe(`RM${NBSP}0.00`)
    })

    it('returns dash for null value', () => {
      expect(formatCurrency(null)).toBe('-')
    })

    it('returns dash for undefined value', () => {
      expect(formatCurrency(undefined)).toBe('-')
    })

    it('returns dash for NaN', () => {
      expect(formatCurrency(NaN)).toBe('-')
    })

    it('returns dash for Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('-')
      expect(formatCurrency(-Infinity)).toBe('-')
    })

    it('respects custom currency setting', () => {
      const settings: Partial<TenantSettings> = { currency: 'USD' }
      expect(formatCurrency(100, settings)).toBe(`$${NBSP}100.00`)
    })

    it('respects decimal precision of 0', () => {
      const settings: Partial<TenantSettings> = { decimal_precision: '1' }
      expect(formatCurrency(1234.56, settings)).toBe(`RM${NBSP}1,235`)
    })

    it('respects decimal precision of 1', () => {
      const settings: Partial<TenantSettings> = { decimal_precision: '0.1' }
      expect(formatCurrency(1234.56, settings)).toBe(`RM${NBSP}1,234.6`)
    })

    it('respects decimal precision of 3', () => {
      const settings: Partial<TenantSettings> = { decimal_precision: '0.001' }
      expect(formatCurrency(1234.5678, settings)).toBe(`RM${NBSP}1,234.568`)
    })

    it('handles large numbers', () => {
      const result = formatCurrency(1234567890.12)
      expect(result).toBe(`RM${NBSP}1,234,567,890.12`)
    })

    it('handles very small decimal values', () => {
      const settings: Partial<TenantSettings> = { decimal_precision: '0.01' }
      expect(formatCurrency(0.01, settings)).toBe(`RM${NBSP}0.01`)
    })
  })

  describe('formatNumber', () => {
    it('formats positive numbers with default precision', () => {
      const result = formatNumber(1234.567)
      expect(result).toBe('1,234.57')
    })

    it('formats negative numbers correctly', () => {
      const result = formatNumber(-1234.567)
      expect(result).toBe('-1,234.57')
    })

    it('formats zero correctly', () => {
      expect(formatNumber(0)).toBe('0.00')
    })

    it('returns dash for null', () => {
      expect(formatNumber(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatNumber(undefined)).toBe('-')
    })

    it('returns dash for NaN', () => {
      expect(formatNumber(NaN)).toBe('-')
    })

    it('returns dash for Infinity', () => {
      expect(formatNumber(Infinity)).toBe('-')
    })

    it('respects custom decimal precision', () => {
      const settings: Partial<TenantSettings> = { decimal_precision: '0.001' }
      expect(formatNumber(1234.5678, settings)).toBe('1,234.568')
    })
  })

  describe('formatDate', () => {
    const testDate = '2025-12-25T14:30:00Z'

    it('formats date with default DD/MM/YYYY format', () => {
      const result = formatDate(testDate)
      // Default timezone is Asia/Kuala_Lumpur (UTC+8)
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    })

    it('returns dash for null date', () => {
      expect(formatDate(null)).toBe('-')
    })

    it('returns dash for undefined date', () => {
      expect(formatDate(undefined)).toBe('-')
    })

    it('returns dash for invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('-')
    })

    it('handles Date object input', () => {
      const date = new Date('2025-12-25T14:30:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    })

    it('respects MM/DD/YYYY format setting', () => {
      const settings: Partial<TenantSettings> = { date_format: 'MM/DD/YYYY' }
      const result = formatDate(testDate, settings)
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    })

    it('respects YYYY-MM-DD format setting', () => {
      const settings: Partial<TenantSettings> = { date_format: 'YYYY-MM-DD' }
      const result = formatDate(testDate, settings)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('handles invalid Date object', () => {
      const invalidDate = new Date('invalid')
      expect(formatDate(invalidDate)).toBe('-')
    })
  })

  describe('formatTime', () => {
    const testDate = '2025-12-25T14:30:00Z'

    it('formats time with default 12-hour format', () => {
      const result = formatTime(testDate)
      // Should contain AM or PM
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
    })

    it('returns dash for null', () => {
      expect(formatTime(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatTime(undefined)).toBe('-')
    })

    it('respects 24-hour format setting', () => {
      const settings: Partial<TenantSettings> = { time_format: '24-hour' }
      const result = formatTime(testDate, settings)
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('handles Date object input', () => {
      const date = new Date('2025-12-25T14:30:00Z')
      const result = formatTime(date)
      expect(result).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('formatDateTime', () => {
    const testDate = '2025-12-25T14:30:00Z'

    it('formats date and time together', () => {
      const result = formatDateTime(testDate)
      // Should contain date and time parts
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}/)
    })

    it('returns dash for null', () => {
      expect(formatDateTime(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatDateTime(undefined)).toBe('-')
    })

    it('respects date format setting', () => {
      const settings: Partial<TenantSettings> = { date_format: 'YYYY-MM-DD' }
      const result = formatDateTime(testDate, settings)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}/)
    })

    it('respects time format setting', () => {
      const settings: Partial<TenantSettings> = { time_format: '24-hour' }
      const result = formatDateTime(testDate, settings)
      expect(result).toMatch(/\d{2}:\d{2}$/)
    })

    it('respects both format settings', () => {
      const settings: Partial<TenantSettings> = {
        date_format: 'YYYY-MM-DD',
        time_format: '24-hour',
      }
      const result = formatDateTime(testDate, settings)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/)
    })
  })

  describe('formatRelativeDate', () => {
    it('returns "Today" for today\'s date', () => {
      const today = new Date()
      const result = formatRelativeDate(today.toISOString())
      expect(result).toBe('Today')
    })

    it('returns "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const result = formatRelativeDate(yesterday.toISOString())
      expect(result).toBe('Yesterday')
    })

    it('returns formatted date for older dates', () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 5)
      const result = formatRelativeDate(oldDate.toISOString())
      // Should be a formatted date, not "Today" or "Yesterday"
      expect(result).not.toBe('Today')
      expect(result).not.toBe('Yesterday')
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    })

    it('returns dash for null', () => {
      expect(formatRelativeDate(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatRelativeDate(undefined)).toBe('-')
    })
  })

  describe('formatShortDate', () => {
    it('formats date in short form', () => {
      const result = formatShortDate('2025-12-25T00:00:00Z')
      expect(result).toMatch(/[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/)
    })

    it('returns dash for null', () => {
      expect(formatShortDate(null)).toBe('-')
    })

    it('returns dash for undefined', () => {
      expect(formatShortDate(undefined)).toBe('-')
    })

    it('handles Date object input', () => {
      const date = new Date('2025-12-25T00:00:00Z')
      const result = formatShortDate(date)
      expect(result).toMatch(/[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/)
    })
  })

  describe('getCurrencyDisplay', () => {
    it('returns currency symbol from settings', () => {
      const settings: Partial<TenantSettings> = { currency: 'USD' }
      expect(getCurrencyDisplay(settings)).toBe('$')
    })

    it('returns default currency symbol when no settings', () => {
      expect(getCurrencyDisplay()).toBe('RM')
    })

    it('returns currency symbol for various currencies', () => {
      expect(getCurrencyDisplay({ currency: 'EUR' })).toBe('€')
      expect(getCurrencyDisplay({ currency: 'GBP' })).toBe('£')
      expect(getCurrencyDisplay({ currency: 'SGD' })).toBe('S$')
    })
  })

  describe('DEFAULT_TENANT_SETTINGS', () => {
    it('has correct default values', () => {
      expect(DEFAULT_TENANT_SETTINGS.currency).toBe('MYR')
      expect(DEFAULT_TENANT_SETTINGS.timezone).toBe('Asia/Kuala_Lumpur')
      expect(DEFAULT_TENANT_SETTINGS.date_format).toBe('DD/MM/YYYY')
      expect(DEFAULT_TENANT_SETTINGS.time_format).toBe('12-hour')
      expect(DEFAULT_TENANT_SETTINGS.decimal_precision).toBe('0.01')
      expect(DEFAULT_TENANT_SETTINGS.country).toBe('MY')
    })
  })

  describe('Edge Cases', () => {
    it('handles very large numbers in formatCurrency', () => {
      const result = formatCurrency(999999999999.99)
      expect(result).toBe(`RM${NBSP}999,999,999,999.99`)
    })

    it('handles empty string date', () => {
      expect(formatDate('')).toBe('-')
    })

    it('handles whitespace-only date string', () => {
      expect(formatDate('   ')).toBe('-')
    })

    it('formats midnight correctly', () => {
      const settings: Partial<TenantSettings> = {
        time_format: '24-hour',
        timezone: 'UTC',
      }
      const midnight = '2025-12-25T00:00:00Z'
      const result = formatTime(midnight, settings)
      expect(result).toBe('00:00')
    })

    it('formats noon correctly in 12-hour format', () => {
      const settings: Partial<TenantSettings> = {
        time_format: '12-hour',
        timezone: 'UTC',
      }
      const noon = '2025-12-25T12:00:00Z'
      const result = formatTime(noon, settings)
      expect(result).toMatch(/12:00\s*PM/i)
    })
  })
})
