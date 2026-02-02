# Manage Serials Modal Redesign

**Date:** 2026-02-02
**Status:** Approved

## Problem

The current "Manage Serials" modal has confusing UX:
- Users can "select" a serial but nothing happens after selection
- Helper text says "tap a serial to use it instead" but there's no transaction context
- "Add Serial" button is redundant since Stock In flow handles adding serials
- No search or pagination for large serial lists

## Design Decision

Replace custom list with **DataTable** component for view + edit interface.

### What's Removed
- Selection/picker behavior (radio buttons, active states)
- Helper text "System auto-picks oldest first. Tap a serial to use it instead."
- "Add Serial" button (Stock In handles this)
- Delete functionality (edit the serial number instead)
- Custom `SerialListItem` component

### What's Added
- DataTable with search, pagination (5 per page), sorting
- Inline edit capability for serial numbers (fix typos)

### What Stays the Same
- View list of serials with status badges
- Close button
- Modal header with item name

## New UX Flow

1. User opens modal from item detail page
2. Sees DataTable with serials (5 per page) with search box
3. Can search/filter by serial number
4. Can paginate through results
5. Clicks a serial cell to enter inline edit mode
6. Edits the serial number, then saves (checkmark) or cancels (X)
7. Closes modal when done

## Wireframe

```
┌─────────────────────────────────────┐
│ #  Manage Serials              ✕    │
│    iPhone 15 Pro                    │
├─────────────────────────────────────┤
│ 🔍 Search serials...                │
├─────────────────────────────────────┤
│ Serial ↕            Status          │
├─────────────────────────────────────┤
│ SN-001              Checked out     │
│ SN-002              Checked out     │
│ SN-003 [edit]       Available       │  ← click to edit
│ SN-004              Available       │
│ SN-005              Available       │
├─────────────────────────────────────┤
│ 5 rows    ⏮ ◀ Page 1 of 7 ▶ ⏭     │
├─────────────────────────────────────┤
│                          [ Close ]  │
└─────────────────────────────────────┘
```

## Implementation Changes

### `ManageTrackingModal.tsx`

1. Remove `selectedId` state and selection logic
2. Remove helper text paragraph
3. Remove "Add Serial" button from footer
4. Remove `SerialListItem` component usage
5. Add DataTable with columns:
   - `serial_number`: Editable cell (click to edit inline)
   - `status`: Status badge (read-only)
6. Configure DataTable:
   - `pageSize={5}`
   - `searchKey="serial_number"`
   - `searchPlaceholder="Search serials..."`
7. Add `editingId` and `editValue` state for inline editing
8. Create editable cell component for serial number column

### API

No backend changes required. Use existing RPC to update serial numbers:
- Need to verify if `upsert_item_serials` supports updating existing serials or if a new RPC is needed

## Out of Scope

- Batch tracking modal changes (separate effort if needed)
- Delete serial functionality
- Status editing (handled by Stock Out/Adjustments flows)
