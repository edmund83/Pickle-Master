# Inventory Detail Pages Audit

Audit of `/inventory/[itemId]`, `/inventory/[itemId]/edit`, and `/inventory/[itemId]/activity` for security, performance, data integrity, data integration, and other flaws.

---

## 1. Security

### 1.1 Tenant isolation (IDOR)

| Page / Layer | Status | Notes |
|--------------|--------|--------|
| **Detail page** (`page.tsx`) | ✅ | Fetches profile → `tenant_id`, then item with `.eq('tenant_id', profile.tenant_id)`. Explicit tenant check. |
| **Activity page** (`activity/page.tsx`) | ⚠️ → Fixed | Previously relied only on RLS: fetched item by `id` only. RLS on `inventory_items` restricts by tenant, so no IDOR in practice. **Fix applied:** Explicit profile + tenant filter for defense in depth. |
| **Edit page** (client) | ✅ | Fetches profile then item with `.eq('tenant_id', profile.tenant_id)`. |
| **Server actions** (`deleteItem`, `duplicateItem`, inventory actions) | ✅ | Use `getAuthContext()` + `verifyRelatedTenantOwnership('inventory_items', itemId, context.tenantId)`. |
| **RPCs** (`get_activity_logs`, `get_item_tags`, `get_item_lots`) | ✅ | Use `get_user_tenant_id()` and filter by tenant. |
| **Reminder actions** | ✅ | Use `getAuthContext()`; RPC `get_item_reminders` is expected to be tenant-scoped (definer). |
| **Checkouts** (client) | ✅ | RLS on `checkouts` by `tenant_id`; client only sees tenant’s checkouts. |

### 1.2 Input validation

| Item | Status | Notes |
|------|--------|--------|
| **itemId format** | ⚠️ → Fixed | Detail/activity did not validate UUID; invalid IDs hit DB. **Fix:** Early UUID validation and 404 without querying where appropriate. |
| **Server actions** | ✅ | `deleteItem` / `duplicateItem` use `z.string().uuid().safeParse(itemId)`. |

### 1.3 XSS / unsafe content

| Item | Status | Notes |
|------|--------|--------|
| **Image URLs** | ⚠️ → Fixed | `item.image_urls` used in `<img src={...}>` with no protocol check. If DB contained `javascript:...` or malicious `data:` URL, could be XSS. **Fix:** Sanitize to allow only `https:`, `http:`, or relative URLs. |
| **Text content** | ✅ | React escapes text; item name, SKU, etc. are safe. |

### 1.4 Auth

- All three pages require authenticated user (detail/edit use server `getUser()` and redirect; activity fetches item and RLS enforces tenant).
- Server actions use `getAuthContext()` and role checks where needed.

---

## 2. Performance

### 2.1 Detail page `getItemDetails()`

- **Before:** Sequential awaits: profile → item → folder → tags → activity → tenant → serialStats or lotStats. Many round-trips in sequence.
- **After:** Profile and item first (item depends on profile.tenant_id). Then run in parallel: folder, itemTags, activityLogs, tenant. Then serialStats/lotStats (each depends on item and tracking mode). Reduces latency.

### 2.2 Activity page

- Single item fetch + one `get_activity_logs` RPC. No change needed.

### 2.3 Edit page

- Client: one item fetch, one tenant fetch. Could parallelize; impact small.

---

## 3. Data integrity

- **Item vs folder:** Item and folder fetched separately; if folder is deleted after item load, UI may show stale folder name. Acceptable; next load will correct.
- **Activity / tags:** RPCs are tenant-scoped and return consistent data.
- **Checkouts / reminders:** RLS and tenant-scoped RPCs keep data consistent per tenant.

---

## 4. Data integration

- **get_activity_logs:** Called with `p_entity_id`, `p_entity_type`, `p_limit`. Function signature uses same parameter names; Supabase passes named params. ✅
- **get_item_tags:** `p_item_id`; `get_item_lots`: `p_item_id`, `p_include_depleted`. ✅
- **Error handling:** `getItemDetails` returns `null` on any error; caller uses `notFound()`. No distinction between “forbidden” and “not found” (intentional to avoid leaking).

---

## 5. Other

- **Type safety:** `(supabase as any)` used in several places; consider typing Supabase client/response for better maintainability (no runtime impact).
- **Metadata footer:** Displays `item.id` (UUID). Low sensitivity; only visible to users who can already see the item.
- **get_item_reminders:** Reminder-actions do not verify item ownership before calling RPC; they rely on RPC being tenant-scoped. Recommend confirming RPC enforces tenant (e.g. joins via `inventory_items.tenant_id` or equivalent).

---

## 6. Summary of fixes applied

1. **Activity page:** Explicit tenant check: load profile, then fetch item with `.eq('tenant_id', profile.tenant_id)`. Return `null` (notFound) if no profile or tenant.
2. **Detail page:** Early UUID validation for `itemId`; parallelize independent fetches (folder, tags, activity, tenant) after item is loaded.
3. **Detail page:** Image URL sanitization: only allow `https:`, `http:`, or relative URLs for `img` `src`.
