# Serial/Lot Tracking E2E Test Plan

## Overview

Comprehensive Playwright E2E test suite for the serial/lot tracking feature across the order-to-cash workflow:
**Pick List Tracking Selection → Delivery Order Inheritance → Dispatch Inventory Updates**

### Goals
- Verify lot/serial tracking UI renders correctly and allows allocation
- Validate auto-assign FEFO (lots) and FIFO (serials) functionality
- Confirm tracking data flows from Pick List → Delivery Order
- Test inventory updates on dispatch (lot quantity decrements, serial status changes)
- Verify validation errors for over-allocation and unavailable serials

---

## Test Architecture

```
e2e/
└── order-to-cash/
    └── tracking/
        ├── lot-tracking.spec.ts           # Lot allocation UI & workflow
        ├── serial-tracking.spec.ts        # Serial allocation UI & workflow
        ├── auto-assign.spec.ts            # FEFO/FIFO auto-assignment
        ├── tracking-inheritance.spec.ts   # PL → DO tracking copy
        ├── inventory-updates.spec.ts      # Dispatch inventory effects
        └── validation.spec.ts             # Over-allocation & status errors
```

**Test Runner**: Playwright
**Database**: Local Supabase via `supabase start`
**Auth**: Uses existing `.playwright/.auth/user.json` from setup project
**Isolation**: Tests use unique item/lot/serial names with timestamps

---

## Test Data Setup

### Prerequisites (seeded via setup helper or beforeAll)

```typescript
// e2e/order-to-cash/tracking/tracking-fixtures.ts

interface TrackingTestData {
  // Items with tracking enabled
  lotTrackedItem: { id: string; name: string; sku: string }
  serialTrackedItem: { id: string; name: string; sku: string }
  nonTrackedItem: { id: string; name: string; sku: string }

  // Lots for lot-tracked item (sorted by expiry for FEFO testing)
  lots: Array<{
    id: string
    lot_number: string
    expiry_date: string
    quantity: number
  }>

  // Serials for serial-tracked item (sorted by created_at for FIFO testing)
  serials: Array<{
    id: string
    serial_number: string
    status: 'available' | 'sold' | 'checked_out'
  }>

  // Sales order with all item types
  salesOrder: { id: string; display_id: string }
  pickList: { id: string; display_id: string }
}

async function setupTrackingTestData(): Promise<TrackingTestData> {
  // Creates items, lots, serials, SO, and PL for testing
}

async function cleanupTrackingTestData(data: TrackingTestData): Promise<void> {
  // Deletes test data via cascade delete
}
```

### Fixture Data Specification

**Lot-Tracked Item Setup:**
- Item: `Test Lot Item [timestamp]` with `tracking_type: 'lot'`
- 3 lots with different expiry dates:
  - Lot A: expiry 7 days from now, qty 50 (should be picked first in FEFO)
  - Lot B: expiry 30 days from now, qty 100
  - Lot C: no expiry, qty 200

**Serial-Tracked Item Setup:**
- Item: `Test Serial Item [timestamp]` with `tracking_type: 'serial'`
- 10 serials with staggered `created_at`:
  - SN-001 to SN-005: status `available` (created oldest to newest)
  - SN-006 to SN-008: status `available`
  - SN-009: status `sold` (should be rejected)
  - SN-010: status `checked_out` (should be rejected)

---

## Test Suites

### 1. Lot Tracking UI Tests (`lot-tracking.spec.ts`)

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| LT-01 | Display lot tracking section | Pick list item with tracking_type='lot' shows expandable tracking section |
| LT-02 | Expand lot allocation table | Clicking expands to show available lots table with columns: Lot #, Expiry, Available, Allocate |
| LT-03 | Show FEFO sorted lots | Lots displayed in FEFO order (earliest expiry first, nulls last) |
| LT-04 | Enter lot quantity | User can type allocation quantity in input field |
| LT-05 | Prevent over-allocation | Entering qty > available shows error on save |
| LT-06 | Show allocation progress | Header shows "X / Y" with status badge (Pending/Assigned) |
| LT-07 | Save lot allocations | Click "Save Allocations" persists to database |
| LT-08 | Show expiry warnings | Lots expiring within 30 days show "Expiring soon" badge |
| LT-09 | Show expired badge | Expired lots show "Expired" badge with red styling |
| LT-10 | Non-tracked items hidden | Items with tracking_type='none' don't show tracking section |

```typescript
test.describe('Lot Tracking UI', () => {
  test('LT-01: should display lot tracking section for lot-tracked items', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Find the lot-tracked item row
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.lotTrackedItem.name })

    // Should show "Lot" badge
    await expect(trackingSection.getByText('Lot')).toBeVisible()

    // Should show allocation progress
    await expect(trackingSection.getByText(/\d+ \/ \d+/)).toBeVisible()

    // Should be expandable
    const expandButton = trackingSection.locator('button').first()
    await expect(expandButton).toBeVisible()
  })

  test('LT-02: should expand to show lot allocation table', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand tracking section
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.lotTrackedItem.name })
    await trackingSection.click()

    // Should show table with correct headers
    await expect(page.getByRole('columnheader', { name: 'Lot #' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Expiry' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Available' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Allocate' })).toBeVisible()

    // Should show all 3 lots
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(3)
  })

  test('LT-05: should prevent over-allocation of lots', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand and try to allocate more than available
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.lotTrackedItem.name })
    await trackingSection.click()

    // Find first lot input (qty available = 50) and enter 100
    const firstLotInput = page.locator('input[type="number"]').first()
    await firstLotInput.fill('100')

    // Click save
    await page.getByRole('button', { name: 'Save Allocations' }).click()

    // Should show error message
    await expect(page.getByText(/cannot allocate.*only.*available/i)).toBeVisible()
  })
})
```

### 2. Serial Tracking UI Tests (`serial-tracking.spec.ts`)

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| ST-01 | Display serial tracking section | Pick list item with tracking_type='serial' shows expandable tracking section |
| ST-02 | Expand serial checkbox list | Clicking expands to show checkbox list of available serials |
| ST-03 | Search serials | Search input filters serial list |
| ST-04 | Select serial checkboxes | Clicking checkbox adds serial to selection |
| ST-05 | Limit selection to requested | Cannot select more serials than requested quantity |
| ST-06 | Save serial allocations | Click "Save Allocations" persists to database |
| ST-07 | Show selected count | Header shows "X / Y" with count of selected serials |
| ST-08 | Only show available serials | Serials with status != 'available' not shown in list |

```typescript
test.describe('Serial Tracking UI', () => {
  test('ST-01: should display serial tracking section for serial-tracked items', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Find the serial-tracked item row
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.serialTrackedItem.name })

    // Should show "Serial" badge
    await expect(trackingSection.getByText('Serial')).toBeVisible()
  })

  test('ST-05: should limit serial selection to requested quantity', async ({ page }) => {
    // Assume requested quantity is 5
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand serial tracking
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.serialTrackedItem.name })
    await trackingSection.click()

    // Select 5 serials
    const checkboxes = page.locator('input[type="checkbox"]')
    for (let i = 0; i < 5; i++) {
      await checkboxes.nth(i).check()
    }

    // 6th checkbox should be disabled
    await expect(checkboxes.nth(5)).toBeDisabled()
  })
})
```

### 3. Auto-Assign Tests (`auto-assign.spec.ts`)

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| AA-01 | Auto-assign lots FEFO | Click "Auto-assign FEFO" allocates from earliest expiry lots first |
| AA-02 | Auto-assign serials FIFO | Click "Auto-assign FIFO" selects oldest created serials first |
| AA-03 | Partial lot FEFO | When first lot insufficient, continues to next in FEFO order |
| AA-04 | Show success status | After auto-assign, allocation status shows "Assigned" |
| AA-05 | No available lots error | Auto-assign on item with no lots shows error message |
| AA-06 | No available serials error | Auto-assign on item with no serials shows error message |

```typescript
test.describe('Auto-Assign', () => {
  test('AA-01: should auto-assign lots using FEFO strategy', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand lot tracking
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.lotTrackedItem.name })
    await trackingSection.click()

    // Click auto-assign
    await page.getByRole('button', { name: /auto-assign fefo/i }).click()

    // Wait for save to complete
    await expect(page.getByRole('button', { name: /auto-assign/i })).not.toBeDisabled()

    // First lot (earliest expiry) should be fully allocated
    const firstLotInput = page.locator('input[type="number"]').first()
    await expect(firstLotInput).toHaveValue('50') // Full qty of lot A

    // Status should show Assigned
    await expect(trackingSection.getByText('Assigned')).toBeVisible()
  })

  test('AA-02: should auto-assign serials using FIFO strategy', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand serial tracking
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.serialTrackedItem.name })
    await trackingSection.click()

    // Click auto-assign
    await page.getByRole('button', { name: /auto-assign fifo/i }).click()

    // Wait for save to complete
    await expect(page.getByRole('button', { name: /auto-assign/i })).not.toBeDisabled()

    // Oldest serials (SN-001 to SN-005) should be selected
    const checkboxes = page.locator('input[type="checkbox"]')
    for (let i = 0; i < 5; i++) {
      await expect(checkboxes.nth(i)).toBeChecked()
    }
  })
})
```

### 4. Tracking Inheritance Tests (`tracking-inheritance.spec.ts`)

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| TI-01 | Copy lots to DO | Creating DO from Pick List copies lot allocations to delivery_order_item_lots |
| TI-02 | Copy serials to DO | Creating DO from Pick List copies serial allocations to delivery_order_item_serials |
| TI-03 | Display inherited lots on DO | DO detail page shows lots from Pick List in read-only view |
| TI-04 | Display inherited serials on DO | DO detail page shows serials from Pick List in read-only view |
| TI-05 | No tracking column for non-tracked | DO items without tracking show "-" in tracking column |

```typescript
test.describe('Tracking Inheritance', () => {
  test('TI-01: should copy lot allocations when creating DO from Pick List', async ({ page }) => {
    // First allocate lots on pick list
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand and auto-assign lots
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.lotTrackedItem.name })
    await trackingSection.click()
    await page.getByRole('button', { name: /auto-assign fefo/i }).click()
    await page.waitForTimeout(1000) // Wait for save

    // Complete pick list status to allow DO creation
    // (status change logic may vary)

    // Create delivery order from pick list
    await page.getByRole('button', { name: /create delivery/i }).click()
    await page.waitForLoadState('networkidle')

    // Should navigate to DO detail
    await expect(page.getByText(/DO-/)).toBeVisible()

    // Should show inherited lot tracking
    const doTrackingSection = page.locator('[data-testid="tracking-display"]')
      .filter({ hasText: testData.lotTrackedItem.name })
    await expect(doTrackingSection).toBeVisible()

    // Should show lot number from Pick List
    await expect(doTrackingSection.getByText(testData.lots[0].lot_number)).toBeVisible()
  })
})
```

### 5. Inventory Update Tests (`inventory-updates.spec.ts`)

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| IU-01 | Decrement lot qty on dispatch | Dispatching DO decrements lots.quantity for allocated lots |
| IU-02 | Update serial status on dispatch | Dispatching DO changes serial_numbers.status to 'sold' |
| IU-03 | Multiple lots decrement | Multiple lot allocations all decrement correctly |
| IU-04 | Partial lot decrement | Lot with qty 100, allocate 30 → qty becomes 70 |
| IU-05 | Log activity on dispatch | Activity log records dispatch with tracking details |

```typescript
test.describe('Inventory Updates on Dispatch', () => {
  test('IU-01: should decrement lot quantity when DO is dispatched', async ({ page }) => {
    // Setup: Create DO with lot allocations
    // ... (from TI-01 setup)

    // Get initial lot quantity (via API or page inspection)
    const initialQty = testData.lots[0].quantity // 50

    // Dispatch the delivery order
    await page.getByRole('button', { name: /dispatch/i }).click()
    await page.getByRole('button', { name: /confirm/i }).click()
    await page.waitForLoadState('networkidle')

    // Verify status changed to dispatched
    await expect(page.getByText('Dispatched')).toBeVisible()

    // Verify lot quantity decremented (check via inventory page or API)
    await page.goto('/inventory')
    await page.getByPlaceholder('Search').fill(testData.lotTrackedItem.name)
    await page.locator(`tr:has-text("${testData.lotTrackedItem.name}")`).click()

    // Navigate to lots tab
    await page.getByRole('tab', { name: 'Lots' }).click()

    // First lot should have reduced quantity
    const lotRow = page.locator('tr').filter({ hasText: testData.lots[0].lot_number })
    await expect(lotRow.getByText('0')).toBeVisible() // Was 50, allocated 50
  })

  test('IU-02: should update serial status to sold when DO is dispatched', async ({ page }) => {
    // ... similar setup for serial-tracked item

    // Dispatch
    await page.getByRole('button', { name: /dispatch/i }).click()
    await page.getByRole('button', { name: /confirm/i }).click()

    // Verify serial status changed
    await page.goto('/inventory')
    await page.getByPlaceholder('Search').fill(testData.serialTrackedItem.name)
    await page.locator(`tr:has-text("${testData.serialTrackedItem.name}")`).click()
    await page.getByRole('tab', { name: 'Serials' }).click()

    // First 5 serials should show "sold" status
    for (const serial of testData.serials.slice(0, 5)) {
      const serialRow = page.locator('tr').filter({ hasText: serial.serial_number })
      await expect(serialRow.getByText('sold')).toBeVisible()
    }
  })
})
```

### 6. Validation Tests (`validation.spec.ts`)

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| V-01 | Over-allocation error | Allocating more than available shows specific error message |
| V-02 | Unavailable serial error | Trying to allocate sold/checked_out serial shows error |
| V-03 | Expired lot warning | Allocating from expired lot shows warning (not blocking) |
| V-04 | Inactive lot blocked | Cannot allocate from lot with status != 'active' |
| V-05 | Cross-tenant prevention | Cannot see/allocate lots/serials from other tenants |

```typescript
test.describe('Validation', () => {
  test('V-01: should show error when over-allocating lot', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand lot tracking
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.lotTrackedItem.name })
    await trackingSection.click()

    // Enter quantity exceeding available (lot A has 50)
    const firstLotInput = page.locator('input[type="number"]').first()
    await firstLotInput.fill('100')

    // Save
    await page.getByRole('button', { name: 'Save Allocations' }).click()

    // Should show specific error
    await expect(page.getByText(/cannot allocate 100.*only 50 available/i)).toBeVisible()
  })

  test('V-02: should not show unavailable serials in selection list', async ({ page }) => {
    await page.goto(`/tasks/pick-lists/${testData.pickList.id}`)
    await page.waitForLoadState('networkidle')

    // Expand serial tracking
    const trackingSection = page.locator('[data-testid="tracking-section"]')
      .filter({ hasText: testData.serialTrackedItem.name })
    await trackingSection.click()

    // Search for sold serial
    await page.getByPlaceholder('Search serials').fill('SN-009')

    // Should not find it (status = 'sold')
    await expect(page.getByText('No serials match your search')).toBeVisible()
  })
})
```

---

## Test Execution

### NPM Scripts

```json
{
  "scripts": {
    "test:e2e:tracking": "playwright test e2e/order-to-cash/tracking",
    "test:e2e:tracking:ui": "playwright test e2e/order-to-cash/tracking --ui",
    "test:e2e:tracking:headed": "playwright test e2e/order-to-cash/tracking --headed"
  }
}
```

### Execution Order

1. **Setup tests first** - Seed test data in `beforeAll`
2. **UI tests** - Verify rendering and interactions
3. **Auto-assign tests** - Test FEFO/FIFO algorithms
4. **Inheritance tests** - Test PL → DO data flow
5. **Inventory update tests** - Test dispatch side effects
6. **Validation tests** - Test error handling

### CI Configuration

```yaml
# In existing playwright CI workflow
- name: Run tracking E2E tests
  run: |
    supabase start
    npx playwright test e2e/order-to-cash/tracking --reporter=html
    supabase stop
```

---

## Coverage Summary

| Suite | Test File | Est. Tests |
|-------|-----------|------------|
| Lot UI | lot-tracking.spec.ts | ~10 |
| Serial UI | serial-tracking.spec.ts | ~8 |
| Auto-Assign | auto-assign.spec.ts | ~6 |
| Inheritance | tracking-inheritance.spec.ts | ~5 |
| Inventory | inventory-updates.spec.ts | ~5 |
| Validation | validation.spec.ts | ~5 |
| **Total** | | **~39 tests** |

---

## Implementation Checklist

- [ ] Create `e2e/order-to-cash/tracking/` directory
- [ ] Create `tracking-fixtures.ts` with setup/teardown helpers
- [ ] Add data-testid attributes to tracking components for reliable selectors
- [ ] Implement `lot-tracking.spec.ts`
- [ ] Implement `serial-tracking.spec.ts`
- [ ] Implement `auto-assign.spec.ts`
- [ ] Implement `tracking-inheritance.spec.ts`
- [ ] Implement `inventory-updates.spec.ts`
- [ ] Implement `validation.spec.ts`
- [ ] Add npm scripts to package.json
- [ ] Update CI workflow for tracking tests
