/**
 * i18n Test Fixtures
 *
 * Locale presets and test data for Playwright E2E tests.
 * Each preset represents a complete tenant configuration with expected formatting outputs.
 */

// Non-breaking space used in currency formatting
const NBSP = '\u00A0'

/**
 * Locale preset interface
 */
export interface LocalePreset {
  name: string
  country: string
  currency: string
  timezone: string
  dateFormat: string
  timeFormat: '12-hour' | '24-hour'
  decimalPrecision: string
  // Expected formatted outputs for test verification
  expected: {
    currency1234_56: string // formatCurrency(1234.56)
    currencyNegative: string // formatCurrency(-1234.56)
    currencyZero: string // formatCurrency(0)
    number1234_567: string // formatNumber(1234.567)
    dateChristmas2025: string // formatDate('2025-12-25')
    timeNoon: RegExp // formatTime at 12:00 PM (regex for flexibility)
    timeMidnight: RegExp // formatTime at 00:00 (regex for flexibility)
  }
}

/**
 * Locale presets for testing
 */
export const LOCALE_PRESETS: Record<string, LocalePreset> = {
  US: {
    name: 'United States',
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    decimalPrecision: '0.01',
    expected: {
      currency1234_56: `$${NBSP}1,234.56`,
      currencyNegative: `$${NBSP}-1,234.56`,
      currencyZero: `$${NBSP}0.00`,
      number1234_567: '1,234.57',
      dateChristmas2025: '12/25/2025',
      timeNoon: /12:00\s*PM/i,
      timeMidnight: /12:00\s*AM/i,
    },
  },
  MY: {
    name: 'Malaysia',
    country: 'MY',
    currency: 'MYR',
    timezone: 'Asia/Kuala_Lumpur',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
    decimalPrecision: '0.01',
    expected: {
      currency1234_56: `RM${NBSP}1,234.56`,
      currencyNegative: `RM${NBSP}-1,234.56`,
      currencyZero: `RM${NBSP}0.00`,
      number1234_567: '1,234.57',
      dateChristmas2025: '25/12/2025',
      timeNoon: /12:00\s*PM/i,
      timeMidnight: /12:00\s*AM/i,
    },
  },
  JP: {
    name: 'Japan',
    country: 'JP',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24-hour',
    decimalPrecision: '1', // No decimals for JPY
    expected: {
      currency1234_56: `¥${NBSP}1,235`, // Rounded, no decimals
      currencyNegative: `¥${NBSP}-1,235`,
      currencyZero: `¥${NBSP}0`,
      number1234_567: '1,235',
      dateChristmas2025: '2025-12-25',
      timeNoon: /12:00/,
      timeMidnight: /00:00/,
    },
  },
  DE: {
    name: 'Germany',
    country: 'DE',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24-hour',
    decimalPrecision: '0.01',
    expected: {
      currency1234_56: `€${NBSP}1,234.56`,
      currencyNegative: `€${NBSP}-1,234.56`,
      currencyZero: `€${NBSP}0.00`,
      number1234_567: '1,234.57',
      dateChristmas2025: '25.12.2025',
      timeNoon: /12:00/,
      timeMidnight: /00:00/,
    },
  },
  GB: {
    name: 'United Kingdom',
    country: 'GB',
    currency: 'GBP',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    decimalPrecision: '0.01',
    expected: {
      currency1234_56: `£${NBSP}1,234.56`,
      currencyNegative: `£${NBSP}-1,234.56`,
      currencyZero: `£${NBSP}0.00`,
      number1234_567: '1,234.57',
      dateChristmas2025: '25/12/2025',
      timeNoon: /12:00/,
      timeMidnight: /00:00/,
    },
  },
  SG: {
    name: 'Singapore',
    country: 'SG',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
    decimalPrecision: '0.01',
    expected: {
      currency1234_56: `S$${NBSP}1,234.56`,
      currencyNegative: `S$${NBSP}-1,234.56`,
      currencyZero: `S$${NBSP}0.00`,
      number1234_567: '1,234.57',
      dateChristmas2025: '25/12/2025',
      timeNoon: /12:00\s*PM/i,
      timeMidnight: /12:00\s*AM/i,
    },
  },
}

/**
 * Currency symbols for quick checks
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  MYR: 'RM',
  JPY: '¥',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
}

/**
 * Date format patterns for regex matching
 */
export const DATE_FORMAT_PATTERNS: Record<string, RegExp> = {
  'MM/DD/YYYY': /\d{2}\/\d{2}\/\d{4}/,
  'DD/MM/YYYY': /\d{2}\/\d{2}\/\d{4}/,
  'YYYY-MM-DD': /\d{4}-\d{2}-\d{2}/,
  'DD.MM.YYYY': /\d{2}\.\d{2}\.\d{4}/,
  'DD-MM-YYYY': /\d{2}-\d{2}-\d{4}/,
}

/**
 * Test data for inventory items with known values
 */
export const TEST_ITEMS = {
  standardItem: {
    name: 'Test Item A',
    price: 1234.56,
    quantity: 100,
    minStock: 10,
  },
  expensiveItem: {
    name: 'Expensive Item',
    price: 99999.99,
    quantity: 5,
  },
  cheapItem: {
    name: 'Cheap Item',
    price: 0.01,
    quantity: 1000,
  },
  zeroPrice: {
    name: 'Free Item',
    price: 0,
    quantity: 50,
  },
}

/**
 * Test dates with known expected outputs
 */
export const TEST_DATES = {
  christmas2025: '2025-12-25T12:00:00Z',
  newYear2025: '2025-01-01T00:00:00Z',
  leapDay2024: '2024-02-29T15:30:00Z',
  midnightUTC: '2025-06-15T00:00:00Z',
  noonUTC: '2025-06-15T12:00:00Z',
  endOfDay: '2025-06-15T23:59:59Z',
}

/**
 * Pages to test for formatting
 */
export const PAGES_TO_TEST = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/inventory', name: 'Inventory' },
  { path: '/tasks/invoices', name: 'Invoices' },
  { path: '/settings/company', name: 'Settings' },
  { path: '/reports/stock-movement', name: 'Stock Movement Report' },
]
