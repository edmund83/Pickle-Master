# Manage Serials Modal Redesign

**Date:** 2026-02-02
**Status:** Approved

## Problem

The current "Manage Serials" modal has confusing UX:
- Users can "select" a serial but nothing happens after selection
- Helper text says "tap a serial to use it instead" but there's no transaction context
- "Add Serial" button is redundant since Stock In flow handles adding serials

## Design Decision

Simplify the modal to be a **view + edit** interface only.

### What's Removed
- Selection/picker behavior (radio buttons, active states)
- Helper text "System auto-picks oldest first. Tap a serial to use it instead."
- "Add Serial" button (Stock In handles this)
- Delete functionality (edit the serial number instead)

### What's Added
- Inline edit capability for serial numbers (fix typos)

### What Stays the Same
- View list of serials with status badges
- Close button
- Modal header with item name

## New UX Flow

1. User opens modal from item detail page
2. Sees list of serials with their statuses (Available, Checked out, Sold, Damaged)
3. Taps a serial row to enter inline edit mode
4. Edits the serial number, then saves (checkmark) or cancels (X)
5. Closes modal when done

## Wireframe

```
┌─────────────────────────────────────┐
│ #  Manage Serials              ✕    │
│    Tissue Premier                   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ SN-001              Checked out │ │  ← tap to edit
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ SN-002              Checked out │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [SN-003______] ✓ ✕    Available │ │  ← editing mode
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ SN-004                Available │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│                          [ Close ]  │
└─────────────────────────────────────┘
```

## Implementation Changes

### `ManageTrackingModal.tsx`

1. Remove `selectedId` state and selection logic
2. Remove helper text paragraph
3. Remove "Add Serial" button from footer
4. Add `editingId` state to track which serial is being edited
5. Add `editValue` state for the input value
6. Update `SerialListItem` to support edit mode:
   - Normal: show serial number as text, tap to enter edit mode
   - Editing: show input field with save/cancel buttons

### API

No backend changes required. Use existing `upsert_item_serials` RPC to update serial numbers.

## Out of Scope

- Batch tracking modal changes (separate effort if needed)
- Delete serial functionality
- Status editing (handled by Stock Out/Adjustments flows)
