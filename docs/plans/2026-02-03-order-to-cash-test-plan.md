# Order-to-Cash Data Flow, Integration & Integrity Test Plan

## Overview

Comprehensive test suite covering the complete order-to-cash workflow:
**Item → Sales Order → Pick List → Delivery Order → Invoice → Credit Note**

### Goals
- Verify data flows correctly through all entities with proper FK relationships
- Validate quantity tracking accuracy at each stage
- Ensure status state machines enforce legal transitions only
- Confirm financial calculations (totals, taxes, payments, credits) remain accurate
- Validate multi-tenant isolation at every boundary
- Test edge cases: partial fulfillment, cancellations, quantity mismatches

---

## Test Architecture

```
tests/
├── integration/
│   └── order-to-cash/
│       ├── data-flow.test.ts         # Entity relationships & FK integrity
│       ├── quantity-tracking.test.ts  # Quantity flow through workflow
│       ├── status-transitions.test.ts # State machine validation
│       ├── financial-integrity.test.ts # Totals, taxes, payments, credits
│       └── tenant-isolation.test.ts   # Multi-tenancy security
├── api/
│   └── order-to-cash/
│       ├── sales-orders.test.ts       # Server action validation
│       ├── delivery-orders.test.ts
│       ├── invoices.test.ts
│       └── credit-notes.test.ts
└── e2e/
    └── order-to-cash/
        ├── happy-path.spec.ts         # Full workflow via UI
        ├── partial-fulfillment.spec.ts
        ├── cancellation.spec.ts
        └── credit-note.spec.ts
```

**Test Runner**: Vitest for integration/API tests, Playwright for E2E
**Database**: Local Supabase via `supabase start`
**Isolation**: Each test file gets unique tenant, cleanup via cascade delete

---

## Test Fixtures & Factory Pattern

### Core Fixture Structure

```typescript
// tests/fixtures/order-to-cash.fixtures.ts

interface TestContext {
  tenantId: string
  orgId: string
  userId: string
  supabase: SupabaseClient
}

// Factory functions
async function createTestCustomer(ctx: TestContext, overrides?: Partial<Customer>)
async function createTestItem(ctx: TestContext, overrides?: Partial<Item>)
async function createTestSalesOrder(ctx: TestContext, options: {
  customer?: Customer
  items: Array<{ item: Item; quantity: number; unitPrice: number }>
  status?: SalesOrderStatus
})
async function createTestPickList(ctx: TestContext, salesOrderId: string)
async function createTestDeliveryOrder(ctx: TestContext, salesOrderId: string)
async function createTestInvoice(ctx: TestContext, source: {
  salesOrderId?: string
  deliveryOrderId?: string
})
async function createTestCreditNote(ctx: TestContext, invoiceId: string, reason: CreditReason)
```

### Setup/Teardown Pattern

```typescript
let ctx: TestContext

beforeAll(async () => {
  ctx = await createTestTenant('order-to-cash-test')
})

afterAll(async () => {
  await deleteTestTenant(ctx.tenantId) // Cascades all data
})
```

---

## Integration Tests

### 1. Data Flow Tests (`data-flow.test.ts`)

| Test | Description |
|------|-------------|
| SO → Pick List link | Creating pick list from SO sets `sales_orders.pick_list_id` and `pick_lists.source_entity_id` |
| SO → DO link | DO creation sets `delivery_orders.sales_order_id`, DO items link to `sales_order_item_id` |
| DO → Invoice link | Invoice from DO sets both `sales_order_id` and `delivery_order_id`, items link to source items |
| Invoice → Credit Note link | Credit note sets `original_invoice_id`, `invoice_type = 'credit_note'` |
| Cascade integrity | Deleting customer with active SO fails (RESTRICT), deleting draft SO cascades items |
| Display ID generation | Each entity gets correct prefix (SO-, PL-, DO-, INV-, CN-) with org-scoped sequence |

```typescript
it('should link pick list to sales order bidirectionally', async () => {
  const so = await createTestSalesOrder(ctx, { items: [...], status: 'confirmed' })
  const pl = await generatePickListFromSO(ctx, so.id)

  // Verify forward link
  expect(pl.source_entity_type).toBe('sales_order')
  expect(pl.source_entity_id).toBe(so.id)

  // Verify backward link
  const updatedSO = await getSalesOrder(ctx, so.id)
  expect(updatedSO.pick_list_id).toBe(pl.id)
})
```

### 2. Quantity Tracking Tests (`quantity-tracking.test.ts`)

| Stage | Field Progression | Assertion |
|-------|------------------|-----------|
| SO Created | `quantity_ordered = 10` | Initial quantity set correctly |
| Pick List Generated | `quantity_allocated = 10` | SO item allocated matches pick list requested |
| Partial Pick (7 of 10) | `quantity_picked = 7` | SO item reflects partial pick |
| DO Created | `quantity_shipped = 7` | DO item matches picked quantity |
| Partial Delivery (5 of 7) | `quantity_delivered = 5` | SO item updated via trigger |
| Invoice Created | `quantity_invoiced = 5` | Only delivered quantity invoiced |

**Edge Cases**:

```typescript
describe('quantity mismatches', () => {
  it('should reject over-pick beyond ordered quantity', async () => {
    const so = await createTestSalesOrder(ctx, {
      items: [{ item, quantity: 10, unitPrice: 100 }]
    })
    await generatePickListFromSO(ctx, so.id)

    await expect(
      updatePickListItemQuantity(ctx, plItemId, 15)
    ).rejects.toThrow(/exceeds ordered quantity/)
  })

  it('should reject shipping more than picked', async () => {
    await expect(
      createDeliveryOrderItem(ctx, doId, { quantity_shipped: 10 })
    ).rejects.toThrow(/exceeds picked quantity/)
  })

  it('should reject invoicing more than delivered', async () => {
    await expect(
      addInvoiceItem(ctx, invId, { quantity: 8 })
    ).rejects.toThrow(/exceeds delivered quantity/)
  })
})
```

### 3. Status Transition Tests (`status-transitions.test.ts`)

**Sales Order State Machine**:
```
draft → submitted → confirmed → picking → picked → partial_shipped/shipped → delivered → completed
                 ↘ cancelled (from draft/submitted/confirmed)
```

```typescript
describe('Sales Order status transitions', () => {
  it('should allow: draft → submitted → confirmed → picking', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'draft', items })

    await updateSalesOrderStatus(ctx, so.id, 'submitted')
    await updateSalesOrderStatus(ctx, so.id, 'confirmed')
    await updateSalesOrderStatus(ctx, so.id, 'picking')

    const updated = await getSalesOrder(ctx, so.id)
    expect(updated.status).toBe('picking')
  })

  it('should reject: draft → picked (skipping steps)', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'draft', items })
    await expect(
      updateSalesOrderStatus(ctx, so.id, 'picked')
    ).rejects.toThrow(/invalid status transition/)
  })

  it('should reject: shipped → confirmed (backwards)', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'shipped', items })
    await expect(
      updateSalesOrderStatus(ctx, so.id, 'confirmed')
    ).rejects.toThrow(/cannot transition backwards/)
  })

  it('should auto-transition: picked → partial_shipped when DO partially delivered', async () => {
    const so = await setupPickedSalesOrder(ctx, { itemCount: 2 })
    await deliverPartially(ctx, so.id, { itemIndex: 0 })

    const updated = await getSalesOrder(ctx, so.id)
    expect(updated.status).toBe('partial_shipped')
  })
})
```

**Delivery Order State Machine**: `draft → ready → dispatched → in_transit → delivered`
**Invoice State Machine**: `draft → pending → sent → paid/partial/overdue`

### 4. Financial Integrity Tests (`financial-integrity.test.ts`)

```typescript
describe('Sales Order totals', () => {
  it('should calculate line totals correctly', async () => {
    const so = await createTestSalesOrder(ctx, {
      items: [
        { item: itemA, quantity: 5, unitPrice: 100 },  // 500
        { item: itemB, quantity: 3, unitPrice: 50 },   // 150
      ]
    })
    expect(so.subtotal).toBe(650)
  })

  it('should apply line-item discounts', async () => {
    await setSalesOrderItemDiscount(ctx, soItemId, { percent: 10 })
    const so = await getSalesOrder(ctx, so.id)
    expect(so.subtotal).toBe(600) // 450 + 150
  })

  it('should calculate tax correctly', async () => {
    await setSalesOrderItemTax(ctx, soItemId, { rate: 0.08 })
    const so = await getSalesOrder(ctx, so.id)
    expect(so.tax_amount).toBe(48)
    expect(so.total).toBe(648)
  })
})

describe('Invoice payments and balance', () => {
  it('should track partial payments correctly', async () => {
    const inv = await createTestInvoice(ctx, { total: 1000 })

    await recordPayment(ctx, inv.id, { amount: 300 })
    let updated = await getInvoice(ctx, inv.id)
    expect(updated.amount_paid).toBe(300)
    expect(updated.balance_due).toBe(700)
    expect(updated.status).toBe('partial')

    await recordPayment(ctx, inv.id, { amount: 700 })
    updated = await getInvoice(ctx, inv.id)
    expect(updated.balance_due).toBe(0)
    expect(updated.status).toBe('paid')
  })

  it('should reject payment exceeding balance', async () => {
    const inv = await createTestInvoice(ctx, { total: 500, amount_paid: 400 })
    await expect(
      recordPayment(ctx, inv.id, { amount: 200 })
    ).rejects.toThrow(/exceeds balance due/)
  })
})
```

### 5. Tenant Isolation Tests (`tenant-isolation.test.ts`)

```typescript
describe('Cross-tenant access prevention', () => {
  let tenantA: TestContext
  let tenantB: TestContext

  beforeAll(async () => {
    tenantA = await createTestTenant('tenant-a')
    tenantB = await createTestTenant('tenant-b')
  })

  it('should prevent reading another tenant sales order', async () => {
    const soA = await createTestSalesOrder(tenantA, { items })
    const result = await getSalesOrder(tenantB, soA.id)
    expect(result).toBeNull()
  })

  it('should prevent creating DO from another tenant SO', async () => {
    const soA = await createTestSalesOrder(tenantA, { status: 'picked', items })
    await expect(
      createDeliveryOrderFromSO(tenantB, soA.id)
    ).rejects.toThrow(/not found|permission denied/)
  })

  it('should prevent invoicing another tenant DO', async () => {
    const doA = await createTestDeliveryOrder(tenantA, soId)
    await expect(
      createInvoice(tenantB, { deliveryOrderId: doA.id })
    ).rejects.toThrow(/not found|permission denied/)
  })

  it('should prevent creating credit note for another tenant invoice', async () => {
    const invA = await createTestInvoice(tenantA, { total: 500 })
    await expect(
      createCreditNote(tenantB, { originalInvoiceId: invA.id })
    ).rejects.toThrow(/not found|permission denied/)
  })
})

describe('Cross-tenant data leakage prevention', () => {
  it('should not include other tenant data in list queries', async () => {
    await createTestSalesOrder(tenantA, { items })
    await createTestSalesOrder(tenantA, { items })
    await createTestSalesOrder(tenantB, { items })

    const listA = await getPaginatedSalesOrders(tenantA, {})
    const listB = await getPaginatedSalesOrders(tenantB, {})

    expect(listA.data).toHaveLength(2)
    expect(listB.data).toHaveLength(1)
  })

  it('should isolate activity logs by tenant', async () => {
    const soA = await createTestSalesOrder(tenantA, { items })
    await updateSalesOrderStatus(tenantA, soA.id, 'submitted')

    const logsA = await getActivityLogs(tenantA, { entityId: soA.id })
    const logsB = await getActivityLogs(tenantB, { entityId: soA.id })

    expect(logsA.length).toBeGreaterThan(0)
    expect(logsB).toHaveLength(0)
  })
})
```

---

## API Tests

### Credit Notes (`credit-notes.test.ts`)

```typescript
describe('Credit Note creation', () => {
  it('should create full refund credit note', async () => {
    const inv = await createTestInvoice(ctx, { total: 1000, status: 'sent' })
    const cn = await createCreditNote(ctx, {
      originalInvoiceId: inv.id,
      reason: 'return',
      items: [{ ...inv.items[0], quantity: inv.items[0].quantity }]
    })

    expect(cn.invoice_type).toBe('credit_note')
    expect(cn.original_invoice_id).toBe(inv.id)
    expect(cn.total).toBe(-1000)
  })

  it('should create partial credit for specific items', async () => {
    const inv = await createTestInvoice(ctx, {
      items: [
        { quantity: 10, unitPrice: 100 },
        { quantity: 5, unitPrice: 50 },
      ]
    })

    const cn = await createCreditNote(ctx, {
      originalInvoiceId: inv.id,
      reason: 'damaged',
      items: [{ itemId: inv.items[0].item_id, quantity: 3, unitPrice: 100 }]
    })

    expect(cn.total).toBe(-300)
  })

  it('should reject credit note from another credit note', async () => {
    const cn = await createTestCreditNote(ctx, invoiceId, 'return')
    await expect(
      createCreditNote(ctx, { originalInvoiceId: cn.id })
    ).rejects.toThrow(/cannot create credit note from credit note/)
  })
})

describe('Credit Note application', () => {
  it('should auto-apply credit to original invoice balance', async () => {
    const inv = await createTestInvoice(ctx, { total: 1000, status: 'sent' })
    await createAndApplyCreditNote(ctx, inv.id, { amount: 200 })

    const updated = await getInvoice(ctx, inv.id)
    expect(updated.amount_paid).toBe(200)
    expect(updated.balance_due).toBe(800)
  })

  it('should handle multiple partial credits', async () => {
    const inv = await createTestInvoice(ctx, { total: 1000 })

    await createAndApplyCreditNote(ctx, inv.id, { amount: 100, reason: 'discount' })
    await createAndApplyCreditNote(ctx, inv.id, { amount: 150, reason: 'defect' })

    const updated = await getInvoice(ctx, inv.id)
    expect(updated.amount_paid).toBe(250)
    expect(updated.balance_due).toBe(750)
  })

  it('should reject applying credit note twice', async () => {
    const cn = await createTestCreditNote(ctx, invoiceId, 'return')
    await applyCreditNote(ctx, cn.id)

    await expect(applyCreditNote(ctx, cn.id))
      .rejects.toThrow(/already applied/)
  })
})
```

---

## Cancellation Tests

```typescript
describe('Sales Order cancellation', () => {
  it('should allow cancellation from draft status', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'draft', items })
    await updateSalesOrderStatus(ctx, so.id, 'cancelled')

    const updated = await getSalesOrder(ctx, so.id)
    expect(updated.status).toBe('cancelled')
    expect(updated.cancelled_at).toBeDefined()
    expect(updated.cancelled_by).toBe(ctx.userId)
  })

  it('should allow cancellation from confirmed status', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'confirmed', items })
    await updateSalesOrderStatus(ctx, so.id, 'cancelled')
    expect((await getSalesOrder(ctx, so.id)).status).toBe('cancelled')
  })

  it('should reject cancellation after picking started', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'picking', items })
    await expect(
      updateSalesOrderStatus(ctx, so.id, 'cancelled')
    ).rejects.toThrow(/cannot cancel.*picking/)
  })

  it('should release allocated inventory on cancellation', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'confirmed', items })
    const itemBefore = await getItem(ctx, items[0].item.id)

    await updateSalesOrderStatus(ctx, so.id, 'cancelled')

    const itemAfter = await getItem(ctx, items[0].item.id)
    expect(itemAfter.quantity_available).toBe(
      itemBefore.quantity_available + items[0].quantity
    )
  })
})

describe('Delivery Order cancellation', () => {
  it('should allow cancellation before dispatch', async () => {
    const doOrder = await createTestDeliveryOrder(ctx, soId, { status: 'ready' })
    await updateDeliveryOrderStatus(ctx, doOrder.id, 'cancelled')
    expect((await getDeliveryOrder(ctx, doOrder.id)).status).toBe('cancelled')
  })

  it('should revert SO status when DO cancelled before delivery', async () => {
    const so = await createTestSalesOrder(ctx, { status: 'picked', items })
    const doOrder = await createDeliveryOrderFromSO(ctx, so.id)

    await updateDeliveryOrderStatus(ctx, doOrder.id, 'cancelled')

    const updatedSO = await getSalesOrder(ctx, so.id)
    expect(updatedSO.status).toBe('picked')
  })
})

describe('Invoice void', () => {
  it('should allow voiding draft invoice', async () => {
    const inv = await createTestInvoice(ctx, { status: 'draft', total: 500 })
    await updateInvoiceStatus(ctx, inv.id, 'void')
    expect((await getInvoice(ctx, inv.id)).status).toBe('void')
  })

  it('should reject voiding invoice with payments', async () => {
    const inv = await createTestInvoice(ctx, { status: 'partial', total: 500 })
    await recordPayment(ctx, inv.id, { amount: 100 })

    await expect(
      updateInvoiceStatus(ctx, inv.id, 'void')
    ).rejects.toThrow(/cannot void.*payments/)
  })
})
```

---

## E2E Tests (Playwright)

### Happy Path (`happy-path.spec.ts`)

```typescript
test.describe('Complete order-to-cash workflow', () => {
  test('should complete full workflow: SO → Pick → DO → Invoice → Payment', async ({ page }) => {
    // 1. Create Sales Order
    await page.goto('/sales-orders/new')
    await page.getByLabel('Customer').click()
    await page.getByRole('option', { name: 'Test Customer' }).click()
    await page.getByRole('button', { name: 'Add Item' }).click()
    await selectItem(page, 'Widget A', { quantity: 10, price: 100 })
    await page.getByRole('button', { name: 'Save Draft' }).click()
    await expect(page.getByText('SO-')).toBeVisible()

    // 2. Submit and Confirm
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    // 3. Generate Pick List
    await page.getByRole('button', { name: 'Generate Pick List' }).click()
    await expect(page.getByText('PL-')).toBeVisible()

    // 4. Complete Picking
    await page.getByRole('button', { name: 'Start Picking' }).click()
    await page.getByLabel('Picked Quantity').fill('10')
    await page.getByRole('button', { name: 'Complete Pick' }).click()

    // 5. Create Delivery Order
    await page.getByRole('button', { name: 'Create Delivery' }).click()
    await expect(page.getByText('DO-')).toBeVisible()

    // 6. Dispatch and Deliver
    await page.getByRole('button', { name: 'Dispatch' }).click()
    await page.getByRole('button', { name: 'Mark Delivered' }).click()
    await page.getByLabel('Received By').fill('John Smith')
    await page.getByRole('button', { name: 'Confirm Delivery' }).click()

    // 7. Create Invoice
    await page.getByRole('button', { name: 'Create Invoice' }).click()
    await expect(page.getByText('INV-')).toBeVisible()
    await expect(page.getByText('$1,000.00')).toBeVisible()

    // 8. Record Payment
    await page.getByRole('button', { name: 'Record Payment' }).click()
    await page.getByLabel('Amount').fill('1000')
    await page.getByRole('button', { name: 'Save Payment' }).click()

    // 9. Verify completion
    await expect(page.getByText('Paid')).toBeVisible()
    await page.goto('/sales-orders')
    await expect(page.getByText('Completed')).toBeVisible()
  })
})
```

### Partial Fulfillment (`partial-fulfillment.spec.ts`)

```typescript
test('should handle partial shipment with multiple deliveries', async ({ page }) => {
  // Create SO with 20 units
  // Ship 12 first delivery
  // Verify status = partial_shipped
  // Ship remaining 8
  // Verify status = shipped
})

test('should handle partial pick and continue later', async ({ page }) => {
  // Pick 7 of 10 items
  // Save partial progress
  // Return and complete remaining 3
})
```

### Cancellation (`cancellation.spec.ts`)

```typescript
test('should cancel SO before confirmation', async ({ page }) => {
  // Create draft SO
  // Cancel and verify status
})

test('should cancel DO and revert SO status', async ({ page }) => {
  // Create and dispatch DO
  // Cancel before delivery
  // Verify SO reverts to picked
})
```

### Credit Note (`credit-note.spec.ts`)

```typescript
test('should create and apply credit note for returned items', async ({ page }) => {
  // Complete full workflow
  // Create credit note for partial return
  // Verify balance updates in UI
})

test('should handle multiple credit notes on same invoice', async ({ page }) => {
  // Apply two separate credits
  // Verify cumulative balance reduction
})
```

---

## Test Execution

### NPM Scripts

```json
{
  "scripts": {
    "test:integration": "vitest run tests/integration --reporter=verbose",
    "test:api": "vitest run tests/api --reporter=verbose",
    "test:e2e": "playwright test e2e/order-to-cash",
    "test:order-to-cash": "npm run test:integration && npm run test:api && npm run test:e2e",
    "test:order-to-cash:ci": "supabase start && npm run test:order-to-cash && supabase stop"
  }
}
```

### Execution Order
1. **Integration tests** - Fastest, catch data layer issues early
2. **API tests** - Validate server action logic
3. **E2E tests** - Slowest, catch UI integration issues

---

## Coverage Summary

| Layer | Test File | Est. Tests |
|-------|-----------|------------|
| Integration | data-flow.test.ts | ~8 |
| Integration | quantity-tracking.test.ts | ~12 |
| Integration | status-transitions.test.ts | ~15 |
| Integration | financial-integrity.test.ts | ~10 |
| Integration | tenant-isolation.test.ts | ~8 |
| API | sales-orders.test.ts | ~12 |
| API | delivery-orders.test.ts | ~10 |
| API | invoices.test.ts | ~12 |
| API | credit-notes.test.ts | ~8 |
| E2E | happy-path.spec.ts | ~3 |
| E2E | partial-fulfillment.spec.ts | ~4 |
| E2E | cancellation.spec.ts | ~5 |
| E2E | credit-note.spec.ts | ~3 |
| **Total** | | **~110 tests** |

---

## Implementation Checklist

- [ ] Create `tests/fixtures/order-to-cash.fixtures.ts` with factory functions
- [ ] Create `tests/fixtures/test-tenant.ts` for tenant setup/teardown
- [ ] Implement `tests/integration/order-to-cash/data-flow.test.ts`
- [ ] Implement `tests/integration/order-to-cash/quantity-tracking.test.ts`
- [ ] Implement `tests/integration/order-to-cash/status-transitions.test.ts`
- [ ] Implement `tests/integration/order-to-cash/financial-integrity.test.ts`
- [ ] Implement `tests/integration/order-to-cash/tenant-isolation.test.ts`
- [ ] Implement `tests/api/order-to-cash/sales-orders.test.ts`
- [ ] Implement `tests/api/order-to-cash/delivery-orders.test.ts`
- [ ] Implement `tests/api/order-to-cash/invoices.test.ts`
- [ ] Implement `tests/api/order-to-cash/credit-notes.test.ts`
- [ ] Implement `e2e/order-to-cash/happy-path.spec.ts`
- [ ] Implement `e2e/order-to-cash/partial-fulfillment.spec.ts`
- [ ] Implement `e2e/order-to-cash/cancellation.spec.ts`
- [ ] Implement `e2e/order-to-cash/credit-note.spec.ts`
- [ ] Add npm scripts to package.json
- [ ] Document test setup in README or CONTRIBUTING.md
