> **📌 Master Note:** This repo is belongs to Edmund Tong Kwan Kiat

# Nook - Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** December 2024
**Status:** Draft
**Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Product Goals & Success Metrics](#4-product-goals--success-metrics)
5. [Core Features (P0 - Must Have)](#5-core-features-p0---must-have)
6. [Differentiating Features (P1 - High Priority)](#6-differentiating-features-p1---high-priority)
7. [Secondary Features (P2-P3)](#7-secondary-features-p2-p3)
8. [Technical Requirements](#8-technical-requirements)
9. [User Stories & Acceptance Criteria](#9-user-stories--acceptance-criteria)
10. [Competitive Positioning](#10-competitive-positioning)
11. [Pricing Strategy](#11-pricing-strategy)
12. [Release Phases](#12-release-phases)

---

## 1. Executive Summary

### Product Vision

**Nook** is a simple, mobile-first inventory management SaaS designed for small businesses who have outgrown spreadsheets but don't need enterprise ERP complexity.

### Positioning Statement

> "An Excel replacement that works on mobile, never loses items, and anyone on the team can use without training."

### Key Differentiators

1. **Trust-first pricing** - No surprise tier jumps or SKU cliffs
2. **Offline-first mobile scanning** - Works where internet is weak
3. **Native check-in/check-out** - Real asset tracking, not just sales inventory
4. **Excel-grade simplicity** - Speed and clarity over feature bloat

### Target Market

Small to medium businesses (1-50 employees) managing physical inventory:
- Construction companies & contractors
- Event management companies
- Retail shops & e-commerce sellers
- Medical clinics & equipment providers
- Warehouses & distribution centers
- Tool rental businesses

---

## 2. Problem Statement

### Market Pain Points (from Reddit Research 2023-2025)

Based on analysis of r/smallbusiness, r/InventoryManagement, r/startups, and r/Entrepreneur:

| Pain Point | Severity | User Quote |
|------------|----------|------------|
| **High software costs** | Critical | "Price more than tripled... the elimination of the middle tier is absurd" |
| **Sudden price hikes** | Critical | "Sortly plan jumped from ~$1,400 to ~$5,800/year with two weeks' notice" |
| **Complex, ERP-style UIs** | High | "If my staff needs training, it's already too complicated" |
| **Manual tracking inefficiency** | High | "There's no system in place - items are getting lost" |
| **Poor mobile/offline support** | High | "Inventory happens on the floor/site, not at desktop" |
| **Missing check-in/check-out** | High | "We tried a clunky workaround in Sortly... it failed and caused lost items" |
| **Integration gaps** | Medium | "Shopify and Xero inventory management are pretty rubbish on their own" |
| **Sync/data trust issues** | Medium | "We had to double-check everything because it sometimes lagged or didn't sync right" |

### The Real Competitor

**Excel/Google Sheets** is the primary competitor, not other SaaS tools. Nook must beat spreadsheets on:
- Speed of data entry
- Clarity of stock visibility
- Cost-effectiveness
- Team collaboration

---

## 3. Target Users

### Primary Personas

#### Persona 1: "The Operations Manager" (Sarah)
- **Role:** Operations manager at a 15-person construction company
- **Age:** 35-50
- **Tech comfort:** Medium - uses smartphone daily, avoids complex software
- **Current solution:** Excel spreadsheets shared via email
- **Pain points:**
  - Tools go missing with no accountability
  - Manual spreadsheet updates are time-consuming
  - No visibility into what's on which job site
- **Goals:**
  - Know where every tool is at all times
  - Reduce time spent on inventory admin
  - Enable field workers to check items in/out easily
- **Budget:** $50-150/month

#### Persona 2: "The Small Retailer" (Mike)
- **Role:** Owner of a 3-person retail shop with online store
- **Age:** 28-45
- **Tech comfort:** Medium-high - manages Shopify store
- **Current solution:** Shopify inventory + manual counts
- **Pain points:**
  - Stock mismatches between physical store and online
  - No low-stock alerts - frequent stockouts
  - Manual reconciliation with QuickBooks
- **Goals:**
  - Single source of truth for inventory
  - Automatic alerts when stock is low
  - Less time on bookkeeping
- **Budget:** $30-100/month

#### Persona 3: "The Field Service Tech" (Carlos)
- **Role:** Service technician at an HVAC company
- **Age:** 25-40
- **Tech comfort:** Low-medium - uses phone for work apps
- **Current solution:** Paper forms, radio calls to office
- **Pain points:**
  - Can't check parts availability in the field
  - Manual logging of parts used on jobs
  - Often no internet on job sites
- **Goals:**
  - Quickly scan parts used on jobs
  - Work offline and sync later
  - Reduce paperwork
- **Budget:** Employer-paid, < $20/user/month

### Anti-Personas (Not Target Users)

- Enterprise companies with 100+ employees
- Manufacturers needing full MRP/BOM systems
- Businesses requiring complex multi-warehouse logistics
- Companies needing advanced forecasting/AI

---

## 4. Product Goals & Success Metrics

### Business Goals

| Goal | Metric | Target (Year 1) |
|------|--------|-----------------|
| User acquisition | Monthly Active Users | 5,000 MAU |
| Revenue | Monthly Recurring Revenue | $50,000 MRR |
| Retention | Monthly churn rate | < 5% |
| Expansion | User upgrades | 20% upgrade to paid |
| NPS | Net Promoter Score | > 40 |

### Product Goals

| Goal | Metric | Target |
|------|--------|--------|
| Speed | Time to add new item | < 10 seconds |
| Simplicity | Time to first value | < 5 minutes |
| Reliability | Data sync accuracy | 99.9% |
| Mobile adoption | % actions on mobile | > 60% |
| Feature adoption | % using barcode scan | > 70% |

### User Success Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Inventory accuracy | User-reported stock accuracy | > 95% |
| Time saved | Weekly hours saved vs. spreadsheets | > 3 hours |
| Team adoption | % of invited users active | > 80% |

---

## 5. Core Features (P0 - Must Have)

These features are **blocking for launch**. Without them, users will not adopt the product.

### 5.1 Simple, Clean UI (Non-ERP Design)

**Priority:** P0
**Importance:** 92% of users

**Description:**
A minimal, intuitive interface that requires no training. Plain language labels, clear visual hierarchy, and fast workflows.

**Requirements:**
- Maximum 3 clicks to any common action
- No jargon or technical terms in UI
- Visual feedback for all actions (success, error states)
- Consistent design patterns across all screens
- Large touch targets for mobile use (minimum 44px)

**UI Principles:**
- Excel-like table layouts where appropriate
- Folder + item mental model (visual hierarchy)
- Color-coded status indicators (green/yellow/red)
- Photo-first item cards for visual confirmation

**Acceptance Criteria:**
- [ ] New user can add first item within 60 seconds of signup
- [ ] No feature requires documentation to understand
- [ ] Non-technical user (persona: Sarah) completes onboarding without help
- [ ] UI passes accessibility audit (WCAG 2.1 AA)

---

### 5.2 Fast Item CRUD Operations

**Priority:** P0
**Importance:** 90% of users

**Description:**
Lightning-fast item creation, reading, updating, and deletion. Single-screen forms, inline editing, and bulk actions.

**Requirements:**
- Single-screen item creation form
- Inline editing in list/table views
- Bulk edit for multiple items
- Undo for recent actions (30-second window)
- Auto-save on all edits

**Fields (Default):**
| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| SKU/ID | Text (auto-generated option) | No |
| Quantity | Number | Yes |
| Category/Folder | Select | No |
| Photo | Image | No |
| Notes | Text | No |
| Min Stock Level | Number | No |
| Unit Cost | Currency | No |
| Location | Select | No |

**Acceptance Criteria:**
- [ ] Add item: < 10 seconds (with name and quantity only)
- [ ] Edit quantity: < 3 seconds (inline)
- [ ] Bulk edit 50 items: < 2 minutes
- [ ] Delete with confirmation: < 5 seconds
- [ ] Undo delete works within 30 seconds

---

### 5.3 Real-Time Stock Visibility

**Priority:** P0
**Importance:** 85% of users

**Description:**
Clear, at-a-glance visibility into current stock levels with color-coded status indicators.

**Requirements:**
- Dashboard showing total items, total value, alerts
- Color status: Green (OK) / Yellow (Low) / Red (Out)
- Large, readable quantity numbers
- Last updated timestamp on all data
- Filter by status (show only low/out of stock)

**Dashboard Widgets:**
1. Total inventory count
2. Total inventory value
3. Low stock alerts count
4. Out of stock count
5. Recent activity feed

**Acceptance Criteria:**
- [ ] Stock levels update within 2 seconds of change
- [ ] Color status visible without clicking into item
- [ ] Dashboard loads in < 1 second
- [ ] User can identify low-stock items in < 5 seconds

---

### 5.4 Low-Stock Alerts & Notifications

**Priority:** P0
**Importance:** 83% of users

**Description:**
Automatic alerts when items fall below defined thresholds. Email and push notifications.

**Requirements:**
- Per-item minimum stock threshold
- Global default threshold option
- Email notifications (configurable frequency)
- Push notifications (mobile app)
- In-app notification center
- Digest option (daily summary vs. real-time)

**Notification Triggers:**
| Trigger | Default Behavior |
|---------|-----------------|
| Stock below minimum | Immediate notification |
| Stock reaches zero | Immediate notification + highlight in UI |
| Stock replenished | Optional notification |

**Acceptance Criteria:**
- [ ] User receives email within 5 minutes of threshold breach
- [ ] Push notification appears within 1 minute
- [ ] User can set per-item thresholds
- [ ] User can disable notifications for specific items
- [ ] Digest email summarizes all alerts from past 24 hours

---

### 5.5 Multi-User Access (Cloud-Based)

**Priority:** P0
**Importance:** 80% of users

**Description:**
Cloud-based system allowing multiple team members to access and update inventory simultaneously with instant sync.

**Requirements:**
- Instant sync across all devices (< 2 seconds)
- No file locking or merge conflicts
- Activity log showing who changed what
- User invitation via email
- Team management dashboard

**User Limits by Plan:**
| Plan | Users Included |
|------|----------------|
| Free | 1 user |
| Starter | 3 users |
| Professional | 10 users |
| Team | Unlimited |

**Acceptance Criteria:**
- [ ] Changes sync to other users within 2 seconds
- [ ] Two users can edit different items simultaneously
- [ ] Activity log shows user, action, timestamp
- [ ] Invitation email sends within 1 minute
- [ ] New user can join team within 2 minutes of invite

---

### 5.6 Folder/Category Hierarchy

**Priority:** P0
**Importance:** 78% of users

**Description:**
Organize items into folders and categories with drag-and-drop management. Tree view navigation.

**Requirements:**
- Unlimited folder nesting depth
- Drag-and-drop items between folders
- Drag-and-drop folder reordering
- Breadcrumb navigation
- Tree view in left sidebar
- Folder-level stock summaries

**Acceptance Criteria:**
- [ ] Create folder in < 5 seconds
- [ ] Move item to folder via drag-and-drop
- [ ] Navigate 3 levels deep in < 3 clicks
- [ ] Folder shows total items and value
- [ ] Search works across all folders

---

### 5.7 Search & Filtering

**Priority:** P0
**Importance:** 76% of users

**Description:**
Google-like instant search with powerful filtering options.

**Requirements:**
- Real-time search as you type
- Search by name, SKU, notes, custom fields
- Filter by category, status, location
- Sort by name, quantity, date modified, value
- Save frequent searches/filters
- Recent searches history

**Acceptance Criteria:**
- [ ] Results appear within 200ms of typing
- [ ] Search finds partial matches
- [ ] Filters can be combined (AND logic)
- [ ] Clear all filters with one click
- [ ] Search works on 10,000+ items without lag

---

## 6. Differentiating Features (P1 - High Priority)

These features are **strong differentiators** that will win users from competitors.

### 6.1 Barcode/QR Scanning (Mobile)

**Priority:** P1
**Importance:** 86% of users

**Description:**
One-tap scan using phone camera to find items, adjust quantities, or add new items.

**Requirements:**
- Camera-based barcode scanning (no external hardware required)
- Support formats: UPC, EAN, QR Code, Code 128, Code 39
- Scan → auto-fill item details (if exists in database)
- Scan → quick quantity adjustment modal
- Scan → add new item flow
- Batch scanning mode for inventory counts
- Optional Bluetooth scanner support

**Scanning Workflows:**
1. **Find Item:** Scan → Show item details
2. **Adjust Stock:** Scan → +/- quantity modal → Save
3. **Add New:** Scan unknown code → New item form (code pre-filled)
4. **Inventory Count:** Continuous scan → Checklist mode

**Acceptance Criteria:**
- [ ] Scan recognized in < 1 second
- [ ] Works in low-light conditions
- [ ] Scan 50 items in batch mode in < 5 minutes
- [ ] Unknown barcode prompts "Add new item?"
- [ ] Scanning works offline (syncs when connected)

---

### 6.2 Mobile App (iOS/Android/PWA)

**Priority:** P1
**Importance:** 88% of users

**Description:**
Native-quality mobile experience optimized for one-handed use and field conditions.

**Requirements:**
- PWA with offline support
- Native apps for iOS and Android
- Large touch targets (min 44px)
- One-handed operation design
- Dark mode support
- Optimized for poor network conditions

**Mobile-Specific Features:**
- Camera for barcode scanning
- Camera for item photos
- Push notifications
- Offline mode with sync queue
- GPS location tagging (optional)

**Acceptance Criteria:**
- [ ] App loads in < 2 seconds on 3G
- [ ] Core functions work fully offline
- [ ] Sync queue processes when back online
- [ ] Battery usage < 5% per hour of active use
- [ ] App size < 50MB

---

### 6.3 Check-In / Check-Out (Asset Tracking)

**Priority:** P1
**Importance:** 70% of users (critical for target verticals)

**Description:**
Assign items to people, jobs, or locations with due dates and return tracking. Essential for construction, events, equipment rental.

**Requirements:**
- Check out item to: Person, Job/Project, Location
- Due date with reminder
- Check-in workflow (scan or manual)
- Overdue items dashboard
- Check-out history per item
- Bulk check-out for job kits

**Check-Out Flow:**
1. Select item(s) or scan barcode
2. Choose assignee (person/job/location)
3. Set due date (optional)
4. Confirm check-out
5. Item status changes to "Checked Out"
6. Assignee notified (optional)

**Check-In Flow:**
1. Scan item or select from "My Checked Out Items"
2. Confirm return condition
3. Add notes (optional)
4. Confirm check-in
5. Item status returns to "Available"

**Acceptance Criteria:**
- [ ] Check out item in < 10 seconds
- [ ] Check in via scan in < 5 seconds
- [ ] Overdue items highlighted in dashboard
- [ ] Reminder sent 24 hours before due date
- [ ] Full check-out history viewable per item
- [ ] Report: Items currently checked out by person

---

### 6.4 Offline-First Mobile Scanning

**Priority:** P1
**Importance:** High (key differentiator vs. Sortly)

**Description:**
Full functionality without internet connection. Queue changes and sync with conflict resolution when back online.

**Requirements:**
- All CRUD operations work offline
- Scanning works offline
- Changes queued with timestamps
- Auto-sync when connection restored
- Conflict resolution UI for concurrent edits
- Visual indicator of sync status

**Sync Behavior:**
| Scenario | Behavior |
|----------|----------|
| Offline edit, no conflict | Auto-sync on reconnect |
| Offline edit, server changed | Show conflict resolution modal |
| Offline add new item | Sync and assign server ID |
| Offline delete | Sync delete (with warning if item was modified) |

**Acceptance Criteria:**
- [ ] App works fully offline for 24+ hours
- [ ] Queued changes show pending status
- [ ] Sync completes within 30 seconds of reconnection
- [ ] Conflict resolution is clear and non-destructive
- [ ] User never loses data due to sync issues

---

### 6.5 Bulk Import/Export (Excel/CSV)

**Priority:** P1
**Importance:** 74% of users

**Description:**
Easy migration from spreadsheets and other systems. Drag-and-drop import with column mapping.

**Requirements:**
- Drag-and-drop CSV/Excel upload
- Column mapping preview before import
- Validation errors shown inline
- Support for 10,000+ rows
- Export to CSV/Excel
- Export filtered/selected items

**Import Workflow:**
1. Upload file (drag-and-drop or browse)
2. Preview data and map columns to fields
3. Review validation errors
4. Import (with progress indicator)
5. Summary: X imported, Y errors

**Acceptance Criteria:**
- [ ] Import 1,000 items in < 30 seconds
- [ ] Import 10,000 items in < 5 minutes
- [ ] Column mapping saves for repeat imports
- [ ] Error rows downloadable for correction
- [ ] Export matches import format exactly

---

### 6.6 E-Commerce Integration (Shopify, WooCommerce)

**Priority:** P1
**Importance:** 68% of users

**Description:**
Two-way sync with e-commerce platforms. Sales automatically decrement inventory; stock updates push to store.

**Integrations (Phase 1):**
- Shopify
- WooCommerce

**Requirements:**
- One-click OAuth connection
- Real-time inventory sync (< 5 minutes)
- Order webhook → auto-decrement stock
- Push stock levels to store
- Conflict handling for simultaneous updates
- SKU matching logic

**Acceptance Criteria:**
- [ ] Connect Shopify store in < 2 minutes
- [ ] Sale decrements Nook inventory within 5 minutes
- [ ] Manual stock update in Nook reflects in Shopify within 5 minutes
- [ ] SKUs auto-match by exact match
- [ ] Unmatched SKUs flagged for manual review

---

### 6.7 Accounting Integration (QuickBooks, Xero)

**Priority:** P1
**Importance:** 65% of users

**Description:**
Connect-once integration for inventory value, COGS, and product sync.

**Integrations (Phase 1):**
- QuickBooks Online
- Xero

**Requirements:**
- One-click OAuth connection
- Push inventory value to accounting
- Sync products/items bidirectionally
- COGS calculation support
- Accountant-friendly reports

**Acceptance Criteria:**
- [ ] Connect QuickBooks in < 2 minutes
- [ ] Inventory value syncs daily (configurable)
- [ ] Products created in Nook appear in QuickBooks
- [ ] Inventory adjustments create journal entries
- [ ] Export inventory valuation report for accountant

---

## 7. Secondary Features (P2-P3)

### P2 - Medium Priority

| Feature | Description | Importance |
|---------|-------------|------------|
| **Custom Fields** | User-defined fields per item (lot #, expiry, serial) | 62% |
| **Basic Reporting** | Stock value, aging, usage reports with export | 58% |
| **Role-Based Permissions** | Admin, Editor, Viewer roles | 55% |
| **Multi-Location Support** | Separate warehouses, vans, job sites | 52% |
| **Purchase Orders & Receiving** | Full PO lifecycle with formal goods receiving | 48% |
| **Historical Snapshots** | Month-end inventory value for accounting | 40% |

---

### Purchase Order & Receiving Workflow

**Status:** Implemented (beyond original P2 scope)

This workflow covers the complete purchase order lifecycle from creation to goods receipt.

#### Purchase Orders (PO)

Create and manage purchase orders for restocking inventory from vendors.

**Features:**
- Create PO with vendor, expected delivery date, and line items
- Display ID format: `PO-{ORG_CODE}-{SEQUENCE}` (e.g., PO-ACM01-00001)
- Status workflow: `draft` → `submitted` → `confirmed` → `partial` → `received` / `cancelled`
- Ship-to and bill-to address management
- Submission and approval tracking (who submitted/approved, when)
- Line items with part numbers, quantities, and unit prices
- Automatic order total calculation (subtotal, tax, shipping)

**PO Status Definitions:**
| Status | Description |
|--------|-------------|
| `draft` | PO is being created, can be edited freely |
| `submitted` | PO sent to vendor, awaiting confirmation |
| `confirmed` | Vendor confirmed the order |
| `partial` | Some items received, awaiting remaining |
| `received` | All items fully received |
| `cancelled` | PO was cancelled |

#### Goods Receiving (GRN)

Formal receiving documents for tracking incoming shipments against purchase orders.

**Features:**
- Multiple receives per PO (supports partial shipments)
- Display ID format: `RCV-{ORG_CODE}-{SEQUENCE}` (e.g., RCV-ACM01-00001)
- Status workflow: `draft` → `completed` / `cancelled`
- Delivery reference tracking (delivery note #, carrier, tracking number)
- Lot/batch tracking during receive (lot number, batch code, expiry date)
- Location assignment for received items
- Item condition tracking (good, damaged, rejected)

**Receive Status Definitions:**
| Status | Description |
|--------|-------------|
| `draft` | Receive being recorded, items can be added/edited |
| `completed` | Receive finalized, inventory updated |
| `cancelled` | Receive was cancelled before completion |

#### PO → Receive Relationship

```
purchase_orders (1) ───────> (*) receives
       │                           │
       ▼                           ▼
purchase_order_items (1) ──> (*) receive_items
       │                           │
       ▼                           ▼
inventory_items               lots (created on receive)
                                   │
                                   ▼
                              location_stock (updated)
```

**On Receive Completion:**
1. Updates `purchase_order_items.received_quantity` for each received item
2. Creates `lots` records if lot tracking info provided (for lot-tracked items)
3. Updates `location_stock` with received quantities at specified locations
4. Updates `inventory_items.quantity` (direct or via lot trigger)
5. Transitions PO status: `partial` if items remain, `received` if all complete

#### User Workflow

1. **Create PO**: Select vendor → add items from inventory → set quantities and prices → submit
2. **Vendor Confirms**: Update PO status to confirmed
3. **Receive Shipment**: From PO detail → click "Create Receive" → record quantities received
4. **Assign Locations**: Optionally specify which location each item goes to
5. **Track Lots**: Optionally enter lot numbers, batch codes, expiry dates
6. **Complete Receive**: Finalize to update inventory counts
7. **Repeat**: Create additional receives for partial shipments until PO is fully received

---

### P3 - Low Priority (Future Roadmap)

| Feature | Description | Importance |
|---------|-------------|------------|
| **API & Webhooks** | Developer integration platform | 32% |
| **Demand Forecasting** | Light reorder suggestions based on history | 28% |
| **Advanced Automation** | Rules engine (if/then workflows) | 25% |
| **Kitting/Bundles** | Composite items from multiple SKUs | 20% |
| **BOM/Manufacturing** | Bill of materials for production | 15% |

---

## 8. Technical Requirements

### Platform Requirements

| Platform | Requirement |
|----------|-------------|
| **Web App** | Modern browsers (Chrome, Safari, Firefox, Edge - last 2 versions) |
| **Mobile Web** | PWA with offline support |
| **iOS App** | iOS 15+ |
| **Android App** | Android 10+ |

### Performance Requirements

| Metric | Target |
|--------|--------|
| Page load time | < 2 seconds |
| API response time | < 200ms (p95) |
| Offline sync time | < 30 seconds |
| Max items per account | 100,000 |
| Max concurrent users | 50 per account |
| Uptime SLA | 99.9% |

### Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Data encryption | TLS 1.3 in transit, AES-256 at rest |
| Authentication | Email/password, Google OAuth, SSO (enterprise) |
| Session management | JWT with refresh tokens |
| Audit logging | All CRUD operations logged |
| Data backup | Daily backups, 30-day retention |
| GDPR compliance | Data export, deletion requests |

### Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nook Core                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ Web App │  │ iOS App │  │ Android │             │
│  └────┬────┘  └────┬────┘  └────┬────┘             │
│       └───────────┼───────────┘                    │
│                   ▼                                 │
│            ┌──────────────┐                        │
│            │   REST API   │                        │
│            └──────┬───────┘                        │
└───────────────────┼─────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│Shopify │    │QuickBooks│    │   Xero   │
└────────┘    └──────────┘    └──────────┘
```

---

## 9. User Stories & Acceptance Criteria

### Epic 1: Onboarding & First Value

#### US-1.1: Quick Signup
**As a** new user
**I want to** sign up with minimal friction
**So that** I can start using the product immediately

**Acceptance Criteria:**
- [ ] Sign up with email + password in < 30 seconds
- [ ] Sign up with Google OAuth in < 15 seconds
- [ ] Email verification optional (can use product immediately)
- [ ] No credit card required for free tier

#### US-1.2: Add First Item
**As a** new user
**I want to** add my first inventory item quickly
**So that** I understand how the product works

**Acceptance Criteria:**
- [ ] Prompted to add first item after signup
- [ ] Only name and quantity required
- [ ] Item visible in inventory list immediately
- [ ] Success message confirms action

#### US-1.3: Import Existing Inventory
**As a** user migrating from spreadsheets
**I want to** import my existing inventory data
**So that** I don't have to re-enter everything manually

**Acceptance Criteria:**
- [ ] Drag-and-drop CSV/Excel upload
- [ ] Column mapping preview
- [ ] Import 1,000 items in < 1 minute
- [ ] Error summary with downloadable error rows

---

### Epic 2: Daily Inventory Operations

#### US-2.1: Quick Stock Adjustment
**As a** warehouse worker
**I want to** quickly adjust item quantities
**So that** inventory stays accurate

**Acceptance Criteria:**
- [ ] Click on quantity to edit inline
- [ ] +/- buttons for quick increment/decrement
- [ ] Enter exact number
- [ ] Change saved immediately
- [ ] Activity log updated

#### US-2.2: Find Item by Scanning
**As a** field worker
**I want to** scan a barcode to find an item
**So that** I don't have to search manually

**Acceptance Criteria:**
- [ ] Open scanner with one tap
- [ ] Item details show within 1 second of scan
- [ ] If not found, prompt to add new item
- [ ] Works offline

#### US-2.3: Check Out Tool to Job Site
**As a** operations manager
**I want to** assign a tool to a job site
**So that** I know where all equipment is

**Acceptance Criteria:**
- [ ] Select item → "Check Out" button
- [ ] Choose job site from list (or create new)
- [ ] Set expected return date
- [ ] Item shows "Checked Out" status
- [ ] Appears in job site's assigned items list

#### US-2.4: Receive Low Stock Alert
**As a** business owner
**I want to** be notified when stock is low
**So that** I can reorder before running out

**Acceptance Criteria:**
- [ ] Email sent when item drops below threshold
- [ ] Push notification on mobile
- [ ] In-app badge shows alert count
- [ ] Can click notification to view item

---

### Epic 3: Team Collaboration

#### US-3.1: Invite Team Member
**As an** admin
**I want to** invite team members
**So that** they can help manage inventory

**Acceptance Criteria:**
- [ ] Enter email address
- [ ] Select role (Admin, Editor, Viewer)
- [ ] Invitation email sent within 1 minute
- [ ] New user can join without creating separate account

#### US-3.2: See Who Changed What
**As a** manager
**I want to** see activity history
**So that** I know who made changes

**Acceptance Criteria:**
- [ ] Activity feed on dashboard
- [ ] Per-item history viewable
- [ ] Filter by user, date, action type
- [ ] Shows: User, Action, Item, Timestamp

---

### Epic 4: Integrations

#### US-4.1: Connect Shopify Store
**As an** e-commerce seller
**I want to** sync inventory with my Shopify store
**So that** stock levels are always accurate

**Acceptance Criteria:**
- [ ] One-click "Connect Shopify" button
- [ ] OAuth flow completes in < 2 minutes
- [ ] Products import automatically
- [ ] Sales decrement inventory
- [ ] Stock updates push to Shopify

#### US-4.2: Sync with QuickBooks
**As a** business owner
**I want to** sync inventory value to QuickBooks
**So that** my accountant has accurate data

**Acceptance Criteria:**
- [ ] One-click "Connect QuickBooks" button
- [ ] OAuth flow completes in < 2 minutes
- [ ] Inventory value syncs daily
- [ ] Can trigger manual sync
- [ ] Export inventory valuation report

---

## 10. Competitive Positioning

### Market Landscape

| Competitor | Strength | Weakness | Nook Advantage |
|------------|----------|----------|------------------|
| **Sortly** | Simple UI, visual | Price hikes, no offline, weak check-out | Trust pricing, offline-first, real asset tracking |
| **Zoho Inventory** | Affordable, integrations | Complex for small teams | Simpler UX, faster onboarding |
| **inFlow** | Feature-rich | Desktop-focused | Mobile-first, offline |
| **Excel/Sheets** | Free, familiar | No collaboration, no mobile, error-prone | Team sync, mobile scanning, alerts |
| **Odoo** | Free, customizable | Complex setup, ERP-like | Zero-config, ready in minutes |

### Competitive Differentiation Matrix

| Feature | Sortly | Zoho | inFlow | Nook |
|---------|--------|------|--------|--------|
| Simple UI (no training) | Yes | No | Yes | **Yes** |
| Mobile-first | Yes | No | No | **Yes** |
| Offline scanning | No | No | No | **Yes** |
| Check-in/check-out | Weak | Yes | Yes | **Best** |
| Transparent pricing | No | Yes | Yes | **Yes** |
| E-commerce integration | No | Yes | Yes | **Yes** |
| One-click migration | No | No | No | **Yes** |

### Win Themes (Sales Messaging)

1. **"No surprise pricing"** - We don't triple your bill overnight
2. **"Works where you work"** - Full offline support for the field
3. **"Track anything"** - Not just sales inventory, but tools and assets
4. **"Team-ready in minutes"** - No training, no IT department needed
5. **"Excel, but better"** - Familiar simplicity with superpowers

---

## 11. Pricing Strategy

### Pricing Philosophy

Based on market research, users value:
1. **Predictability** - No surprise tier jumps
2. **Fairness** - Cost proportional to value received
3. **Transparency** - Clear limits, no hidden fees

### Pricing Tiers

| Plan | Monthly Price | Items | Users | Key Features |
|------|---------------|-------|-------|--------------|
| **Free** | $0 | 100 | 1 | Basic CRUD, mobile app |
| **Starter** | $29 | 1,000 | 3 | + Scanning, alerts, import/export |
| **Professional** | $79 | 10,000 | 10 | + Check-out, integrations, reporting |
| **Team** | $149 | Unlimited | Unlimited | + API, custom fields, priority support |

### Pricing Principles

1. **No SKU cliffs** - Soft limits with overage warnings, not hard blocks
2. **Price-lock guarantee** - 12-month price protection on signup
3. **Simple upgrades** - Pro-rated, self-service, no sales calls
4. **Generous free tier** - Real value for solo users / evaluation
5. **Annual discount** - 20% off for annual commitment

### Migration Pricing

**Sortly Refugees Special:**
- 50% off first 3 months for verified Sortly users
- Free data migration assistance
- Price-match guarantee for 12 months

---

## 12. Release Phases

### Phase 1: MVP (Months 1-3)

**Goal:** Launch core product that beats spreadsheets

**Features:**
- [ ] User authentication (email + Google)
- [ ] Item CRUD (add, edit, delete, view)
- [ ] Folder organization
- [ ] Search and filter
- [ ] Mobile-responsive web app
- [ ] Multi-user access (up to 3)
- [ ] Low-stock alerts (email)
- [ ] CSV import/export

**Success Criteria:**
- 100 beta users
- < 5% day-7 churn
- NPS > 30

---

### Phase 2: Mobile & Scanning (Months 4-6)

**Goal:** Deliver mobile-first experience with barcode scanning

**Features:**
- [ ] PWA with offline support
- [ ] iOS native app
- [ ] Android native app
- [ ] Barcode/QR scanning
- [ ] Camera for item photos
- [ ] Push notifications
- [ ] Offline sync queue

**Success Criteria:**
- 60% of actions on mobile
- 70% of users use scanning
- App store rating > 4.0

---

### Phase 3: Asset Tracking (Months 7-9)

**Goal:** Win construction, events, and equipment verticals

**Features:**
- [ ] Check-in / check-out workflow
- [ ] Assign to person/job/location
- [ ] Due dates and reminders
- [ ] Overdue items dashboard
- [ ] Check-out history
- [ ] Bulk check-out for kits

**Success Criteria:**
- 500 paying customers
- 30% in asset-tracking verticals
- < 3% monthly churn

---

### Phase 4: Integrations (Months 10-12)

**Goal:** Connect to e-commerce and accounting ecosystems

**Features:**
- [ ] Shopify integration
- [ ] WooCommerce integration
- [ ] QuickBooks Online integration
- [ ] Xero integration
- [ ] One-click Sortly migration
- [ ] API v1 for developers

**Success Criteria:**
- $50,000 MRR
- 5,000 MAU
- 40% of paid users using integrations

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **SKU** | Stock Keeping Unit - unique identifier for an item |
| **Check-out** | Assigning an item to a person, job, or location temporarily |
| **Check-in** | Returning a checked-out item to available inventory |
| **Low-stock alert** | Notification when item quantity drops below threshold |
| **PWA** | Progressive Web App - web app with native-like capabilities |

### B. Research Sources

- Reddit threads from r/smallbusiness, r/InventoryManagement, r/startups, r/Entrepreneur (2023-2025)
- Competitor analysis: Sortly, Zoho Inventory, inFlow, Odoo
- User surveys and interviews (internal)

### C. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | Product Team | Initial draft |

---

*This document is maintained by the Product Team. For questions or feedback, please contact the product owner.*
