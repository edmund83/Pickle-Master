# Changelog

All notable changes to StockZip are documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added

#### Per-User AI Usage Cost Tracking
Cost-based usage limits for AI features to control spending:

**Database** (Migration: `00082_ai_usage_cost_tracking.sql`):
- `ai_usage_tracking` table - Logs every AI request with token counts and USD cost
- `ai_usage_limits` table - Per-user monthly limits (default $0.05/month)
- `check_ai_usage_limit()` RPC - Pre-request validation
- `track_ai_usage()` RPC - Post-request logging with model-specific pricing
- `get_ai_usage_summary()` RPC - Usage dashboard data
- `set_user_ai_limit()` RPC - Admin function to adjust user limits
- Auto-creates limits for new users via trigger

**TypeScript** (`lib/ai/usage-tracking.ts`):
- `checkAiUsageLimit()` - Server-side pre-check
- `trackAiUsage()` - Server-side usage logging
- `estimateCost()` - Token-to-cost estimation
- Client-side variants for UI display

**API Routes Updated**:
- `/api/ai/chat` - Checks limit before AI call, tracks usage after
- `/api/ai/insights` - Checks limit before AI call, tracks usage after

**Pricing**:
- Default limit: $0.05/month (~100-160 questions with Gemini Flash)
- Model-specific rates: Gemini Flash ($0.075/$0.30 per 1M tokens), GPT-4o, Claude, etc.
- 80% warning threshold before limit reached

#### PDF Downloads for Task Documents
- Added Download PDF actions for Purchase Orders, Pick Lists, Sales Orders, Delivery Orders, and Invoices.

### Changed

#### Ask Zoe AI Assistant Optimization
Major performance and cost optimization for the Ask Zoe AI assistant:

**Database Optimizations** (Migrations: `00080_zoe_context_rpc.sql`, `00081_validate_ai_request.sql`):
- New `get_zoe_context()` RPC function replaces 7+ individual queries with 1 server-side call
- New `validate_ai_request()` RPC combines auth + profile + rate limit checks (3 calls → 1)
- Server-side SQL aggregation instead of fetching all rows for counts

**Token Usage Optimization**:
- Compact pipe-delimited format for inventory data (60% token reduction)
- Status abbreviations (in_stock → I, low_stock → L, out_of_stock → O)
- Tiered system prompts based on query complexity (minimal/standard/extended)
- Conversation history summarization (20 messages → 6 recent + summary)

**New Files**:
- `lib/ai/context-compressor.ts` - Compact formatting utilities
- `lib/ai/history-manager.ts` - Conversation history management with summarization

**Expected Results**:
- API calls: 3-10 → 2-3 (70% reduction)
- Data transfer: 100-500KB → 5-20KB (95% reduction)
- Token usage: ~8000 → ~3000 tokens per chat (60% reduction)
- Cost per chat: ~$0.02 → ~$0.008 (60% savings)

### Added

#### User Documentation Guide
- **Learn.md** (`docs/Learn.md`) - Comprehensive user guide covering all StockZip features
  - 23 sections covering the complete user workflow
  - Step-by-step instructions for all features
  - Tables and formatting for easy reference
  - Troubleshooting & FAQ section
  - Getting Started checklist for new users

### Changed

#### Pricing Plan Notes
- **Pricing plan** (`docs/pricingplan.md`) now calls out PDF downloads for document workflows.

### Removed

#### Multi-Location Stock Tracking Feature
- **Removed Settings → Locations page** - The location management UI has been removed from settings
- **Removed "Multi-Location Inventory" feature toggle** - This feature flag is no longer available in Settings → Features
- **Removed ItemLocationsPanel** - The panel showing stock quantities per location on item detail pages
- **Removed StockTransferModal** - The modal for transferring stock between locations
- **Renamed inventory dropdown** - Changed "All Locations" to "All Folders" in the inventory view for clarity

**Note**: The underlying `locations` and `location_stock` database tables are retained for Goods Receiving functionality (assigning received items to storage locations). Only the multi-location stock tracking feature UI has been removed.

### Added

#### Auto-Reorder Suggestions Feature
- **Reorder Suggestions Page** (`/tasks/reorder-suggestions`) - Identifies items below their reorder point and groups them by vendor
- **Item-Vendor Linking** (Migration: `00055_auto_reorder_suggestions.sql`):
  - New `item_vendors` table to link items to their suppliers with pricing, lead times, and preferred vendor flags
  - New columns on `inventory_items`: `reorder_point` and `reorder_quantity`
- **Smart Reorder Logic**:
  - Detects items at or below reorder point (or min_quantity if not set)
  - Calculates suggested order quantities automatically
  - Urgency levels: Critical (out of stock), Urgent (below min), Reorder (below reorder point)
- **Grouped by Vendor View**:
  - Items grouped by preferred vendor for batch PO creation
  - Shows estimated total per vendor
  - One-click "Create PO" button per vendor group
- **One-Click PO Creation**:
  - Creates draft purchase orders directly from suggestions
  - Pre-populates vendor SKU and unit cost from item-vendor relationship
  - Calculates order totals automatically
- **Dashboard Stats**:
  - Total items needing reorder
  - Critical/Urgent counts
  - Estimated total value
- **Navigation**: Added "Reorder" link under Tasks in sidebar
- **RPC Functions**:
  - `get_reorder_suggestions()` - Returns items below reorder point with vendor info
  - `get_reorder_suggestions_by_vendor()` - Groups suggestions by vendor
  - `create_po_from_suggestions()` - Creates draft PO from suggestion items
  - `link_item_to_vendor()` - Creates/updates item-vendor relationships
  - `get_item_vendors()` - Returns all vendors for a specific item
  - `get_reorder_suggestions_count()` - Returns count for sidebar badge

### Changed

#### Partial Picking Support
- **Quantity Input**: Pick any quantity (1 to remaining) per item instead of all-or-nothing
- **Progress Bar**: Visual progress indicator showing picked/total units with percentage
- **Partial Completion**: Can complete pick lists with partial picks (shows "Complete Partial" button)
- **Smart Defaults**: Quantity input defaults to remaining quantity for each item
- **Real-World Flexibility**: Handles common scenario where full quantity isn't available

#### Location-Aware Pick Lists
- **Item Location Data**: Pick list items now display warehouse location for each item (Migration: `00053_pick_list_locations.sql`)
- **Updated RPC**: `get_pick_list_with_items` returns location data (location name, type, quantity) for each item
- **UI Enhancement**: Location badge with MapPin icon shows primary location on each item row
- **Multiple Locations**: Items in multiple locations show "+N more" indicator
- **Picker Efficiency**: Pickers can now see exactly where to find each item in the warehouse

#### Pick List Draft Mode Layout Redesign
- **Two-Column Layout** on desktop (lg+): Main content area (2/3) for Ship To + items, sidebar (1/3) for settings
- **Ship To Card at Top**: Prominent card in main content area with compact 2-column address form (destination-first workflow)
- **Summary Stats Bar**: Shows item count, total units, and validation status at a glance
- **Required Settings Card**: Emphasized sidebar card with Assign To, Item Outcome, and Due Date fields
- **Collapsible Notes**: Notes section collapsed by default in sidebar, auto-expands if has content
- **Enhanced Footer**: Shows validation hints when required fields are missing
- **Streamlined Header**: Cleaner header with title and status on single line
- **New Component**: `CollapsibleSection` (`components/ui/collapsible-section.tsx`) for reusable expand/collapse UI

### Added

#### Tasks Section (New Unified Workflow Interface)
- **Tasks Hub** (`/tasks`) - New centralized task management interface replacing `/workflows`
- **Consolidated Navigation** with sub-menu categories:
  - **Inbound** (`/tasks/inbound`) - Purchase Orders, Receives
  - **Fulfillment** (`/tasks/fulfillment`) - Pick Lists
  - **Inventory Operations** (`/tasks/inventory-operations`) - Checkouts, Transfers, Moves, Stock Count
- **Sidebar Sub-Menu Navigation** - Expandable sub-menus in primary sidebar for workflow categories
- **Mobile Bottom Navigation** updated with Tasks tab

#### Display ID System (Human-Readable Document Numbers)
- **Organization Codes** (Migration: `00036_tenant_org_code.sql`):
  - Auto-generated 5-character org code per tenant (e.g., "ACM01" for "Acme Corp")
  - 3 letters from company name + 2-digit suffix
  - Immutable after creation to ensure document ID consistency
- **Entity Display IDs** with format: `{PREFIX}-{ORG_CODE}-{SEQUENCE}`:
  - Purchase Orders: `PO-ACM01-00001`
  - Pick Lists: `PL-ACM01-00001`
  - Receives: `RCV-ACM01-00001`
  - Stock Counts: `SC-ACM01-00001`
- **Database Schema** (Migrations: `00036-00043`):
  - `entity_sequence_counters` table for per-entity-type sequence tracking
  - `display_id` column added to `purchase_orders`, `pick_lists`, `receives`, `stock_counts`
  - Atomic RPC functions for entity creation with display ID generation
  - Search functions to find entities by display ID
  - Immutability triggers to prevent display ID modification after creation

#### Item Reminders System (Migrations: `00021-00025`)
- **Reminder Types**:
  - **Low Stock** - Trigger when quantity falls below threshold
  - **Expiry** - Trigger N days before expiry date
  - **Restock** - Scheduled reminders for reordering
- **Recurrence Options**: Once, Daily, Weekly, Monthly
- **Notification Channels**: In-app notifications, Email (optional)
- **Reminder Management Page** (`/reminders`) with:
  - Tabbed view: All, Low Stock, Expiry, Restock
  - Reminder cards showing item, type, status, last triggered
  - Edit/Delete actions
  - Status badges (Active, Paused, Triggered, Expired)
- **Item Detail Integration**:
  - Inline reminders card showing item-specific reminders
  - Quick add reminder modal
  - Edit reminder modal with full configuration
- **Edge Function** (`process-reminders`) for daily reminder processing
- **GitHub Actions Workflow** (`.github/workflows/process-reminders.yml`) for daily CRON trigger

#### Checkout Serial Tracking (Migration: `00030_checkout_serials.sql`)
- **Serial-Aware Checkouts** - Link checkouts to specific serial numbers
- `checkout_serials` junction table tracking which serials are checked out
- Per-serial return condition tracking
- Constraint ensuring each serial can only be in one active checkout

#### Pick List Enhancements (Migration: `00031_pick_list_enhancements.sql`)
- **Item Outcome Options**: `decrement` (default), `checkout`, `transfer`
- **Ship To Address** fields: name, address1, address2, city, state, postal code, country
- **Assigned At** timestamp (Migration: `00034_pick_list_assigned_at.sql`)
- **Pick List Number** auto-generation (Migration: `00035_pick_list_number.sql`)
- **Pick List Detail Page** (`/tasks/pick-lists/[pickListId]`) with:
  - Items table with pick status
  - Assignee management
  - Status workflow (Draft → Assigned → In Progress → Completed)

#### Activity Log Enhancements (Migration: `00032_activity_logs_move_details.sql`)
- **Move Details** in activity logs for item relocations
- Tracks source/destination folder information

#### Custom Field Enhancements (Migrations: `00028-00029`)
- **Folder-Scoped Custom Fields** - Custom fields can be limited to specific folders
- **Custom Field Limits** - Per-tenant limits on number of custom fields

#### Tenant Settings Validation (Migration: `00027_tenant_settings_validation.sql`)
- Database-level validation for tenant settings

#### Workflow Reorganization & Stock Count Feature
- **Workflow Hub Restructured** into 3 category-based sub-hubs:
  - **Inbound** (`/workflows/inbound`) - Purchase Orders, Receives
  - **Fulfillment** (`/workflows/fulfillment`) - Pick Lists
  - **Inventory Operations** (`/workflows/inventory-operations`) - Check-In/Out, Transfers, Moves, Stock Count
- **Stock Count Feature** - New inventory audit workflow:
  - **List Page** (`/workflows/stock-count`) with sortable table, status badges, and progress indicators
  - **Detail Page** (`/workflows/stock-count/[id]`) with:
    - Stats cards (Total, Counted, Remaining, Variances)
    - Progress bar visualization
    - Item search and filtering
    - Inline count recording with variance calculation
    - Status workflow (Draft → In Progress → Review → Completed)
    - Option to apply inventory adjustments on completion
  - **Server Actions**: `getStockCounts()`, `getStockCount()`, `createStockCount()`, `startStockCount()`, `recordCount()`, `submitForReview()`, `completeStockCount()`, `cancelStockCount()`
  - **Database Schema** (Migration: `00044_stock_counts.sql`):
    - `stock_counts` table with display_id, status workflow, scope settings, assignment, progress tracking
    - `stock_count_items` table with expected/counted quantities and variance tracking
    - RLS policies for tenant isolation
    - PostgreSQL functions for atomic operations and display_id generation

#### Purchase Orders Workflow (Complete Implementation)
- **New Order Modal** - Full-featured modal for creating purchase orders with:
  - Vendor dropdown with quick "Add New Vendor" option
  - Auto-generated or manual order numbers (PO-0001 format)
  - Expected delivery date picker
  - Item search from existing inventory or custom item entry
  - **Low-stock items filter** - Checkbox to show only items below minimum stock level
  - **Part Number field** - Vendor/manufacturer part number per line item
  - Quantity and unit price per item
  - Auto-calculated subtotal/total
  - Notes field
  - **Ship To address section** (collapsible) - Name, address, city, state, postal code, country
  - **Bill To address section** (collapsible) - Same fields with "Same as Ship To" button
- **Vendor Management** - Quick-add vendor modal with:
  - Required vendor name
  - Contact name, email, phone
  - Full address fields (optional)
  - Notes
- **Purchase Order Detail Page** (`/workflows/purchase-orders/[id]`) with:
  - Full PO header with status badge
  - Vendor information sidebar with contact details
  - Order items table with quantities, **part numbers**, prices, and receive progress
  - Inline quantity editing for draft orders
  - Add/remove items for draft orders
  - Status workflow buttons (Submit, Confirm, Cancel, Restore)
  - Link to Receives page for receiving items
  - **Ship To address card** in sidebar (when configured)
  - **Bill To address card** in sidebar (when configured)
  - **Submitted/Approved date display** in order details
- **Server Actions** for PO CRUD operations:
  - `getVendors()`, `createVendor()`
  - `createPurchaseOrder()`, `getPurchaseOrder()`
  - `updatePurchaseOrder()`, `updatePurchaseOrderStatus()`
  - `addPurchaseOrderItem()`, `removePurchaseOrderItem()`, `updatePurchaseOrderItem()`
  - `deletePurchaseOrder()` (draft only)
  - `searchInventoryItemsForPO()` - Now supports `lowStockOnly` filter

#### Goods Receiving (GRN) Workflow (Migration: `00045_receives.sql`)
- **Formal Receive Documents** - Multiple receives per PO (supports partial shipments)
  - Display ID format: `RCV-{ORG_CODE}-{SEQUENCE}` (e.g., RCV-ACM01-00001)
  - Status workflow: draft → completed / cancelled
- **Receives List Page** (`/workflows/receives`) with:
  - Tabbed interface: "Receives" list + "Pending POs" list
  - Quick "Receive" button to create new receive from pending PO
  - Status badges and date display
- **Receive Detail Page** (`/workflows/receives/[id]`) with:
  - Header info: received date, delivery note #, carrier, tracking number
  - Default location selector for all items
  - Items table with:
    - Quantity received (editable in draft)
    - Lot/batch tracking (lot number, batch code, expiry date)
    - Per-item location override
    - Item condition (good, damaged, rejected)
  - Complete/Cancel actions
- **Integration with PO**:
  - "Receive Items" button on PO detail page creates new receive
  - Auto-updates PO item received quantities on completion
  - Auto-transitions PO status (partial → received when complete)
- **Lot Tracking Integration**:
  - Creates lot records during receive for lot-tracked items
  - Captures lot number, batch code, expiry date, manufactured date
- **Location Stock Integration**:
  - Upserts location_stock with received quantities
  - Supports per-item location assignment
- **Server Actions**:
  - `createReceive()`, `getReceive()`, `getReceives()`, `getPOReceives()`
  - `addReceiveItem()`, `updateReceiveItem()`, `removeReceiveItem()`
  - `completeReceive()`, `cancelReceive()`, `updateReceive()`
  - `getLocations()`, `getPendingPurchaseOrders()`
- **RPC Functions**:
  - `create_receive()` - Atomic creation with display_id generation
  - `create_receive_with_items()` - Creates receive and pre-populates all PO items with remaining quantities
  - `add_receive_item()`, `update_receive_item()`, `remove_receive_item()`
  - `complete_receive()` - Updates inventory, creates lots, updates PO status
  - `cancel_receive()`, `get_po_receives()`, `get_receive_with_items()`
- **Pre-populated Receive Items**: When creating a receive from a PO, all PO items are automatically added to the receive document with their remaining quantities (ordered - already received). Users can then review and adjust quantities, add lot/batch info before completing.

#### Serial Number Entry for Serialized Items (Migration: `00047_receive_item_serials.sql`)
- **Serial Number Tracking** - For items with `tracking_mode = 'serial'`:
  - **Scan-focused entry modal** with auto-focus input for barcode scanner workflows
  - **Progress indicator** showing "X of Y serials entered" with visual progress bar
  - **Duplicate detection** - Immediate warning if serial already in list
  - **Bulk entry mode** - Paste multiple serials (newline/comma separated)
  - **Remove serials** - Trash icon to remove mistaken entries
  - **Additional options** - Location, condition, expiry date apply to all serials
- **Database Schema**:
  - `receive_item_serials` table linking serial numbers to receive items
  - Unique constraint per receive item to prevent duplicate serials
  - RLS policies for tenant isolation
- **Server Actions**:
  - `addReceiveItemSerial()` - Add single serial with duplicate check
  - `removeReceiveItemSerial()` - Remove a serial number
  - `bulkAddReceiveItemSerials()` - Parse and add multiple serials
  - `getReceiveItemSerials()` - Fetch serials for a receive item
- **UI Indicators**:
  - Purple barcode icon with serial count in items table for serialized items
  - Auto-detects `tracking_mode` to show appropriate modal (lot/batch vs serial)

#### Purchase Orders Schema Enhancements (Migration: `00033_purchase_order_enhancements.sql`)
- **Ship To address fields**: `ship_to_name`, `ship_to_address1`, `ship_to_address2`, `ship_to_city`, `ship_to_state`, `ship_to_postal_code`, `ship_to_country`
- **Bill To address fields**: `bill_to_name`, `bill_to_address1`, `bill_to_address2`, `bill_to_city`, `bill_to_state`, `bill_to_postal_code`, `bill_to_country`
- **Submission tracking**: `submitted_by`, `submitted_at`
- **Approval tracking**: `approved_by`, `approved_at`
- **Part number field**: `part_number` column added to `purchase_order_items` table

### Security

#### Critical RLS and Multi-Tenancy Fixes (Migration: `00026_security_audit_fixes.sql`)

Based on a comprehensive security audit, the following vulnerabilities were identified and fixed:

- **CRITICAL: Profiles RLS tenant hopping** - Fixed UPDATE policy to prevent users from changing their `tenant_id` to gain access to other tenants' data. Added database trigger as belt-and-suspenders protection.

- **HIGH: `activity_logs_archive` RLS** - Enabled RLS on the archive table and added tenant-scoped SELECT policy. Blocked direct inserts (archive function uses SECURITY DEFINER).

- **HIGH: `items_with_tags` view** - Added `tenant_id` filter to prevent cross-tenant data leakage through the view.

- **HIGH: `tenant_stats` materialized view** - Revoked direct SELECT access from authenticated users. Access now only through tenant-scoped `get_my_tenant_stats()` function.

- **HIGH: Cross-tenant status updates** - Fixed `update_overdue_checkouts()` and `update_expired_lots()` functions to scope updates to current tenant only.

- **HIGH: Internal function exposure** - Revoked EXECUTE permissions on `get_due_reminders()`, `process_reminder_trigger()`, `archive_old_activity_logs()`, `purge_old_archives()`, and `refresh_all_tenant_stats()` from authenticated users. These are now service-role only.

- **MEDIUM: `get_item_details` activity leak** - Added tenant filter to tags and activity subqueries to prevent metadata leakage via guessed item IDs.

- **MEDIUM: Child-table FK validation** - Updated RLS INSERT/UPDATE policies on `location_stock`, `lots`, `stock_transfers`, `item_reminders`, and `checkouts` to validate that referenced `item_id` and `location_id` belong to the same tenant.

- **LOW: Edge Function authentication** - Added `CRON_SECRET` header validation to `process-reminders` Edge Function to prevent unauthorized invocation.

- **Belt-and-suspenders: Tenant ID immutability** - Added `prevent_tenant_id_change()` trigger to `profiles`, `inventory_items`, and `folders` tables to block any attempt to modify `tenant_id` at the database level.

### Added

#### Sortly-Compatible Label System
- **5 QR Label Sizes** matching Sortly's label options:
  - Extra Large (5½" × 8½") - Half sheet, 2/sheet - Avery 8126
  - Large (3⅓" × 4") - 6/sheet - Avery 5164/8164
  - Medium (2" × 4") - 10/sheet - Avery 5163/8163
  - Small (1⅓" × 4") - 14/sheet - Avery 5162/8162
  - Extra Small (1" × 2⅝") - 30/sheet - Avery 5160/8160
- **Universal Label Printer Support** with 19 industry-standard label sizes:
  - Small: 1" × 3", 1.125" × 1.25", 1.1875" × 1", 1.2" × 0.85", 1.25" × 1"
  - Medium: 2" × 1", 2.2" × 0.5", 2.25" × 0.5", 2.25" × 1.25", 2.25" × 2", 2.25" × 2.5"
  - Large: 3" × 2", 3" × 3", 4" × 1.5", 4" × 2", 4" × 2.5", 4" × 3", 4" × 5", 4" × 6"
- **Label Size Dropdown** for selecting printer label sizes (replacing fixed thermal options)
- **Dynamic Label Features** based on size:
  - Extra Large/Large & 4"×5"/4"×6" labels: Photo, logo, up to 3 details, note
  - Medium & 4"×3" labels: Photo, 1-2 details
  - Small labels: Name and code only
- **Live Preview Components** for all 6 label sizes
- **Smart UI** that hides unavailable options for smaller label sizes
- **Multiple Barcode Symbologies** for inventory workflows:
  - Auto-detect (UPC/EAN/ITF/GS1)
  - Code 128, Code 39
  - UPC-A, EAN-13, EAN-8
  - ITF-14, GS1-128
- Updated Avery product compatibility references

### Changed

#### UI/UX Improvements
- **Item Detail Page Redesign**:
  - New Quick Actions card with inline quantity adjustment (+1/-1 buttons)
  - Improved QR/Barcode card layout
  - Enhanced checkout section for borrow/return workflows
  - Serial number and shipping dimension display
- **Expandable Edge Button** - Touch 'n Go style floating action button with slide-out menu
- **Notification Bell Improvements** - Badge count display in sidebar navigation
- **Sidebar State Persistence** - Remembers collapsed/expanded state via `useSidebarState` hook
- **Inventory Desktop View** - Improved folder tree navigation and item highlighting
- **Edit Page Highlighting** - Visual feedback when editing items

- **Label Extras Section**: Replaced toggle switches with image selector fields for photo and logo
  - Photo: Select from item's existing photos or upload a custom image
  - Logo: Select company logo or upload a custom image
  - Click to select, with visual checkmark overlay for selected state
  - Remove button to clear selection
  - Fields conditionally shown based on label size support
- Refreshed the label wizard UI with a preview-first layout, card-based option pickers, and a mobile Settings/Preview toggle.
- Simplified printing to two choices: print a full paper sheet (max labels) or print to a label printer.
- Removed DYMO-specific branding - now shows "Works with any label printer" for universal compatibility.
- Label printer sizes now presented in a dropdown selector for easier selection.

### Fixed

- **Auto-generate barcode** is now disabled for formats that require specific numeric patterns (EAN-13, EAN-8, UPC-A, ITF-14, GS1-128). Auto-generate creates alphanumeric barcodes (e.g., `PKL12345678`) which are only compatible with Code 128 and Code 39.
- When selecting a numeric-only barcode format with "Auto-generate" active, the system now automatically switches to "Use existing barcode" (if available) or "Enter manually".

### Database Migrations

| Migration | Purpose |
|-----------|---------|
| `00019_saved_searches.sql` | Saved search functionality |
| `00020_serial_numbers.sql` | Serial number tracking tables |
| `00021_item_reminders.sql` | Item reminders system |
| `00022_reminder_comparison_operator.sql` | Reminder comparison operators |
| `00023_reminder_management_system.sql` | Full reminder management |
| `00024_update_reminder_function.sql` | Reminder update functions |
| `00025_get_item_reminders_with_folder.sql` | Reminders with folder context |
| `00026_security_audit_fixes.sql` | Critical RLS security fixes |
| `00027_tenant_settings_validation.sql` | Tenant settings validation |
| `00028_custom_field_folders.sql` | Folder-scoped custom fields |
| `00029_custom_field_limit.sql` | Custom field limits |
| `00030_checkout_serials.sql` | Checkout serial tracking |
| `00031_pick_list_enhancements.sql` | Pick list ship-to & outcomes |
| `00032_activity_logs_move_details.sql` | Move details in activity logs |
| `00033_purchase_order_enhancements.sql` | PO ship/bill-to addresses |
| `00034_pick_list_assigned_at.sql` | Pick list assigned timestamp |
| `00035_pick_list_number.sql` | Pick list auto-numbering |
| `00036_tenant_org_code.sql` | Organization codes for tenants |
| `00037_entity_sequence_counters.sql` | Sequence counters for display IDs |
| `00038_entity_display_ids.sql` | Display ID columns |
| `00039_backfill_display_ids.sql` | Backfill existing entity IDs |
| `00040_entity_creation_rpcs.sql` | Atomic entity creation RPCs |
| `00041_search_by_display_id.sql` | Search by display ID functions |
| `00042_display_id_letter_prefix.sql` | Letter prefix for display IDs |
| `00043_display_id_immutability.sql` | Prevent display ID changes |
| `00044_stock_counts.sql` | Stock count workflow tables |
| `00045_receives.sql` | Goods receiving (GRN) tables |
| `00046_create_receive_with_items.sql` | Pre-populate receive items RPC |
| `00047_receive_item_serials.sql` | Serial tracking for receives |
| `00048_create_get_item_locations_function.sql` | RPC function for item location stock |

---

## [0.1.0] - 2024-12-20

### Added

#### Core Platform
- Multi-tenant SaaS architecture with pool model (shared tables, RLS isolation)
- Row Level Security (RLS) policies on all 19+ tables
- User authentication via Supabase Auth
- Role-based access control (owner, admin, editor, viewer, member)
- Tenant settings with subscription tiers (free, starter, professional, enterprise)

#### Inventory Management
- Items with full attributes (name, SKU, quantity, price, cost_price, status, barcode, QR code)
- Hierarchical folder structure with materialized path
- Normalized tags with junction table (item_tags)
- Custom field definitions
- Photo uploads to Supabase Storage
- Full-text search with tsvector
- AI semantic search with vector embeddings (pgvector)

#### Check-In/Check-Out System
- Jobs/projects for asset assignments
- Checkout tracking (person, job, or location assignments)
- Due date management with overdue status
- Return condition tracking (good, damaged, needs_repair, lost)

#### Multi-Location Inventory
- Location types: warehouse, van, store, job_site
- Per-location stock tracking (location_stock table)
- Stock transfers between locations with status workflow
- AI-suggested transfers with reasoning

#### Lot/Expiry Tracking
- Multiple lots per item with different expiry dates
- FEFO (First Expired First Out) consumption logic
- Lot status management (active, expired, depleted, blocked)
- Automatic quantity sync from lots

#### Quota Enforcement
- Database-level triggers to enforce max_items and max_users limits
- Application-level validation before item/user creation
- Warning banner at 80% usage on all dashboard pages
- Grandfather strategy for existing over-limit tenants

#### Workflow Features
- Pick lists for order fulfillment
- Purchase orders with vendor management
- Activity logging with full audit trail
- Notifications system (in-app, email for low stock)

#### UI/UX
- Mobile-first responsive design
- Touch 'n Go style expandable action button
- CSV import/export
- QR/barcode scanning
- Offline-first with sync queue

### Database Migrations

| Migration | Purpose |
|-----------|---------|
| `00001_initial_schema.sql` | Core tables & triggers |
| `00002_rls_policies.sql` | RLS policies |
| `00003_storage_setup.sql` | Storage buckets |
| `00004_auth_trigger.sql` | Profile creation trigger |
| `00005_performance_indexes.sql` | Additional indexes |
| `00006_rls_optimization.sql` | Optimized RLS with functions |
| `00007_enum_types.sql` | Enum types & validation |
| `00008_normalize_tags.sql` | Tag junction table |
| `00009_activity_log_partitioning.sql` | Log partitioning |
| `00010_tenant_stats_view.sql` | Statistics views |
| `00011_ai_embeddings.sql` | Vector search support |
| `00012_api_functions.sql` | API helper functions |
| `00013_check_in_out.sql` | Check-in/check-out system |
| `00014_multi_location_inventory.sql` | Multi-location inventory |
| `00015_lot_expiry_tracking.sql` | Lot/expiry tracking |
| `00016_extended_inventory_fields.sql` | Shipping dimensions, tracking mode |
| `00017_allow_admin_update_tenant.sql` | Admin RLS for tenant settings |
| `00018_quota_enforcement.sql` | Quota enforcement triggers |

### Technical Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, RLS)
- FlyonUI components

---

## Version History Format

Each release should document:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed in future
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
- **Database**: Migration changes
