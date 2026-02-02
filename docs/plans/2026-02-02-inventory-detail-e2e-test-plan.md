**Status:** ✅ Implemented (2026-02-02)

# Inventory Detail Page E2E Test Plan

## Overview

E2E tests for `/inventory/[itemId]` page using Playwright with full feature coverage.

## Test File

`tests/e2e/inventory-detail.spec.ts`

---

## Test Structure

```
describe('Inventory Detail Page')
├── describe('Page Loading & Authentication')
│   ├── redirects to login when unauthenticated
│   ├── shows 404 for non-existent item
│   ├── shows 404 for item from different tenant
│   └── loads successfully with valid item
│
├── describe('Basic Item Display')
│   ├── displays item name and status badge
│   ├── displays SKU and barcode
│   ├── displays quantity and unit
│   ├── displays pricing (sell/cost/total value)
│   └── displays location/folder
│
├── describe('Quick Actions')
│   ├── increase quantity button works
│   ├── decrease quantity button works
│   └── lend button opens modal
│
├── describe('Tags Management')
│   ├── displays existing tags
│   └── can add/remove tags
│
├── describe('Tracking Modes')
│   ├── none: shows standard inventory card
│   ├── serialized: shows serial tracking card with stats
│   └── lot_expiry: shows batch tracking card with expiry
│
├── describe('Additional Sections')
│   ├── displays activity history
│   ├── displays chatter panel
│   ├── displays QR/barcode section
│   └── displays metadata footer
```

---

## Test Data Requirements

### Test Items (3 items with different tracking modes)

| Item | ID | Tracking Mode | Purpose |
|------|-----|---------------|---------|
| Test Item No Tracking | `c0accf5f-d3f5-4360-b901-93cdd2bac038` | `none` | Basic display tests |
| TBD - Serialized Item | - | `serialized` | Serial tracking card tests |
| TBD - Lot Item | - | `lot_expiry` | Batch tracking card tests |

### Test Constants

```typescript
// tests/e2e/fixtures/test-items.ts
export const TEST_ITEMS = {
  noTracking: 'c0accf5f-d3f5-4360-b901-93cdd2bac038',
  serialized: null,  // TODO: Create or identify
  lotExpiry: null,   // TODO: Create or identify
  nonExistent: '00000000-0000-0000-0000-000000000000',
}

export const TEST_USER = {
  email: 'teststarter2026@gmail.com',
}
```

---

## Test Scenarios

### 1. Authentication & Access Control

```typescript
test('redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/inventory/c0accf5f-d3f5-4360-b901-93cdd2bac038')
  await expect(page).toHaveURL(/\/login/)
})

test('shows 404 for non-existent item', async ({ page }) => {
  await loginAsTestUser(page)
  await page.goto('/inventory/00000000-0000-0000-0000-000000000000')
  await expect(page.getByText('Page not found')).toBeVisible()
})

test('shows 404 for deleted item', async ({ page }) => {
  // Navigate to item with deleted_at set
  await expect(page.getByText('Page not found')).toBeVisible()
})
```

### 2. Basic Item Display

```typescript
test('displays item header correctly', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  // Item name in heading
  await expect(page.getByRole('heading', { name: 'Test Item No Tracking' })).toBeVisible()

  // Status badge
  await expect(page.getByText('In Stock')).toBeVisible()

  // Back button
  await expect(page.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/inventory')

  // Edit button
  await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible()
})

test('displays inventory card', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  // Quantity
  await expect(page.getByText('10')).toBeVisible()
  await expect(page.getByText('pcs')).toBeVisible()

  // Min quantity
  await expect(page.getByText('Min quantity')).toBeVisible()

  // Quick action buttons
  await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeVisible()
})

test('displays pricing card', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await expect(page.getByRole('heading', { name: 'Pricing' })).toBeVisible()
  await expect(page.getByText('Selling Price')).toBeVisible()
  await expect(page.getByText('Cost Price')).toBeVisible()
  await expect(page.getByText('Total Value')).toBeVisible()
})

test('displays identifiers card', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await expect(page.getByRole('heading', { name: 'Identifiers' })).toBeVisible()
  await expect(page.getByText('SKU')).toBeVisible()
  await expect(page.getByText('Barcode')).toBeVisible()
})
```

### 3. Quick Actions

```typescript
test('quantity increase updates display', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  const initialQty = await page.locator('[data-testid="quantity-display"]').textContent()
  await page.getByRole('button', { name: 'Increase quantity' }).click()

  // Wait for update
  await page.waitForResponse(resp => resp.url().includes('inventory'))

  // Verify quantity increased
  const newQty = await page.locator('[data-testid="quantity-display"]').textContent()
  expect(parseInt(newQty)).toBe(parseInt(initialQty) + 1)
})

test('quantity decrease updates display', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  const initialQty = await page.locator('[data-testid="quantity-display"]').textContent()
  await page.getByRole('button', { name: 'Decrease quantity' }).click()

  await page.waitForResponse(resp => resp.url().includes('inventory'))

  const newQty = await page.locator('[data-testid="quantity-display"]').textContent()
  expect(parseInt(newQty)).toBe(parseInt(initialQty) - 1)
})

test('lend button opens checkout modal', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await page.getByRole('button', { name: 'Lend' }).click()

  // Modal should appear
  await expect(page.getByRole('dialog')).toBeVisible()
})
```

### 4. Tracking Modes

```typescript
describe('Tracking Mode: None', () => {
  test('shows standard inventory card without tracking section', async ({ page }) => {
    await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

    // Standard inventory card visible
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible()

    // No tracking cards
    await expect(page.locator('[data-testid="serial-tracking-card"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="batch-tracking-card"]')).not.toBeVisible()
  })
})

describe('Tracking Mode: Serialized', () => {
  test('shows serial tracking card with stats', async ({ page }) => {
    await page.goto(`/inventory/${TEST_ITEMS.serialized}`)

    // Serial tracking card visible
    await expect(page.getByRole('heading', { name: /Serial/i })).toBeVisible()

    // Stats displayed
    await expect(page.getByText(/Available/i)).toBeVisible()
    await expect(page.getByText(/Checked Out/i)).toBeVisible()
  })
})

describe('Tracking Mode: Lot/Expiry', () => {
  test('shows batch tracking card with expiry info', async ({ page }) => {
    await page.goto(`/inventory/${TEST_ITEMS.lotExpiry}`)

    // Batch tracking card visible
    await expect(page.getByRole('heading', { name: /Batch|Lot/i })).toBeVisible()

    // Expiry info displayed
    await expect(page.getByText(/Active/i)).toBeVisible()
  })
})
```

### 5. Additional Sections

```typescript
test('displays activity history', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'View All' })).toBeVisible()
})

test('displays tags section', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible()
})

test('displays chatter panel', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await expect(page.getByRole('heading', { name: 'Chatter' })).toBeVisible()
  await expect(page.getByPlaceholder(/Write a message/i)).toBeVisible()
})

test('displays QR/barcode section', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await expect(page.getByRole('heading', { name: 'QR & Barcode' })).toBeVisible()
})

test('displays metadata footer', async ({ page }) => {
  await page.goto(`/inventory/${TEST_ITEMS.noTracking}`)

  await expect(page.getByText(/Created:/)).toBeVisible()
  await expect(page.getByText(/Updated:/)).toBeVisible()
  await expect(page.getByText(/ID:/)).toBeVisible()
})
```

---

## Test Setup

### Authentication Fixture

```typescript
// tests/e2e/fixtures/auth.ts
import { Page } from '@playwright/test'

export async function loginAsTestUser(page: Page) {
  await page.goto('/login')
  await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!)
  await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}
```

### Page Object (Optional)

```typescript
// tests/e2e/pages/inventory-detail.page.ts
import { Page, expect } from '@playwright/test'

export class InventoryDetailPage {
  constructor(private page: Page) {}

  async goto(itemId: string) {
    await this.page.goto(`/inventory/${itemId}`)
  }

  async getItemName() {
    return this.page.getByRole('heading', { level: 1 }).textContent()
  }

  async getQuantity() {
    return this.page.locator('[data-testid="quantity-display"]').textContent()
  }

  async increaseQuantity() {
    await this.page.getByRole('button', { name: 'Increase quantity' }).click()
  }

  async decreaseQuantity() {
    await this.page.getByRole('button', { name: 'Decrease quantity' }).click()
  }

  async openLendModal() {
    await this.page.getByRole('button', { name: 'Lend' }).click()
    await expect(this.page.getByRole('dialog')).toBeVisible()
  }
}
```

---

## Environment Variables

```bash
# .env.test
TEST_USER_EMAIL=teststarter2026@gmail.com
TEST_USER_PASSWORD=<secure-password>
```

---

## Run Configuration

Add to `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'inventory-detail',
    testMatch: '**/inventory-detail.spec.ts',
    use: {
      baseURL: 'http://localhost:3000',
    },
  },
]
```

---

## Implementation Checklist

- [ ] Create test file `tests/e2e/inventory-detail.spec.ts`
- [ ] Create auth fixture `tests/e2e/fixtures/auth.ts`
- [ ] Create test items fixture `tests/e2e/fixtures/test-items.ts`
- [ ] Create/identify serialized tracking test item
- [ ] Create/identify lot_expiry tracking test item
- [ ] Add data-testid attributes to components (quantity display, tracking cards)
- [ ] Configure environment variables for test user
- [ ] Run tests and fix any failures
