# Pickle Functional Testing Checklist

A comprehensive checklist to verify every function in the Pickle inventory management system is error-free.

**Legend:**
- [ ] Not tested
- [x] Tested and working
- Status column: Expected result for the test

---

## 1. Authentication & User Management

### Login
- [ ] **Valid login** → Redirects to dashboard, creates session
- [ ] **Invalid email** → Shows "Invalid email or password" error
- [ ] **Invalid password** → Shows "Invalid email or password" error
- [ ] **Empty fields** → Shows validation error
- [ ] **Redirect parameter** → Redirects to specified path after login

### Signup
- [ ] **Valid signup** → Creates user, tenant, profile; shows email verification message
- [ ] **Duplicate email** → Shows "Email already registered" error
- [ ] **Weak password** → Shows password requirements error
- [ ] **Empty company name** → Shows validation error
- [ ] **Terms acceptance** → Required before submission

### Password Reset
- [ ] **Valid email** → Sends reset email, shows confirmation
- [ ] **Non-existent email** → Shows generic "If account exists..." message
- [ ] **Reset link** → Opens password reset form
- [ ] **New password** → Updates password, redirects to login

### Session Management
- [ ] **Session persistence** → Stays logged in across page refreshes
- [ ] **Session expiry** → Redirects to login after token expires
- [ ] **Logout** → Clears session, redirects to login

### Role-Based Access
- [ ] **Owner role** → Full access to all features including tenant settings
- [ ] **Admin role** → Can manage users, cannot delete tenant
- [ ] **Editor role** → Can CRUD items/folders, cannot manage users
- [ ] **Member role** → Read-only access to inventory

---

## 2. Inventory Items

### Create Item (`/inventory/new`)
- [ ] **Valid item** → Returns new item with UUID, status auto-calculated
- [ ] **Required fields only** → Creates item with name and quantity
- [ ] **All fields** → Saves SKU, barcode, price, cost, min_qty, description, notes
- [ ] **Photo upload** → Uploads to storage, saves URL in image_urls array
- [ ] **Custom fields** → Saves custom field values in custom_fields JSON
- [ ] **Quota exceeded** → Shows quota limit error, prevents creation
- [ ] **Empty name** → Shows validation error
- [ ] **Negative quantity** → Shows validation error

### Update Quantity (`updateItemQuantity`)
- [ ] **Increase quantity** → Returns item with new quantity, activity logged
- [ ] **Decrease quantity** → Returns item with new quantity, activity logged
- [ ] **Set to zero** → Status changes to "out_of_stock"
- [ ] **Below min_quantity** → Status changes to "low_stock"
- [ ] **Above min_quantity** → Status changes to "in_stock"
- [ ] **Low stock alert** → Creates notification if below threshold
- [ ] **Email alert** → Sends email if RESEND_API_KEY configured

### Update Fields (`updateItemField`)
- [ ] **Update name** → Returns item with new name, activity logged
- [ ] **Update SKU** → Returns item with new SKU
- [ ] **Update barcode** → Returns item with new barcode
- [ ] **Update price** → Returns item with new selling price
- [ ] **Update cost_price** → Returns item with new cost price
- [ ] **Update min_quantity** → Recalculates status based on current quantity
- [ ] **Update location** → Returns item with new location text
- [ ] **Update description** → Returns item with new description
- [ ] **Update notes** → Returns item with new notes
- [ ] **Empty required field** → Shows validation error

### Delete Item (`deleteItem`)
- [ ] **Soft delete** → Sets deleted_at timestamp, item hidden from queries
- [ ] **Activity log** → Records deletion with user info
- [ ] **Unauthorized user** → Returns authorization error
- [ ] **Non-existent item** → Returns "Item not found" error

### Duplicate Item (`duplicateItem`)
- [ ] **Duplicate all fields** → New item with same data except id/timestamps
- [ ] **SKU modified** → New SKU has "-COPY" suffix
- [ ] **Barcode reset** → New item barcode is null
- [ ] **Tags copied** → New item has same tag associations
- [ ] **Activity log** → Records duplication action
- [ ] **Quota check** → Fails if quota exceeded

### Move Item (`moveItemToFolder`)
- [ ] **Move to folder** → Updates folder_id, activity logged
- [ ] **Move to root** → Sets folder_id to null
- [ ] **Activity log** → Records from_folder and to_folder names
- [ ] **Non-existent folder** → Returns error
- [ ] **Same folder** → No change, no activity log

### Tags (`updateItemTags`)
- [ ] **Add tags** → Creates item_tags associations
- [ ] **Remove tags** → Deletes item_tags associations
- [ ] **Replace all tags** → Removes existing, adds new
- [ ] **Empty tags** → Removes all tag associations
- [ ] **Activity log** → Records tag changes

---

## 3. Folders/Locations

### Create Folder (`createFolder`)
- [ ] **Root folder** → Creates with path=[], depth=0
- [ ] **Nested folder** → Creates with parent path + id, depth=parent+1
- [ ] **With color** → Saves specified color
- [ ] **Default color** → Assigns random color from palette
- [ ] **Sort order** → Increments from siblings' max sort_order
- [ ] **Empty name** → Shows validation error
- [ ] **Duplicate name** → Allowed (no unique constraint)

### Update Folder (`updateFolder`)
- [ ] **Rename** → Updates name, returns updated folder
- [ ] **Change color** → Updates color
- [ ] **Change parent** → Recalculates path and depth
- [ ] **Move to root** → Sets parent_id null, path=[], depth=0
- [ ] **Circular reference** → Prevents moving folder into own descendant
- [ ] **Update sort order** → Reorders folder among siblings

### Delete Folder (`deleteFolder`)
- [ ] **Empty folder** → Deletes successfully
- [ ] **Folder with items** → Returns error "Cannot delete folder with items"
- [ ] **Folder with subfolders** → Returns error "Cannot delete folder with subfolders"
- [ ] **Activity log** → Records folder deletion

### Quick Operations
- [ ] **`updateFolderColor`** → Updates color only
- [ ] **`renameFolder`** → Updates name only, validates non-empty

---

## 4. Checkouts & Returns

### Standard Checkout (`checkoutItem`)
- [ ] **Valid checkout** → Decrements quantity, creates checkout record
- [ ] **Checkout status** → New record has status "checked_out"
- [ ] **Assignee stored** → Saves assignee_name and type
- [ ] **Due date** → Saves expected return date
- [ ] **Notes** → Saves checkout notes
- [ ] **Insufficient stock** → Returns error "Insufficient stock"
- [ ] **Zero quantity** → Returns error
- [ ] **Status update** → Item status updated based on remaining quantity
- [ ] **Activity log** → Records checkout with quantity and assignee

### Return Item (`returnItem`)
- [ ] **Good condition** → Increments quantity, status "returned"
- [ ] **Damaged condition** → Increments quantity, records condition
- [ ] **Needs repair** → Increments quantity, records condition
- [ ] **Lost condition** → NO quantity increment, records condition
- [ ] **Return notes** → Saves return notes
- [ ] **Timestamps** → Sets returned_at and returned_by
- [ ] **Already returned** → Returns error
- [ ] **Activity log** → Records return with condition

### Serialized Checkout (`checkoutWithSerials`)
- [ ] **Select serials** → Associates specific serial numbers
- [ ] **RPC integration** → Uses database function for atomic operation
- [ ] **Serial status** → Updates serial number status to "checked_out"
- [ ] **Multiple serials** → Handles array of serial IDs

### Serialized Return (`returnCheckoutSerials`)
- [ ] **Per-serial condition** → Records condition for each serial
- [ ] **Serial status update** → Updates each serial's status
- [ ] **Partial return** → Allows returning subset of serials
- [ ] **`getCheckoutSerials`** → Returns list of serials for checkout

### Batch Checkout (`batchCheckout`)
- [ ] **Multiple items** → Processes array of items
- [ ] **Partial failure** → Returns success count and failed items array
- [ ] **Error aggregation** → Collects all errors with item references
- [ ] **Mixed serial/non-serial** → Handles both types

---

## 5. Stock Counts

### List & Get (`getStockCounts`, `getStockCount`)
- [ ] **List all** → Returns array of stock counts with relations
- [ ] **Get single** → Returns stock count with items and details
- [ ] **Filter by status** → Returns only matching status
- [ ] **Tenant isolation** → Only returns current tenant's counts

### Create Stock Count (`createStockCount`)
- [ ] **Full scope** → Includes all inventory items
- [ ] **Folder scope** → Includes only items in specified folder
- [ ] **Custom scope** → Includes specified items only
- [ ] **Display ID** → Generates unique ID (SC-XXX-00001)
- [ ] **Status** → Created as "draft"
- [ ] **Assigned to** → Saves assignee user ID

### Update Stock Count
- [ ] **`updateStockCount`** → Updates name, due_date, assigned_to
- [ ] **Status transitions** → draft → in_progress → review → completed
- [ ] **`completeStockCount`** → Sets status "completed", completed_at timestamp

### Count Items
- [ ] **`getStockCountItems`** → Returns items with expected quantities
- [ ] **`updateStockCountItem`** → Records counted_quantity, counted_by, counted_at
- [ ] **Variance calculation** → expected_quantity - counted_quantity
- [ ] **Status update** → Item status: pending → counted → verified

### Variance Handling
- [ ] **`recordVariance`** → Saves variance and variance_notes
- [ ] **`approveVarianceAndAdjust`** → Adjusts inventory quantity, marks resolved
- [ ] **Activity log** → Records stock count adjustment

---

## 6. Purchase Orders & Receiving

### Vendors
- [ ] **`createVendor`** → Returns vendor with UUID
- [ ] **`getVendors`** → Returns list for dropdowns
- [ ] **All fields** → Saves name, contact, email, phone, address, notes

### Create Purchase Order (`createPurchaseOrder`)
- [ ] **Valid PO** → Returns PO with display ID (PO-XXX-00001)
- [ ] **Line items** → Creates purchase_order_items records
- [ ] **Shipping address** → Saves ship_to fields
- [ ] **Billing address** → Saves bill_to fields
- [ ] **Status** → Created as "draft"
- [ ] **Vendor link** → Associates with vendor_id

### Update Purchase Order
- [ ] **`updatePurchaseOrder`** → Updates details, status, dates
- [ ] **`addPurchaseOrderItem`** → Adds line item
- [ ] **`removePurchaseOrderItem`** → Removes line item
- [ ] **`cancelPurchaseOrder`** → Sets status "cancelled"

### Create Receive (`createReceive`)
- [ ] **Valid receive** → Returns receive with display ID (REC-XXX-00001)
- [ ] **PO link** → Associates with purchase_order_id
- [ ] **Carrier/tracking** → Saves delivery details
- [ ] **Status** → Created as "draft"

### Receive Items
- [ ] **`addReceiveItem`** → Records received quantity
- [ ] **Lot tracking** → Saves lot_number, batch_code
- [ ] **Expiry dates** → Saves expiry_date, manufactured_date
- [ ] **Condition** → Records good/damaged/rejected
- [ ] **`updateReceiveItem`** → Updates receive line item
- [ ] **`addReceiveItemSerials`** → Associates serial numbers

### Complete Receive (`completeReceive`)
- [ ] **Status update** → Sets status "completed"
- [ ] **Inventory update** → Increments item quantities
- [ ] **PO update** → Updates received_quantity on PO items
- [ ] **Fully received** → Returns po_fully_received: true when complete
- [ ] **Lot creation** → Creates lot records if lot tracking enabled

---

## 7. Pick Lists

### Create Pick List
- [ ] **`createPickList`** → Returns pick list with display ID (PL-XXX-00001)
- [ ] **`createDraftPickList`** → Quick create with generated ID
- [ ] **Line items** → Creates pick_list_items records
- [ ] **Shipping address** → Saves shipping fields
- [ ] **Status** → Created as "draft"

### Manage Pick List
- [ ] **`updatePickList`** → Updates name, due_date, assigned_to
- [ ] **`addPickListItem`** → Adds item with requested_quantity
- [ ] **`removePickListItem`** → Removes item from list
- [ ] **`completePickList`** → Sets status "completed"

### Pick List Items
- [ ] **Requested vs picked** → Tracks requested_quantity and picked_quantity
- [ ] **Item status** → pending → picked
- [ ] **Quantity decrement** → Reduces inventory on completion

---

## 8. Bulk Import

### Import Items (`bulkImportItems`)
- [ ] **Valid CSV** → Returns {success: true, successCount, createdItemIds}
- [ ] **Failed rows** → Returns {failedCount, errors: [{row, message}]}
- [ ] **Skipped duplicates** → Returns {skippedCount} when skip option set
- [ ] **Replace duplicates** → Updates existing items when replace option set
- [ ] **Create folders** → Creates folders from folder_name when createFolders: true
- [ ] **Activity log** → Records bulk import action

### Quota Check (`checkImportQuota`)
- [ ] **Within quota** → Returns {allowed: true, remaining: X}
- [ ] **Exceeds quota** → Returns {allowed: false, message: "..."}
- [ ] **Partial import** → Returns exact remaining count

### Validation
- [x] **Required fields** → Validates name, quantity present (unit tested)
- [x] **Field types** → Validates number, date, string formats (unit tested)
- [x] **Row-specific errors** → Returns row number with each error (unit tested)
- [ ] **SKU uniqueness** → Detects duplicates within file and database

---

## 9. Offline & Sync

### Queue Management (`useOfflineSync`)
- [ ] **`queueChange`** → Stores change in IndexedDB
- [ ] **`queueQuantityAdjustment`** → Updates local cache + queues sync
- [ ] **Pending count** → Tracks number of queued changes
- [ ] **Persistence** → Queue survives page refresh

### Sync Operations
- [ ] **`processQueue`** → Syncs all pending changes to server
- [ ] **`retryFailed`** → Retries failed operations
- [ ] **Concurrent prevention** → Blocks multiple simultaneous syncs
- [ ] **Error aggregation** → Collects sync errors
- [ ] **Auto-sync** → Triggers on reconnect with delay

### Offline Lookup
- [ ] **`lookupItemOffline`** → Finds item by barcode or SKU
- [ ] **`lookupItemByIdOffline`** → Finds item by UUID
- [ ] **Cache hit** → Returns cached item data
- [ ] **Cache miss** → Returns null

### Online Status (`useOnlineStatus`)
- [ ] **Initial state** → Detects online status on mount
- [ ] **Browser events** → Responds to online/offline events
- [ ] **Ping verification** → Pings /api/health every 30 seconds
- [ ] **Custom events** → Dispatches pickle:online/pickle:offline

---

## 10. API Endpoints

### Health Check (`/api/health`)
- [ ] **GET request** → Returns {status: 'ok', timestamp}
- [ ] **HEAD request** → Returns 200 status code
- [ ] **Response time** → Responds within 1 second

### AI Chat (`/api/ai/chat`)
- [ ] **Authenticated request** → Returns AI response
- [ ] **Unauthenticated** → Returns 401 error
- [ ] **With message** → Processes user message
- [ ] **With history** → Includes conversation context
- [ ] **Inventory context** → Fetches 50 recent items for context
- [ ] **No API key** → Returns demo response with demo: true
- [ ] **Empty message** → Returns validation error

---

## 11. Settings

### Tenant Settings (`updateTenantSettings`)
- [ ] **Company name** → Updates tenant name
- [ ] **Empty name** → Returns validation error
- [ ] **Currency** → Validates against whitelist (USD, EUR, SGD, etc.)
- [ ] **Timezone** → Validates against whitelist
- [ ] **Date format** → Validates (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- [ ] **Time format** → Validates (12-hour, 24-hour)
- [ ] **Decimal precision** → Validates (0, 1, 2, 3, 4)
- [ ] **Country** → Validates against country list
- [ ] **Invalid values** → Returns validation error

### Feature Flags (`/settings/features`)
- [ ] **Multi-location** → Enables/disables location tracking
- [ ] **Lot tracking** → Enables/disables lot/expiry management
- [ ] **Serial tracking** → Enables/disables serial number management
- [ ] **Shipping dimensions** → Enables/disables dimension fields

---

## 12. UI/UX Features

### Dashboard (`/dashboard`)
- [x] **Total items count** → Displays correct total (unit tested)
- [x] **Total value** → Calculates sum of (quantity * price) (unit tested)
- [x] **Total profit** → Calculates sum of (quantity * (price - cost)) (unit tested)
- [x] **Low stock count** → Shows items below min_quantity (unit tested)
- [x] **Out of stock count** → Shows items with quantity = 0 (unit tested)
- [x] **Status chart** → Pie chart with correct percentages (unit tested)
- [x] **Recent activity** → Shows last 10 activity logs (unit tested)

### Search (`/search`)
- [ ] **Text search** → Matches name, SKU, description
- [ ] **Status filter** → Filters by in_stock/low_stock/out_of_stock
- [ ] **Folder filter** → Filters by selected folder
- [ ] **Tag filter** → Filters by selected tags
- [ ] **Sort options** → Sorts by name, quantity, price, date
- [ ] **Save search** → Persists search criteria
- [ ] **Load search** → Applies saved search

### Barcode Scanner (`/scan`)
- [ ] **Single scan mode** → Scans, shows item, allows adjustment
- [ ] **Quick adjust mode** → Scans, immediately adjusts +1/-1
- [ ] **Batch count mode** → Continuous scanning, builds list
- [ ] **Camera access** → Requests and uses camera
- [ ] **Offline mode** → Works with cached items
- [ ] **Sync indicator** → Shows pending sync count

### Responsive Design
- [ ] **Mobile (< 640px)** → Shows mobile layout
- [ ] **Tablet (640-1023px)** → Shows tablet layout
- [ ] **Desktop (>= 1024px)** → Shows full desktop layout
- [ ] **Touch targets** → Buttons are 44px minimum on touch devices

---

## 13. Database & Security

### RLS Policies
- [ ] **Tenant isolation** → Users cannot access other tenant's data
- [ ] **Owner access** → Can access all tenant data
- [ ] **Admin access** → Can manage users and settings
- [ ] **Editor access** → Can CRUD items and workflows
- [ ] **Member access** → Read-only access

### Activity Logging
- [ ] **Create operations** → Logs entity creation
- [ ] **Update operations** → Logs field changes
- [ ] **Delete operations** → Logs soft deletions
- [ ] **Quantity changes** → Logs before/after quantities
- [ ] **User attribution** → Records user_id and user_name

### Soft Deletes
- [x] **Items** → Filtered by deleted_at IS NULL (unit tested)
- [x] **Query behavior** → Deleted items excluded from lists (unit tested)
- [ ] **Recovery** → Can undelete by clearing deleted_at

---

## 14. Integration Workflows

### Checkout → Return Cycle
- [ ] **Checkout item** → Quantity decreases, checkout created
- [ ] **Item status** → Updates to low_stock/out_of_stock
- [ ] **Return item** → Quantity increases (unless lost)
- [ ] **Item status** → Updates back to in_stock
- [ ] **Activity trail** → Both operations logged

### PO → Receive → Stock Update
- [ ] **Create PO** → PO created with items
- [ ] **Create receive** → Linked to PO
- [ ] **Receive items** → Record quantities and conditions
- [ ] **Complete receive** → Inventory quantities increased
- [ ] **PO status** → Updates to "received" when complete

### Import → Organize → Manage
- [ ] **Bulk import** → Items created from CSV
- [ ] **Add to folders** → Items organized by location
- [ ] **Tag items** → Items categorized
- [ ] **Adjust quantities** → Stock levels updated

### Stock Count → Variance → Adjustment
- [ ] **Create count** → Items snapshot taken
- [ ] **Count items** → Record actual quantities
- [ ] **Review variance** → Identify discrepancies
- [ ] **Approve adjustment** → Inventory corrected

---

## 15. Edge Cases & Error Handling

### Quantity Edge Cases
- [ ] **Zero quantity** → Allowed, status = out_of_stock
- [ ] **Negative quantity** → Rejected with validation error
- [ ] **Very large quantity** → Handles numbers up to 2^31
- [ ] **Decimal quantity** → Handles based on unit type

### Concurrent Operations
- [ ] **Simultaneous edits** → Last write wins (no conflict resolution)
- [ ] **Checkout race** → First checkout succeeds, second fails if insufficient
- [ ] **Import during edit** → No conflicts (different items)

### Network Failures
- [ ] **Offline creation** → Queued for later sync
- [ ] **Offline update** → Queued with optimistic UI
- [ ] **Sync failure** → Retry mechanism available
- [ ] **Partial sync** → Successful items committed, failed reported

### Validation Errors
- [ ] **Required field missing** → Clear error message
- [ ] **Invalid format** → Type-specific error message
- [ ] **Business rule violation** → Descriptive error
- [ ] **Database constraint** → User-friendly error translation

---

## 16. Email Notifications

### Low Stock Alert (`sendLowStockAlert`)
- [ ] **Email sent** → Delivers to specified email
- [ ] **Content correct** → Includes item name, current qty, min qty, unit
- [ ] **Subject line** → Includes item name
- [ ] **No API key** → Fails gracefully, returns error
- [ ] **Invalid email** → Returns validation error

---

## 17. Undo Operations

### Undo System (`useUndo`)
- [ ] **`addUndoAction`** → Shows undo toast with label
- [ ] **`performUndo`** → Executes undo function
- [ ] **Auto-dismiss** → Toast disappears after 10 seconds
- [ ] **`dismissUndo`** → Manually closes toast
- [ ] **`onComplete` callback** → Fires after successful undo
- [ ] **Cleanup** → Cleans up timeout on unmount

---

## Summary

| Category | Total Tests | Passed | Failed | Pending |
|----------|-------------|--------|--------|---------|
| Authentication | 18 | 0 | 0 | 18 |
| Inventory Items | 35 | 0 | 0 | 35 |
| Folders | 16 | 0 | 0 | 16 |
| Checkouts & Returns | 25 | 0 | 0 | 25 |
| Stock Counts | 18 | 0 | 0 | 18 |
| Purchase Orders | 20 | 0 | 0 | 20 |
| Pick Lists | 12 | 0 | 0 | 12 |
| Bulk Import | 12 | 3 | 0 | 9 |
| Offline & Sync | 16 | 0 | 0 | 16 |
| API Endpoints | 9 | 0 | 0 | 9 |
| Settings | 15 | 0 | 0 | 15 |
| UI/UX | 24 | 7 | 0 | 17 |
| Database & Security | 11 | 2 | 0 | 9 |
| Integration Workflows | 16 | 0 | 0 | 16 |
| Edge Cases | 16 | 0 | 0 | 16 |
| Email | 5 | 0 | 0 | 5 |
| Undo | 6 | 0 | 0 | 6 |
| **TOTAL** | **269** | **12** | **0** | **257** |

---

**Last Updated:** 2025-12-31

**Tested By:** Automated unit tests (vitest) - 207 tests passing

**Environment:**
- [x] Development
- [ ] Staging
- [ ] Production
