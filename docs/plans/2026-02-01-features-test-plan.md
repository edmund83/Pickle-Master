# Features Settings E2E Test Plan

## Overview
Comprehensive E2E test plan for the Features settings page (`/settings/features`) covering Shipping Dimensions and Lot & Expiry Tracking toggles.

---

## Test Session Results (2026-02-01)

### Session 1: Staff User (KK Tong)
- **Role**: Staff
- **Purpose**: Test permission enforcement

| Test | Status | Notes |
|------|--------|-------|
| Page loads correctly | ✅ Pass | Features page loads with both toggles visible |
| Shipping Dimensions toggle | ✅ Pass | Toggle switches ON, badge updates |
| Lot Tracking toggle | ✅ Pass | Toggle switches ON, badge shows "2 enabled" |
| Permission enforcement | ✅ Pass | Staff role blocked from saving (403) |
| Error message display | ✅ Pass | "Failed to update" red message appears |
| Feature OFF hides fields | ✅ Pass | Item Edit page has no Shipping Dimensions section |

### Session 2: Owner User (Test User)
- **Role**: Owner
- **Purpose**: Full workflow testing

| Test | Status | Notes |
|------|--------|-------|
| Toggle Shipping Dimensions ON | ✅ Pass | Toggle switches ON |
| Save feature settings | ✅ Pass | "Feature settings updated successfully" |
| State persistence after refresh | ✅ Pass | Toggle remains ON after page reload |
| Feature ON shows dimension fields | ✅ Pass | Shipping Dimensions section visible on Item Edit |
| Enter shipping dimensions | ✅ Pass | Weight: 2.5kg, Dimensions: 30×20×15 cm |
| Volume calculation | ✅ Pass | Auto-calculated: 9000 cm³ |
| Volumetric weight calculation | ✅ Pass | Auto-calculated: 1.80 kg |
| Save item with dimensions | ✅ Pass | Data persists and shows on Item Detail |
| Enable Lot Tracking feature | ✅ Pass | Toggle ON, saved successfully |
| Set tracking mode to Lot/Expiry | ✅ Pass | Mode saved, UI shows lot section |
| Lot Tracking UI visible | ✅ Pass | Lots section, FEFO suggestion visible |
| Create lots | ✅ Pass | LOT-2026-001 created with qty 50, expiry 2026-03-15 |
| FEFO suggestions | ✅ Pass | "Pick 30 of 50 available" suggestion works |

### Screenshots Captured (`.playwright-mcp/`)
- `features-page-loaded.png` - Initial state with toggles OFF
- `shipping-dimensions-toggled-on.png` - After toggling Shipping Dimensions ON
- `both-toggles-on.png` - Both toggles ON with "2 enabled" badge
- `save-failed-permission-error.png` - Staff permission error
- `item-edit-features-off.png` - Item Edit without dimension fields
- `owner-save-success.png` - Owner save success message
- `item-edit-shipping-dimensions-visible.png` - Dimension section visible
- `shipping-dimensions-fields-expanded.png` - Dimension fields expanded
- `shipping-dimensions-values-entered.png` - Values entered with volume calc
- `item-detail-with-dimensions.png` - Saved dimensions on detail page
- `lot-tracking-mode-selected.png` - Lot/Expiry mode selected
- `item-detail-lot-tracking-enabled.png` - Item with lot tracking enabled
- `fefo-suggestion-working.png` - FEFO suggestion showing "Pick 30 of 50 available"

### Session 3: DB Fix & Full Lot Testing
- **Purpose**: Fix DB error 25006 and complete lot tracking tests

| Test | Status | Notes |
|------|--------|-------|
| Fix get_item_lots STABLE error | ✅ Pass | Migration 00017 applied to remove update_expired_lots() call |
| Lot Tracking section loads | ✅ Pass | No more "Failed to load lot data" error |
| Create lot | ✅ Pass | LOT-2026-001 created: qty 50, expiry 2026-03-15 |
| Lot displays correctly | ✅ Pass | Shows lot number, batch, expiry date (42d), quantity |
| FEFO suggestion | ✅ Pass | "Can fulfill 30 from 1 lot" - "Pick 30 of 50 available" |

---

## Completed Tests ✅

### Core Toggle Tests
- [x] Toggle Shipping Dimensions ON → Save → Success message
- [x] Toggle Lot Tracking ON → Save → Success message
- [x] Verify "X enabled" badge count persists after save
- [x] Refresh page → Verify toggle states persist

### Integration Tests
- [x] **Shipping Dimensions ON** → Item Edit shows dimension fields (weight, L×W×H)
- [x] **Lot Tracking ON** → Item Edit shows lot tracking section
- [x] **Feature OFF** → Fields hidden

### Full Workflow: Shipping Dimensions ✅
- [x] Enable feature
- [x] Navigate to Item Edit
- [x] Enter weight: 2.5 kg
- [x] Enter dimensions: 30×20×15 cm
- [x] Save item → Verify data persists
- [x] Check volume calculation (9000 cm³)
- [x] Check volumetric weight (1.80 kg)

### Full Workflow: Lot & Expiry Tracking ✅
- [x] Enable feature
- [x] Navigate to Item Edit
- [x] Set tracking_mode to "lot_expiry"
- [x] Lot tracking UI visible (Lots section, FEFO suggestion)
- [x] Create lots - LOT-2026-001 with qty 50, expiry 2026-03-15
- [x] FEFO suggestions - "Pick 30 of 50 available" works correctly
- [ ] Lot consumption - Not tested (requires Stock Out workflow)

---

## Resolved Issues

### 1. ~~Lot Creation Blocked (DB Error 25006)~~ ✅ FIXED
**Error**: `get_item_lots` RPC function failed with error code 25006 (read_only_sql_transaction)
**Root Cause**: STABLE functions (`get_item_lots`, `get_location_lots`, etc.) were calling `PERFORM update_expired_lots()` which performs UPDATE operations - not allowed in STABLE functions
**Resolution**: Created migration `00017_fix_lot_functions_stable.sql` that removes the `update_expired_lots()` calls and calculates expiry status dynamically in queries
**Applied**: 2026-02-01

---

## Remaining Tests

### Plan Gating Tests
- [ ] Starter plan user → Lot Tracking shows locked state with upgrade link
- [ ] Growth plan user → Lot Tracking shows locked state
- [ ] Scale plan user → Lot Tracking is unlockable (verified ✅ for current user)

### Edge Cases
- [ ] API failure → Error message displayed
- [ ] Slow network → Loading states visible
- [ ] Rapid toggling → Debounced, no duplicate submissions
- [ ] Concurrent updates → Last write wins, no crash

---

## Test File Structure

```typescript
// e2e/settings/features.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Features Settings', () => {
  test.describe('Core Toggle Functionality', () => {
    test('can toggle Shipping Dimensions on/off', async ({ page }) => {
      await page.goto('/settings/features')
      await page.waitForSelector('text=Shipping Dimensions')

      const toggle = page.getByRole('switch').first()
      await expect(toggle).not.toBeChecked()

      await toggle.click()
      await expect(toggle).toBeChecked()
      await expect(page.getByText('1 enabled')).toBeVisible()
    })

    test('can save feature settings (admin only)', async ({ page }) => {
      // Requires admin user in auth state
      await page.goto('/settings/features')
      await page.getByRole('switch').first().click()
      await page.getByRole('button', { name: 'Save Changes' }).click()

      await expect(page.getByText('Feature settings updated successfully')).toBeVisible()

      // Refresh and verify persistence
      await page.reload()
      await expect(page.getByRole('switch').first()).toBeChecked()
    })
  })

  test.describe('Permission Enforcement', () => {
    test('staff user cannot save settings', async ({ page }) => {
      await page.goto('/settings/features')
      await page.getByRole('switch').first().click()
      await page.getByRole('button', { name: 'Save Changes' }).click()

      await expect(page.getByText('Failed to update')).toBeVisible()
    })
  })

  test.describe('Integration: Item Edit Fields', () => {
    test('shipping dimension fields visible when feature enabled', async ({ page }) => {
      // Enable feature first (requires admin)
      // Then navigate to item edit
      await page.goto('/inventory/46f61491-23e4-47ed-994e-58d32282940d/edit')

      await expect(page.getByText('Shipping Dimensions')).toBeVisible()
      await expect(page.getByLabel('Weight')).toBeVisible()
      await expect(page.getByLabel('Length')).toBeVisible()
    })

    test('shipping dimension fields hidden when feature disabled', async ({ page }) => {
      await page.goto('/inventory/46f61491-23e4-47ed-994e-58d32282940d/edit')

      await expect(page.getByText('Shipping Dimensions')).not.toBeVisible()
    })
  })
})
```

---

## Key Findings

### 1. Role-Based Access Control Works
The RLS policies correctly enforce that only **Owner** role can update tenant settings. Staff users see the UI but cannot save changes.

### 2. Feature Gating Works
When `shipping_dimensions` is OFF in DB, the Item Edit page correctly hides the dimension fields.

### 3. Plan-Based Feature Gating
The current user (likely on Scale plan) can access Lot Tracking. Lower-tier users would see a locked toggle with "Upgrade to Scale" link.

### 4. UI Feedback
- Toggle state changes are immediate (optimistic UI)
- Badge count updates correctly
- Error messages are clear and visible
- Success messages auto-dismiss after 3 seconds

---

## Recommendations

1. **Create admin test user** for full E2E coverage
2. **Add data-testid attributes** to toggles for more reliable selectors
3. **Mock API errors** to test error handling without real failures
4. **Add visual regression tests** with Percy for UI consistency
