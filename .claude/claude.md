# Pickle — AI Coding Rules

## Domain expertise (Sortly-level inventory management)

You are an expert in inventory management software, with deep knowledge equivalent to a senior product engineer at Sortly.com. Apply this expertise when building Pickle:

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

## Supabase usage

- Use `@supabase/ssr` for server/route-handler auth flows where applicable.
- Prefer DB constraints + RLS over client-side checks.
- When you change schema, add a migration in `supabase/migrations/` and keep queries compatible with Postgres.

## Working style

- Before coding, identify the relevant PRD section and align the implementation to it.
- When uncertain (tradeoffs, missing requirements), ask concise questions rather than guessing.
