# Next.js 16 + Supabase + PWA — Phase-by-Phase QA Checklist (Copy/Paste)

> Use this as your full test plan: **Phase 1 → Phase 8**  
> Rule: **No page / no feature ships unless its phase checklist is ✅**

---

## Phase 1 — Scope, risks, and test data (before testing)
### 1.1 Define what “done” means
- [ ] List Top 3 critical user workflows (P0)
- [ ] List Top 10 supporting workflows (P1)
- [ ] Define roles: user / admin / read-only / disabled / multi-tenant
- [ ] Define devices: desktop + iPhone + Android
- [ ] Define browsers: Chrome + Safari + Firefox + Edge
- [ ] Define network: offline + slow + flaky

### 1.2 Test accounts & data sets
- [ ] Accounts created:
  - [ ] New user (never onboarded)
  - [ ] Normal user
  - [ ] Admin
  - [ ] Read-only (if exists)
  - [ ] Disabled/banned
  - [ ] Tenant A user + Tenant B user (for isolation)
- [ ] Data sets prepared:
  - [ ] Empty state tenant
  - [ ] Small dataset (10–50 records)
  - [ ] Large dataset (10k+ records)
  - [ ] “Dirty” dataset (emoji, long text, special chars, nulls)

### 1.3 Environments & observability
- [ ] Environments validated: local / staging / prod
- [ ] Correct env vars present (Supabase URL/keys, redirects, site URL)
- [ ] Error tracking enabled (Sentry or equivalent)
- [ ] Logs accessible (server + client)
- [ ] Analytics events visible (if used)

---

## Phase 2 — Smoke + Stability (must pass first)
### 2.1 Smoke pack (10–15 mins)
- [ ] App loads from cold start (no blank screen)
- [ ] No console errors on landing + login + dashboard
- [ ] Signup works (or disabled intentionally)
- [ ] Login works
- [ ] Logout works (session cleared)
- [ ] Navigate core routes (direct URL, back/forward)
- [ ] Create 1 record in main module successfully
- [ ] PWA install works (where supported)

### 2.2 Basic crash-proofing
- [ ] Any API failure shows a friendly error + retry option
- [ ] Loading states appear (no frozen UI)
- [ ] Empty state is designed + actionable
- [ ] Hard refresh on any page doesn’t break routing/auth

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
- [ ] Signup: email format + password rules + edge cases
- [ ] Verify email flow works + expired token handling
- [ ] Password reset works end-to-end
- [ ] OAuth works (if any): missing email, revoked consent, provider errors
- [ ] Rate limiting / lockout behavior acceptable

### 5.2 Session lifecycle (Next.js)
- [ ] Session persists across refresh
- [ ] Session refresh before expiry (no surprise logout)
- [ ] Multi-tab: logout in one tab invalidates others
- [ ] Deep link: unauth → login → return to intended page

### 5.3 RLS (must test like an attacker)
- [ ] Tenant A cannot read Tenant B list
- [ ] Tenant A cannot read Tenant B detail by guessing ID
- [ ] Tenant A cannot update Tenant B record
- [ ] Tenant A cannot delete Tenant B record
- [ ] Storage: Tenant A cannot access Tenant B files
- [ ] Admin powers are intentional + audited

### 5.4 OWASP basics
- [ ] XSS: user input escaped everywhere (including markdown/html)
- [ ] IDOR: all object access is permission-checked server-side
- [ ] Open redirect blocked (returnUrl validation)
- [ ] Tokens not leaked via logs, URLs, analytics
- [ ] Security headers reasonable (as configured)

---

## Phase 6 — PWA Checklist (Install, Cache, Offline, Update)
### 6.1 Installability
- [ ] manifest.json valid (name, icons, start_url, scope, theme_color)
- [ ] Install on Chrome/Android works
- [ ] iOS Add-to-Home-Screen works (as supported)
- [ ] Standalone UI looks correct (no double nav bars)

### 6.2 Service Worker
- [ ] Registers successfully (no infinite reload)
- [ ] Cache versioning correct (no mixed JS/CSS)
- [ ] Update flow correct:
  - [ ] New version detected
  - [ ] User refresh/update UX is clear
  - [ ] No broken state after update

### 6.3 Offline & caching correctness
- [ ] Offline behavior is correct (offline page vs cached shell)
- [ ] No caching of private/authenticated API responses unless explicitly safe
- [ ] Cached content doesn’t show another user’s data on shared device
- [ ] Storage quota handling (cache eviction) doesn’t break app
- [ ] Optional: background sync works (queued writes replay correctly)

### 6.4 Push notifications (if used)
- [ ] Permission prompt shown at right time
- [ ] Opt-out works
- [ ] Deep link opens correct screen
- [ ] No duplicate notifications

---

## Phase 7 — Non-Functional (Performance, A11y, Cross-browser)
### 7.1 Performance (real user experience)
- [ ] Lighthouse mobile acceptable (LCP/INP/CLS)
- [ ] Bundle size reasonable on key routes
- [ ] Large lists usable (virtualization if needed)
- [ ] No hydration mismatch warnings
- [ ] No memory leak during long session (realtime/listeners)

### 7.2 Cross-browser/device
- [ ] Safari (mac + iOS) critical flows pass
- [ ] iOS keyboard doesn’t break inputs/scroll
- [ ] Android install + offline + resume works
- [ ] Responsive layout good at smallest supported width

### 7.3 Accessibility basics
- [ ] Keyboard-only navigation works for core flows
- [ ] Focus visible and predictable
- [ ] Modal focus trap + ESC close
- [ ] Contrast acceptable for text/buttons

---

## Phase 8 — Regression Pack + Release Gate
### 8.1 Daily regression (P0)
- [ ] App load + login + logout
- [ ] Dashboard loads correctly
- [ ] Top 3 workflows end-to-end
- [ ] Permissions check: user cannot access admin page
- [ ] Tenant isolation quick check (A cannot open B record)
- [ ] Offline quick check (airplane mode → app shows correct UI)
- [ ] PWA update check (if new build shipped)

### 8.2 Release gate (GO/NO-GO)
- [ ] 100% pass: Smoke + Auth + Top 3 workflows
- [ ] No P0/P1 bugs open
- [ ] RLS tested + proven (no cross-tenant read/write)
- [ ] PWA update path tested (old → new)
- [ ] Perf budget met on key routes
- [ ] Rollback plan ready + migrations safe

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
- [x] /404 (not-found.tsx — implemented)
- [x] /500 (error.tsx + global-error.tsx — implemented)
- [x] Offline fallback page (public/offline.html — implemented)
