-- Migration: 00066_invoices.sql
-- Description: Simple invoicing system for sales orders

-- ============================================================================
-- INVOICE STATUS ENUM
-- ============================================================================

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

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

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

-- ============================================================================
-- INVOICE ITEMS TABLE
-- ============================================================================

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

-- ============================================================================
-- INVOICE PAYMENTS TABLE
-- ============================================================================

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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_tenant_customer ON invoices(tenant_id, customer_id);
CREATE INDEX idx_invoices_sales_order ON invoices(sales_order_id) WHERE sales_order_id IS NOT NULL;
CREATE INDEX idx_invoices_delivery_order ON invoices(delivery_order_id) WHERE delivery_order_id IS NOT NULL;
CREATE INDEX idx_invoices_display_id ON invoices(display_id);
CREATE INDEX idx_invoices_tenant_created ON invoices(tenant_id, created_at DESC);
CREATE INDEX idx_invoices_tenant_due ON invoices(tenant_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_invoices_overdue ON invoices(tenant_id, due_date, status)
    WHERE status NOT IN ('paid', 'cancelled', 'void');

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_tenant ON invoice_payments(tenant_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- Invoices tenant isolation
CREATE POLICY invoices_tenant_isolation ON invoices
    FOR ALL
    USING (tenant_id = get_user_tenant_id())
    WITH CHECK (tenant_id = get_user_tenant_id());

-- Invoice items via parent
CREATE POLICY invoice_items_via_parent ON invoice_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.tenant_id = get_user_tenant_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.tenant_id = get_user_tenant_id()
        )
    );

-- Invoice payments tenant isolation
CREATE POLICY invoice_payments_tenant_isolation ON invoice_payments
    FOR ALL
    USING (tenant_id = get_user_tenant_id())
    WITH CHECK (tenant_id = get_user_tenant_id());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- ============================================================================
-- ACTIVITY LOGGING TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION log_invoice_changes()
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
            'total', NEW.total,
            'status', NEW.status
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if it's a status change
        IF OLD.status != NEW.status THEN
            v_action_type := CASE NEW.status
                WHEN 'sent' THEN 'send'
                WHEN 'paid' THEN 'mark_paid'
                WHEN 'cancelled' THEN 'cancel'
                WHEN 'void' THEN 'void'
                ELSE 'status_change'
            END;
            v_changes := jsonb_build_object(
                'from', OLD.status,
                'to', NEW.status
            );
        -- Check if it's a payment
        ELSIF OLD.amount_paid != NEW.amount_paid THEN
            v_action_type := 'payment';
            v_changes := jsonb_build_object(
                'amount_paid', jsonb_build_object('from', OLD.amount_paid, 'to', NEW.amount_paid),
                'balance_due', jsonb_build_object('from', OLD.balance_due, 'to', NEW.balance_due)
            );
        ELSE
            v_action_type := 'update';
            v_changes := '{}'::jsonb;

            IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
                v_changes := v_changes || jsonb_build_object('due_date', jsonb_build_object('from', OLD.due_date, 'to', NEW.due_date));
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
            'invoice',
            COALESCE(NEW.id, OLD.id),
            COALESCE(NEW.display_id, OLD.display_id),
            v_action_type,
            v_changes
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_invoice_changes
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION log_invoice_changes();

-- ============================================================================
-- RECALCULATE TOTALS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_invoice_totals(p_invoice_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subtotal DECIMAL(12, 2);
    v_tax_amount DECIMAL(12, 2);
    v_total DECIMAL(12, 2);
    v_invoice RECORD;
BEGIN
    -- Get invoice
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate from items
    SELECT
        COALESCE(SUM(line_total), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO v_subtotal, v_tax_amount
    FROM invoice_items
    WHERE invoice_id = p_invoice_id;

    -- Calculate total
    v_total := v_subtotal + v_tax_amount - COALESCE(v_invoice.discount_amount, 0);

    -- Update invoice
    UPDATE invoices
    SET subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total = v_total,
        balance_due = v_total - amount_paid,
        updated_at = NOW()
    WHERE id = p_invoice_id;
END;
$$;

-- ============================================================================
-- AUTO-RECALCULATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_invoice_totals(OLD.invoice_id);
        RETURN OLD;
    ELSE
        PERFORM recalculate_invoice_totals(NEW.invoice_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_invoice_items_recalculate
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_invoice_totals();

-- ============================================================================
-- OVERDUE CHECKER FUNCTION (for scheduled jobs)
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE invoices
    SET status = 'overdue'
    WHERE status IN ('sent', 'partial')
      AND due_date < CURRENT_DATE
      AND balance_due > 0;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;
