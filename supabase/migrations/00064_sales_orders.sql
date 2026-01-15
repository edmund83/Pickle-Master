-- Migration: 00064_sales_orders.sql
-- Description: Sales orders and sales order items tables

-- ============================================================================
-- SALES ORDER STATUS ENUM
-- ============================================================================

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

-- ============================================================================
-- SALES ORDERS TABLE
-- ============================================================================

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

-- ============================================================================
-- SALES ORDER ITEMS TABLE
-- ============================================================================

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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_sales_orders_tenant ON sales_orders(tenant_id);
CREATE INDEX idx_sales_orders_tenant_status ON sales_orders(tenant_id, status);
CREATE INDEX idx_sales_orders_tenant_customer ON sales_orders(tenant_id, customer_id);
CREATE INDEX idx_sales_orders_tenant_date ON sales_orders(tenant_id, order_date DESC);
CREATE INDEX idx_sales_orders_tenant_created ON sales_orders(tenant_id, created_at DESC);
CREATE INDEX idx_sales_orders_display_id ON sales_orders(display_id);
CREATE INDEX idx_sales_orders_pick_list ON sales_orders(pick_list_id) WHERE pick_list_id IS NOT NULL;
CREATE INDEX idx_sales_orders_assigned ON sales_orders(tenant_id, assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX idx_sales_order_items_order ON sales_order_items(sales_order_id);
CREATE INDEX idx_sales_order_items_item ON sales_order_items(item_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

-- Sales orders tenant isolation
CREATE POLICY sales_orders_tenant_isolation ON sales_orders
    FOR ALL
    USING (tenant_id = get_user_tenant_id())
    WITH CHECK (tenant_id = get_user_tenant_id());

-- Sales order items via parent
CREATE POLICY sales_order_items_via_parent ON sales_order_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_sales_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sales_orders_updated_at
    BEFORE UPDATE ON sales_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_orders_updated_at();

CREATE TRIGGER trigger_sales_order_items_updated_at
    BEFORE UPDATE ON sales_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_orders_updated_at();

-- ============================================================================
-- ACTIVITY LOGGING TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION log_sales_order_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type TEXT;
    v_changes JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action_type := 'create';
        v_changes := jsonb_build_object(
            'display_id', NEW.display_id,
            'customer_id', NEW.customer_id,
            'status', NEW.status
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if it's a status change
        IF OLD.status != NEW.status THEN
            v_action_type := 'status_change';
            v_changes := jsonb_build_object(
                'from', OLD.status,
                'to', NEW.status
            );
        ELSE
            v_action_type := 'update';
            v_changes := '{}'::jsonb;

            IF OLD.customer_id IS DISTINCT FROM NEW.customer_id THEN
                v_changes := v_changes || jsonb_build_object('customer_id', jsonb_build_object('from', OLD.customer_id, 'to', NEW.customer_id));
            END IF;
            IF OLD.total IS DISTINCT FROM NEW.total THEN
                v_changes := v_changes || jsonb_build_object('total', jsonb_build_object('from', OLD.total, 'to', NEW.total));
            END IF;
            IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
                v_changes := v_changes || jsonb_build_object('assigned_to', jsonb_build_object('from', OLD.assigned_to, 'to', NEW.assigned_to));
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_action_type := 'delete';
        v_changes := jsonb_build_object('display_id', OLD.display_id);
    END IF;

    -- Only log if there are changes
    IF v_changes IS NOT NULL AND v_changes != '{}'::jsonb THEN
        INSERT INTO activity_logs (
            tenant_id,
            user_id,
            entity_type,
            entity_id,
            entity_name,
            action_type,
            changes
        ) VALUES (
            COALESCE(NEW.tenant_id, OLD.tenant_id),
            auth.uid(),
            'sales_order',
            COALESCE(NEW.id, OLD.id),
            COALESCE(NEW.display_id, OLD.display_id),
            v_action_type,
            v_changes
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_sales_order_changes
    AFTER INSERT OR UPDATE OR DELETE ON sales_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_sales_order_changes();

-- ============================================================================
-- RECALCULATE TOTALS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_sales_order_totals(p_sales_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subtotal DECIMAL(12, 2);
    v_tax_amount DECIMAL(12, 2);
    v_total DECIMAL(12, 2);
    v_so RECORD;
BEGIN
    -- Get sales order
    SELECT * INTO v_so FROM sales_orders WHERE id = p_sales_order_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate subtotal from items
    SELECT
        COALESCE(SUM(line_total), 0),
        COALESCE(SUM(line_total * tax_rate / 100), 0)
    INTO v_subtotal, v_tax_amount
    FROM sales_order_items
    WHERE sales_order_id = p_sales_order_id;

    -- Calculate total
    v_total := v_subtotal + v_tax_amount + COALESCE(v_so.shipping_cost, 0) - COALESCE(v_so.discount_amount, 0);

    -- Update sales order
    UPDATE sales_orders
    SET subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total = v_total,
        updated_at = NOW()
    WHERE id = p_sales_order_id;
END;
$$;

-- ============================================================================
-- TRIGGER TO AUTO-RECALCULATE TOTALS
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_so_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_sales_order_totals(OLD.sales_order_id);
        RETURN OLD;
    ELSE
        PERFORM recalculate_sales_order_totals(NEW.sales_order_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_so_items_recalculate
    AFTER INSERT OR UPDATE OR DELETE ON sales_order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_so_totals();

-- ============================================================================
-- ADD COLUMNS TO PICK_LIST_ITEMS FOR SOURCE TRACKING
-- ============================================================================

-- Check if columns exist before adding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'pick_list_items' AND column_name = 'source_item_id') THEN
        ALTER TABLE pick_list_items ADD COLUMN source_item_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'pick_list_items' AND column_name = 'source_type') THEN
        ALTER TABLE pick_list_items ADD COLUMN source_type VARCHAR(50);
    END IF;
END $$;

-- Add columns to pick_lists for source tracking
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'pick_lists' AND column_name = 'source_entity_type') THEN
        ALTER TABLE pick_lists ADD COLUMN source_entity_type VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'pick_lists' AND column_name = 'source_entity_id') THEN
        ALTER TABLE pick_lists ADD COLUMN source_entity_id UUID;
    END IF;
END $$;

-- Create index for source tracking
CREATE INDEX IF NOT EXISTS idx_pick_list_items_source
ON pick_list_items(source_item_id)
WHERE source_item_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pick_lists_source
ON pick_lists(source_entity_type, source_entity_id)
WHERE source_entity_id IS NOT NULL;
