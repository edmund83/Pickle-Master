# Sales Order: Field Relevance & Grouping Evaluation (IMS Expert View)

**Audience:** Mum-and-pop / small business (single or few staff, limited time, need clarity over power features).  
**Scope:** Draft sales order form — fields, grouping, and usability.  
**Context:** Sales order feeds **Pick list → Delivery order → Invoice**; field choices must stay consistent with downstream workflows.

---

## Implemented (as of this session)

- **Labels:** “Ship To” → “Delivery address”, “Bill To” → “Billing address” on Sales Order draft; “Same as delivery address” + helper text for billing. Same terminology on New Delivery Order and New Invoice (e.g. “Use customer delivery address”, billing helper text).
- **Single “Delivery by” date:** One main date (bound to **promised_date**) with helper text; “More options” collapsible for Requested date and full Priority. Changing “Delivery by” also sets requested_date so they stay in sync.
- **Create Invoice from SO:** “Create Invoice” button on SO detail when status is shipped/delivered/completed/partial_shipped; calls `createInvoiceFromSO` and redirects to the new invoice.
- **Billing address on confirmed SO:** Billing address card added to the confirmed-SO sidebar when `bill_to_name` or `bill_to_address1` is set.
- **New Invoice billing:** Billing address auto-populates when a customer is selected (dropdown click handler + existing useEffect).
- **Notes persistence:** Internal and Customer notes trigger immediate save on blur (in addition to debounced save) so notes are not lost when leaving the field quickly.

---

## 1. Downstream process usage (SO → Pick list → Delivery order → Invoice)

Which sales order fields are used by later steps constrains what can be simplified or hidden.

| SO field / group | Pick list | Delivery order | Invoice |
|------------------|-----------|----------------|---------|
| **Customer** (`customer_id`) | — | Used when creating DO from SO; DO links customer | Used; invoice links customer |
| **Ship To** (name, address1/2, city, state, postal, country, phone) | **Copied to pick list** when generating from SO (`generate_pick_list_from_sales_order`) | **Copied to DO** when creating from SO or from pick list (pick list already has SO ship_to) | — |
| **Bill To** (name, address1/2, city, state, postal, country) | — | — | **Copied to invoice** when creating from SO (`createInvoiceFromSO`) or from delivery (`create_invoice_from_delivery` uses SO bill_to or customer fallback) |
| **Order items** (sales_order_items) | **Copied** as pick list lines (requested qty from SO) | DO items from pick list (or from SO when creating DO from SO) | **Copied** as invoice lines (from SO or from delivery quantities) |
| **Promised date** | **Copied to pick list** (due date / when to pick by) | — | — |
| **Assigned to** | **Copied to pick list** (who to assign the pick to) | — | — |
| **Internal notes** | — | — | **Copied to new invoice** when creating from SO |
| **Payment term** (on SO or customer) | — | — | Used for invoice due date when creating from delivery (RPC) |
| **Requested date** | Not copied to pick list | — | — |
| **Priority** | Not copied | — | — |

**Implications**

- **Ship To** must stay complete and accurate: it drives pick list and delivery order “where to ship.” Simplifying to one “Delivery address” block is fine; removing or hiding it is not.
- **Bill To** must stay available: invoice (from SO or from delivery) uses SO bill_to or customer billing. Keeping “Same as delivery” default is fine; removing bill_to is not.
- **Promised date** is the date that flows to the pick list. If the form is simplified to one date, that single “Delivery by” / “Need by” field should map to **promised_date** (and optionally also set requested_date to the same value).
- **Internal notes** flow to the invoice when creating from SO; if you add a single “Notes” for simple mode, still persist it so it can be used as internal_notes (and optionally customer_notes) for downstream.
- **Assigned to** is optional for mum-and-pop but used by pick list assignment; hide in simple mode but keep in data/API so pick list creation still works if populated.

---

## 2. Current field inventory and grouping

| Section (order) | Fields | Visible in draft form? |
|-----------------|--------|------------------------|
| **1. Status** | Validation message (customer + items) | Yes |
| **2. Customer** | Search/select, name, email, phone (display); "Create new customer" | Yes |
| **3. Order Items** | Search, barcode scan, line items (item, qty, price, tax) | Yes |
| **4. Ship To** | Name, Address 1/2, City, State, Postal, Country, Phone; default = customer address | Yes |
| **5. Bill To** | Same as Ship To checkbox; else Name, Address 1/2, City, State, Postal, Country (collapsible) | Yes |
| **6. Priority & Dates** | Priority (Low/Normal/High/Urgent), Requested Date, Promised Date | Yes |
| **7. Save status** | Dirty / Saving indicator | Yes |
| **8. Notes** | Internal Notes, Customer Notes (collapsible) | Yes |
| **9. Metadata** | Created by, Last updated | Yes |
| *(in state only)* | **Order number**, **Order date**, **Source location** | No (saved only; order_number used in header fallback) |

---

## 2. Relevance assessment (inventory management + small business)

### Essential (must keep)

- **Customer** — Who is the order for; drives addresses, invoicing, and history. Used by delivery order and invoice.
- **Order Items** — What and how much; core of the order. Copied to pick list, then delivery order, then invoice.
- **Ship To (delivery address)** — Where to send. **Copied to pick list and delivery order**; must remain complete. Can be labelled "Delivery address" for clarity.

### High relevance

- **Bill To** — Needed when billing ≠ shipping (e.g. head office pays, ship to site). Many small businesses use “same as Ship To”; the current pattern (default same, expand when different) is good.
- **One primary date** — “When they need it” or “Delivery by” is enough for most small ops; requested vs promised can be merged or one hidden.
- **Notes** — Internal and/or customer notes are useful; a single “Notes” can suffice for the smallest users.

### Moderate relevance (simplify or hide by segment)

- **Priority** — Helps with urgency; four levels (Low/Normal/High/Urgent) can feel like “enterprise” to mum-and-pop. Two levels (e.g. Normal / Rush) or optional is enough.
- **Requested vs Promised date** — Two dates add precision but also cognitive load; one “Delivery by” or “Need by” is often enough.
- **Order number** — Usually auto (`display_id`); manual override is optional and can stay hidden by default.
- **Order date** — Often “today”; optional field or auto.
- **Source location** — Important for multi-location; for single-location shops it can be hidden or defaulted.

### Low relevance for mum-and-pop

- **Assigned to** — **Copied to pick list** (who to assign the pick to). Can stay in "More options" or read view so pick list creation still receives it when set.
- **Payment terms on SO** — Used for **invoice due date** when creating from delivery (RPC). Often inherited from customer; optional on SO form but keep in data for downstream.

---

## 3. Grouping evaluation

**Current flow:** Status → Customer → Items → Ship To → Bill To → Priority & Dates → Notes → Metadata.

**Strengths**

- Logical sequence: who → what → where → when → notes.
- Customer before items matches “pick customer, then add items.”
- Addresses after items avoid blocking the main task (add products first).
- Single column and “customer address by default” are consistent and clear.

**Gaps for mum-and-pop**

- **Too many distinct sections** — Six main blocks (Customer, Items, Ship To, Bill To, Priority & Dates, Notes) can feel long; small businesses often want “customer, items, address, when, done.”
- **Two dates + priority** — Feels like “operations” rather than “when do they need it?”
- **Jargon** — “Ship To” / “Bill To” are correct but “Delivery address” and “Billing address” (or “Same as delivery”) are friendlier.
- **Hidden but saved fields** — Order number, order date, source location are in state and save but not editable in the form; either expose simply or document as system-managed.

---

## 4. Recommendations for mum-and-pop

### 4.1 Simplify “when” (Priority & Dates)

- **Option A (minimal):** One date only — e.g. **“Delivery by”** or **“Need by date”** (reuse requested or promised as the single field). Hide the other date in “More options” or remove from draft.
- **Option B:** One date + **two-level priority**: e.g. **Normal** vs **Rush** (map High/Urgent → Rush, Low/Normal → Normal). Hide Low/High/Urgent in settings or advanced.
- **Label:** Use **“When do they need it?”** and one date field; optional “Rush” checkbox or dropdown.

### 4.2 Simplify address labels and grouping

- **Labels:** Prefer **“Delivery address”** (Ship To) and **“Billing address”** (Bill To), with helper text: “Billing address: same as delivery unless you need an invoice sent elsewhere.”
- **Grouping:** Keep “Bill To” collapsible and default “Same as delivery”; no need for a separate “addresses” card — current split (Delivery → Billing) is fine.

### 4.3 Notes: one field vs two

- **Simple mode:** Single **“Notes”** field (store as internal, or as both internal and customer notes) to reduce choices.
- **Keep current as default:** Internal vs Customer notes for businesses that already use the split; add a settings toggle or “Simple form” that shows one Notes field.

### 4.4 Hide or auto-fill rarely used fields

- **Order number:** Show only system **display_id**; no manual order number in the main form (or under “More options”).
- **Order date:** Default to today; optional editable field in “More options” if needed.
- **Source location:** Show only when tenant has multiple locations; otherwise hide or default.

### 4.5 Progressive disclosure (“Simple” vs “Full” form)

- **Simple form (mum-and-pop default):**  
  Customer → Items → Delivery address (with “Billing same as delivery”) → **When do they need it?** (one date + optional Rush) → **Notes** (one field).  
  Submit / Save.
- **Full form (current):** All sections as today, with optional “Show more options” for Priority (full), second date (requested), order number/date, source location, assigned to (used by pick list).

### 4.6 Item entry

- Keep **search + barcode**; both are valuable for small shops.
- Optional: **Quick add** (e.g. type quantity next to recent/favourite items) for repeat orders.

---

## 5. Summary table (mum-and-pop focus)

| Area | Current | Suggested for mum-and-pop |
|------|---------|----------------------------|
| **Sections** | 6 main blocks | 4–5: Customer, Items, Delivery (+Billing same), When, Notes |
| **Dates** | Requested + Promised | One “Delivery by” or “Need by”; second date optional |
| **Priority** | 4 levels | 2 (Normal / Rush) or optional |
| **Address labels** | Ship To / Bill To | Delivery address / Billing address (+ “same as delivery”) |
| **Notes** | Internal + Customer | Option for single “Notes” field |
| **Order # / date / location** | Saved, not in form | Auto or “More options” only |
| **Grouping order** | Status → Customer → Items → Ship To → Bill To → Priority & Dates → Notes | Keep order; collapse “Priority & Dates” into one “When” block |

---

## 6. Implementation priority (suggested)

1. **Quick wins:** Rename “Ship To” → “Delivery address,” “Bill To” → “Billing address”; add “Same as delivery” if not already clear.
2. **Reduce “when”:** Single “Delivery by” date; optional “Rush” or two-level priority.
3. **Progressive disclosure:** Add “Simple” mode or “More options” and hide second date, full priority, order number/date/source location there.
4. **Optional:** One “Notes” field for simple mode; keep Internal/Customer split for full mode.

This keeps the current structure and data model intact while making the form feel more relevant and less overwhelming for mum-and-pop businesses.

---

## 7. Downstream checklist when changing the SO form

Before simplifying or removing any sales order field, check:

| If you change … | Ensure … |
|------------------|----------|
| **Ship To** | Still full address (name, lines, city, state, postal, country, phone); copied to **pick list** and **delivery order**. |
| **Bill To** | Still available (or "Same as delivery"); copied to **invoice** (from SO or from delivery). |
| **Dates** | The one visible "Delivery by" / "Need by" maps to **promised_date**; it is copied to **pick list**. requested_date can be hidden. |
| **Notes** | Any single "Notes" is stored as **internal_notes**; **createInvoiceFromSO** copies it to the new invoice. |
| **Assigned to** | If hidden in simple mode, keep in data so **pick list** creation can still receive it when set (e.g. from "More options"). |
| **Payment term** | Optional on form but keep in data; **create_invoice_from_delivery** uses it for invoice due date. |
| **Customer / Items** | No change; both are required and used by pick list, delivery order, and invoice. |
