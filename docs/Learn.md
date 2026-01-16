# StockZip User Guide

**The Complete Guide to Managing Your Inventory with StockZip**

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Managing Inventory Items](#3-managing-inventory-items)
4. [Organizing with Folders](#4-organizing-with-folders)
5. [Barcode & QR Code Scanning](#5-barcode--qr-code-scanning)
6. [Printing Labels](#6-printing-labels)
7. [Search & Filtering](#7-search--filtering)
8. [Purchase Orders & Receiving](#8-purchase-orders--receiving)
9. [Pick Lists & Fulfillment](#9-pick-lists--fulfillment)
10. [Stock Counts (Cycle Counting)](#10-stock-counts-cycle-counting)
11. [Check-In / Check-Out (Asset Tracking)](#11-check-in--check-out-asset-tracking)
12. [Lot & Batch Tracking](#12-lot--batch-tracking)
13. [Serial Number Tracking](#13-serial-number-tracking)
14. [Reminders & Alerts](#14-reminders--alerts)
15. [Auto-Reorder Suggestions](#15-auto-reorder-suggestions)
16. [Vendors & Partners](#16-vendors--partners)
17. [Reports & Analytics](#17-reports--analytics)
18. [Team Management](#18-team-management)
19. [Settings & Configuration](#19-settings--configuration)
20. [Bulk Import & Export](#20-bulk-import--export)
21. [Mobile & Offline Usage](#21-mobile--offline-usage)
22. [Keyboard Shortcuts](#22-keyboard-shortcuts)
23. [Troubleshooting & FAQ](#23-troubleshooting--faq)

---

## 1. Getting Started

### Creating Your Account

1. **Navigate to StockZip** and click **Sign Up**
2. Choose your signup method:
   - **Email & Password**: Enter your email and create a password
   - **Google Sign-In**: Click "Continue with Google" for one-click signup
3. **Verify your email** (optional but recommended)
4. You'll be taken through a brief onboarding to create your first item

### First-Time Setup

After signing up, StockZip guides you through essential setup:

1. **Company Name**: Enter your business or organization name
2. **Create Your First Item**: Add at least one inventory item to understand the workflow
3. **Explore the Dashboard**: Familiarize yourself with the main navigation

### Understanding the Navigation

StockZip is organized into these main sections:

| Section | Description | Access |
|---------|-------------|--------|
| **Dashboard** | Overview of inventory status, metrics, and activity | Top navigation |
| **Inventory** | Browse, search, and manage all items | Top navigation |
| **Tasks** | Purchase orders, receiving, pick lists, stock counts | Sidebar menu |
| **Reports** | Analytics and data exports | Sidebar menu |
| **Partners** | Vendor and customer management | Sidebar menu |
| **Settings** | Company settings, team, integrations | Sidebar menu |

---

## 2. Dashboard Overview

The Dashboard is your inventory command center, showing real-time metrics at a glance.

### Dashboard Widgets

| Widget | What It Shows |
|--------|--------------|
| **Total Items** | Count of all inventory items |
| **Total Value** | Combined value of all stock (quantity × price) |
| **Low Stock** | Items below their minimum threshold |
| **Out of Stock** | Items with zero quantity |
| **Recent Activity** | Latest changes made by your team |

### Status Indicators

StockZip uses color-coded status for quick visibility:

- **Green (In Stock)**: Quantity is above the minimum threshold
- **Yellow (Low Stock)**: Quantity is below minimum but above zero
- **Red (Out of Stock)**: Quantity is zero

### Quick Actions from Dashboard

From the Dashboard, you can:
- Click any metric card to view related items
- Access the Activity Feed to see recent changes
- View alerts for items needing attention

---

## 3. Managing Inventory Items

### Adding a New Item

**Quick Add (< 10 seconds):**

1. Click **+ New Item** button (or use keyboard shortcut)
2. Enter the **Item Name** (required)
3. Enter the **Quantity** (required)
4. Click **Save**

**Full Item Details:**

Expand the form to add optional fields:

| Field | Description |
|-------|-------------|
| **SKU/ID** | Unique identifier (auto-generate or enter manually) |
| **Barcode** | UPC, EAN, or custom barcode number |
| **Category/Folder** | Organize items into folders |
| **Photo** | Upload one or more images |
| **Description** | Detailed item description |
| **Notes** | Internal notes for your team |
| **Min Stock Level** | Trigger low-stock alerts when below this |
| **Unit Cost** | What you pay per unit |
| **Selling Price** | What you charge customers |
| **Tags** | Keywords for easy searching |
| **Custom Fields** | Additional fields you've defined |

### Editing Items

**Inline Editing:**
- Click on the **quantity** number in the list view to edit it directly
- Use the **+1 / -1** buttons for quick adjustments

**Full Edit:**
1. Click on an item to open its detail page
2. Click **Edit** to modify any field
3. Changes are **auto-saved** as you make them

### Quick Actions on Item Detail Page

The item detail page includes Quick Actions:

- **+1 / -1 Buttons**: Instantly adjust quantity
- **Set Quantity**: Enter an exact number
- **Print Label**: Generate QR or barcode labels
- **Check Out**: Assign item to a person, job, or location
- **View History**: See all changes made to this item

### Deleting Items

1. Open the item detail page
2. Click the **Delete** button (trash icon)
3. Confirm the deletion
4. **Undo available for 30 seconds** if you made a mistake

> **Note**: Deleted items are soft-deleted (marked as deleted) and can be recovered by your administrator if needed.

---

## 4. Organizing with Folders

Folders let you create a hierarchical structure for your inventory—like warehouses, shelves, or categories.

### Creating Folders

1. Navigate to **Inventory**
2. Click **+ New Folder**
3. Enter the folder name
4. (Optional) Choose a parent folder for nesting
5. (Optional) Select a color for visual organization
6. Click **Create**

### Folder Hierarchy Example

```
📁 Main Warehouse
   📁 Aisle A
      📁 Shelf 1
      📁 Shelf 2
   📁 Aisle B
📁 Retail Store
   📁 Display Cases
   📁 Back Stock
📁 Service Vans
   📁 Van 1
   📁 Van 2
```

### Moving Items Between Folders

**Drag and Drop:**
- In the desktop view, drag an item to a folder in the sidebar

**Manual Move:**
1. Open the item's detail page
2. Click **Edit**
3. Change the **Folder** field
4. Save

**Bulk Move:**
1. Select multiple items using checkboxes
2. Click **Move** from the bulk actions bar
3. Choose the destination folder

### Folder Summary

Each folder displays:
- **Total Items**: Count of items in that folder (and subfolders)
- **Total Value**: Combined value of items

---

## 5. Barcode & QR Code Scanning

StockZip supports barcode and QR code scanning for fast inventory operations.

### Accessing the Scanner

1. Click the **Scan** button in the navigation (mobile: bottom tab)
2. Allow camera access when prompted
3. Point your camera at a barcode or QR code

### Scanning Modes

| Mode | Use Case |
|------|----------|
| **Single Scan** | Look up one item, view details, adjust quantity |
| **Quick Adjust** | Scan → immediately adjust quantity → save |
| **Batch Counting** | Continuously scan multiple items for stock counts |

### What Happens When You Scan

**If the barcode exists in your inventory:**
- Item details appear immediately
- Quick options to adjust quantity, view full details, or check out

**If the barcode is NOT found:**
- Prompt to **Add New Item**
- Barcode is pre-filled in the new item form

### Supported Barcode Formats

| Format | Description | Example Use |
|--------|-------------|-------------|
| **Code 128** | Alphanumeric, high-density | General inventory |
| **Code 39** | Alphanumeric, legacy | Warehouse labels |
| **UPC-A** | 12-digit numeric | Retail products |
| **EAN-13** | 13-digit numeric | International retail |
| **EAN-8** | 8-digit numeric | Small products |
| **ITF-14** | 14-digit numeric | Shipping containers |
| **QR Code** | Matrix barcode | Quick lookup, URLs |

### Using Hardware Scanners

StockZip works with:
- **USB Barcode Scanners**: Plug into your computer, scan works as keyboard input
- **Bluetooth Scanners**: Pair with your phone or tablet

> **Tip**: Hardware scanners work in any text field—just click on the search box and scan.

---

## 6. Printing Labels

Generate professional labels with QR codes or barcodes for your items.

### Starting the Label Wizard

1. From an item's detail page, click **Print Label**
2. Or select multiple items and click **Print Labels** from bulk actions

### Label Size Options

**Standard Avery Sizes (for desktop printers):**

| Size | Dimensions | Labels per Sheet | Avery # |
|------|------------|------------------|---------|
| Extra Large | 5.5" × 8.5" | 2 | 8126 |
| Large | 3.33" × 4" | 6 | 5164/8164 |
| Medium | 2" × 4" | 10 | 5163/8163 |
| Small | 1.33" × 4" | 14 | 5162/8162 |
| Extra Small | 1" × 2.625" | 30 | 5160/8160 |

**Label Printer Sizes (for thermal printers):**
- 19 industry-standard sizes from 1" × 3" to 4" × 6"

### Customizing Label Content

Depending on label size, you can include:

| Element | Extra Large/Large | Medium | Small |
|---------|-------------------|--------|-------|
| Item Name | ✓ | ✓ | ✓ |
| QR/Barcode | ✓ | ✓ | ✓ |
| Photo | ✓ | ✓ | ✗ |
| Company Logo | ✓ | ✗ | ✗ |
| Details (SKU, Price, etc.) | Up to 3 | 1-2 | ✗ |
| Notes | ✓ | ✗ | ✗ |

### Printing Options

1. **Print to Paper Sheet**: Generates PDF with labels positioned for Avery sheets
2. **Print to Label Printer**: Sends individual labels to thermal printer

### Barcode Format Selection

Choose the barcode type that matches your workflow:
- **Auto-Detect**: Best for general use
- **Code 128 / Code 39**: For custom alphanumeric codes
- **UPC-A / EAN-13**: For retail products with standard codes

> **Note**: Some formats (EAN-13, UPC-A) require specific numeric patterns and cannot use auto-generated codes.

---

## 7. Search & Filtering

StockZip provides powerful search to find any item instantly.

### Global Search

**Quick Access:**
- Press **⌘K** (Mac) or **Ctrl+K** (Windows) anywhere in the app
- Or click the search icon in the header

**What's Searchable:**
- Item name (partial matches work)
- SKU / Item ID
- Barcode number
- Description and notes
- Tags

### Using Filters

Click **Filters** to narrow results by:

| Filter | Options |
|--------|---------|
| **Status** | In Stock, Low Stock, Out of Stock |
| **Folder** | Any folder in your hierarchy |
| **Tags** | Any tags you've created |
| **Date Range** | Created or modified within a period |
| **Quantity Range** | Min/max quantity |

### Combining Filters

Filters work together with AND logic:
- **Status = "Low Stock"** AND **Folder = "Warehouse A"**
- Shows only low-stock items in Warehouse A

### Saving Searches

1. Set up your search and filters
2. Click **Save Search**
3. Name your search (e.g., "Low Stock - Main Warehouse")
4. Access saved searches from the search dropdown

---

## 8. Purchase Orders & Receiving

Manage your purchasing workflow from order creation to goods receipt.

### Creating a Purchase Order

1. Navigate to **Tasks → Purchase Orders**
2. Click **+ New Order**
3. Fill in the order details:

| Field | Description |
|-------|-------------|
| **Vendor** | Select existing or create new |
| **Expected Delivery** | When you expect to receive items |
| **Order Items** | Add items with quantities and prices |
| **Part Numbers** | Vendor's SKU for each item (optional) |
| **Ship To** | Delivery address (optional) |
| **Bill To** | Billing address (optional) |
| **Notes** | Internal notes |

4. Click **Save as Draft** or **Submit**

### Adding Items to a PO

1. Click **Add Item** in the order form
2. Search your inventory or type a custom item name
3. Enter quantity and unit price
4. (Optional) Add vendor part number
5. Repeat for additional items

> **Tip**: Check "Show low stock items only" to quickly see what needs reordering.

### PO Status Workflow

| Status | Meaning |
|--------|---------|
| **Draft** | Order being created, fully editable |
| **Submitted** | Sent to vendor, awaiting confirmation |
| **Confirmed** | Vendor confirmed the order |
| **Partial** | Some items received, awaiting remainder |
| **Received** | All items fully received |
| **Cancelled** | Order was cancelled |

### Receiving Items (Goods Receipt)

When a shipment arrives:

1. Open the Purchase Order
2. Click **Receive Items**
3. A new Receive document is created with all pending items
4. For each item, enter:
   - **Quantity Received** (defaults to remaining quantity)
   - **Location** (where items will be stored)
   - **Condition** (good, damaged, rejected)
   - **Lot/Batch Info** (for lot-tracked items)
   - **Serial Numbers** (for serialized items)
5. Click **Complete Receive**

### Multiple Receives (Partial Shipments)

If a PO arrives in multiple shipments:
1. Create a receive for each shipment
2. Each receive updates the "received" quantities
3. PO automatically moves to "Partial" then "Received" status

### Receive Document Numbers

Receives are assigned IDs like `RCV-ACM01-00001` for easy reference.

---

## 9. Pick Lists & Fulfillment

Pick lists help you fulfill orders by gathering items from your inventory.

### Creating a Pick List

1. Navigate to **Tasks → Pick Lists**
2. Click **+ New Pick List**
3. Configure the pick list:

| Field | Description |
|-------|-------------|
| **Items** | Add items and quantities to pick |
| **Ship To** | Customer delivery address |
| **Item Outcome** | What happens after picking (see below) |
| **Assign To** | Team member responsible for picking |
| **Due Date** | When picking should be completed |
| **Notes** | Special instructions |

### Item Outcome Options

| Outcome | What Happens |
|---------|--------------|
| **Decrement** | Subtract picked quantity from inventory |
| **Checkout** | Mark items as checked out to customer/job |
| **Transfer** | Move items to a different location |

### Picking Items

1. Assigned team member opens the pick list
2. For each item:
   - The **location** shows where to find it
   - Click the item or scan its barcode
   - Enter quantity picked (supports partial picks)
3. Progress bar shows completion percentage
4. Click **Complete** when finished

### Partial Picking

If you can't pick the full quantity:
1. Enter the actual quantity picked
2. Remaining items stay on the list
3. Click **Complete Partial** to finish with what's available

### Pick List Status

| Status | Meaning |
|--------|---------|
| **Draft** | Being created, fully editable |
| **Assigned** | Assigned to a picker, waiting to start |
| **In Progress** | Picking has started |
| **Completed** | All items picked |
| **Cancelled** | Pick list was cancelled |

---

## 10. Stock Counts (Cycle Counting)

Stock counts help verify your inventory accuracy through physical counts.

### Creating a Stock Count

1. Navigate to **Tasks → Stock Count**
2. Click **+ New Count**
3. Configure the count:

| Option | Description |
|--------|-------------|
| **Scope** | Entire inventory, specific folder, or location |
| **Assign To** | Team member performing the count |
| **Due Date** | When count should be completed |

4. Click **Create**

### Performing a Count

1. Open the stock count
2. Click **Start Count** to begin
3. For each item:
   - Find the item physically
   - Enter the **actual quantity** counted
   - System calculates **variance** (Expected vs Actual)
   - Click **Mark Counted**
4. Progress bar shows items counted vs. total

### Variance Tracking

The count shows:
- **Expected**: What StockZip thinks you have
- **Actual**: What you physically counted
- **Variance**: The difference (+ or -)
- **Percentage**: Variance as a percentage

### Completing a Count

1. Count all items (or as many as needed)
2. Click **Submit for Review** when done
3. Review variances
4. Choose to **Apply Adjustments** to update inventory quantities
5. Click **Complete**

### Count Status Workflow

| Status | Meaning |
|--------|---------|
| **Draft** | Count created, not started |
| **In Progress** | Counting has begun |
| **Review** | Counting complete, awaiting review |
| **Completed** | Count finalized, adjustments applied |

---

## 11. Check-In / Check-Out (Asset Tracking)

Track items assigned to people, jobs, or locations.

### Checking Out Items

1. Open an item's detail page
2. Click **Check Out**
3. Fill in checkout details:

| Field | Description |
|-------|-------------|
| **Assign To** | Person, Job/Project, or Location |
| **Due Date** | When item should be returned |
| **Serial Numbers** | Specific serials (for serialized items) |
| **Notes** | Checkout notes |

4. Click **Confirm**

### What Happens on Checkout

- Item status changes to **Checked Out**
- Assignment visible on item detail page
- Item appears in assignee's checkout list
- Reminder sent 24 hours before due date

### Checking In Items

1. From item detail page, click **Check In**
2. Or navigate to your **Checkouts** list and select items
3. Record return condition:
   - **Good**: Ready for use
   - **Damaged**: Needs attention
   - **Needs Repair**: Requires service
   - **Lost**: Item was not returned
4. Add return notes (optional)
5. Click **Confirm**

### Overdue Items

- Items past their due date are flagged as **Overdue**
- Dashboard shows overdue count
- Notifications sent for overdue items

### Checkout History

Each item maintains a full checkout history:
- Who had it and when
- Return condition
- Any notes recorded

---

## 12. Lot & Batch Tracking

Track inventory by lot or batch for expiry management and traceability.

### Enabling Lot Tracking

Lot tracking is set per item:
1. Edit the item
2. Set **Tracking Mode** to **Lot/Batch**
3. Save

### Creating Lots

Lots are typically created during goods receiving:
1. When receiving items, enter lot information:
   - **Lot Number**: Your reference code
   - **Batch Code**: Manufacturer's batch code
   - **Expiry Date**: When the lot expires
   - **Manufactured Date**: Production date (optional)
   - **Quantity**: Units in this lot

### Viewing Lots

On an item's detail page:
- **Lots tab** shows all lots for this item
- Each lot displays quantity, expiry, and status

### Lot Status

| Status | Meaning |
|--------|---------|
| **Active** | Available for use |
| **Expired** | Past expiry date |
| **Depleted** | Quantity reached zero |
| **Blocked** | Manually blocked from use |

### FEFO (First Expired First Out)

StockZip automatically:
- Prioritizes consumption from earliest-expiring lots
- Alerts you about expiring lots
- Tracks which lot was used for each transaction

---

## 13. Serial Number Tracking

Track individual units by unique serial numbers.

### Enabling Serial Tracking

1. Edit the item
2. Set **Tracking Mode** to **Serial Number**
3. Save

### Adding Serial Numbers

**During Goods Receiving:**
1. For serialized items, click the **serial icon** on the receive line
2. Choose entry method:
   - **Scan**: Scan each serial barcode (auto-focuses for continuous scanning)
   - **Manual**: Type serials one at a time
   - **Bulk Paste**: Paste multiple serials (comma or newline separated)
3. Progress shows "X of Y serials entered"
4. Complete the receive

**Manual Entry:**
1. Open item detail page
2. Go to **Serials** tab
3. Click **Add Serial**
4. Enter the serial number
5. Optionally add condition, location, or notes

### Serial Number Features

- **Duplicate Detection**: Warns if serial already exists
- **Per-Serial Condition**: Track good/damaged/lost per unit
- **Checkout Linking**: Track which specific serial is checked out
- **Full History**: See history for each serial number

---

## 14. Reminders & Alerts

Set up notifications for important inventory events.

### Types of Reminders

| Type | Trigger | Use Case |
|------|---------|----------|
| **Low Stock** | Quantity falls below threshold | Reorder alerts |
| **Expiry** | N days before expiry date | Perishables |
| **Restock** | Scheduled date/time | Regular ordering |

### Creating a Reminder

**From Item Detail Page:**
1. Open the item
2. Find the **Reminders** section
3. Click **Add Reminder**
4. Configure:
   - **Type**: Low Stock, Expiry, or Restock
   - **Threshold**: For low stock, the quantity trigger
   - **Days Before**: For expiry, how many days advance notice
   - **Recurrence**: Once, Daily, Weekly, or Monthly
   - **Notification Method**: In-app, Email, or both
5. Click **Save**

### Managing Reminders

Navigate to **Reminders** in the sidebar:
- **Tabs**: All, Low Stock, Expiry, Restock
- **Status**: Active, Paused, Triggered, Expired
- **Actions**: Edit, Pause, Delete

### Notification Delivery

| Channel | How It Works |
|---------|--------------|
| **In-App** | Bell icon shows notification count |
| **Email** | Sent to your registered email |
| **Push** | Mobile app push notification |

---

## 15. Auto-Reorder Suggestions

StockZip automatically identifies items that need reordering.

### Accessing Reorder Suggestions

Navigate to **Tasks → Reorder Suggestions**

### How It Works

StockZip identifies items:
1. **Below Reorder Point**: Items at or below their reorder threshold
2. **Below Min Quantity**: Items below minimum if no reorder point set
3. **Out of Stock**: Critical items with zero quantity

### Urgency Levels

| Level | Color | Meaning |
|-------|-------|---------|
| **Critical** | Red | Out of stock |
| **Urgent** | Orange | Below minimum threshold |
| **Reorder** | Yellow | At or below reorder point |

### Vendor Grouping

Suggestions are grouped by vendor for efficient ordering:
- See all items to order from each vendor
- Estimated total per vendor
- One-click to create Purchase Order

### Creating a PO from Suggestions

1. Review items grouped by vendor
2. Click **Create PO** for a vendor group
3. Draft PO is created with:
   - Vendor pre-selected
   - Items pre-populated with suggested quantities
   - Vendor SKUs and costs from item-vendor relationships
4. Review and submit the PO

### Setting Up Reorder Points

For best results, configure each item:
1. Edit the item
2. Set **Reorder Point** (triggers suggestion)
3. Set **Reorder Quantity** (suggested order quantity)
4. Link to **Preferred Vendor** (see Vendors section)

---

## 16. Vendors & Partners

Manage your suppliers and customers.

### Adding a Vendor

1. Navigate to **Partners → Vendors**
2. Click **+ New Vendor**
3. Enter vendor details:

| Field | Description |
|-------|-------------|
| **Name** | Vendor/Company name (required) |
| **Contact** | Primary contact person |
| **Email** | Contact email |
| **Phone** | Contact phone |
| **Address** | Full business address |
| **Notes** | Internal notes |

4. Click **Save**

### Linking Items to Vendors

Connect items to their suppliers:

1. Edit an item
2. In the **Vendors** section, click **Add Vendor**
3. Configure:
   - **Vendor**: Select from your vendors
   - **Vendor SKU/Part Number**: Vendor's product code
   - **Unit Cost**: Price from this vendor
   - **Lead Time**: Days to receive after ordering
   - **Preferred**: Set as primary vendor
4. Save

Benefits of linking:
- Auto-fills vendor info in Purchase Orders
- Powers auto-reorder suggestions
- Tracks pricing by vendor

### Managing Customers

Navigate to **Partners → Customers** to:
- Add customer records
- Store ship-to addresses
- Link customers to pick lists

---

## 17. Reports & Analytics

Access insights about your inventory.

### Available Reports

| Report | What It Shows |
|--------|--------------|
| **Inventory Summary** | Overview by category/folder |
| **Inventory Value** | Total value by location/category |
| **Low Stock Alert** | Items below minimum threshold |
| **Stock Movement** | In/out activity over time |
| **Activity Log** | All changes by users |
| **Expiring Items** | Items approaching expiration |
| **Profit Margin** | Margin analysis by item/category |
| **Inventory Trends** | Historical quantity changes |

### Running Reports

1. Navigate to **Reports**
2. Select the report type
3. Configure filters:
   - Date range
   - Categories/folders
   - Locations
4. Click **Generate**
5. View on screen or **Export to CSV**

### Dashboard Metrics

The Dashboard provides quick metrics:
- Total inventory count and value
- Low/out of stock counts
- Recent activity feed
- Profit projections

---

## 18. Team Management

Collaborate with your team on inventory management.

### User Roles

| Role | Capabilities |
|------|--------------|
| **Owner** | Full access including billing, can delete account |
| **Admin** | Manage inventory, settings, and team members |
| **Editor** | Create and edit items, run reports |
| **Viewer** | Read-only access to inventory and reports |

### Viewing Your Team

Navigate to **Settings → Team** to see:
- All team members
- Their roles and email addresses
- Join dates

### Inviting Team Members

> Note: Team invitations are coming soon. Current setup requires admin assistance.

### Activity Attribution

All changes are logged with:
- Who made the change
- What was changed
- When it happened

View in:
- Dashboard activity feed
- Item history
- Activity Log report

---

## 19. Settings & Configuration

Customize StockZip for your business.

### Company Settings

Navigate to **Settings → Company**:
- **Organization Name**: Your business name
- **Logo**: Upload for labels and reports
- **Primary Color**: Brand accent color
- **Tax ID**: For invoice purposes

### Profile Settings

Navigate to **Settings → Profile**:
- **Display Name**: Your name in the app
- **Email**: Your login email
- **Avatar**: Profile picture
- **Timezone**: For correct timestamps
- **Date Format**: How dates display

### Preferences

Navigate to **Settings → Preferences**:
- **Theme**: Light or dark mode
- **Date/Time Format**: Regional preferences
- **Currency**: Default currency display
- **Notifications**: Email and push settings

### Label Settings

Navigate to **Settings → Labels**:
- **Default Label Size**: Pre-selected size
- **Default Barcode Format**: Pre-selected format
- **Company Logo for Labels**: Logo to include

### Tax Settings

Navigate to **Settings → Taxes**:
- Define tax rates
- Assign to categories
- Configure inclusive/exclusive pricing

### Feature Toggles

Navigate to **Settings → Features**:
- Enable/disable experimental features
- Access beta functionality

---

## 20. Bulk Import & Export

Move data in and out of StockZip efficiently.

### Importing Items

Navigate to **Settings → Bulk Import**:

**Step 1: Upload**
- Drag and drop CSV or Excel file
- Or click to browse
- Supports up to 50,000 rows

**Step 2: Map Columns**
- StockZip auto-detects common headers
- Manually map columns to fields
- Required: Name, Quantity (minimum)

**Step 3: Preview**
- Review first 50 rows
- See validation errors highlighted
- Download error rows to fix

**Step 4: Import**
- Watch progress indicator
- Large imports may take several minutes

**Step 5: Summary**
- See counts: Imported, Skipped, Failed
- Download detailed error report

### Import Tips

- Use the **template CSV** for correct format
- **SKU matching**: Existing SKUs update items instead of creating duplicates
- **Folders**: Use folder path like "Warehouse/Shelf A" to auto-create hierarchy
- **Tags**: Comma-separate multiple tags

### Exporting Items

1. Navigate to **Inventory**
2. (Optional) Apply filters to select specific items
3. Click **Export**
4. Choose format: **CSV**
5. Select fields to include
6. Download the file

---

## 21. Mobile & Offline Usage

StockZip is designed for mobile-first, offline-capable use.

### Mobile Navigation

- **Bottom Tab Bar**: Dashboard, Inventory, Tasks, Scan, Profile
- **Large Touch Targets**: Designed for one-handed operation
- **Pull to Refresh**: Update data with a swipe

### Offline Mode

StockZip works without internet:

**What Works Offline:**
- Browse all your inventory
- Search and filter items
- View item details
- Adjust quantities
- Scan barcodes
- Create new items

**Offline Indicators:**
- Banner shows "Offline" status
- Pending changes count displayed
- Changes queued automatically

**Syncing:**
- When connection restores, changes sync automatically
- Typically completes in < 30 seconds
- Conflicts handled safely (you'll be prompted if issues arise)

### PWA Installation

Install StockZip like a native app:

**iOS (Safari):**
1. Visit StockZip in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android (Chrome):**
1. Visit StockZip in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"

---

## 22. Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts.

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| **⌘K** / **Ctrl+K** | Open global search |
| **⌘N** / **Ctrl+N** | Create new item |
| **⌘S** / **Ctrl+S** | Save current form |
| **⌘Z** / **Ctrl+Z** | Undo recent action |
| **⌘,** / **Ctrl+,** | Open settings |
| **?** | Show help |

### Navigation

| Shortcut | Action |
|----------|--------|
| **G then D** | Go to Dashboard |
| **G then I** | Go to Inventory |
| **G then S** | Go to Scan |

### Item Actions

| Shortcut | Action |
|----------|--------|
| **E** | Edit current item |
| **P** | Print label |
| **C** | Check out |
| **Delete** | Delete item |

---

## 23. Troubleshooting & FAQ

### Common Issues

**Q: Items aren't syncing**
A: Check for the offline banner. If shown, wait for connection to restore. Try pulling down to refresh. If stuck, log out and back in.

**Q: Barcode scanner isn't working**
A:
1. Ensure camera permission is granted
2. Check lighting—scanning works best with good light
3. Hold phone steady at correct distance
4. Clean camera lens

**Q: Import is failing**
A:
1. Check required fields (Name, Quantity minimum)
2. Download the template CSV for correct format
3. Ensure no special characters in headers
4. Check file size (max 50,000 rows)

**Q: Low stock alerts not triggering**
A:
1. Verify min_quantity is set on the item
2. Create a reminder for the item
3. Check notification settings are enabled

**Q: Can't see other team members' changes**
A:
1. Changes sync in real-time but may take 2-3 seconds
2. Pull down to refresh
3. Check internet connection

**Q: Checked out items missing from inventory**
A: Items with "Checked Out" status are still in inventory. Use the Status filter and select "Checked Out" to view them.

**Q: Purchase order stuck in wrong status**
A: Only draft orders can be freely edited. Submitted orders follow a workflow. Contact your admin to cancel and recreate if needed.

### Getting Help

- **In-App Help**: Click the Help icon in navigation
- **Ask Zoe**: Use the AI assistant for quick answers
- **Support**: Contact support@stockzip.com
- **Feedback**: Report issues at the GitHub repository

### Performance Tips

1. **Use barcode scanning** for fastest data entry
2. **Set up reminders** instead of manually checking stock
3. **Batch operations** when possible (bulk import, bulk edit)
4. **Save frequent searches** for one-click access
5. **Assign checkouts** to track who has what
6. **Link items to vendors** for smart reordering
7. **Use folders** to organize large inventories

---

## Getting Started Checklist

Use this checklist when setting up StockZip:

- [ ] Create your account and verify email
- [ ] Complete onboarding (create first item)
- [ ] Set company name and logo in Settings
- [ ] Create folder structure (warehouse hierarchy)
- [ ] Add initial items (manual or bulk import)
- [ ] Set min stock levels on important items
- [ ] Invite team members and assign roles
- [ ] Test barcode scanning on mobile
- [ ] Set up low-stock reminders
- [ ] Add your vendors
- [ ] Generate and print QR labels
- [ ] Run your first stock count
- [ ] Review reports and dashboard

---

*Need more help? Contact support@stockzip.com or use the in-app Help feature.*

**Document Version:** 1.0
**Last Updated:** January 2026
