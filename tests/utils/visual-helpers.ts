/**
 * Common CSS selectors for elements that should be hidden during visual tests
 * to prevent flaky snapshots
 */
export const FLAKY_SELECTORS = {
  /** Elements with dynamic timestamps */
  timestamps: [
    '[data-testid="timestamp"]',
    '.timestamp',
    'time',
    '[datetime]',
  ],

  /** Loading spinners and skeletons */
  loaders: [
    '.animate-spin',
    '.animate-pulse',
    '.skeleton',
    '[data-loading="true"]',
    '.loading',
  ],

  /** Live counters and real-time data */
  liveData: [
    '[data-live]',
    '.live-counter',
    '[data-realtime]',
  ],

  /** Carousels and auto-rotating content */
  carousels: [
    '.carousel',
    '[data-carousel]',
    '.swiper',
  ],

  /** Chat widgets and support bubbles */
  chatWidgets: [
    '#intercom-container',
    '.crisp-client',
    '[data-chat-widget]',
    '.chat-bubble',
  ],

  /** Cookie banners and notifications */
  banners: [
    '[data-cookie-banner]',
    '.cookie-consent',
    '.announcement-banner',
  ],
} as const

/**
 * Get all flaky selectors as a flat array
 */
export function getAllFlakySelectors(): string[] {
  return Object.values(FLAKY_SELECTORS).flat()
}

/**
 * Get specific flaky selector categories
 */
export function getFlakySelectors(
  ...categories: (keyof typeof FLAKY_SELECTORS)[]
): string[] {
  return categories.flatMap((cat) => FLAKY_SELECTORS[cat])
}

/**
 * Common wait times for different page types
 */
export const WAIT_TIMES = {
  /** Fast pages with minimal dynamic content */
  fast: 100,
  /** Standard pages with some animations */
  standard: 300,
  /** Heavy pages with lots of dynamic content */
  heavy: 500,
  /** Pages with complex animations */
  animated: 800,
} as const

/**
 * Base URL paths for public pages
 */
export const PUBLIC_PAGES = {
  // Main pages
  home: '/',
  demo: '/demo',
  pricing: '/pricing',

  // Auth pages
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',

  // Legal pages
  privacy: '/privacy',
  terms: '/terms',
  security: '/security',

  // Feature pages
  features: {
    barcodeScanning: '/features/barcode-scanning',
    offlineMobile: '/features/offline-mobile-scanning',
    lowStockAlerts: '/features/low-stock-alerts',
    bulkEditing: '/features/bulk-editing',
    checkInCheckOut: '/features/check-in-check-out',
  },

  // Solution pages
  solutions: {
    warehouse: '/solutions/warehouse-inventory',
    ecommerce: '/solutions/ecommerce-inventory',
    construction: '/solutions/construction-tools',
    smallBusiness: '/solutions/small-business',
    assetTracking: '/solutions/asset-tracking',
    mobileApp: '/solutions/mobile-inventory-app',
  },

  // Compare pages
  compare: {
    sortly: '/compare/sortly-alternative',
    boxhero: '/compare/boxhero-alternative',
    fishbowl: '/compare/fishbowl-alternative',
    inflow: '/compare/inflow-alternative',
  },

  // Learning pages
  learn: {
    hub: '/learn',
    integrations: '/integrations',
  },
} as const
