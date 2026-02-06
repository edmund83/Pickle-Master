-- ============================================
-- Migration: 00137_activity_log_audit_guarantee.sql
-- Purpose: Guaranteed audit trail – activity_logs are append-only;
--          UPDATE/DELETE only via designated archive/purge functions.
-- ============================================

-- 1. Trigger function: block UPDATE/DELETE on activity_logs unless escape hatch is set
CREATE OR REPLACE FUNCTION prevent_activity_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('app.allow_activity_log_mutation', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'activity_logs are append-only; use archive_old_activity_logs() to archive and remove old records.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_prevent_activity_log_mutation
    BEFORE UPDATE OR DELETE ON activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_activity_log_mutation();

-- 2. Archive function must set escape hatch before deleting
CREATE OR REPLACE FUNCTION archive_old_activity_logs(
    retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

    WITH moved AS (
        INSERT INTO activity_logs_archive
        SELECT *, NOW() as archived_at
        FROM activity_logs
        WHERE created_at < cutoff_date
        RETURNING 1
    )
    SELECT COUNT(*) INTO archived_count FROM moved;

    PERFORM set_config('app.allow_activity_log_mutation', 'true', true);
    DELETE FROM activity_logs
    WHERE created_at < cutoff_date;

    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger function: block DELETE on activity_logs_archive unless purge escape hatch is set
CREATE OR REPLACE FUNCTION prevent_archive_purge_direct()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('app.allow_archive_purge', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'activity_logs_archive: direct delete not allowed; use purge_old_archives() to purge.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_prevent_archive_purge_direct ON activity_logs_archive;
CREATE TRIGGER tr_prevent_archive_purge_direct
    BEFORE DELETE ON activity_logs_archive
    FOR EACH ROW
    EXECUTE FUNCTION prevent_archive_purge_direct();

-- 4. Purge function must set escape hatch before deleting
CREATE OR REPLACE FUNCTION purge_old_archives(
    retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    purged_count INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

    PERFORM set_config('app.allow_archive_purge', 'true', true);
    DELETE FROM activity_logs_archive
    WHERE created_at < cutoff_date;

    GET DIAGNOSTICS purged_count = ROW_COUNT;
    RETURN purged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE activity_logs IS 'Append-only audit trail. UPDATE/DELETE blocked by trigger; use archive_old_activity_logs() to archive.';
COMMENT ON TABLE activity_logs_archive IS 'Archived activity logs. DELETE blocked by trigger; use purge_old_archives() to purge.';
