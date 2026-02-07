# PO to Receiving Workflow – Field Relevancy & Gaps (IMS Expert Audit)

**Scope:** Purchase Order → Create Receive → Complete Receive  
**Focus:** Field relevancy, data flow, and gaps for inventory/receiving operations.

---

## 1. Process flow summary

| Stage | Trigger | Key data / RPC | Outcome |
|-------|--------|----------------|---------|
| **PO (draft)** | User creates/edits | `updatePurchaseOrder`, item add/remove/quantity | Vendor, items, delivery/billing address, expected date, notes |
| **PO (submitted/confirmed/partial)** | User can create receive | `create_receive_with_items` | New receive (draft) with items = remaining qty per PO line |
| **Receive (draft)** | User edits header + items | `updateReceive`, `updateReceiveItem`, etc. | Delivery note, carrier, tracking, default folder, received date, notes; per-item qty, condition, lot/batch, location |
| **Complete receive** | User completes | `complete_receive` | PO line `received_quantity` updated; inventory/lots/location_stock updated; PO status → partial or received; PO `received_date` set when fully received |

---

## 2. Field relevancy – Purchase Order

| PO field | Relevance to receiving | Flows to receive? | Notes |
|----------|------------------------|-------------------|--------|
| **vendor_id / vendor name** | High – who sent the goods | Yes (display only) | Shown on receive as “Source PO • Vendor name”. |
| **expected_date** | High – expected vs actual | No | Not passed to receive; not shown on receive. Would help compare “Expected by” vs “Received date”. |
| **ship_to_*** (delivery address) | Medium – where PO says to deliver | No | Not on receive. Useful for “deliver to” / staging area context. |
| **notes** | Medium – vendor/special instructions | No | Not copied to receive notes. |
| **order_number / display_id** | High – reference | Yes | Source PO link and label. |
| **status** | High – workflow | Yes (display) | Shown on receive Source PO card. |
| **items (ordered_quantity, received_quantity)** | Critical | Yes | Receive items pre-filled with remaining qty; completion updates received_quantity. |
| **bill_to_*** | Low for receiving | No | Billing; not needed on receive. |

---

## 3. Field relevancy – Receive (header)

| Receive field | Relevance | Set from PO? | Notes |
|---------------|-----------|--------------|--------|
| **purchase_order_id** | Critical | Yes | Links receive to PO. |
| **source_type** | High | Yes | Set to `purchase_order` when created from PO. |
| **received_date** | Critical | Yes (default) | Defaults to CURRENT_DATE at creation. |
| **delivery_note_number** | High | No (optional in API only) | Supplier delivery note; not collected on PO when creating receive. |
| **carrier** | High | No | Not passed from PO. |
| **tracking_number** | High | No | Not passed from PO. |
| **default_location_id** (folder) | High | No | Default put-away; not passed from PO. |
| **notes** | Medium | No | Not pre-filled from PO notes. |

---

## 4. Field relevancy – Receive (items)

| Receive item field | Relevance | From PO? | Notes |
|--------------------|-----------|----------|--------|
| **purchase_order_item_id** | Critical | Yes | Links line to PO line. |
| **item_id / item_name / sku** | Critical | Yes | From PO item. |
| **quantity_received** (pre-fill) | Critical | Yes | Remaining qty = ordered − already received. |
| **condition** | High | Yes (default) | Default `good`; user can change. |
| **location_id** (folder) | High | From default | Defaults to receive’s default_location_id. |
| **lot_number, batch_code, expiry_date, manufactured_date** | High (if lot-tracked) | No | Entered on receive. |
| **return_reason** | N/A for PO | — | Used for customer returns. |

---

## 5. Gaps (prioritised)

### 5.1 High impact

1. **Expected date not visible on receive**  
   **Gap:** PO `expected_date` is not shown on the receive.  
   **Impact:** Warehouse cannot quickly compare “expected by” vs “received date”.  
   **Suggestion:** In `get_receive_with_items`, include `expected_date` in the `purchase_order` JSON. On Receive detail, show e.g. “Expected (from PO): &lt;date&gt;” next to or above “Received date”.

2. **Create Receive passes only PO id**  
   **Gap:** `createReceive({ purchase_order_id })` is called from the PO page with no optional params. The API and RPC support `delivery_note_number`, `carrier`, `tracking_number`, `default_location_id`, `notes` but the UI never sends them.  
   **Impact:** User must re-enter delivery note / carrier / tracking / folder / notes on the receive page every time.  
   **Suggestion (optional):** Either: (a) add an optional “Receive options” step/modal on the PO before “Create Receive” (delivery note, carrier, tracking, default folder, notes), or (b) keep create minimal and document that these are entered on the receive (current behaviour).

### 5.2 Medium impact

3. **PO delivery address (ship_to) not on receive**  
   **Gap:** PO ship_to (delivery address) is not exposed on the receive.  
   **Impact:** “Where to deliver” from the PO is not visible during receiving (e.g. for staging by delivery address).  
   **Suggestion:** Optionally include a compact ship_to in `get_receive_with_items` (e.g. one line or name + city) and show “Deliver to (from PO): …” on Receive detail when present.

4. **PO notes not copied to receive**  
   **Gap:** PO notes (e.g. vendor instructions) are not copied into receive notes.  
   **Impact:** Receiver may miss instructions unless they open the PO.  
   **Suggestion:** Either copy PO notes into receive notes when creating from PO (with a “From PO:” prefix), or at least show PO notes in a read-only block on the receive (e.g. in Source PO card).

### 5.3 Already correct / low gap

5. **PO status and received_quantity** – Updated correctly by `complete_receive` (partial vs received; received_date when fully received).  
6. **Item-level linkage** – receive_items correctly link to purchase_order_items and pre-fill remaining qty.  
7. **Vendor and PO reference** – Receive shows Source PO link and vendor name; relevancy is good.  
8. **Receive item fields** – quantity, condition, lot/batch/expiry, location are all relevant and used.

---

## 6. Data flow diagram (current)

```
PO (submitted/confirmed/partial)
  │
  │  Create Receive (only purchase_order_id)
  ▼
create_receive_with_items
  │
  ├─ receives: purchase_order_id, source_type='purchase_order',
  │            received_date=CURRENT_DATE,
  │            delivery_note_number/carrier/tracking/default_location_id/notes = NULL
  │
  └─ receive_items: per PO line with remaining_qty > 0
       quantity_received = remaining_qty, condition = 'good', location_id = default_location_id

Receive detail UI
  │
  ├─ Shows: received date, delivery note #, carrier, tracking #, folder, notes
  ├─ Source PO: link, vendor name, status  (no expected_date, no ship_to)
  └─ Items: ordered, already received, quantity receiving, condition, lot/batch, location

Complete receive
  │
  └─ PO: purchase_order_items.received_quantity += quantity_received
       PO status → partial | received; PO.received_date set when received
```

---

## 7. Recommended next steps

1. **Quick win:** Add PO `expected_date` to `get_receive_with_items` and display “Expected (from PO): &lt;date&gt;” on Receive detail.  
2. **Optional UX:** Add optional receive options (delivery note, carrier, tracking, default folder, notes) when creating receive from PO, and pass them to `createReceive`.  
3. **Optional context:** Expose PO ship_to (summary) and/or PO notes on Receive detail for warehouse context.  
4. **No change needed:** Core field relevancy and PO ↔ receive item flow are sound; remaining gaps are visibility and optional pre-fill.

---

## 8. Implemented (after audit)

- **Expected date on receive:** Migration `00138_get_receive_po_expected_date_ship_to_notes.sql` updates `get_receive_with_items` to return `expected_date`, `notes`, and ship_to fields (`ship_to_name`, `ship_to_address1`, `ship_to_city`, `ship_to_country`) in the `purchase_order` object. Receive detail Source PO card shows “Expected (from PO): &lt;date&gt;” when present.
- **Deliver to (from PO):** Same migration; Receive detail shows “Deliver to (from PO)” with a one-line summary when any ship_to data exists.
- **PO notes on receive:** Same migration; Receive detail Source PO card shows “PO notes” (read-only) when the PO has notes.
- **Create Receive with optional params:** PO detail “Receive Items” opens a modal to optionally set delivery note #, carrier, tracking #, default folder, and notes (PO notes pre-filled). On “Create Receive”, `createReceive` is called with these params so the new receive is pre-filled. PO page fetches `locations` (folders) and passes them to the client for the default-folder dropdown.

---

*Audit based on: `app/actions/receives.ts`, `create_receive_with_items` (00131), `get_receive_with_items` (00109), `complete_receive` (00130), PO detail and Receive detail UI.*
