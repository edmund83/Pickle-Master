# Pickle — AI Coding Rules

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
