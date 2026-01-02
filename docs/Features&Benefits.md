# Nook - Features & Benefits

A comprehensive inventory management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

---

## Table of Contents

1. [Core Inventory Management](#1-core-inventory-management)
2. [Multi-Tenant Architecture](#2-multi-tenant-architecture)
3. [Chatter Communication System](#3-chatter-communication-system)
4. [Task Management](#4-task-management)
5. [Label & Printing System](#5-label--printing-system)
6. [Reporting & Analytics](#6-reporting--analytics)
7. [User Interface & Experience](#7-user-interface--experience)
8. [Security & Access Control](#8-security--access-control)
9. [Integration & API](#9-integration--api)
10. [Technical Architecture](#10-technical-architecture)

---

## 1. Core Inventory Management

### Item Management
- **Hierarchical Organization**: Items organized in folder/location tree structure (warehouse → shelf → bin)
- **Rich Item Attributes**: Name, SKU, quantity, min/max stock levels, price, cost price, custom fields, photos, tags, notes
- **Photo Management**: Multiple photos per item with Supabase Storage integration
- **Custom Fields**: Extensible item properties for industry-specific needs (folder-scoped with per-tenant limits)
- **Tags & Categories**: Flexible categorization system with normalized junction table
- **Shipping Dimensions**: Length, width, height, weight for logistics

### Stock Control
- **Real-Time Quantity Tracking**: Live stock levels with optimistic updates
- **Stock Movements**: Track every quantity change (add, remove, move, adjust) with timestamps and reasons
- **Low Stock Alerts**: Automatic notifications when quantity falls below minimum threshold
- **Min/Max Stock Levels**: Define reorder points and maximum capacity
- **Audit Trail**: Complete history of all stock changes with who/when/why

### Lot/Batch & Expiry Tracking
- **Multiple Lots Per Item**: Track different batches with unique lot numbers and batch codes
- **Expiry Date Management**: Track expiration dates per lot
- **FEFO Logic**: First Expired First Out consumption for perishables
- **Lot Status Management**: Active, expired, depleted, blocked states
- **Automatic Quantity Sync**: Lot quantities roll up to item totals
- **Manufactured Date Tracking**: Record production dates and shelf life

### Serial Number Tracking
- **Serial-Aware Inventory**: Track individual units by serial number
- **Serial Entry During Receiving**: Scan-focused modal with duplicate detection
- **Bulk Serial Entry**: Paste multiple serials (newline/comma separated)
- **Per-Serial Condition Tracking**: Track condition of each serialized unit
- **Checkout Serial Linking**: Associate checkouts with specific serial numbers

### Item Reminders System
- **Low Stock Reminders**: Trigger when quantity falls below threshold
- **Expiry Reminders**: Alert N days before expiry date
- **Restock Reminders**: Scheduled reminders for reordering
- **Recurrence Options**: Once, Daily, Weekly, Monthly
- **Notification Channels**: In-app notifications and email
- **Reminder Management Page**: Tabbed view with status badges (Active, Paused, Triggered, Expired)
- **Item Detail Integration**: Inline reminder cards with quick add/edit

### Location Management
- **Multi-Location Support**: Manage multiple warehouses, stores, vans, or job sites
- **Location Types**: warehouse, van, store, job_site
- **Per-Location Stock Tracking**: Track quantities at each location separately
- **Location-Based Views**: Filter and view inventory by location
- **Stock Transfers**: Move items between locations with status workflow (pending, in_transit, received, cancelled)
- **AI-Suggested Transfers**: Intelligent transfer recommendations with reasoning

---

## 2. Multi-Tenant Architecture

### Tenant Isolation
- **Pool Model Architecture**: Single project with shared tables and strict Row-Level Security (RLS)
- **Complete Data Isolation**: Tenants cannot see each other's data at the database level
- **Secure Authentication**: Supabase Auth with tenant-scoped access
- **Per-Tenant Customization**: Each tenant can have custom settings and branding

### Security Model
- **Row-Level Security**: All tables protected by RLS policies
- **Tenant ID Enforcement**: Every query filtered by tenant_id automatically
- **Service Role Protection**: Admin operations isolated from client code
- **Audit Logging**: Track all user actions for compliance

### Scalability
- **Indexed Tenant Queries**: Optimized queries with tenant_id indexes
- **Connection Pooling**: Supavisor/PgBouncer ready from the start
- **Partition-Ready Schema**: Designed for table partitioning as data grows

---

## 3. Chatter Communication System

### Messaging Features
- **Entity-Based Discussions**: Attach conversations to any entity (items, orders, counts)
- **Real-Time Messaging**: Instant message delivery and updates
- **@Mentions**: Tag team members with autocomplete search
- **Threaded Replies**: Single-level threading for organized discussions
- **Edit & Delete**: Modify or remove own messages with (edited) indicator

### Collaboration
- **Follow/Unfollow Entities**: Subscribe to updates on specific items or orders
- **Auto-Follow on Post**: Automatically follow entities you comment on
- **Notification Preferences**: Control in-app, email, and push notifications per entity
- **Followers List**: See who's following each entity

### Supported Entities
- Inventory Items (`/inventory/[itemId]`)
- Purchase Orders (`/tasks/purchase-orders/[id]`)
- Stock Counts (`/tasks/stock-count/[id]`)
- Pick Lists (`/tasks/pick-lists/[pickListId]`)
- Receives (`/tasks/receives/[id]`)

---

## 4. Task Management

### Tasks Hub
- **Unified Interface**: Centralized task management at `/tasks`
- **Category-Based Navigation**: Three sub-menu categories for organized workflows
  - **Inbound**: Purchase Orders, Receives
  - **Fulfillment**: Pick Lists
  - **Inventory Operations**: Checkouts, Transfers, Moves, Stock Count
- **Mobile Bottom Navigation**: Tasks tab in mobile navigation
- **Sidebar Sub-Menus**: Expandable sub-menus for workflow categories

### Display ID System
- **Human-Readable IDs**: Format `{PREFIX}-{ORG_CODE}-{SEQUENCE}`
  - Purchase Orders: `PO-ACM01-00001`
  - Pick Lists: `PL-ACM01-00001`
  - Receives: `RCV-ACM01-00001`
  - Stock Counts: `SC-ACM01-00001`
- **Organization Codes**: Auto-generated 5-character code per tenant (e.g., "ACM01" for "Acme Corp")
- **Immutable After Creation**: Display IDs cannot be modified once created
- **Searchable**: Find entities by display ID

### Purchase Orders
- **Full PO Workflow**: Create, edit, submit, confirm, receive, close
- **Vendor Management**: Quick-add vendor modal with contact details
- **Auto-Generated Order Numbers**: PO-0001 format with auto-increment
- **Low Stock Filter**: Checkbox to show only items below minimum stock level
- **Part Numbers**: Vendor/manufacturer part number per line item
- **Ship To / Bill To Addresses**: Collapsible address sections with "Same as Ship To" option
- **Status Workflow**: Draft → Submitted → Confirmed → Received → Completed
- **Inline Editing**: Edit quantities directly for draft orders
- **Submission/Approval Tracking**: Track who submitted and approved with timestamps

### Goods Receiving (GRN)
- **Formal Receive Documents**: Multiple receives per PO (supports partial shipments)
- **Pre-Populated Items**: Auto-populates remaining quantities from PO
- **Receive Details**: Received date, delivery note #, carrier, tracking number
- **Lot/Batch Tracking**: Capture lot number, batch code, expiry date during receive
- **Per-Item Location**: Assign location for each received item
- **Item Condition**: Track as good, damaged, or rejected
- **Serial Number Entry**: Scan-focused modal for serialized items with progress indicator
- **Status Workflow**: Draft → Completed / Cancelled
- **Auto-Update PO**: Automatically updates PO received quantities and status

### Stock Counts / Cycle Counts
- **Scope Settings**: Count entire inventory or specific location/folder
- **Team Assignment**: Assign counts to specific team members
- **Unified Counting Interface**: Search, filter, and record counts inline
- **Variance Tracking**: Automatic calculation of expected vs. counted
- **Progress Visualization**: Progress bar with "X of Y items counted"
- **Status Workflow**: Draft → In Progress → Review → Completed
- **Automatic Adjustments**: Optional inventory adjustment on completion
- **Mobile-Friendly**: Dedicated mobile counting interface

### Pick Lists
- **Order Fulfillment**: Create pick lists for customer orders
- **Item Outcome Options**: Decrement (default), Checkout, or Transfer
- **Ship To Address**: Full shipping address fields
- **Assignee Management**: Assign pick lists to team members
- **Assigned At Tracking**: Track when picks were assigned
- **Status Workflow**: Draft → Assigned → In Progress → Completed
- **Pick Status Display**: Track pick progress per item

### Check-In / Check-Out
- **Asset Tracking**: Issue tools and equipment with accountability
- **Checkout Assignments**: Assign to person, job, or location
- **Due Date Management**: Set return due dates with overdue tracking
- **Return Condition**: Track condition on return (good, damaged, needs repair, lost)
- **Serial-Aware Checkouts**: Link checkouts to specific serial numbers
- **Batch Operations**: Checkout multiple items at once
- **Checkout History**: Full activity log per item

---

## 5. Label & Printing System

### QR Label Sizes (Sortly-Compatible)
- **Extra Large (5.5" x 8.5")**: Half sheet, 2/sheet - Avery 8126 - Photo, logo, 3 details, note
- **Large (3.33" x 4")**: 6/sheet - Avery 5164/8164 - Photo, logo, 3 details, note
- **Medium (2" x 4")**: 10/sheet - Avery 5163/8163 - Photo, 1-2 details
- **Small (1.33" x 4")**: 14/sheet - Avery 5162/8162 - Name and code only
- **Extra Small (1" x 2.625")**: 30/sheet - Avery 5160/8160 - Name and code only

### Universal Label Printer Support
- **19 Industry-Standard Sizes**: From 1"x3" to 4"x6"
- **Small Labels**: 1"x3", 1.125"x1.25", 1.1875"x1", 1.2"x0.85", 1.25"x1"
- **Medium Labels**: 2"x1", 2.2"x0.5", 2.25"x0.5", 2.25"x1.25", 2.25"x2", 2.25"x2.5"
- **Large Labels**: 3"x2", 3"x3", 4"x1.5", 4"x2", 4"x2.5", 4"x3", 4"x5", 4"x6"
- **Works With Any Label Printer**: Universal compatibility

### Multiple Barcode Symbologies
- **Auto-Detect**: UPC/EAN/ITF/GS1 auto-detection
- **Code 128**: Alphanumeric, high-density
- **Code 39**: Alphanumeric, legacy systems
- **UPC-A**: 12-digit retail products
- **EAN-13 / EAN-8**: International retail
- **ITF-14**: Shipping containers
- **GS1-128**: Supply chain applications
- **Smart Auto-Generate**: Disables for numeric-only formats

### Label Wizard
- **Multi-Step Process**: Guided label creation workflow
- **Live Preview**: Real-time preview for all label sizes
- **Dynamic Content**: Features adjust based on label size
- **Image Selection**: Choose from item photos or upload custom
- **Logo Support**: Add company logo to larger labels
- **Detail Configuration**: Select which item details to display

### Print Options
- **PDF Generation**: Print-ready PDF sheets with proper margins
- **Direct Label Printing**: Print to any label printer
- **Email Delivery**: Send labels via email (Resend integration)
- **Batch Printing**: Print multiple labels at once

---

## 6. Reporting & Analytics

### Inventory Reports
- **Inventory Valuation**: Total value by location, category, or custom grouping
- **Stock Movement History**: Complete audit trail of all changes
- **Low Stock Report**: Items below minimum with reorder suggestions
- **Stock Level Summary**: Current quantities across all locations

### Activity Tracking
- **Activity Feed**: Recent actions across the organization
- **User Activity Reports**: Track individual user contributions
- **Change History**: Detailed logs of all modifications
- **Export Capabilities**: Download reports as CSV

### Dashboard
- **Key Metrics Overview**: Quick view of important numbers
- **Visual Charts**: Graphical representation of inventory data
- **Customizable Widgets**: Configure dashboard to show relevant info
- **Real-Time Updates**: Live data refresh

---

## 7. User Interface & Experience

### Design System
- **FlyonUI Components**: Consistent, accessible UI blocks
- **Tailwind CSS v4**: Modern utility-first styling
- **Theme Tokens**: Semantic colors (nook-*, neutral-*, red-*)
- **Responsive Design**: Mobile-first approach

### Mobile Experience
- **Touch-Optimized**: Large tap targets, swipe gestures
- **Offline-First Architecture**: Queue changes when offline, sync when connected
- **Dexie/IndexedDB Storage**: Local database for offline item cache
- **Sync Queue**: Pending operations stored and synced when online
- **Online Status Detection**: Real-time connection monitoring
- **Camera Integration**: Scan barcodes/QR codes with device camera
- **Batch Scanning Mode**: Scan multiple items in a session
- **Mobile Stock Counting**: Dedicated mobile counting interface
- **Responsive Layouts**: Adapts to any screen size

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG-compliant color choices

### UX Patterns
- **Quick Actions**: One-tap quantity adjustments (+1/-1)
- **Bulk Operations**: Select multiple items for batch actions
- **Search-First Navigation**: Global search with filters
- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Undo System**: Recoverable actions with undo capability

---

## 8. Security & Access Control

### Authentication
- **Supabase Auth**: Secure authentication flow
- **Email/Password Login**: Traditional credentials
- **Magic Links**: Passwordless login option
- **Session Management**: Secure session handling
- **Profile Creation Trigger**: Auto-create profile on signup

### Authorization
- **Role-Based Access Control**: Owner, Admin, Editor, Viewer, Member roles
- **Granular Permissions**: Fine-grained access control per role
- **Location-Scoped Access**: Restrict users to specific warehouses
- **Action-Level Permissions**: Control who can edit, delete, etc.
- **Team Member Management**: View and manage team with role badges

### Multi-Tenant Security (Critical Hardening)
- **Tenant Hopping Prevention**: Fixed RLS UPDATE policies to block tenant_id changes
- **Cross-Tenant Access Blocks**: Views and functions scoped to current tenant
- **Tenant ID Immutability**: Database triggers prevent tenant_id modification
- **Child-Table FK Validation**: RLS validates foreign keys belong to same tenant
- **Edge Function Authentication**: CRON_SECRET validation for scheduled functions
- **Activity Log Archive Protection**: RLS on archive tables

### Quota Enforcement
- **Database-Level Triggers**: Enforce max_items and max_users limits
- **Application-Level Validation**: Check before creation operations
- **Usage Warnings**: Banner at 80% usage on dashboard
- **Grandfather Strategy**: Existing over-limit tenants protected

### Data Protection
- **Row-Level Security**: Database-enforced access control on 19+ tables
- **XSS Prevention**: Content escaping and sanitization
- **SQL Injection Prevention**: Parameterized queries
- **CSRF Protection**: Secure form submissions
- **Service Role Isolation**: Admin operations separated from client code

---

## 9. Integration & API

### Data Import/Export
- **CSV Import**: Bulk data upload
- **CSV Export**: Download inventory data
- **Batch Operations**: Efficient bulk processing
- **Data Validation**: Verify import data before processing

### External Integrations
- **Webhook Support**: Notify external systems on events
- **RESTful API**: Standard API endpoints
- **Supabase Realtime**: Live data subscriptions
- **Storage Integration**: File uploads via Supabase Storage

### Developer Experience
- **TypeScript Types**: Full type safety
- **Generated Types**: Auto-generated from database schema
- **API Documentation**: Clear endpoint documentation
- **MCP Tools**: Supabase and FlyonUI MCP integration

---

## 10. Technical Architecture

### Frontend Stack
- **Next.js 16**: App Router with Server Components
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety
- **Tailwind CSS v4**: Utility-first styling
- **FlyonUI Components**: Consistent, accessible UI library

### Backend Stack
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Robust relational database with pgvector
- **Edge Functions**: Serverless compute (Deno runtime)
- **Realtime**: Live data subscriptions
- **Storage**: File uploads with Supabase Storage

### AI Features
- **Semantic Search**: Vector embeddings with pgvector for intelligent item search
- **AI-Suggested Transfers**: Intelligent stock transfer recommendations with reasoning
- **Google Generative AI**: Gemini integration for AI capabilities
- **AI Chat API**: Chat endpoint at `/api/ai/chat`
- **AI Insights API**: Insights endpoint at `/api/ai/insights`

### Offline-First Architecture
- **Dexie (IndexedDB)**: Local database for offline item cache
- **Sync Store (Zustand)**: State management for sync operations
- **Sync Queue**: Pending operations stored and synced when online
- **Online Status Hook**: Real-time connection monitoring
- **Incremental Updates**: Efficient cache updates

### Performance
- **Server Components**: Reduced client bundle size
- **Optimistic Updates**: Instant UI feedback
- **Connection Pooling**: Supavisor/PgBouncer ready
- **Indexed Queries**: Fast database lookups with tenant_id indexes
- **Keyset Pagination**: Efficient large dataset handling
- **Full-Text Search**: tsvector indexing for fast text search

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Unit and integration testing
- **Playwright**: End-to-end testing
- **React Testing Library**: Component testing
- **293+ Automated Tests**: Comprehensive test coverage

### DevOps
- **Environment Management**: .env.local configuration
- **Migration System**: 47+ version-controlled schema changes
- **Type Generation**: Auto-generated TypeScript types from schema
- **GitHub Actions**: CI/CD pipelines including daily reminder processing
- **Health Check Endpoint**: `/api/health` for monitoring

---

## Summary of Benefits

| Category | Key Benefits |
|----------|-------------|
| **Efficiency** | Streamlined workflows, quick actions, bulk operations, Tasks Hub |
| **Accuracy** | Audit trails, real-time tracking, validation, variance tracking |
| **Traceability** | Lot/batch tracking, serial numbers, FEFO, display IDs |
| **Security** | Multi-tenant isolation, RLS hardening, role-based access, quota enforcement |
| **Collaboration** | Chatter system, @mentions, notifications, team assignments |
| **Scalability** | Pool model architecture, indexed queries, 47+ migrations |
| **Usability** | Mobile-first, offline-first, accessible, intuitive UI |
| **Intelligence** | AI semantic search, suggested transfers, smart label generation |
| **Reliability** | 293+ tests, TypeScript, database constraints, Playwright E2E |
| **Flexibility** | Custom fields, multi-location, 19 label sizes, multiple barcode formats |

---

*Document updated: 2026-01-03*
*Based on comprehensive codebase analysis of Nook (Pickle-Master)*
