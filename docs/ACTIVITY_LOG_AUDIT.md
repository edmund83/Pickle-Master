# Activity Log Audit Trail

Activity logs form a **guaranteed audit trail**: they are append-only and cannot be updated or deleted by application code or ad-hoc SQL.

## Guarantees

- **`activity_logs`**: Only **INSERT** and **SELECT** are allowed. **UPDATE** and **DELETE** are blocked by a trigger unless the designated archive function is used.
- **`activity_logs_archive`**: Same idea for the archive table; **DELETE** is only allowed via the purge function.

## Allowed mutations

| Table                 | Allowed operations | How to remove data |
|-----------------------|-------------------|---------------------|
| `activity_logs`       | INSERT, SELECT     | `archive_old_activity_logs(retention_days)` (moves to archive, then deletes) |
| `activity_logs_archive` | SELECT          | `purge_old_archives(retention_days)` (deletes old archived rows) |

## Implementation

- **Migration**: `00137_activity_log_audit_guarantee.sql`
- Triggers call `current_setting('app.allow_activity_log_mutation')` / `app.allow_archive_purge`; only the archive/purge functions set these before performing deletes.
- RLS already restricts **INSERT** on `activity_logs` to the current tenant; there are no **UPDATE** or **DELETE** policies, so those are denied at the policy level as well.

## Retention

- Run **`archive_old_activity_logs(90)`** periodically (e.g. cron) to move logs older than 90 days to `activity_logs_archive`.
- Run **`purge_old_archives(365)`** to delete archived rows older than 365 days.
