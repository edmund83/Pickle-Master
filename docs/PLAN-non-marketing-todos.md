# Plan: Non-Marketing TODOs

Plan for implementing the five non-marketing TODOs across the codebase. Order is chosen to minimize dependencies and deliver value incrementally.

---

## 1. Stripe webhook – failed payment email

**Location:** `app/api/stripe/webhook/route.ts` (inside `handlePaymentFailed`)

**Goal:** When a payment fails, send an email to the tenant so they can update payment method.

**Approach:**

1. **Resolve recipient**
   - In `handlePaymentFailed` you already have `tenant.id`.
   - Add a query for a contact email: either a `billing_email` / `owner_email` on `tenants`, or the first admin user email from `team_members` + `profiles` (or `invitations`). Prefer a dedicated billing field if it exists.
   - If no email is found, log and skip sending (no throw).

2. **Send email**
   - Use existing email layer. Prefer **Resend** (`lib/resend.ts` or `app/actions/email.ts`) for consistency with invitations/labels; alternatively `lib/email.ts` (nodemailer) if that’s the standard for transactional.
   - Add a small helper, e.g. `sendPaymentFailedEmail({ to, tenantName, invoiceUrl? })`, with a clear subject and body (e.g. “Action required: payment failed for [tenant]”, link to Stripe customer portal or dashboard billing if you have one).

3. **Error handling**
   - Send in a try/catch; log failures. Do not throw or rethrow so Stripe retries are not triggered by email failures.

**Dependencies:** None. Resend/nodemailer and Stripe webhook are already in place.

**Effort:** Small (on the order of 1–2 hours).

---

## 2. Stock count completion – PDF export

**Location:** `components/stock-count/summary/CompletionSummary.tsx` (`handleExportPDF`)

**Goal:** Replace “PDF export coming soon!” with a real PDF of the completion summary and (optionally) variance details.

**Approach:**

1. **Reuse existing PDF stack**
   - Use the same pattern as `lib/documents/pdf-generator.ts`: `jsPDF`, `buildCompanyBranding`, and the same page size/margins/typography conventions.
   - Add a new exported function, e.g. `generateStockCountCompletionPDF({ stockCount, items, stats, branding })`, that:
     - Renders header (company branding, “Stock Count Completion” title, `stockCount.display_id`, date).
     - Renders summary (total items, counted, completion %, total negative/positive variance, net).
     - Renders a table of items with at least: name/SKU, expected, counted, variance (and status if useful).

2. **Download flow**
   - Reuse the same download pattern as PO/Invoice (e.g. `downloadPdfBlob` or equivalent in `pdf-generator`).
   - In `CompletionSummary`, call the new generator with `stockCount`, `items`, `stats`, and branding from tenant context (same as PO detail). On success, trigger download; on error, show feedback (e.g. toast) and optionally log.

3. **Branding**
   - Get company details/logo the same way as in Purchase Order PDF (e.g. `useTenantCompanyDetails` / `useTenantLogoUrl` or equivalent passed in or fetched in the component).

**Dependencies:** None. jsPDF and PO PDF already exist.

**Effort:** Small–medium (half day).

---

## 3. BorrowOutModal – batch-aware checkout RPC

**Location:** `components/stock/BorrowOutModal.tsx` (branch `isBatch` with TODO)

**Goal:** When the user selects a specific batch (lot) in “manual” mode, checkout should deduct from that batch instead of FIFO.

**Current behavior:** For batch (lot_expiry) items, the code calls `checkoutItem(itemId, quantity, ...)`, which uses `perform_checkout` RPC and does not accept a batch/lot id, so deduction is effectively FIFO.

**Approach:**

1. **Database / RPC**
   - Inspect `perform_checkout` in `supabase/migrations/00013_checkouts.sql` and the schema for lot/batch (e.g. `inventory_lots`, `inventory_item_lots`, or equivalent). Determine how quantity is stored per lot.
   - Either:
     - **Option A:** Add an optional `p_batch_id` (or `p_lot_id`) to `perform_checkout` and, when provided, deduct from that batch’s quantity and create/update checkout records tied to that batch; or
     - **Option B:** Create a new RPC, e.g. `perform_checkout_from_batch`, that takes `p_item_id`, `p_batch_id`, `p_quantity`, and assignee/notes/due date, and performs the deduction and checkout in one transaction.
   - Ensure RLS and constraints still hold (tenant, item ownership, non-negative quantity).

2. **Server action**
   - Add a server action that calls the new/updated RPC (e.g. `checkoutItemFromBatch(itemId, batchId, quantity, assigneeType, assigneeId, assigneeName, dueDate?, notes?)` in `app/actions/checkouts.ts`), or extend `checkoutItem` with an optional `batchId` and pass it through to the RPC.

3. **BorrowOutModal**
   - In the `isBatch` branch, when `selectedMode === 'manual'` and `selectedBatchId` is set, call the batch-aware action with `selectedBatchId` and the chosen quantity (capped by that batch’s quantity). Otherwise keep current `checkoutItem` call for “auto” or when no batch is selected.

**Dependencies:** Schema for lots/batches must support per-batch quantity and checkout linkage. If not, a migration may be needed first.

**Effort:** Medium (RPC + migration if needed + action + UI wiring).

---

## 4. Chatter – email notifications for opted-in users

**Location:** `app/actions/chatter.ts` (after inserting in-app notifications)

**Goal:** Send email notifications for chatter (e.g. comments/mentions) to users who have opted in.

**Approach:**

1. **Opt-in model**
   - Decide where “email on chatter” is stored: e.g. `user_preferences` / `notification_settings` (e.g. `email_on_chatter` or `email_on_mention`), or a simple flag on `profiles`. If no table exists, add a migration (e.g. `notification_preferences` with `user_id`, `email_on_chatter_mention`, `email_on_chatter_reply`).
   - When building `allNotifications`, also collect the set of user IDs that should receive an email (e.g. mentioned users + followers who have email-on-chatter enabled). Avoid duplicate emails (one per user per activity).

2. **Resolve emails**
   - For each user ID that should receive an email, resolve email address (e.g. from `profiles` or auth). Skip if no email.

3. **Send emails**
   - Use Resend (or the same channel as Stripe failed-payment) with a small helper, e.g. `sendChatterNotificationEmail({ to, subject, body, activityUrl })`. Subject/body could be “You were mentioned in…” / “New reply in…” with a link to the relevant record (e.g. PO, receive, task).
   - Do not block the main flow: fire-and-forget or queue. Log send failures; do not throw so in-app notifications are still created.

4. **Content**
   - Reuse the same “snippet” you use for in-app notification (e.g. first N chars of comment, record type, record display_id). Keep the email small and link-heavy.

**Dependencies:** Opt-in schema (may require a migration). Resend (or existing email) already present.

**Effort:** Medium (schema + preference read + email helper + wiring in chatter).

---

## 5. Offline sync – checkout/checkin sync

**Location:** `lib/hooks/useOfflineSync.ts` (handlers for `change.type === 'checkout'` and `'checkin'`)

**Goal:** When the app comes back online, apply queued checkout and checkin changes via server actions so the backend stays in sync.

**Approach:**

1. **Payload shape**
   - You already have `CheckoutPayload` and `CheckinPayload` in `lib/offline/types.ts`. Ensure the client, when queueing a change, stores exactly what the server needs (e.g. for checkout: `item_id`, `assigned_to_type`, `assigned_to_id`, `assigned_to_name`, `due_date`, `notes`; for checkin: `checkout_id`, `item_id`, `condition`, `notes`).

2. **Checkout handler**
   - In the sync loop, when `change.type === 'checkout'`, cast `change.payload` to `CheckoutPayload`, then call `checkoutItem` (or `checkoutWithSerials` if you ever queue serial checkouts) with the payload fields. Map `assigned_to_type`/`id`/`name` and optional `due_date`/`notes`.
   - Handle conflicts: if the server returns “insufficient quantity” or “already checked out”, call `markChangeFailed` with a clear `last_error` and optionally retry later or surface in UI. Do not block other pending changes.

3. **Checkin handler**
   - When `change.type === 'checkin'`, cast payload to `CheckinPayload` and call the existing return/checkin server action (e.g. `returnCheckout` or equivalent that takes `checkoutId`, `condition`, `notes`). If the checkout was already returned or not found, mark the change as failed with a clear message.

4. **Idempotency / duplicates**
   - If the same action is queued twice (e.g. double-tap), the server may succeed once and fail the second time. Treat “already returned” / “already checked out” as success for the first and mark the duplicate as failed or completed depending on desired semantics. Prefer one successful apply per logical action.

5. **Ordering**
   - If checkins depend on checkouts being applied first, process changes in a defined order (e.g. checkouts before checkins) or sort the pending queue by `created_at` and type. Optional: add a simple dependency field later if needed.

**Dependencies:** Existing `checkoutItem` / `checkoutWithSerials` and return-checkout action. No new tables; optional migration only if you add a “synced_checkout_id” to avoid duplicate applies.

**Effort:** Medium (payload alignment + both handlers + conflict handling + tests).

---

## Suggested order of implementation

| # | Item                         | Reason |
|---|------------------------------|--------|
| 1 | Stripe failed payment email  | Quick win, no schema change, improves billing UX. |
| 2 | Stock count PDF export       | Isolated, reuses PO PDF pattern, clear user value. |
| 3 | BorrowOut batch-aware RPC    | Requires DB/RPC work; do once schema is clear. |
| 4 | Chatter email notifications | Needs opt-in schema; can follow after 1 and 2. |
| 5 | Offline checkout/checkin sync | Builds on existing actions; can run in parallel with 3 or 4. |

---

## Summary

- **Stripe:** Resolve tenant contact email, send one “payment failed” email via Resend (or existing SMTP), no throw on email failure.
- **Stock count PDF:** New `generateStockCountCompletionPDF` in `pdf-generator.ts`, same branding as PO, wire `handleExportPDF` to generate + download.
- **BorrowOut batch:** Extend or add RPC to deduct from a specific batch; add server action; in BorrowOutModal use it when a batch is manually selected.
- **Chatter email:** Opt-in preference (schema if needed), resolve emails for mentioned/followers, send via Resend after creating in-app notifications.
- **Offline sync:** In `useOfflineSync`, implement checkout and checkin branches by calling existing server actions; handle conflicts and optional ordering.

All five are scoped to existing patterns (Resend, jsPDF, RPCs, server actions) and can be implemented incrementally without blocking each other after the chosen order above.
