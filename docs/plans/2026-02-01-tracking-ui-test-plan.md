# Tracking UI Redesign - Test Plan

## Overview

Manual test plan for the simplified Batch & Serial Tracking UI components.

**Components Under Test:**
- `BatchTrackingCard`
- `SerialTrackingCard`
- `ManageTrackingModal`

**Test Environment:**
- URL: `http://localhost:3000`
- Browser: Chrome/Safari (test both desktop and mobile viewport)

---

## Pre-requisites

### Test Data Setup

You need items with different tracking modes:

| Item Name | Tracking Mode | Test Scenario |
|-----------|---------------|---------------|
| Test Item - Standard | `none` | No tracking card shown |
| Test Item - Batches Empty | `lot_expiry` | Empty batch state |
| Test Item - Batches With Data | `lot_expiry` | Has batches with various expiry states |
| Test Item - Serials Empty | `serialized` | Empty serial state |
| Test Item - Serials With Data | `serialized` | Has serials with various statuses |

---

## Test Cases

### TC-01: Standard Item (No Tracking)

**Objective:** Verify no tracking card appears for standard items

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to item detail page for a standard item (`tracking_mode = 'none'`) | Page loads successfully |
| 2 | Check info cards grid | No "Batches" or "Serials" card visible |
| 3 | Verify Location, Pricing, Identifiers cards display | Cards render correctly |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-02: Batch Card - Empty State

**Objective:** Verify batch card shows correct empty state

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to item detail page for batch-tracked item with no batches | Page loads successfully |
| 2 | Locate "Batches" card in info grid | Card visible with 📦 icon |
| 3 | Check header | Shows "BATCHES" title and "Total: 0" |
| 4 | Check status line | Shows "Add batches to track expiry dates" in gray |
| 5 | Check action button | "Manage →" button visible |
| 6 | Click "Manage →" button | Modal opens |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-03: Batch Card - With Data (All OK)

**Objective:** Verify batch card shows correct state when all batches are OK

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create batches with expiry dates > 30 days in future | Batches created |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check "Batches" card header | Shows correct total quantity |
| 4 | Check status line | Shows "✓ All batches OK" in green |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-04: Batch Card - Expiring This Month

**Objective:** Verify batch card shows warning for batches expiring within 30 days

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create batch with expiry date 15-30 days from now | Batch created |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check status line | Shows "📅 X expiring this month" in yellow |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-05: Batch Card - Expiring Soon

**Objective:** Verify batch card shows alert for batches expiring within 7 days

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create batch with expiry date 3 days from now | Batch created |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check status line | Shows "⚠️ X expiring soon" in amber |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-06: Batch Card - Expired

**Objective:** Verify batch card shows critical alert for expired batches

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create batch with expiry date in the past | Batch created |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check status line | Shows "🔴 X expired" in red |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-07: Batch Card - Status Priority

**Objective:** Verify highest priority status is shown when multiple conditions exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create one expired batch and one expiring soon batch | Batches created |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check status line | Shows "🔴 X expired" (highest priority) |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-08: Serial Card - Empty State

**Objective:** Verify serial card shows correct empty state

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to item detail page for serialized item with no serials | Page loads |
| 2 | Locate "Serials" card in info grid | Card visible with # icon |
| 3 | Check header | Shows "SERIALS" title and "Total: 0" |
| 4 | Check status line | Shows "Add serial numbers to track individual units" in gray |
| 5 | Click "Manage →" button | Modal opens |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-09: Serial Card - All Available

**Objective:** Verify serial card shows correct state when all serials available

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add 5 serial numbers to item (all status = available) | Serials added |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check header | Shows "Total: 5" |
| 4 | Check status line | Shows "5 available" in green |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-10: Serial Card - Mixed Status

**Objective:** Verify serial card shows breakdown when serials have mixed statuses

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Have serials with 3 available and 2 checked out | Data ready |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check status line | Shows "3 available · 2 checked out" |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-11: Serial Card - All Checked Out

**Objective:** Verify serial card shows correct state when all serials checked out

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check out all serials for an item | Serials checked out |
| 2 | Navigate to item detail page | Page loads |
| 3 | Check status line | Shows "All checked out" in amber |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-12: Manage Modal - Batch List

**Objective:** Verify batch list displays correctly in modal

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to item with multiple batches | Page loads |
| 2 | Click "Manage →" on Batches card | Modal opens |
| 3 | Check modal header | Shows "Manage Batches" with item name |
| 4 | Check helper text | Shows "System auto-picks oldest first. Tap a batch to use it instead." |
| 5 | Verify batch list | All active batches displayed with lot number, expiry, quantity |
| 6 | Check batch with expiring status | Shows colored status label |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-13: Manage Modal - Serial List

**Objective:** Verify serial list displays correctly in modal

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to item with multiple serials | Page loads |
| 2 | Click "Manage →" on Serials card | Modal opens |
| 3 | Check modal header | Shows "Manage Serials" with item name |
| 4 | Verify serial list | All serials displayed with serial number and status badge |
| 5 | Check available serial | Shows "Available" badge in green |
| 6 | Check checked out serial | Shows "Checked out" badge in amber, with assignee name |
| 7 | Verify checked out serial is not selectable | Item appears disabled/grayed out |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-14: Manage Modal - Override Selection (Batch)

**Objective:** Verify user can select a specific batch to override auto-pick

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Manage modal for batches | Modal opens |
| 2 | Tap on a batch item | Batch becomes selected (highlighted, checkmark visible) |
| 3 | Check override section | Quantity input appears with "Override: Use this batch instead of auto-pick" |
| 4 | Enter quantity | Input accepts value |
| 5 | Check max validation | Cannot enter more than batch's available quantity |
| 6 | Click "Use This Batch" button | Action triggered (check console for now) |
| 7 | Tap same batch again | Selection is cleared |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-15: Manage Modal - Override Selection (Serial)

**Objective:** Verify user can select a specific serial to override auto-pick

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Manage modal for serials | Modal opens |
| 2 | Tap on an available serial | Serial becomes selected (highlighted) |
| 3 | Tap on a checked-out serial | Nothing happens (disabled) |
| 4 | Tap selected serial again | Selection is cleared |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-16: Manage Modal - Add Batch

**Objective:** Verify user can add new batch from modal

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Manage modal for batches | Modal opens |
| 2 | Click "+ Add Batch" button | CreateLotModal opens on top |
| 3 | Fill in batch details (qty, lot number, expiry) | Form accepts input |
| 4 | Submit form | Modal closes, new batch appears in list |
| 5 | Check item detail page | Total quantity updated |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-17: Manage Modal - Add Serial

**Objective:** Verify user can add new serial from modal

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Manage modal for serials | Modal opens |
| 2 | Click "+ Add Serial" button | Input field appears inline |
| 3 | Enter serial number | Input accepts value |
| 4 | Click "Add" button | Serial added, appears in list |
| 5 | Check item detail page | Total count updated |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-18: Manage Modal - Empty State

**Objective:** Verify modal shows correct empty state

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Manage modal for item with no batches/serials | Modal opens |
| 2 | Check body content | Shows empty state illustration with helpful message |
| 3 | Verify "+ Add" button works | Can add first batch/serial |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-19: Manage Modal - Close Behavior

**Objective:** Verify modal closes correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Manage modal | Modal opens |
| 2 | Click X button | Modal closes |
| 3 | Open modal again | Modal opens |
| 4 | Click backdrop (outside modal) | Modal closes |
| 5 | Open modal again | Modal opens |
| 6 | Click "Close" button | Modal closes |
| 7 | Open modal, make selection, close | Selection is cleared on next open |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-20: Mobile Responsiveness

**Objective:** Verify UI works on mobile viewport

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set viewport to 375px width (iPhone) | Viewport changed |
| 2 | Navigate to item detail page with batches | Page loads |
| 3 | Check Batches card layout | Card fills width, text readable |
| 4 | Open Manage modal | Modal opens, fills screen appropriately |
| 5 | Check batch list scrolling | List scrolls smoothly if many items |
| 6 | Test selection on touch | Tap selects batch correctly |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-21: Loading States

**Objective:** Verify loading states display correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Manage modal | Loading spinner appears briefly |
| 2 | Throttle network in DevTools | Loading state visible longer |
| 3 | Check loading spinner | Centered, animated |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-22: Error Handling

**Objective:** Verify errors are handled gracefully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Disconnect network | Network offline |
| 2 | Open Manage modal | Error message displays |
| 3 | Check error UI | Red alert box with message |
| 4 | Reconnect and refresh | Data loads correctly |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Regression Tests

### RT-01: Old Components Removed

**Objective:** Verify old complex UI is no longer visible

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to batch-tracked item | Page loads |
| 2 | Check for "FEFO Pick Helper" | NOT visible |
| 3 | Check for "Tracking & Traceability" card | NOT visible |
| 4 | Check for "Lot / Expiry" badge | NOT visible |
| 5 | Check for expandable lots panel | NOT visible |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### RT-02: Item Quick Actions Still Work

**Objective:** Verify quantity adjustments still work

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to standard item | Page loads |
| 2 | Use +/- buttons to adjust quantity | Quantity updates |
| 3 | Navigate to batch-tracked item | Page loads |
| 4 | Verify quick actions show "Managed via lots" | Read-only display |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### RT-03: Other Page Sections Unaffected

**Objective:** Verify other parts of item detail page work

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check Location card | Displays correctly |
| 2 | Check Pricing card | Displays correctly |
| 3 | Check Identifiers card | Displays correctly |
| 4 | Check Tags card | Displays correctly |
| 5 | Check QR/Barcode section | Displays correctly |
| 6 | Check Checkout section | Displays correctly |
| 7 | Check Activity History | Displays correctly |

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Test Summary

| Category | Total | Pass | Fail | Blocked |
|----------|-------|------|------|---------|
| Batch Card | 7 | | | |
| Serial Card | 4 | | | |
| Manage Modal | 9 | | | |
| Mobile/Loading/Error | 3 | | | |
| Regression | 3 | | | |
| **Total** | **26** | | | |

**Tested By:** _______________
**Date:** _______________
**Build/Commit:** _______________
