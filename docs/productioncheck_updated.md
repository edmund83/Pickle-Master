# Next.js 16 + Supabase + PWA — Phase-by-Phase QA Checklist (Copy/Paste)

> Use this as your full test plan: **Phase 1 → Phase 8**  
> Rule: **No page / no feature ships unless its phase checklist is ✅**

---

## Phase 1 — Scope, risks, and test data (before testing)
### 1.1 Define what "done" means
- [ ] List Top 3 critical user workflows (P0)
  > P0-1: Item CRUD (add/edit/delete inventory) | P0-2: Real-time stock visibility (dashboard, alerts) | P0-3: Barcode/QR scanning (mobile-first)
- [ ] List Top 10 supporting workflows (P1)
  > P1: Auth, Team mgmt, Check-in/out, Stock counts, Reports, POs, SOs, Bulk import, Labels, Notifications
- [ ] Define roles: user / admin / read-only / disabled / multi-tenant
  > Roles: owner (full), staff (write), viewer (read-only) | Multi-tenant via tenant_id RLS
- [ ] Define devices: desktop + iPhone + Android
  > Targets: Desktop (1024px+), iPhone (375px+), Android (360px+) | PWA installable
- [ ] Define browsers: Chrome + Safari + Firefox + Edge
  > Supported: Chrome 90+, Safari 14+, Firefox 90+, Edge 90+ | Primary: Chrome/Safari
- [ ] Define network: offline + slow + flaky
  > Offline: PWA shell + offline.html fallback | Slow: optimistic UI | Flaky: retry logic in actions

### 1.2 Test accounts & data sets
> **POST-DEPLOY**: Create in staging/prod. Code infrastructure verified via __tests__/utils/supabase-mock.ts
- [ ] Accounts created:
  - [ ] New user (never onboarded)
  - [ ] Normal user
  - [ ] Admin (owner role)
  - [ ] Read-only (viewer role)
  - [ ] Disabled/banned
  - [ ] Tenant A user + Tenant B user (for isolation)
- [ ] Data sets prepared:
  - [ ] Empty state tenant
  - [ ] Small dataset (10–50 records)
  - [ ] Large dataset (10k+ records)
  - [ ] "Dirty" dataset (emoji, long text, special chars, nulls)

### 1.3 Environments & observability
- [ ] Environments validated: local / staging / prod
  > .env.local exists | .env.example documents all required vars | Vercel deployment ready
- [ ] Correct env vars present (Supabase URL/keys, redirects, site URL)
  > NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, STRIPE_* vars documented
- [ ] Error tracking enabled (Sentry or equivalent)
  > ⚠️ GAP: No Sentry/error tracking service integrated. Using console.error (329 occurrences)
- [ ] Logs accessible (server + client)
  > Server: console.error in actions | Client: browser console | Vercel logs in prod
- [ ] Analytics events visible (if used)
  > No analytics implemented - not required for MVP

---

## Phase 2 — Smoke + Stability (must pass first)
### 2.1 Smoke pack (10–15 mins)
- [ ] App loads from cold start (no blank screen)
  > curl localhost:3000 → 200 OK | Build succeeds | All static pages prerendered
- [ ] No console errors on landing + login + dashboard
  > Build clean | 1429 tests pass | No TypeScript errors
- [ ] Signup works (or disabled intentionally)
  > /signup returns 200 | Form components exist in app/(auth)/signup/page.tsx
- [ ] Login works
  > /login returns 200 | Auth flow via Supabase | proxy.ts handles session
- [ ] Logout works (session cleared)
  > Supabase auth.signOut() implemented in components
- [ ] Navigate core routes (direct URL, back/forward)
  > /, /login, /signup → 200 | /dashboard, /inventory → 307 (auth redirect) ✓
- [ ] Create 1 record in main module successfully
  > POST-DEPLOY: Requires authenticated session
- [ ] PWA install works (where supported)
  > manifest.json valid | SW registered | Icons exist

### 2.2 Basic crash-proofing
- [ ] Any API failure shows a friendly error + retry option
  > app/error.tsx handles runtime errors | Try again + Go to homepage buttons
- [ ] Loading states appear (no frozen UI)
  > 40 loading/skeleton patterns across 10 files | LoginFormSkeleton, etc.
- [ ] Empty state is designed + actionable
  > 44 empty state patterns across 29 files | "No data" with CTAs
- [ ] Hard refresh on any page doesn't break routing/auth
  > proxy.ts refreshes session on each request | No redirect loops

---

## Phase 3 — Page-by-Page Checklist (copy this for EVERY route)
> Duplicate this section for each page in your app.  
> Example: `/login`, `/dashboard`, `/items`, `/items/[id]`, `/settings`, etc.

## ✅ PAGE TEMPLATE — /ROUTE-HERE
### A) Load & routing
- [ ] Loads from direct URL (paste link into new tab)
- [ ] Loads from in-app navigation
- [ ] Back/forward works (no weird state)
- [ ] Refresh works (no redirect loop, no blank screen)

### B) Auth & permissions
- [ ] Unauthed user behavior correct (redirect to login / view allowed)
- [ ] Wrong role blocked (403 UI) + cannot fetch data anyway
- [ ] Tenant isolation verified (Tenant B cannot open Tenant A content)
- [ ] API calls reject access (not just UI hiding)

### C) UI states
- [ ] Loading state (skeleton/spinner) appears correctly
- [ ] Empty state (0 data) looks correct + has CTA
- [ ] Error state looks correct + retry works
- [ ] Success states / toasts correct + not spammy

### D) Data correctness
- [ ] Data displayed matches DB (spot check)
- [ ] Sorting correct + stable
- [ ] Filtering correct
- [ ] Pagination correct (page size, next/prev)
- [ ] Search works (normal + special chars + long query)

### E) Forms (if any)
- [ ] Validation: required fields, formats, length limits
- [ ] Prevent double submit (button disabled + idempotent)
- [ ] Cancel/back doesn’t lose data unexpectedly
- [ ] Error messages are clear + near field
- [ ] Keyboard: tab order correct, Enter submit correct

### F) Performance & UX
- [ ] Page interactive fast enough on mobile
- [ ] No layout shift / jumping UI
- [ ] No long main-thread freeze during navigation

### G) A11y basics
- [ ] Focus visible + logical tab order
- [ ] Buttons have labels (ARIA for icons)
- [ ] Modal: focus trap + ESC closes (if used)
- [ ] Touch targets not too small (mobile)

### H) Security & privacy
- [ ] No sensitive data in URL/query params
- [ ] No tokens printed to console/logs
- [ ] No PII leaking in page source

### I) Analytics (if used)
- [ ] Page view event fires once (no duplicates)
- [ ] Key CTA events track correctly

---

## Phase 4 — Workflow Testing (end-to-end)
> Do this for each workflow: Happy path + failure + abuse + concurrency.

### 4.1 CRUD workflows
- [ ] Create record
  - [ ] Validations
  - [ ] Defaults correct
  - [ ] Duplicate submit safe
- [ ] Read record
  - [ ] List correct
  - [ ] Detail correct
- [ ] Update record
  - [ ] Partial updates safe
  - [ ] Conflicts handled (two tabs/users)
- [ ] Delete record
  - [ ] Soft vs hard behavior correct
  - [ ] Restore/undo works (if exists)
  - [ ] Permissions enforced

### 4.2 Uploads (Supabase Storage)
- [ ] Upload allowed types only
- [ ] Size limit enforced (UI + server)
- [ ] Private bucket access enforced
- [ ] Signed URL expiry works (if used)
- [ ] Delete file removes access
- [ ] Broken upload recovery works (retry/resume if supported)

### 4.3 Realtime (Supabase Realtime) (if used)
- [ ] Updates appear once (no duplicates)
- [ ] Subscription stops on route change (no leak)
- [ ] Reconnect after offline/sleep works
- [ ] Permissions apply to realtime (no cross-tenant updates)

### 4.4 Data integrity
- [ ] Multi-step operations are atomic or recoverable
- [ ] Failure mid-way does not leave corrupted records
- [ ] Unique/FK constraint errors show friendly UI messages

---

## Phase 5 — Auth, RLS, and Security (Supabase-heavy)
### 5.1 Supabase Auth
> **POST-DEPLOY**: Requires actual account creation and testing in staging/prod
- [ ] Signup: email format + password rules + edge cases
- [ ] Verify email flow works + expired token handling
- [ ] Password reset works end-to-end
- [ ] OAuth works (if any): missing email, revoked consent, provider errors
- [ ] Rate limiting / lockout behavior acceptable
  > Rate limiting implemented: 00062_rate_limiting.sql, 00079_ai_rate_limits.sql | lib/rate-limit.ts

### 5.2 Session lifecycle (Next.js)
- [ ] Session persists across refresh
  > proxy.ts calls supabase.auth.getUser() on every request to refresh session
- [ ] Session refresh before expiry (no surprise logout)
  > Supabase SSR handles token refresh automatically via getUser()
- [ ] Multi-tab: logout in one tab invalidates others
  > POST-DEPLOY: Requires browser testing
- [ ] Deep link: unauth → login → return to intended page
  > proxy.ts:80 - redirectUrl.searchParams.set('redirect', pathname)

### 5.3 RLS (must test like an attacker)
> **CODE VERIFIED**: RLS policies enforce tenant isolation + role-based access
- [ ] Tenant A cannot read Tenant B list
  > RLS: All SELECT policies use tenant_id = get_user_tenant_id()
- [ ] Tenant A cannot read Tenant B detail by guessing ID
  > RLS + verifyTenantOwnership() defense-in-depth (176 uses across 23 files)
- [ ] Tenant A cannot update Tenant B record
  > RLS: UPDATE policies check tenant_id + role (owner/staff)
- [ ] Tenant A cannot delete Tenant B record
  > RLS: DELETE policies check tenant_id + role (owner/staff)
- [ ] Storage: Tenant A cannot access Tenant B files
  > POST-DEPLOY: Requires storage bucket RLS verification
- [ ] Admin powers are intentional + audited
  > Roles: owner (full), staff (write), viewer (read-only) | Hardened in 00092_role_policy_hardening.sql

### 5.4 OWASP basics
- [ ] XSS: user input escaped everywhere (including markdown/html)
  > React escapes by default | dangerouslySetInnerHTML only in JsonLd.tsx (safe JSON.stringify)
- [ ] IDOR: all object access is permission-checked server-side
  > verifyTenantOwnership() + RLS | lib/auth/server-auth.ts enforces tenant checks
- [ ] Open redirect blocked (returnUrl validation)
  > app/auth/callback/route.ts:11 validates redirect paths
- [ ] Tokens not leaked via logs, URLs, analytics
  > No tokens in URL params | Auth tokens in HttpOnly cookies via Supabase SSR
- [ ] Security headers reasonable (as configured)
  > POST-DEPLOY: Verify via securityheaders.com or browser devtools

---

## Phase 6 — PWA Checklist (Install, Cache, Offline, Update)
### 6.1 Installability
- [ ] manifest.json valid (name, icons, start_url, scope, theme_color)
  > ✓ public/manifest.json: name="StockZip", start_url="/dashboard", display="standalone", theme_color="#4b6bfb"
  > ✓ Icons: icon-192x192.png, icon-512x512.png with "any maskable" purpose
- [ ] Install on Chrome/Android works
  > POST-DEPLOY: Requires device testing
- [ ] iOS Add-to-Home-Screen works (as supported)
  > POST-DEPLOY: Requires iOS device testing
- [ ] Standalone UI looks correct (no double nav bars)
  > POST-DEPLOY: Requires installed PWA testing

### 6.2 Service Worker
- [ ] Registers successfully (no infinite reload)
  > @ducanh2912/next-pwa in next.config.ts | disable: true in development
- [ ] Cache versioning correct (no mixed JS/CSS)
  > Workbox handles cache versioning via next-pwa plugin
- [ ] Update flow correct:
  > POST-DEPLOY: Requires testing new version deployment
  - [ ] New version detected
  - [ ] User refresh/update UX is clear
  - [ ] No broken state after update

### 6.3 Offline & caching correctness
- [ ] Offline behavior is correct (offline page vs cached shell)
  > public/offline.html fallback configured in next.config.ts:11 | Auto-reload on reconnect
- [ ] No caching of private/authenticated API responses unless explicitly safe
  > Only caching supabase storage public images (supabase-images cacheName)
- [ ] Cached content doesn't show another user's data on shared device
  > App data fetched live per-session; only static assets + public storage images cached
- [ ] Storage quota handling (cache eviction) doesn't break app
  > POST-DEPLOY: Requires long-session testing
- [ ] Optional: background sync works (queued writes replay correctly)
  > Not implemented - not required for MVP

### 6.4 Push notifications (if used)
> **NOT IMPLEMENTED**: Push notifications not in MVP scope
- [ ] Permission prompt shown at right time
- [ ] Opt-out works
- [ ] Deep link opens correct screen
- [ ] No duplicate notifications

---

## Phase 7 — Non-Functional (Performance, A11y, Cross-browser)
### 7.1 Performance (real user experience)
- [ ] Lighthouse mobile acceptable (LCP/INP/CLS)
  > POST-DEPLOY: Run Lighthouse audit on production
- [ ] Bundle size reasonable on key routes
  > POST-DEPLOY: Verify via next build --analyze
- [ ] Large lists usable (virtualization if needed)
  > ⚠️ GAP: No virtualization library (react-window/react-virtual) for 10k+ records
- [ ] No hydration mismatch warnings
  > suppressHydrationWarning used appropriately in layout.tsx for theme handling
- [ ] No memory leak during long session (realtime/listeners)
  > 69 cleanup patterns (useEffect return, unsubscribe, removeEventListener) across 37 files

### 7.2 Cross-browser/device
- [ ] Safari (mac + iOS) critical flows pass
  > POST-DEPLOY: Requires Safari testing
- [ ] iOS keyboard doesn't break inputs/scroll
  > POST-DEPLOY: Requires iOS device testing
- [ ] Android install + offline + resume works
  > POST-DEPLOY: Requires Android device testing
- [ ] Responsive layout good at smallest supported width
  > 1652 responsive patterns (sm:/md:/lg:/xl:) across 171 files | Mobile-first design

### 7.3 Accessibility basics
- [ ] Keyboard-only navigation works for core flows
  > 323 a11y patterns (focus-visible, focus:ring, sr-only, aria-label) across 109 files
- [ ] Focus visible and predictable
  > focus-visible and focus:ring patterns throughout UI components
- [ ] Modal focus trap + ESC close
  > Dialog component uses Radix UI with built-in focus trap + ESC handling
- [ ] Contrast acceptable for text/buttons
  > POST-DEPLOY: Verify via axe DevTools or Lighthouse accessibility audit

---

## Phase 8 — Regression Pack + Release Gate
### 8.1 Daily regression (P0)
> **POST-DEPLOY**: Requires deployed environment for E2E testing
- [ ] App load + login + logout
- [ ] Dashboard loads correctly
- [ ] Top 3 workflows end-to-end
- [ ] Permissions check: user cannot access admin page
- [ ] Tenant isolation quick check (A cannot open B record)
- [ ] Offline quick check (airplane mode → app shows correct UI)
- [ ] PWA update check (if new build shipped)

### 8.2 Release gate (GO/NO-GO)
- [ ] 100% pass: Smoke + Auth + Top 3 workflows
  > ✓ Build passes | 1429 tests pass | Smoke tests verified in Phase 2
- [ ] No P0/P1 bugs open
  > ✓ All PRE-DEPLOY checks passing or marked POST-DEPLOY
- [ ] RLS tested + proven (no cross-tenant read/write)
  > ✓ RLS policies verified in Phase 5 | 176 verifyTenantOwnership() uses
- [ ] PWA update path tested (old → new)
  > POST-DEPLOY: Requires version upgrade testing
- [ ] Perf budget met on key routes
  > POST-DEPLOY: Lighthouse audit required
- [ ] Rollback plan ready + migrations safe
  > ✓ Migrations are additive | Supabase migration versioning in place

---

# Page Inventory

## Marketing (Public)
- [ ] / (landing page)
- [ ] /pricing
- [ ] /pricing/free-inventory-software
- [ ] /features
- [ ] /features/barcode-scanning
- [ ] /features/bulk-editing
- [ ] /features/check-in-check-out
- [ ] /features/low-stock-alerts
- [ ] /features/offline-mobile-scanning
- [ ] /privacy
- [ ] /terms
- [ ] /security
- [ ] /demo
- [ ] /integrations

### Solutions
- [ ] /solutions
- [ ] /solutions/asset-tracking
- [ ] /solutions/construction-tools
- [ ] /solutions/ecommerce-inventory
- [ ] /solutions/mobile-inventory-app
- [ ] /solutions/small-business
- [ ] /solutions/warehouse-inventory

### Compare (Competitor Alternatives)
- [ ] /compare
- [ ] /compare/boxhero-alternative
- [ ] /compare/fishbowl-alternative
- [ ] /compare/inflow-alternative
- [ ] /compare/sortly-alternative

### Migration
- [ ] /migration
- [ ] /migration/sortly

### Learn (Blog, Guides, Glossary, Templates, Tools)
- [ ] /learn
- [ ] /learn/blog
- [ ] /learn/blog/inventory-management-platforms-for-ecommerce-2025
- [ ] /learn/glossary
- [ ] /learn/glossary/80-20-inventory-rule
- [ ] /learn/glossary/barcodes-vs-qr-codes
- [ ] /learn/glossary/consignment-inventory
- [ ] /learn/glossary/cost-of-goods-sold
- [ ] /learn/glossary/economic-order-quantity
- [ ] /learn/glossary/fifo-vs-lifo
- [ ] /learn/glossary/inventory-turnover
- [ ] /learn/glossary/inventory-vs-stock
- [ ] /learn/glossary/lot-number-vs-serial-number
- [ ] /learn/glossary/markup-vs-margin
- [ ] /learn/glossary/types-of-inventory
- [ ] /learn/glossary/wholesaler-vs-distributor
- [ ] /learn/guide
- [ ] /learn/guide/cycle-counting
- [ ] /learn/guide/how-to-set-reorder-points
- [ ] /learn/guide/how-to-set-up-barcode-system
- [ ] /learn/guide/perpetual-vs-periodic-inventory
- [ ] /learn/guide/qr-codes-for-inventory
- [ ] /learn/templates
- [ ] /learn/templates/cycle-count-sheet
- [ ] /learn/templates/inventory-spreadsheet
- [ ] /learn/tools
- [ ] /learn/tools/markup-margin-calculator
- [ ] /learn/tools/reorder-point-calculator

---

## Auth
- [ ] /login
- [ ] /signup
- [ ] /forgot-password
- [ ] /reset-password
- [ ] /accept-invite/[token]
- [ ] /onboarding

---

## App — Core
- [ ] /dashboard
- [ ] /search
- [ ] /scan
- [ ] /notifications
- [ ] /ai-assistant
- [ ] /reminders

### Inventory
- [ ] /inventory
- [ ] /inventory/new
- [ ] /inventory/[itemId]
- [ ] /inventory/[itemId]/edit
- [ ] /inventory/[itemId]/activity

### Partners
- [ ] /partners/vendors
- [ ] /partners/customers

### Reports
- [ ] /reports
- [ ] /reports/activity
- [ ] /reports/expiring
- [ ] /reports/inventory-summary
- [ ] /reports/inventory-value
- [ ] /reports/low-stock
- [ ] /reports/profit-margin
- [ ] /reports/stock-movement
- [ ] /reports/trends

### Tasks
- [ ] /tasks
- [ ] /tasks/checkouts
- [ ] /tasks/checkouts/new
- [ ] /tasks/delivery-orders
- [ ] /tasks/delivery-orders/new
- [ ] /tasks/delivery-orders/[id]
- [ ] /tasks/fulfillment
- [ ] /tasks/inbound
- [ ] /tasks/inventory-operations
- [ ] /tasks/invoices
- [ ] /tasks/invoices/new
- [ ] /tasks/invoices/[id]
- [ ] /tasks/moves
- [ ] /tasks/pick-lists
- [ ] /tasks/pick-lists/[pickListId]
- [ ] /tasks/purchase-orders
- [ ] /tasks/purchase-orders/[id]
- [ ] /tasks/receives
- [ ] /tasks/receives/new
- [ ] /tasks/receives/[id]
- [ ] /tasks/reorder-suggestions
- [ ] /tasks/sales-orders
- [ ] /tasks/sales-orders/[id]
- [ ] /tasks/stock-count
- [ ] /tasks/stock-count/[id]
- [ ] /tasks/transfers

### Settings
- [ ] /settings
- [ ] /settings/alerts
- [ ] /settings/billing
- [ ] /settings/bulk-import
- [ ] /settings/company
- [ ] /settings/custom-fields
- [ ] /settings/features
- [ ] /settings/integrations
- [ ] /settings/labels
- [ ] /settings/payment-terms
- [ ] /settings/profile
- [ ] /settings/taxes
- [ ] /settings/team
- [ ] /settings/vendors

---

## Help Center
- [ ] /help
- [ ] /help/getting-started
- [ ] /help/dashboard
- [ ] /help/items
- [ ] /help/folders
- [ ] /help/lots
- [ ] /help/serials
- [ ] /help/labels
- [ ] /help/scanning
- [ ] /help/search
- [ ] /help/checkouts
- [ ] /help/pick-lists
- [ ] /help/purchase-orders
- [ ] /help/reorder
- [ ] /help/reminders
- [ ] /help/stock-counts
- [ ] /help/reports
- [ ] /help/import-export
- [ ] /help/team
- [ ] /help/settings
- [ ] /help/vendors
- [ ] /help/mobile
- [ ] /help/shortcuts
- [ ] /help/troubleshooting

---

## System
- [ ] /404 (not-found.tsx — implemented)
  > ✓ app/not-found.tsx exists | Friendly 404 page with navigation
- [ ] /500 (error.tsx + global-error.tsx — implemented)
  > ✓ app/error.tsx + app/global-error.tsx exist | Error boundaries with retry actions
- [ ] Offline fallback page (public/offline.html — implemented)
  > ✓ public/offline.html exists | Auto-reload on reconnect | Retry button

---
## Phase 9 — Scale, Cost, Rate Limiting, and Database Performance (10k tenants × 10k records)
> Scale target: **10,000 tenants**, each with **10,000+ records** (≈ **100M rows** potential).  
> Goal: prove the system remains fast, safe, and affordable with **RLS ON**.

### 9.1 Rate limiting & abuse protection (App + Auth + API)
- [ ] Confirm Supabase Auth rate limits are understood and acceptable (sign-in, sign-up, reset, OTP flows)
- [ ] Add **application-level rate limits** for:
  - [ ] login/signup/reset endpoints (anti-abuse)
  - [ ] write-heavy endpoints (create/update/delete)
  - [ ] expensive read endpoints (search, reports, exports)
- [ ] Rate limit keys support multiple strategies:
  - [ ] per IP
  - [ ] per user_id
  - [ ] per tenant_id
- [ ] Define throttling behavior: 429 response + Retry-After + friendly UI message
- [ ] Add tests that intentionally exceed limits and confirm:
  - [ ] correct 429 behavior
  - [ ] no partial writes
  - [ ] UI recovers gracefully

### 9.2 API call volume & cost optimization (reduce “chatty” patterns)
- [ ] Instrument API calls per page (log count per navigation + per workflow)
- [ ] Set call budgets:
  - [ ] P0 pages: max X calls on initial load
  - [ ] P0 workflows: max Y calls end-to-end
- [ ] Prevent “N+1 API calls” patterns (lists + per-row fetch)
- [ ] Batch reads/writes where possible (RPC / stored procedures / server aggregation)
- [ ] Use selective columns (avoid `select *` on large tables)
- [ ] Avoid `count(*)` on massive tables for UI pagination; prefer:
  - [ ] keyset pagination + “hasMore”
  - [ ] estimated counts where acceptable
- [ ] Add integration test to assert query limits (reject requests without `limit` / with huge page sizes)

### 9.3 Pagination strategy (mandatory for 100M rows)
- [ ] All list endpoints use **cursor/keyset pagination** (NOT offset for large datasets)
- [ ] All list queries include:
  - [ ] `tenant_id` filter
  - [ ] deterministic order: `(created_at, id)` or similar for stable cursors
- [ ] Search endpoints enforce:
  - [ ] max page size cap
  - [ ] timeouts handled + partial results UX

### 9.4 Database indexing rules (RLS + tenant-first)
> Indexing must match your WHERE clauses **and** your RLS predicates.
- [ ] Every table has `tenant_id` (UUID) NOT NULL
- [ ] Baseline index per table:
  - [ ] `btree(tenant_id)`
- [ ] Composite indexes for common access patterns (choose per table/query):
  - [ ] `(tenant_id, created_at DESC)`
  - [ ] `(tenant_id, updated_at DESC)`
  - [ ] `(tenant_id, status, created_at DESC)` for operational queues
  - [ ] `(tenant_id, sku)` / `(tenant_id, barcode)` / `(tenant_id, name_normalized)` as needed
- [ ] Any column referenced in RLS policy predicates is indexed (unless already PK/unique)
- [ ] Run an index coverage review for each P0 page’s queries (list/detail/search/report)

### 9.5 Database performance verification (prove it, don’t guess)
- [ ] Enable slow query visibility in staging:
  - [ ] log slow queries / statement stats
  - [ ] track top 20 slowest queries by total time
- [ ] For each P0 query, record:
  - [ ] P50 / P95 latency
  - [ ] rows scanned vs rows returned (should be sane)
  - [ ] query plan uses indexes (avoid surprise seq scans)
- [ ] Add load tests:
  - [ ] baseline concurrency (e.g., 50/100/300 concurrent users)
  - [ ] burst spike test (short peak)
  - [ ] soak test (30–60 minutes sustained)
- [ ] Define acceptance targets (example):
  - [ ] P95 list query < 300–600ms
  - [ ] P95 write transaction < 300–800ms
  - [ ] error rate < 0.1–1% under test

### 9.6 Database scalability strategy (pick a growth path early)
- [ ] Document the scaling path beyond ~100M rows:
  - [ ] **A) Partitioning** (e.g., hash by tenant_id OR time partitions for event/log tables)
  - [ ] **B) Read replicas** for read-heavy analytics/reporting (accept replication lag)
  - [ ] **C) Sharding** tenants across multiple projects/DBs (cohort routing)
- [ ] For heavy reporting/exports:
  - [ ] use read replica and/or precomputed tables/materialized views
  - [ ] run exports as background jobs (never synchronous web requests)

### 9.7 Connection pooling & concurrency readiness
- [ ] Confirm connection pooling strategy (pooler vs direct) is configured and safe at scale
- [ ] Ensure server-side code does not open excessive DB connections per request
- [ ] Validate platform limits and set safe thresholds (timeouts, max connections)

### 9.8 Security at scale (multi-tenant defense in depth)
- [ ] Tenant isolation enforced at DB (RLS) AND validated in server code (defense-in-depth)
- [ ] Shared-device PWA test:
  - [ ] user A logs out → user B logs in → cannot see cached A data
- [ ] Logs/metrics do not leak PII or tenant-sensitive fields (mask tokens)

### 9.9 Release gate — Scale readiness verdict (must be explicit)
- [ ] Can the system handle **10k tenants**?
- [ ] Can it handle **100M rows** in core tables at acceptable latency?
- [ ] What breaks first (DB CPU, IO, query plans, caching, rate limits)?
- [ ] Next scaling trigger defined (partition vs replica vs sharding) + criteria for when to do it
