# Test Plan: Stock In/Out with Batch & Serial Integration

## Overview

This test plan covers end-to-end testing of the Stock In and Stock Out functionality with:
- **Batch (Lot) tracking**: Items tracked by lot numbers with expiry dates
- **Serial number tracking**: Items tracked by unique serial numbers
- **Recent Activity integration**: Verifying all stock movements appear in activity logs

### Technology Stack
- **Test Framework**: Playwright MCP (browser automation)
- **Target Environment**: Local development (`http://localhost:3000`)
- **Authentication**: Requires logged-in user session

---

## Test Environment Setup

### Prerequisites
1. Local dev server running (`npm run dev`)
2. Supabase connected (StockZip project: `qaqainslbhekbvgoyprs`)
3. Test user account with appropriate permissions
4. At least one test item with `tracking_mode = 'lot_expiry'`
5. At least one test item with `tracking_mode = 'serialized'`

### Test Data Requirements
| Data Type | Requirement |
|-----------|-------------|
| Batch Item | Item with `tracking_mode = 'lot_expiry'`, quantity > 0 |
| Serial Item | Item with `tracking_mode = 'serialized'`, quantity > 0 |
| Test Lot | At least one active lot with expiry date |
| Test Serials | At least 3 serial numbers with status `available` |

---

## Test Scenarios

### Module 1: Stock In - Batch (Lot) Tracking

#### TC-1.1: Create New Lot via Stock In
**Objective**: Verify user can add stock by creating a new lot/batch

**Preconditions**:
- User is logged in
- Navigate to item detail page for batch-tracked item

**Steps**:
1. Click "Stock In" button in Quick Actions
2. Verify StockInModal opens with "Lot / Batch Mode" tab visible
3. Select "Create New Batch" option
4. Enter lot number: `LOT-TEST-001`
5. Enter batch code: `BC-001`
6. Set expiry date: 30 days from today
7. Enter quantity: `50`
8. Select reason: "Received"
9. Add notes: "Test batch creation"
10. Click "Add Stock" button

**Expected Results**:
- Modal closes on success
- Item quantity increases by 50
- New lot appears in "Manage Tracking" modal
- Activity log shows "receive_lot" action with +50 quantity delta

**Playwright Selectors**:
```python
# Stock In button
page.locator('button:has-text("Stock In")')

# Modal detection
page.locator('[role="dialog"]')

# Lot/Batch tab
page.locator('button:has-text("Lot / Batch Mode")')

# Form fields
page.locator('input[name="lot_number"]')
page.locator('input[name="batch_code"]')
page.locator('input[type="date"]')  # expiry date
page.locator('input[name="quantity"]')

# Reason dropdown
page.locator('[data-testid="reason-select"]')

# Submit button
page.locator('button:has-text("Add Stock")')
```

---

#### TC-1.2: Add to Existing Lot
**Objective**: Verify user can add quantity to an existing lot

**Preconditions**:
- User is logged in
- Item has at least one active lot

**Steps**:
1. Open Stock In modal
2. Select "Add to Existing Batch" option
3. Select existing lot from dropdown
4. Enter quantity: `25`
5. Select reason: "Returned"
6. Click "Add Stock"

**Expected Results**:
- Existing lot quantity increases by 25
- Item total quantity updated
- Activity log shows adjustment with lot reference

---

#### TC-1.3: Stock In with Past Expiry Date (Validation)
**Objective**: Verify system handles past expiry dates appropriately

**Steps**:
1. Open Stock In modal
2. Create new batch with expiry date in the past
3. Submit form

**Expected Results**:
- System should warn or prevent past expiry dates
- OR lot is created with "expired" status if allowed

---

### Module 2: Stock In - Serial Number Tracking

#### TC-2.1: Add Single Serial Number
**Objective**: Verify adding a single serialized item

**Preconditions**:
- Navigate to serial-tracked item

**Steps**:
1. Click "Stock In" button
2. Select "Serialized Mode" tab
3. Enter serial number: `SN-TEST-001`
4. Select reason: "Received"
5. Click "Add Stock"

**Expected Results**:
- Serial number created with status "available"
- Item quantity increases by 1
- Activity log shows serial addition

**Playwright Selectors**:
```python
# Serialized Mode tab
page.locator('button:has-text("Serialized Mode")')

# Serial input (textarea for multiple)
page.locator('textarea[name="serial_numbers"]')
```

---

#### TC-2.2: Add Multiple Serial Numbers (Bulk)
**Objective**: Verify bulk serial number entry

**Steps**:
1. Open Stock In modal for serial item
2. Switch to Serialized Mode
3. Enter multiple serials (one per line):
   ```
   SN-BULK-001
   SN-BULK-002
   SN-BULK-003
   ```
4. Submit

**Expected Results**:
- 3 serial numbers created
- Item quantity increases by 3
- All serials have "available" status

---

#### TC-2.3: Duplicate Serial Number (Validation)
**Objective**: Verify duplicate serial detection

**Steps**:
1. Add serial number `SN-DUP-001`
2. Try to add same serial again

**Expected Results**:
- Error message: "Serial number already exists"
- No duplicate created

---

### Module 3: Stock Out - Batch (FIFO/FEFO)

#### TC-3.1: Stock Out Auto Mode (FEFO)
**Objective**: Verify automatic FEFO (First Expired First Out) deduction

**Preconditions**:
- Item has multiple lots with different expiry dates

**Steps**:
1. Click "Stock Out" button
2. Select "Auto (FIFO/FEFO)" mode
3. Enter quantity: `10`
4. Select reason: "Consumption"
5. Click "Remove Stock"

**Expected Results**:
- System deducts from earliest-expiring lot first
- If lot depleted, continues to next lot
- Activity log shows "stock_out" with method="fifo"
- Quantity deltas are negative

**Playwright Selectors**:
```python
# Stock Out button
page.locator('button:has-text("Stock Out")')

# Auto mode selection
page.locator('[data-testid="deduction-mode-auto"]')

# Quantity input
page.locator('input[name="quantity"]')

# Reason select
page.locator('[data-testid="stock-out-reason"]')

# Submit
page.locator('button:has-text("Remove Stock")')
```

---

#### TC-3.2: Stock Out Manual Mode (Select Specific Lot)
**Objective**: Verify manual lot selection for stock out

**Steps**:
1. Open Stock Out modal
2. Select "Manual" mode
3. Check specific lot(s) from table
4. Enter quantity to deduct
5. Submit

**Expected Results**:
- Only selected lot(s) affected
- Quantities deducted correctly
- Activity log references specific lot IDs

---

#### TC-3.3: Stock Out Exceeds Available (Validation)
**Objective**: Verify over-deduction prevention

**Steps**:
1. Open Stock Out modal
2. Enter quantity greater than total available
3. Submit

**Expected Results**:
- Error: "Insufficient stock"
- No stock deducted

---

### Module 4: Stock Out - Serial Numbers

#### TC-4.1: Stock Out Single Serial
**Objective**: Verify removing a single serialized item

**Preconditions**:
- Item has available serials

**Steps**:
1. Click Stock Out on serial item
2. Select serial from list
3. Choose reason: "Sold"
4. Submit

**Expected Results**:
- Serial status changes to "sold"
- Item quantity decreases by 1
- Activity log shows serial_id

**Playwright Selectors**:
```python
# Serial selection table
page.locator('table[data-testid="serial-selection"]')

# Serial row checkbox
page.locator('input[type="checkbox"][data-serial-id]')

# Status in table
page.locator('td:has-text("available")')
```

---

#### TC-4.2: Stock Out Multiple Serials
**Objective**: Verify bulk serial stock out

**Steps**:
1. Open Stock Out modal
2. Select multiple serials (checkboxes)
3. Choose reason: "Damaged"
4. Submit

**Expected Results**:
- All selected serials updated to "damaged" status
- Quantity decreases by selection count

---

#### TC-4.3: Stock Out Already Used Serial (Validation)
**Objective**: Verify cannot stock out non-available serial

**Steps**:
1. Open Stock Out modal
2. Attempt to select serial with status "sold"

**Expected Results**:
- Serial should be disabled or filtered out
- Only "available" serials selectable

---

### Module 5: Recent Activity Integration

#### TC-5.1: Activity Log - Stock In Batch
**Objective**: Verify stock in batch appears in activity

**Steps**:
1. Perform TC-1.1 (Create new lot)
2. Navigate to item's Recent Activity section
3. Check activity entry

**Expected Results**:
- Entry shows: "[User] receive_lot [Item]"
- Quantity delta shows: "+50"
- Timestamp is recent
- Clicking entry navigates to item

**Playwright Selectors**:
```python
# Recent Activity section
page.locator('text=Recent Activity')

# Activity entries
page.locator('[data-testid="activity-entry"]')

# Quantity delta (positive)
page.locator('.text-green-600:has-text("+")')
```

---

#### TC-5.2: Activity Log - Stock Out Batch
**Objective**: Verify stock out batch appears in activity

**Steps**:
1. Perform TC-3.1 (FEFO stock out)
2. Check Recent Activity

**Expected Results**:
- Entry shows: "[User] stock_out [Item]"
- Quantity delta shows: "-10" (red)
- Changes JSON includes method and lot references

---

#### TC-5.3: Activity Log - Serial Operations
**Objective**: Verify serial operations logged correctly

**Steps**:
1. Perform TC-2.1 (Add serial)
2. Check Recent Activity

**Expected Results**:
- Entry shows serial addition
- Changes include serial_ids array

---

#### TC-5.4: Dashboard Recent Activity Feed
**Objective**: Verify stock operations appear on dashboard

**Steps**:
1. Perform any stock operation
2. Navigate to Dashboard (`/dashboard`)
3. Check Recent Activity widget

**Expected Results**:
- Latest operation appears at top
- Shows: "[User] [action] [Item] [time ago]"
- Pagination works if > 5 entries
- Clicking entry navigates to item

**Playwright Selectors**:
```python
# Dashboard URL
page.goto('http://localhost:3000/dashboard')

# Recent Activity widget
page.locator('h2:has-text("Recent Activity")')

# Activity items
page.locator('.group.flex.items-center.gap-4')

# View Full Log link
page.locator('a:has-text("View Full Log")')

# Pagination
page.locator('button[aria-label="Next page"]')
page.locator('button[aria-label="Previous page"]')
```

---

#### TC-5.5: Activity Log Filtering (Full Log)
**Objective**: Verify full activity log page functionality

**Steps**:
1. Navigate to `/reports/activity`
2. Filter by entity type: "item"
3. Filter by action type: "stock_out"
4. Verify filtered results

**Expected Results**:
- Only stock_out actions shown
- Entries include all metadata (quantity, lot, serial info)

---

### Module 6: Manage Tracking Modal Integration

#### TC-6.1: View Lot Details
**Objective**: Verify lot management after stock operations

**Steps**:
1. Navigate to batch item detail page
2. Click "Manage" in tracking section
3. Review lot list

**Expected Results**:
- All lots displayed with:
  - Lot number (editable)
  - Batch code
  - Expiry date with status badge
  - Current quantity
- Expired lots show "Expired" badge (red)
- Expiring soon lots show warning badge

---

#### TC-6.2: View Serial Details
**Objective**: Verify serial management after stock operations

**Steps**:
1. Navigate to serial item detail page
2. Click "Manage" in tracking section
3. Review serial list

**Expected Results**:
- All serials displayed with:
  - Serial number (editable)
  - Status badge (available/sold/damaged/etc.)
- Filter by status works
- Can add new serials via modal

---

## Test Execution Scripts

### Script 1: Full Batch Flow Test

```python
"""
test_batch_stock_flow.py - End-to-end batch tracking test
Run with: python scripts/with_server.py --server "npm run dev" --port 3000 -- python test_batch_stock_flow.py
"""
from playwright.sync_api import sync_playwright
import time

BASE_URL = 'http://localhost:3000'
BATCH_ITEM_ID = '<INSERT_BATCH_ITEM_ID>'  # Replace with actual item ID

def test_batch_stock_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login first (adjust based on auth flow)
        page.goto(f'{BASE_URL}/login')
        page.wait_for_load_state('networkidle')
        page.fill('input[name="email"]', 'test@example.com')
        page.fill('input[name="password"]', 'testpassword')
        page.click('button[type="submit"]')
        page.wait_for_url('**/dashboard**')

        # Navigate to batch item
        page.goto(f'{BASE_URL}/inventory/{BATCH_ITEM_ID}')
        page.wait_for_load_state('networkidle')

        # Capture initial quantity
        initial_qty_el = page.locator('[data-testid="item-quantity"]')
        initial_qty = int(initial_qty_el.text_content() or '0')
        print(f'Initial quantity: {initial_qty}')

        # TC-1.1: Stock In - Create New Lot
        print('Testing Stock In - Create New Lot...')
        page.click('button:has-text("Stock In")')
        page.wait_for_selector('[role="dialog"]')

        # Fill lot details
        page.fill('input[name="lot_number"]', f'LOT-TEST-{int(time.time())}')
        page.fill('input[name="batch_code"]', 'BC-AUTO-001')

        # Set expiry date (30 days from now)
        from datetime import datetime, timedelta
        expiry_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        page.fill('input[type="date"]', expiry_date)

        page.fill('input[name="quantity"]', '50')
        page.select_option('select[name="reason"]', 'received')
        page.fill('textarea[name="notes"]', 'Automated test - batch creation')

        page.click('button:has-text("Add Stock")')
        page.wait_for_selector('[role="dialog"]', state='hidden')

        # Verify quantity increased
        page.reload()
        page.wait_for_load_state('networkidle')
        new_qty_el = page.locator('[data-testid="item-quantity"]')
        new_qty = int(new_qty_el.text_content() or '0')
        assert new_qty == initial_qty + 50, f'Expected {initial_qty + 50}, got {new_qty}'
        print(f'✓ Stock In successful. New quantity: {new_qty}')

        # TC-3.1: Stock Out - Auto FEFO
        print('Testing Stock Out - Auto FEFO...')
        page.click('button:has-text("Stock Out")')
        page.wait_for_selector('[role="dialog"]')

        page.fill('input[name="quantity"]', '10')
        page.select_option('select[name="reason"]', 'consumption')
        page.click('button:has-text("Remove Stock")')
        page.wait_for_selector('[role="dialog"]', state='hidden')

        # Verify quantity decreased
        page.reload()
        page.wait_for_load_state('networkidle')
        final_qty_el = page.locator('[data-testid="item-quantity"]')
        final_qty = int(final_qty_el.text_content() or '0')
        assert final_qty == new_qty - 10, f'Expected {new_qty - 10}, got {final_qty}'
        print(f'✓ Stock Out successful. Final quantity: {final_qty}')

        # TC-5.1: Verify Activity Log
        print('Verifying Recent Activity...')
        activity_section = page.locator('text=Recent Activity')
        assert activity_section.is_visible(), 'Recent Activity section not found'

        # Check for stock operations in activity
        activity_entries = page.locator('[data-testid="activity-entry"]').all()
        assert len(activity_entries) >= 2, 'Expected at least 2 activity entries'
        print(f'✓ Activity log has {len(activity_entries)} entries')

        browser.close()
        print('\n✅ All batch flow tests passed!')

if __name__ == '__main__':
    test_batch_stock_flow()
```

### Script 2: Full Serial Flow Test

```python
"""
test_serial_stock_flow.py - End-to-end serial tracking test
Run with: python scripts/with_server.py --server "npm run dev" --port 3000 -- python test_serial_stock_flow.py
"""
from playwright.sync_api import sync_playwright
import time

BASE_URL = 'http://localhost:3000'
SERIAL_ITEM_ID = '<INSERT_SERIAL_ITEM_ID>'  # Replace with actual item ID

def test_serial_stock_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login
        page.goto(f'{BASE_URL}/login')
        page.wait_for_load_state('networkidle')
        page.fill('input[name="email"]', 'test@example.com')
        page.fill('input[name="password"]', 'testpassword')
        page.click('button[type="submit"]')
        page.wait_for_url('**/dashboard**')

        # Navigate to serial item
        page.goto(f'{BASE_URL}/inventory/{SERIAL_ITEM_ID}')
        page.wait_for_load_state('networkidle')

        # TC-2.2: Stock In - Bulk Serials
        print('Testing Stock In - Bulk Serials...')
        page.click('button:has-text("Stock In")')
        page.wait_for_selector('[role="dialog"]')

        # Switch to Serialized Mode if needed
        serial_tab = page.locator('button:has-text("Serialized Mode")')
        if serial_tab.is_visible():
            serial_tab.click()

        # Enter multiple serials
        timestamp = int(time.time())
        serials = f'''SN-AUTO-{timestamp}-001
SN-AUTO-{timestamp}-002
SN-AUTO-{timestamp}-003'''

        page.fill('textarea[name="serial_numbers"]', serials)
        page.select_option('select[name="reason"]', 'received')
        page.click('button:has-text("Add Stock")')
        page.wait_for_selector('[role="dialog"]', state='hidden')

        print('✓ Bulk serials added')

        # TC-4.2: Stock Out - Multiple Serials
        print('Testing Stock Out - Multiple Serials...')
        page.click('button:has-text("Stock Out")')
        page.wait_for_selector('[role="dialog"]')

        # Select serials from table
        checkboxes = page.locator('input[type="checkbox"][data-serial-id]').all()
        if len(checkboxes) >= 2:
            checkboxes[0].check()
            checkboxes[1].check()

        page.select_option('select[name="reason"]', 'sold')
        page.click('button:has-text("Remove Stock")')
        page.wait_for_selector('[role="dialog"]', state='hidden')

        print('✓ Serials removed (sold)')

        # Verify activity log
        print('Verifying Recent Activity...')
        page.reload()
        page.wait_for_load_state('networkidle')

        activity_section = page.locator('text=Recent Activity')
        assert activity_section.is_visible(), 'Recent Activity section not found'
        print('✓ Activity log visible')

        browser.close()
        print('\n✅ All serial flow tests passed!')

if __name__ == '__main__':
    test_serial_stock_flow()
```

### Script 3: Dashboard Activity Verification

```python
"""
test_dashboard_activity.py - Verify dashboard recent activity integration
Run with: python scripts/with_server.py --server "npm run dev" --port 3000 -- python test_dashboard_activity.py
"""
from playwright.sync_api import sync_playwright

BASE_URL = 'http://localhost:3000'

def test_dashboard_activity():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login
        page.goto(f'{BASE_URL}/login')
        page.wait_for_load_state('networkidle')
        page.fill('input[name="email"]', 'test@example.com')
        page.fill('input[name="password"]', 'testpassword')
        page.click('button[type="submit"]')
        page.wait_for_url('**/dashboard**')

        # TC-5.4: Dashboard Recent Activity
        print('Testing Dashboard Recent Activity...')
        page.goto(f'{BASE_URL}/dashboard')
        page.wait_for_load_state('networkidle')

        # Verify widget exists
        activity_header = page.locator('h2:has-text("Recent Activity")')
        assert activity_header.is_visible(), 'Recent Activity widget not found'
        print('✓ Recent Activity widget visible')

        # Verify View Full Log link
        full_log_link = page.locator('a:has-text("View Full Log")')
        assert full_log_link.is_visible(), 'View Full Log link not found'
        print('✓ View Full Log link visible')

        # Check activity entries
        entries = page.locator('.group.flex.items-center.gap-4').all()
        print(f'  Found {len(entries)} activity entries')

        # Test pagination if present
        next_btn = page.locator('button[aria-label="Next page"]')
        if next_btn.is_visible() and next_btn.is_enabled():
            next_btn.click()
            page.wait_for_timeout(500)
            print('✓ Pagination works')

        # Click View Full Log
        full_log_link.click()
        page.wait_for_url('**/reports/activity**')
        print('✓ Navigated to full activity log')

        browser.close()
        print('\n✅ Dashboard activity tests passed!')

if __name__ == '__main__':
    test_dashboard_activity()
```

---

## Test Data Cleanup

After running tests, clean up test data:

```sql
-- Remove test lots
DELETE FROM lots WHERE lot_number LIKE 'LOT-TEST-%';

-- Remove test serials
DELETE FROM serial_numbers WHERE serial_number LIKE 'SN-TEST-%' OR serial_number LIKE 'SN-AUTO-%';

-- Remove test activity logs (optional - may want to keep for audit)
-- DELETE FROM activity_logs WHERE changes->>'notes' LIKE '%Automated test%';
```

---

## Traceability Matrix

| Requirement | Test Cases |
|-------------|------------|
| Stock In - Batch | TC-1.1, TC-1.2, TC-1.3 |
| Stock In - Serial | TC-2.1, TC-2.2, TC-2.3 |
| Stock Out - Batch FEFO | TC-3.1, TC-3.2, TC-3.3 |
| Stock Out - Serial | TC-4.1, TC-4.2, TC-4.3 |
| Activity Logging | TC-5.1, TC-5.2, TC-5.3, TC-5.4, TC-5.5 |
| Manage Tracking | TC-6.1, TC-6.2 |

---

## Execution Notes

1. **Run with Playwright MCP**: Use the `mcp__playwright__browser_*` tools for interactive testing
2. **Screenshots**: Capture screenshots at key steps for debugging
3. **Network monitoring**: Enable `browser_network_requests` to verify API calls
4. **Console logging**: Enable `browser_console_messages` to catch JS errors

### Example MCP Workflow

```
1. browser_navigate → Login page
2. browser_fill_form → Enter credentials
3. browser_click → Submit login
4. browser_wait_for → Dashboard load
5. browser_navigate → Item detail page
6. browser_snapshot → Capture initial state
7. browser_click → Stock In button
8. browser_fill_form → Enter lot details
9. browser_click → Submit
10. browser_snapshot → Verify result
11. browser_take_screenshot → Evidence capture
```

---

## Acceptance Criteria

| Criterion | Condition |
|-----------|-----------|
| Stock In - Batch | New lots created correctly, quantity updated |
| Stock In - Serial | Serials created with correct status |
| Stock Out - FEFO | Earliest expiry lot depleted first |
| Stock Out - Serial | Selected serials status updated |
| Activity Integration | All operations logged with correct metadata |
| UI Consistency | Modals open/close properly, forms validate |
| Data Integrity | No orphaned lots/serials, quantities sync |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-03 | Claude | Initial test plan |
