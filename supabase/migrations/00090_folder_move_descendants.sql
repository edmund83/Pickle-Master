-- Update folder hierarchy with descendant path recalculation
-- Ensures parent/path/depth updates are applied atomically

CREATE OR REPLACE FUNCTION move_folder_with_descendants(
    p_folder_id UUID,
    p_new_parent_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_folder RECORD;
    v_new_parent RECORD;
    v_new_path TEXT[];
    v_new_depth INTEGER;
    v_new_prefix TEXT[];
    v_path TEXT[];
BEGIN
    v_tenant_id := get_user_tenant_id();

    SELECT * INTO v_folder
    FROM folders
    WHERE id = p_folder_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Folder not found';
    END IF;

    IF v_folder.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF p_new_parent_id IS NOT NULL THEN
        SELECT path, depth, tenant_id INTO v_new_parent
        FROM folders
        WHERE id = p_new_parent_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Parent folder not found';
        END IF;

        IF v_new_parent.tenant_id != v_tenant_id THEN
            RAISE EXCEPTION 'Access denied';
        END IF;

        v_path := COALESCE(v_new_parent.path, ARRAY[]::TEXT[]);

        IF p_new_parent_id = p_folder_id OR v_path @> ARRAY[p_folder_id::TEXT] THEN
            RAISE EXCEPTION 'Cannot move folder into its own subfolder';
        END IF;

        v_new_path := v_path || p_new_parent_id::TEXT;
        v_new_depth := COALESCE(v_new_parent.depth, 0) + 1;
    ELSE
        v_new_path := ARRAY[]::TEXT[];
        v_new_depth := 0;
    END IF;

    UPDATE folders
    SET parent_id = p_new_parent_id,
        path = v_new_path,
        depth = v_new_depth,
        updated_at = NOW()
    WHERE id = p_folder_id;

    v_new_prefix := v_new_path || p_folder_id::TEXT;

    UPDATE folders
    SET path = v_new_prefix || COALESCE(path, ARRAY[]::TEXT[])[(array_position(COALESCE(path, ARRAY[]::TEXT[]), p_folder_id::TEXT) + 1):],
        depth = COALESCE(array_length(v_new_prefix, 1), 0)
            + COALESCE(array_length(COALESCE(path, ARRAY[]::TEXT[])[(array_position(COALESCE(path, ARRAY[]::TEXT[]), p_folder_id::TEXT) + 1):], 1), 0),
        updated_at = NOW()
    WHERE tenant_id = v_tenant_id
      AND COALESCE(path, ARRAY[]::TEXT[]) @> ARRAY[p_folder_id::TEXT];
END;
$$;
