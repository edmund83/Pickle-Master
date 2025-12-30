-- ============================================
-- Migration: Bulk Import Items Function
-- Purpose: Single API call for importing multiple items with optimized performance
-- ============================================

-- Bulk import items function
-- Accepts: p_items JSONB array of items, p_options JSONB with import options
-- Returns: { success_count, failed_count, skipped_count, created_item_ids[], errors[] }
CREATE OR REPLACE FUNCTION bulk_import_items(
    p_items JSONB,
    p_options JSONB DEFAULT '{}'::JSONB
)
RETURNS JSON AS $$
DECLARE
    tenant UUID;
    user_id UUID;
    skip_duplicates BOOLEAN;
    create_folders BOOLEAN;

    item JSONB;
    new_item_id UUID;
    folder_id UUID;
    folder_name TEXT;
    tag_names TEXT[];
    tag_id UUID;
    tag_name TEXT;
    item_status VARCHAR(50);
    qty INTEGER;
    min_qty INTEGER;

    -- Caches for folder and tag lookups (single query each)
    folder_cache JSONB := '{}';
    tag_cache JSONB := '{}';

    -- Results tracking
    inserted_ids UUID[] := '{}';
    errors JSONB[] := '{}';
    success_count INTEGER := 0;
    failed_count INTEGER := 0;
    skipped_count INTEGER := 0;
    row_num INTEGER := 0;

    -- Duplicate checking
    existing_sku TEXT;
    existing_barcode TEXT;
BEGIN
    -- Get tenant and user from auth context
    tenant := get_user_tenant_id();
    user_id := auth.uid();

    -- Parse options with defaults
    skip_duplicates := COALESCE((p_options->>'skip_duplicates')::BOOLEAN, true);
    create_folders := COALESCE((p_options->>'create_folders')::BOOLEAN, true);

    -- Validate tenant exists
    IF tenant IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No tenant found for user',
            'success_count', 0,
            'failed_count', 0,
            'skipped_count', 0,
            'created_item_ids', '{}',
            'errors', '[]'
        );
    END IF;

    -- Pre-load existing folders into cache (single query)
    SELECT COALESCE(jsonb_object_agg(LOWER(name), id), '{}')
    INTO folder_cache
    FROM folders
    WHERE tenant_id = tenant;

    -- Pre-load existing tags into cache (single query)
    SELECT COALESCE(jsonb_object_agg(LOWER(name), id), '{}')
    INTO tag_cache
    FROM tags
    WHERE tenant_id = tenant;

    -- Process each item
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        row_num := row_num + 1;

        BEGIN
            -- Check for duplicate SKU (if provided and not empty)
            IF item->>'sku' IS NOT NULL AND TRIM(item->>'sku') != '' THEN
                SELECT sku INTO existing_sku
                FROM inventory_items
                WHERE tenant_id = tenant
                  AND sku = TRIM(item->>'sku')
                  AND deleted_at IS NULL
                LIMIT 1;

                IF existing_sku IS NOT NULL THEN
                    IF skip_duplicates THEN
                        skipped_count := skipped_count + 1;
                        CONTINUE;
                    ELSE
                        RAISE EXCEPTION 'Duplicate SKU: %', existing_sku;
                    END IF;
                END IF;
            END IF;

            -- Check for duplicate barcode (if provided and not empty)
            IF item->>'barcode' IS NOT NULL AND TRIM(item->>'barcode') != '' THEN
                SELECT barcode INTO existing_barcode
                FROM inventory_items
                WHERE tenant_id = tenant
                  AND barcode = TRIM(item->>'barcode')
                  AND deleted_at IS NULL
                LIMIT 1;

                IF existing_barcode IS NOT NULL THEN
                    IF skip_duplicates THEN
                        skipped_count := skipped_count + 1;
                        CONTINUE;
                    ELSE
                        RAISE EXCEPTION 'Duplicate barcode: %', existing_barcode;
                    END IF;
                END IF;
            END IF;

            -- Resolve folder from cache or create if needed
            folder_id := NULL;
            folder_name := TRIM(COALESCE(item->>'folder', ''));

            IF folder_name != '' THEN
                -- Look up in cache (case-insensitive)
                folder_id := (folder_cache->>LOWER(folder_name))::UUID;

                -- Create folder if doesn't exist and option enabled
                IF folder_id IS NULL AND create_folders THEN
                    INSERT INTO folders (tenant_id, name, created_by)
                    VALUES (tenant, folder_name, user_id)
                    RETURNING id INTO folder_id;

                    -- Update cache for subsequent items
                    folder_cache := folder_cache || jsonb_build_object(LOWER(folder_name), folder_id);
                END IF;
            END IF;

            -- Calculate item status based on quantity/min_quantity
            qty := COALESCE((item->>'quantity')::INTEGER, 0);
            min_qty := COALESCE((item->>'min_quantity')::INTEGER, 0);

            IF qty <= 0 THEN
                item_status := 'out_of_stock';
            ELSIF min_qty > 0 AND qty <= min_qty THEN
                item_status := 'low_stock';
            ELSE
                item_status := 'in_stock';
            END IF;

            -- Insert the item
            INSERT INTO inventory_items (
                tenant_id,
                folder_id,
                name,
                sku,
                barcode,
                description,
                quantity,
                min_quantity,
                unit,
                price,
                cost_price,
                location,
                notes,
                status,
                created_by,
                last_modified_by
            )
            VALUES (
                tenant,
                folder_id,
                TRIM(item->>'name'),
                NULLIF(TRIM(item->>'sku'), ''),
                NULLIF(TRIM(item->>'barcode'), ''),
                NULLIF(TRIM(item->>'description'), ''),
                qty,
                min_qty,
                COALESCE(NULLIF(TRIM(item->>'unit'), ''), 'pcs'),
                COALESCE((item->>'price')::DECIMAL, 0),
                NULLIF((item->>'cost_price')::DECIMAL, 0),
                NULLIF(TRIM(item->>'location'), ''),
                NULLIF(TRIM(item->>'notes'), ''),
                item_status,
                user_id,
                user_id
            )
            RETURNING id INTO new_item_id;

            -- Process tags (comma-separated string)
            IF item->>'tags' IS NOT NULL AND TRIM(item->>'tags') != '' THEN
                -- Split comma-separated tags
                tag_names := string_to_array(item->>'tags', ',');

                FOREACH tag_name IN ARRAY tag_names
                LOOP
                    tag_name := TRIM(tag_name);

                    IF tag_name != '' THEN
                        -- Look up tag in cache (case-insensitive)
                        tag_id := (tag_cache->>LOWER(tag_name))::UUID;

                        -- Create tag if doesn't exist (upsert pattern)
                        IF tag_id IS NULL THEN
                            INSERT INTO tags (tenant_id, name)
                            VALUES (tenant, tag_name)
                            ON CONFLICT (tenant_id, name) DO UPDATE SET name = EXCLUDED.name
                            RETURNING id INTO tag_id;

                            -- Update cache for subsequent items
                            tag_cache := tag_cache || jsonb_build_object(LOWER(tag_name), tag_id);
                        END IF;

                        -- Link tag to item (ignore if already exists)
                        INSERT INTO item_tags (item_id, tag_id, created_by)
                        VALUES (new_item_id, tag_id, user_id)
                        ON CONFLICT DO NOTHING;
                    END IF;
                END LOOP;
            END IF;

            -- Track success
            inserted_ids := inserted_ids || new_item_id;
            success_count := success_count + 1;

        EXCEPTION WHEN OTHERS THEN
            -- Capture error for this row and continue to next
            errors := errors || jsonb_build_object(
                'row', row_num,
                'name', item->>'name',
                'message', SQLERRM
            );
            failed_count := failed_count + 1;
        END;
    END LOOP;

    -- Log bulk import activity (single entry for entire import)
    IF success_count > 0 OR failed_count > 0 THEN
        INSERT INTO activity_logs (
            tenant_id,
            user_id,
            entity_type,
            action_type,
            changes
        )
        VALUES (
            tenant,
            user_id,
            'item',
            'bulk_import',
            jsonb_build_object(
                'success_count', success_count,
                'failed_count', failed_count,
                'skipped_count', skipped_count,
                'total_rows', row_num
            )
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'success_count', success_count,
        'failed_count', failed_count,
        'skipped_count', skipped_count,
        'created_item_ids', inserted_ids,
        'errors', errors
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION bulk_import_items(JSONB, JSONB) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION bulk_import_items IS 'Bulk import inventory items from CSV/Excel data. Accepts JSONB array of items with fields: name, sku, barcode, description, quantity, min_quantity, unit, price, cost_price, location, notes, tags (comma-separated), folder. Options: skip_duplicates (default true), create_folders (default true).';
