-- Migration: 00065_delivery_orders.sql
-- Description: Delivery orders for shipment tracking and proof of delivery

-- ============================================================================
-- DELIVERY ORDER STATUS ENUM
-- ============================================================================

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

-- ============================================================================
-- DELIVERY ORDERS TABLE
-- ============================================================================

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

-- ============================================================================
-- DELIVERY ORDER ITEMS TABLE
-- ============================================================================

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

-- ============================================================================
-- DELIVERY ORDER ITEM SERIALS (for lot/serial tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_order_item_serials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_order_item_id UUID NOT NULL REFERENCES delivery_order_items(id) ON DELETE CASCADE,
    serial_number VARCHAR(255) NOT NULL,
    lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_delivery_orders_tenant ON delivery_orders(tenant_id);
CREATE INDEX idx_delivery_orders_tenant_status ON delivery_orders(tenant_id, status);
CREATE INDEX idx_delivery_orders_sales_order ON delivery_orders(sales_order_id);
CREATE INDEX idx_delivery_orders_pick_list ON delivery_orders(pick_list_id) WHERE pick_list_id IS NOT NULL;
CREATE INDEX idx_delivery_orders_display_id ON delivery_orders(display_id);
CREATE INDEX idx_delivery_orders_tenant_created ON delivery_orders(tenant_id, created_at DESC);
CREATE INDEX idx_delivery_orders_scheduled ON delivery_orders(tenant_id, scheduled_date) WHERE scheduled_date IS NOT NULL;

CREATE INDEX idx_delivery_order_items_do ON delivery_order_items(delivery_order_id);
CREATE INDEX idx_delivery_order_items_so_item ON delivery_order_items(sales_order_item_id);
CREATE INDEX idx_delivery_order_item_serials_doi ON delivery_order_item_serials(delivery_order_item_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_item_serials ENABLE ROW LEVEL SECURITY;

-- Delivery orders tenant isolation
CREATE POLICY delivery_orders_tenant_isolation ON delivery_orders
    FOR ALL
    USING (tenant_id = get_user_tenant_id())
    WITH CHECK (tenant_id = get_user_tenant_id());

-- Delivery order items via parent
CREATE POLICY delivery_order_items_via_parent ON delivery_order_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM delivery_orders do
            WHERE do.id = delivery_order_items.delivery_order_id
            AND do.tenant_id = get_user_tenant_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM delivery_orders do
            WHERE do.id = delivery_order_items.delivery_order_id
            AND do.tenant_id = get_user_tenant_id()
        )
    );

-- Delivery order item serials via grandparent
CREATE POLICY delivery_order_item_serials_via_grandparent ON delivery_order_item_serials
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM delivery_order_items doi
            JOIN delivery_orders do ON do.id = doi.delivery_order_id
            WHERE doi.id = delivery_order_item_serials.delivery_order_item_id
            AND do.tenant_id = get_user_tenant_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM delivery_order_items doi
            JOIN delivery_orders do ON do.id = doi.delivery_order_id
            WHERE doi.id = delivery_order_item_serials.delivery_order_item_id
            AND do.tenant_id = get_user_tenant_id()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_delivery_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delivery_orders_updated_at
    BEFORE UPDATE ON delivery_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_orders_updated_at();

-- ============================================================================
-- ACTIVITY LOGGING TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION log_delivery_order_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type TEXT;
    v_changes JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action_type := 'create';
        v_changes := jsonb_build_object(
            'display_id', NEW.display_id,
            'sales_order_id', NEW.sales_order_id,
            'status', NEW.status
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if it's a status change
        IF OLD.status != NEW.status THEN
            v_action_type := CASE NEW.status
                WHEN 'dispatched' THEN 'dispatch'
                WHEN 'delivered' THEN 'deliver'
                WHEN 'cancelled' THEN 'cancel'
                ELSE 'status_change'
            END;
            v_changes := jsonb_build_object(
                'from', OLD.status,
                'to', NEW.status
            );
        ELSE
            v_action_type := 'update';
            v_changes := '{}'::jsonb;

            IF OLD.carrier IS DISTINCT FROM NEW.carrier THEN
                v_changes := v_changes || jsonb_build_object('carrier', jsonb_build_object('from', OLD.carrier, 'to', NEW.carrier));
            END IF;
            IF OLD.tracking_number IS DISTINCT FROM NEW.tracking_number THEN
                v_changes := v_changes || jsonb_build_object('tracking_number', jsonb_build_object('from', OLD.tracking_number, 'to', NEW.tracking_number));
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
            'delivery_order',
            COALESCE(NEW.id, OLD.id),
            COALESCE(NEW.display_id, OLD.display_id),
            v_action_type,
            v_changes
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_delivery_order_changes
    AFTER INSERT OR UPDATE OR DELETE ON delivery_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_delivery_order_changes();
