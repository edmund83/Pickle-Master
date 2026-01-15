# Sales Order Implementation Plan

**Version:** 1.0
**Created:** January 2026
**Status:** Planning
**Owner:** Product Team

---

## Executive Summary

This document outlines the complete implementation plan for introducing **Sales Orders** to StockZip, including:
- **Customer Management** (mirroring vendor structure)
- **Sales Order Workflow** (mirroring purchase order patterns)
- **Pick List Integration** (auto-generation from sales orders)
- **Delivery Orders** (shipment tracking and proof of delivery)
- **Simple Invoicing** (invoice generation from delivered orders)

The design follows existing codebase patterns for consistency, security, and maintainability.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [Customer Management](#3-customer-management)
4. [Sales Order Workflow](#4-sales-order-workflow)
5. [Pick List Integration](#5-pick-list-integration)
6. [Delivery Order System](#6-delivery-order-system)
7. [Simple Invoicing](#7-simple-invoicing)
8. [Server Actions](#8-server-actions)
9. [UI/UX Design](#9-uiux-design)
10. [Navigation & Routing](#10-navigation--routing)
11. [Security & RLS](#11-security--rls)
12. [Activity Logging](#12-activity-logging)
13. [Implementation Phases](#13-implementation-phases)
14. [Migration Files](#14-migration-files)
15. [Audit Findings Integration](#15-audit-findings-integration)

---

## 1. Architecture Overview

### End-to-End Workflow

```
Customer → Sales Order → Pick List → Delivery Order → Invoice
    ↓           ↓            ↓             ↓            ↓
 Manage      Create       Auto-Gen      Ship &       Bill &
 Contacts    Order        Picking       Confirm      Record
```

### Complete Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CUSTOMERS  │────▶│SALES ORDERS │────▶│ PICK LISTS  │
│             │     │             │     │ (auto-gen)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                           │                    │
                           │                    ▼
                           │            ┌─────────────┐
                           │            │   PICKING   │
                           │            │  (fulfill)  │
                           │            └──────┬──────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  DELIVERY   │◀────│   PACKED    │
                    │   ORDERS    │     │   ITEMS     │
                    └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  DELIVERED  │────▶│  INVOICES   │
                    │  (confirm)  │     │  (simple)   │
                    └─────────────┘     └─────────────┘
```

### Relationship Diagram (ERD Summary)

```
customers (1) ──────────────> (*) sales_orders
                                    │
                                    ├──> (*) sales_order_items
                                    │           │
                                    │           └──> inventory_items
                                    │
                                    ├──> (1) pick_lists (auto-generated)
                                    │           │
                                    │           └──> pick_list_items
                                    │
                                    ├──> (*) delivery_orders
                                    │           │
                                    │           └──> delivery_order_items
                                    │
                                    └──> (*) invoices
                                                │
                                                └──> invoice_items
```

---

## 2. Database Schema

### 2.1 Customers Table

Mirrors the `vendors` table structure for consistency.

```sql
-- Migration: 00063_customers.sql

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    customer_code VARCHAR(50),  -- Optional customer reference code

    -- Contact
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),

    -- Billing address
    billing_address_line1 VARCHAR(500),
    billing_address_line2 VARCHAR(500),
    billing_city VARCHAR(255),
    billing_state VARCHAR(255),
    billing_postal_code VARCHAR(50),
    billing_country VARCHAR(100),

    -- Shipping address (default)
    shipping_address_line1 VARCHAR(500),
    shipping_address_line2 VARCHAR(500),
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(255),
    shipping_postal_code VARCHAR(50),
    shipping_country VARCHAR(100),
    shipping_same_as_billing BOOLEAN DEFAULT FALSE,

    -- Payment terms
    payment_term_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
    credit_limit DECIMAL(12, 2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,

    -- Audit
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_customer_name_per_tenant UNIQUE (tenant_id, name),
    CONSTRAINT unique_customer_code_per_tenant UNIQUE (tenant_id, customer_code)
);

-- Indexes for performance
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_tenant_name ON customers(tenant_id, name);
CREATE INDEX idx_customers_tenant_active ON customers(tenant_id, is_active);
```

### 2.2 Sales Orders Table

```sql
-- Migration: 00064_sales_orders.sql

-- Status enum for sales orders
CREATE TYPE sales_order_status AS ENUM (
    'draft',           -- Being created/edited
    'submitted',       -- Submitted for review
    'confirmed',       -- Confirmed, ready for fulfillment
    'picking',         -- Pick list created, picking in progress
    'picked',          -- All items picked, ready for shipping
    'partial_shipped', -- Some items shipped
    'shipped',         -- All items shipped
    'delivered',       -- All items delivered
    'completed',       -- Order fully completed (delivered + invoiced)
    'cancelled'        -- Order cancelled
);

CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identification
    display_id VARCHAR(25),  -- SO-ACM01-00001
    order_number VARCHAR(50),  -- Customer's PO number

    -- Customer reference
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,

    -- Status and workflow
    status sales_order_status NOT NULL DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent

    -- Dates
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    requested_date DATE,      -- Customer requested delivery date
    promised_date DATE,       -- Promised delivery date

    -- Shipping info (copied from customer, can be overridden)
    ship_to_name VARCHAR(255),
    ship_to_address1 VARCHAR(500),
    ship_to_address2 VARCHAR(500),
    ship_to_city VARCHAR(255),
    ship_to_state VARCHAR(255),
    ship_to_postal_code VARCHAR(50),
    ship_to_country VARCHAR(100),
    ship_to_phone VARCHAR(50),

    -- Billing info
    bill_to_name VARCHAR(255),
    bill_to_address1 VARCHAR(500),
    bill_to_address2 VARCHAR(500),
    bill_to_city VARCHAR(255),
    bill_to_state VARCHAR(255),
    bill_to_postal_code VARCHAR(50),
    bill_to_country VARCHAR(100),

    -- Financials
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    shipping_cost DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,

    -- Payment
    payment_term_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid',  -- unpaid, partial, paid

    -- Warehouse/fulfillment
    source_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- Notes
    internal_notes TEXT,
    customer_notes TEXT,

    -- Workflow tracking
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Assignment
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- Audit
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Link to pick list (optional, auto-generated)
    pick_list_id UUID REFERENCES pick_lists(id) ON DELETE SET NULL
);

-- Sales order items
CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,

    -- Item reference
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_name VARCHAR(500) NOT NULL,
    sku VARCHAR(100),

    -- Quantities
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_allocated INTEGER DEFAULT 0,  -- Reserved from inventory
    quantity_picked INTEGER DEFAULT 0,     -- Actually picked
    quantity_shipped INTEGER DEFAULT 0,    -- Shipped to customer
    quantity_delivered INTEGER DEFAULT 0,  -- Confirmed delivered
    quantity_invoiced INTEGER DEFAULT 0,   -- Invoiced

    -- Pricing
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    line_total DECIMAL(12, 2) DEFAULT 0,

    -- Lot/Serial requirements
    requires_lot BOOLEAN DEFAULT FALSE,
    requires_serial BOOLEAN DEFAULT FALSE,

    -- Notes
    notes TEXT,

    -- Sort order
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sales_orders_tenant ON sales_orders(tenant_id);
CREATE INDEX idx_sales_orders_tenant_status ON sales_orders(tenant_id, status);
CREATE INDEX idx_sales_orders_tenant_customer ON sales_orders(tenant_id, customer_id);
CREATE INDEX idx_sales_orders_tenant_date ON sales_orders(tenant_id, order_date DESC);
CREATE INDEX idx_sales_orders_display_id ON sales_orders(display_id);
CREATE INDEX idx_sales_order_items_order ON sales_order_items(sales_order_id);
CREATE INDEX idx_sales_order_items_item ON sales_order_items(item_id);
```

### 2.3 Delivery Orders Table

```sql
-- Migration: 00065_delivery_orders.sql

CREATE TYPE delivery_order_status AS ENUM (
    'draft',           -- Being prepared
    'ready',           -- Ready for dispatch
    'dispatched',      -- Left warehouse
    'in_transit',      -- On the way
    'delivered',       -- Confirmed delivered
    'partial',         -- Partially delivered
    'failed',          -- Delivery failed
    'returned',        -- Returned to warehouse
    'cancelled'        -- Cancelled
);

CREATE TABLE IF NOT EXISTS delivery_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identification
    display_id VARCHAR(25),  -- DO-ACM01-00001

    -- Source reference
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE RESTRICT,
    pick_list_id UUID REFERENCES pick_lists(id) ON DELETE SET NULL,

    -- Status
    status delivery_order_status NOT NULL DEFAULT 'draft',

    -- Shipping details
    carrier VARCHAR(255),
    tracking_number VARCHAR(255),
    shipping_method VARCHAR(100),

    -- Dates
    scheduled_date DATE,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    -- Delivery address (copied from SO, can be overridden)
    ship_to_name VARCHAR(255),
    ship_to_address1 VARCHAR(500),
    ship_to_address2 VARCHAR(500),
    ship_to_city VARCHAR(255),
    ship_to_state VARCHAR(255),
    ship_to_postal_code VARCHAR(50),
    ship_to_country VARCHAR(100),
    ship_to_phone VARCHAR(50),

    -- Delivery confirmation
    received_by VARCHAR(255),
    signature_url TEXT,
    delivery_photo_url TEXT,
    delivery_notes TEXT,

    -- Package info
    total_packages INTEGER DEFAULT 1,
    total_weight DECIMAL(10, 2),
    weight_unit VARCHAR(10) DEFAULT 'kg',

    -- Audit
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    dispatched_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    delivered_confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    notes TEXT
);

-- Delivery order items
CREATE TABLE IF NOT EXISTS delivery_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,

    -- Source reference
    sales_order_item_id UUID NOT NULL REFERENCES sales_order_items(id) ON DELETE RESTRICT,
    pick_list_item_id UUID REFERENCES pick_list_items(id) ON DELETE SET NULL,

    -- Item info
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_name VARCHAR(500) NOT NULL,
    sku VARCHAR(100),

    -- Quantities
    quantity_shipped INTEGER NOT NULL CHECK (quantity_shipped > 0),
    quantity_delivered INTEGER DEFAULT 0,

    -- Condition on delivery
    condition VARCHAR(50) DEFAULT 'good',  -- good, damaged, partial

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For lot/serial tracking on delivery
CREATE TABLE IF NOT EXISTS delivery_order_item_serials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_order_item_id UUID NOT NULL REFERENCES delivery_order_items(id) ON DELETE CASCADE,
    serial_number VARCHAR(255) NOT NULL,
    lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_delivery_orders_tenant ON delivery_orders(tenant_id);
CREATE INDEX idx_delivery_orders_tenant_status ON delivery_orders(tenant_id, status);
CREATE INDEX idx_delivery_orders_sales_order ON delivery_orders(sales_order_id);
CREATE INDEX idx_delivery_orders_display_id ON delivery_orders(display_id);
CREATE INDEX idx_delivery_order_items_do ON delivery_order_items(delivery_order_id);
```

### 2.4 Invoices Table

```sql
-- Migration: 00066_invoices.sql

CREATE TYPE invoice_status AS ENUM (
    'draft',       -- Being created
    'pending',     -- Awaiting approval/send
    'sent',        -- Sent to customer
    'partial',     -- Partially paid
    'paid',        -- Fully paid
    'overdue',     -- Past due date, unpaid
    'cancelled',   -- Cancelled
    'void'         -- Voided after sent
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identification
    display_id VARCHAR(25),  -- INV-ACM01-00001
    invoice_number VARCHAR(50),  -- Optional custom number

    -- Source references
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    delivery_order_id UUID REFERENCES delivery_orders(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

    -- Status
    status invoice_status NOT NULL DEFAULT 'draft',

    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,

    -- Billing address
    bill_to_name VARCHAR(255),
    bill_to_address1 VARCHAR(500),
    bill_to_address2 VARCHAR(500),
    bill_to_city VARCHAR(255),
    bill_to_state VARCHAR(255),
    bill_to_postal_code VARCHAR(50),
    bill_to_country VARCHAR(100),

    -- Financials
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    balance_due DECIMAL(12, 2) DEFAULT 0,

    -- Payment tracking
    payment_term_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
    last_payment_date DATE,

    -- Notes
    internal_notes TEXT,
    customer_notes TEXT,  -- Appears on invoice
    terms_and_conditions TEXT,

    -- Sent tracking
    sent_at TIMESTAMPTZ,
    sent_to_email VARCHAR(255),

    -- Audit
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Source reference
    sales_order_item_id UUID REFERENCES sales_order_items(id) ON DELETE SET NULL,
    delivery_order_item_id UUID REFERENCES delivery_order_items(id) ON DELETE SET NULL,

    -- Item info (denormalized for invoice permanence)
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_name VARCHAR(500) NOT NULL,
    sku VARCHAR(100),
    description TEXT,

    -- Quantities and pricing
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    line_total DECIMAL(12, 2) DEFAULT 0,

    -- Sort
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment records for invoice
CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Payment details
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),  -- cash, bank_transfer, card, check, other
    reference_number VARCHAR(100),

    notes TEXT,

    -- Audit
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_tenant_customer ON invoices(tenant_id, customer_id);
CREATE INDEX idx_invoices_sales_order ON invoices(sales_order_id);
CREATE INDEX idx_invoices_display_id ON invoices(display_id);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_payments_invoice ON invoice_payments(invoice_id);
```

---

## 3. Customer Management

### 3.1 Features

Following the vendor management pattern:

| Feature | Description |
|---------|-------------|
| **Customer List** | Paginated, searchable list with filters |
| **Quick Add** | Inline creation from sales order |
| **Full Edit** | Dialog with all fields |
| **Bulk Operations** | Multi-select delete, export |
| **Address Management** | Separate billing/shipping addresses |
| **Payment Terms** | Link to payment terms table |
| **Credit Limit** | Track credit limits per customer |
| **Activity History** | View all orders, invoices per customer |

### 3.2 UI Components

```
/app/(dashboard)/partners/customers/page.tsx          - Customer list
/components/settings/customers/CustomerFormDialog.tsx - Create/edit dialog
/components/settings/customers/CustomersDataTable.tsx - Data table
/components/settings/customers/index.ts              - Exports
```

### 3.3 Quick Actions from Sales Order

When creating a sales order:
1. User can search existing customers
2. User can quick-add a new customer inline (name + optional contact)
3. Full customer details editable later

---

## 4. Sales Order Workflow

### 4.1 Status State Machine

```typescript
const SO_STATUS_TRANSITIONS: Record<string, string[]> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['confirmed', 'draft', 'cancelled'],
    confirmed: ['picking', 'cancelled'],
    picking: ['picked', 'cancelled'],          // Pick list in progress
    picked: ['partial_shipped', 'shipped'],    // Ready for shipping
    partial_shipped: ['shipped', 'cancelled'], // Some items shipped
    shipped: ['delivered', 'partial'],         // In transit
    delivered: ['completed'],                  // All delivered
    completed: [],                             // Terminal state
    cancelled: ['draft'],                      // Can be revived to draft
}
```

### 4.2 Workflow Steps

```
1. CREATE (draft)
   └─ Select customer
   └─ Add line items (search inventory)
   └─ Set dates, addresses, notes

2. SUBMIT (submitted)
   └─ Validate: customer required, at least 1 item
   └─ Check inventory availability (warning only)
   └─ Record submitted_by, submitted_at

3. CONFIRM (confirmed)
   └─ Optional: manager approval
   └─ Record confirmed_by, confirmed_at
   └─ Lock order details

4. GENERATE PICK LIST (picking)
   └─ Auto-create pick_list with all items
   └─ Link sales_order.pick_list_id
   └─ Copy ship-to address to pick list

5. PICKING COMPLETE (picked)
   └─ Pick list completed triggers this
   └─ Verify quantities picked vs ordered

6. CREATE DELIVERY ORDER (partial_shipped / shipped)
   └─ Create delivery_order from pick list
   └─ Record carrier, tracking info
   └─ Update quantity_shipped on SO items

7. CONFIRM DELIVERY (delivered)
   └─ Update delivery_order status
   └─ Update quantity_delivered on SO items
   └─ Decrement inventory (if not done at pick)

8. GENERATE INVOICE (completed)
   └─ Create invoice from delivered quantities
   └─ Link to sales_order, delivery_order
   └─ Send to customer
```

### 4.3 Display ID Format

Using existing `generate_display_id()` pattern:

```sql
-- Add to generate_display_id function
WHEN 'sales_order' THEN 'SO'
WHEN 'delivery_order' THEN 'DO'
WHEN 'invoice' THEN 'INV'
```

Examples:
- Sales Order: `SO-ACM01-00001`
- Delivery Order: `DO-ACM01-00001`
- Invoice: `INV-ACM01-00001`

---

## 5. Pick List Integration

### 5.1 Auto-Generation Logic

When sales order transitions to `confirmed` → `picking`:

```sql
CREATE OR REPLACE FUNCTION generate_pick_list_from_sales_order(
    p_sales_order_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pick_list_id UUID;
    v_sales_order RECORD;
    v_display_id VARCHAR(25);
    v_tenant_id UUID;
BEGIN
    -- Get sales order
    SELECT * INTO v_sales_order
    FROM sales_orders
    WHERE id = p_sales_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sales order not found';
    END IF;

    v_tenant_id := v_sales_order.tenant_id;

    -- Generate display ID for pick list
    v_display_id := generate_display_id(v_tenant_id, 'pick_list');

    -- Create pick list
    INSERT INTO pick_lists (
        tenant_id,
        display_id,
        name,
        status,
        source_entity_type,
        source_entity_id,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        due_date,
        assigned_to,
        created_by,
        notes
    ) VALUES (
        v_tenant_id,
        v_display_id,
        'Pick for ' || v_sales_order.display_id,
        'pending',
        'sales_order',
        p_sales_order_id,
        v_sales_order.ship_to_name,
        v_sales_order.ship_to_address1,
        v_sales_order.ship_to_address2,
        v_sales_order.ship_to_city,
        v_sales_order.ship_to_state,
        v_sales_order.ship_to_postal_code,
        v_sales_order.ship_to_country,
        v_sales_order.promised_date,
        v_sales_order.assigned_to,
        auth.uid(),
        'Auto-generated from ' || v_sales_order.display_id
    )
    RETURNING id INTO v_pick_list_id;

    -- Add pick list items from sales order items
    INSERT INTO pick_list_items (
        pick_list_id,
        item_id,
        source_item_id,
        requested_quantity,
        notes
    )
    SELECT
        v_pick_list_id,
        soi.item_id,
        soi.id,  -- Reference back to sales_order_item
        soi.quantity_ordered - soi.quantity_picked,  -- Remaining to pick
        soi.notes
    FROM sales_order_items soi
    WHERE soi.sales_order_id = p_sales_order_id
      AND soi.item_id IS NOT NULL
      AND soi.quantity_ordered > soi.quantity_picked;

    -- Update sales order with pick list reference
    UPDATE sales_orders
    SET pick_list_id = v_pick_list_id,
        status = 'picking',
        updated_at = NOW()
    WHERE id = p_sales_order_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), 'pick_list', v_pick_list_id,
        v_display_id, 'create',
        jsonb_build_object(
            'source', 'sales_order',
            'sales_order_id', p_sales_order_id,
            'sales_order_display_id', v_sales_order.display_id
        )
    );

    RETURN v_pick_list_id;
END;
$$;
```

### 5.2 Pick List Updates to Sales Order

When pick list items are picked, update sales order:

```sql
-- Trigger after pick_list_items update
CREATE OR REPLACE FUNCTION sync_pick_to_sales_order()
RETURNS TRIGGER AS $$
DECLARE
    v_source_item_id UUID;
BEGIN
    -- Check if this pick list is linked to a sales order
    v_source_item_id := NEW.source_item_id;

    IF v_source_item_id IS NOT NULL THEN
        -- Update sales_order_item.quantity_picked
        UPDATE sales_order_items
        SET quantity_picked = NEW.picked_quantity,
            updated_at = NOW()
        WHERE id = v_source_item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Pick List Schema Addition

Add source tracking to pick_list_items:

```sql
-- Add to pick_list_items table
ALTER TABLE pick_list_items
ADD COLUMN source_item_id UUID,  -- Reference to sales_order_items.id
ADD COLUMN source_type VARCHAR(50);  -- 'sales_order', 'manual', etc.
```

---

## 6. Delivery Order System

### 6.1 Creation Flow

```
1. From completed pick list:
   └─ "Create Delivery Order" button
   └─ Pre-fills items from picked quantities
   └─ Enter carrier, tracking (optional)

2. Dispatch:
   └─ Mark as "dispatched"
   └─ Record dispatch time
   └─ Update SO status to "shipped" or "partial_shipped"

3. Delivery Confirmation:
   └─ Mark as "delivered"
   └─ Optional: photo, signature capture
   └─ Record received_by name
   └─ Update SO item quantities
```

### 6.2 RPC Functions

```sql
CREATE OR REPLACE FUNCTION create_delivery_order_from_pick_list(
    p_pick_list_id UUID,
    p_carrier VARCHAR DEFAULT NULL,
    p_tracking_number VARCHAR DEFAULT NULL,
    p_scheduled_date DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_delivery_order_id UUID;
    v_pick_list RECORD;
    v_sales_order RECORD;
    v_display_id VARCHAR(25);
    v_tenant_id UUID;
BEGIN
    -- Get pick list
    SELECT * INTO v_pick_list
    FROM pick_lists
    WHERE id = p_pick_list_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pick list not found';
    END IF;

    IF v_pick_list.status != 'completed' THEN
        RAISE EXCEPTION 'Pick list must be completed to create delivery order';
    END IF;

    v_tenant_id := v_pick_list.tenant_id;

    -- Get linked sales order
    SELECT * INTO v_sales_order
    FROM sales_orders
    WHERE pick_list_id = p_pick_list_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No sales order linked to this pick list';
    END IF;

    -- Generate display ID
    v_display_id := generate_display_id(v_tenant_id, 'delivery_order');

    -- Create delivery order
    INSERT INTO delivery_orders (
        tenant_id,
        display_id,
        sales_order_id,
        pick_list_id,
        status,
        carrier,
        tracking_number,
        scheduled_date,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        ship_to_phone,
        created_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        v_sales_order.id,
        p_pick_list_id,
        'draft',
        p_carrier,
        p_tracking_number,
        p_scheduled_date,
        v_sales_order.ship_to_name,
        v_sales_order.ship_to_address1,
        v_sales_order.ship_to_address2,
        v_sales_order.ship_to_city,
        v_sales_order.ship_to_state,
        v_sales_order.ship_to_postal_code,
        v_sales_order.ship_to_country,
        v_sales_order.ship_to_phone,
        auth.uid()
    )
    RETURNING id INTO v_delivery_order_id;

    -- Add delivery items from pick list
    INSERT INTO delivery_order_items (
        delivery_order_id,
        sales_order_item_id,
        pick_list_item_id,
        item_id,
        item_name,
        sku,
        quantity_shipped
    )
    SELECT
        v_delivery_order_id,
        pli.source_item_id,
        pli.id,
        pli.item_id,
        ii.name,
        ii.sku,
        pli.picked_quantity
    FROM pick_list_items pli
    JOIN inventory_items ii ON ii.id = pli.item_id
    WHERE pli.pick_list_id = p_pick_list_id
      AND pli.picked_quantity > 0;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), 'delivery_order', v_delivery_order_id,
        v_display_id, 'create',
        jsonb_build_object(
            'sales_order_id', v_sales_order.id,
            'pick_list_id', p_pick_list_id
        )
    );

    RETURN v_delivery_order_id;
END;
$$;

-- Dispatch delivery order
CREATE OR REPLACE FUNCTION dispatch_delivery_order(p_delivery_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_do RECORD;
    v_so RECORD;
    v_shipped_count INTEGER;
    v_total_count INTEGER;
BEGIN
    SELECT * INTO v_do FROM delivery_orders WHERE id = p_delivery_order_id;

    IF v_do.status != 'draft' AND v_do.status != 'ready' THEN
        RAISE EXCEPTION 'Delivery order must be draft or ready to dispatch';
    END IF;

    -- Update delivery order
    UPDATE delivery_orders
    SET status = 'dispatched',
        dispatched_at = NOW(),
        dispatched_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_delivery_order_id;

    -- Update sales order item quantities
    UPDATE sales_order_items soi
    SET quantity_shipped = quantity_shipped + doi.quantity_shipped,
        updated_at = NOW()
    FROM delivery_order_items doi
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.sales_order_item_id = soi.id;

    -- Check if all items shipped for the sales order
    SELECT * INTO v_so FROM sales_orders WHERE id = v_do.sales_order_id;

    SELECT
        COUNT(*) FILTER (WHERE quantity_shipped >= quantity_ordered),
        COUNT(*)
    INTO v_shipped_count, v_total_count
    FROM sales_order_items
    WHERE sales_order_id = v_do.sales_order_id;

    -- Update sales order status
    IF v_shipped_count = v_total_count THEN
        UPDATE sales_orders SET status = 'shipped', updated_at = NOW()
        WHERE id = v_do.sales_order_id;
    ELSE
        UPDATE sales_orders SET status = 'partial_shipped', updated_at = NOW()
        WHERE id = v_do.sales_order_id;
    END IF;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type
    ) VALUES (
        v_do.tenant_id, auth.uid(), 'delivery_order', p_delivery_order_id,
        v_do.display_id, 'dispatch'
    );
END;
$$;

-- Confirm delivery
CREATE OR REPLACE FUNCTION confirm_delivery(
    p_delivery_order_id UUID,
    p_received_by VARCHAR DEFAULT NULL,
    p_delivery_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_do RECORD;
    v_delivered_count INTEGER;
    v_total_count INTEGER;
BEGIN
    SELECT * INTO v_do FROM delivery_orders WHERE id = p_delivery_order_id;

    IF v_do.status != 'dispatched' AND v_do.status != 'in_transit' THEN
        RAISE EXCEPTION 'Delivery order must be dispatched to confirm delivery';
    END IF;

    -- Update delivery order
    UPDATE delivery_orders
    SET status = 'delivered',
        delivered_at = NOW(),
        delivered_confirmed_by = auth.uid(),
        received_by = COALESCE(p_received_by, received_by),
        delivery_notes = COALESCE(p_delivery_notes, delivery_notes),
        updated_at = NOW()
    WHERE id = p_delivery_order_id;

    -- Update delivery items to delivered
    UPDATE delivery_order_items
    SET quantity_delivered = quantity_shipped
    WHERE delivery_order_id = p_delivery_order_id;

    -- Update sales order item quantities
    UPDATE sales_order_items soi
    SET quantity_delivered = quantity_delivered + doi.quantity_shipped,
        updated_at = NOW()
    FROM delivery_order_items doi
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.sales_order_item_id = soi.id;

    -- Check if all items delivered for the sales order
    SELECT
        COUNT(*) FILTER (WHERE quantity_delivered >= quantity_ordered),
        COUNT(*)
    INTO v_delivered_count, v_total_count
    FROM sales_order_items
    WHERE sales_order_id = v_do.sales_order_id;

    -- Update sales order status
    IF v_delivered_count = v_total_count THEN
        UPDATE sales_orders SET status = 'delivered', updated_at = NOW()
        WHERE id = v_do.sales_order_id;
    END IF;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type, changes
    ) VALUES (
        v_do.tenant_id, auth.uid(), 'delivery_order', p_delivery_order_id,
        v_do.display_id, 'deliver',
        jsonb_build_object('received_by', p_received_by)
    );
END;
$$;
```

---

## 7. Simple Invoicing

### 7.1 Invoice Generation

Simple invoicing means:
- Auto-generate from delivered orders
- Basic line items with quantities and prices
- Track payments (single or multiple)
- Print/export as PDF
- Email to customer (optional)

### 7.2 RPC Function

```sql
CREATE OR REPLACE FUNCTION create_invoice_from_delivery(
    p_delivery_order_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice_id UUID;
    v_do RECORD;
    v_so RECORD;
    v_customer RECORD;
    v_display_id VARCHAR(25);
    v_due_date DATE;
    v_subtotal DECIMAL(12,2);
    v_tax_amount DECIMAL(12,2);
    v_total DECIMAL(12,2);
BEGIN
    -- Get delivery order
    SELECT * INTO v_do FROM delivery_orders WHERE id = p_delivery_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    IF v_do.status != 'delivered' THEN
        RAISE EXCEPTION 'Delivery order must be delivered to create invoice';
    END IF;

    -- Get sales order
    SELECT * INTO v_so FROM sales_orders WHERE id = v_do.sales_order_id;

    -- Get customer
    SELECT * INTO v_customer FROM customers WHERE id = v_so.customer_id;

    -- Generate display ID
    v_display_id := generate_display_id(v_do.tenant_id, 'invoice');

    -- Calculate due date from payment terms
    SELECT CURRENT_DATE + COALESCE(pt.days, 30)
    INTO v_due_date
    FROM payment_terms pt
    WHERE pt.id = COALESCE(v_so.payment_term_id, v_customer.payment_term_id);

    IF v_due_date IS NULL THEN
        v_due_date := CURRENT_DATE + 30;  -- Default 30 days
    END IF;

    -- Create invoice
    INSERT INTO invoices (
        tenant_id,
        display_id,
        sales_order_id,
        delivery_order_id,
        customer_id,
        status,
        invoice_date,
        due_date,
        bill_to_name,
        bill_to_address1,
        bill_to_address2,
        bill_to_city,
        bill_to_state,
        bill_to_postal_code,
        bill_to_country,
        payment_term_id,
        created_by
    ) VALUES (
        v_do.tenant_id,
        v_display_id,
        v_do.sales_order_id,
        p_delivery_order_id,
        v_so.customer_id,
        'draft',
        CURRENT_DATE,
        v_due_date,
        COALESCE(v_so.bill_to_name, v_customer.name),
        COALESCE(v_so.bill_to_address1, v_customer.billing_address_line1),
        COALESCE(v_so.bill_to_address2, v_customer.billing_address_line2),
        COALESCE(v_so.bill_to_city, v_customer.billing_city),
        COALESCE(v_so.bill_to_state, v_customer.billing_state),
        COALESCE(v_so.bill_to_postal_code, v_customer.billing_postal_code),
        COALESCE(v_so.bill_to_country, v_customer.billing_country),
        COALESCE(v_so.payment_term_id, v_customer.payment_term_id),
        auth.uid()
    )
    RETURNING id INTO v_invoice_id;

    -- Add invoice items from delivery
    INSERT INTO invoice_items (
        invoice_id,
        sales_order_item_id,
        delivery_order_item_id,
        item_id,
        item_name,
        sku,
        quantity,
        unit_price,
        discount_percent,
        tax_rate,
        line_total
    )
    SELECT
        v_invoice_id,
        doi.sales_order_item_id,
        doi.id,
        doi.item_id,
        doi.item_name,
        doi.sku,
        doi.quantity_delivered,
        soi.unit_price,
        soi.discount_percent,
        soi.tax_rate,
        (doi.quantity_delivered * soi.unit_price * (1 - COALESCE(soi.discount_percent, 0) / 100))
    FROM delivery_order_items doi
    JOIN sales_order_items soi ON soi.id = doi.sales_order_item_id
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.quantity_delivered > 0;

    -- Calculate totals
    SELECT
        SUM(line_total),
        SUM(line_total * COALESCE(tax_rate, 0) / 100),
        SUM(line_total * (1 + COALESCE(tax_rate, 0) / 100))
    INTO v_subtotal, v_tax_amount, v_total
    FROM invoice_items
    WHERE invoice_id = v_invoice_id;

    -- Update invoice totals
    UPDATE invoices
    SET subtotal = COALESCE(v_subtotal, 0),
        tax_amount = COALESCE(v_tax_amount, 0),
        total = COALESCE(v_total, 0),
        balance_due = COALESCE(v_total, 0),
        updated_at = NOW()
    WHERE id = v_invoice_id;

    -- Update sales order items with invoiced quantities
    UPDATE sales_order_items soi
    SET quantity_invoiced = quantity_invoiced + doi.quantity_delivered,
        updated_at = NOW()
    FROM delivery_order_items doi
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.sales_order_item_id = soi.id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type, changes
    ) VALUES (
        v_do.tenant_id, auth.uid(), 'invoice', v_invoice_id,
        v_display_id, 'create',
        jsonb_build_object(
            'delivery_order_id', p_delivery_order_id,
            'sales_order_id', v_do.sales_order_id,
            'total', v_total
        )
    );

    RETURN v_invoice_id;
END;
$$;

-- Record payment
CREATE OR REPLACE FUNCTION record_invoice_payment(
    p_invoice_id UUID,
    p_amount DECIMAL(12,2),
    p_payment_method VARCHAR DEFAULT NULL,
    p_reference_number VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment_id UUID;
    v_invoice RECORD;
    v_new_balance DECIMAL(12,2);
BEGIN
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;

    IF v_invoice.status IN ('cancelled', 'void') THEN
        RAISE EXCEPTION 'Cannot record payment on cancelled/void invoice';
    END IF;

    -- Create payment record
    INSERT INTO invoice_payments (
        invoice_id,
        tenant_id,
        amount,
        payment_date,
        payment_method,
        reference_number,
        notes,
        recorded_by
    ) VALUES (
        p_invoice_id,
        v_invoice.tenant_id,
        p_amount,
        CURRENT_DATE,
        p_payment_method,
        p_reference_number,
        p_notes,
        auth.uid()
    )
    RETURNING id INTO v_payment_id;

    -- Update invoice
    v_new_balance := v_invoice.balance_due - p_amount;

    UPDATE invoices
    SET amount_paid = amount_paid + p_amount,
        balance_due = v_new_balance,
        last_payment_date = CURRENT_DATE,
        status = CASE
            WHEN v_new_balance <= 0 THEN 'paid'::invoice_status
            WHEN amount_paid + p_amount > 0 THEN 'partial'::invoice_status
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    -- If fully paid, complete the sales order
    IF v_new_balance <= 0 THEN
        UPDATE sales_orders
        SET status = 'completed',
            payment_status = 'paid',
            updated_at = NOW()
        WHERE id = v_invoice.sales_order_id
          AND status = 'delivered';
    END IF;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type, changes
    ) VALUES (
        v_invoice.tenant_id, auth.uid(), 'invoice', p_invoice_id,
        v_invoice.display_id, 'payment',
        jsonb_build_object(
            'amount', p_amount,
            'method', p_payment_method,
            'new_balance', v_new_balance
        )
    );

    RETURN v_payment_id;
END;
$$;
```

---

## 8. Server Actions

### 8.1 File Structure

```
/app/actions/
├── customers.ts          -- Customer CRUD
├── sales-orders.ts       -- Sales order CRUD + workflow
├── delivery-orders.ts    -- Delivery order operations
└── invoices.ts          -- Invoice operations
```

### 8.2 Sales Orders Actions

```typescript
// app/actions/sales-orders.ts

'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Validation schemas
const optionalUuidSchema = z.string().uuid().nullable().optional()
const optionalStringSchema = z.string().max(500).nullable().optional()
const optionalDateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional()
const quantitySchema = z.number().int().positive().max(999999)
const priceSchema = z.number().min(0).max(999999999)

const salesOrderItemSchema = z.object({
    item_id: optionalUuidSchema,
    item_name: z.string().min(1).max(255),
    sku: optionalStringSchema,
    quantity_ordered: quantitySchema,
    unit_price: priceSchema,
    discount_percent: z.number().min(0).max(100).optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    notes: z.string().max(2000).nullable().optional(),
})

const createSalesOrderSchema = z.object({
    customer_id: optionalUuidSchema,
    order_number: optionalStringSchema,
    order_date: optionalDateStringSchema,
    requested_date: optionalDateStringSchema,
    promised_date: optionalDateStringSchema,
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    ship_to_name: optionalStringSchema,
    ship_to_address1: optionalStringSchema,
    ship_to_address2: optionalStringSchema,
    ship_to_city: optionalStringSchema,
    ship_to_state: optionalStringSchema,
    ship_to_postal_code: optionalStringSchema,
    ship_to_country: optionalStringSchema,
    ship_to_phone: optionalStringSchema,
    bill_to_name: optionalStringSchema,
    bill_to_address1: optionalStringSchema,
    source_location_id: optionalUuidSchema,
    internal_notes: z.string().max(2000).nullable().optional(),
    customer_notes: z.string().max(2000).nullable().optional(),
    items: z.array(salesOrderItemSchema).optional(),
})

// Status transitions
const SO_STATUS_TRANSITIONS: Record<string, string[]> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['confirmed', 'draft', 'cancelled'],
    confirmed: ['picking', 'cancelled'],
    picking: ['picked', 'cancelled'],
    picked: ['partial_shipped', 'shipped'],
    partial_shipped: ['shipped', 'cancelled'],
    shipped: ['delivered', 'partial'],
    delivered: ['completed'],
    completed: [],
    cancelled: ['draft'],
}

export async function createSalesOrder(input: z.infer<typeof createSalesOrderSchema>) {
    const supabase = await createClient()

    // Validate input
    const validated = createSalesOrderSchema.parse(input)

    // Get current user's tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) throw new Error('No tenant found')

    // Create via RPC for atomic display_id generation
    const { data, error } = await supabase.rpc('create_sales_order', {
        p_customer_id: validated.customer_id,
        p_order_number: validated.order_number,
        p_order_date: validated.order_date,
        p_requested_date: validated.requested_date,
        p_promised_date: validated.promised_date,
        p_priority: validated.priority || 'normal',
        p_ship_to_name: validated.ship_to_name,
        p_ship_to_address1: validated.ship_to_address1,
        p_ship_to_address2: validated.ship_to_address2,
        p_ship_to_city: validated.ship_to_city,
        p_ship_to_state: validated.ship_to_state,
        p_ship_to_postal_code: validated.ship_to_postal_code,
        p_ship_to_country: validated.ship_to_country,
        p_ship_to_phone: validated.ship_to_phone,
        p_source_location_id: validated.source_location_id,
        p_internal_notes: validated.internal_notes,
        p_customer_notes: validated.customer_notes,
    })

    if (error) throw new Error(error.message)

    // Add items if provided
    if (validated.items && validated.items.length > 0) {
        for (const item of validated.items) {
            await addSalesOrderItem(data.id, item)
        }
    }

    revalidatePath('/tasks/sales-orders')
    return { id: data.id, display_id: data.display_id }
}

export async function updateSalesOrderStatus(
    soId: string,
    newStatus: string
) {
    const supabase = await createClient()

    // Get current status
    const { data: so, error: fetchError } = await supabase
        .from('sales_orders')
        .select('status, tenant_id, display_id')
        .eq('id', soId)
        .single()

    if (fetchError || !so) throw new Error('Sales order not found')

    // Verify tenant ownership
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (profile?.tenant_id !== so.tenant_id) {
        throw new Error('Access denied')
    }

    // Validate transition
    const allowedTransitions = SO_STATUS_TRANSITIONS[so.status] || []
    if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`Cannot transition from ${so.status} to ${newStatus}`)
    }

    // Handle special transitions
    if (newStatus === 'picking') {
        // Auto-generate pick list
        const { data, error } = await supabase.rpc('generate_pick_list_from_sales_order', {
            p_sales_order_id: soId,
        })
        if (error) throw new Error(error.message)

        revalidatePath('/tasks/sales-orders')
        revalidatePath('/tasks/pick-lists')
        return { pickListId: data }
    }

    // Standard status update
    const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
    }

    // Add tracking fields
    if (newStatus === 'submitted') {
        updateData.submitted_by = user.id
        updateData.submitted_at = new Date().toISOString()
    } else if (newStatus === 'confirmed') {
        updateData.confirmed_by = user.id
        updateData.confirmed_at = new Date().toISOString()
    } else if (newStatus === 'cancelled') {
        updateData.cancelled_by = user.id
        updateData.cancelled_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
        .from('sales_orders')
        .update(updateData)
        .eq('id', soId)
        .eq('tenant_id', so.tenant_id)  // Defense in depth

    if (updateError) throw new Error(updateError.message)

    // Log activity
    await supabase.from('activity_logs').insert({
        tenant_id: so.tenant_id,
        user_id: user.id,
        entity_type: 'sales_order',
        entity_id: soId,
        entity_name: so.display_id,
        action_type: 'status_change',
        changes: { from: so.status, to: newStatus },
    })

    revalidatePath('/tasks/sales-orders')
    revalidatePath(`/tasks/sales-orders/${soId}`)
}

export async function addSalesOrderItem(
    soId: string,
    item: z.infer<typeof salesOrderItemSchema>
) {
    const supabase = await createClient()
    const validated = salesOrderItemSchema.parse(item)

    // Calculate line total
    const baseAmount = validated.quantity_ordered * validated.unit_price
    const discountAmount = baseAmount * (validated.discount_percent || 0) / 100
    const lineTotal = baseAmount - discountAmount

    const { data, error } = await supabase
        .from('sales_order_items')
        .insert({
            sales_order_id: soId,
            item_id: validated.item_id,
            item_name: validated.item_name,
            sku: validated.sku,
            quantity_ordered: validated.quantity_ordered,
            unit_price: validated.unit_price,
            discount_percent: validated.discount_percent || 0,
            discount_amount: discountAmount,
            tax_rate: validated.tax_rate || 0,
            line_total: lineTotal,
            notes: validated.notes,
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    // Recalculate SO totals
    await recalculateSalesOrderTotals(soId)

    revalidatePath(`/tasks/sales-orders/${soId}`)
    return data
}

async function recalculateSalesOrderTotals(soId: string) {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('sales_order_items')
        .select('line_total, tax_rate')
        .eq('sales_order_id', soId)

    if (!items) return

    const subtotal = items.reduce((sum, i) => sum + Number(i.line_total), 0)
    const taxAmount = items.reduce((sum, i) =>
        sum + Number(i.line_total) * Number(i.tax_rate) / 100, 0
    )
    const total = subtotal + taxAmount

    await supabase
        .from('sales_orders')
        .update({
            subtotal,
            tax_amount: taxAmount,
            total,
            updated_at: new Date().toISOString(),
        })
        .eq('id', soId)
}

// ... more actions: updateSalesOrder, deleteSalesOrder, etc.
```

---

## 9. UI/UX Design

### 9.1 Design Principles (Per CLAUDE.md)

1. **Mobile-first, accessible** - Large touch targets, keyboard support
2. **Use components/ui/** - Button, Input, Card, DropdownMenu, etc.
3. **Theme tokens** - primary, neutral-*, red-*, etc.
4. **Consistent sizing** - Input h-10, rounded-lg controls, rounded-2xl cards
5. **Use cn()** from lib/utils for class composition

### 9.2 Page Layouts

#### Sales Order List

```
┌──────────────────────────────────────────────────────────┐
│  Sales Orders                           [+ New Order]    │
│  Manage customer orders and fulfillment                  │
├──────────────────────────────────────────────────────────┤
│  [Search...] [Status ▾] [Customer ▾] [Date Range ▾]      │
├──────────────────────────────────────────────────────────┤
│  ☐ SO-ACM01-00001  Acme Corp       $1,250.00  Confirmed  │
│  ☐ SO-ACM01-00002  Beta Inc        $3,500.00  Picking    │
│  ☐ SO-ACM01-00003  Gamma LLC       $890.00    Draft      │
│                                                          │
│  [Pagination: < 1 2 3 ... 10 >]                         │
└──────────────────────────────────────────────────────────┘
```

#### Sales Order Detail

```
┌──────────────────────────────────────────────────────────┐
│  ← Back    SO-ACM01-00001               [Submit] [⋮]     │
│            Acme Corporation                              │
│            ● Draft    Created Jan 14, 2026              │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────┐                │
│ │ Customer        │  │ Ship To         │                │
│ │ Acme Corp       │  │ 123 Main St     │                │
│ │ john@acme.com   │  │ New York, NY    │                │
│ └─────────────────┘  └─────────────────┘                │
├──────────────────────────────────────────────────────────┤
│  ORDER ITEMS                              [+ Add Item]   │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Widget A         SKU-001   10 × $50.00    $500.00  │ │
│  │ Gadget B         SKU-002    5 × $150.00   $750.00  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│                              Subtotal:     $1,250.00    │
│                              Tax (10%):      $125.00    │
│                              Total:        $1,375.00    │
├──────────────────────────────────────────────────────────┤
│  ACTIVITY / CHATTER                                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ John created this order                   2h ago   │ │
│  │ Added Widget A (10 units)                 2h ago   │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 9.3 Component Hierarchy

```
SalesOrderDetailClient
├── SalesOrderHeader (status, actions)
├── CustomerSection (customer card, ship-to, bill-to)
├── ItemsSection
│   ├── SalesOrderItemRow (per item)
│   └── AddItemDialog
├── TotalsSection
├── NotesSection
├── ChatterSection (activity + comments)
└── StatusWorkflowBar (fixed bottom on mobile)
```

---

## 10. Navigation & Routing

### 10.1 Route Structure

```
/app/(dashboard)/
├── tasks/
│   └── fulfillment/
│       └── page.tsx                    -- Add Sales Orders link
│
├── tasks/
│   └── sales-orders/
│       ├── page.tsx                    -- Sales order list
│       └── [id]/
│           ├── page.tsx                -- Detail (server)
│           └── SalesOrderDetailClient.tsx
│
├── tasks/
│   └── delivery-orders/
│       ├── page.tsx                    -- Delivery order list
│       └── [id]/
│           ├── page.tsx
│           └── DeliveryOrderDetailClient.tsx
│
├── tasks/
│   └── invoices/
│       ├── page.tsx                    -- Invoice list
│       └── [id]/
│           ├── page.tsx
│           └── InvoiceDetailClient.tsx
│
└── partners/
    └── customers/
        └── page.tsx                    -- Customer list (like vendors)
```

### 10.2 Fulfillment Page Update

Add to `/app/(dashboard)/tasks/fulfillment/page.tsx`:

```typescript
const tasks = [
  {
    href: '/tasks/sales-orders',
    title: 'Sales Orders',
    description: 'Manage customer orders',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    href: '/tasks/pick-lists',
    title: 'Pick Lists',
    description: 'Create and manage picking lists',
    icon: ClipboardList,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/tasks/delivery-orders',
    title: 'Delivery Orders',
    description: 'Track shipments and deliveries',
    icon: Truck,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    href: '/tasks/invoices',
    title: 'Invoices',
    description: 'Generate and manage invoices',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
]
```

### 10.3 Partners Submenu

Add Customers alongside Vendors in Partners:

```
Partners/
├── Vendors       -- Existing
└── Customers     -- New
```

---

## 11. Security & RLS

### 11.1 RLS Policies (Following Audit Findings)

Every table gets tenant-scoped policies:

```sql
-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_tenant_isolation ON customers
    FOR ALL
    USING (tenant_id = get_user_tenant_id())
    WITH CHECK (tenant_id = get_user_tenant_id());

-- Sales Orders
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY sales_orders_tenant_isolation ON sales_orders
    FOR ALL
    USING (tenant_id = get_user_tenant_id())
    WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY sales_order_items_via_parent ON sales_order_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
    );

-- Similar policies for delivery_orders, invoices, etc.
```

### 11.2 Server Action Security (Defense in Depth)

All server actions:
1. Verify user authentication
2. Verify tenant ownership
3. Validate status transitions
4. Log all changes

```typescript
// Always include in server actions:
async function verifyTenantAccess(entityId: string, tableName: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    const { data: entity } = await supabase
        .from(tableName)
        .select('tenant_id')
        .eq('id', entityId)
        .single()

    if (!entity || entity.tenant_id !== profile?.tenant_id) {
        throw new Error('Access denied')
    }

    return { userId: user.id, tenantId: profile.tenant_id }
}
```

---

## 12. Activity Logging

### 12.1 Logged Events

| Entity | Action Types |
|--------|-------------|
| Customer | create, update, delete |
| Sales Order | create, update, status_change, delete |
| SO Item | add, update, remove |
| Delivery Order | create, dispatch, deliver, cancel |
| Invoice | create, send, payment, void |

### 12.2 Chatter Entity Types

Add to `chatter_entity_type` enum:

```sql
ALTER TYPE chatter_entity_type ADD VALUE 'sales_order';
ALTER TYPE chatter_entity_type ADD VALUE 'delivery_order';
ALTER TYPE chatter_entity_type ADD VALUE 'invoice';
ALTER TYPE chatter_entity_type ADD VALUE 'customer';
```

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1)

1. **Database Migrations**
   - [ ] 00063_customers.sql
   - [ ] 00064_sales_orders.sql
   - [ ] Update entity_sequence_counters for new types
   - [ ] RLS policies

2. **Customer Management**
   - [ ] Customer CRUD server actions
   - [ ] Customer list page
   - [ ] Customer form dialog
   - [ ] Customer data table

3. **Sales Order Basics**
   - [ ] Sales order CRUD server actions
   - [ ] Create sales order page
   - [ ] Sales order list page
   - [ ] Basic detail page

### Phase 2: Sales Order Workflow (Week 2)

4. **Sales Order Detail**
   - [ ] Full detail client component
   - [ ] Item management (add, edit, remove)
   - [ ] Address editing
   - [ ] Status workflow transitions

5. **Pick List Integration**
   - [ ] generate_pick_list_from_sales_order RPC
   - [ ] Add source tracking to pick_list_items
   - [ ] Sync picked quantities back to SO
   - [ ] UI for "Generate Pick List" action

### Phase 3: Delivery & Invoice (Week 3)

6. **Delivery Orders**
   - [ ] 00065_delivery_orders.sql migration
   - [ ] Delivery order server actions
   - [ ] Create from pick list
   - [ ] Dispatch workflow
   - [ ] Delivery confirmation

7. **Simple Invoicing**
   - [ ] 00066_invoices.sql migration
   - [ ] Invoice server actions
   - [ ] Create from delivery
   - [ ] Payment recording
   - [ ] Invoice list and detail pages

### Phase 4: Polish (Week 4)

8. **Integration & Testing**
   - [ ] End-to-end workflow testing
   - [ ] Mobile responsiveness
   - [ ] Keyboard navigation
   - [ ] Error handling
   - [ ] Loading states

9. **Documentation**
   - [ ] Update PRD.md
   - [ ] Update CHANGELOG.md
   - [ ] Generate TypeScript types

---

## 14. Migration Files

### Migration Index

| File | Description |
|------|-------------|
| 00063_customers.sql | Customer table and indexes |
| 00064_sales_orders.sql | Sales orders, items, status enum |
| 00065_delivery_orders.sql | Delivery orders, items, serials |
| 00066_invoices.sql | Invoices, items, payments |
| 00067_sales_order_rpcs.sql | RPC functions for SO workflow |
| 00068_sales_order_rls.sql | RLS policies for all new tables |
| 00069_update_display_id.sql | Add SO/DO/INV to display_id function |
| 00070_update_chatter_types.sql | Add new entity types to chatter |

---

## 15. Audit Findings Integration

Based on the Tasks Workflow Audit, this implementation addresses:

| Finding | How Addressed |
|---------|--------------|
| Weak tenant scoping | Explicit tenant_id checks in all server actions |
| No mutation-level permission checks | Role validation before destructive actions |
| Missing validation | Zod schemas for all inputs |
| Client-trusted values | Quantity limits enforced server-side |
| Status workflow gaps | Strict state machine with validation |
| No audit trail | Activity logs for all state changes |
| Client-side data pulls | Server-side pagination and filtering |

### Specific Improvements

1. **Server actions always verify tenant ownership**
   ```typescript
   // Every action includes:
   if (profile?.tenant_id !== entity.tenant_id) {
       throw new Error('Access denied')
   }
   ```

2. **Status transitions enforced server-side**
   ```typescript
   const allowedTransitions = SO_STATUS_TRANSITIONS[currentStatus]
   if (!allowedTransitions.includes(newStatus)) {
       throw new Error('Invalid transition')
   }
   ```

3. **All mutations logged**
   ```typescript
   await supabase.from('activity_logs').insert({
       entity_type: 'sales_order',
       action_type: 'status_change',
       changes: { from, to }
   })
   ```

4. **Server-side pagination**
   ```typescript
   const { data, count } = await supabase
       .from('sales_orders')
       .select('*', { count: 'exact' })
       .eq('tenant_id', tenantId)
       .range(offset, offset + limit - 1)
       .order('created_at', { ascending: false })
   ```

---

## Appendix: Quick Reference

### Display ID Formats

| Entity | Prefix | Example |
|--------|--------|---------|
| Sales Order | SO | SO-ACM01-00001 |
| Delivery Order | DO | DO-ACM01-00001 |
| Invoice | INV | INV-ACM01-00001 |
| Pick List | PL | PL-ACM01-00001 (existing) |
| Receive | RCV | RCV-ACM01-00001 (existing) |
| Purchase Order | PO | PO-ACM01-00001 (existing) |

### Status Flows

**Sales Order:**
```
draft → submitted → confirmed → picking → picked → shipped → delivered → completed
                                    ↓ (partial)
                            partial_shipped ─────┘
```

**Delivery Order:**
```
draft → ready → dispatched → in_transit → delivered
                    ↓ (failed)
               failed/returned
```

**Invoice:**
```
draft → pending → sent → partial → paid
                   ↓
               overdue
```

---

*Document maintained by Product Team. For questions, contact the product owner.*
