# Test Plan: Lot & Serial Tracking Feature Gates

**Created:** 2026-02-01
**Feature:** lot_tracking, serial_tracking
**Access:** Scale plan only (and early_access)

---

## Overview

Lot and serial tracking are premium features gated to the **Scale** plan only. This test plan verifies that:
1. Non-Scale users cannot access these features
2. Scale users have full access
3. Feature gates work correctly at all levels (UI, API, database)

---

## Feature Gate Reference

From `/lib/features/gating.ts`:

| Plan | lot_tracking | serial_tracking |
|------|-------------|-----------------|
| Starter | ❌ | ❌ |
| Growth | ❌ | ❌ |
| Scale | ✅ | ✅ |
| Early Access | ✅ | ✅ |

---

## Test Scenarios

### 1. UI Feature Gating

#### 1.1 Inventory Item Creation/Edit

| Test | Starter/Growth | Scale |
|------|----------------|-------|
| Navigate to /inventory/new | Form loads | Form loads |
| "Tracking Mode" dropdown visible | Hidden or disabled | Visible |
| Can select "Serialized" tracking | ❌ Not available | ✅ Available |
| Can select "Lot/Expiry" tracking | ❌ Not available | ✅ Available |
| Default tracking mode | "None" | "None" |
| Upgrade prompt shown | ✅ Shows upgrade CTA | N/A |

#### 1.2 Receive Form - Serial Entry

| Test | Starter/Growth | Scale |
|------|----------------|-------|
| Navigate to receive with serialized item | N/A (can't create) | Form loads |
| Serial number entry section visible | Hidden | Visible |
| Can enter serial numbers | ❌ | ✅ |
| Serial count validation | Skipped | Enforced |

#### 1.3 Receive Form - Lot/Batch Entry

| Test | Starter/Growth | Scale |
|------|----------------|-------|
| Navigate to receive with lot item | N/A (can't create) | Form loads |
| Lot number field visible | Hidden | Visible |
| Batch code field visible | Hidden | Visible |
| Expiry date field visible | Hidden | Visible |
| Manufactured date field visible | Hidden | Visible |

#### 1.4 Inventory Item Detail Page

| Test | Starter/Growth | Scale |
|------|----------------|-------|
| View item with tracking_mode='none' | Shows quantity | Shows quantity |
| "Serials" tab visible | Hidden | Visible |
| "Lots" tab visible | Hidden | Visible |
| Serial numbers list | N/A | Shows list |
| Lot/batch list | N/A | Shows list |

### 2. API/Server Action Gating

#### 2.1 Item Creation

| Test | Expected Behavior |
|------|-------------------|
| Create item with tracking_mode='serialized' on Growth | Returns error / Sets to 'none' |
| Create item with tracking_mode='lot_expiry' on Growth | Returns error / Sets to 'none' |
| Create item with tracking_mode='serialized' on Scale | Success |
| Create item with tracking_mode='lot_expiry' on Scale | Success |

#### 2.2 Item Update

| Test | Expected Behavior |
|------|-------------------|
| Update item to tracking_mode='serialized' on Growth | Returns error / Rejects |
| Update item to tracking_mode='lot_expiry' on Growth | Returns error / Rejects |
| Update item to tracking_mode='serialized' on Scale | Success |

#### 2.3 Serial Number Operations

| Test | Expected Behavior |
|------|-------------------|
| Add serial number on Growth plan | Returns feature gate error |
| Add serial number on Scale plan | Success |
| Delete serial number on Growth plan | Returns feature gate error |
| Checkout with serial on Growth plan | Returns feature gate error |
| Return with serial on Growth plan | Returns feature gate error |

#### 2.4 Lot Operations

| Test | Expected Behavior |
|------|-------------------|
| Create lot on Growth plan | Returns feature gate error |
| Create lot on Scale plan | Success |
| Update lot expiry on Growth plan | Returns feature gate error |
| Receive with lot info on Growth plan | Ignores lot fields / Returns error |

### 3. Database/RLS Gating

#### 3.1 can_access_feature() Function

| Test | Expected Result |
|------|-----------------|
| `can_access_feature('lot_tracking')` for Starter tenant | false |
| `can_access_feature('lot_tracking')` for Growth tenant | false |
| `can_access_feature('lot_tracking')` for Scale tenant | true |
| `can_access_feature('serial_tracking')` for Starter tenant | false |
| `can_access_feature('serial_tracking')` for Growth tenant | false |
| `can_access_feature('serial_tracking')` for Scale tenant | true |

#### 3.2 validate_receive() Function

| Test | Expected Result |
|------|-----------------|
| Complete receive with serialized item (Growth) | Skips serial validation |
| Complete receive with serialized item (Scale) | Validates serial counts |
| Complete receive with lot item (Growth) | Skips lot validation |
| Complete receive with lot item (Scale) | Creates lot records |

### 4. Upgrade Flow

#### 4.1 Upgrade Prompts

| Test | Expected Behavior |
|------|-------------------|
| Click "Serialized" option on Growth | Shows upgrade modal/toast |
| Click "Lots" tab on Growth | Shows upgrade prompt |
| Try to add serial on Growth | Shows upgrade CTA |
| Upgrade prompt links to pricing | Links to /pricing or /settings/billing |

#### 4.2 Post-Upgrade Access

| Test | Expected Behavior |
|------|-------------------|
| Upgrade Growth → Scale | Immediately unlocks lot/serial features |
| Create serialized item after upgrade | Success |
| Existing items remain unchanged | tracking_mode stays 'none' |

### 5. Edge Cases

#### 5.1 Downgrade Scenarios

| Test | Expected Behavior |
|------|-------------------|
| Downgrade Scale → Growth with existing serialized items | Items remain, can view but not add serials |
| Downgrade with existing lots | Lots remain, can view but not create new |
| Edit item after downgrade | Cannot change tracking_mode |
| Complete receive for serialized item after downgrade | ??? (needs decision) |

#### 5.2 Data Integrity

| Test | Expected Behavior |
|------|-------------------|
| Item has serials but plan downgraded | Serials preserved, read-only |
| Lot has expiry but plan downgraded | Lot data preserved |
| Query serial_numbers table on Growth | RLS allows read? |

---

## Test Data Requirements

### Users/Tenants Needed

1. **Starter Plan Tenant**
   - User: `starter-test@example.com`
   - Plan: starter

2. **Growth Plan Tenant**
   - User: `growth-test@example.com`
   - Plan: growth

3. **Scale Plan Tenant**
   - User: `scale-test@example.com`
   - Plan: scale

### Items Needed

1. **Non-tracked item** (all plans)
   - tracking_mode: 'none'
   - quantity: 100

2. **Serialized item** (Scale only)
   - tracking_mode: 'serialized'
   - serials: ['SN001', 'SN002', 'SN003']

3. **Lot-tracked item** (Scale only)
   - tracking_mode: 'lot_expiry'
   - lots: [{ lot_number: 'LOT001', expiry: '2027-01-01' }]

---

## Automated Test Coverage

### Unit Tests

```typescript
// __tests__/features/feature-gates.test.ts

describe('Feature Gates', () => {
  describe('lot_tracking', () => {
    it('returns false for starter plan', () => {})
    it('returns false for growth plan', () => {})
    it('returns true for scale plan', () => {})
  })

  describe('serial_tracking', () => {
    it('returns false for starter plan', () => {})
    it('returns false for growth plan', () => {})
    it('returns true for scale plan', () => {})
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/feature-gates/lot-serial.spec.ts

test.describe('Lot & Serial Feature Gates', () => {
  test.describe('Growth Plan', () => {
    test('cannot select serialized tracking mode', async () => {})
    test('cannot select lot tracking mode', async () => {})
    test('shows upgrade prompt', async () => {})
  })

  test.describe('Scale Plan', () => {
    test('can select serialized tracking mode', async () => {})
    test('can select lot tracking mode', async () => {})
    test('can enter serial numbers on receive', async () => {})
    test('can enter lot info on receive', async () => {})
  })
})
```

---

## Priority

| Priority | Test Area |
|----------|-----------|
| P0 - Critical | UI gating prevents non-Scale from setting tracking mode |
| P0 - Critical | API/server action rejects tracking mode change for non-Scale |
| P1 - High | Database function returns correct feature access |
| P1 - High | Upgrade prompts shown correctly |
| P2 - Medium | Serial/lot validation respects feature gate |
| P2 - Medium | Downgrade preserves existing data |
| P3 - Low | RLS on serial_numbers/lots tables |

---

## Success Criteria

- [ ] No Growth/Starter user can create items with serialized/lot_expiry tracking
- [ ] No Growth/Starter user can add serial numbers or lot info
- [ ] Scale users have full access to all lot/serial features
- [ ] Upgrade prompts are clear and link to upgrade flow
- [ ] Existing data is preserved on downgrade (read-only access)
- [ ] All feature gate checks are consistent (UI, API, DB)

---

*Test plan for lot_tracking and serial_tracking feature gates*
