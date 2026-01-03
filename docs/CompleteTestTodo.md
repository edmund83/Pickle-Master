# Complete Testing Checklist - Nook Inventory Management SaaS

> **Purpose**: Production-grade testing checklist for multi-tenant SaaS platform
> **Last Updated**: 2026-01-03
> **Status**: Pre-Production Audit
> **Target Scale**: 10,000+ tenants with minimal resource usage

---

## Scalability Requirements

> **CRITICAL**: This system must be optimized for **10,000+ concurrent tenants** while maintaining:
> - **Speed**: Sub-200ms API responses under load
> - **Indexing**: Every RLS filter column indexed
> - **Resource Efficiency**: Minimal CPU/memory per request
> - **Connection Pooling**: Supavisor/PgBouncer configured
> - **Query Optimization**: No full table scans, no N+1 queries

### Scale-Ready Checklist
- [ ] All `tenant_id` columns have B-tree indexes
- [ ] Composite indexes on frequently filtered columns (`tenant_id, created_at`)
- [ ] Partial indexes for active records (`WHERE deleted_at IS NULL`)
- [ ] GIN indexes for array/JSONB searches (tags, custom_fields)
- [ ] Connection pooling configured (min 10, max 100 connections)
- [ ] Query plans validated with `EXPLAIN ANALYZE` for 10k tenant data
- [ ] RLS policies use `(SELECT auth.uid())` caching pattern
- [ ] No `SELECT *` queries - only fetch needed columns
- [ ] Pagination uses keyset (cursor) not OFFSET
- [ ] Activity logs partitioned by month or tenant group
- [ ] Bulk operations batched (max 100 items per transaction)
- [ ] Cache reference data (tags, locations, custom fields) client-side
- [ ] Rate limiting per tenant (not just per IP)

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Multi-Tenancy & Data Isolation](#2-multi-tenancy--data-isolation)
3. [Security Testing](#3-security-testing)
4. [Database & RLS Policies](#4-database--rls-policies)
5. [API Security & Rate Limiting](#5-api-security--rate-limiting)
6. [Core Inventory Features](#6-core-inventory-features)
7. [Workflow Features](#7-workflow-features)
8. [UI/UX Testing](#8-uiux-testing)
9. [Forms & Validation](#9-forms--validation)
10. [Performance Testing](#10-performance-testing)
11. [Mobile & Responsive Testing](#11-mobile--responsive-testing)
12. [Offline Functionality](#12-offline-functionality)
13. [Integrations](#13-integrations)
14. [Settings & Configuration](#14-settings--configuration)
15. [Reports & Analytics](#15-reports--analytics)
16. [Notifications & Reminders](#16-notifications--reminders)
17. [Error Handling & Edge Cases](#17-error-handling--edge-cases)
18. [Accessibility (WCAG)](#18-accessibility-wcag)
19. [Browser & Device Compatibility](#19-browser--device-compatibility)
20. [Data Integrity & Consistency](#20-data-integrity--consistency)
21. [Scalability & Load Testing](#21-scalability--load-testing)

---

## 1. Authentication & Authorization

### 1.1 Login Flow
- [ ] Email/password login works correctly
- [ ] Google OAuth login works correctly
- [ ] Apple OAuth login works correctly
- [ ] Invalid credentials show appropriate error message
- [ ] Rate limiting on failed login attempts (Supabase Auth limits)
- [ ] Password field hides input
- [ ] "Remember me" functionality (session persistence)
- [ ] Redirect to intended page after login
- [ ] Session cookie is HttpOnly and Secure
- [ ] Session expires appropriately after inactivity

### 1.2 Signup Flow
- [ ] Email/password signup creates account
- [ ] Plan selection (Starter/Team/Business) works
- [ ] 14-day trial is correctly set (`trial_ends_at`)
- [ ] Tenant is created with correct `subscription_tier`
- [ ] Profile is created and linked to tenant
- [ ] Welcome email is sent (if configured)
- [ ] Duplicate email rejection with clear error
- [ ] Password strength validation
- [ ] Email verification flow (if enabled)
- [ ] OAuth signup creates tenant + profile correctly

### 1.3 Password Reset
- [ ] "Forgot password" sends reset email
- [ ] Reset link expires after appropriate time
- [ ] Reset link can only be used once
- [ ] New password must meet strength requirements
- [ ] User can login with new password
- [ ] Old password no longer works

### 1.4 Session Management
- [ ] Session refresh token rotation works
- [ ] Logout clears all session data
- [ ] Multiple device sessions handled correctly
- [ ] Session invalidation on password change
- [ ] `/auth/callback` handles OAuth redirects properly

### 1.5 Role-Based Access Control (RBAC)
- [ ] **Owner** can access all features
- [ ] **Owner** can manage billing
- [ ] **Owner** can add/remove team members
- [ ] **Admin** can modify items and settings
- [ ] **Admin** cannot access billing (unless also owner)
- [ ] **Editor** can create/edit items
- [ ] **Editor** cannot delete items (if restricted)
- [ ] **Member/Viewer** has read-only access
- [ ] Role changes take effect immediately
- [ ] User cannot escalate their own role

---

## 2. Multi-Tenancy & Data Isolation

### 2.1 Tenant Isolation (CRITICAL)
- [ ] User A cannot see User B's items (different tenants)
- [ ] User A cannot see User B's folders
- [ ] User A cannot see User B's tags
- [ ] User A cannot see User B's locations
- [ ] User A cannot see User B's vendors
- [ ] User A cannot see User B's team members
- [ ] User A cannot see User B's activity logs
- [ ] User A cannot see User B's checkouts
- [ ] User A cannot see User B's purchase orders
- [ ] User A cannot see User B's reminders
- [ ] API requests with manipulated tenant_id are rejected
- [ ] Direct database queries respect RLS

### 2.2 Cross-Tenant Attack Vectors
- [ ] Cannot access items by guessing UUID
- [ ] Cannot access folders by guessing UUID
- [ ] Cannot join another tenant by invitation tampering
- [ ] Cannot modify another tenant's settings via API
- [ ] Cannot view another tenant's subscription details
- [ ] Stripe customer_id is isolated per tenant
- [ ] Activity logs cannot leak cross-tenant data

### 2.3 Tenant Settings
- [ ] Each tenant has independent settings
- [ ] Settings changes don't affect other tenants
- [ ] Custom fields are tenant-scoped
- [ ] Feature toggles are tenant-scoped
- [ ] Theme/preferences are user-scoped within tenant

### 2.4 Scale Testing - Tenant Isolation at 10k Tenants
- [ ] RLS performance unchanged with 10,000 tenant rows
- [ ] No tenant data leakage under high concurrency
- [ ] Index-only scans for tenant filtering confirmed

---

## 3. Security Testing

### 3.1 Injection Attacks
- [ ] **SQL Injection**: All queries use parameterized statements
  - Test: `'; DROP TABLE inventory_items; --` in search
  - Test: `1 OR 1=1` in numeric fields
- [ ] **XSS (Cross-Site Scripting)**:
  - Test: `<script>alert('xss')</script>` in item names
  - Test: `<img src=x onerror=alert('xss')>` in notes
  - Test: JavaScript in custom field values
  - Test: XSS in tag names
  - Test: XSS in folder names
  - Test: XSS in vendor names
  - Test: XSS in chatter messages
- [ ] **Command Injection**: No shell commands executed from user input
- [ ] **LDAP Injection**: N/A (no LDAP)
- [ ] **XML Injection**: N/A (no XML parsing)

### 3.2 OWASP Top 10
- [ ] **A01: Broken Access Control** - RLS enforced everywhere
- [ ] **A02: Cryptographic Failures** - HTTPS only, secure cookies
- [ ] **A03: Injection** - Parameterized queries
- [ ] **A04: Insecure Design** - Security by design review
- [ ] **A05: Security Misconfiguration** - Secure headers present
- [ ] **A06: Vulnerable Components** - Dependencies audited (`npm audit`)
- [ ] **A07: Auth Failures** - Rate limiting, secure sessions
- [ ] **A08: Data Integrity** - Input validation, signed tokens
- [ ] **A09: Logging Failures** - Activity logs comprehensive
- [ ] **A10: SSRF** - No user-controlled URLs fetched server-side

### 3.3 Security Headers
- [ ] `Content-Security-Policy` header present
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy` set appropriately
- [ ] `Strict-Transport-Security` (HSTS) enabled
- [ ] `X-XSS-Protection` header (legacy but present)
- [ ] No sensitive data in URL parameters

### 3.4 CSRF Protection
- [ ] State parameter used in OAuth flows
- [ ] Form tokens validated (Next.js built-in)
- [ ] API routes check origin header
- [ ] Cookies have `SameSite` attribute

### 3.5 Secrets Management
- [ ] No secrets in client-side code
- [ ] `.env` files not committed to git
- [ ] Service role key only used server-side
- [ ] Stripe webhook secret properly validated
- [ ] API keys not exposed in responses
- [ ] No secrets in error messages

### 3.6 File Upload Security
- [ ] Image uploads validated for file type
- [ ] File size limits enforced
- [ ] Malicious file names sanitized
- [ ] No executable files can be uploaded
- [ ] Storage bucket has proper RLS
- [ ] Direct file access requires authentication

---

## 4. Database & RLS Policies

### 4.1 RLS Policy Coverage
- [ ] `inventory_items` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `folders` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `tags` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `item_tags` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `locations` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `location_stock` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `lots` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `serial_numbers` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `checkouts` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `jobs` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `purchase_orders` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `purchase_order_items` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `receives` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `receive_items` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `pick_lists` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `pick_list_items` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `stock_counts` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `stock_count_items` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `stock_transfers` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `vendors` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `item_reminders` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `notifications` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `activity_logs` - SELECT/INSERT policies (no UPDATE/DELETE)
- [ ] `chatter_messages` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `entity_followers` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `custom_field_definitions` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `alerts` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `saved_searches` - SELECT/INSERT/UPDATE/DELETE policies
- [ ] `tenants` - Restricted UPDATE (owner/admin only)
- [ ] `profiles` - Users can only update own profile

### 4.2 RLS Performance (10k Tenant Optimization)
- [ ] `tenant_id` indexed on ALL tables (B-tree)
- [ ] `auth.uid()` wrapped in `(SELECT ...)` for query plan caching
- [ ] No per-row function calls in RLS predicates
- [ ] EXPLAIN ANALYZE shows Index Scan (not Seq Scan) with RLS
- [ ] Queries with 100k+ rows across tenants still < 50ms for single tenant
- [ ] RLS policies use simple equality checks (no subqueries)

### 4.3 Index Strategy for Scale
| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `inventory_items` | `idx_items_tenant` | B-tree | RLS filter |
| `inventory_items` | `idx_items_tenant_folder` | B-tree | Folder listing |
| `inventory_items` | `idx_items_tenant_sku` | B-tree | SKU lookup |
| `inventory_items` | `idx_items_tenant_status` | B-tree | Status filter |
| `inventory_items` | `idx_items_search` | GIN | Full-text search |
| `folders` | `idx_folders_tenant_parent` | B-tree | Tree traversal |
| `activity_logs` | `idx_logs_tenant_created` | B-tree | Recent activity |
| `activity_logs` | Partition by month | Range | Archive old data |
| `checkouts` | `idx_checkouts_tenant_status` | B-tree | Active checkouts |
| `lots` | `idx_lots_item_expiry` | B-tree | FEFO ordering |

- [ ] All indexes above verified with `\di` in psql
- [ ] Index usage confirmed with `pg_stat_user_indexes`
- [ ] No unused indexes (waste of write performance)

### 4.4 Database Functions (RPC)
- [ ] `get_user_tenant_id()` returns correct tenant
- [ ] `create_item()` enforces quota limits
- [ ] `perform_checkout()` validates item availability
- [ ] `perform_checkin()` updates serial status correctly
- [ ] `create_item_reminder()` validates tenant ownership
- [ ] All RPC functions have `SECURITY DEFINER` where needed
- [ ] RPC functions don't bypass RLS inappropriately
- [ ] RPC functions use connection pooling efficiently

### 4.5 Data Integrity
- [ ] Foreign key constraints enforced
- [ ] `ON DELETE CASCADE` behaves correctly
- [ ] `ON DELETE RESTRICT` prevents orphans
- [ ] Unique constraints (SKU per tenant, etc.)
- [ ] Check constraints (quantity >= 0, etc.)
- [ ] Not-null constraints on required fields
- [ ] Enum types validated on insert/update

---

## 5. API Security & Rate Limiting

### 5.1 API Authentication
- [ ] All API routes require authentication
- [ ] `/api/health` is public (monitoring)
- [ ] `/api/stripe/webhook` validates Stripe signature
- [ ] Expired tokens rejected with 401
- [ ] Invalid tokens rejected with 401
- [ ] API responses don't leak internal errors

### 5.2 Rate Limiting (Per-Tenant for 10k Scale)
- [ ] Supabase Auth rate limits (login attempts)
- [ ] API rate limits **per tenant** (not just per IP)
- [ ] Rate limits stored in Redis/memory for speed
- [ ] Rate limit headers in responses (`X-RateLimit-*`)
- [ ] Graceful 429 response when rate limited
- [ ] Rate limits on expensive operations:
  - [ ] Report generation: 10/min per tenant
  - [ ] CSV export: 5/min per tenant
  - [ ] Bulk operations: 20/min per tenant
  - [ ] AI chat requests: 30/min per tenant
  - [ ] Label PDF generation: 20/min per tenant
- [ ] Fair usage across tenants (no single tenant monopolizing resources)

### 5.3 API Input Validation
- [ ] Request body size limits (1MB default)
- [ ] Query parameter validation
- [ ] UUID format validation
- [ ] Date format validation
- [ ] Number range validation
- [ ] String length limits
- [ ] Array size limits (bulk operations max 100)
- [ ] Reject unexpected fields (strict parsing)

### 5.4 API Response Security
- [ ] No stack traces in production errors
- [ ] No database error details exposed
- [ ] Sensitive fields filtered from responses
- [ ] Consistent error response format
- [ ] CORS configured correctly

### 5.5 Webhook Security
- [ ] Stripe webhook signature verified
- [ ] Webhook idempotency (handle duplicates)
- [ ] Webhook replay protection
- [ ] Service role used only for webhooks
- [ ] Webhook failures logged

---

## 6. Core Inventory Features

### 6.1 Items CRUD
- [ ] Create item with all fields
- [ ] Create item with minimum required fields
- [ ] Edit item - all fields update correctly
- [ ] Delete item - soft delete or hard delete?
- [ ] Delete item - associated data cleaned up
- [ ] Duplicate item creates copy
- [ ] Archive/unarchive item
- [ ] Item display ID generated correctly (e.g., ITM-ACM01-00001)
- [ ] SKU uniqueness enforced per tenant
- [ ] Item photos upload and display correctly
- [ ] Item custom fields save and display

### 6.2 Quantity Management
- [ ] Quantity +1/-1 buttons work
- [ ] Quantity cannot go negative (unless allowed)
- [ ] Bulk quantity adjustment
- [ ] Quantity change logged in activity
- [ ] Low stock status updates automatically
- [ ] Out of stock status updates automatically
- [ ] Min quantity alerts trigger correctly

### 6.3 Folder Hierarchy
- [ ] Create root folder
- [ ] Create nested folder (child)
- [ ] Move folder (change parent)
- [ ] Delete empty folder
- [ ] Delete folder with items (behavior?)
- [ ] Folder path updated on move
- [ ] Folder depth calculated correctly
- [ ] Folder color and icon save
- [ ] Folder sort order works
- [ ] Breadcrumb navigation correct

### 6.4 Tags
- [ ] Create tag with color
- [ ] Assign tag to item
- [ ] Remove tag from item
- [ ] Bulk assign tags
- [ ] Delete tag - removed from items
- [ ] Search by tag works
- [ ] Tag autocomplete in forms

### 6.5 Locations (Multi-Location)
- [ ] Create location with type (warehouse, van, store, job_site)
- [ ] Assign item to location
- [ ] Location stock tracking per location
- [ ] Transfer between locations
- [ ] Location-specific min stock thresholds
- [ ] View stock by location
- [ ] Delete location - handle existing stock

### 6.6 Lot Tracking
- [ ] Create lot with lot number
- [ ] Lot expiry date tracking
- [ ] FIFO indicator displays correctly
- [ ] FEFO indicator displays correctly
- [ ] Adjust lot quantity
- [ ] Lot status (active, expired, depleted)
- [ ] Consume from oldest lot first
- [ ] Lot number unique per item

### 6.7 Serial Number Tracking
- [ ] Add serial numbers to item
- [ ] Serial number unique per tenant
- [ ] Serial status (available, checked_out, sold, damaged)
- [ ] Checkout updates serial status
- [ ] Check-in updates serial status
- [ ] Delete serial number
- [ ] Serial number history/audit

### 6.8 Search & Filtering
- [ ] Global search finds items by name
- [ ] Search by SKU
- [ ] Search by display ID
- [ ] Search by tag
- [ ] Search by folder/location
- [ ] Filter by stock status (in stock, low, out)
- [ ] Filter by date range
- [ ] Saved searches work
- [ ] Search debounced (300ms)
- [ ] Search results paginated (keyset pagination)

---

## 7. Workflow Features

### 7.1 Check-In/Check-Out
- [ ] Check out item to person
- [ ] Check out item to job
- [ ] Check out item to location
- [ ] Due date tracking
- [ ] Overdue status updates correctly
- [ ] Check-in with condition assessment
- [ ] Check-in with damage notes
- [ ] Serial number checkout (individual tracking)
- [ ] Checkout history displays correctly
- [ ] Cannot checkout already checked-out item
- [ ] Email notification on checkout/overdue

### 7.2 Purchase Orders
- [ ] Create PO with vendor
- [ ] Add line items to PO
- [ ] PO display ID generated (PO-ACM01-00001)
- [ ] PO status workflow (draft -> sent -> received)
- [ ] PO totals calculated correctly (subtotal, tax, shipping, total)
- [ ] Edit PO line items
- [ ] Delete PO (with restrictions)
- [ ] Duplicate PO
- [ ] PO linked to receives

### 7.3 Receives (GRN)
- [ ] Create receive from PO
- [ ] Create standalone receive
- [ ] Receive line items with quantities
- [ ] Partial receive support
- [ ] Lot creation during receive
- [ ] Serial number entry during receive
- [ ] Receive display ID generated
- [ ] Receive updates inventory quantities
- [ ] Receive logged in activity

### 7.4 Pick Lists
- [ ] Create pick list
- [ ] Add items to pick list
- [ ] Assign picker to pick list
- [ ] Pick progress tracking
- [ ] Mark items as picked
- [ ] Complete pick list
- [ ] Pick list display ID generated
- [ ] Cannot pick more than available

### 7.5 Stock Counts
- [ ] Create full stock count
- [ ] Create folder-scoped count
- [ ] Create custom item selection count
- [ ] Assign counters to items
- [ ] Count items (enter counted quantity)
- [ ] Variance calculation (expected vs counted)
- [ ] Complete stock count
- [ ] Apply adjustments to inventory
- [ ] Stock count progress indicator
- [ ] Offline counting support

### 7.6 Transfers
- [ ] Create transfer between locations
- [ ] Transfer status (pending, in_transit, completed)
- [ ] Transfer quantity validation
- [ ] Transfer logged in activity
- [ ] Transfer updates location_stock

---

## 8. UI/UX Testing

### 8.1 Navigation
- [ ] Primary sidebar expands/collapses
- [ ] Primary sidebar persists state across sessions
- [ ] Secondary sidebar context-appropriate
- [ ] Breadcrumbs show correct path
- [ ] Back button behavior correct
- [ ] Mobile bottom navigation works
- [ ] Mobile hamburger menu works
- [ ] Active nav item highlighted
- [ ] Submenus expand/collapse

### 8.2 Visual Consistency
- [ ] Consistent button styles throughout
- [ ] Consistent card styles
- [ ] Consistent form input styles
- [ ] Consistent spacing (8px grid)
- [ ] Theme colors applied correctly
- [ ] Dark mode works (if implemented)
- [ ] No broken images/icons
- [ ] Loading states consistent
- [ ] Empty states designed

### 8.3 Interaction Feedback
- [ ] Button click feedback (visual)
- [ ] Form submission loading state
- [ ] Success toast on save
- [ ] Error toast on failure
- [ ] Undo toast for destructive actions
- [ ] Haptic feedback on mobile (if enabled)
- [ ] Sound feedback on mobile (if enabled)
- [ ] Optimistic UI updates

### 8.4 Modals & Dialogs
- [ ] Modals close on backdrop click
- [ ] Modals close on Escape key
- [ ] Focus trapped in modal
- [ ] Modal scrolls if content exceeds viewport
- [ ] Confirmation dialogs for destructive actions
- [ ] Modal transitions smooth

### 8.5 Tables & Lists
- [ ] Table sorting works
- [ ] Table pagination works (keyset, not offset)
- [ ] Table row selection (multi-select)
- [ ] Bulk actions on selected rows
- [ ] Inline editing saves correctly
- [ ] Empty table state
- [ ] Loading skeleton for tables
- [ ] Horizontal scroll for wide tables on mobile

### 8.6 Charts & Visualizations
- [ ] Inventory summary chart renders
- [ ] Inventory value chart renders
- [ ] Charts handle zero data gracefully
- [ ] Charts responsive on resize
- [ ] Chart tooltips work
- [ ] Chart legends clickable (filter)

---

## 9. Forms & Validation

### 9.1 Item Form
- [ ] Name required, validated
- [ ] SKU optional, unique per tenant
- [ ] Quantity non-negative
- [ ] Min quantity non-negative
- [ ] Max quantity >= min quantity (if set)
- [ ] Price non-negative
- [ ] Cost price non-negative
- [ ] Photo upload works
- [ ] Custom fields render correctly
- [ ] Custom field validation (by type)
- [ ] Form preserves data on validation error
- [ ] Form resets after successful submit

### 9.2 Folder Form
- [ ] Name required
- [ ] Parent folder selection works
- [ ] Color picker works
- [ ] Icon selection works
- [ ] Cannot set folder as its own parent

### 9.3 Location Form
- [ ] Name required
- [ ] Type required (enum validation)
- [ ] Address fields optional

### 9.4 Vendor Form
- [ ] Name required
- [ ] Email format validated
- [ ] Phone format validated (flexible)
- [ ] Website URL validated

### 9.5 Checkout Form
- [ ] Assignee required (person/job/location)
- [ ] Due date in future (or allow past?)
- [ ] Notes optional
- [ ] Serial selection for tracked items

### 9.6 Reminder Form
- [ ] Type required (low_stock, expiry, restock)
- [ ] Threshold validation based on type
- [ ] Recurrence settings work
- [ ] Email notification toggle

### 9.7 Team Member Form
- [ ] Email required, valid format
- [ ] Role required
- [ ] Cannot invite existing member
- [ ] Cannot invite self

### 9.8 General Form UX
- [ ] Tab order logical
- [ ] Enter key submits form (where appropriate)
- [ ] Required fields marked with asterisk
- [ ] Error messages display near field
- [ ] Error messages clear and actionable
- [ ] Form state preserved on navigation (confirm dialog)

---

## 10. Performance Testing

### 10.1 Page Load Performance
- [ ] Dashboard loads < 2s (LCP)
- [ ] Inventory list loads < 2s
- [ ] Item detail loads < 1s
- [ ] Settings pages load < 1s
- [ ] Reports load < 3s (data-heavy)
- [ ] No layout shift (CLS < 0.1)
- [ ] First Input Delay < 100ms

### 10.2 Database Query Performance
- [ ] Inventory list with 10k items < 200ms
- [ ] Search across 10k items < 200ms
- [ ] Dashboard aggregations < 500ms
- [ ] Activity log queries < 200ms
- [ ] Report queries < 2s
- [ ] All queries use indexes (no seq scans)
- [ ] `EXPLAIN ANALYZE` for all major queries documented

### 10.3 Large Data Handling
- [ ] 10,000 items renders without lag
- [ ] 1,000 folders renders without lag
- [ ] 100 tags renders without lag
- [ ] 50 locations renders without lag
- [ ] Virtual scrolling for large lists
- [ ] Keyset pagination for tables

### 10.4 API Response Times
- [ ] GET requests < 100ms (p95)
- [ ] POST/PUT requests < 200ms (p95)
- [ ] Bulk operations < 1s
- [ ] File uploads < 5s (depending on size)
- [ ] AI chat response < 5s

### 10.5 Client-Side Performance
- [ ] Bundle size < 300KB (gzipped, initial)
- [ ] Code splitting for routes
- [ ] No memory leaks on navigation
- [ ] Smooth scrolling (60fps)
- [ ] No jank on animations
- [ ] Service worker doesn't block main thread

### 10.6 Caching
- [ ] Reference data cached (tags, locations, custom fields)
- [ ] Cache invalidation on data change
- [ ] LocalStorage not exceeding limits
- [ ] IndexedDB for offline data
- [ ] HTTP cache headers for static assets

---

## 11. Mobile & Responsive Testing

### 11.1 Responsive Breakpoints
- [ ] Mobile portrait (320px - 480px)
- [ ] Mobile landscape (480px - 768px)
- [ ] Tablet portrait (768px - 1024px)
- [ ] Tablet landscape (1024px - 1280px)
- [ ] Desktop (1280px+)
- [ ] Large desktop (1920px+)

### 11.2 Mobile-Specific UI
- [ ] Bottom navigation visible and functional
- [ ] Floating action button positioned correctly
- [ ] Touch targets >= 44px (ideally 64px)
- [ ] No horizontal scroll on mobile
- [ ] Modals fit screen (no overflow)
- [ ] Forms scrollable when keyboard open
- [ ] Pull-to-refresh (if implemented)

### 11.3 Mobile Gestures
- [ ] Swipe to reveal actions (if implemented)
- [ ] Pinch to zoom on images
- [ ] Long press context menu (if implemented)

### 11.4 Mobile Input
- [ ] Numeric keyboard for quantity fields
- [ ] Email keyboard for email fields
- [ ] Phone keyboard for phone fields
- [ ] Date picker native or custom works
- [ ] Autocomplete works on mobile

### 11.5 Mobile Views
- [ ] Inventory mobile view (card layout)
- [ ] Dashboard mobile layout
- [ ] Item detail mobile layout
- [ ] Settings mobile layout
- [ ] Reports mobile layout

---

## 12. Offline Functionality

### 12.1 Offline Detection
- [ ] Online status indicator shows correctly
- [ ] Sync status indicator shows pending/synced
- [ ] Toast notification on offline/online transition

### 12.2 Offline Queue
- [ ] Quantity adjustments queued offline
- [ ] Item creation queued offline (if supported)
- [ ] Stock count entries queued offline
- [ ] Checkout actions queued offline
- [ ] Queue persists across page refresh
- [ ] Queue persists across app restart

### 12.3 Sync on Reconnect
- [ ] Queued actions sync automatically
- [ ] Sync order preserved (FIFO)
- [ ] Conflict resolution (last-write-wins or merge)
- [ ] Failed sync items retry
- [ ] User notified of sync failures

### 12.4 Offline Data Access
- [ ] Cached items viewable offline
- [ ] Cached folders viewable offline
- [ ] Cached tags viewable offline
- [ ] Recently accessed items prioritized
- [ ] Cache size managed (eviction policy)

---

## 13. Integrations

### 13.1 Stripe Integration
- [ ] Checkout session creates correctly
- [ ] Subscription activated on payment
- [ ] Plan upgrade works
- [ ] Plan downgrade works
- [ ] Subscription cancellation works
- [ ] Failed payment handling
- [ ] Invoice payment succeeded updates status
- [ ] Webhook idempotency (duplicate events)
- [ ] Trial-to-paid transition
- [ ] Billing portal accessible

### 13.2 Email Integration (Resend)
- [ ] Label email sends successfully
- [ ] Email content renders correctly
- [ ] Unsubscribe link works (if applicable)
- [ ] Email rate limits respected

### 13.3 AI Integration (Gemini)
- [ ] Chat endpoint responds
- [ ] Inventory context included in prompts
- [ ] Response formatted correctly
- [ ] Rate limits handled gracefully
- [ ] Error handling for API failures
- [ ] Token limits respected

### 13.4 Storage Integration (Supabase Storage)
- [ ] Image upload to storage works
- [ ] Image retrieval works
- [ ] Signed URLs generated correctly
- [ ] Storage bucket RLS enforced
- [ ] File size limits enforced
- [ ] Image compression applied

### 13.5 OAuth Providers
- [ ] Google OAuth login works
- [ ] Apple OAuth login works
- [ ] OAuth callback handles errors
- [ ] OAuth state parameter validated

---

## 14. Settings & Configuration

### 14.1 Profile Settings
- [ ] Update display name
- [ ] Update email (verification required?)
- [ ] Update password
- [ ] Update avatar/photo
- [ ] Update preferences (timezone, date format)
- [ ] Changes persist after logout/login

### 14.2 Company Settings
- [ ] Update company name
- [ ] Update company logo
- [ ] Update company address
- [ ] Organization code (read-only after set?)

### 14.3 Team Settings
- [ ] Invite new team member
- [ ] Remove team member
- [ ] Change team member role
- [ ] Pending invitations list
- [ ] Resend invitation
- [ ] Cancel invitation
- [ ] Team member limit enforced per plan

### 14.4 Custom Fields
- [ ] Create text custom field
- [ ] Create number custom field
- [ ] Create date custom field
- [ ] Create dropdown custom field
- [ ] Create checkbox custom field
- [ ] Edit custom field
- [ ] Delete custom field (handle existing data)
- [ ] Custom field limit enforced per plan
- [ ] Apply to folders option

### 14.5 Locations Settings
- [ ] Create location
- [ ] Edit location
- [ ] Delete location (handle existing stock)
- [ ] Set default location

### 14.6 Tags Settings
- [ ] Create tag with color
- [ ] Edit tag
- [ ] Delete tag (remove from items)

### 14.7 Vendors Settings
- [ ] Create vendor
- [ ] Edit vendor
- [ ] Delete vendor (handle POs)

### 14.8 Alerts Settings
- [ ] Low stock alert threshold
- [ ] Expiry alert days before
- [ ] Email notification toggle
- [ ] In-app notification toggle

### 14.9 Features Toggle
- [ ] Enable/disable lot tracking
- [ ] Enable/disable multi-location
- [ ] Enable/disable serial tracking
- [ ] Enable/disable checkouts
- [ ] Feature toggle takes effect immediately

### 14.10 Preferences
- [ ] Timezone selection
- [ ] Date format selection
- [ ] Currency selection
- [ ] Language selection (if supported)
- [ ] Theme color customization

### 14.11 Bulk Import
- [ ] CSV upload works
- [ ] Column mapping UI
- [ ] Validation errors displayed
- [ ] Preview before import
- [ ] Import progress indicator
- [ ] Partial import on errors (or rollback)
- [ ] Import logged in activity

### 14.12 Integrations Settings
- [ ] Connected integrations list
- [ ] API key display (masked)
- [ ] Regenerate API key
- [ ] Disconnect integration

### 14.13 Billing Settings
- [ ] Current plan displayed
- [ ] Usage stats (items, users, storage)
- [ ] Trial days remaining
- [ ] Upgrade button works
- [ ] Billing portal link works
- [ ] Payment method displayed
- [ ] Invoice history

---

## 15. Reports & Analytics

### 15.1 Inventory Summary Report
- [ ] Total items count correct
- [ ] In-stock count correct
- [ ] Low-stock count correct
- [ ] Out-of-stock count correct
- [ ] By-folder breakdown
- [ ] Export to CSV/PDF

### 15.2 Inventory Value Report
- [ ] Total value calculated correctly
- [ ] Value by location
- [ ] Value by folder
- [ ] Cost vs. retail value
- [ ] Export to CSV/PDF

### 15.3 Low Stock Report
- [ ] Items below min quantity listed
- [ ] Reorder suggestions
- [ ] Grouped by folder/location
- [ ] Export to CSV/PDF

### 15.4 Profit Margin Report
- [ ] Margin calculated correctly (price - cost)
- [ ] Margin percentage correct
- [ ] Filter by category/folder
- [ ] Export to CSV/PDF

### 15.5 Stock Movement Report
- [ ] All movements listed
- [ ] Filter by date range
- [ ] Filter by movement type
- [ ] Filter by user
- [ ] Export to CSV/PDF

### 15.6 Activity Logs Report
- [ ] All activity logged
- [ ] Filter by date range
- [ ] Filter by action type
- [ ] Filter by user
- [ ] Filter by entity type
- [ ] Pagination for large logs (keyset)
- [ ] Export to CSV/PDF

### 15.7 Trends & Forecasting
- [ ] Historical data charted
- [ ] Trend lines calculated
- [ ] Forecasting algorithms (if implemented)
- [ ] Date range selection

### 15.8 Expiring Items Report
- [ ] Items with expiry dates listed
- [ ] Filter by expiry window (7 days, 30 days, etc.)
- [ ] Grouped by lot
- [ ] Export to CSV/PDF

---

## 16. Notifications & Reminders

### 16.1 In-App Notifications
- [ ] Notification bell shows unread count
- [ ] Notifications list displays correctly
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Click notification navigates to relevant page
- [ ] Real-time notifications (if using Realtime)

### 16.2 Email Notifications
- [ ] Low stock email sent
- [ ] Expiry reminder email sent
- [ ] Checkout due/overdue email sent
- [ ] Team invitation email sent
- [ ] Email preferences respected
- [ ] Unsubscribe works

### 16.3 Reminders
- [ ] Low stock reminder triggers at threshold
- [ ] Expiry reminder triggers at days before
- [ ] Restock reminder triggers on schedule
- [ ] Reminder recurrence works (daily, weekly, monthly)
- [ ] Reminder can be paused/resumed
- [ ] Reminder can be deleted
- [ ] Past-due reminders highlighted

### 16.4 Chatter & Mentions
- [ ] Post message on item
- [ ] @mention team member
- [ ] Mentioned user gets notification
- [ ] Thread replies work
- [ ] Edit own message
- [ ] Delete own message

### 16.5 Following
- [ ] Follow item
- [ ] Unfollow item
- [ ] Notification on followed item change
- [ ] Notification preferences per entity

---

## 17. Error Handling & Edge Cases

### 17.1 Network Errors
- [ ] Graceful handling of timeout
- [ ] Retry button on failure
- [ ] Offline fallback (if supported)
- [ ] User-friendly error message
- [ ] No data loss on network error

### 17.2 Validation Errors
- [ ] Form validation errors displayed
- [ ] Server-side validation errors displayed
- [ ] Duplicate key errors (SKU, serial) clear
- [ ] Quota exceeded errors clear

### 17.3 Concurrent Edits
- [ ] Optimistic locking (if implemented)
- [ ] Last-write-wins behavior clear
- [ ] User notified of conflicts
- [ ] No data corruption on race conditions

### 17.4 Edge Cases - Items
- [ ] Item with 0 quantity displays correctly
- [ ] Item with null price displays correctly
- [ ] Item with very long name (500+ chars)
- [ ] Item with special characters in name
- [ ] Item with emoji in name
- [ ] Item with no photo displays placeholder
- [ ] Item with 50+ photos (if allowed)

### 17.5 Edge Cases - Folders
- [ ] Deeply nested folders (10+ levels)
- [ ] Folder with 1000+ items
- [ ] Empty folder displays correctly
- [ ] Move folder to its own child (prevent circular)

### 17.6 Edge Cases - Quantities
- [ ] Quantity at integer max
- [ ] Quantity with decimals (if allowed)
- [ ] Negative quantity adjustment below zero
- [ ] Bulk adjustment of 1000+ items

### 17.7 Edge Cases - Dates
- [ ] Expiry date in past
- [ ] Due date today
- [ ] Date across timezone boundaries
- [ ] Leap year dates

### 17.8 Session Edge Cases
- [ ] Session expires mid-form
- [ ] Multiple tabs open (session sync)
- [ ] Login from another device
- [ ] Token refresh during long operation

---

## 18. Accessibility (WCAG)

### 18.1 Perceivable
- [ ] All images have alt text
- [ ] Color not sole means of information
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Text resizable to 200% without loss
- [ ] Captions for any video content

### 18.2 Operable
- [ ] All functionality via keyboard
- [ ] No keyboard traps
- [ ] Focus visible on all interactive elements
- [ ] Skip links available
- [ ] No flashing content (>3 per second)
- [ ] Sufficient time for timed operations

### 18.3 Understandable
- [ ] Page language declared (`lang` attribute)
- [ ] Consistent navigation
- [ ] Form labels associated with inputs
- [ ] Error messages descriptive
- [ ] Required fields indicated

### 18.4 Robust
- [ ] Valid HTML
- [ ] ARIA roles used correctly
- [ ] ARIA states updated dynamically
- [ ] Works with screen readers (VoiceOver, NVDA)

### 18.5 Specific Components
- [ ] Dropdown menus keyboard accessible
- [ ] Modals announce to screen readers
- [ ] Form errors announced
- [ ] Loading states announced
- [ ] Tables have proper headers
- [ ] Charts have text alternatives

---

## 19. Browser & Device Compatibility

### 19.1 Desktop Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Brave (latest)

### 19.2 Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet
- [ ] Firefox Mobile

### 19.3 Operating Systems
- [ ] Windows 10/11
- [ ] macOS Ventura/Sonoma/Sequoia
- [ ] iOS 16/17/18
- [ ] Android 12/13/14

### 19.4 Device Types
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad)
- [ ] Phone (iPhone 14/15)
- [ ] Phone (Samsung Galaxy S23)
- [ ] Low-end Android device (performance)

### 19.5 PWA Behavior
- [ ] Add to home screen works
- [ ] Splash screen displays
- [ ] Standalone mode works
- [ ] Push notifications (if implemented)

---

## 20. Data Integrity & Consistency

### 20.1 Transactional Integrity
- [ ] Multi-step operations atomic
- [ ] Failed transactions rolled back
- [ ] No partial updates on error
- [ ] Database constraints enforced

### 20.2 Referential Integrity
- [ ] Deleting item removes from folders
- [ ] Deleting item removes tags associations
- [ ] Deleting item removes lots/serials
- [ ] Deleting item removes reminders
- [ ] Deleting folder moves items (or prevents delete)
- [ ] Deleting location handles stock
- [ ] Deleting vendor handles POs

### 20.3 Calculated Fields
- [ ] Item quantity = sum of lot quantities (if lot-tracked)
- [ ] Item quantity = sum of location quantities (if multi-location)
- [ ] Folder item count correct
- [ ] Dashboard totals accurate
- [ ] Report totals match detail

### 20.4 Activity Log Accuracy
- [ ] All CRUD operations logged
- [ ] User attribution correct
- [ ] Timestamp accurate
- [ ] Changes captured (before/after)
- [ ] IP address logged (if required)

### 20.5 Display ID Consistency
- [ ] Display IDs never change after creation
- [ ] Display IDs unique per entity type per tenant
- [ ] Display ID format consistent (e.g., ITM-ACM01-00001)
- [ ] Sequence counter increments correctly
- [ ] No gaps in sequence (or gaps acceptable?)

### 20.6 Backup & Recovery
- [ ] Database backups scheduled
- [ ] Point-in-time recovery available
- [ ] Backup restoration tested
- [ ] Data export functionality works

---

## 21. Scalability & Load Testing

> **Target**: 10,000 concurrent tenants with minimal resource usage

### 21.1 Connection Pooling
- [ ] Supavisor/PgBouncer configured
- [ ] Min connections: 10
- [ ] Max connections: 100
- [ ] Connection timeout: 10s
- [ ] Idle connection cleanup: 60s
- [ ] No connection exhaustion under load

### 21.2 Load Testing Scenarios
| Scenario | Target | Metric |
|----------|--------|--------|
| 10k concurrent tenant reads | < 100ms p95 | Response time |
| 1k concurrent writes | < 200ms p95 | Response time |
| 100 concurrent report generations | < 3s p95 | Response time |
| 10k tenants x 10k items each | No degradation | Query time |
| Burst traffic (10x normal) | Auto-scale or graceful degrade | Availability |

- [ ] Load test with k6/Artillery/Locust
- [ ] Identify bottlenecks with APM
- [ ] Document capacity limits
- [ ] Auto-scaling configured (if using Vercel/etc.)

### 21.3 Query Optimization Checklist
- [ ] No `SELECT *` - only needed columns
- [ ] No N+1 queries (use joins or batch)
- [ ] Keyset pagination (no OFFSET for large tables)
- [ ] Aggregations use indexes
- [ ] Subqueries optimized or converted to joins
- [ ] CTEs evaluated for performance

### 21.4 Resource Efficiency
- [ ] CPU usage < 50% under normal load
- [ ] Memory usage stable (no leaks)
- [ ] Database connections < 50% of pool
- [ ] Storage I/O within limits
- [ ] Network bandwidth optimized (compression)

### 21.5 Horizontal Scaling Readiness
- [ ] Stateless application servers
- [ ] Session data in database/Redis
- [ ] File uploads to object storage (not local)
- [ ] Background jobs queue-based
- [ ] Database read replicas supported

### 21.6 Monitoring & Alerting
- [ ] Response time monitoring
- [ ] Error rate monitoring
- [ ] Database connection pool monitoring
- [ ] Slow query logging (> 100ms)
- [ ] Alerts for degraded performance
- [ ] Alerts for error spikes

---

## Execution Checklist

### Pre-Testing Setup
- [ ] Test environment configured
- [ ] Test database with seed data (simulate 10k tenant scale)
- [ ] Test accounts for each role
- [ ] Test Stripe in test mode
- [ ] E2E test framework set up (Playwright)
- [ ] Accessibility testing tools (axe, WAVE)
- [ ] Performance testing tools (Lighthouse, WebPageTest)
- [ ] Security scanning tools (OWASP ZAP, npm audit)
- [ ] Load testing tools (k6, Artillery)

### Test Execution Phases

#### Phase 1: Security Audit (Priority: CRITICAL)
Focus: Sections 2, 3, 4, 5
- [ ] Complete multi-tenancy isolation tests
- [ ] Complete OWASP security tests
- [ ] Complete RLS policy audit
- [ ] Complete API security tests

#### Phase 2: Scalability Validation (Priority: CRITICAL)
Focus: Section 21
- [ ] Complete index verification
- [ ] Complete connection pooling tests
- [ ] Complete load testing
- [ ] Complete query optimization

#### Phase 3: Core Functionality (Priority: High)
Focus: Sections 1, 6, 7
- [ ] Complete auth flow tests
- [ ] Complete inventory CRUD tests
- [ ] Complete workflow tests

#### Phase 4: UI/UX & Forms (Priority: High)
Focus: Sections 8, 9
- [ ] Complete UI consistency tests
- [ ] Complete form validation tests

#### Phase 5: Performance (Priority: Medium)
Focus: Sections 10, 12
- [ ] Complete performance benchmarks
- [ ] Complete offline functionality tests

#### Phase 6: Integrations (Priority: Medium)
Focus: Sections 13, 14
- [ ] Complete Stripe integration tests
- [ ] Complete settings tests

#### Phase 7: Reporting & Notifications (Priority: Medium)
Focus: Sections 15, 16
- [ ] Complete report accuracy tests
- [ ] Complete notification tests

#### Phase 8: Edge Cases & Compatibility (Priority: Lower)
Focus: Sections 17, 18, 19, 20
- [ ] Complete edge case tests
- [ ] Complete accessibility audit
- [ ] Complete browser compatibility tests

---

## Sign-Off

| Section | Tested By | Date | Status |
|---------|-----------|------|--------|
| 1. Authentication | | | |
| 2. Multi-Tenancy | | | |
| 3. Security | | | |
| 4. Database/RLS | | | |
| 5. API Security | | | |
| 6. Core Features | | | |
| 7. Workflows | | | |
| 8. UI/UX | | | |
| 9. Forms | | | |
| 10. Performance | | | |
| 11. Mobile | | | |
| 12. Offline | | | |
| 13. Integrations | | | |
| 14. Settings | | | |
| 15. Reports | | | |
| 16. Notifications | | | |
| 17. Edge Cases | | | |
| 18. Accessibility | | | |
| 19. Compatibility | | | |
| 20. Data Integrity | | | |
| 21. Scalability | | | |

**Final Sign-Off**

- [ ] All critical issues resolved
- [ ] All high-priority issues resolved
- [ ] Medium/low issues documented in backlog
- [ ] Security audit passed
- [ ] Performance benchmarks met (10k tenant scale)
- [ ] Accessibility audit passed
- [ ] Load testing passed

**Approved for Production**: _________________ Date: _________

---

## Appendix: Performance Benchmarks

### Target Metrics for 10,000 Tenants

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| API p50 response | < 50ms | < 100ms | > 200ms |
| API p95 response | < 100ms | < 200ms | > 500ms |
| API p99 response | < 200ms | < 500ms | > 1s |
| Database query (simple) | < 10ms | < 50ms | > 100ms |
| Database query (complex) | < 100ms | < 500ms | > 1s |
| Page load (LCP) | < 1.5s | < 2.5s | > 4s |
| Time to Interactive | < 2s | < 3.5s | > 5s |
| Bundle size (gzip) | < 200KB | < 300KB | > 500KB |
| Memory per request | < 50MB | < 100MB | > 200MB |

### Resource Usage Targets

| Resource | Normal Load | Peak Load | Max Capacity |
|----------|-------------|-----------|--------------|
| Database connections | 20-30 | 50-70 | 100 |
| CPU usage | 20-30% | 50-70% | 80% |
| Memory usage | 40-50% | 60-70% | 80% |
| Storage IOPS | 500-1000 | 2000-3000 | 5000 |
