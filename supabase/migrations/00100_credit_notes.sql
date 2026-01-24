-- Migration: 00100_credit_notes.sql
-- Description: Add credit note support to invoices (simple approach - credit notes are a type of invoice)

-- ============================================================================
-- ADD INVOICE TYPE COLUMNS
-- ============================================================================

-- Add invoice_type to distinguish regular invoices from credit notes
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(20) DEFAULT 'invoice'
    CHECK (invoice_type IN ('invoice', 'credit_note'));

-- Add reference to original invoice (for credit notes)
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS original_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Add credit reason (why the credit was issued)
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS credit_reason VARCHAR(50);

-- ============================================================================
-- UPDATE DISPLAY_ID FUNCTION TO SUPPORT CREDIT_NOTE PREFIX
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_display_id(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_org_code VARCHAR(5);
    v_prefix VARCHAR(4);
    v_sequence BIGINT;
BEGIN
    -- Get org code for tenant
    SELECT org_code INTO v_org_code
    FROM tenants
    WHERE id = p_tenant_id;

    -- Default to random code if org_code not set
    IF v_org_code IS NULL THEN
        v_org_code := UPPER(LEFT(MD5(p_tenant_id::TEXT), 5));
    END IF;

    -- Determine prefix based on entity type
    v_prefix := CASE p_entity_type
        WHEN 'pick_list' THEN 'PL'
        WHEN 'purchase_order' THEN 'PO'
        WHEN 'item' THEN 'ITM'
        WHEN 'folder' THEN 'FLD'
        WHEN 'stock_count' THEN 'SC'
        WHEN 'receive' THEN 'RCV'
        WHEN 'sales_order' THEN 'SO'
        WHEN 'delivery_order' THEN 'DO'
        WHEN 'invoice' THEN 'INV'
        WHEN 'credit_note' THEN 'CN'
        WHEN 'customer' THEN 'CUS'
        ELSE UPPER(LEFT(p_entity_type, 3))
    END;

    -- Get next sequence number (atomically)
    v_sequence := get_next_entity_number(p_tenant_id, p_entity_type);

    -- Format: PREFIX-ORGCODE-SEQUENCE (e.g., CN-ACM01-00001)
    RETURN v_prefix || '-' || v_org_code || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$;

-- ============================================================================
-- CREATE CREDIT NOTE RPC FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_credit_note(
    p_original_invoice_id UUID,
    p_credit_reason VARCHAR(50) DEFAULT 'return',
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_credit_note_id UUID;
    v_display_id VARCHAR(25);
    v_original_invoice RECORD;
BEGIN
    -- Get current user and tenant
    v_user_id := auth.uid();
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found for current user';
    END IF;

    -- Get original invoice
    SELECT * INTO v_original_invoice
    FROM invoices
    WHERE id = p_original_invoice_id
      AND tenant_id = v_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Original invoice not found';
    END IF;

    -- Validate original invoice is not already a credit note
    IF v_original_invoice.invoice_type = 'credit_note' THEN
        RAISE EXCEPTION 'Cannot create credit note from another credit note';
    END IF;

    -- Generate display ID for credit note
    v_display_id := generate_display_id(v_tenant_id, 'credit_note');

    -- Create credit note (copy from original invoice with negative amounts)
    INSERT INTO invoices (
        tenant_id,
        display_id,
        invoice_type,
        original_invoice_id,
        credit_reason,
        customer_id,
        status,
        invoice_date,
        bill_to_name,
        bill_to_address1,
        bill_to_address2,
        bill_to_city,
        bill_to_state,
        bill_to_postal_code,
        bill_to_country,
        subtotal,
        tax_rate,
        tax_amount,
        discount_amount,
        total,
        balance_due,
        internal_notes,
        created_by
    )
    SELECT
        v_tenant_id,
        v_display_id,
        'credit_note',
        p_original_invoice_id,
        p_credit_reason,
        v_original_invoice.customer_id,
        'draft',
        CURRENT_DATE,
        v_original_invoice.bill_to_name,
        v_original_invoice.bill_to_address1,
        v_original_invoice.bill_to_address2,
        v_original_invoice.bill_to_city,
        v_original_invoice.bill_to_state,
        v_original_invoice.bill_to_postal_code,
        v_original_invoice.bill_to_country,
        0, -- Will be calculated from items
        v_original_invoice.tax_rate,
        0,
        0,
        0,
        0,
        COALESCE(p_notes, 'Credit note for ' || v_original_invoice.display_id),
        v_user_id
    RETURNING id INTO v_credit_note_id;

    RETURN v_credit_note_id;
END;
$$;

-- ============================================================================
-- FUNCTION TO ADD CREDIT NOTE ITEM
-- ============================================================================

CREATE OR REPLACE FUNCTION add_credit_note_item(
    p_credit_note_id UUID,
    p_item_id UUID,
    p_quantity INTEGER,
    p_unit_price DECIMAL(12, 2),
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_credit_note RECORD;
    v_item RECORD;
    v_item_id UUID;
    v_line_total DECIMAL(12, 2);
    v_tax_amount DECIMAL(12, 2);
BEGIN
    v_tenant_id := get_user_tenant_id();

    -- Verify credit note exists and is a credit note
    SELECT * INTO v_credit_note
    FROM invoices
    WHERE id = p_credit_note_id
      AND tenant_id = v_tenant_id
      AND invoice_type = 'credit_note';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Credit note not found';
    END IF;

    -- Verify credit note is still in draft
    IF v_credit_note.status != 'draft' THEN
        RAISE EXCEPTION 'Cannot add items to non-draft credit note';
    END IF;

    -- Get item details
    SELECT * INTO v_item
    FROM inventory_items
    WHERE id = p_item_id
      AND tenant_id = v_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item not found';
    END IF;

    -- Calculate line total (negative for credit notes)
    v_line_total := -(p_quantity * p_unit_price);
    v_tax_amount := ROUND(v_line_total * COALESCE(v_credit_note.tax_rate, 0) / 100, 2);

    -- Insert credit note item
    INSERT INTO invoice_items (
        invoice_id,
        item_id,
        item_name,
        sku,
        description,
        quantity,
        unit_price,
        line_total,
        tax_rate,
        tax_amount
    ) VALUES (
        p_credit_note_id,
        p_item_id,
        v_item.name,
        v_item.sku,
        COALESCE(p_description, v_item.description),
        p_quantity,
        -p_unit_price, -- Negative price for credit
        v_line_total,
        COALESCE(v_credit_note.tax_rate, 0),
        v_tax_amount
    )
    RETURNING id INTO v_item_id;

    -- Recalculate totals
    PERFORM recalculate_invoice_totals(p_credit_note_id);

    RETURN v_item_id;
END;
$$;

-- ============================================================================
-- FUNCTION TO APPLY CREDIT NOTE TO INVOICE
-- ============================================================================

CREATE OR REPLACE FUNCTION apply_credit_note(
    p_credit_note_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_credit_note RECORD;
    v_original_invoice RECORD;
    v_credit_amount DECIMAL(12, 2);
BEGIN
    v_tenant_id := get_user_tenant_id();

    -- Get credit note
    SELECT * INTO v_credit_note
    FROM invoices
    WHERE id = p_credit_note_id
      AND tenant_id = v_tenant_id
      AND invoice_type = 'credit_note';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Credit note not found';
    END IF;

    -- Must be in draft or pending status
    IF v_credit_note.status NOT IN ('draft', 'pending') THEN
        RAISE EXCEPTION 'Credit note already applied or cancelled';
    END IF;

    -- Get original invoice if linked
    IF v_credit_note.original_invoice_id IS NOT NULL THEN
        SELECT * INTO v_original_invoice
        FROM invoices
        WHERE id = v_credit_note.original_invoice_id
          AND tenant_id = v_tenant_id;

        IF FOUND THEN
            -- Credit amount is the absolute value of credit note total
            v_credit_amount := ABS(v_credit_note.total);

            -- Apply credit to original invoice (increase amount_paid)
            UPDATE invoices
            SET amount_paid = amount_paid + v_credit_amount,
                balance_due = total - (amount_paid + v_credit_amount),
                status = CASE
                    WHEN total - (amount_paid + v_credit_amount) <= 0 THEN 'paid'::invoice_status
                    WHEN amount_paid + v_credit_amount > 0 THEN 'partial'::invoice_status
                    ELSE status
                END
            WHERE id = v_credit_note.original_invoice_id;
        END IF;
    END IF;

    -- Mark credit note as applied (using 'paid' status to indicate fully applied)
    UPDATE invoices
    SET status = 'paid',
        amount_paid = ABS(total),
        balance_due = 0
    WHERE id = p_credit_note_id;

    RETURN TRUE;
END;
$$;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_type
    ON invoices(tenant_id, invoice_type);

CREATE INDEX IF NOT EXISTS idx_invoices_original_invoice
    ON invoices(original_invoice_id)
    WHERE original_invoice_id IS NOT NULL;

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION create_credit_note(UUID, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_credit_note_item(UUID, UUID, INTEGER, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_credit_note(UUID) TO authenticated;
