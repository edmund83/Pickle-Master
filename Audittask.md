# Tasks Workflow Audit
Scope: Reviewed `/app/(dashboard)/tasks` index plus task-specific pages and clients for purchase orders, receiving, pick lists, stock count, moves, checkouts, and related server actions under `/app/actions`. Focused on field coverage, UI/UX, security, performance, database fit, and gaps for small-business users.

## High-Priority Findings
- Weak tenant scoping on updates: server actions for purchase orders, pick lists, moves, and checkouts (`app/actions/purchase-orders.ts`, `app/actions/pick-lists.ts`, `app/actions/checkouts.ts`) update rows by `id` without re-checking `tenant_id` or ownership. Relying solely on RLS leaves no defense-in-depth and makes mistakes in policy design risky.
- Client-side data pulls for sensitive data: moves page (`app/(dashboard)/tasks/moves/page.tsx`) loads full inventory and folder trees directly in the browser via Supabase client, with no pagination or search constraints. On large catalogs this is slow; if RLS slips, data exfiltration risk rises.
- No mutation-level permission checks: detail clients toggle destructive actions (delete PO, cancel receive, delete pick list) solely on UI state. Server actions do not re-verify draft/tenant/role beyond status in a few spots, so a crafted request could delete active docs.
- Missing validation and trust in client values: PO and receive fields auto-save on blur without schema validation (e.g., expected/received dates, quantities, addresses). Serial and quantity operations do not clamp upper bounds to ordered quantities, risking over-receipt and inventory drift.
- Status and workflow integrity gaps: PO status updates do not enforce required vendor/items, approvals, or link to existing receives. Receives can be completed without checking against PO balance on the client; server RPC checks unknown from code, but UI allows mismatches and lacks blocking when serial counts differ from quantities.

## UI / UX
- Navigation lacks context: task landing pages are card grids without quick actions, search, or recent activity; users must click multiple levels to resume work. Add “recent drafts/assigned to me” strips on `/tasks` and category pages.
- Table-heavy views with no filters: Purchase Orders, Receives, Pick Lists, Stock Counts all do client-side sorting but no filtering, search, or pagination. On mobile, wide tables overflow with tiny tap targets.
- Forms are fragmented and silent: PO detail (`PurchaseOrderDetailClient`) and Receive detail (`ReceiveDetailClient`) save on blur without confirmation or error surfacing; errors log to console. Vendor creation modal lacks basic validation (email/phone), and address fields have no country/state pickers.
- Inconsistent empty/loading states: list pages show empty states but detail pages flash unstyled content while data loads (no skeletons/spinners). Barcode scan paths use `alert` instead of inline toasts, breaking flow on mobile scanners.
- Accessibility gaps: tables use clickable rows without focus indicators; buttons in cards have no `aria-label`s; dropdowns lack keyboard handling beyond default. Serial entry modals focus sometimes but bulk mode toggles without announcing.

## Security & Data Integrity
- Tenant isolation not enforced in queries: several fetchers (`getPurchaseOrderWithDetails`, `getPurchaseOrder`, `updatePurchaseOrder`, `updatePickList`, move page queries) filter only by `id`; if policies are relaxed or misconfigured, cross-tenant reads/updates are possible.
- No audit trail for key operations: checkouts insert activity logs, but PO edits, vendor edits, receive edits, and moves do not emit activity/events. Hard to trace who changed quantities or addresses.
- Client-trusted quantities: move page updates `inventory_items` in bulk without checking user role, item locks, or concurrent edits. Checkouts decrement inventory without row-level locking/version checks—race conditions can oversell.
- Input sanitization: free-text fields (notes, addresses) are sent directly to Supabase; ensure server-side length checks to prevent oversized payloads and log bloat.

## Performance
- Unpaginated lists: PO, Receive, Pick List, Stock Count queries fetch entire tenant datasets and sort client-side. This will degrade for tenants with thousands of rows and increases cold-start time.
- Redundant queries per render: PO detail fetches creator name in a second query despite vendor/profile data already loaded; receive detail triggers multiple stateful saves on blur. Consider single consolidated queries and debounced saves.
- Image handling: detail pages render `Image` components for item thumbnails without skeletons, lazy bounds, or size caps; potential layout shift and bandwidth waste.
- Client-side Supabase in moves flow: downloading all inventory/folders on mount stalls UI and burns quota. Replace with server-rendered, paginated data and server actions for moves.

## Database / Schema Observations
- Workflow tables (purchase_orders, receives, pick_lists, stock_counts) appear to have display IDs and status fields, but updates do not enforce immutability (e.g., PO display_id not guarded in code). Add database constraints or triggers to lock immutable fields and prevent status regressions without rules.
- No visible uniqueness/guard on vendor names or order numbers at the app layer; duplicates can proliferate. Consider unique tenant-scoped constraints where appropriate.
- Moves and checkouts update inventory quantities directly without ledger entries. For reconciliation, a movement/adjustment table with references would improve auditability and simplify rollbacks.
- Indexing: list views sort by `updated_at`/`created_at`/`received_date`; ensure composite indexes on `(tenant_id, updated_at desc)` etc. are present (verify migrations).

## Small-Business Fit & Feature Gaps
- Missing guided workflows: no PO-to-receive wizard, no “convert receive to stock adjustment,” and no checklist for stock counts. Small teams need fewer clicks and clear next steps.
- Assignment and notifications: list pages lack “assigned to me” filters and reminders. No email/push/webhook notifications on status changes (PO submitted/confirmed, receive completed, pick list assigned).
- Approvals and role separation: no manager approval flow for POs or stock adjustments; anyone can update/delete drafts via UI. Add lightweight approval states with audit log.
- Cash/landed cost tracking: receives don’t capture freight/duties or vendor invoices; small businesses often need landed cost to price items.
- Mobility/offline: moves, receiving, and pick lists do not expose mobile-friendly controls or offline cues despite scanner components existing; barcode scan UX uses alerts instead of inline chips/toasts.
- Error recovery: no undo/rollback for destructive actions (delete/cancel). Stock count lacks discrepancy reports or export for audit sign-off.

## Unused/Underused Elements
- Display IDs exist but list headers sometimes fall back to raw UUID slices (e.g., receives list) instead of enforcing display IDs everywhere.
- Payment terms captured on vendor but not surfaced in PO/receive totals or due-date helpers.
- Chatter component imported on PO/receive detail but not integrated into workflows (no thread context or mentions for approvals).

## Quick Wins (Suggested Order)
1) Add tenant scoping and role validation to all server actions (`update*`, `delete*`, moves, checkouts) and emit activity logs for state changes.  
2) Introduce pagination + filters (status, vendor, assigned-to, date range) on PO/Receive/Pick List/Stock Count lists; move sorting to SQL.  
3) Replace blur-based autosave with explicit “Save”/“Save & Continue” plus inline validation for required fields (vendor, items, dates, quantities).  
4) Harden workflows: block receive completion when serial counts ≠ quantities or when exceeding PO remaining; block PO status changes without vendor/items.  
5) Improve mobile/scanner UX: inline toasts instead of alerts, large tap targets, sticky action bars on detail pages.  
6) Add approval + notification hooks for PO submit/approve and pick-list assignment; surface “Assigned to me” views.  
7) Move inventory from client-side move page to server-driven paginated fetch with optimistic UI and background revalidation.  
8) Add ledger/adjustment records for moves, checkouts, and receives to preserve auditability.  

## File References Reviewed
- `app/(dashboard)/tasks/page.tsx`, `inbound/page.tsx`, `fulfillment/page.tsx`, `inventory-operations/page.tsx`
- `app/(dashboard)/tasks/purchase-orders/page.tsx` and `[id]/PurchaseOrderDetailClient.tsx`
- `app/(dashboard)/tasks/receives/page.tsx` and `[id]/ReceiveDetailClient.tsx`
- `app/(dashboard)/tasks/pick-lists/page.tsx`
- `app/(dashboard)/tasks/stock-count/page.tsx` and `components/workflows/StockCountClient.tsx`
- `app/(dashboard)/tasks/moves/page.tsx`
- `app/actions/purchase-orders.ts`, `app/actions/receives.ts`, `app/actions/pick-lists.ts`, `app/actions/checkouts.ts`
