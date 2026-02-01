# Tracking UI Redesign

## Overview

Simplify the Lot Tracking and Serial Tracking UI for mom-and-pop businesses. Replace complex, jargon-heavy panels with clean, consistent cards.

## Design Principles

1. **Smart defaults** - System auto-picks FIFO/FEFO; users don't need to think about it
2. **Simple language** - "Batches" not "Lots", no "FEFO" jargon
3. **Consistent patterns** - Same card structure for both tracking modes
4. **Override when needed** - Users can manually select specific batch/serial if required

## New Components

### 1. BatchTrackingCard

Replaces: `LotsPanel`, `TrackingCard` (for lot_expiry mode)

**With data:**
```
┌─────────────────────────────────────────────────┐
│  📦 BATCHES                         Total: 50   │
│                                                 │
│  ⚠️ 2 expiring soon                             │
│                                     [Manage →]  │
└─────────────────────────────────────────────────┘
```

**Empty state:**
```
┌─────────────────────────────────────────────────┐
│  📦 BATCHES                          Total: 0   │
│                                                 │
│  Add batches to track expiry dates              │
│                                     [Manage →]  │
└─────────────────────────────────────────────────┘
```

**Status line priority (show highest only):**
| Priority | Condition | Display |
|----------|-----------|---------|
| 1 | Has expired | 🔴 `X expired` (red) |
| 2 | Expiring ≤7 days | ⚠️ `X expiring soon` (amber) |
| 3 | Expiring ≤30 days | 📅 `X expiring this month` (yellow) |
| 4 | All OK | ✓ `All batches OK` (green) |
| 5 | Empty | Helper text (gray) |

### 2. SerialTrackingCard

Replaces: `TrackingCard` (for serialized mode)

**With data:**
```
┌─────────────────────────────────────────────────┐
│  #️⃣ SERIALS                          Total: 5   │
│                                                 │
│  3 available · 2 checked out                    │
│                                     [Manage →]  │
└─────────────────────────────────────────────────┘
```

**Empty state:**
```
┌─────────────────────────────────────────────────┐
│  #️⃣ SERIALS                          Total: 0   │
│                                                 │
│  Add serial numbers to track individual units   │
│                                     [Manage →]  │
└─────────────────────────────────────────────────┘
```

**Status line logic:**
- Has serials: `X available · Y checked out`
- All available: `X available`
- All checked out: `All checked out`
- Empty: Helper text

### 3. ManageTrackingModal

Shared modal/drawer for both batches and serials.

**Features:**
- View all batches/serials in a list
- Add new batch/serial
- **Override selection** - Tap to select specific batch/serial instead of auto-pick

**Batch list item:**
```
┌─────────────────────────────────────┐
│ ○ LOT-2026-001                      │
│   Exp: Mar 14 · Qty: 50             │
│   ⚠️ Expiring soon                   │
└─────────────────────────────────────┘
```

**Serial list item:**
```
┌─────────────────────────────────────┐
│ ○ SN-001                            │
│   Available                         │
└─────────────────────────────────────┘
```

**Override flow (when item selected):**
```
┌─────────────────────────────────────┐
│ ● LOT-2026-002            [Selected]│
│   Exp: Jun 30 · Qty: 70             │
│   ┌────────────────────────────┐    │
│   │ Qty to use:  [  10  ]      │    │
│   └────────────────────────────┘    │
│                 [Use This Batch]    │
└─────────────────────────────────────┘
```

## Page Layout Changes

**Remove:**
- `LotsPanel` component (complex FEFO picker)
- `TrackingCard` component (jargon-heavy)
- `ItemAdvancedPanels` wrapper

**Add:**
- `BatchTrackingCard` - in info grid for lot_expiry items
- `SerialTrackingCard` - in info grid for serialized items
- `ManageTrackingModal` - shared modal for both

**Info grid placement:**
```
[Location]    [Pricing]    [Batches OR Serials]
[Identifiers] [Tags]       [QR/Barcode]
```

## Backend Behavior

- **FIFO/FEFO is automatic** - No UI needed for picking logic
- System picks oldest batch (by expiry or received date) by default
- System picks oldest serial (by created date) by default
- Override only happens through explicit user selection in Manage modal

## Files to Modify

1. `app/(dashboard)/inventory/[itemId]/page.tsx` - Update layout, remove old components
2. `app/(dashboard)/inventory/[itemId]/components/lots-panel.tsx` - Delete
3. `app/(dashboard)/inventory/[itemId]/components/TrackingCard.tsx` - Delete
4. `app/(dashboard)/inventory/[itemId]/components/item-advanced-panels.tsx` - Delete
5. New: `components/tracking/BatchTrackingCard.tsx`
6. New: `components/tracking/SerialTrackingCard.tsx`
7. New: `components/tracking/ManageTrackingModal.tsx`
