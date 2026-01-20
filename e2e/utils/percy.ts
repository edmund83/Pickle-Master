import { Page } from '@playwright/test'
import percySnapshot from '@percy/playwright'

/**
 * Percy snapshot configuration for e2e tests
 * - Widths: 1280 (desktop), 768 (tablet), 375 (mobile)
 * - Disables animations and transitions
 * - Hides dynamic elements
 */

// Standard viewports for Percy snapshots
export const PERCY_WIDTHS = [1280, 768, 375]

// Selectors to hide dynamic content that causes flaky snapshots
export const DYNAMIC_SELECTORS = [
  // Timestamps and dates
  '[data-testid="timestamp"]',
  '[data-testid="date"]',
  'time',
  '.timestamp',
  '.date-time',
  '[class*="time-ago"]',

  // User avatars and profile images
  '[data-testid="avatar"]',
  '[data-testid="user-avatar"]',
  '.avatar',
  '[class*="avatar"]',
  'img[alt*="avatar"]',
  'img[alt*="profile"]',

  // Random IDs and dynamic counters
  '[data-testid="random-id"]',
  '[data-testid="count"]',
  '[data-testid="badge-count"]',
  '.notification-badge',

  // Loading states and spinners
  '[data-testid="loading"]',
  '.loading',
  '.spinner',
  '[class*="skeleton"]',

  // Real-time indicators
  '[data-testid="sync-status"]',
  '[data-testid="last-updated"]',
  '.realtime-indicator',
  '.online-status',

  // Session-specific data
  '[data-testid="session-id"]',
  '[data-testid="user-name"]',
]

/**
 * CSS to disable animations and transitions for consistent snapshots
 */
export const DISABLE_ANIMATIONS_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`

/**
 * CSS to hide dynamic elements
 */
export function getHideDynamicCSS(additionalSelectors: string[] = []): string {
  const allSelectors = [...DYNAMIC_SELECTORS, ...additionalSelectors]
  return `${allSelectors.join(', ')} { visibility: hidden !important; opacity: 0 !important; }`
}

/**
 * Prepare page for Percy snapshot by disabling animations and hiding dynamic elements
 */
export async function preparePageForSnapshot(
  page: Page,
  additionalSelectorsToHide: string[] = []
): Promise<void> {
  // Disable animations and transitions
  await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS })

  // Hide dynamic elements
  await page.addStyleTag({ content: getHideDynamicCSS(additionalSelectorsToHide) })

  // Wait for page to stabilize
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
}

/**
 * Take a Percy snapshot with standard configuration
 * @param page - Playwright page object
 * @param name - Snapshot name (should be descriptive)
 * @param options - Optional configuration
 */
export async function takePercySnapshot(
  page: Page,
  name: string,
  options: {
    widths?: number[]
    additionalSelectorsToHide?: string[]
    skipPreparation?: boolean
  } = {}
): Promise<void> {
  const {
    widths = PERCY_WIDTHS,
    additionalSelectorsToHide = [],
    skipPreparation = false,
  } = options

  // Prepare page if not already done
  if (!skipPreparation) {
    await preparePageForSnapshot(page, additionalSelectorsToHide)
  }

  // Take Percy snapshot at all configured widths
  await percySnapshot(page, name, { widths })
}

/**
 * Take Percy snapshot at the end of a test (for final state capture)
 * Use this when you want to capture the result of a test action
 */
export async function captureTestResult(
  page: Page,
  testName: string,
  state: string
): Promise<void> {
  await takePercySnapshot(page, `${testName} - ${state}`)
}
