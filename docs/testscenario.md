# StockZip Mobile QA Test Scenarios

> **Version:** 1.0
> **Last Updated:** January 2026
> **Total Scenarios:** 450
> **Purpose:** Comprehensive mobile QA checklist for simulating real user workflows

---

## How to Use This Checklist

1. **Before Testing:** Ensure you have a test account with appropriate plan features enabled
2. **Testing Environment:** Test on both iOS and Android devices
3. **Network Conditions:** Test under various network conditions (4G, 3G, WiFi, Offline)
4. **Mark Status:** Use ✅ Pass, ❌ Fail, ⏭️ Skipped, 🔄 Retest
5. **Notes Field:** Tag coverage and evidence (e.g., `[E2E][DI][D]`, test run ID, trace link, DB check)

## Test Strategy (Layered Coverage)

- Primary goal: verify UI behavior and data integrity for every scenario.
- Execute each scenario using the "Primary coverage" defined in the matrix below.
- Run the DI checklist whenever a scenario creates/updates/deletes data or changes status.
- Prefer automation where possible (Vitest for U/I, Playwright for E2E), then validate device-only paths manually.

### Coverage Legend

- U = Unit tests (business logic, validators, calculations)
- I = Integration tests (component + API wiring)
- E2E = End-to-end tests (full user journeys)
- DI = Data integrity verification (DB read-back + constraints + audit)
- V = Visual regression (key screens and PDFs)
- D = Device/hardware (camera, push notifications, printers, offline)
- P = Performance (throughput, latency, load)
- A = Accessibility (screen reader, contrast, focus)
- S = Security/permissions (roles, RLS, isolation)

### Data Integrity Checklist (DI)

- Verify the record exists with correct fields after create/update (or is absent after delete).
- Verify derived totals and status transitions (dashboard KPIs, report totals, item status).
- Verify audit log entries and user attribution for the action.
- Verify role isolation (other roles cannot see or mutate restricted data).
- Verify idempotency (retry does not create duplicates or double-count).
- Offline scenarios: verify queued changes sync correctly and resolve conflicts.

### Scenario Coverage Matrix

| Section | Scenario range | Primary coverage | DI requirement |
|---|---|---|---|
| Authentication & Onboarding | 1-15 | E2E + S | Required |
| Dashboard & Navigation | 16-35 | E2E + V + P | Sample |
| Inventory Items - Create | 36-55 | E2E + U/I | Required |
| Inventory Items - Read & View | 56-70 | E2E + V | Sample |
| Inventory Items - Update | 71-90 | E2E + U/I | Required |
| Inventory Items - Delete | 91-100 | E2E | Required |
| Folders & Categories | 101-115 | E2E | Required |
| Search & Filtering | 116-130 | E2E + P | Sample |
| Barcode & QR Scanning | 131-150 | E2E + D | Required |
| Check-In / Check-Out | 151-170 | E2E | Required |
| Purchase Orders | 171-190 | E2E | Required |
| Goods Receiving | 191-205 | E2E + D | Required |
| Pick Lists | 206-225 | E2E | Required |
| Sales Orders | 226-235 | E2E | Required |
| Delivery Orders | 236-250 | E2E | Required |
| Invoices | 251-265 | E2E | Required |
| Stock Counts | 266-280 | E2E + D | Required |
| Reorder Suggestions | 281-290 | E2E + P | Required |
| Lot & Batch Tracking | 291-300 | E2E | Required |
| Serial Number Tracking | 301-310 | E2E + D | Required |
| Reminders & Alerts | 311-320 | E2E | Sample |
| Notifications | 321-330 | E2E + D | Sample |
| Reports | 331-340 | E2E + V | Required |
| Labels & Printing | 341-350 | E2E + D + V | Sample |
| Team & Permissions | 351-360 | E2E + S | Required |
| Settings | 361-375 | E2E | Required |
| Vendors & Customers | 376-385 | E2E | Required |
| Data Import/Export | 386-395 | E2E + P | Required |
| Offline Mode | 396-410 | E2E + D | Required |
| AI Assistant (Ask Zoe) | 411-420 | E2E | Sample |
| Performance & Edge Cases | 421-440 | P + E2E | Sample |
| Accessibility | 441-450 | A + E2E | N/A |

---

## 1. Authentication & Onboarding (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 1 | Sign up with email and password on mobile | ☐ | |
| 2 | Sign up with Google OAuth on mobile | ☐ | |
| 3 | Sign in with existing email/password credentials | ☐ | |
| 4 | Sign in with Google OAuth | ☐ | |
| 5 | Reset password via email link on mobile | ☐ | |
| 6 | Sign out from the app | ☐ | |
| 7 | Session persists after closing and reopening app | ☐ | |
| 8 | Session expires after prolonged inactivity | ☐ | |
| 9 | Complete onboarding flow to add first item | ☐ | |
| 10 | Skip onboarding and navigate to dashboard | ☐ | |
| 11 | View and accept terms of service during signup | ☐ | |
| 12 | Error message displayed for invalid email format | ☐ | |
| 13 | Error message displayed for weak password | ☐ | |
| 14 | Error message displayed for incorrect login credentials | ☐ | |
| 15 | Navigate back to login from signup screen | ☐ | |

---

## 2. Dashboard & Navigation (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 16 | Dashboard loads within 2 seconds on 4G connection | ☐ | |
| 17 | View total inventory count on dashboard | ☐ | |
| 18 | View total inventory value on dashboard | ☐ | |
| 19 | View low stock alerts count on dashboard | ☐ | |
| 20 | View out of stock count on dashboard | ☐ | |
| 21 | View recent activity feed on dashboard | ☐ | |
| 22 | Tap on low stock alert card to see list of low stock items | ☐ | |
| 23 | Tap on out of stock card to see out of stock items | ☐ | |
| 24 | Navigate to Inventory via bottom navigation | ☐ | |
| 25 | Navigate to Tasks via bottom navigation | ☐ | |
| 26 | Navigate to Scan via bottom navigation | ☐ | |
| 27 | Navigate to Settings via hamburger menu | ☐ | |
| 28 | Pull to refresh dashboard data | ☐ | |
| 29 | Dashboard KPIs update after item quantity changes | ☐ | |
| 30 | Expand Tasks sub-menu in sidebar navigation | ☐ | |
| 31 | Collapse Tasks sub-menu in sidebar | ☐ | |
| 32 | View notification badge count in navigation | ☐ | |
| 33 | Navigate using breadcrumbs | ☐ | |
| 34 | Dark mode toggle (if available) updates UI correctly | ☐ | |
| 35 | Swipe left/right gesture navigation (if enabled) | ☐ | |

---

## 3. Inventory Items - Create (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 36 | Add new item with name and quantity only | ☐ | |
| 37 | Add new item with all fields filled (name, SKU, quantity, price, notes) | ☐ | |
| 38 | Add item with auto-generated SKU | ☐ | |
| 39 | Add item with manual SKU entry | ☐ | |
| 40 | Add item with minimum stock threshold | ☐ | |
| 41 | Add item with unit cost/price | ☐ | |
| 42 | Add item and assign to existing folder | ☐ | |
| 43 | Add item with photo from camera | ☐ | |
| 44 | Add item with photo from gallery | ☐ | |
| 45 | Add item with multiple photos | ☐ | |
| 46 | Add item with tags | ☐ | |
| 47 | Add item with custom field values | ☐ | |
| 48 | Add item with barcode by scanning | ☐ | |
| 49 | Add item with barcode by manual entry | ☐ | |
| 50 | Add item with tracking mode set to "Lot" | ☐ | |
| 51 | Add item with tracking mode set to "Serial" | ☐ | |
| 52 | Add item with shipping dimensions (weight, length, width, height) | ☐ | |
| 53 | Form validation prevents saving without required fields | ☐ | |
| 54 | Success toast displayed after item creation | ☐ | |
| 55 | Item appears in inventory list immediately after creation | ☐ | |

---

## 4. Inventory Items - Read & View (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 56 | View inventory list with item cards | ☐ | |
| 57 | View item detail page by tapping on item | ☐ | |
| 58 | View item photo gallery on detail page | ☐ | |
| 59 | Pinch to zoom on item photo | ☐ | |
| 60 | Swipe through multiple item photos | ☐ | |
| 61 | View item stock status indicator (green/yellow/red) | ☐ | |
| 62 | View item quantity clearly on card | ☐ | |
| 63 | View item SKU on detail page | ☐ | |
| 64 | View item notes on detail page | ☐ | |
| 65 | View custom field values on detail page | ☐ | |
| 66 | View item's folder/category on detail page | ☐ | |
| 67 | View item's QR code on detail page | ☐ | |
| 68 | View item's barcode on detail page | ☐ | |
| 69 | View lot information for lot-tracked items | ☐ | |
| 70 | View serial numbers for serial-tracked items | ☐ | |

---

## 5. Inventory Items - Update (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 71 | Edit item name from detail page | ☐ | |
| 72 | Edit item quantity using +/- quick action buttons | ☐ | |
| 73 | Edit item quantity by entering exact number | ☐ | |
| 74 | Edit item price/cost | ☐ | |
| 75 | Edit item notes | ☐ | |
| 76 | Edit item minimum stock threshold | ☐ | |
| 77 | Move item to different folder | ☐ | |
| 78 | Add additional photo to existing item | ☐ | |
| 79 | Remove photo from item | ☐ | |
| 80 | Set photo as primary/cover image | ☐ | |
| 81 | Add tags to existing item | ☐ | |
| 82 | Remove tags from item | ☐ | |
| 83 | Update custom field values | ☐ | |
| 84 | Changes auto-save while editing | ☐ | |
| 85 | Undo recent quantity change within 30 seconds | ☐ | |
| 86 | Edit multiple items in bulk (select mode) | ☐ | |
| 87 | Bulk update category/folder for multiple items | ☐ | |
| 88 | Bulk update tags for multiple items | ☐ | |
| 89 | Activity log updates after edit | ☐ | |
| 90 | Last modified timestamp updates after edit | ☐ | |

---

## 6. Inventory Items - Delete (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 91 | Delete single item with confirmation dialog | ☐ | |
| 92 | Cancel delete operation in confirmation dialog | ☐ | |
| 93 | Undo delete within 30 seconds | ☐ | |
| 94 | Delete multiple items in bulk | ☐ | |
| 95 | Deleted item removed from inventory list | ☐ | |
| 96 | Dashboard counts update after deletion | ☐ | |
| 97 | Cannot delete item that is checked out (warning shown) | ☐ | |
| 98 | Swipe to delete gesture (if enabled) | ☐ | |
| 99 | Confirmation shows item name being deleted | ☐ | |
| 100 | Activity log records deletion | ☐ | |

---

## 7. Folders & Categories (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 101 | Create new folder from inventory screen | ☐ | |
| 102 | Create nested folder (subfolder) | ☐ | |
| 103 | View folder tree in navigation | ☐ | |
| 104 | Navigate into folder to see contents | ☐ | |
| 105 | Navigate back using breadcrumbs | ☐ | |
| 106 | View folder summary (item count, total value) | ☐ | |
| 107 | Rename existing folder | ☐ | |
| 108 | Delete empty folder | ☐ | |
| 109 | Delete folder with items (move items or cascade) | ☐ | |
| 110 | Drag and drop item into folder | ☐ | |
| 111 | Drag and drop folder to reorder | ☐ | |
| 112 | Move multiple items to folder via bulk action | ☐ | |
| 113 | Search finds items across all folders | ☐ | |
| 114 | Filter inventory by specific folder | ☐ | |
| 115 | Expand/collapse folder tree on mobile | ☐ | |

---

## 8. Search & Filtering (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 116 | Search by item name (partial match) | ☐ | |
| 117 | Search by SKU | ☐ | |
| 118 | Search by barcode | ☐ | |
| 119 | Search by notes content | ☐ | |
| 120 | Search results appear within 200ms | ☐ | |
| 121 | Filter by stock status (in stock/low/out) | ☐ | |
| 122 | Filter by folder/category | ☐ | |
| 123 | Filter by tag | ☐ | |
| 124 | Combine multiple filters | ☐ | |
| 125 | Clear all filters with one tap | ☐ | |
| 126 | Sort by name (A-Z, Z-A) | ☐ | |
| 127 | Sort by quantity (high to low, low to high) | ☐ | |
| 128 | Sort by date modified | ☐ | |
| 129 | Sort by value | ☐ | |
| 130 | Search history shows recent searches | ☐ | |

---

## 9. Barcode & QR Scanning (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 131 | Open scanner from bottom navigation | ☐ | |
| 132 | Scanner activates camera successfully | ☐ | |
| 133 | Scan QR code to find existing item | ☐ | |
| 134 | Scan barcode (Code 128) to find item | ☐ | |
| 135 | Scan barcode (UPC) to find item | ☐ | |
| 136 | Scan barcode (EAN-13) to find item | ☐ | |
| 137 | Item details show within 1 second of scan | ☐ | |
| 138 | Unknown barcode prompts "Add new item?" | ☐ | |
| 139 | Add new item with scanned barcode pre-filled | ☐ | |
| 140 | Scan to adjust quantity (+/-) via quick modal | ☐ | |
| 141 | Batch scanning mode for inventory counts | ☐ | |
| 142 | Scan multiple items in batch mode continuously | ☐ | |
| 143 | Scanner works in low-light conditions | ☐ | |
| 144 | Flashlight toggle during scanning | ☐ | |
| 145 | Manual barcode entry fallback | ☐ | |
| 146 | Scanning works offline (queued for sync) | ☐ | |
| 147 | Audio/haptic feedback on successful scan | ☐ | |
| 148 | Scanner frame guides barcode alignment | ☐ | |
| 149 | Switch between front and rear camera | ☐ | |
| 150 | Close scanner and return to previous screen | ☐ | |

---

## 10. Check-In / Check-Out (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 151 | Check out item to a person | ☐ | |
| 152 | Check out item to a job/project | ☐ | |
| 153 | Check out item to a location | ☐ | |
| 154 | Set due date for checkout | ☐ | |
| 155 | Check out with notes | ☐ | |
| 156 | Check out multiple items (bulk checkout) | ☐ | |
| 157 | Checked out item shows status "Checked Out" | ☐ | |
| 158 | View "My Checked Out Items" list | ☐ | |
| 159 | Check in item by scanning | ☐ | |
| 160 | Check in item manually from list | ☐ | |
| 161 | Record return condition (good, damaged, needs repair) | ☐ | |
| 162 | Add return notes during check-in | ☐ | |
| 163 | Item status returns to "Available" after check-in | ☐ | |
| 164 | View overdue items on dashboard | ☐ | |
| 165 | Receive reminder 24 hours before due date | ☐ | |
| 166 | View checkout history for an item | ☐ | |
| 167 | View items checked out by specific person | ☐ | |
| 168 | Check out serial-tracked item with serial selection | ☐ | |
| 169 | Check in serial-tracked item returns correct serial | ☐ | |
| 170 | Cannot check out item with zero quantity | ☐ | |

---

## 11. Purchase Orders (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 171 | Create new purchase order | ☐ | |
| 172 | Select vendor from dropdown | ☐ | |
| 173 | Add new vendor inline during PO creation | ☐ | |
| 174 | Add line items from inventory search | ☐ | |
| 175 | Filter items by low-stock only during item selection | ☐ | |
| 176 | Enter quantity and unit price per line item | ☐ | |
| 177 | Enter part number per line item | ☐ | |
| 178 | View auto-calculated subtotal and total | ☐ | |
| 179 | Set expected delivery date | ☐ | |
| 180 | Add ship-to address | ☐ | |
| 181 | Add bill-to address | ☐ | |
| 182 | Use "Same as Ship To" for bill-to address | ☐ | |
| 183 | Save PO as draft | ☐ | |
| 184 | Submit PO (draft → submitted) | ☐ | |
| 185 | Mark PO as confirmed | ☐ | |
| 186 | Cancel PO | ☐ | |
| 187 | View PO display ID (e.g., PO-ACM01-00001) | ☐ | |
| 188 | View PO detail page with all information | ☐ | |
| 189 | Download PO as PDF | ☐ | |
| 190 | Navigate to "Receive Items" from PO detail | ☐ | |

---

## 12. Goods Receiving (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 191 | Create receive from pending PO | ☐ | |
| 192 | PO items pre-populate in receive with remaining quantities | ☐ | |
| 193 | Adjust received quantity per item | ☐ | |
| 194 | Enter lot number during receive (for lot-tracked items) | ☐ | |
| 195 | Enter batch code and expiry date during receive | ☐ | |
| 196 | Enter serial numbers during receive (for serial-tracked items) | ☐ | |
| 197 | Scan serial numbers using barcode scanner | ☐ | |
| 198 | Bulk enter serial numbers (paste multiple) | ☐ | |
| 199 | Assign received items to location | ☐ | |
| 200 | Set item condition (good, damaged, rejected) | ☐ | |
| 201 | Complete receive (updates inventory quantities) | ☐ | |
| 202 | PO status updates (partial/received) after receive | ☐ | |
| 203 | Cancel receive before completion | ☐ | |
| 204 | View receive display ID (e.g., RCV-ACM01-00001) | ☐ | |
| 205 | View all receives for a PO | ☐ | |

---

## 13. Pick Lists (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 206 | Create new pick list | ☐ | |
| 207 | Add items to pick list | ☐ | |
| 208 | Set ship-to address for pick list | ☐ | |
| 209 | Assign pick list to team member | ☐ | |
| 210 | Set due date for pick list | ☐ | |
| 211 | Select item outcome (decrement, checkout, transfer) | ☐ | |
| 212 | View pick list display ID (e.g., PL-ACM01-00001) | ☐ | |
| 213 | Start picking (draft → in progress) | ☐ | |
| 214 | View item locations for picking guidance | ☐ | |
| 215 | Pick item with full quantity | ☐ | |
| 216 | Pick item with partial quantity | ☐ | |
| 217 | View progress bar showing pick completion | ☐ | |
| 218 | Complete pick list with all items picked | ☐ | |
| 219 | Complete partial pick list | ☐ | |
| 220 | Cancel pick list | ☐ | |
| 221 | Download pick list as PDF | ☐ | |
| 222 | Create delivery order from completed pick list | ☐ | |
| 223 | Scan items to mark as picked | ☐ | |
| 224 | View assigned pick lists (My Pick Lists) | ☐ | |
| 225 | View pick list from sales order ("Start Picking" button) | ☐ | |

---

## 14. Sales Orders (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 226 | View sales orders list | ☐ | |
| 227 | View sales order detail page | ☐ | |
| 228 | View customer information on sales order | ☐ | |
| 229 | View order line items with quantities and prices | ☐ | |
| 230 | Confirm sales order | ☐ | |
| 231 | Cancel sales order | ☐ | |
| 232 | Start picking from confirmed sales order | ☐ | |
| 233 | Download sales order as PDF | ☐ | |
| 234 | View order status workflow progression | ☐ | |
| 235 | Navigate to related pick list from sales order | ☐ | |

---

## 15. Delivery Orders (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 236 | View delivery orders list | ☐ | |
| 237 | Create delivery order from completed pick list | ☐ | |
| 238 | Create standalone delivery order (without sales order) | ☐ | |
| 239 | Select customer for standalone delivery order | ☐ | |
| 240 | Add items to standalone delivery order | ☐ | |
| 241 | View delivery order detail page | ☐ | |
| 242 | View "Direct" badge for standalone delivery orders | ☐ | |
| 243 | Mark delivery order as ready | ☐ | |
| 244 | Dispatch delivery order | ☐ | |
| 245 | Complete delivery order | ☐ | |
| 246 | Cancel delivery order | ☐ | |
| 247 | View ship-to address on delivery order | ☐ | |
| 248 | Download delivery order as PDF | ☐ | |
| 249 | Navigate to create invoice from delivery order | ☐ | |
| 250 | View delivery order status in sticky footer | ☐ | |

---

## 16. Invoices (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 251 | View invoices list | ☐ | |
| 252 | Create new invoice | ☐ | |
| 253 | Create invoice from delivery order | ☐ | |
| 254 | Add line items to invoice using search | ☐ | |
| 255 | Add line items by scanning barcode | ☐ | |
| 256 | Edit line item quantity and price | ☐ | |
| 257 | Remove line item from invoice | ☐ | |
| 258 | View invoice totals (subtotal, tax, total) | ☐ | |
| 259 | Mark invoice as pending | ☐ | |
| 260 | Send invoice (update status) | ☐ | |
| 261 | Mark invoice as paid | ☐ | |
| 262 | Cancel invoice | ☐ | |
| 263 | Download invoice as PDF | ☐ | |
| 264 | View balance due callout on invoice | ☐ | |
| 265 | View sticky footer with status actions | ☐ | |

---

## 17. Stock Counts (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 266 | Create new stock count | ☐ | |
| 267 | Select scope for stock count (all, folder, custom) | ☐ | |
| 268 | Assign stock count to team member | ☐ | |
| 269 | Start stock count (draft → in progress) | ☐ | |
| 270 | View items to count with expected quantities | ☐ | |
| 271 | Enter counted quantity for item | ☐ | |
| 272 | View variance calculation (counted vs expected) | ☐ | |
| 273 | Scan items during stock count | ☐ | |
| 274 | Search/filter items within stock count | ☐ | |
| 275 | View progress bar (counted vs total) | ☐ | |
| 276 | Submit stock count for review | ☐ | |
| 277 | Complete stock count and apply adjustments | ☐ | |
| 278 | Cancel stock count | ☐ | |
| 279 | View stock count display ID (e.g., SC-ACM01-00001) | ☐ | |
| 280 | View variance summary on completion | ☐ | |

---

## 18. Reorder Suggestions (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 281 | View reorder suggestions page | ☐ | |
| 282 | View items grouped by vendor | ☐ | |
| 283 | View urgency indicators (critical, urgent, reorder) | ☐ | |
| 284 | View estimated total per vendor group | ☐ | |
| 285 | Create PO from vendor group suggestions | ☐ | |
| 286 | Set reorder point on item | ☐ | |
| 287 | Set reorder quantity on item | ☐ | |
| 288 | Link item to vendor with preferred pricing | ☐ | |
| 289 | View reorder count badge in navigation | ☐ | |
| 290 | Refresh reorder suggestions | ☐ | |

---

## 19. Lot & Batch Tracking (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 291 | View lots for lot-tracked item | ☐ | |
| 292 | View lot number, batch code, expiry date | ☐ | |
| 293 | View lot status (active, expired, depleted) | ☐ | |
| 294 | Expired lots highlighted in UI | ☐ | |
| 295 | FEFO logic consumes oldest expiring lot first | ☐ | |
| 296 | Receive inventory with new lot information | ☐ | |
| 297 | View lot quantity and depletion | ☐ | |
| 298 | Block expired lot from being used | ☐ | |
| 299 | View expiring soon report | ☐ | |
| 300 | Set expiry reminder for lot | ☐ | |

---

## 20. Serial Number Tracking (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 301 | View serial numbers for serial-tracked item | ☐ | |
| 302 | Add serial number during goods receive | ☐ | |
| 303 | Scan serial numbers using scanner | ☐ | |
| 304 | Duplicate serial detection shows warning | ☐ | |
| 305 | View serial status (available, checked out, sold) | ☐ | |
| 306 | Check out specific serial number | ☐ | |
| 307 | Check in specific serial number | ☐ | |
| 308 | Track serial in pick list/sales order | ☐ | |
| 309 | View serial history/movement | ☐ | |
| 310 | Search inventory by serial number | ☐ | |

---

## 21. Reminders & Alerts (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 311 | Create low stock reminder on item | ☐ | |
| 312 | Create expiry reminder on item | ☐ | |
| 313 | Create restock reminder on item | ☐ | |
| 314 | Set reminder recurrence (once, daily, weekly, monthly) | ☐ | |
| 315 | View reminders list page | ☐ | |
| 316 | Filter reminders by type (low stock, expiry, restock) | ☐ | |
| 317 | Edit existing reminder | ☐ | |
| 318 | Delete reminder | ☐ | |
| 319 | Pause/resume reminder | ☐ | |
| 320 | View reminder triggered status | ☐ | |

---

## 22. Notifications (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 321 | View notifications list | ☐ | |
| 322 | Receive push notification for low stock | ☐ | |
| 323 | Receive push notification for checkout overdue | ☐ | |
| 324 | Tap notification to navigate to relevant item | ☐ | |
| 325 | Mark notification as read | ☐ | |
| 326 | Mark all notifications as read | ☐ | |
| 327 | Notification badge updates in real-time | ☐ | |
| 328 | Receive email notification for low stock | ☐ | |
| 329 | Configure notification preferences | ☐ | |
| 330 | Disable notifications for specific items | ☐ | |

---

## 23. Reports (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 331 | View reports hub page | ☐ | |
| 332 | View inventory summary report | ☐ | |
| 333 | View low stock report | ☐ | |
| 334 | View inventory value report | ☐ | |
| 335 | View activity/movement report | ☐ | |
| 336 | View expiring items report | ☐ | |
| 337 | View profit margin report | ☐ | |
| 338 | View stock trends report | ☐ | |
| 339 | Export report to CSV | ☐ | |
| 340 | Filter report by date range | ☐ | |

---

## 24. Labels & Printing (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 341 | Access label wizard from item detail | ☐ | |
| 342 | Select label size (extra large to extra small) | ☐ | |
| 343 | Select barcode format (QR, Code 128, UPC, etc.) | ☐ | |
| 344 | Preview label with live updates | ☐ | |
| 345 | Include item photo on label | ☐ | |
| 346 | Include company logo on label | ☐ | |
| 347 | Print full sheet of labels | ☐ | |
| 348 | Print to label printer (thermal) | ☐ | |
| 349 | Generate PDF for labels | ☐ | |
| 350 | Print labels for multiple items in bulk | ☐ | |

---

## 25. Team & Permissions (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 351 | View team members list | ☐ | |
| 352 | Invite new team member via email | ☐ | |
| 353 | Assign role to team member (admin, editor, viewer) | ☐ | |
| 354 | Change team member's role | ☐ | |
| 355 | Remove team member from organization | ☐ | |
| 356 | Viewer cannot edit items | ☐ | |
| 357 | Editor can edit items but cannot manage team | ☐ | |
| 358 | Admin has full access | ☐ | |
| 359 | Accept team invitation as new user | ☐ | |
| 360 | View pending invitations | ☐ | |

---

## 26. Settings (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 361 | View settings menu | ☐ | |
| 362 | Edit profile (name, email) | ☐ | |
| 363 | Change password | ☐ | |
| 364 | Edit company settings (name, address, tax ID) | ☐ | |
| 365 | Upload company logo | ☐ | |
| 366 | Configure alert thresholds | ☐ | |
| 367 | Manage custom fields | ☐ | |
| 368 | Create new custom field | ☐ | |
| 369 | Delete custom field | ☐ | |
| 370 | View billing/subscription page | ☐ | |
| 371 | View current plan and usage | ☐ | |
| 372 | Upgrade plan | ☐ | |
| 373 | View payment terms settings | ☐ | |
| 374 | Configure tax rates | ☐ | |
| 375 | Enable/disable features | ☐ | |

---

## 27. Vendors & Customers (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 376 | View vendors list | ☐ | |
| 377 | Create new vendor | ☐ | |
| 378 | Edit vendor details | ☐ | |
| 379 | Delete vendor | ☐ | |
| 380 | View customers list | ☐ | |
| 381 | Create new customer | ☐ | |
| 382 | Edit customer details | ☐ | |
| 383 | Delete customer | ☐ | |
| 384 | View vendor's purchase orders | ☐ | |
| 385 | View customer's sales orders | ☐ | |

---

## 28. Data Import/Export (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 386 | Access bulk import page | ☐ | |
| 387 | Upload CSV file for import | ☐ | |
| 388 | Upload Excel file for import | ☐ | |
| 389 | Map columns during import | ☐ | |
| 390 | Preview data before import | ☐ | |
| 391 | View validation errors inline | ☐ | |
| 392 | Import with progress indicator | ☐ | |
| 393 | View import summary (success/error counts) | ☐ | |
| 394 | Export inventory to CSV | ☐ | |
| 395 | Export filtered/selected items | ☐ | |

---

## 29. Offline Mode (15 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 396 | App functions when device goes offline | ☐ | |
| 397 | Add item while offline (queued) | ☐ | |
| 398 | Edit item while offline (queued) | ☐ | |
| 399 | Adjust quantity while offline (queued) | ☐ | |
| 400 | Scan barcode while offline | ☐ | |
| 401 | View pending sync queue indicator | ☐ | |
| 402 | Changes sync automatically when back online | ☐ | |
| 403 | Sync completes within 30 seconds of reconnection | ☐ | |
| 404 | Conflict resolution modal for concurrent edits | ☐ | |
| 405 | No data loss during offline/online transition | ☐ | |
| 406 | View cached data while offline | ☐ | |
| 407 | Search works on cached data while offline | ☐ | |
| 408 | Offline indicator shown in UI | ☐ | |
| 409 | Manual sync trigger button | ☐ | |
| 410 | App works fully offline for 24+ hours | ☐ | |

---

## 30. AI Assistant (Ask Zoe) (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 411 | Open Ask Zoe AI assistant | ☐ | |
| 412 | Ask inventory-related question | ☐ | |
| 413 | Receive relevant response from Zoe | ☐ | |
| 414 | View usage limit indicator | ☐ | |
| 415 | Warning shown at 80% usage limit | ☐ | |
| 416 | Error shown when usage limit exceeded | ☐ | |
| 417 | View conversation history | ☐ | |
| 418 | Start new conversation | ☐ | |
| 419 | Ask about low stock items | ☐ | |
| 420 | Ask for inventory insights | ☐ | |

---

## 31. Performance & Edge Cases (20 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 421 | App loads within 2 seconds on 3G network | ☐ | |
| 422 | Search works smoothly with 10,000+ items | ☐ | |
| 423 | Scrolling is smooth in long inventory lists | ☐ | |
| 424 | App handles 1,000 item import without crash | ☐ | |
| 425 | App handles low memory conditions gracefully | ☐ | |
| 426 | App resumes correctly after backgrounding | ☐ | |
| 427 | App handles incoming call interruption | ☐ | |
| 428 | App handles screen rotation (portrait/landscape) | ☐ | |
| 429 | App handles keyboard appearance/dismissal | ☐ | |
| 430 | Forms preserve data when switching apps | ☐ | |
| 431 | Multiple users can edit different items simultaneously | ☐ | |
| 432 | Real-time sync between devices (< 2 seconds) | ☐ | |
| 433 | App handles server timeout gracefully | ☐ | |
| 434 | Error messages are user-friendly | ☐ | |
| 435 | Retry mechanism for failed operations | ☐ | |
| 436 | Battery usage < 5% per hour of active use | ☐ | |
| 437 | App size remains under 50MB | ☐ | |
| 438 | Deep linking to specific item works | ☐ | |
| 439 | Share item link via mobile share sheet | ☐ | |
| 440 | App handles emoji in item names/notes | ☐ | |

---

## 32. Accessibility (10 scenarios)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 441 | Touch targets are minimum 44px | ☐ | |
| 442 | Text is readable at default size | ☐ | |
| 443 | UI supports system font scaling | ☐ | |
| 444 | Color contrast meets WCAG AA standards | ☐ | |
| 445 | VoiceOver/TalkBack reads screen correctly | ☐ | |
| 446 | Focus indicators visible for all interactive elements | ☐ | |
| 447 | Error messages announced to screen readers | ☐ | |
| 448 | Forms have proper labels for accessibility | ☐ | |
| 449 | Images have alt text | ☐ | |
| 450 | One-handed operation is possible for key actions | ☐ | |

---

## Summary by Category

| Category | Count | Priority |
|----------|-------|----------|
| Authentication & Onboarding | 15 | P0 |
| Dashboard & Navigation | 20 | P0 |
| Inventory Items - Create | 20 | P0 |
| Inventory Items - Read | 15 | P0 |
| Inventory Items - Update | 20 | P0 |
| Inventory Items - Delete | 10 | P0 |
| Folders & Categories | 15 | P0 |
| Search & Filtering | 15 | P0 |
| Barcode/QR Scanning | 20 | P1 |
| Check-In/Check-Out | 20 | P1 |
| Purchase Orders | 20 | P2 |
| Goods Receiving | 15 | P2 |
| Pick Lists | 20 | P2 |
| Sales Orders | 10 | P2 |
| Delivery Orders | 15 | P2 |
| Invoices | 15 | P2 |
| Stock Counts | 15 | P2 |
| Reorder Suggestions | 10 | P2 |
| Lot & Batch Tracking | 10 | P2 |
| Serial Number Tracking | 10 | P2 |
| Reminders & Alerts | 10 | P1 |
| Notifications | 10 | P1 |
| Reports | 10 | P2 |
| Labels & Printing | 10 | P1 |
| Team & Permissions | 10 | P1 |
| Settings | 15 | P1 |
| Vendors & Customers | 10 | P2 |
| Data Import/Export | 10 | P1 |
| Offline Mode | 15 | P1 |
| AI Assistant | 10 | P2 |
| Performance & Edge Cases | 20 | P0 |
| Accessibility | 10 | P1 |
| **TOTAL** | **450** | |

---

## Test Execution Tracking

| Test Cycle | Date | Tester | Device | OS Version | Pass | Fail | Skipped | Notes |
|------------|------|--------|--------|------------|------|------|---------|-------|
| Cycle 1 | | | | | | | | |
| Cycle 2 | | | | | | | | |
| Cycle 3 | | | | | | | | |

---

## Defect Log

| # | Scenario ID | Description | Severity | Status | Assigned To | Notes |
|---|-------------|-------------|----------|--------|-------------|-------|
| | | | | | | |

---

*Document maintained by QA Team. Last updated: January 2026*
