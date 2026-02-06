# Reports Pages Audit

Audit of `/reports/*` pages for security, performance, data integrity, data integration, and other flaws.

## Scope

- `app/(dashboard)/reports/*`
- `components/reports/FormattedReportStats.tsx`
- RPCs used by reports (`get_activity_by_day`, `get_action_breakdown`, `get_most_active_items`, `get_weekly_comparison`, `get_expiring_lots`, `get_expiring_lots_summary`)

## Security

### 1) Tenant isolation in Trends RPCs (HIGH)

**Finding:** Trends RPCs (`get_activity_by_day`, `get_action_breakdown`, `get_most_active_items`, `get_weekly_comparison`) are `SECURITY DEFINER` and accept `p_tenant_id` without validating it. A malicious client could call these with another tenant ID and retrieve cross-tenant analytics.

**Fix applied:** Added a migration to enforce tenant scoping using `get_user_tenant_id()` and block mismatched `p_tenant_id`.

- Migration: `supabase/migrations/00132_lock_trends_reports_to_tenant.sql`

### 2) Unsafe image URLs in report rows (MEDIUM)

**Finding:** Low Stock and Expiring reports render `img src` from DB values (`image_urls[0]`, `item_image`) without protocol checks. This can allow `javascript:`/unsafe URLs if data is compromised.

**Fix applied:** Added `safeImageUrl()` usage in:

- `app/(dashboard)/reports/low-stock/page.tsx`
- `app/(dashboard)/reports/expiring/page.tsx`

### 3) CSV export injection (MEDIUM)

**Finding:** CSV exports in `Activity` and `Stock Movement` are built via simple `row.join(',')`. This can cause:

- CSV formula injection (`=`, `+`, `-`, `@`)
- Broken formatting from commas/newlines/quotes

**Fix applied:** Added `toCsvValue()` helper in `lib/utils.ts` and used it for:

- `app/(dashboard)/reports/activity/page.tsx`
- `app/(dashboard)/reports/stock-movement/page.tsx`

Also revokes object URLs after download to avoid leaks.

## Performance

### 1) Full-table scans for large tenants (MEDIUM)

Some reports fetch all tenant items and aggregate in JS:

- `inventory-summary`
- `inventory-value`
- `profit-margin`

This is acceptable for small/medium datasets, but can be slow for large tenants. Consider:

- Using RPC aggregation for totals
- Adding server-side pagination for item lists
- Caching results for a short duration

### 2) Client-side reports (LOW)

`activity` and `stock-movement` run client-side queries and are limited to 200 rows. That’s acceptable but:

- Consider server-side rendering for better TTFB
- Add pagination or date-range limits beyond 90 days if needed

## Data Integrity

- **Profit Margin:** Items without `cost_price` are excluded from margin calculations and called out in UI. Good.
- **Expiring:** Uses lots with `quantity > 0` and dynamic expiry checks; matches DB logic.
- **Inventory Summary:** Aggregates in JS from a single fetch; consistent but could drift if data changes mid-render (acceptable).

## Data Integration

### Trends RPCs

These now enforce tenant scoping in SQL. Report page continues to pass `tenant_id` from the profile.

### Expiring RPCs

`get_expiring_lots` and `get_expiring_lots_summary` use `get_user_tenant_id()` internally and are tenant-safe.

## Files changed

- `supabase/migrations/00132_lock_trends_reports_to_tenant.sql` (new)
- `app/(dashboard)/reports/low-stock/page.tsx`
- `app/(dashboard)/reports/expiring/page.tsx`
- `app/(dashboard)/reports/activity/page.tsx`
- `app/(dashboard)/reports/stock-movement/page.tsx`
- `lib/utils.ts` (new `toCsvValue()` helper)

## Remaining recommendations (optional)

- Add pagination to large report lists (activity/stock movement).
- Consider materialized views or cached RPCs for inventory summary/value.

