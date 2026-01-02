# Marketing TODO (SEO + Conversion + LLM Discovery)
Source of truth: `docs/WebsiteGuideline.md` (2026-01-01)

## Definition of done (for every marketing page)
- [ ] One primary keyword + 3–8 close variants (H2/FAQ/body only; avoid cannibalization).
- [ ] Title tag (≤ 60 chars) + meta description (≤ 155 chars) written for CTR.
- [ ] Single clear H1; scannable H2/H3 structure; plain language; outcome-first.
- [ ] “What it is / Who it’s for / How it works” blocks (AI-summary friendly).
- [ ] 5–10 FAQs written from real intent; add FAQ schema when applicable.
- [ ] Internal links: Pricing + Demo + 1 feature + 1 solution + 1 guide (if relevant).
- [ ] Canonical, OG, Twitter, and minimal JSON-LD for the page type.
- [ ] “Last updated” date on key pages (Home, Pricing, Compare, Migration, Security, Guides).

---

## 1) Keyword map (one primary keyword per URL)
Use this to prevent cannibalization while still matching exact query phrasing.

| URL | Primary keyword (must appear in Title/H1) | Secondary variants (H2/FAQ/body) | Intent |
|---|---|---|---|
| `/` | inventory management with barcode scanning | barcode inventory software, simple inventory tracking, barcode inventory control software | Commercial |
| `/pricing` | inventory management software pricing | trust-first pricing, no SKU cliffs, inventory software cost | Commercial |
| `/demo` | inventory management software demo | barcode inventory demo, inventory barcode scanning demo | Commercial |
| `/features` | inventory management software features | barcode scanning, offline mode, check-in/check-out, low stock alerts | Commercial |
| `/features/barcode-scanning` | barcode inventory tracking software | inventory management software with barcode scanner, barcode stock management software, barcode inventory control software | Commercial |
| `/features/offline-mobile-scanning` | offline inventory app | offline barcode scanning, mobile inventory app, Android inventory app | Commercial |
| `/features/check-in-check-out` | inventory check in check out | tool checkout tracking, asset check in/check out, issue/return by scan | Commercial |
| `/features/bulk-editing` | bulk edit inventory software | Excel alternative for inventory, CSV import inventory, preview diffs + undo | Commercial |
| `/features/low-stock-alerts` | low stock alerts inventory software | reorder points, reorder notifications, stockout prevention | Commercial |
| `/solutions/warehouse` | warehouse inventory tracking | warehouse inventory management with barcode scanner, cycle counts, receiving/picking | Commercial |
| `/solutions/ecommerce` | ecommerce inventory management | best inventory software for ecommerce, multi-location stock truth, prevent stockouts | Commercial |
| `/solutions/construction-tools` | tool tracking software | construction inventory management, asset checkouts, offline jobsites | Commercial |
| `/solutions/small-business` | simple inventory software | inventory software for small business, replace spreadsheets, easy onboarding | Commercial |
| `/compare/sortly-alternative` | Sortly alternative | trust-first pricing, offline barcode scanning, check-in/check-out workflows | BOFU |
| `/migration/sortly` | Sortly migration | import from Sortly, CSV template, mapping guide | BOFU |
| `/integrations` | inventory management ecommerce integrations | Shopify/WooCommerce, accounting exports, barcode scanners | Commercial |
| `/security` | inventory software security | multi-tenant RLS isolation, RBAC, audit logs | Trust |
| `/learn/perpetual-vs-periodic-inventory` | perpetual inventory vs periodic inventory | inventory perpetual vs periodic, definitions, pros/cons | Informational |

---

## 2) Shared messaging (use everywhere)
- [ ] Positioning sentence (verbatim): “An inventory system your whole team can use in minutes — with barcode scanning, offline reliability, and pricing that doesn’t punish growth.”
- [ ] 3 core promises appear across key pages: Speed, Accuracy, Simplicity.
- [ ] Anti-Sortly differentiators woven in (without being insulting):
  - [ ] Trust-first pricing (no surprise tier jumps / no SKU cliffs).
  - [ ] Native check-in/check-out workflow.
  - [ ] Offline-first mobile scanning reliability.
  - [ ] Bulk editing with guardrails (preview diffs + undo).
  - [ ] Inventory trust layer (last verified / confidence indicators).
  - [ ] 1-click migration (especially Sortly).

---

## 3) Proof assets (build credibility)
- [ ] Record 10–30s clips (each gets a VideoObject schema on its primary page):
  - [ ] Scan → confirm → done (barcode scan + adjust).
  - [ ] Stock count workflow (fast count + discrepancy fix).
  - [ ] Check-out to staff (due dates + overdue).
  - [ ] Bulk edit preview diffs + undo.
- [ ] Screenshot/GIF library:
  - [ ] Audit trail / last verified.
  - [ ] Low stock alerts (min/max).
  - [ ] Multi-location hierarchy (warehouse → shelf → bin).
  - [ ] Import mapping (CSV/Sortly).
- [ ] “Migration in < 30 minutes” story outline (turn into case study when data exists).

---

## 4) Page briefs (write content + SEO + schema)

### 4.1 Home (`/`)
- [ ] Above-the-fold matches guideline spec (H1/subhead/CTAs/trust bar).
- [ ] Add “Pain → Promise” section (3 bullets) using SMB language (no ERP vibe).
- [ ] Feature highlights: scan, check-in/out, low stock alerts, bulk edit (each links to its feature page).
- [ ] Use-case tiles: Warehouse / Ecommerce / Construction / Small business (each links to solution page).
- [ ] “Why different than Sortly” teaser + link to `/compare/sortly-alternative` + `/migration/sortly`.
- [ ] FAQ targets top frictions: offline, scanners, SKUs, migration, checkouts.
- [ ] Schema: Organization + WebSite + SoftwareApplication/Product + FAQPage.

### 4.2 Pricing (`/pricing`)
- [ ] Plans include “no SKU cliffs / transparent scaling” language.
- [ ] Risk reversal block: price-lock guarantee + cancellation + data ownership (export anytime).
- [ ] Comparison table includes the must-have features (scan, check-in/out, offline, audit, multi-location, roles).
- [ ] FAQ: pricing edge cases (multi-location, scanners, migration, team size).
- [ ] Schema: SoftwareApplication/Product + FAQPage + BreadcrumbList.

### 4.3 Demo (`/demo`)
- [ ] 90s overview + 3 workflow clips (scan/stock count/check-out tool).
- [ ] “What you’ll see” checklist (fast, scannable).
- [ ] Add “Who it’s for” (owner/ops/field/ecom) + routing CTAs to solutions.
- [ ] Schema: VideoObject (for each primary video) + SoftwareApplication.

### 4.4 Features hub (`/features`)
- [ ] “Feature promise” intro: speed + accuracy + simplicity.
- [ ] Link grid to each feature detail page with outcome-first titles.
- [ ] Add “Compared to spreadsheets” snippet (credibility).
- [ ] Add FAQ (scanners, offline, checkouts, imports, audit logs).
- [ ] Schema: SoftwareApplication + FAQPage.

### 4.5 Feature detail pages (`/features/*`)
Apply this template to each feature page:
- [ ] Outcome-first hero (primary keyword in Title/H1).
- [ ] “How it works” (3 steps) with job-to-be-done language.
- [ ] “Real workflows” section (receiving/counting/picking/checkouts as relevant).
- [ ] “Supported hardware” table when relevant (camera/Bluetooth/rugged devices).
- [ ] 5–10 FAQs with exact-match query phrasing (FAQ schema).
- [ ] Internal links (Pricing/Demo + relevant solution + migration link if switch intent).

### 4.6 Solutions hub (`/solutions`)
- [ ] Persona-driven summary (owner/ops/field/ecom).
- [ ] Tile grid linking to each use case with “typical day” outcomes.
- [ ] Add “Pick the workflow” CTA to Demo + Pricing.
- [ ] Schema: SoftwareApplication + FAQPage.

### 4.7 Solution pages (`/solutions/*`)
Apply this template per solution page:
- [ ] “Typical day” narrative (make it vivid; operational language).
- [ ] 3 biggest pains + how we solve (tie to differentiators).
- [ ] Only relevant features (avoid feature dump).
- [ ] Setup steps (import → label → scan) + time-to-value promise.
- [ ] Metrics (even if directional): time saved, fewer stockouts, fewer losses.
- [ ] FAQ: solution-specific objections (offline, scanners, multi-location, accountability).
- [ ] Schema: SoftwareApplication + FAQPage + BreadcrumbList.

### 4.8 Compare hub (`/compare`)
- [ ] Create a short “How we compare” intro (factual).
- [ ] Add a grid for competitor alternatives (Sortly now; add others below).
- [ ] Add “When Pickle is best” vs “When competitor is enough” pattern.

### 4.9 Sortly alternative (`/compare/sortly-alternative`)
- [ ] Quick verdict table (5–8 rows) with measurable/falsifiable phrasing.
- [ ] Add “When Sortly is enough” section (credibility).
- [ ] Add “When you should switch” section (pain points: pricing jumps, workflow hacks, offline issues).
- [ ] Migration block + link to `/migration/sortly` + downloadable CSV template.
- [ ] FAQ: pricing, exports, data ownership, support, scanners, offline.
- [ ] Schema: FAQPage + SoftwareApplication + BreadcrumbList.

### 4.10 Migration hub (`/migration`) + Sortly migration (`/migration/sortly`)
- [ ] Migration hub: choose your source (Sortly first; add others later).
- [ ] Sortly migration page: step-by-step with screenshots + mapping table.
- [ ] Provide CSV template + field definitions (make it indexable).
- [ ] Add “common import errors” troubleshooting (LLM-friendly).
- [ ] Schema: HowTo (steps) + FAQPage + BreadcrumbList.

### 4.11 Integrations (`/integrations`)
- [ ] List key integration categories (ecom, scanners, exports, accounting).
- [ ] Add “What we integrate with today” vs “What’s on roadmap” (trust).
- [ ] Add FAQ (Shopify/WooCommerce, scanners, import/export formats).
- [ ] Schema: FAQPage + SoftwareApplication.

### 4.12 Security (`/security`)
- [ ] Plain-language security overview (who it’s for: owners + IT-lite teams).
- [ ] Include security model: multi-tenant RLS, RBAC, audit logs, backups, access control.
- [ ] Add “Data ownership + export anytime” and “Incident response” basics.
- [ ] FAQ (encryption, access control, tenant isolation, backups, auth providers).
- [ ] Schema: FAQPage + Organization.

### 4.13 Legal (`/privacy`, `/terms`)
- [ ] Ensure clean, indexable HTML (minimal chrome).
- [ ] Add “Last updated” and clear headings for quick scanning.

### 4.14 Learning center (`/learn/*`)
- [ ] Publish the first authority guide: `/learn/perpetual-vs-periodic-inventory`.
- [ ] Add next 6 guides from guideline cadence:
  - [ ] reorder points / low stock alerts (how-to).
  - [ ] cycle counting checklist.
  - [ ] how to set up barcode labels.
  - [ ] inventory audit trail best practices.
  - [ ] warehouse receiving workflow.
  - [ ] spreadsheet inventory template (ungated if possible).
- [ ] Article schema for guides + internal links to relevant features/solutions.

---

## 5) LLM / AI discovery optimization (2026)
- [ ] Create `/llms.txt` (root) listing:
  - [ ] canonical money pages to cite (Home/Pricing/Demo/Compare/Migration/Security).
  - [ ] feature and solution hubs.
  - [ ] learning center index.
  - [ ] short product + pricing summary with “no SKU cliffs” positioning.
- [ ] Create indexable `/docs` pages (clean HTML, minimal chrome):
  - [ ] How barcode scanning works (supported scanners + workflow).
  - [ ] Offline mode & sync conflict handling.
  - [ ] Security model (multi-tenant RLS + RBAC + audit logs).
  - [ ] Import formats + CSV templates + field definitions.
- [ ] Make content citation-friendly:
  - [ ] Short factual paragraphs; definitions; step lists; tables.
  - [ ] Add “Key takeaways” bullets on guides and comparison pages.

---

## 6) Technical SEO & measurement
- [ ] Verify canonical URLs are self-referencing on every indexable marketing route.
- [ ] Verify robots/sitemap include marketing routes and exclude app routes.
- [ ] Add “noindex” where needed (internal search, auth/app pages, UTM duplicates).
- [ ] Validate schema with Rich Results test for key templates (FAQ/HowTo/Video/Article).
- [ ] Core Web Vitals pass on mobile (Lighthouse ≥ 90 for Performance/SEO on money pages).
- [ ] Analytics events (by page): Start trial clicks, demo submits, pricing toggle, compare CTAs, scroll depth.

---

## 7) Backlog (high-ROI pages from guideline)
- [ ] Competitive pages: `/compare/boxhero-alternative`, `/compare/inflow-alternative`, `/compare/fishbowl-alternative`.
- [ ] Trust pages: `/status` (or status section), `/changelog`, `/roadmap` (optional).
- [ ] Lead magnets: inventory spreadsheet template, cycle count checklist, barcode label PDF template.

