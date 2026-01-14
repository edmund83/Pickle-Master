# Tasks Workflow Audit - Implementation Checklist

Based on the audit in `Audittask.md`, here's a prioritized checklist for remediation.

---

## Phase 1: Security & Data Integrity (Critical) ✅ COMPLETED

### Tenant Isolation & Authorization ✅
- [x] Add explicit `tenant_id` checks in all server actions before update/delete:
  - [x] `app/actions/purchase-orders.ts` - `updatePurchaseOrder`, `deletePurchaseOrder`
  - [x] `app/actions/pick-lists.ts` - `updatePickList`, `deletePickList`
  - [x] `app/actions/checkouts.ts` - checkout mutations
  - [x] `app/actions/receives.ts` - receive mutations
- [x] Add role-based permission checks for destructive actions (delete, cancel, status changes)
- [x] Verify all fetchers include `tenant_id` filter (not just `id`):
  - [x] `getPurchaseOrderWithDetails`
  - [x] `getPurchaseOrder`
  - [ ] Move page queries (requires separate page-level fixes)
- [ ] Audit and harden RLS policies as defense-in-depth backup

### Input Validation ✅
- [x] Add Zod schemas for all server action inputs:
  - [x] PO fields (dates, quantities, addresses)
  - [x] Receive fields (expected/received dates, quantities)
  - [x] Vendor creation (email, phone validation)
  - [x] Checkout operations (quantity bounds, assignee names)
- [x] Add server-side length limits for free-text fields (notes, addresses)
- [ ] Clamp quantities to prevent over-receipt (received ≤ ordered) - handled by RPC
- [ ] Validate serial counts match item quantities before completion - handled by RPC

### Concurrency & Race Conditions
- [ ] Add row-level locking or version checks for inventory updates (moves, checkouts)
- [ ] Implement optimistic locking pattern for concurrent edits
- [ ] Add transaction wrappers around multi-table operations

### Implementation Notes (Phase 1)
**Created:** `lib/auth/server-auth.ts` - Centralized auth/validation utilities
- `getAuthContext()` - Get authenticated user's tenant and role
- `requireWritePermission()` / `requireAdminPermission()` - Role checks
- `verifyTenantOwnership()` - Verify records belong to user's tenant
- `verifyRelatedTenantOwnership()` - Verify related records (vendors, items, locations)
- `validateInput()` - Zod schema validation wrapper
- Common Zod schemas for UUIDs, quantities, dates, strings

---

## Phase 2: Audit Trail & Workflow Integrity (High Priority)

### Activity Logging
- [ ] Emit activity logs for all state changes:
  - [ ] PO created/updated/deleted/status changed
  - [ ] Vendor created/updated
  - [ ] Receive created/updated/completed
  - [ ] Move operations
  - [ ] Pick list status changes
  - [ ] Stock count adjustments
- [ ] Include actor, timestamp, old value, new value in logs

### Workflow Enforcement
- [ ] Block PO status changes without required vendor/items
- [ ] Block receive completion when serial counts ≠ quantities
- [ ] Block receive quantities exceeding PO remaining balance
- [ ] Add immutability constraints for locked fields (e.g., PO display_id)
- [ ] Enforce status state machine (prevent status regressions)

### Database Improvements
- [ ] Add ledger/adjustment records for inventory movements:
  - [ ] Moves
  - [ ] Checkouts
  - [ ] Receives
- [ ] Add unique constraints for vendor names (tenant-scoped)
- [ ] Add unique constraints for order numbers (tenant-scoped)
- [ ] Verify composite indexes exist: `(tenant_id, updated_at desc)`, etc.
- [ ] Add database triggers to lock immutable fields

---

## Phase 3: Performance (High Priority)

### Pagination & Server-Side Data
- [ ] Add server-side pagination to list pages:
  - [ ] Purchase Orders list
  - [ ] Receives list
  - [ ] Pick Lists list
  - [ ] Stock Counts list
- [ ] Move sorting from client to SQL queries
- [ ] Add URL-synced filters (status, vendor, date range, assigned-to)

### Query Optimization
- [ ] Consolidate redundant queries in PO detail (merge creator name fetch)
- [ ] Replace blur-based autosave with debounced explicit save
- [ ] Refactor moves page to use server-rendered paginated data
- [ ] Remove client-side Supabase queries for full inventory/folder trees

### Image & Asset Handling
- [ ] Add skeleton loaders for item thumbnails
- [ ] Implement lazy loading for images
- [ ] Add size constraints to prevent layout shift

---

## Phase 4: UI/UX Improvements (Medium Priority)

### Navigation & Discovery
- [ ] Add "Recent Drafts" strip to `/tasks` landing page
- [ ] Add "Assigned to Me" strip to category pages
- [ ] Add quick actions to task cards (resume, view details)
- [ ] Add global search for tasks (POs, receives, pick lists)

### Filters & Tables
- [ ] Add filter bar to all list pages:
  - [ ] Status filter
  - [ ] Vendor filter
  - [ ] Date range filter
  - [ ] Assigned-to filter
- [ ] Make tables responsive for mobile (hide columns, card view)
- [ ] Increase tap targets for mobile

### Forms & Feedback
- [ ] Replace blur autosave with explicit "Save"/"Save & Continue" buttons
- [ ] Add inline validation messages (not just console logs)
- [ ] Surface errors via toast notifications
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add loading spinners/skeletons to detail pages
- [ ] Replace `alert()` with inline toasts for barcode scanning

### Accessibility
- [ ] Add focus indicators to clickable table rows
- [ ] Add `aria-label` to icon buttons in cards
- [ ] Add keyboard handling to dropdowns
- [ ] Announce mode changes in serial entry modals

---

## Phase 5: Small Business Features (Medium Priority)

### Guided Workflows
- [ ] Create PO-to-receive wizard flow
- [ ] Add "Convert receive to stock adjustment" option
- [ ] Add stock count checklist/steps UI
- [ ] Add clear "next steps" guidance in workflows

### Approvals & Notifications
- [ ] Add manager approval states for POs
- [ ] Add approval states for stock adjustments
- [ ] Add "Assigned to Me" filter views
- [ ] Implement notification hooks:
  - [ ] PO submitted/confirmed
  - [ ] Receive completed
  - [ ] Pick list assigned
- [ ] Add email/push notification preferences

### Cost Tracking
- [ ] Add freight/duties fields to receives
- [ ] Add vendor invoice tracking
- [ ] Surface landed cost calculations

### Mobile & Offline
- [ ] Add mobile-friendly controls for moves/receiving/pick lists
- [ ] Add offline status indicators
- [ ] Implement offline queue for mutations
- [ ] Replace alerts with inline chips/toasts for scanner UX

### Error Recovery
- [ ] Add undo/rollback for destructive actions
- [ ] Add discrepancy reports for stock counts
- [ ] Add export option for audit sign-off

---

## Phase 6: Polish & Consistency (Low Priority)

### Display Consistency
- [ ] Enforce display IDs everywhere (replace UUID slices in receives list)
- [ ] Standardize date formatting across pages
- [ ] Standardize empty state messaging

### Underused Features
- [ ] Surface payment terms from vendor in PO/receive totals
- [ ] Calculate due dates from payment terms
- [ ] Integrate Chatter component into workflows (approval threads, mentions)

---

## Verification Steps

After each phase:
- [ ] Run Supabase security advisors to check RLS policies
- [ ] Test with multiple tenant accounts to verify isolation
- [ ] Load test with realistic data volumes
- [ ] Test on mobile devices (especially scanner flows)
- [ ] Review activity logs for completeness

---

## Files to Modify

### Server Actions
- `app/actions/purchase-orders.ts`
- `app/actions/receives.ts`
- `app/actions/pick-lists.ts`
- `app/actions/checkouts.ts`

### Page Components
- `app/(dashboard)/tasks/page.tsx`
- `app/(dashboard)/tasks/purchase-orders/page.tsx`
- `app/(dashboard)/tasks/purchase-orders/[id]/PurchaseOrderDetailClient.tsx`
- `app/(dashboard)/tasks/receives/page.tsx`
- `app/(dashboard)/tasks/receives/[id]/ReceiveDetailClient.tsx`
- `app/(dashboard)/tasks/pick-lists/page.tsx`
- `app/(dashboard)/tasks/stock-count/page.tsx`
- `app/(dashboard)/tasks/moves/page.tsx`

### Shared Components
- `components/workflows/StockCountClient.tsx`
- Add new: `components/ui/data-table-filters.tsx`
- Add new: `components/ui/pagination.tsx` (if not exists)

### Database
- New migration: Add activity log triggers
- New migration: Add unique constraints
- New migration: Add movement/adjustment ledger table
- New migration: Verify/add composite indexes
