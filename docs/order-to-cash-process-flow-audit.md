# Order-to-Cash Process Flow Audit

**Scope:** Sales Order → Pick List → Delivery Order → Invoice  
**Focus:** Errors, performance, security, data integration, data integrity

---

## 1. Process flow summary

| Stage | Trigger | Key functions / RPCs | Next stage |
|-------|---------|----------------------|------------|
| Sales order | User creates/edits | `create_sales_order`, `updateSalesOrderStatus` | Pick list (when status → `picking`) |
| Pick list | SO status → `picking` | `generate_pick_list_from_sales_order` | Delivery order (when pick list completed) |
| Delivery order | User from completed pick list | `create_delivery_order_from_pick_list`, `copyPickListTrackingToDeliveryOrder` | Invoice (when DO delivered) |
| Invoice | From SO or from delivery | `createInvoiceFromSO`, `create_invoice_from_delivery` (RPC only) | — |

---

## 2. Issues found

### 2.1 Data integrity (critical)

- **Missing `sales_orders.pick_list_id` after pick list generation**  
  Migration `00084_fix_pick_list_status_from_so.sql` replaced `generate_pick_list_from_sales_order` and fixed the pick list status to `draft` but **did not set `sales_orders.pick_list_id`**.  
  `create_delivery_order_from_pick_list` looks up the sales order with `WHERE pick_list_id = p_pick_list_id`. If `pick_list_id` is never set, that lookup returns no row and the RPC raises *"No sales order linked to this pick list"*, so **creating a delivery order from a pick list fails**.  
  **Fix:** New migration that updates `generate_pick_list_from_sales_order` to set `sales_orders.pick_list_id = v_pick_list_id` in the same UPDATE that sets `status = 'picking'`.

- **Invoice from SO: wrong customer address columns**  
  In `app/actions/invoices.ts`, `createInvoiceFromSO` selects `customers(name, billing_address1, billing_address2, ...)`. The `customers` table uses `billing_address_line1` and `billing_address_line2` (see `00063_customers.sql`).  
  Result: the select either fails (if strict) or returns nulls for those columns, so invoice bill-to address from customer can be wrong or empty.  
  **Fix:** Use `billing_address_line1` and `billing_address_line2` in the select and in the fallback when building the invoice (e.g. `so.customers?.billing_address_line1`).

- **Duplicate invoice from delivery**  
  RPC `create_invoice_from_delivery` does not check whether an invoice already exists for the given `delivery_order_id`. The same delivery can be invoiced more than once.  
  **Fix:** At the start of the RPC, check for an existing non-void/cancelled invoice for `p_delivery_order_id` and raise if found; optionally add a unique constraint or unique partial index on `invoices(delivery_order_id)` where `delivery_order_id IS NOT NULL` and status not in (cancelled, void).

### 2.2 Security

- **Tenant isolation**  
  RPCs use `get_user_tenant_id()` and compare to `tenant_id` on sales orders, pick lists, delivery orders. App layer uses `verifyTenantOwnership` / `verifyRelatedTenantOwnership` before calling RPCs. No cross-tenant leaks identified in the traced flow.

- **Feature gating**  
  Sales orders, delivery orders, and related actions call `requireFeatureSafe('sales_orders')` / `requireFeatureSafe('delivery_orders')`. Consistent.

- **Write permission**  
  Mutating actions use `requireWritePermission(context)`. Consistent.

### 2.3 Performance

*(See Section 5 below for a full performance breakdown.)*

### 2.4 Data integration

- **Two invoice entry points**  
  - **From SO:** `createInvoiceFromSO` – uses SO status (shipped/delivered/completed/partial_shipped), blocks if an invoice already exists for that `sales_order_id`, and uses **quantity_ordered** for line quantities.  
  - **From delivery:** `create_invoice_from_delivery` (RPC) – uses **quantity_delivered** and is not currently called from the app UI.  
  If both paths are used, one SO could have one “SO-level” invoice (ordered qty) and one or more “delivery-level” invoices (delivered qty). Design should be explicit: either invoice once per SO or once per delivery; if both exist, ensure business rules and duplicate checks are clear (see duplicate invoice fix above).

- **Quantity consistency**  
  Pick list items are created with `requested_quantity` from SO (in 00084: `soi.quantity_ordered`). Sync from pick to SO is via trigger `sync_pick_to_sales_order` on `pick_list_items` (updates `sales_order_items.quantity_picked`). Delivery order items get `quantity_shipped` from `pli.picked_quantity`. Confirm delivery sets `quantity_delivered = quantity_shipped` on DO items. Flow is consistent; the critical fix is linking SO to pick list via `pick_list_id`.

### 2.5 Other

- **create_invoice_from_delivery not exposed in app**  
  Only the RPC exists; no UI or server action calls it. If the intended design is “invoice from delivery,” the app should expose and use it (and enforce one invoice per delivery). If the intended design is “invoice from SO only,” the RPC could be deprecated or guarded.

- **existingInvoice query in createInvoiceFromSO**  
  Uses `.not('status', 'in', '("cancelled","void")')`. Supabase/PostgREST syntax may require a different form (e.g. filter by allowed statuses). If duplicate invoices are still possible, verify this filter in practice.

---

## 3. Fixes applied

1. **Migration 00127:** `generate_pick_list_from_sales_order` updated to set `sales_orders.pick_list_id = v_pick_list_id` when creating a pick list from a sales order.
2. **invoices.ts:** Customer select and fallbacks in `createInvoiceFromSO` updated to use `billing_address_line1` and `billing_address_line2`.
3. **Migration 00128 (optional):** `create_invoice_from_delivery` updated to prevent duplicate invoices for the same delivery order (check + optional unique index).

---

## 4. Recommendations

- Run through the full path (create SO → confirm → picking → complete pick list → create DO → dispatch → confirm delivery → create invoice) in a test tenant and verify:
  - Delivery order can be created from the completed pick list (no “No sales order linked” error).
  - Invoice from SO shows correct customer billing address when SO has a customer.
- Decide whether invoices are created only from SO or also from delivery; then either expose and use `create_invoice_from_delivery` in the app with the duplicate check, or document that only SO-based invoicing is supported.
- Consider a single “create invoice” entry that chooses SO vs delivery based on context (e.g. one invoice per delivery, or one per SO) to avoid confusion and double-invoicing.

---

## 5. Performance (process flow)

### 5.1 Round-trips per operation

| Operation | Round-trips | Notes |
|-----------|-------------|--------|
| **SO to Pick list** (`updateSalesOrderStatus` to `picking`) | 3-4 | 1 ownership (sales_orders), optional 1 item count (submitted), 1 RPC `generate_pick_list_from_sales_order`. No N+1. |
| **Create DO from pick list** | **3 + N** | 1 RPC `create_delivery_order_from_pick_list`, 1 select DO for `display_id`, then **N** RPCs `get_pick_list_item_tracking` (one per DO item) + 1 batch insert into `delivery_order_item_serials`. So **5 + N** total for N items. |
| **Dispatch DO** (`updateInventoryOnDispatch`) | **1 + 2S + L** | 1 select DO items + serials; per item with serials: 1 select `serial_numbers` + 1 RPC `stock_out_serials`; lots use batched/parallel work. S = items with serials, L = lot-related round-trips. |
| **Create invoice from SO** | 5 | 1 SO+items+customer, 1 existingInvoice, 1 RPC display_id, 1 insert invoice, 1 insert invoice_items. Sequential; could combine checks in DB. |
| **Paginated lists** (SO / Pick list / DO / Invoices) | 2 | `Promise.all([countQuery, dataQuery])` — good. Single page with joins (customers, profiles). |

### 5.2 Hot spots

1. **Copy tracking after DO creation**  
   `copyPickListTrackingToDeliveryOrder` does **one RPC per delivery order item** (`get_pick_list_item_tracking`). Example: 20 items = 1 + 20 + 1 = **22 round-trips** (fetch DO items, 20 RPCs, 1 batch insert). Acceptable for typical DO sizes (under 30 lines); for large DOs (50+ lines) consider a **single RPC** that accepts `p_delivery_order_id` and copies all pick-list-item tracking into `delivery_order_item_serials` in one round-trip.

2. **Dispatch: serials per item**  
   `updateInventoryOnDispatch` does 2 round-trips per item that has serials (lookup serial IDs, then `stock_out_serials`). For many serial items, a **batch RPC** (e.g. accept all item+serial_ids for the DO) would reduce round-trips.

3. **Invoice from SO**  
   Five sequential round-trips; the existing-invoice check and display_id could be moved into a single RPC (e.g. `create_invoice_from_so` in DB) to reduce to 2-3 round-trips if this path is hot.

### 5.3 Indexes (already in place)

- **sales_orders:** `tenant_id`, `tenant_id+status`, `tenant_id+customer_id`, `tenant_id+order_date`, `tenant_id+created_at`, `pick_list_id`, `sales_order_items(sales_order_id)`.
- **pick_lists:** `tenant_id`, `status`, `assigned_to`, `pick_list_items(pick_list_id)`; `pick_list_item_lots` / `pick_list_item_serials` on `pick_list_item_id` and `tenant_id`.
- **delivery_orders:** `tenant_id`, `tenant_id+status`, `sales_order_id`, `pick_list_id`, `delivery_order_items(delivery_order_id)`, `delivery_order_item_serials(delivery_order_item_id)`.
- **invoices:** `tenant_id`, `tenant_id+status`, `customer_id`, `sales_order_id`, `delivery_order_id`, `invoice_items(invoice_id)`.

No missing indexes identified for the main filters (tenant, status, FKs) used in the flow.

### 5.4 Recommendations

- **Short term:** Keep current implementation; round-trip counts are acceptable for typical DO/invoice sizes (e.g. under 30 lines per DO).
- **If DOs often have 30+ lines:** Add an RPC `copy_tracking_from_pick_list_to_delivery_order(p_delivery_order_id UUID)` that, in one transaction, copies all lot/serial allocations from the linked pick list items into `delivery_order_item_serials`, and call it from the app instead of the per-item `get_pick_list_item_tracking` loop.
- **If dispatch is slow for many serial items:** Add a batch `stock_out_serials_for_delivery_order(p_delivery_order_id UUID)` (or similar) that processes all serials for the DO in one go.
- **List pages:** Already efficient (parallel count + data, limited page size). Optional: use a single query with a window function for count if Supabase/PostgREST supports it, to avoid two round-trips for list pages.
