/**
 * Visual Regression Tests with Percy
 *
 * This module exports all fixtures and utilities for visual testing.
 *
 * Usage:
 *   import { test, expect, VIEWPORTS } from '../index'
 *
 * Running tests:
 *   npm run test:visual           - Run visual tests locally (no Percy)
 *   npm run test:visual:percy     - Run with Percy snapshots
 *   npm run test:visual:update    - Update local snapshots
 */

export { test, expect, VIEWPORTS, type ViewportName, type PercySnapshotOptions } from './fixtures/percy.fixture'
export {
  FLAKY_SELECTORS,
  getAllFlakySelectors,
  getFlakySelectors,
  WAIT_TIMES,
  PUBLIC_PAGES,
} from './utils/visual-helpers'
