import { test as base, Page } from '@playwright/test'
import percySnapshot from '@percy/playwright'

/**
 * Viewport configurations for visual regression testing
 */
export const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const

export type ViewportName = keyof typeof VIEWPORTS

/**
 * Options for Percy snapshots
 */
export interface PercySnapshotOptions {
  /** Name suffix for the snapshot */
  name?: string
  /** Specific viewports to capture (defaults to all) */
  viewports?: ViewportName[]
  /** CSS selectors to hide (for flaky elements like timestamps) */
  hideSelectors?: string[]
  /** Wait for specific selector before snapshot */
  waitForSelector?: string
  /** Additional wait time in ms after page load */
  additionalWait?: number
}

/**
 * Extended test fixture with Percy helpers
 */
export const test = base.extend<{
  /**
   * Take Percy snapshots at multiple viewports
   */
  percySnapshots: (
    page: Page,
    baseName: string,
    options?: PercySnapshotOptions
  ) => Promise<void>

  /**
   * Prepare page for visual testing (hide flaky elements, wait for stability)
   */
  prepareForVisualTest: (
    page: Page,
    options?: Omit<PercySnapshotOptions, 'name' | 'viewports'>
  ) => Promise<void>
}>({
  percySnapshots: async ({}, use) => {
    const takeSnapshots = async (
      page: Page,
      baseName: string,
      options: PercySnapshotOptions = {}
    ) => {
      const {
        viewports = ['desktop', 'tablet', 'mobile'],
        hideSelectors = [],
        waitForSelector,
        additionalWait = 0,
      } = options

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')

      // Wait for specific selector if provided
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { state: 'visible' })
      }

      // Additional wait for animations to settle
      if (additionalWait > 0) {
        await page.waitForTimeout(additionalWait)
      }

      // Hide flaky elements via CSS injection
      if (hideSelectors.length > 0) {
        await page.addStyleTag({
          content: `${hideSelectors.join(', ')} { visibility: hidden !important; }`,
        })
      }

      // Take snapshots at each viewport
      for (const viewportName of viewports) {
        const viewport = VIEWPORTS[viewportName]
        await page.setViewportSize(viewport)

        // Wait for layout to stabilize after viewport change
        await page.waitForTimeout(300)

        const snapshotName = `${baseName} - ${viewportName}`
        await percySnapshot(page, snapshotName, {
          widths: [viewport.width],
        })
      }
    }

    await use(takeSnapshots)
  },

  prepareForVisualTest: async ({}, use) => {
    const prepare = async (
      page: Page,
      options: Omit<PercySnapshotOptions, 'name' | 'viewports'> = {}
    ) => {
      const { hideSelectors = [], waitForSelector, additionalWait = 0 } = options

      // Disable CSS animations and transitions for consistent screenshots
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      })

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')

      // Wait for specific selector if provided
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { state: 'visible' })
      }

      // Hide flaky elements
      if (hideSelectors.length > 0) {
        await page.addStyleTag({
          content: `${hideSelectors.join(', ')} { visibility: hidden !important; }`,
        })
      }

      // Additional wait
      if (additionalWait > 0) {
        await page.waitForTimeout(additionalWait)
      }
    }

    await use(prepare)
  },
})

export { expect } from '@playwright/test'
