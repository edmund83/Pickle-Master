# Marketing TODO (SEO + Conversion + LLM Discovery)
Authoritative source (strict): `docs/WebsiteGuideline.md` (2026-01-01)

This file is the **execution checklist** for building SEO-dominant marketing pages using **FlyonUI MCP page templates** (non-negotiable).

## Non‑Negotiables (Build Prompt Compliance)
- [ ] `WebsiteGuideline.md` is the source of truth for keyword clusters, URL mapping, template requirements, SEO structure, schema rules, and anti-cannibalization.
- [ ] Every **NEW** marketing page must be created from a **FlyonUI MCP template** (MCP call + template fetched + path recorded + full structure instantiated).
- [ ] Existing hand-built marketing pages are **non-compliant** until they are re-instantiated from a FlyonUI MCP page template (track as “Rebuild via MCP” in the register).
- [ ] No ad-hoc JSX / partial page builds for new marketing pages (start from MCP template; preserve the section structure and order).
- [ ] Content depth is mandatory: no thin/placeholder pages; every section must be meaningfully populated.
- [ ] SEO-first: one URL = one primary keyword cluster; no cannibalization.
- [ ] Validation loop must pass (`pnpm lint`, `pnpm test:run` (or `pnpm test`), `pnpm build`) before marking any page “Done”.

## Routing & Duplication Rules (Project)
- [ ] Marketing routes live under `app/(marketing)` (route group) so code stays organized while URLs stay clean.
- [ ] Marketing pages must resolve to **root slugs** (no `/marketing` prefix in URLs).
- [ ] If `/marketing/*` exists or is referenced, it must redirect to `/*` (no duplicate content).

## Definition of done (for every marketing page)
- [ ] FlyonUI MCP template fetched for this page (record **template name + MCP path** in the register below).
- [ ] MCP evidence captured (template meta + raw template snapshot stored, e.g. in `docs/FlyonUI-MCP-TemplateLog.md`).
- [ ] Full MCP template instantiated (all template sections present; section order preserved).
- [ ] All required sections are fully written (non-thin):
  - [ ] Hero (primary keyword-dominant H1 + value prop + CTAs)
  - [ ] Problem / pain (search-intent aligned)
  - [ ] Solution explanation
  - [ ] Feature / capability breakdown
  - [ ] Proof (screens/clips/examples **or** clearly marked TODO assets)
  - [ ] Use cases / scenarios
  - [ ] Objection handling / comparison (where applicable)
  - [ ] Primary CTA section
  - [ ] Secondary CTA / next-step guidance
  - [ ] FAQ section (SEO + LLM friendly)
- [ ] One primary keyword + 3–8 close variants (variants only in H2/FAQ/body; avoid cannibalization).
- [ ] Title tag (≤ 60 chars) + meta description (≤ 155 chars) written for CTR.
- [ ] Single clear H1; scannable H2/H3 structure; plain language; outcome-first.
- [ ] “What it is / Who it’s for / How it works” blocks (AI-summary friendly).
- [ ] 5–10 FAQs written from real intent; add FAQ schema when applicable.
- [ ] Internal links: Pricing + Demo + 1 feature + 1 solution + 1 guide (if relevant).
- [ ] Canonical, OG, Twitter, and minimal JSON-LD for the page type.
- [ ] “Last updated” date on key pages (Home, Pricing, Compare, Migration, Security, Guides).

## Execution process (MANDATORY per new page)
1. [ ] Confirm the page exists in `WebsiteGuideline.md` IA + keyword map (or add it there first).
2. [ ] Choose exactly **one** primary keyword cluster for the URL (no overlap with existing pages).
3. [ ] Call FlyonUI MCP (`get-block-meta-content` + `get-block-content`) and fetch the best-fit **page template**; record MCP path + save the raw template snapshot.
4. [ ] Instantiate the full template structure (no custom re-layout; preserve section order).
5. [ ] Populate every section with deep, intent-matching content (use guideline promises + anti-Sortly differentiators).
6. [ ] Add metadata + canonical + OG/Twitter + JSON-LD (schema depends on page type).
7. [ ] Run validation loop and fix until clean.

## Validation loop (must pass before “Done”)
- [ ] `pnpm lint`
- [ ] `pnpm test:run` (or `pnpm test`)
- [ ] `pnpm build`
- [ ] Spot-check SEO:
  - [ ] H1 matches primary keyword intent.
  - [ ] Canonical is correct and self-referencing.
  - [ ] Schema present and valid for the page type.
  - [ ] Internal links included per rules.

---

## 1) Page register (build tracker + MCP compliance)
Fill this table before shipping. A page is not compliant until it has a FlyonUI MCP template path recorded and passes the validation loop.

| URL | Page type | Primary keyword (Title/H1) | Secondary variants (H2/FAQ/body) | Intent | FlyonUI MCP template (name + path) | Schema (JSON‑LD) | Proof assets | Status |
|---|---|---|---|---|---|---|---|---|
| `/` | Landing | inventory management with barcode scanning | barcode inventory software, simple inventory tracking, barcode inventory control software | Commercial | TODO (MCP) | Organization, WebSite, SoftwareApplication/Product, FAQPage | TODO clips/screens | Rebuild via MCP |
| `/pricing` | Money | inventory management software pricing | trust-first pricing, no SKU cliffs, inventory software cost | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO table/examples | Rebuild via MCP |
| `/demo` | Money | inventory management software demo | barcode inventory demo, inventory barcode scanning demo | Commercial | TODO (MCP) | SoftwareApplication/Product, VideoObject | TODO videos/clips + lead form | Rebuild via MCP |
| `/contact-sales` | Money | inventory management software demo request | request a demo, contact sales, talk to an expert | BOFU | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO lead form + proof | Create via MCP |
| `/features` | Hub | inventory management software features | barcode scanning, offline mode, check-in/check-out, low stock alerts | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage | TODO screenshots | Rebuild via MCP |
| `/features/barcode-scanning` | Feature | barcode inventory tracking software | inventory management software with barcode scanner, barcode stock management software, barcode inventory control software | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, VideoObject | TODO scanner table + clip | Rebuild via MCP |
| `/features/offline-mobile-scanning` | Feature | offline inventory app | offline barcode scanning, mobile inventory app, Android inventory app | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, VideoObject | TODO offline proof + clip | Rebuild via MCP |
| `/features/check-in-check-out` | Feature | inventory check in check out | tool checkout tracking, asset check in/check out, issue/return by scan | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, VideoObject | TODO checkout clip | Rebuild via MCP |
| `/features/bulk-editing` | Feature | bulk edit inventory software | Excel alternative for inventory, CSV import inventory, preview diffs + undo | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage | TODO diff/undo proof | Rebuild via MCP |
| `/features/low-stock-alerts` | Feature | low stock alerts inventory software | reorder points, reorder notifications, stockout prevention | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage | TODO alert screenshots | Rebuild via MCP |
| `/solutions` | Hub | inventory management software use cases | warehouse inventory tracking, ecommerce inventory management, tool tracking software | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage | TODO use-case tiles | Rebuild via MCP |
| `/solutions/warehouse` | Solution | warehouse inventory tracking | warehouse inventory management with barcode scanner, cycle counts, receiving/picking | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO warehouse proof | Rebuild via MCP |
| `/solutions/ecommerce` | Solution | ecommerce inventory management | best inventory software for ecommerce, multi-location stock truth, prevent stockouts | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO ecom proof | Rebuild via MCP |
| `/solutions/construction-tools` | Solution | tool tracking software | construction inventory management, asset checkouts, offline jobsites | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO jobsite proof | Rebuild via MCP |
| `/solutions/small-business` | Solution | simple inventory software | inventory software for small business, replace spreadsheets, easy onboarding | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO SMB proof | Rebuild via MCP |
| `/solutions/mobile-inventory-app` | Solution | inventory tracking app android | stock management app android, mobile inventory app, offline inventory app | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO mobile proof | Rebuild via MCP |
| `/compare` | Hub | inventory management software comparison | best inventory software for ecommerce, warehouse inventory management software, Sortly alternative | Commercial | TODO (MCP) | SoftwareApplication/Product, BreadcrumbList | TODO comparison grid | Rebuild via MCP |
| `/compare/sortly-alternative` | Compare | Sortly alternative | trust-first pricing, offline barcode scanning, check-in/check-out workflows | BOFU | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO verdict table | Rebuild via MCP |
| `/compare/boxhero-alternative` | Compare | BoxHero alternative | barcode inventory tracking software, simple inventory software, offline inventory app | BOFU | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO verdict table | Rebuild via MCP |
| `/compare/inflow-alternative` | Compare | inFlow alternative | warehouse inventory tracking, inventory scanner software, barcode inventory software | BOFU | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO verdict table | Rebuild via MCP |
| `/compare/fishbowl-alternative` | Compare | Fishbowl alternative | warehouse inventory management software with barcode scanner, inventory barcode scanning | BOFU | TODO (MCP) | SoftwareApplication/Product, FAQPage, BreadcrumbList | TODO verdict table | Rebuild via MCP |
| `/migration` | Hub | inventory software migration | import inventory from CSV, inventory data migration, switch from Sortly | BOFU | TODO (MCP) | SoftwareApplication/Product, BreadcrumbList | TODO migration paths | Rebuild via MCP |
| `/migration/sortly` | Migration | Sortly migration | import from Sortly, CSV template, mapping guide | BOFU | TODO (MCP) | HowTo, FAQPage, BreadcrumbList | TODO mapping table | Rebuild via MCP |
| `/integrations` | Feature/Trust | inventory management integrations | ecommerce integrations, accounting exports, barcode scanners | Commercial | TODO (MCP) | SoftwareApplication/Product, FAQPage | TODO integrations table | Rebuild via MCP |
| `/security` | Trust | inventory software security | multi-tenant RLS isolation, RBAC, audit logs | Trust | TODO (MCP) | Organization, FAQPage | TODO security table | Rebuild via MCP |
| `/status` | Trust | inventory software status | status page, uptime, incident history | Informational | TODO (MCP) | WebSite, BreadcrumbList | N/A | Create via MCP |
| `/changelog` | Trust | inventory software changelog | release notes, product updates, what’s new | Informational | TODO (MCP) | WebSite, BreadcrumbList | TODO changelog feed | Create via MCP |
| `/learn` | Hub | inventory management guides | perpetual vs periodic inventory, reorder points, cycle counting checklist | Informational | TODO (MCP) | WebSite, BreadcrumbList | TODO guides index | Rebuild via MCP |
| `/learn/perpetual-vs-periodic-inventory` | Guide | perpetual inventory vs periodic inventory | inventory perpetual vs periodic, definitions, pros/cons | Informational | TODO (MCP) | Article, BreadcrumbList | TODO diagrams | Rebuild via MCP |
| `/learn/how-to-set-reorder-points` | Guide | how to set reorder points | reorder point notifications, low stock alerts, stockout prevention | Informational | TODO (MCP) | Article, (optional) HowTo, BreadcrumbList | TODO checklist/table | Rebuild via MCP |
| `/learn/cycle-counting-checklist` | Guide | cycle counting checklist | cycle counts, warehouse inventory accuracy, stock count process | Informational | TODO (MCP) | Article, HowTo, BreadcrumbList | TODO checklist/table | Create via MCP |
| `/learn/barcode-label-template` | Template | barcode label template | thermal printer labels, label sizes, barcode label PDF | Informational | TODO (MCP) | Article, BreadcrumbList | TODO download + size table | Create via MCP |
| `/learn/inventory-audit-trail-best-practices` | Guide | inventory audit trail best practices | audit log, inventory verification, last verified | Informational | TODO (MCP) | Article, BreadcrumbList | TODO examples/screens | Create via MCP |
| `/learn/warehouse-receiving-workflow` | Guide | warehouse receiving workflow | receiving process, putaway, barcode receiving | Informational | TODO (MCP) | Article, (optional) HowTo, BreadcrumbList | TODO workflow diagram | Create via MCP |
| `/learn/inventory-spreadsheet-template` | Template | inventory spreadsheet template | inventory spreadsheet, Excel inventory template, Google Sheets inventory template | Informational | TODO (MCP) | Article, BreadcrumbList | TODO download + guide | Create via MCP |
| `/learn/glossary` | Glossary | inventory glossary | inventory terms, SKU, cycle count, reorder point | Informational | TODO (MCP) | WebSite, BreadcrumbList | N/A | Create via MCP |
| `/learn/templates` | Hub | inventory templates | barcode labels, spreadsheet template, cycle count checklist | Informational | TODO (MCP) | WebSite, BreadcrumbList | TODO templates index | Create via MCP |
| `/docs` | Docs hub | inventory management documentation | barcode scanning docs, offline mode, security model, CSV import formats | Informational | TODO (MCP) | WebSite, BreadcrumbList | TODO docs index | Create via MCP |
| `/docs/barcode-scanning` | Docs | how barcode scanning works | supported scanners, QR vs barcode, scan workflows | Informational | TODO (MCP) | Article, BreadcrumbList | TODO scanners table | Create via MCP |
| `/docs/offline-mode` | Docs | offline mode inventory | offline-first, sync conflicts, offline barcode scanning | Informational | TODO (MCP) | Article, BreadcrumbList | TODO sync table | Create via MCP |
| `/docs/security-model` | Docs | inventory software security model | multi-tenant RLS, RBAC, audit logs | Informational | TODO (MCP) | Article, BreadcrumbList | TODO security diagram | Create via MCP |
| `/docs/import-formats` | Docs | inventory CSV import format | CSV templates, field definitions, Sortly mapping | Informational | TODO (MCP) | Article, (optional) HowTo, BreadcrumbList | TODO CSV table | Create via MCP |
| `/privacy` | Legal | privacy policy | data privacy, data ownership, exports | Trust | TODO (MCP) | (none) | N/A | Rebuild via MCP |
| `/terms` | Legal | terms of service | cancellation policy, data ownership, acceptable use | Trust | TODO (MCP) | (none) | N/A | Rebuild via MCP |

Legend: `Rebuild via MCP` = route exists but must be rebuilt from a FlyonUI MCP page template. `Create via MCP` = new page missing and must be created from MCP.

### Conversion pages (required for funnel, typically `noindex`)
These pages are part of the conversion path in `WebsiteGuideline.md` (trial/demo). They should be fast, trustworthy, and consistent with the marketing brand.

| URL | Page type | Primary intent | FlyonUI MCP template (name + path) | Notes | Status |
|---|---|---|---|---|---|
| `/signup` | Auth/Conversion | start free trial | TODO (MCP) | Typically `noindex`; optimize for completion rate, not rankings | Rebuild via MCP |
| `/login` | Auth | sign in | TODO (MCP) | `noindex`; keep minimal friction | Rebuild via MCP |
| `/forgot-password` | Auth | account recovery | TODO (MCP) | `noindex`; reduce support tickets | Rebuild via MCP |

---

## 2) Shared messaging (use everywhere)
- [ ] Positioning sentence (verbatim): "An inventory system your whole team can use in minutes — with barcode scanning, offline reliability, and pricing that doesn't punish growth."
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
- [ ] "Migration in < 30 minutes" story outline (turn into case study when data exists).

> **Note**: Video/screenshot assets are content creation tasks. Pages can ship with placeholders, but the Proof section must still be non-thin and specific.
>
> **Rule**: Even without final assets, every page must include a **non-thin Proof section** (with clearly labeled TODO placeholders and specific asset requirements).

---

## 4) Page briefs (write content + SEO + schema)
> Template rule: For each page, select a FlyonUI MCP **page template** that already includes the required sections (Hero → FAQ). Populate content inside the template; do not hand-compose new page layouts.

### 4.1 Home (`/`)
- [ ] Above-the-fold matches guideline spec (H1/subhead/CTAs/trust bar).
- [ ] Add "Pain → Promise" section (3 bullets) using SMB language (no ERP vibe).
- [ ] Feature highlights: scan, check-in/out, low stock alerts, bulk edit (each links to its feature page).
- [ ] Use-case tiles: Warehouse / Ecommerce / Construction / Small business (each links to solution page).
- [ ] "Why different than Sortly" teaser + link to `/compare/sortly-alternative` + `/migration/sortly`.
- [ ] FAQ targets top frictions: offline, scanners, SKUs, migration, checkouts.
- [ ] Schema: Organization + WebSite + SoftwareApplication/Product + FAQPage.

### 4.2 Pricing (`/pricing`)
- [ ] Plans include "no SKU cliffs / transparent scaling" language.
- [ ] Risk reversal block: price-lock guarantee + cancellation + data ownership (export anytime).
- [ ] Comparison table includes the must-have features (scan, check-in/out, offline, audit, multi-location, roles).
- [ ] FAQ: pricing edge cases (multi-location, scanners, migration, team size).
- [ ] Schema: SoftwareApplication/Product + FAQPage + BreadcrumbList.

### 4.3 Demo (`/demo`)
- [ ] 90s overview + 3 workflow clips (scan/stock count/check-out tool). *(Video placeholder ready for content)*
- [ ] "What you'll see" checklist (fast, scannable).
- [ ] Add "Who it's for" (owner/ops/field/ecom) + routing CTAs to solutions.
- [ ] Schema: VideoObject (for each primary video) + SoftwareApplication.

### 4.4 Features hub (`/features`)
- [ ] "Feature promise" intro: speed + accuracy + simplicity.
- [ ] Link grid to each feature detail page with outcome-first titles.
- [ ] Add "Compared to spreadsheets" snippet (credibility).
- [ ] Add FAQ (scanners, offline, checkouts, imports, audit logs).
- [ ] Schema: SoftwareApplication + FAQPage.

### 4.5 Feature detail pages (`/features/*`)
Apply this template to each feature page:
- [ ] Outcome-first hero (primary keyword in Title/H1).
- [ ] "How it works" (3 steps) with job-to-be-done language.
- [ ] "Real workflows" section (receiving/counting/picking/checkouts as relevant).
- [ ] "Supported hardware" table when relevant (camera/Bluetooth/rugged devices).
- [ ] 5–10 FAQs with exact-match query phrasing (FAQ schema).
- [ ] Internal links (Pricing/Demo + relevant solution + migration link if switch intent).

### 4.6 Solutions hub (`/solutions`)
- [ ] Persona-driven summary (owner/ops/field/ecom).
- [ ] Tile grid linking to each use case with "typical day" outcomes.
- [ ] Add "Pick the workflow" CTA to Demo + Pricing.
- [ ] Schema: SoftwareApplication + FAQPage.

### 4.7 Solution pages (`/solutions/*`)
Apply this template per solution page:
- [ ] "Typical day" narrative (make it vivid; operational language).
- [ ] 3 biggest pains + how we solve (tie to differentiators).
- [ ] Only relevant features (avoid feature dump).
- [ ] Setup steps (import → label → scan) + time-to-value promise.
- [ ] Metrics (even if directional): time saved, fewer stockouts, fewer losses.
- [ ] FAQ: solution-specific objections (offline, scanners, multi-location, accountability).
- [ ] Schema: SoftwareApplication + FAQPage + BreadcrumbList.

### 4.8 Compare hub (`/compare`)
- [ ] Create a short "How we compare" intro (factual).
- [ ] Add a grid for competitor alternatives (Sortly now; add others below).
- [ ] Add "When Nook is best" vs "When competitor is enough" pattern.

### 4.9 Sortly alternative (`/compare/sortly-alternative`)
- [ ] Quick verdict table (5–8 rows) with measurable/falsifiable phrasing.
- [ ] Add "When Sortly is enough" section (credibility).
- [ ] Add "When you should switch" section (pain points: pricing jumps, workflow hacks, offline issues).
- [ ] Migration block + link to `/migration/sortly` + downloadable CSV template.
- [ ] FAQ: pricing, exports, data ownership, support, scanners, offline.
- [ ] Schema: FAQPage + SoftwareApplication + BreadcrumbList.

### 4.10 Migration hub (`/migration`) + Sortly migration (`/migration/sortly`)
- [ ] Migration hub: choose your source (Sortly first; add others later).
- [ ] Sortly migration page: step-by-step with screenshots + mapping table.
- [ ] Provide CSV template + field definitions (make it indexable).
- [ ] Add "common import errors" troubleshooting (LLM-friendly).
- [ ] Schema: HowTo (steps) + FAQPage + BreadcrumbList.

### 4.11 Integrations (`/integrations`)
- [ ] List key integration categories (ecom, scanners, exports, accounting).
- [ ] Add "What we integrate with today" vs "What's on roadmap" (trust).
- [ ] Add FAQ (Shopify/WooCommerce, scanners, import/export formats).
- [ ] Schema: FAQPage + SoftwareApplication.

### 4.12 Security (`/security`)
- [ ] Plain-language security overview (who it's for: owners + IT-lite teams).
- [ ] Include security model: multi-tenant RLS, RBAC, audit logs, backups, access control.
- [ ] Add "Data ownership + export anytime" and "Incident response" basics.
- [ ] FAQ (encryption, access control, tenant isolation, backups, auth providers).
- [ ] Schema: FAQPage + Organization.

### 4.13 Legal (`/privacy`, `/terms`)
- [ ] Ensure clean, indexable HTML (minimal chrome).
- [ ] Add "Last updated" and clear headings for quick scanning.

### 4.14 Learning center (`/learn/*`)
- [ ] Publish the first authority guide: `/learn/perpetual-vs-periodic-inventory`.
- [ ] Add next 6 guides from guideline cadence:
  - [ ] reorder points / low stock alerts (how-to) → `/learn/how-to-set-reorder-points`.
  - [ ] cycle counting checklist → `/learn/cycle-counting-checklist`.
  - [ ] barcode label template (PDF + sizes) → `/learn/barcode-label-template`.
  - [ ] inventory audit trail best practices → `/learn/inventory-audit-trail-best-practices`.
  - [ ] warehouse receiving workflow → `/learn/warehouse-receiving-workflow`.
  - [ ] inventory spreadsheet template (ungated if possible) → `/learn/inventory-spreadsheet-template`.
- [ ] Add learning center navigation pages:
  - [ ] templates hub → `/learn/templates`.
  - [ ] glossary → `/learn/glossary`.
- [ ] Article schema for guides + internal links to relevant features/solutions.

> **Note**: Additional guides are content creation tasks for future sprints. Each guide still must follow the FlyonUI MCP template rule + full content depth + schema.

### 4.15 Contact sales / demo request (`/contact-sales`)
- [ ] Position the page as “Get a demo tailored to your workflow” (warehouse/ecom/tools/small teams).
- [ ] Include a short “What happens next” section (SLA + who responds + what you’ll cover).
- [ ] Add a lead form (minimum): name, work email, company size, primary use-case, current tool (Sortly/spreadsheets/other).
- [ ] Add “Fast paths”: link to `/demo` (video), `/migration/sortly`, and `/pricing`.
- [ ] Add objection handling: scanners, offline, migration time, pricing predictability.
- [ ] FAQ + FAQ schema.

### 4.16 Trust add‑ons (`/status`, `/changelog`)
- [ ] `/status`: uptime summary, incident history, subscribe options, clear links to `/security` + support contact.
- [ ] `/changelog`: release notes feed (by month), categories (Scanning, Imports, Checkouts, Reporting), and “Last updated”.
- [ ] Keep both pages clean + indexable (no heavy UI chrome), and avoid duplicate content across entries.

### 4.17 LLM / Docs section (`/docs/*`)
- [ ] `/docs` hub: index the 4 core docs pages, plus links back to Features/Solutions/Pricing.
- [ ] `/docs/barcode-scanning`: supported scanners table + workflow steps + FAQs.
- [ ] `/docs/offline-mode`: offline-first behavior + sync rules + conflict handling table + FAQs.
- [ ] `/docs/security-model`: multi-tenant RLS explanation + RBAC + audit logs + FAQs.
- [ ] `/docs/import-formats`: CSV field definitions table + templates + common errors + FAQs.
- [ ] Add “Last updated” and keep content citation-friendly (definitions, tables, step lists).

---

## 5) LLM / AI discovery optimization (2026)
- [ ] Create `/llms.txt` (root) listing:
  - [ ] canonical money pages to cite (Home/Pricing/Demo/Compare/Migration/Security).
  - [ ] feature and solution hubs.
  - [ ] learning center index.
  - [ ] short product + pricing summary with "no SKU cliffs" positioning.
- [ ] Create indexable `/docs` pages (clean HTML, minimal chrome):
  - [ ] How barcode scanning works (supported scanners + workflow) → `/docs/barcode-scanning`.
  - [ ] Offline mode & sync conflict handling → `/docs/offline-mode`.
  - [ ] Security model (multi-tenant RLS + RBAC + audit logs) → `/docs/security-model`.
  - [ ] Import formats + CSV templates + field definitions → `/docs/import-formats`.
- [ ] Make content citation-friendly:
  - [ ] Short factual paragraphs; definitions; step lists; tables.
  - [ ] Add "Key takeaways" bullets on guides and comparison pages.

> **Note**: `/docs` pages can be shipped as a future sprint, but `/llms.txt` + citation-friendly structure should be done early for LLM discovery.

---

## 6) Technical SEO & measurement
- [ ] Verify canonical URLs are self-referencing on every indexable marketing route.
- [ ] Verify robots/sitemap include marketing routes and exclude app routes.
- [ ] Add "noindex" where needed (internal search, auth/app pages, UTM duplicates).
- [ ] Validate schema with Rich Results test for key templates (FAQ/HowTo/Video/Article).
- [ ] Core Web Vitals pass on mobile (Lighthouse ≥ 90 for Performance/SEO on money pages).
- [ ] Analytics events (by page): Start trial clicks, demo submits, pricing toggle, compare CTAs, scroll depth.

> **Note**: Analytics events are implementation tasks for post-launch tracking setup.

---

## 7) Backlog (high-ROI additions)
- [ ] Optional trust page: `/roadmap` (optional) — keep factual, avoid “promise” language.
- [ ] Case studies: “Sortly migration in < 30 minutes”, “Warehouse cycle count turnaround”, “Tool loss prevention”.
- [ ] Calculators/tools: reorder point calculator, cycle count frequency planner, barcode label size recommender.
