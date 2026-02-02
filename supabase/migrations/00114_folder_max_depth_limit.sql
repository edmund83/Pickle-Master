-- Add maximum folder nesting depth limit (4 levels = depth 0-3)
-- This migration updates the move_folder_with_descendants function to enforce the limit

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
    v_max_descendant_depth INTEGER;
    v_max_folder_depth INTEGER := 3;
    v_old_path_segment TEXT[];
    v_descendant RECORD;
    v_pos INTEGER;
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

    -- Check max depth of descendants
    SELECT COALESCE(MAX(depth), v_folder.depth) INTO v_max_descendant_depth
    FROM folders
    WHERE tenant_id = v_tenant_id
      AND COALESCE(path, ARRAY[]::TEXT[]) @> ARRAY[p_folder_id::TEXT];

    -- Calculate new max depth after move (depth increase = new_depth - old_depth)
    IF (v_new_depth + (v_max_descendant_depth - v_folder.depth)) > v_max_folder_depth THEN
        RAISE EXCEPTION 'Cannot move folder: would exceed maximum nesting depth of 4 levels';
    END IF;

    -- Update the folder being moved
    UPDATE folders
    SET parent_id = p_new_parent_id,
        path = v_new_path,
        depth = v_new_depth,
        updated_at = NOW()
    WHERE id = p_folder_id;

    v_new_prefix := v_new_path || p_folder_id::TEXT;

    -- Update descendants using a loop to avoid array slice syntax issues
    FOR v_descendant IN
        SELECT id, path, depth
        FROM folders
        WHERE tenant_id = v_tenant_id
          AND COALESCE(path, ARRAY[]::TEXT[]) @> ARRAY[p_folder_id::TEXT]
    LOOP
        -- Find the position of p_folder_id in the descendant's path
        v_pos := array_position(v_descendant.path, p_folder_id::TEXT);

        -- Get the segment after the folder being moved
        IF v_pos IS NOT NULL AND v_pos < array_length(v_descendant.path, 1) THEN
            v_old_path_segment := v_descendant.path[v_pos + 1:array_length(v_descendant.path, 1)];
        ELSE
            v_old_path_segment := ARRAY[]::TEXT[];
        END IF;

        UPDATE folders
        SET path = v_new_prefix || v_old_path_segment,
            depth = COALESCE(array_length(v_new_prefix, 1), 0) + COALESCE(array_length(v_old_path_segment, 1), 0),
            updated_at = NOW()
        WHERE id = v_descendant.id;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION move_folder_with_descendants IS 'Moves a folder and its descendants to a new parent, enforcing max depth of 4 levels (depth 0-3)';
