# Serial & Lot Tracking UX Design

**Date:** 2026-02-04
**Status:** Approved
**Goal:** Traceability - answer "Which specific serial numbers or lot numbers did we ship to Customer X?" for audit/recall purposes

---

## Overview

This design adds serial/lot tracking visibility to the order-to-cash workflow:
- **Pick List**: Capture which serials/lots are physically picked
- **Delivery Order**: Inherit from pick list, allow adjustments before dispatch
- **Traceability**: Display tracking info on completed documents

### Design Principles
- **Inline expandable UI** - keeps context, works on mobile
- **Auto-assign with manual override** - FEFO/FIFO suggestions, editable
- **Pick List captures → DO inherits → DO finalizes**

---

## 1. Pick List: Lot Selection UI

For lot-tracked items, users allocate quantities from specific lots.

### Collapsed State (Default)
```
┌──────────────────────────────────────────────────────────────┐
│ 📦 Premier Tissue          50 pcs    🏷️ Lot    ⚠️ Pending   │
│    SKU: P123                                    [▼ Assign]   │
└──────────────────────────────────────────────────────────────┘
```

### Expanded State
```
┌──────────────────────────────────────────────────────────────┐
│ 📦 Premier Tissue          50 pcs    🏷️ Lot                 │
│    SKU: P123                                    [▲ Collapse] │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Auto-assign FEFO]                      Need: 50 / 50 ✓  │ │
│ │──────────────────────────────────────────────────────────│ │
│ │ Lot #          Expiry       Available    Allocate        │ │
│ │ LOT-2026-001   Mar 14 ⚠️    48           [____48____]    │ │
│ │ LOT-2026-002   Jun 14       13           [____2_____]    │ │
│ │ LOT-TEST-001   Mar 4  🔴    4            [____0_____]    │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Behaviors
- **Auto-assign FEFO** button fills quantities using First-Expired-First-Out
- Expiry warnings: 🔴 expired, ⚠️ expiring soon, none = OK
- Running total shows "Need: X / Y" with ✓ when complete
- Cannot proceed to "Complete Picking" until all tracked items are assigned

---

## 2. Pick List: Serial Selection UI

For serial-tracked items, users select specific serial numbers.

### Expanded State
```
┌──────────────────────────────────────────────────────────────┐
│ 📦 Tissue Premier          3 pcs     🔢 Serial               │
│    SKU: ABC 123                                [▲ Collapse]  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Auto-assign]  [Scan]                   Need: 3 / 3 ✓    │ │
│ │──────────────────────────────────────────────────────────│ │
│ │ ☑ SN-001              Available                          │ │
│ │ ☑ SN-002              Available                          │ │
│ │ ☑ NEW-SERIAL-001      Available                          │ │
│ │ ☐ NEW-SERIAL-002      Available                          │ │
│ │ ☐ TEST-SN-001         Available                          │ │
│ │──────────────────────────────────────────────────────────│ │
│ │ [Search serials...]                                      │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Behaviors
- **Checkboxes** to select specific serials (must select exactly N for quantity N)
- **Auto-assign** picks first N available serials (FIFO)
- **Scan** button opens barcode scanner to quickly select serials
- **Search** field filters the list for large serial pools
- Shows only "Available" serials (hides sold, damaged, checked_out)
- Counter enforces exact match: can't select more or fewer than needed

---

## 3. Delivery Order: Inherited & Editable

When a DO is created from a Pick List, it inherits the serial/lot assignments.

### Inherited View (Read-Only by Default)
```
┌──────────────────────────────────────────────────────────────┐
│ 📦 Premier Tissue          50 pcs    🏷️ Lot     ✓ Assigned  │
│    SKU: P123                                                 │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Allocated from Pick List PL-TES03-A00001:                │ │
│ │                                                          │ │
│ │ LOT-2026-001 (Exp: Mar 14)     48 pcs                    │ │
│ │ LOT-2026-002 (Exp: Jun 14)      2 pcs                    │ │
│ │                          ─────────────                   │ │
│ │                          Total: 50 pcs                   │ │
│ │                                                          │ │
│ │                                          [Edit] [Clear]  │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Behaviors
- **Read-only by default** - shows inherited allocation clearly
- **[Edit]** button expands to the same selection UI as Pick List
- **[Clear]** removes allocation (for reassigning completely)
- **Direct DO** (no Pick List) shows empty state with [Assign] button
- Cannot dispatch until all tracked items have valid assignments
- Partial shipment: adjust quantities down, remaining stays for next DO

---

## 4. Traceability Display (Read-Only)

Once a DO is dispatched, the serial/lot info becomes a permanent record.

### Completed Document View
```
┌──────────────────────────────────────────────────────────────┐
│ DELIVERY ORDER: DO-TES03-A00001              Status: Shipped │
│ Customer: E2E Test Customer                  Date: Feb 4, 2026│
├──────────────────────────────────────────────────────────────┤
│ Item                    Qty    Tracking                      │
│──────────────────────────────────────────────────────────────│
│ Premier Tissue          50     LOT-2026-001 (48)             │
│ SKU: P123                      LOT-2026-002 (2)              │
│──────────────────────────────────────────────────────────────│
│ Tissue Premier          3      SN-001, SN-002, NEW-SERIAL-001│
│ SKU: ABC 123                                                 │
│──────────────────────────────────────────────────────────────│
│ Test Item               10     —                             │
│ (No tracking)                                                │
└──────────────────────────────────────────────────────────────┘
```

### Behaviors
- **Inline display** - tracking info shown directly in the item row
- **Lot format**: `LOT-NUMBER (qty)` - shows which lots and how many from each
- **Serial format**: comma-separated list of serial numbers
- **Non-tracked items**: show "—" or nothing
- **Clickable** - lot/serial numbers link to their detail pages for drill-down
- **PDF export** - same info appears on printed documents

---

## 5. Non-Tracked Items

Items without tracking flow through the same workflow but skip selection.

### UI Display
```
┌──────────────────────────────────────────────────────────────┐
│ 📦 Test Item               10 pcs    —          ✓ Ready     │
│    SKU: TEST-001                                             │
└──────────────────────────────────────────────────────────────┘
```

### Comparison Table

| Aspect | Tracked Items | Non-Tracked Items |
|--------|---------------|-------------------|
| **Pick List UI** | Expandable with selection | No expand, auto-ready |
| **Status badge** | "Pending" → "Assigned" | Always "Ready" |
| **DO inheritance** | Copies serial/lot links | Just copies quantity |
| **Traceability view** | Shows serials/lots | Shows "—" |
| **Inventory update** | Updates specific serials/lots | Decreases `quantity` directly |

### Validation Rules
- Non-tracked: just check quantity ≤ available stock
- Serial-tracked: must select exactly N serials
- Lot-tracked: sum of allocated quantities must equal N

---

## 6. Data Model

### Data Flow
```
Sales Order                Pick List                 Delivery Order
┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│ SO Item     │           │ PL Item     │           │ DO Item     │
│ - item_id   │──creates──│ - item_id   │──creates──│ - item_id   │
│ - quantity  │           │ - quantity  │           │ - quantity  │
│             │           │             │           │             │
│ (no tracking│           │ NEW TABLE:  │           │ EXISTING:   │
│  at this    │           │ pick_list_  │──copies───│ delivery_   │
│  level)     │           │ item_serials│    to     │ order_item_ │
│             │           │ item_lots   │           │ serials     │
└─────────────┘           └─────────────┘           └─────────────┘
                                                           │
                                                    on dispatch:
                                                    updates inventory
                                                           │
                                                           ▼
                                              ┌─────────────────────┐
                                              │ serial_numbers      │
                                              │ status → 'sold'     │
                                              │                     │
                                              │ lots                │
                                              │ quantity decreased  │
                                              │ + lot_movements log │
                                              └─────────────────────┘
```

### New Tables Required

**`pick_list_item_serials`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pick_list_item_id | UUID | FK to pick_list_items |
| serial_id | UUID | FK to serial_numbers |
| tenant_id | UUID | For RLS |
| created_at | TIMESTAMPTZ | |

**`pick_list_item_lots`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pick_list_item_id | UUID | FK to pick_list_items |
| lot_id | UUID | FK to lots |
| quantity | INTEGER | Quantity allocated from this lot |
| tenant_id | UUID | For RLS |
| created_at | TIMESTAMPTZ | |

### Existing Table Updates

**`delivery_order_item_serials`** (already exists)
- Add `lot_id` column (UUID, nullable, FK to lots)
- Add `quantity` column (INTEGER, for lot tracking)
- Rename to `delivery_order_item_tracking` for clarity (optional)

### Inventory Update Logic

On DO dispatch:
1. **Serials**: `UPDATE serial_numbers SET status = 'sold' WHERE id IN (...)`
2. **Lots**: `UPDATE lots SET quantity = quantity - N` + insert `lot_movements` record
3. **Non-tracked**: `UPDATE inventory_items SET quantity = quantity - N`

---

## 7. Implementation Scope

### Phase 1: Pick List Tracking
- [ ] Create `pick_list_item_serials` table + RLS
- [ ] Create `pick_list_item_lots` table + RLS
- [ ] Build `PickListItemTracking` component (inline expandable)
- [ ] Add auto-assign FEFO/FIFO functions
- [ ] Validation: block "Complete Picking" until all assigned

### Phase 2: Delivery Order Tracking
- [ ] Update `delivery_order_item_serials` table for lots
- [ ] Copy tracking from pick list to DO on creation
- [ ] Build DO tracking display (read-only with edit option)
- [ ] Validation: block dispatch until all assigned

### Phase 3: Inventory Updates & Traceability
- [ ] Trigger inventory updates on DO dispatch
- [ ] Add tracking column to DO/Invoice list and detail views
- [ ] Include tracking info in PDF exports

---

## Open Questions

None - design approved.
