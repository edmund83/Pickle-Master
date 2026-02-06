# Purchase Order and Receiving Flow Audit

**Scope:** Purchase Order → Receive (create from PO, complete receive)  
**Focus:** Errors, performance, security, data integration, data integrity

---

## 1. Process flow summary

| Stage | Trigger | Key functions / RPCs | Next stage |
|-------|---------|----------------------|------------|
| Purchase order | User creates/edits | `create_purchase_order_v2`, `updatePurchaseOrder`, status submit/confirm | Receive (when PO submitted/confirmed/partial) |
| Receive | User creates from PO | `create_receive_with_items` (pre-fills items with remaining qty) | Complete receive |
| Complete receive | User completes draft | `complete_receive` (updates PO received qty, inventory, lots, location_stock, PO status) | — |

---

## 2. Issues found

### 2.1 Data integrity

- **Receives use folders but app verifies locations**  
  After migration 00109, `receives.default_location_id` and `receive_items.location_id` reference **folders(id)**. The UI uses `getLocations()` which returns **folders**. But in `app/actions/receives.ts`, `createReceive`, `updateReceive`, and `createStandaloneReceive` call `verifyRelatedTenantOwnership('locations', default_location_id, ...)`. A folder ID is not in the `locations` table, so the check fails and users cannot submit a receive with a default location (folder) selected.  
  **Fix:** Verify `default_location_id` / `location_id` against the **folders** table (and ensure the folder belongs to the tenant) instead of `locations`.

- **complete_receive and folder IDs**  
  When a receive has `default_location_id` or receive_items.`location_id` set to a **folder** ID (as per 00109), `complete_receive` uses that ID as `v_location_id` and:  
  - Inserts into `location_stock(tenant_id, item_id, location_id, quantity)` where `location_id` references **locations(id)** → FK violation.  
  - Inserts into `lots(..., location_id, ...)` where `location_id` references **locations(id)** → FK violation.  
  So completing a receive with a folder selected can fail or corrupt data.  
  **Fix:** In `complete_receive`, only update `location_stock` and only set `lots.location_id` when `v_location_id` exists in the `locations` table. If it is a folder ID (not in `locations`), skip the `location_stock` update and set `lots.location_id` to NULL.

### 2.2 Security

- **Tenant isolation**  
  RPCs use `get_user_tenant_id()` or `profiles.tenant_id`; app uses `verifyTenantOwnership` / `verifyRelatedTenantOwnership`. No cross-tenant leaks identified.

- **Feature gating**  
  Receives use RLS with `can_access_feature('receiving')` (00095). Consistent.

### 2.3 Performance

- **Create receive**  
  Single RPC `create_receive_with_items` (one transaction: header + loop of receive_items). No N+1.

- **Complete receive**  
  Single RPC; one loop over receive items with per-item updates (PO item, lot or inventory, location_stock). Acceptable for typical receive sizes.

- **List/count**  
  Paginated PO and receive lists use parallel count + data where applicable.

### 2.4 Data integration

- **create_receive_with_items**  
  Did not set `receives.source_type`; PO-linked receives could have NULL. **Fix:** Migration 00131 updates the function to set `source_type = 'purchase_order'` in the INSERT.

- **Remaining quantity**  
  Receive items are created with `quantity_received = ordered_quantity - received_quantity` from PO items. `complete_receive` adds to `purchase_order_items.received_quantity`. Over-receipt is guarded by `validate_receive`. Consistent.

---

## 3. Fixes applied

1. **app/actions/receives.ts:** Use `verifyRelatedTenantOwnership('folders', ...)` for `default_location_id` and `location_id` (create receive, update receive, standalone receive, add standalone item) so folder IDs from the UI are accepted.
2. **Migration 00130:** Update `complete_receive` to only write to `location_stock` and only set `lots.location_id` when the receive location ID exists in `locations`. Otherwise skip `location_stock` and set `lots.location_id` to NULL (folder IDs are not written to location_stock or lots).
3. **Migration 00131:** Update `create_receive_with_items` to set `source_type = 'purchase_order'` in the INSERT so PO-linked receives have correct source_type.
