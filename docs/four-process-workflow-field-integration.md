# Four-Process Workflow & Field Integration

**Scope:** Sales Order → Pick List → Delivery Order → Invoice (order-to-cash), plus Receive (inbound). Focus on integration between processes and consistent field naming/usability across forms.

---

## 1. Process workflows

| Process | Trigger / entry | Key links | Next step |
|--------|------------------|-----------|-----------|
| **Sales Order** | User creates draft → submits → confirms | `customer_id`, ship_to/bill_to addresses, items | Pick list (status → picking) |
| **Pick List** | Auto from SO when status → picking | `sales_order_id`, `pick_list_id` on SO | Delivery order (from completed pick list) |
| **Delivery Order** | From completed pick list, or standalone (new) | `pick_list_id`, `sales_order_id`, `customer_id` | Invoice (when DO delivered) or manual invoice from SO |
| **Invoice** | New (manual), or from SO (create from SO), or from delivery (RPC) | `sales_order_id`, `delivery_order_id`, `customer_id` | — |
| **Receive** | New (standalone or from PO) | `purchase_order_id` (optional), items, location | — (inbound; not part of O2C) |

**Data flow (O2C):**

- **SO → Pick list:** `generate_pick_list_from_sales_order` copies SO items and sets `sales_orders.pick_list_id`.
- **Pick list → DO:** `create_delivery_order_from_pick_list` creates DO and items; optionally `create_delivery_order_from_sales_order` (direct from SO).
- **DO / SO → Invoice:** `createInvoiceFromSO(salesOrderId)` copies SO items and customer billing (SO bill_to or customer `billing_address_line*`). RPC `create_invoice_from_delivery` exists for delivery-based invoicing.

---

## 2. Field naming: database vs UI vs actions

**Customers table (source of truth):**

- `billing_address_line1`, `billing_address_line2`
- `shipping_address_line1`, `shipping_address_line2`
- `*_city`, `*_state`, `*_postal_code`, `*_country`

**UI forms (task forms):**

- **getCustomers()** returns customers with **aliased** fields for convenience: `shipping_address1` (= `shipping_address_line1`), `shipping_address2`, `billing_address1`, `billing_address2`. So in **NewDeliveryOrderClient** and **NewInvoiceClient** we use `customer.shipping_address1` / `customer.billing_address1` etc.; this is correct because the list comes from `getCustomers()` which maps DB columns to these names.
- **Sales order detail** uses DB shape directly when loading customer: `shipping_address_line1`, `billing_address_line1`, etc.

**Server actions (when querying DB directly):**

- Must use **DB column names**: `billing_address_line1`, `billing_address_line2`, `shipping_address_line1`, `shipping_address_line2`.
- **Fixes applied:**
  - **delivery-orders.ts** (create delivery order with `customer_id`): select and defaults now use `shipping_address_line1` / `shipping_address_line2`.
  - **invoices.ts** (`createInvoice` without items): select and insert fallbacks now use `billing_address_line1` / `billing_address_line2`.
  - **invoices.ts** (`createInvoiceWithItems`, `createInvoiceFromSO`) already used `billing_address_line*` correctly.

---

## 3. Usability consistency across the four task forms

All four use the same **form pattern** for consistency:

| Aspect | Sales Order (draft) | Delivery Order (new) | Invoice (new) | Receive (new) |
|--------|---------------------|----------------------|---------------|----------------|
| **Layout** | Single column, `max-w-2xl` | Single column, `max-w-2xl` | Single column, `max-w-2xl` | Single column, `max-w-2xl` |
| **Address default** | Ship To / Bill To: default = customer address; “Use a different address” toggles form | Delivery address: default = customer shipping; “Use a different delivery address” toggles form | Billing: default = customer billing; “Use a different billing address” toggles form | N/A (no customer address) |
| **Notes** | Last section (Internal, Customer notes) | Last section | Last section (Internal, Customer, T&C) | Last section |
| **Dropdowns** | Shared `Select` (Priority, Country) | Shared `Select` (Country) | Shared `Select` (Payment terms, Country) | Shared `Select` (Default location) |
| **Shell** | TaskFormShell (back, title, error banner, sticky footer) | TaskFormShell | TaskFormShell | TaskFormShell |

**Field flow between processes:**

- **SO → DO (when created from pick list / SO):** DO gets customer and ship-to from SO/pick list (RPC copies addresses). Standalone “New delivery order” uses customer’s `shipping_address_line*` for defaults (now fixed in actions).
- **SO → Invoice (create from SO):** Invoice gets `customer_id`, bill_to from SO’s bill_to or customer’s `billing_address_line*` (createInvoiceFromSO already correct).
- **Manual new invoice:** Customer billing defaults from `customers.billing_address_line1/2` (now fixed in createInvoice).
- **Receive:** No customer/supplier address in the form; uses PO context when “from PO” or standalone receive type (e.g. customer return, stock adjustment). Locations and receive details are consistent.

---

## 4. Summary

- **Integration:** SO → Pick list → DO → Invoice is linked by IDs and RPCs; address and customer data flow from SO/customer into DO and Invoice. Receive is separate (inbound).
- **Field usability:** All four task forms use the same single-column layout, “customer address by default” where applicable, notes last, and shared Select components.
- **Fixes applied:** Delivery order and invoice server actions now use the correct customer address columns (`shipping_address_line1/2`, `billing_address_line1/2`) when reading from the DB, so address defaults and create-from-customer behave correctly.
