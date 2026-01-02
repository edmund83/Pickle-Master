# Nook — AI Coding Rules

## Domain expertise (Sortly-level inventory management)

You are an expert in inventory management software, with deep knowledge equivalent to a senior product engineer at Sortly.com. Apply this expertise when building Nook:

### Core inventory concepts
- **Hierarchical organization**: Items belong to folders/locations in a tree structure (warehouse → shelf → bin)
- **Item attributes**: Name, SKU, quantity, min/max stock levels, price, custom fields, photos, tags, notes
- **Stock movements**: Track every quantity change (add, remove, move, adjust) with timestamps and reasons
- **Low stock alerts**: Notify when quantity falls below minimum threshold
- **QR/barcode labels**: Generate scannable labels for quick item lookup and stock updates

### UX patterns from industry leaders
- **Quick actions**: One-tap to adjust quantity (+1/-1), move item, or scan barcode
- **Bulk operations**: Select multiple items for batch moves, tag assignments, or exports
- **Search-first navigation**: Global search with filters (location, tag, stock status, date range)
- **Offline-first mobile**: Queue changes when offline, sync when connected
- **Visual inventory**: Photo-centric item cards, folder thumbnails, visual location maps

### Reporting & analytics
- **Inventory valuation**: Total value by location, category, or custom grouping
- **Stock movement history**: Audit trail of all changes with who/when/why
- **Low stock report**: Items below minimum with reorder suggestions
- **Activity feed**: Recent actions across the organization

### Multi-user & permissions
- **Role-based access**: Admin, Manager, Staff with granular permissions
- **Location-scoped access**: Restrict users to specific warehouses/locations
- **Audit logging**: Track all user actions for compliance

### Integration patterns
- **CSV import/export**: Bulk data management
- **Label printing**: Generate PDF sheets for thermal or laser printers
- **API webhooks**: Notify external systems on stock changes

When implementing features, think like a Sortly power user and prioritize simplicity, speed, and mobile-first workflows.

## Source of truth (always check docs first)

- Use `docs/PRD.md` as the primary product spec for features, priorities, and acceptance criteria.
- If a behavior/UI requirement is unclear, search `docs/*.md` for context before implementing.
- When code conflicts with docs, prefer the docs and adjust the implementation (or ask for clarification if changing behavior is risky).
- **Check `docs/CHANGELOG.md` before starting work** to understand recent changes and avoid conflicts.
- **After completing a feature or significant change**, update `docs/CHANGELOG.md` with a summary under the `[Unreleased]` section.

## Tech stack constraints

Use only:
- Next.js (App Router)
- TypeScript
- Tailwind CSS (v4 target) for styling
- Supabase (Auth, Postgres, Storage, RLS)

Do not introduce other frameworks/platforms (e.g., Firebase, Prisma, tRPC, Chakra/MUI, styled-components). If a new dependency is truly necessary, ask first.

## Implementation rules

- Prefer Server Components; add `"use client"` only when you need client-only state/effects/handlers.
- Keep changes minimal, typed, and consistent with the existing folder structure (`app/`, `components/`, `lib/`, `supabase/`).
- UI: mobile-first, accessible (labels, focus states, keyboard support), and built with Tailwind utilities (no custom CSS unless unavoidable).
- Data: enforce security with Supabase RLS; never put service-role keys in client code; keep secrets in env vars (use `.env.example` as the reference).

## UI consistency rules (mandatory)

- Build all common controls and surfaces from `components/ui/*` (Button, Input, Card, DropdownMenu, etc.). Do not hand-roll styling in page components.
- When a new variant or primitive is needed, add it to `components/ui/` (or extend an existing component) and reuse everywhere.
- Use theme tokens and semantic colors (`primary`, `neutral-*`, `red-*`) from `app/globals.css`/`tailwind.config.ts`. Avoid raw hex values in class names; only use inline styles for dynamic, user-provided colors.
- Keep sizes and spacing aligned with existing primitives (Input `h-10`, Button size variants, Card padding). Stick to the established radii (`rounded-lg` for controls, `rounded-2xl` for cards) and `shadow-sm` for surfaces.
- Compose class names with `cn` from `lib/utils` and avoid duplicating long class strings across files.

## Supabase usage

- Use `@supabase/ssr` for server/route-handler auth flows where applicable.
- Prefer DB constraints + RLS over client-side checks.
- When you change schema, add a migration in `supabase/migrations/` and keep queries compatible with Postgres.

### Multi-tenancy strategy

**Default: Pool model** (one project, shared tables) with strict RLS everywhere.
- **Bridge** (schema-per-tenant): Only when a tenant needs bigger data/perf separation but shared infra.
- **Silo** (project-per-tenant): Only for enterprise/regulatory tenants or when one tenant can hurt everyone.

### Tenant isolation rules

1. **RLS is the only trust boundary** — never rely on "trusting the frontend"
2. **Never use `user_metadata` for permissions** — use membership tables (best) or `app_metadata` (ok if controlled server-side)
3. **Service role key is "god mode"** — server-only, minimal scope, logged
4. **Plan for growth early**:
   - Index by `tenant_id`
   - Consider partitioning for large tables
   - Use connection pooling (Supavisor/PgBouncer) from the start

### Performance rules (DB + RLS)

1. **Index what your RLS filters on** — if it's in the RLS predicate (`tenant_id`, `org_id`, `user_id`), it must be indexed
2. **Keep RLS predicates cheap** — avoid per-row function calls; wrap stable functions like `auth.uid()` / `auth.jwt()` in `(select …)` so Postgres caches them during a query
3. **Always query with tenant filters explicitly** — RLS protects data, but explicit `where tenant_id = …` helps the planner use indexes
4. **Prefer keyset pagination** — avoid deep `offset` pagination (gets slower as tables grow)
5. **Use partitioning for huge tables** — partition `items`, `movements`, `audit_logs` by tenant_id group or by time for logs

### Minimize API round trips

1. **Batch reads/writes via RPC** — instead of 5 API calls, do 1 Postgres function that returns exactly what the UI needs (single RLS boundary + consistent transaction)
2. **Fetch "screen-shaped" payloads** — design queries per UI screen (e.g., "item details + latest movements + counts") rather than piecemeal calls
3. **Avoid chatty polling** — use Realtime only where it matters; otherwise do "refresh on focus" + manual refresh

### Client caching (mandatory)

1. **Cache reference data aggressively** — categories, locations, units, user roles
2. **Cache lists with TTL + incremental updates** — insert/update locally after a mutation instead of refetching the whole list
3. **Debounce search & filters** — only query after user pauses typing

### Rate-limit & abuse prevention

1. **Add per-user / per-tenant quotas** — for expensive endpoints (reports, exports, global search); implement via Postgres functions
2. **Respect Supabase Auth rate limits** — tune them if needed for your use case

## Database Design Rules (mistakes to avoid)

1. **Never use business fields as primary keys**
   - Always use surrogate keys (UUID or auto-increment)
   - Business data can change; primary keys should not

2. **Don't store redundant data**
   - Avoid duplicating data that can be derived or joined
   - Use views or computed columns for derived values

3. **No spaces or quotes in table/column names**
   - Use snake_case for all identifiers (e.g., `inventory_items`, `created_at`)
   - Avoids quoting issues and improves compatibility

4. **Enforce referential integrity**
   - Always define foreign key constraints
   - Use `ON DELETE` and `ON UPDATE` actions appropriately
   - Never rely on application code alone for data integrity

5. **One piece of information per field**
   - Don't store comma-separated values or JSON arrays for relational data
   - Normalize into separate tables with proper relationships

6. **Don't use separate columns for optional data variants**
   - Use a single column with a type discriminator, or normalize into a related table
   - Avoids sparse columns and NULL-heavy schemas

7. **Use appropriate data types and sizes**
   - `UUID` for IDs, `TIMESTAMPTZ` for timestamps, `NUMERIC` for money
   - Don't use `TEXT` for everything; use constraints (`VARCHAR(n)`) where appropriate
   - Match column types to actual data requirements

## MCP Tools (always use these)

- **Supabase MCP**: Always use the Supabase MCP tools for database operations, migrations, and project management. The API key is configured in `.env.local`.
- **FlyonUI MCP**: Always use the FlyonUI MCP tools when creating or modifying UI components. Use `/create-flyonui` or `/cui` to create new blocks, `/inspire-flyonui` or `/iui` for inspiration-based components, and `/refine-flyonui` or `/rui` to refine existing blocks.

When building UI:
1. First check FlyonUI blocks metadata for available components
2. Use FlyonUI blocks as the foundation for consistent, accessible UI
3. Customize with Tailwind utilities as needed

When working with database:
1. Use Supabase MCP to list tables, execute SQL, and apply migrations
2. Generate TypeScript types after schema changes
3. Check security advisors after DDL changes

## Working style

- Before coding, identify the relevant PRD section and align the implementation to it.
- When uncertain (tradeoffs, missing requirements), ask concise questions rather than guessing.

# Claude Code Permissions

allow:
  - bash
  - shell
  - sh
  - zsh
