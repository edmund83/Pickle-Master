# Label Studio E2E Test Plan

**Date:** 2026-02-03
**Component:** `components/labels/LabelWizard.tsx`
**Test File:** `e2e/label-studio.spec.ts`
**Coverage Level:** Comprehensive UX

## Overview

Playwright tests for the Label Studio feature - a modal wizard for generating printable QR code and barcode labels with configurable output, sizes, and content options.

## Test Structure

```
e2e/label-studio.spec.ts
├── Modal Lifecycle (5 tests)
├── Output Selection (4 tests)
├── Label Type (4 tests)
├── Label Size & Accuracy (6 tests)
├── Label Size Validation (4 tests)
├── Content & Extras (5 tests)
├── Action Buttons (5 tests)
├── Mobile/Responsive (4 tests)
└── Error & Edge Cases (4 tests)
```

**Total: 37 test scenarios**

---

## Test Scenarios

### 1. Modal Lifecycle (5 tests)

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| 1.1 | Open modal | Click "Print Label" button | Modal visible with item name in header |
| 1.2 | Close via X | Click X button | Modal closes |
| 1.3 | Close via Cancel | Click Cancel button | Modal closes |
| 1.4 | Close via Escape | Press Escape key | Modal closes |
| 1.5 | Backdrop click | Click outside modal | Modal closes |

### 2. Output Selection (4 tests)

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| 2.1 | Default state | Open modal | "Paper sheet" selected, US Letter default |
| 2.2 | Switch to Label printer | Click "Label printer" card | Footer shows "Label printer", quantity = 1 |
| 2.3 | Switch paper size | Click "A4" | Preview pills update to "210mm × 297mm" |
| 2.4 | Switch back to PDF | Click "Paper sheet" | Restores full sheet quantity |

### 3. Label Type (4 tests)

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| 3.1 | Default QR | Open modal | QR code selected, preview shows QR |
| 3.2 | Switch to Barcode | Click "Barcode" card | Barcode format dropdown appears |
| 3.3 | Barcode format change | Select "UPC-A" | Auto-detect info updates |
| 3.4 | Invalid barcode | Enter invalid value | Error message displayed |

### 4. Label Size Selection (6 tests)

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| 4.1 | Large (4×6) | Select "Large" | Preview shows 4in × 6in, 2/sheet, supports photo/logo/note |
| 4.2 | Medium (4×2.25) | Select "Medium" | Preview shows 4in × 2.25in, maxDetails=2, no photo/logo |
| 4.3 | Medium Long (4×1) | Select "Medium long" | Preview shows 4in × 1in, maxDetails=1 |
| 4.4 | Medium Tall (2×4) | Select "Medium tall" | Preview shows 2in × 4in, supports photo but no logo |
| 4.5 | Small (2×1) | Select "Small" | Preview shows 2in × 1in, maxDetails=0, info message shown |
| 4.6 | Barcode Medium | Switch to Barcode type | Only "Medium" (2×0.75) available |

### 5. Label Size Accuracy Validation (4 tests)

| # | Scenario | Verification | Expected Result |
|---|----------|--------------|-----------------|
| 5.1 | Preview pills match size | Check preview area chips | Dimensions match selected size exactly |
| 5.2 | Labels per sheet (Large) | US Letter + Large | Shows "2/sheet" in preview & footer |
| 5.3 | Labels per sheet (Small) | US Letter + Small | Shows correct count in preview & footer |
| 5.4 | Compatible products shown | Select Large | "4x6 Shipping Labels" displayed |

### 6. Content & Extras (5 tests)

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| 6.1 | Detail selection | Click Price chip | Price added to preview, shows "Up to 3" |
| 6.2 | Max details enforced | Try adding 4th detail on Large | Only 3 selectable |
| 6.3 | Photo selection | Click item photo | Photo appears in preview |
| 6.4 | Photo upload | Upload new image | Preview updates with uploaded image |
| 6.5 | Remove photo | Click "Remove" | Photo removed from preview |

### 7. Action Buttons (5 tests)

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| 7.1 | Download PDF | Click "Download PDF" | Loading spinner shown, PDF file downloads |
| 7.2 | Print button | Click "Print" | Loading spinner, print dialog opens |
| 7.3 | Buttons disabled while generating | Click Download | Both buttons show disabled state |
| 7.4 | Label printer mode | Switch to Label printer | Only "Print Label" button shown (no Download) |
| 7.5 | Barcode saved info | Generate barcode for item without one | Info message "barcode will be saved" visible |

### 8. Mobile/Responsive (4 tests)

| # | Scenario | Viewport | Expected Result |
|---|----------|----------|-----------------|
| 8.1 | Mobile toggle visible | 375×667 | Settings/Preview toggle buttons appear |
| 8.2 | Settings view default | Mobile | Settings panel visible, preview hidden |
| 8.3 | Switch to Preview | Click "Preview" toggle | Preview visible, settings hidden |
| 8.4 | Desktop shows both | 1280×800 | Both panels visible side-by-side |

### 9. Error & Edge Cases (4 tests)

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| 9.1 | Empty manual barcode | Select manual, leave empty, click Download | Error "Please enter a barcode value" |
| 9.2 | Invalid barcode format | Enter "ABC" with UPC-A format | Validation error shown |
| 9.3 | Numeric format disabled | Select EAN-13 format | Auto-generate option disabled |
| 9.4 | Preview updates live | Change any setting | Preview reflects change without action |

---

## Test Data & Setup

### Prerequisites

- Use existing `TEST_ITEM_ID` from `inventory-detail.spec.ts`
- Item should have: name, SKU, price, at least one photo

### Helper Functions

```typescript
import { test, expect, Page } from '@playwright/test'

const TEST_ITEM_ID = 'c0accf5f-d3f5-4360-b901-93cdd2bac038'

// Open Label Studio modal from item detail page
async function openLabelStudio(page: Page) {
  await page.goto(`/inventory/${TEST_ITEM_ID}`)
  await page.waitForLoadState('domcontentloaded')
  await page.locator('h1').filter({ hasNotText: 'Item Details' }).first().waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: /print label/i }).click()
  await page.getByText('Label Studio').waitFor({ state: 'visible' })
}

// Wait for preview to update after config change
async function waitForPreviewUpdate(page: Page) {
  await page.waitForTimeout(300) // Debounce for QR/barcode generation
}

// Get preview dimension pills
function getPreviewPills(page: Page) {
  return page.locator('.rounded-full.border.border-neutral-200.bg-white\\/80')
}

// Select a label size from dropdown
async function selectLabelSize(page: Page, sizeName: string) {
  const dropdown = page.locator('select').filter({ hasText: /Large|Medium|Small/ })
  await dropdown.selectOption({ label: new RegExp(sizeName) })
  await waitForPreviewUpdate(page)
}
```

---

## Key Selectors

| Element | Selector |
|---------|----------|
| Modal | `[role="dialog"][aria-label="Create label"]` |
| Output cards | Button containing "Paper sheet" or "Label printer" |
| Label type cards | Button containing "QR code" or "Barcode" |
| Label size dropdown | `select` within "Label Size" section |
| Paper size cards | Button containing "US Letter" or "A4" |
| Preview pills | `.rounded-full` pills in preview area |
| Download button | `button:has-text("Download PDF")` |
| Print button | `button:has-text("Print")` |
| Close button | `button[aria-label="Close"]` |
| Cancel button | `button:has-text("Cancel")` |
| Mobile toggle | Buttons "Settings" / "Preview" in mobile view |
| Error alert | `[role="alert"]` |

---

## Implementation Notes

1. **QR/Barcode Generation**: Preview updates are async - use `waitForPreviewUpdate()` helper
2. **PDF Download**: Use Playwright's download handling to verify file generation
3. **Print Dialog**: Cannot fully test native print dialog - verify window.open is called
4. **Mobile Tests**: Use `page.setViewportSize()` before navigation
5. **Photo Upload**: Use `page.setInputFiles()` for file input testing

---

## Out of Scope

- PDF content validation (requires PDF parsing library)
- Actual printing verification
- Email sending verification
- Cross-browser testing (Chromium only per config)
