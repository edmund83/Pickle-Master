# Website Guideline (SEO + Conversion) — Multi‑Tenant Inventory SaaS vs Sortly
**Document purpose:** Give web developers + content writers a single source of truth to build a high‑performing marketing site that ranks, converts, and supports 2026 search + LLM discovery.  
**Product:** Pickle Inventory (replace with final brand)  
**Date:** 2026-01-01

---

## 1) North Star: What the website must do
### Primary conversion goals (in order)
1. **Start free trial** (self‑serve)  
2. **Request a demo** (sales‑assisted)  
3. **Import/migrate** (reduce switching friction)

### Primary acquisition goals
- Rank for **barcode + scanning inventory software** terms, **warehouse inventory tracking**, and **ecommerce inventory management**.
- Win “**simple inventory software**” intent without looking like an ERP.
- Capture “**demo**” intent with a fast path to product proof.

### Primary differentiators to emphasize (anti‑Sortly narrative)
- **Trust‑first pricing** (no surprise tier jumps; no hard SKU cliffs)
- **Native check‑in/check‑out** (true asset workflow, not folder hacks)
- **Offline‑first mobile scanning** (real‑world warehouse/jobsite reliability)
- **Excel‑grade bulk editing with guardrails** (preview diffs + undo)
- **Inventory trust layer** (last verified + confidence indicators)
- **1‑click migration** (especially Sortly)

> These are repeatedly demanded by SMB owners and are the most effective “Sortly‑switch” levers.

---

## 2) Ideal positioning & messaging (copy rules)
### One‑sentence positioning
> **“An inventory system your whole team can use in minutes — with barcode scanning, offline reliability, and pricing that doesn’t punish growth.”**

### The 3 core promises (use everywhere)
1. **Speed:** add/find/update items fast (mobile + desktop)
2. **Accuracy:** real‑time stock you can trust (audit trail + verification)
3. **Simplicity:** not an ERP; minimal setup; staff-friendly UI

### Tone & language rules
- **Plain language**, no “enterprise,” no jargon in headlines.
- Always explain features in **job-to-be-done** language:
  - “Scan → confirm → done.”
  - “Know what you have, where it is, and who touched it last.”

### Proof stack (build credibility)
- Short product clips (10–30s) for each key feature.
- Screenshots/gifs: barcode scan, quick adjust +1/-1, check-out to staff, low-stock alerts, audit log.
- Security + reliability: RLS tenant isolation, audit logs, role-based permissions.
- “Migration done in < 30 minutes” story (case study once available).

---

## 3) Primary personas & landing angles
### Persona A — Owner/Founder (budget + simplicity)
- Wants: affordable, predictable pricing, easy onboarding
- Angle: “Replace spreadsheets without training your team.”

### Persona B — Ops/Warehouse Manager (accuracy + scanning)
- Wants: barcode scanning, fast counts, multi-location, audit trail
- Angle: “Scan everything. Fix discrepancies fast. Know who changed what.”

### Persona C — Field/Construction/Tools (asset in/out)
- Wants: check-in/check-out, accountability, offline mode
- Angle: “Stop losing tools. Issue/return by scan.”

### Persona D — Ecommerce operator (sync + stock truth)
- Wants: ecommerce stock mgmt, clean imports, reliable counts
- Angle: “Stock you can trust across locations and channels.”

---

## 4) Information Architecture (IA) — what pages to build
### Required page families
1. **Money pages (conversion)**
   - Home, Pricing, Demo, Sign up / Free trial, Contact sales
2. **Product pages (MOFU)**
   - Features hub + feature detail pages
   - Solutions / Use cases (warehouse, ecommerce, construction/tools, small business, mobile)
3. **Competitive pages (BOFU)**
   - Sortly alternative (+ migration)
   - BoxHero / inFlow / Fishbowl alternatives
4. **Trust pages**
   - Security, Privacy, Terms, Status, Roadmap (optional), Changelog
5. **Learning Center (TOFU)**
   - Guides (e.g., perpetual vs periodic), templates, glossary
6. **Docs for LLMs (MOFU/Retention)**
   - Product docs, API docs, “How it works” pages (indexable)

### URL map (recommended)
| Page                                  | Type        | Primary                                                                                 | Secondary                                                                                                       | Intent        |
|:--------------------------------------|:------------|:----------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------|:--------------|
| /                                     | Landing     | inventory management with barcode scanning                                              | simple inventory tracking, real time inventory management software, barcode inventory control software          | Commercial    |
| /pricing                              | Money       | simple inventory software for small business                                            | inventory management with barcode scanning                                                                      | Commercial    |
| /demo                                 | Money       | inventory management demo, inventory management software demo                           | stock management software demo                                                                                  | Transactional |
| /features/barcode-scanning            | Feature     | barcode scanning inventory software, inventory management software with barcode scanner | barcode and inventory software, barcode inventory tracking software, barcode scanner and software for inventory | Commercial    |
| /features/check-in-check-out          | Feature     | best construction inventory management software                                         | warehouse inventory tracking                                                                                    | Commercial    |
| /features/low-stock-alerts            | Feature     | barcoding software for inventory                                                        | simple inventory tracking                                                                                       | Commercial    |
| /solutions/warehouse-inventory        | Use case    | warehouse inventory tracking, warehouse stock control software                          | warehouse inventory management software with barcode scanner, free warehouse inventory software                 | Commercial    |
| /solutions/ecommerce-inventory        | Use case    | ecommerce inventory management, best inventory management software for ecommerce        | ecommerce stock management, inventory management ecommerce, best ecommerce inventory management                 | Commercial    |
| /solutions/mobile-inventory-app       | Use case    | inventory tracking app android, stock management app android                            | best app to track inventory, warehouse inventory management app                                                 | Commercial    |
| /compare/sortly-alternative           | Comparison  | Sortly alternative, Sortly pricing alternative                                          | inventory management with barcode scanning                                                                      | Commercial    |
| /compare/boxhero-alternative          | Comparison  | BoxHero alternative                                                                     | barcode inventory tracking software                                                                             | Commercial    |
| /compare/inflow-alternative           | Comparison  | inFlow alternative                                                                      | inventory scanner software                                                                                      | Commercial    |
| /compare/fishbowl-alternative         | Comparison  | Fishbowl alternative                                                                    | warehouse inventory management software with barcode scanner                                                    | Commercial    |
| /blog/perpetual-vs-periodic-inventory | Guide       | perpetual inventory vs periodic inventory                                               | what is the difference between periodic and perpetual inventory systems, inventory perpetual vs periodic        | Informational |
| /blog/how-to-set-reorder-points       | Guide       | low stock alerts / reorder point notifications                                          | simple inventory tracking                                                                                       | Informational |
| /migration/sortly                     | Tool        | Sortly migration                                                                        | excel inventory software                                                                                        | Commercial    |
| /security                             | Trust       | inventory software security                                                             |                                                                                                                 | Informational |
| /integrations                         | Feature hub | inventory management ecommerce                                                          | best inventory software for ecommerce                                                                           | Commercial    |

---

## 5) Page template specs (developer + writer ready)
### 5.1 Home (/)
**Primary job:** capture “barcode inventory software” + convert to trial/demo.

**Above-the-fold**
- H1: “Inventory management with barcode scanning — built for small teams”
- Subhead: “Scan, count, and track stock across locations. Works offline. No surprise pricing.”
- Primary CTA: **Start Free Trial**
- Secondary CTA: **Watch 90‑second demo**
- Trust bar: “No credit card • Cancel anytime • Import from CSV/Sortly”

**Sections (order)**
1. Pain → promise (3 bullets)
2. Feature highlights (scan, check-in/out, low-stock alerts, bulk edit)
3. Social proof (logos/testimonials)
4. Use-case tiles (Warehouse / Ecommerce / Construction / Small business)
5. “Why we’re different than Sortly” teaser (pricing trust + offline)
6. FAQ (pricing, migration, scanners, offline)
7. Final CTA

**Structured data**
- Organization, WebSite, SoftwareApplication/Product, FAQPage, BreadcrumbList (if breadcrumbs used)

---

### 5.2 Pricing (/pricing)
**Primary job:** remove price anxiety + highlight “trust-first pricing”.

**Must-have blocks**
- Plan cards with **“no SKU cliffs”** language (or transparent scaling)
- “Price-lock guarantee” block (12–24 months)
- Feature comparison table (barcode scan, check-in/out, offline, audit log, multi-location, roles)
- FAQ + “Talk to us” for edge cases

**Conversion UX**
- Sticky CTA (Start trial)
- Toggle monthly/yearly
- Show examples: “1,600 SKUs? still affordable.”

---

### 5.3 Demo (/demo)
**Primary job:** rank for demo keywords and convert.
- 90s overview video + 3 short clips by workflow:
  1) Scan & adjust
  2) Stock count
  3) Issue/return tool (asset tracking)
- Interactive “guided tour” (optional)
- Lead form: name, email, company size, main use-case

---

### 5.4 Feature detail template (e.g. /features/barcode-scanning)
**Primary job:** capture “barcode + scanner inventory software” cluster and push trial.

**Blocks**
1. Hero: outcome headline + 1 clip
2. How it works (3 steps)
3. Supported hardware (camera, Bluetooth scanners, rugged devices)
4. Real workflows: receiving, counting, picking, check-in/out
5. FAQ (scanner compatibility, QR vs barcode)
6. CTA + migration link

**On-page keyword strategy**
- Keep one canonical page; use keyword variants as H2/FAQ to avoid cannibalization.

---

### 5.5 Solutions / use-case template (warehouse / ecommerce / construction/tools)
**Primary job:** translate features into daily outcomes.

**Blocks**
- “Typical day” narrative + screenshots
- 3 biggest pains + how we solve
- Relevant features (only those that matter)
- Metrics (time saved, fewer stockouts)
- Setup steps (import → label → scan)
- CTA + case study (when available)

---

### 5.6 Comparison template (/compare/sortly-alternative)
**Primary job:** capture switchers and drive migration.

**Rules**
- Be factual, not insulting.
- Lead with what switchers care about: pricing trust, workflows, reliability.

**Blocks**
- Quick verdict table (5–8 rows)
- “When Sortly is enough” (credibility)
- “When you should switch” (pain points)
- Migration guide + CSV template
- FAQ: pricing, data ownership, export, support

**Add a dedicated migration page**
- /migration/sortly (step-by-step, screenshots, import mapping)

---

## 6) Keyword strategy and mapping (Semrush gap file)
### 6.1 Priority keyword clusters
- **Barcode & scanning** (highest buyer intent)
- **Warehouse inventory tracking**
- **Ecommerce inventory management**
- **Mobile inventory app / Android**
- **Demo intent**
- **Education: perpetual vs periodic** (top-of-funnel authority)
- **Excel alternative** (switch intent)

### 6.2 “Top 15” opportunities (high volume vs difficulty)
| Keyword                                            |   Volume |   Keyword Difficulty |   CPC | Intents                      | Target URL                            |
|:---------------------------------------------------|---------:|---------------------:|------:|:-----------------------------|:--------------------------------------|
| ecommerce inventory management                     |     1000 |                   36 | 24.72 | Commercial, Informational    | /solutions/ecommerce-inventory        |
| perpetual inventory vs periodic inventory          |      480 |                   18 |  0.72 | Commercial                   | /blog/perpetual-vs-periodic-inventory |
| warehouse inventory tracking                       |      390 |                   15 | 15.71 | Commercial                   | /solutions/warehouse-inventory        |
| barcode inventory tracking software                |      320 |                   16 | 19.67 | Informational, Transactional | /features/barcode-scanning            |
| barcode stock management software                  |      260 |                   14 | 19.67 | Informational, Transactional | /features/barcode-scanning            |
| barcode inventory control software                 |      320 |                   18 | 19.67 | Informational, Transactional | /features/barcode-scanning            |
| inventory management with barcode scanning         |      480 |                   29 | 23.26 | Commercial, Informational    | /features/barcode-scanning            |
| barcode and inventory software                     |      390 |                   25 | 20.27 | Informational, Transactional | /features/barcode-scanning            |
| inventory perpetual vs periodic                    |      210 |                   15 |  0.72 | Commercial                   | /blog/perpetual-vs-periodic-inventory |
| inventory management software with barcode scanner |      320 |                   24 | 19.71 | Commercial, Informational    | /features/barcode-scanning            |
| perpetual inventory vs periodic                    |      390 |                   31 |  0    | Commercial                   | /blog/perpetual-vs-periodic-inventory |
| stock barcode scanner                              |      210 |                   18 | 12.08 | Commercial                   | /features/barcode-scanning            |
| best construction inventory management software    |       90 |                    9 | 16.39 | Commercial                   | /features                             |
| best inventory management software for ecommerce   |      140 |                   15 | 38.09 | Commercial                   | /solutions/ecommerce-inventory        |
| barcode scanner and software for inventory         |      210 |                   23 | 23.26 | Commercial                   | /features/barcode-scanning            |

### 6.3 Keyword → URL → on-page placement map
**How to use this table:** writers must place each keyword variant in the recommended spot (Title/H1/H2/FAQ/body) to prevent cannibalization while still matching exact phrasing.

| Keyword                                                                 |   Volume |   Keyword Difficulty | Intents                      | Target URL                            | On-page placement                |
|:------------------------------------------------------------------------|---------:|---------------------:|:-----------------------------|:--------------------------------------|:---------------------------------|
| perpetual inventory vs periodic inventory                               |      480 |                   18 | Commercial                   | /blog/perpetual-vs-periodic-inventory | Title/H1 + H2 + FAQ              |
| perpetual inventory vs periodic                                         |      390 |                   31 | Commercial                   | /blog/perpetual-vs-periodic-inventory | Title/H1 + H2 + FAQ              |
| inventory perpetual vs periodic                                         |      210 |                   15 | Commercial                   | /blog/perpetual-vs-periodic-inventory | Title/H1 + H2 + FAQ              |
| periodic inventory vs perpetual inventory                               |      210 |                   25 | Commercial, Informational    | /blog/perpetual-vs-periodic-inventory | Title/H1 + H2 + FAQ              |
| what is the difference between periodic and perpetual inventory systems |       70 |                   15 | Commercial, Informational    | /blog/perpetual-vs-periodic-inventory | Title/H1 + H2 + FAQ              |
| excel inventory software                                                |       70 |                   32 | Commercial                   | /compare/excel-vs-inventory-software  | H2/Body                          |
| inventory management software demo                                      |       90 |                   29 | Commercial                   | /demo                                 | Title/H1 + FAQ                   |
| inventory management system demo                                        |       90 |                   14 | Commercial                   | /demo                                 | Title/H1 + FAQ                   |
| inventory management demo                                               |       50 |                   29 | Informational, Transactional | /demo                                 | Title/H1 + FAQ                   |
| stock management software demo                                          |       50 |                   28 | Commercial, Informational    | /demo                                 | Title/H1 + FAQ                   |
| inventory mangement system inventory mangement software                 |      210 |                   29 | Commercial                   | /features                             | H2/Body                          |
| real time inventory management software                                 |      210 |                   26 | Informational, Transactional | /features                             | H2/Body                          |
| best construction inventory management software                         |       90 |                    9 | Commercial                   | /features                             | H2 + FAQ                         |
| barcoding software for inventory                                        |       70 |                   27 | Commercial, Informational    | /features                             | H2/Body                          |
| best app to track inventory                                             |       50 |                   36 | Commercial                   | /features                             | H2 + FAQ                         |
| inventory management with barcode scanning                              |      480 |                   29 | Commercial, Informational    | /features/barcode-scanning            | Body                             |
| barcode and inventory software                                          |      390 |                   25 | Informational, Transactional | /features/barcode-scanning            | H2 + FAQ                         |
| barcode inventory control software                                      |      320 |                   18 | Informational, Transactional | /features/barcode-scanning            | H2 + FAQ                         |
| barcode inventory tracking software                                     |      320 |                   16 | Informational, Transactional | /features/barcode-scanning            | H2 + FAQ                         |
| inventory management software with barcode scanner                      |      320 |                   24 | Commercial, Informational    | /features/barcode-scanning            | H2 + FAQ                         |
| barcode stock management software                                       |      260 |                   14 | Informational, Transactional | /features/barcode-scanning            | H2 + FAQ                         |
| barcode stock software                                                  |      260 |                   30 | Informational, Transactional | /features/barcode-scanning            | H2 + FAQ                         |
| barcode scanner and software for inventory                              |      210 |                   23 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| inventory management software with scanner                              |      210 |                   24 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| inventory scanners and software                                         |      210 |                   25 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| inventory software with scanner                                         |      210 |                   24 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| stock barcode scanner                                                   |      210 |                   18 | Commercial                   | /features/barcode-scanning            | Body                             |
| barcode scanner inventory software                                      |      170 |                   21 | Commercial, Informational    | /features/barcode-scanning            | H2 + FAQ                         |
| barcode stock control software                                          |      170 |                   25 | Informational, Transactional | /features/barcode-scanning            | H2 + FAQ                         |
| inventory control software barcode                                      |      170 |                   27 | Commercial, Informational    | /features/barcode-scanning            | H2 + FAQ                         |
| inventory software with barcode                                         |      110 |                   29 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| barcode inventory management system for small business                  |       90 |                   10 | Commercial                   | /features/barcode-scanning            | Body                             |
| inventory management software with barcode                              |       90 |                   22 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| inventory management with scanner                                       |       70 |                   23 | Commercial                   | /features/barcode-scanning            | Body                             |
| inventory scanner software                                              |       70 |                   23 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| scanner inventory software                                              |       70 |                   18 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| barcode scanning inventory software                                     |       50 |                   21 | Informational, Transactional | /features/barcode-scanning            | H2 + FAQ                         |
| best inventory management software with barcode scanner                 |       50 |                   20 | Commercial                   | /features/barcode-scanning            | H2 + FAQ                         |
| inventory tracking app android                                          |       70 |                   18 | Commercial, Informational    | /mobile-inventory-app/android         | H2/Body                          |
| stock management app android                                            |       70 |                   26 | Transactional                | /mobile-inventory-app/android         | H2/Body                          |
| free warehouse stock management software                                |       90 |                   39 | Commercial                   | /pricing/free-inventory-software      | Title/H1 + Pricing table heading |
| free warehouse inventory software                                       |       50 |                   30 | Informational, Transactional | /pricing/free-inventory-software      | Title/H1 + Pricing table heading |
| ecommerce inventory management                                          |     1000 |                   36 | Commercial, Informational    | /solutions/ecommerce-inventory        | H2/Body                          |
| best inventory management software for ecommerce                        |      140 |                   15 | Commercial                   | /solutions/ecommerce-inventory        | H2 + FAQ                         |
| ecommerce stock management                                              |      140 |                   18 | Commercial, Informational    | /solutions/ecommerce-inventory        | H2/Body                          |
| inventory management ecommerce                                          |      140 |                   36 | Commercial, Informational    | /solutions/ecommerce-inventory        | H2/Body                          |
| best ecommerce inventory management                                     |      110 |                   19 | Commercial                   | /solutions/ecommerce-inventory        | H2 + FAQ                         |
| best inventory software for ecommerce                                   |       90 |                   30 | Commercial                   | /solutions/ecommerce-inventory        | H2 + FAQ                         |
| stores inventory management software                                    |       90 |                   35 | Commercial, Informational    | /solutions/ecommerce-inventory        | H2/Body                          |
| simple inventory tracking                                               |      320 |                   39 | Informational, Transactional | /solutions/small-business             | H2/Body                          |
| simple inventory software for small business                            |       50 |                   24 | Commercial                   | /solutions/small-business             | H2/Body                          |
| warehouse inventory tracking                                            |      390 |                   15 | Commercial                   | /solutions/warehouse-inventory        | H2/Body                          |
| warehouse inventory management software with barcode scanner            |      110 |                   16 | Commercial                   | /solutions/warehouse-inventory        | H2/Body                          |
| warehouse inventory management app                                      |       50 |                   31 | Commercial                   | /solutions/warehouse-inventory        | H2/Body                          |
| warehouse stock control software                                        |       50 |                   36 | Informational, Transactional | /solutions/warehouse-inventory        | H2/Body                          |

**Important anti-cannibalization rules**
- Only **one** canonical page per cluster (barcode scanning, warehouse, ecommerce, demo).
- Use keyword variants as:
  - **H2 headings** (“Barcode inventory control software”)
  - **FAQ questions** (“What barcode scanner works with…?”)
  - **Body copy** (synonyms)
- If you later create additional pages, require a unique angle:
  - Industry-specific (e.g., “Warehouse barcode inventory”)
  - Platform-specific (e.g., “Android inventory tracking app”)

---

## 7) On-page SEO requirements (writer checklist)
### Title tag formula (≤ 60 chars)
- **Primary keyword** + primary outcome + brand
  - Example: “Barcode Inventory Software That Works Offline | Pickle Inventory”

### H1 rules
- Must be human-friendly; include primary keyword or close variant.

### Meta description (≤ 155 chars)
- Outcome + differentiator + CTA
  - Example: “Scan barcodes, track stock across locations, and prevent stockouts. Offline-first. Start a free trial.”

### Headings
- H2 = major use-case/feature outcomes
- H3 = steps, details, edge cases

### Must-have blocks for ranking + AI summaries
- Clear definitions (“What it is”, “Who it’s for”)
- Steps (“How it works”)
- Comparison snippet (“Compared to spreadsheets/Sortly”)
- FAQ (5–10 questions) + FAQ schema

### Internal linking rules
- Every page links to:
  - Pricing
  - Demo
  - 1 relevant feature page
  - 1 relevant solution page
  - 1 relevant guide (if exists)

---

## 8) Technical SEO requirements (developer checklist)
### 8.1 Rendering & indexability
- Marketing pages must be **server-rendered** (SSR/SSG) — avoid “blank JS shell”.
- Use Next.js metadata API for per-route titles, descriptions, OG tags.
- Ensure **fast TTFB** and strong Core Web Vitals (LCP/INP/CLS).

### 8.2 Canonicals & duplication controls
- Self-referencing canonical on every indexable page.
- Enforce one URL version:
  - https
  - trailing slash policy (pick one)
  - www vs non-www (pick one)
- Add canonical + noindex rules for:
  - UTM duplicates
  - internal search results
  - auth pages

### 8.3 Sitemaps & robots
- Dynamic sitemap index:
  - /sitemap.xml → links to /sitemap-pages.xml, /sitemap-blog.xml, /sitemap-docs.xml
- robots.txt
  - Allow marketing + docs
  - Disallow app routes: /app/*, /admin/* (or noindex)

### 8.4 Structured data (JSON-LD)
Implement per page type:
- **SoftwareApplication / Product** (sitewide)
- **FAQPage** (feature, solution, comparison pages)
- **HowTo** (guides with steps)
- **VideoObject** (pages with demos)
- **BreadcrumbList** (if breadcrumbs present)
- **Organization** + **WebSite** (sitewide)

### 8.5 Images & video
- Use next/image with width/height and modern formats.
- Provide descriptive alt text (don’t keyword stuff).
- Host product videos with:
  - fast streaming
  - poster image
  - VideoObject schema

### 8.6 Analytics, tracking & experimentation
- Events to track:
  - Start trial clicks (by page)
  - Demo form submits
  - Pricing toggle usage
  - Scroll depth (50/75/90%)
  - “Compare” page CTA clicks
- Add A/B test framework (server-side if possible) for:
  - hero headline
  - CTA wording
  - pricing layout

### 8.7 International SEO (optional)
If targeting global markets:
- Add hreflang later; start with EN only to focus authority.

---

## 9) LLM / AI discovery optimization for 2026
### 9.1 llms.txt + docs discipline
- Add `/llms.txt` at the root describing:
  - key pages to cite
  - docs index
  - pricing and feature summaries
- Maintain an indexable `/docs` section with:
  - “How barcode scanning works”
  - “Offline mode & sync conflict handling”
  - “Security model (multi-tenant RLS)”
  - “Import formats (CSV templates)”
- Keep docs **clean HTML**, minimal UI chrome.

### 9.2 “Citation-friendly” content
- Use short, factual paragraphs.
- Provide tables for:
  - feature comparisons
  - supported scanners
  - plan limits / guarantees
- Add a “Last updated” date on key pages.

### 9.3 Programmatic FAQ
- Add FAQ per page from real support questions:
  - “Can I scan offline?”
  - “Can I track tools checked out to staff?”
  - “Do you limit SKUs?”
  - “How do I import from Sortly?”

---

## 10) Conversion system (what makes visitors act)
### 10.1 Trust & risk reversal
- “No surprise pricing” pledge (sticky badge on pricing and comparison pages)
- “Data ownership” messaging: export anytime
- Clear cancellation policy
- Live chat (or fast email SLA)

### 10.2 CTAs
- Primary CTA: Start Free Trial (consistent)
- Secondary CTA: Watch Demo / See it in action
- Tertiary CTA (BOFU): Migrate from Sortly

### 10.3 Lead magnets (TOFU → MOFU)
- Downloadable:
  - Inventory spreadsheet template (Excel/Sheets)
  - Cycle count checklist
  - Barcode label template (PDF)
- Gate only if necessary; otherwise keep open to build trust.

---

## 11) Content operations (how to ship consistently)
### Publishing cadence (first 90 days)
- Week 1–2: Money + core feature pages + 2 solution pages + 1 comparison
- Week 3–6: Add remaining solutions + migration + 6 guides
- Week 7–12: 2 guides/week + 1 case study/month

### Content QA checklist
- One primary keyword per page
- 5–10 FAQs
- 3–5 internal links added
- Schema validated (Rich Results test)
- Lighthouse (mobile) ≥ 90 for Performance/SEO

---

## Appendix A — Product capability inventory (for writers)
Use these capabilities as proof points and avoid vague claims:
- Multi-location, hierarchical locations (warehouse → shelf → bin)
- Real-time stock movements + audit trail
- Low stock alerts (min/max)
- Barcode/QR: scan, generate, print; thermal printers; batch printing
- Task system: purchase orders, stock counts, pick lists, receiving
- Collaboration: chatter, @mentions, followers, notifications
- Security: multi-tenant RLS isolation, RBAC, audit logs
- Mobile: touch-first, offline-first, camera scanning

---

## Appendix B — “Sortly switch” page copy blocks (ready to reuse)
### Pricing trust block
> “Your inventory shouldn’t get more expensive just because your business grows. Our pricing scales fairly — no forced tier jumps.”

### Offline reliability block
> “Scan and update inventory even when Wi‑Fi is unreliable. Changes sync automatically when you’re back online.”

### Real asset workflow block
> “Issue tools to staff with a scan, set due dates, and see what’s overdue — without folder hacks.”

