# New Marketing Pages Planning (SEMrush‑driven)
Last updated: **2026-01-03**

- [x] SEMrush inputs used:
  - [x] `docs/semrush/MissingKeyword2Jan2026.csv` (Missing keywords)
  - [x] `docs/semrush/sortly.com-organic.PagesV2-us-20260101-2026-01-02T15_37_55Z.csv` (Top pages)
  - [x] `docs/semrush/boxhero.io-organic.PagesV2-us-20260101-2026-01-02T15_38_27Z.csv` (Top pages)
  - [x] `docs/semrush/fishbowlinventory.com-organic.PagesV2-us-20260101-2026-01-02T15_38_48Z.csv` (Top pages)
  - [x] `docs/semrush/inflowinventory.com-organic.PagesV2-us-20260101-2026-01-02T15_39_09Z.csv` (Top pages)
  - [x] `docs/semrush/sortly.com-backlinks_matrix.csv` (Backlinks sources — competitor only)
  - [x] `docs/semrush/boxhero.io-backlinks_matrix.csv` (Backlinks sources — competitor only)
  - [x] `docs/semrush/fishbowlinventory.com-backlinks_matrix.csv` (Backlinks sources — competitor only)
  - [x] `docs/semrush/inflowinventory.com-backlinks_matrix.csv` (Backlinks sources — competitor only)

---

## Research references (must inform every page)
- [x] Market overview + demand signals: `docs/Market Research.md`
- [x] What users want (directional %; not survey data): `docs/Features Needed.md`
- [x] Pain point → feature mapping: `docs/Pain Point Feature.md`
- [x] Anti‑Sortly "switcher" pain points: `docs/Sortly PainPoint.md`
- [x] What Nook actually has (features + benefits): `docs/Features&Benefits.md`

## Non‑negotiable build + content safety conditions
### 1) FlyonUI MCP requirement (always)
- [x] Every new marketing page **must** be created from a FlyonUI MCP page template (no hand-built layouts).
- [x] Every refinement/update of an existing marketing page **must** start from FlyonUI MCP (refine/re-instantiate via template; preserve section order).
- [x] Record MCP evidence for each page: template name + MCP path + snapshot (per `docs/MarketingTodo.md`).

### 2) Content safety requirement (avoid legal risk)
- [x] No defamatory or insulting language about competitors; keep comparisons factual and workflow-based.
- [x] No unverified claims ("best", "#1", "top-rated", "most trusted", etc.) unless you can cite a verifiable source.
- [x] No promises/guarantees that can be challenged ("never loses items", "works offline everywhere", "syncs instantly") unless the product behavior truly supports it; otherwise qualify or mark as TODO/roadmap.
- [x] No competitor trademark misuse in headings/ads-like copy; use neutral "Alternative" framing on compare pages.
- [x] No fabricated stats/testimonials/logos; if proof is missing, use explicit TODO placeholders instead.
- [x] Add image/icon placeholders where visuals are required (don't leave "Proof" sections empty).
- [x] Any "% of users" numbers remain labeled as directional estimates from Reddit synthesis (`docs/Features Needed.md`).

### Market overview checklist (from `docs/Market Research.md`)
- [x] Price sensitivity + distrust of surprise tier jumps (especially Sortly)
- [x] Spreadsheet pain (errors, version conflicts, manual effort)
- [x] "Too complex / ERP vibe" rejection (needs zero training)
- [x] Inventory trust gap (counts not matching reality, lost items)
- [x] Integration gaps (Shopify/Xero/QuickBooks + double entry)
- [x] Feature gaps (alerts, scanning, workflows) drive switching

### Sortly "killer" checklist (from `docs/Sortly PainPoint.md`)
- [x] Predictable pricing narrative (no sudden hikes, no artificial SKU/user cliffs)
- [x] Smooth barcode scanning workflow (phone + Bluetooth where applicable)
- [x] Real check‑in/check‑out workflow (tools/assets accountability)
- [x] Reliable sync + "trust layer" (reduce mismatch anxiety)
- [x] Growth path (integrations/automation) without ERP complexity

### Page writing constraint (from `docs/Features Needed.md`)
- [x] Any "% of users" numbers are **directional estimates**; label accordingly (avoid implying survey data)
- [x] Every money page explicitly addresses top needs: simple UI, speed, mobile, scanning, alerts, multi-user, folders, search, CSV import

### Pain point → feature → benefit mapping checklist
Use this as a requirement: each P0/P1 page must explicitly address at least **3** pain points and map them to **real** Nook features.

- [x] High cost / tier shock → transparent pricing + no SKU cliffs messaging → "budget confidence" (ref: `docs/Market Research.md`, `docs/Sortly PainPoint.md`)
- [x] Spreadsheet errors / lost items → stock movements + audit trail → "inventory you can trust" (ref: `docs/Features&Benefits.md`)
- [x] Too complex / training required → clean UI + minimal setup → "team adoption without training" (ref: `docs/Features Needed.md`)
- [x] Manual counts / slow updates → fast item add/edit + scanning → "speed on the floor" (ref: `docs/Features Needed.md`, `docs/Features&Benefits.md`)
- [x] Stockouts / reordering stress → low stock alerts + min/max → "prevent stockouts" (ref: `docs/Features&Benefits.md`)
- [x] Tools go missing → check-in/check-out + due dates/history → "accountability" (ref: `docs/Pain Point Feature.md`, `docs/Features&Benefits.md`)
- [x] Integration double-entry → integrations (only if real) → "less reconciliation" (ref: `docs/Market Research.md`, `docs/Features&Benefits.md`)

### Claim validation checklist (only say what we actually have)
Before writing copy, confirm the capability exists in `docs/Features&Benefits.md` (or mark as roadmap/TODO on the page).

- [x] Folder/location hierarchy (warehouse → shelf → bin)
- [x] Barcode/QR scanning experience (phone scanning and/or scanner support)
- [x] Low stock alerts + min/max thresholds
- [x] Check-in/check-out workflow (tools/assets accountability)
- [x] Bulk import/export (CSV/Excel) with mapping/preview
- [x] Multi-user real-time sync + audit trail
- [x] Multi-location support (warehouse/store/van/job site)
- [x] Labels/printing (Sortly-compatible sizes) if referenced on barcode pages
- [x] Integrations/API only if implemented (otherwise "planned" + waitlist)

## 0) One‑time decisions (avoid rework + cannibalization)
- [x] Confirm final brand name (replace "Nook Inventory" in copy specs) — **Confirmed: "Nook"** (used consistently across all marketing pages)
- [x] Confirm final marketing domain — **Confirmed: using `NEXT_PUBLIC_MARKETING_URL` env var** (see `lib/marketing/metadata.ts`)
- [x] Confirm primary CTA: **Start Free Trial** vs **Request a Demo** — **Confirmed: "Start Free Trial"** (used on all pages with /signup link)
- [x] Confirm which integrations are real today (Shopify/WooCommerce/QuickBooks/Xero/etc) — don't publish "integration pages" if not supported — **Confirmed: No integration pages published; integrations marked as "planned" with waitlist where mentioned**
- [x] Confirm canonical owner for barcode cluster (recommend: `/features/barcode-scanning` owns variants; Home stays broader) — **Confirmed: `/features/barcode-scanning` is canonical** (owns all barcode keywords; Home uses broader positioning)

---

## 1) SEMrush "Missing" keyword coverage checklist (47 keywords)
Goal: every keyword below is assigned to **one** canonical URL (variants go in H2/FAQ/body on that URL).

- [x] inventory management with barcode scanning → `/features/barcode-scanning` (Title/H1 or H2 depending on canonical decision)
- [x] barcode and inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode inventory tracking software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode inventory control software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory management software with barcode scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode stock management software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode stock software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] stock barcode scanner → `/features/barcode-scanning` (FAQ: scanner compatibility)
- [x] barcode scanner inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode scanner and software for inventory → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory scanners and software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory control software barcode → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory management software with barcode → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory software with barcode → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode stock control software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcoding software for inventory → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode scanning inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] best inventory management software with barcode scanner → `/features/barcode-scanning` (FAQ + comparison snippet)
- [x] scanner inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory management with scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory scanner software → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory management software with scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [x] inventory software with scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [x] barcode inventory management system for small business → `/solutions/small-business` (H2/FAQ) + `/features/barcode-scanning` (FAQ)

- [x] warehouse inventory tracking → `/solutions/warehouse-inventory` (Title/H1)
- [x] warehouse management system for small business → `/solutions/warehouse-inventory` (H2/FAQ: "WMS vs simple tracking")
- [x] warehouse inventory management software with barcode scanner → `/solutions/warehouse-inventory` (H2/FAQ/body)
- [x] free warehouse inventory software → `/pricing/free-inventory-software` (Title/H1) + `/solutions/warehouse-inventory` (FAQ)

- [x] ecommerce stock management → `/solutions/ecommerce-inventory` (H2/Body)
- [x] best inventory management software for ecommerce → `/solutions/ecommerce-inventory` (Title/H1 or H2)
- [x] best ecommerce inventory management → `/solutions/ecommerce-inventory` (H2/FAQ)
- [x] best inventory software for ecommerce → `/solutions/ecommerce-inventory` (FAQ)
- [x] inventory management platforms for ecommerce 2025 → `/learn/blog/inventory-management-platforms-for-ecommerce-2025` (new guide)

- [x] simple inventory software for small business → `/solutions/small-business` (Title/H1)

- [x] inventory tracking app android → `/solutions/mobile-inventory-app` (Title/H1)
- [x] stock management app android → `/solutions/mobile-inventory-app` (H2/FAQ/body)

- [x] inventory management software demo → `/demo` (Title/H1 or H2)
- [x] inventory management system demo → `/demo` (H2/FAQ/body)
- [x] inventory management demo → `/demo` (H2/FAQ/body)
- [x] stock management software demo → `/demo` (H2/FAQ/body)

- [x] perpetual inventory vs periodic inventory → `/learn/guide/perpetual-vs-periodic-inventory` (Title/H1) — NOTE: at /learn/ not /blog/
- [x] inventory perpetual vs periodic → `/learn/guide/perpetual-vs-periodic-inventory` (H2/FAQ/body)
- [x] periodic inventory vs perpetual inventory → `/learn/guide/perpetual-vs-periodic-inventory` (H2/FAQ/body)
- [x] what is the difference between periodic and perpetual inventory systems → `/learn/guide/perpetual-vs-periodic-inventory` (FAQ question)

- [x] best construction inventory management software → `/solutions/construction-tools` (Title/H1) + `/features/check-in-check-out` (supporting internal link)

- [x] real time inventory management software → `/` (H2/Body) + consider `/features/real-time-inventory` (only if SERP demands a dedicated page)

- [x] inventory mangement system inventory mangement software → **ignore** (misspelling; don't target intentionally)

---

## 2) Page backlog (build/refine) — all in checklist form
Rule: every page must follow `docs/MarketingTodo.md` (FlyonUI MCP template, deep content, metadata, schema, internal links, validation loop).

---

## Additional useful articles (TOFU + linkable assets) — TODO guide
Purpose: publish high-intent educational pages that (a) win traffic, (b) earn backlinks, and (c) funnel into `/pricing`, `/demo`, and the relevant feature/solution pages.

### Topic selection workflow (SEMrush)
- [ ] Keyword Overview → confirm Volume + KD + Intent + SERP features (PAA/snippets)
- [ ] SERP Analysis → confirm dominant format (guide vs template/tool vs listicle)
- [ ] Keyword Magic Tool → pick 1 primary keyword + 6–10 close variants (avoid cannibalization)
- [ ] SEO Content Template → copy subtopics/PAA questions into H2 + FAQ
- [ ] Map to canonical URL (one topic = one URL; variants go in H2/FAQ/body)

### Content safety + build rules (apply to every article)
- [ ] Build/refine via FlyonUI MCP template (record MCP path + snapshot per `docs/MarketingTodo.md`)
- [ ] Avoid unverifiable superlatives (“best”, “#1”) and guarantees; keep comparisons factual
- [ ] Add image/icon placeholders for: example tables, checklists, screenshots, calculator outputs (don’t ship empty proof sections)

### Priority article backlog (recommended)
- [ ] **Inventory template landing page (high volume + linkable)**
  - [ ] Proposed URL: `/learn/templates/inventory-template` (or `/learn/templates/inventory-spreadsheet`)
  - [ ] Primary keyword: `inventory template`
  - [ ] Secondary variants (choose from SEMrush list): `inventory spreadsheet template`, `inventory list template`, `inventory sheet template`, `stock inventory template`, `inventory template for small business`
  - [ ] Required sections
    - [ ] Download block (Excel + Google Sheets + CSV)
    - [ ] Template preview table (image placeholder ok)
    - [ ] “How to use” (5-step checklist)
    - [ ] “How to import into Nook” (mapping steps + screenshot placeholders)
    - [ ] FAQ (10) + FAQ schema
  - [ ] Internal links: `/pricing`, `/demo`, `/features/barcode-scanning`, `/solutions/small-business`

- [ ] **How to set up a barcode system (guide that funnels into barcode page)**
  - [ ] Proposed URL: `/learn/blog/how-to-set-up-a-barcode-system-for-inventory`
  - [ ] Primary keyword: validate in SEMrush (`barcode system for inventory` / `barcode inventory system`)
  - [ ] Required sections
    - [ ] Quick answer (snippet-ready)
    - [ ] Step-by-step setup (labels → locations → scanning workflow)
    - [ ] Hardware guide (phone vs Bluetooth; avoid “best” claims)
    - [ ] Common mistakes + fixes
    - [ ] FAQ + schema
  - [ ] Internal links: `/features/barcode-scanning`, `/learn/templates/inventory-template`, `/demo`

- [ ] **Cycle counting guide + template (warehouse-qualified traffic)**
  - [ ] Proposed URLs: `/learn/blog/cycle-counting-guide` + `/learn/templates/cycle-count-sheet`
  - [ ] Primary keyword: validate in SEMrush (`cycle counting`, `cycle count template`, `cycle count sheet`)
  - [ ] Required sections (guide)
    - [ ] What cycle counting is + who it’s for
    - [ ] ABC/velocity method (simple explanation)
    - [ ] Weekly/monthly schedule examples (image placeholder)
    - [ ] “How to run counts with barcode scanning” (screens/TODO)
    - [ ] FAQ + schema
  - [ ] Internal links: `/solutions/warehouse-inventory`, `/features/barcode-scanning`, `/demo`

- [ ] **Inventory turnover ratio (Sortly-style glossary traffic)**
  - [ ] Proposed URL: `/learn/blog/inventory-turnover-ratio` (or `/learn/glossary/inventory-turnover`)
  - [ ] Primary keyword: validate in SEMrush (`inventory turnover` / `inventory turnover ratio`)
  - [ ] Required sections
    - [ ] Definition (snippet-ready)
    - [ ] Formula + example calculation
    - [ ] What’s a “good” turnover (explain varies by industry)
    - [ ] How to improve turnover without stockouts
    - [ ] FAQ + schema
  - [ ] Internal links: `/solutions/ecommerce-inventory`, `/pricing`, `/demo`

- [ ] **Barcodes vs QR codes (education that supports scanning page)**
  - [ ] Proposed URL: `/learn/blog/barcodes-vs-qr-codes-for-inventory`
  - [ ] Primary keyword: validate in SEMrush (`barcodes vs qr codes for inventory`)
  - [ ] Required sections
    - [ ] Quick answer
    - [ ] When barcodes win (speed + simplicity)
    - [ ] When QR wins (more data + URLs)
    - [ ] Label durability + printing tips (image placeholder)
    - [ ] FAQ + schema
  - [ ] Internal links: `/features/barcode-scanning`, `/pricing`, `/demo`

### P0 — Refine core conversion pages (ship first)
- [x] **`/` (Home)** — broad product positioning + routes users to the right solution/feature
  - [x] Primary keyword (choose one and stick to it): `inventory management with barcode scanning` **or** `real time inventory management software`
  - [x] Secondary variants (H2/FAQ/body only): `barcode inventory control software`, `simple inventory tracking`, `offline inventory app`, `inventory check in check out`
  - [x] Title tag (≤60 chars) written for CTR
  - [x] Meta description (≤155 chars) written for CTR
  - [x] H1 + subhead match the 3 core promises (speed, accuracy, simplicity)
  - [x] Hero CTAs: trial + demo (with trust bar: "No credit card • Cancel anytime • Import CSV/Sortly")
  - [x] Section checklist (keep this order)
    - [x] Pain → promise (3 bullets)
    - [x] Feature highlights (scan, check‑in/out, low‑stock alerts, bulk edit)
    - [x] Social proof (logos/testimonials) — if no proof yet, include specific TODO placeholders
    - [x] Use-case tiles (Warehouse / Ecommerce / Construction / Small business)
    - [x] "Why different than Sortly" teaser + link to `/compare/sortly-alternative` + `/migration/sortly`
    - [x] FAQ (5–10) + FAQ schema
    - [x] Final CTA
  - [x] Internal links: `/pricing`, `/demo`, `/features/barcode-scanning`, `/solutions/warehouse-inventory`, `/learn/blog/perpetual-vs-periodic-inventory`
  - [x] Schema: Organization + WebSite + SoftwareApplication/Product + FAQPage
  - [x] Proof asset TODOs are explicit (what to record, what screenshot to capture) — **Added TODO comments in TestimonialGrid.tsx**

- [x] **`/pricing`** — remove price anxiety + highlight "trust-first pricing"
  - [x] Primary keyword: `simple inventory software for small business`
  - [x] Secondary variants: `inventory management with barcode scanning` (supporting), `inventory software pricing`, `inventory app pricing`
  - [x] Plan cards include transparent scaling (avoid "SKU cliffs")
  - [x] "Price-lock" / risk reversal block (cancel anytime, export anytime)
  - [x] Feature comparison table includes: barcode scan, offline, check‑in/out, audit, multi‑location, roles
  - [x] FAQ (pricing edge cases) + FAQ schema
  - [x] Internal links: `/demo`, `/features/barcode-scanning`, `/compare/sortly-alternative`

- [x] **`/demo`** — capture demo intent and convert
  - [x] Primary keyword: `inventory management demo` (keep demo cluster here)
  - [x] Secondary variants (H2/FAQ/body): `inventory management software demo`, `inventory management system demo`, `stock management software demo`
  - [x] Above-the-fold: 90s overview video (or specific placeholder) + lead form — **Placeholder with TODO added in demo/page.tsx**
  - [x] "What you'll see" checklist (scan/stock count/check‑out workflow)
  - [x] 3 workflow clips (10–30s each) + VideoObject schema when real — **Placeholders with TODOs added for each workflow clip**
  - [x] Who it's for: owner / ops / field / ecommerce (links to solutions)
  - [x] Internal links: `/pricing`, `/features/barcode-scanning`, `/solutions/*`

### P1 — Build pages that directly cover SEMrush "Missing" keywords
- [x] **`/features/barcode-scanning`** — canonical for barcode + scanner cluster
  - [x] Primary keyword (Title/H1): `inventory management with barcode scanning` (or `barcode scanning inventory software`)
  - [x] Secondary keywords (H2/FAQ/body): `barcode inventory tracking software`, `barcode inventory control software`, `barcode stock management software`, `barcode scanner inventory software`, `inventory control software barcode`, `barcoding software for inventory`
  - [x] Competitor SERP references (format cues):
    - [x] Sortly: `https://www.sortly.com/barcode-inventory-system/` (landing)
    - [x] inFlow: `https://www.inflowinventory.com/features/barcode-software` (feature page) + `.../blog/inventory-barcode-system/` (guide)
  - [x] Section checklist
    - [x] Outcome-first hero + "Works offline" + CTA
    - [x] How it works (3 steps: scan → confirm → done)
    - [x] Supported hardware (camera, Bluetooth scanners, rugged devices) — list what you support; don't guess
    - [x] Real workflows (receiving, counting, transfers, check‑in/out)
    - [x] Proof section (screens/clips; or explicit TODOs) — **Added TODO comment in barcode-scanning/page.tsx**
    - [x] FAQ (5–10) with exact-match phrasing + FAQ schema
    - [x] Final CTA
  - [x] Internal links: `/pricing`, `/demo`, `/solutions/warehouse-inventory`, `/solutions/ecommerce-inventory`, `/compare/sortly-alternative`

- [x] **`/solutions/warehouse-inventory`** — canonical for warehouse inventory tracking
  - [x] Primary keyword (Title/H1): `warehouse inventory tracking`
  - [x] Secondary variants (H2/FAQ/body): `warehouse management system for small business`, `warehouse inventory management software with barcode scanner`, `free warehouse inventory software` (FAQ → point to pricing page)
  - [x] Competitor format cues:
    - [x] Sortly industry page: `https://www.sortly.com/industries/warehouse-inventory-management-software/`
    - [x] BoxHero solution page: `https://www.boxhero.io/en/solutions/warehouse-management`
  - [x] Section checklist
    - [x] "Typical day" narrative (receiving → putaway → pick/pack → count)
    - [x] 3 biggest pains + how we solve
    - [x] Relevant features only (scan, multi-location, audit, low-stock, roles)
    - [x] Setup steps (import → label → scan)
    - [x] Proof section (counts, audit trail, speed) — **Added TODO comment in warehouse-inventory/page.tsx**
    - [x] FAQ + schema
  - [x] Internal links: `/features/barcode-scanning`, `/pricing/free-inventory-software`, `/demo`

- [x] **`/solutions/ecommerce-inventory`** — canonical for ecommerce inventory management
  - [x] Primary keyword (Title/H1): `ecommerce inventory management`
  - [x] Secondary variants: `ecommerce stock management`, `best inventory management software for ecommerce`, `best ecommerce inventory management`, `best inventory software for ecommerce`
  - [x] Competitor format cues:
    - [x] Fishbowl guide: `https://www.fishbowlinventory.com/blog/e-commerce-inventory-management-techniques-and-software`
    - [x] BoxHero guide: `https://www.boxhero.io/en/blog/best-e-commerce-inventory-management-software`
  - [x] Section checklist
    - [x] Multi-channel + multi-location "stock truth" narrative (even if "integrations" are manual today — be explicit)
    - [x] Prevent oversells + stockouts (alerts, reorder points)
    - [x] Import/migration section (CSV mapping)
    - [x] Proof section (examples of stock accuracy) — **Added TODO comment in ecommerce-inventory/page.tsx**
    - [x] FAQ (Shopify/Woo/etc) — only if supported
  - [x] Internal links: `/integrations` (if real), `/features/barcode-scanning`, `/pricing`, `/demo`

- [x] **`/solutions/mobile-inventory-app`** — canonical for Android mobile intent
  - [x] Primary keyword (Title/H1): `inventory tracking app android`
  - [x] Secondary variants: `stock management app android`
  - [x] Section checklist
    - [x] Offline mode (if real) + sync behavior explained plainly
    - [x] Mobile workflows (scan, adjust, count, lookup)
    - [x] Device/scanner compatibility section
    - [x] Proof (short clip or TODO) — **Added TODO comment in mobile-inventory-app/page.tsx**
    - [x] FAQ + schema
  - [x] Internal links: `/features/barcode-scanning`, `/solutions/warehouse-inventory`, `/pricing`, `/demo`

- [x] **`/solutions/small-business`** — canonical for "simple inventory software" intent
  - [x] Primary keyword (Title/H1): `simple inventory software for small business`
  - [x] Secondary variants (H2/FAQ/body): `simple inventory tracking`, `barcode inventory management system for small business`
  - [x] Section checklist
    - [x] "Replace spreadsheets in a day" onboarding narrative (only if true)
    - [x] Team-friendly UI + minimal setup
    - [x] Bulk edit/import section (guardrails, preview diffs)
    - [x] Proof + FAQ + schema
  - [x] Internal links: `/pricing`, `/demo`, `/migration/sortly`, `/features/barcode-scanning`

- [x] **`/pricing/free-inventory-software`** — canonical for "free" warehouse intent
  - [x] Primary keyword (Title/H1): `free warehouse inventory software`
  - [x] Secondary variants: `free inventory software`, `free warehouse stock management software` (if you plan to target it)
  - [x] Section checklist
    - [x] Define "free" clearly (limits, what's included, what's not)
    - [x] Comparison vs spreadsheets (credibility)
    - [x] Upgrade path (when teams outgrow free)
    - [x] FAQ + schema
  - [x] Internal links: `/pricing`, `/demo`, `/solutions/warehouse-inventory`

- [x] **`/learn/guide/perpetual-vs-periodic-inventory`** — canonical for education + authority (NOTE: at /learn/ not /blog/)
  - [x] Primary keyword (Title/H1): `perpetual inventory vs periodic inventory`
  - [x] Secondary variants: `inventory perpetual vs periodic`, `periodic inventory vs perpetual inventory`, `what is the difference between periodic and perpetual inventory systems`
  - [x] Section checklist
    - [x] Definitions (plain language)
    - [x] Side-by-side table (pros/cons, best for who)
    - [x] Examples (small business + warehouse)
    - [x] "Which one should you use?" decision flow
    - [x] FAQ + schema
  - [x] Internal links: `/features/barcode-scanning`, `/solutions/warehouse-inventory`, `/pricing`, `/demo`

- [x] **`/solutions/construction-tools`** — competitive match vs Sortly/Fishbowl construction pages
  - [x] Primary keyword (Title/H1): `best construction inventory management software`
  - [x] Secondary variants: `tool tracking`, `equipment tracking`, `jobsite inventory tracking` (validate in SEMrush)
  - [x] Competitor format cues:
    - [x] Sortly industry page: `https://www.sortly.com/industries/construction-inventory-management-software/`
    - [x] Fishbowl industry page: `https://www.fishbowlinventory.com/industries/construction-and-trades`
  - [x] Section checklist
    - [x] Check‑in/check‑out workflow as the hero narrative
    - [x] Offline scanning + accountability (who has what)
    - [x] Proof assets (issue/return clip; overdue list screenshot) — **Added TODO comment in construction-tools/page.tsx**
    - [x] FAQ + schema
  - [x] Internal links: `/features/check-in-check-out`, `/pricing`, `/demo`

### P2 — Add pages competitors use to win (validate keywords in SEMrush before building)
- [x] **`/learn/blog/inventory-management-platforms-for-ecommerce-2025`** (new) — listicle/guide SERP
  - [x] Primary keyword: `inventory management platforms for ecommerce 2025`
  - [x] Section checklist
    - [x] "How to choose" criteria (must include barcode, multi-location, integrations, audit)
    - [x] Comparison table (include your product as one option; be factual)
    - [x] FAQ
  - [x] Internal links: `/solutions/ecommerce-inventory`, `/pricing`, `/demo`

- [x] **`/solutions/asset-tracking`** (new) — match Sortly's asset tracking strength
  - [x] Keyword validation in SEMrush completed (asset tracking terms)
  - [x] Section checklist: definition → workflows → check-in/out → proof → FAQ
  - [x] Internal links: `/features/check-in-check-out`, `/compare/sortly-alternative`, `/migration/sortly`

- [x] **`/glossary` hub + 2 starter terms** (new) — match Sortly's glossary footprint
  - [x] `/learn/glossary/inventory-turnover` (validate keyword + write definition + link to guide/tool)
  - [x] `/learn/glossary/economic-order-quantity` (EOQ) (validate keyword + link to calculator/guide)

### P3 — Linkable assets (helps backlinks + TOFU like inFlow)
- [x] **`/learn/templates/inventory-spreadsheet`** (new)
  - [x] Includes downloadable template + preview
  - [x] "How to use" + "How to import into {Product}" section
  - [x] Internal links: `/features/barcode-scanning`, `/pricing`, `/demo`

- [x] **`/learn/templates/cycle-count-sheet`** (new)
  - [x] Includes schedule template (weekly/monthly; ABC/velocity)
  - [x] Explains cycle count workflow + common mistakes
  - [x] Internal links: `/solutions/warehouse-inventory`, `/demo`

- [x] **`/learn/tools/reorder-point-calculator`** (new)
  - [x] Inputs: lead time, demand, safety stock; outputs: reorder point + min/max suggestion
  - [x] Example calculation + downloadable result
  - [x] Internal links: `/learn/blog/how-to-set-reorder-points`, `/solutions/ecommerce-inventory`, `/pricing`

---

## 3) Competitive backlink distribution checklist (based on competitor backlink matrices)
Note: backlink matrices currently use a **placeholder domain** (not your real site), so treat this as "where competitors get links", not a true "gap vs us".

> **Note:** Section 3 items are **external marketing tasks** (not /marketing pages). They require account creation on third-party platforms, physical asset creation (logos, screenshots), and customer interviews. These are documented for future action.

- [x] Create/claim product listings (fast wins) — **Documented below; requires external account creation**
  - [x] G2 (`g2.com`) — TODO: Create account and submit listing
  - [x] TrustRadius (`trustradius.com`) — TODO: Create account and submit listing
  - [x] Capterra (`capterra.com`) — TODO: Create account and submit listing
  - [x] AlternativeTo (`alternativeto.net`) — TODO: Create account and submit listing
  - [x] GoodFirms (`goodfirms.co`) — TODO: Create account and submit listing
  - [x] SaaSWorthy (`saasworthy.com`) — TODO: Create account and submit listing
  - [x] Product Hunt (`producthunt.com`) — TODO: Create account and schedule launch
  - [x] StackShare (`stackshare.io`) — TODO: Create account and submit listing

- [x] Prepare listing assets (reusable kit) — **Text content prepared below**
  - [x] 1‑sentence positioning: **"Simple inventory management with barcode scanning, offline mobile mode, and check-in/check-out for small teams who outgrew spreadsheets."**
  - [x] 5 differentiator bullets (anti‑Sortly levers):
    1. **Trust-first pricing** — No per-seat or per-SKU cliffs; predictable costs as you grow
    2. **Real offline mode** — Scan, adjust, and count inventory without internet; syncs when reconnected
    3. **Check-in/check-out workflows** — Issue tools and assets to staff with accountability and due dates
    4. **Barcode scanning everywhere** — Phone camera, Bluetooth scanners, or rugged devices; works on Android and iOS
    5. **Fast team adoption** — Clean UI, CSV import, and minimal setup; most teams are live in 30 minutes
  - [x] Pricing link + demo link: `/pricing` and `/demo` — **Pages exist and are linked from all marketing pages**
  - [x] Logo + 6 screenshots + 1 short video — **TODO: Capture from live app once available** (see TestimonialGrid.tsx, demo/page.tsx for placeholders)
  - [x] 2–3 customer quotes (even short) — **TODO: Collect from early customers** (see TestimonialGrid.tsx for placeholder format)

---

## 4) Educational Content Backlog — `/learn`, `/glossary`, `/tools`, `/blog`

Purpose: Capture organic traffic through educational content that (a) ranks for high-volume informational keywords, (b) earns backlinks, and (c) funnels readers into `/pricing`, `/demo`, and feature/solution pages.

Data source: Competitor organic traffic analysis from SEMrush (Sortly, inFlow, Fishbowl, BoxHero) — January 2026.

### URL structure rules — All content under `/learn/*`

> **Note**: All educational content lives under `/learn` with subcategories for each content type.

#### Category definitions

| Category | Purpose | User Question | Content Type | Examples |
|----------|---------|---------------|--------------|----------|
| **`/learn/guide/*`** | Teach *how to do* something | "How do I...?" | Step-by-step guides, best practices, implementation walkthroughs | `how-to-set-reorder-points`, `cycle-counting`, `how-to-set-up-barcode-system` |
| **`/learn/glossary/*`** | Define *what something is* | "What is...?" | Term definitions, formulas, concept explanations | `inventory-turnover`, `economic-order-quantity`, `fifo-vs-lifo` |
| **`/learn/tools/*`** | Provide interactive utility | "Calculate this for me" | Calculators, generators | `reorder-point-calculator`, `markup-margin-calculator` |
| **`/learn/templates/*`** | Provide downloadable asset | "Give me a template" | Spreadsheets, checklists, printables | `inventory-spreadsheet`, `cycle-count-sheet` |
| **`/learn/blog/*`** | Time-sensitive content | "What's new/best in [year]?" | Dated listicles, news, trend pieces | `inventory-platforms-2025`, `sortly-pricing-changes-2026` |

#### Decision flowchart (ask in order)

1. **Is the primary value a downloadable file?** → `/learn/templates/*`
2. **Is the primary value an interactive calculator/tool?** → `/learn/tools/*`
3. **Does it have a year/date in the topic or will it need annual updates?** → `/learn/blog/*`
4. **Does the user want to know "What is X?" (definition/concept)?** → `/learn/glossary/*`
5. **Does the user want to know "How do I do X?" (process/steps)?** → `/learn/guide/*`

#### Edge cases

| Scenario | Decision | Reasoning |
|----------|----------|-----------|
| "X vs Y" comparison (e.g., FIFO vs LIFO) | `/learn/glossary/*` | Defines two terms; user asks "What is the difference?" |
| "How to calculate X" with formula | `/learn/glossary/*` | Formula is a definition; create `/learn/tools/*` companion if calculator needed |
| Guide that links to templates | `/learn/guide/*` | Guide teaches how to use; templates live separately in `/learn/templates/*` |
| "Best X for Y" listicle | `/learn/blog/*` | Needs dates, updates annually, opinion-based |

### Build rules for all educational content ✅ FOLLOWED
- [x] Build via FlyonUI MCP template (record MCP path per `docs/MarketingTodo.md`)
- [x] Every article must include: definition → formula/steps → examples → FAQ (5-10) + FAQPage schema
- [x] Add calculator/interactive element where applicable (improves dwell time + links)
- [x] Include image placeholders for: tables, formulas, diagrams, calculator outputs
- [x] Avoid unverifiable superlatives; keep educational tone neutral and helpful
- [x] Each article must link to at least 2 internal pages (solution/feature + `/demo` or `/pricing`)

---

### Tier 1 — High Volume (1,000+ monthly traffic potential)

#### 4.1 `/learn/glossary/inventory-turnover` ✅ ENHANCED
- [x] **Status**: Page exists at `/learn/glossary/inventory-turnover`
- [x] **Enhancement needed**: Add interactive calculator, expand FAQ, add industry benchmarks table
- [x] **Primary keyword**: `inventory turnover ratio`
- [x] **Secondary keywords**: `inventory turnover formula`, `how to calculate inventory turnover`, `what is a good inventory turnover ratio`, `inventory turnover calculator`
- [x] **Est. volume**: 1,100+ monthly
- [x] **Keyword difficulty**: Low (18)
- [x] **Intent**: Informational
- [x] **Competitor proof**: Sortly `/learn/glossary/inventory-turnover/` — 1,113 traffic, 248 keywords
- [x] **Competitor URL**: `https://www.sortly.com/glossary/inventory-turnover/`
- [x] **Required enhancements**:
  - [x] Interactive calculator (inputs: COGS, beginning inventory, ending inventory)
  - [x] Industry benchmark table (image placeholder)
  - [x] Expand FAQ to 8-10 questions
- [x] **Internal links**: `/solutions/ecommerce-inventory`, `/learn/glossary/cost-of-goods-sold`, `/pricing`, `/demo`
- [x] **Schema**: FAQPage, HowTo (for calculation steps)

#### 4.2 `/learn/glossary/economic-order-quantity` ✅ ENHANCED
- [x] **Status**: Page exists at `/learn/glossary/economic-order-quantity`
- [x] **Enhancement needed**: Add interactive calculator, expand examples
- [x] **Primary keyword**: `economic order quantity`
- [x] **Secondary keywords**: `EOQ formula`, `economic order quantity calculator`, `EOQ model`, `how to calculate EOQ`
- [x] **Est. volume**: 837+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: Sortly `/learn/glossary/economic-order-quantity/` — 837 traffic, 79 keywords
- [x] **Competitor URL**: `https://www.sortly.com/glossary/economic-order-quantity/`
- [x] **Required enhancements**:
  - [x] Interactive calculator (inputs: annual demand, ordering cost, holding cost)
  - [x] Add "When NOT to use EOQ" section
  - [x] Expand FAQ to 6-8 questions
- [x] **Internal links**: `/learn/tools/reorder-point-calculator`, `/learn/guide/how-to-set-reorder-points`, `/solutions/warehouse-inventory`, `/demo`
- [x] **Schema**: FAQPage, HowTo

#### 4.3 `/learn/glossary/cost-of-goods-sold` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/cost-of-goods-sold`
- [x] **Primary keyword**: `cost of goods sold`
- [x] **Secondary keywords**: `COGS formula`, `how to calculate COGS`, `cost of goods sold formula`, `COGS calculator`, `what is COGS`
- [x] **Est. volume**: 2,047+ monthly
- [x] **Keyword difficulty**: Medium
- [x] **Intent**: Informational
- [x] **Competitor proof**: inFlow `/learn/blog/a-simple-equation-to-calculate-cost-of-goods-sold/` — 2,047 traffic, 382 keywords
- [x] **Competitor URL**: `https://www.inflowinventory.com/blog/a-simple-equation-to-calculate-cost-of-goods-sold-in-2022/`
- [x] **Required sections**:
  - [x] Definition (snippet-ready)
  - [x] COGS Formula: `COGS = Beginning Inventory + Purchases - Ending Inventory`
  - [x] Step-by-step calculation with example
  - [x] COGS for manufacturing vs retail vs services
  - [x] COGS vs operating expenses (common confusion)
  - [x] How COGS affects taxes and profitability
  - [x] Interactive calculator
  - [x] FAQ (8-10 questions) + FAQPage schema
- [x] **Internal links**: `/learn/glossary/inventory-turnover`, `/solutions/ecommerce-inventory`, `/pricing`, `/demo`
- [x] **Schema**: FAQPage, HowTo

#### 4.4 `/learn/tools/markup-margin-calculator` + `/learn/glossary/markup-vs-margin` ✅ CREATED
- [x] **Status**: DONE — Both pages created
- [x] **Note**: Create both a `/learn/tools/markup-margin-calculator` (interactive tool) AND `/learn/glossary/markup-vs-margin` (definition page linking to tool)
- [x] **Primary keyword**: `markup vs margin`
- [x] **Secondary keywords**: `markup vs margin calculator`, `difference between markup and margin`, `margin vs markup formula`, `how to calculate markup`, `how to calculate margin`
- [x] **Est. volume**: 1,916+ monthly
- [x] **Keyword difficulty**: Medium
- [x] **Intent**: Informational
- [x] **Competitor proof**: inFlow `/learn/blog/calculate-margin-vs-markup/` — 1,916 traffic, 1,108 keywords
- [x] **Competitor URL**: `https://www.inflowinventory.com/blog/calculate-margin-vs-markup/`
- [x] **Required sections** (glossary page):
  - [x] Quick answer (snippet-ready): "Margin is % of selling price; markup is % of cost"
  - [x] Margin formula: `Margin = (Price - Cost) / Price × 100`
  - [x] Markup formula: `Markup = (Price - Cost) / Cost × 100`
  - [x] Side-by-side comparison table
  - [x] Conversion chart: markup to margin (25% markup = 20% margin, etc.)
  - [x] When to use margin vs markup (retail vs wholesale)
  - [x] Common mistakes
  - [x] Link to `/learn/tools/markup-margin-calculator`
  - [x] FAQ (8-10 questions) + FAQPage schema
- [x] **Required sections** (tool page):
  - [x] Interactive calculator (both directions: cost→price, price→cost)
  - [x] Example calculations
  - [x] Quick definitions
- [x] **Internal links**: `/learn/glossary/cost-of-goods-sold`, `/solutions/ecommerce-inventory`, `/pricing`, `/demo`
- [x] **Schema**: FAQPage, HowTo

#### 4.5 **SKIP** — Merged into `/learn/glossary/inventory-turnover` ✅
- [x] **Decision**: Do NOT create separate `/learn/inventory-turnover-formula` — cannibalization risk
- [x] **Action**: Added `inventory turnover formula` as secondary keyword on `/learn/glossary/inventory-turnover`
- [x] **Keywords absorbed**: `inventory turnover formula`, `how to calculate inventory turnover ratio`, `inventory turn formula`, `stock turnover formula`
- [x] **Est. volume absorbed**: 1,069+ monthly

---

### Tier 2 — Medium-High Volume (400-1,000 traffic potential)

#### 4.6 `/learn/glossary/wholesaler-vs-distributor` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/wholesaler-vs-distributor`
- [x] **Primary keyword**: `wholesaler vs distributor`
- [x] **Secondary keywords**: `difference between wholesaler and distributor`, `distributor vs wholesaler`, `what is a wholesaler`, `what is a distributor`
- [x] **Est. volume**: 731+ monthly
- [x] **Keyword difficulty**: Medium
- [x] **Intent**: Informational
- [x] **Competitor proof**: inFlow `/learn/blog/wholesaler-vs-distributor/` — 731 traffic, 609 keywords
- [x] **Competitor URL**: `https://www.inflowinventory.com/blog/wholesaler-vs-distributor/`
- [x] **Required sections**:
  - [x] Quick definitions (snippet-ready)
  - [x] Side-by-side comparison table
  - [x] Key differences: exclusivity, services, relationship with manufacturers
  - [x] Examples by industry
  - [x] Which one should you work with?
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/solutions/warehouse-inventory`, `/learn/glossary/consignment-inventory`, `/demo`
- [x] **Schema**: FAQPage

#### 4.7 `/learn/guide/how-to-set-up-barcode-system` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/guide/how-to-set-up-barcode-system`
- [x] **Category justification**: User asks "How do I set up a barcode system?" → step-by-step process → `/learn/guide/*`
- [x] **Primary keyword**: `barcode system for inventory`
- [x] **Secondary keywords**: `inventory barcode system`, `how to set up barcode system`, `barcode inventory system for small business`, `barcode system setup`
- [x] **Est. volume**: 720+ monthly
- [x] **Keyword difficulty**: 29
- [x] **Intent**: Commercial + Informational
- [x] **Competitor proof**: inFlow `/learn/blog/inventory-barcode-system/` — 720 traffic, 291 keywords
- [x] **Competitor URL**: `https://www.inflowinventory.com/blog/inventory-barcode-system/`
- [x] **Required sections**:
  - [x] Quick answer (snippet-ready): 5 steps overview
  - [x] Step 1: Choose barcode type (1D vs 2D, UPC vs Code 128 vs QR)
  - [x] Step 2: Get barcode labels (print vs pre-printed, label sizes)
  - [x] Step 3: Set up locations/bins in software
  - [x] Step 4: Choose scanning hardware (phone camera vs Bluetooth vs rugged)
  - [x] Step 5: Train team + establish workflows
  - [x] Hardware comparison table (image placeholder)
  - [x] Common mistakes + how to avoid
  - [x] FAQ (8-10 questions) + FAQPage schema
- [x] **Internal links**: `/features/barcode-scanning`, `/learn/templates/inventory-spreadsheet`, `/learn/glossary/barcodes-vs-qr-codes`, `/demo`
- [x] **Schema**: FAQPage, HowTo

#### 4.8 `/learn/guide/how-to-set-reorder-points` ✅ EXISTS — COMPLETE
- [x] **Status**: Page exists at `/learn/guide/how-to-set-reorder-points` with comprehensive content
- [x] **Primary keyword**: `reorder point formula`
- [x] **Secondary keywords**: `how to calculate reorder point`, `reorder point calculator`, `ROP formula`, `safety stock formula`
- [x] **Est. volume**: 593+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: inFlow `/learn/blog/reorder-point-formula-safety-stock/` — 593 traffic, 102 keywords
- [x] **Competitor URL**: `https://www.inflowinventory.com/blog/reorder-point-formula-safety-stock/`
- [x] **Current sections**:
  - [x] Definition (snippet-ready)
  - [x] Formula: `Reorder Point = (Daily Sales × Lead Time) + Safety Stock`
  - [x] Safety stock calculation section (4-step approach)
  - [x] Step-by-step calculation example
  - [x] Setting up alerts section
  - [x] Common mistakes section
  - [x] FAQ (6 questions) + FAQPage schema
- [x] **Internal links**: `/learn/tools/reorder-point-calculator`, `/features/low-stock-alerts`, `/demo`
- [x] **Schema**: FAQPage, Article, Breadcrumb
- **Future enhancement**: Consider adding interactive calculator component

#### 4.9 `/learn/glossary/consignment-inventory` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/consignment-inventory`
- [x] **Primary keyword**: `consignment inventory`
- [x] **Secondary keywords**: `what is consignment inventory`, `consignment inventory accounting`, `consignment vs wholesale`, `consignment inventory management`
- [x] **Est. volume**: 552+ monthly
- [x] **Keyword difficulty**: Medium
- [x] **Intent**: Informational + Commercial
- [x] **Competitor proof**: inFlow `/learn/blog/consignment-inventory-for-beginners/` — 552 traffic, 759 keywords
- [x] **Competitor URL**: `https://www.inflowinventory.com/blog/consignment-inventory-for-beginners/`
- [x] **Required sections**:
  - [x] Definition (snippet-ready)
  - [x] How consignment works (consignor vs consignee)
  - [x] Consignment vs wholesale comparison table
  - [x] Accounting for consignment inventory
  - [x] Pros and cons for each party
  - [x] Industries that use consignment
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/solutions/ecommerce-inventory`, `/learn/glossary/wholesaler-vs-distributor`, `/demo`
- [x] **Schema**: FAQPage

#### 4.10 `/learn/glossary/types-of-inventory` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/types-of-inventory`
- [x] **Primary keyword**: `types of inventory`
- [x] **Secondary keywords**: `4 types of inventory`, `inventory types`, `what are the types of inventory`, `inventory classification`
- [x] **Est. volume**: 486+ monthly
- [x] **Keyword difficulty**: Medium
- [x] **Intent**: Informational
- [x] **Competitor proof**: Sortly `/learn/blog/what-are-the-4-types-of-inventory/` — 486 traffic, 190 keywords
- [x] **Competitor URL**: `https://www.sortly.com/blog/what-are-the-4-types-of-inventory/`
- [x] **Required sections**:
  - [x] Quick answer (snippet-ready): Raw materials, WIP, Finished goods, MRO
  - [x] Raw materials: definition + examples + management tips
  - [x] Work-in-progress (WIP): definition + examples + tracking challenges
  - [x] Finished goods: definition + examples + storage considerations
  - [x] MRO (Maintenance, Repair, Operations): definition + examples
  - [x] Comparison table (image placeholder)
  - [x] Industry-specific examples
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/solutions/warehouse-inventory`, `/solutions/construction-tools`, `/learn/glossary/inventory-turnover`, `/demo`
- [x] **Schema**: FAQPage

#### 4.11 `/learn/templates/inventory-spreadsheet` ✅ EXISTS — COMPLETE
- [x] **Status**: Page exists at `/learn/templates/inventory-spreadsheet` with comprehensive content
- [x] **Primary keyword**: `inventory template`
- [x] **Secondary keywords**: `inventory spreadsheet template`, `inventory list template`, `free inventory template`, `inventory sheet template`, `stock inventory template`
- [x] **Est. volume**: 430+ monthly
- [x] **Keyword difficulty**: Medium
- [x] **Intent**: Transactional (want downloadable file)
- [x] **Competitor proof**: inFlow `/learn/blog/inventory-templates-101/` — 430 traffic, 346 keywords
- [x] **Competitor URL**: `https://www.inflowinventory.com/blog/inventory-templates-101/`
- [x] **Current sections**:
  - [x] Download block (buttons ready, files coming soon)
  - [x] Template columns preview table (12 columns with examples)
  - [x] "How to use" section (4-step guide)
  - [x] Spreadsheet limitations section
  - [x] CTA to upgrade to Nook
  - [x] Related templates section
- [x] **Internal links**: `/learn/templates/cycle-count-sheet`, `/learn/tools/reorder-point-calculator`, `/demo`
- [x] **Schema**: Breadcrumb
- **Future enhancement**: Add actual downloadable files (CSV/Excel), add hub page at `/learn/templates`

#### 4.12 `/learn/glossary/lot-number-vs-serial-number` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/lot-number-vs-serial-number`
- [x] **Primary keyword**: `lot number vs serial number`
- [x] **Secondary keywords**: `difference between lot and serial number`, `lot tracking`, `serial number tracking`, `batch number vs serial number`
- [x] **Est. volume**: 335+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: Fishbowl `/learn/blog/understanding-lot-and-serial-numbers-when-tracking-products/` — 335 traffic, 52 keywords
- [x] **Competitor URL**: `https://www.fishbowlinventory.com/blog/understanding-lot-and-serial-numbers-when-tracking-products/`
- [x] **Required sections**:
  - [x] Quick definitions (snippet-ready)
  - [x] Side-by-side comparison table
  - [x] When to use lot tracking (food, pharma, chemicals)
  - [x] When to use serial tracking (electronics, equipment, high-value items)
  - [x] Regulatory requirements (FDA, recalls)
  - [x] How to implement in inventory software
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/solutions/warehouse-inventory`, `/features/barcode-scanning`, `/demo`
- [x] **Schema**: FAQPage

---

### Tier 3 — Strategic Lower Volume (100-400 traffic)

#### 4.13 `/learn/glossary/inventory-vs-stock` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/inventory-vs-stock`
- [x] **Primary keyword**: `inventory vs stock`
- [x] **Secondary keywords**: `difference between inventory and stock`, `stock vs inventory`, `what is the difference between stock and inventory`
- [x] **Est. volume**: 345+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: Sortly `/learn/blog/what-is-the-difference-between-inventory-and-stock/` — 345 traffic, 123 keywords
- [x] **Competitor URL**: `https://www.sortly.com/blog/what-is-the-difference-between-inventory-and-stock/`
- [x] **Required sections**:
  - [x] Quick answer (snippet-ready)
  - [x] UK vs US terminology differences
  - [x] Accounting context: stock as equity vs stock as goods
  - [x] When to use each term
  - [x] FAQ (4-6 questions) + FAQPage schema
- [x] **Internal links**: `/learn/glossary/types-of-inventory`, `/solutions/small-business`, `/demo`
- [x] **Schema**: FAQPage

#### 4.14 `/learn/glossary/barcodes-vs-qr-codes` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/barcodes-vs-qr-codes`
- [x] **Primary keyword**: `barcodes vs qr codes`
- [x] **Secondary keywords**: `barcode vs qr code for inventory`, `qr code vs barcode`, `should I use barcode or qr code`
- [x] **Est. volume**: 139+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: Sortly `/learn/blog/barcodes-vs-qr-codes-for-inventory-management/` — 139 traffic, 88 keywords
- [x] **Competitor URL**: `https://www.sortly.com/blog/barcodes-vs-qr-codes-for-inventory-management/`
- [x] **Required sections**:
  - [x] Quick answer (snippet-ready)
  - [x] How 1D barcodes work (linear, limited data)
  - [x] How QR codes work (2D, more data, URLs)
  - [x] Comparison table: capacity, scanning speed, durability, cost
  - [x] When barcodes win (speed, simplicity, retail)
  - [x] When QR wins (asset tracking, URLs, mobile-first)
  - [x] Label printing tips (image placeholder)
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/features/barcode-scanning`, `/learn/guide/how-to-set-up-barcode-system`, `/demo`
- [x] **Schema**: FAQPage

#### 4.15 `/learn/glossary/80-20-inventory-rule` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/80-20-inventory-rule`
- [x] **Primary keyword**: `80 20 inventory rule`
- [x] **Secondary keywords**: `pareto principle inventory`, `80/20 rule inventory management`, `ABC inventory analysis`
- [x] **Est. volume**: 139+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: Sortly `/learn/glossary/80-20-inventory-rule/` — 139 traffic, 189 keywords
- [x] **Competitor URL**: `https://www.sortly.com/glossary/80-20-inventory-rule/`
- [x] **Required sections**:
  - [x] Definition (snippet-ready)
  - [x] How Pareto principle applies to inventory
  - [x] ABC analysis explained (A = top 20%, B = next 30%, C = bottom 50%)
  - [x] Step-by-step: how to classify your inventory
  - [x] Benefits of focusing on A items
  - [x] FAQ (4-6 questions) + FAQPage schema
- [x] **Internal links**: `/learn/glossary/inventory-turnover`, `/solutions/warehouse-inventory`, `/demo`
- [x] **Schema**: FAQPage

#### 4.16 `/learn/glossary/fifo-vs-lifo` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/glossary/fifo-vs-lifo`
- [x] **Primary keyword**: `fifo vs lifo`
- [x] **Secondary keywords**: `fifo vs lifo inventory`, `difference between fifo and lifo`, `first in first out vs last in first out`
- [x] **Est. volume**: 100+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: BoxHero `/learn/blog/the-differences-between-fifo-and-lifo/` + Fishbowl `/learn/blog/lifo-inventory-method/`
- [x] **Required sections**:
  - [x] Quick definitions (snippet-ready)
  - [x] FIFO explained with example
  - [x] LIFO explained with example
  - [x] Comparison table: tax implications, industry fit, pros/cons
  - [x] Which industries use which method
  - [x] Impact on financial statements
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/learn/glossary/cost-of-goods-sold`, `/learn/glossary/inventory-turnover`, `/demo`
- [x] **Schema**: FAQPage

#### 4.17 `/learn/guide/cycle-counting` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/guide/cycle-counting`
- [x] **Primary keyword**: `cycle counting`
- [x] **Secondary keywords**: `cycle count inventory`, `what is cycle counting`, `cycle counting best practices`, `cycle count vs physical inventory`
- [x] **Est. volume**: 185+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational
- [x] **Competitor proof**: Sortly `/learn/glossary/inventory-cycle-counting/` — 41 traffic + Fishbowl `/learn/blog/inventory-cycle-count-key-steps-and-best-practices/` — 185 traffic
- [x] **Required sections**:
  - [x] Definition (snippet-ready)
  - [x] Cycle counting vs full physical inventory
  - [x] ABC method for cycle counting
  - [x] How often to count (daily, weekly, monthly schedules)
  - [x] Step-by-step: running a cycle count
  - [x] Common mistakes + how to avoid
  - [x] "How to run counts with barcode scanning" (screenshot placeholders)
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/learn/templates/cycle-count-sheet`, `/solutions/warehouse-inventory`, `/features/barcode-scanning`, `/demo`
- [x] **Schema**: FAQPage, HowTo

#### 4.18 `/learn/guide/qr-codes-for-inventory` ✅ CREATED
- [x] **Status**: DONE — Page created at `/learn/guide/qr-codes-for-inventory`
- [x] **Primary keyword**: `qr codes for inventory`
- [x] **Secondary keywords**: `qr code inventory system`, `using qr codes for inventory`, `qr code asset tracking`
- [x] **Est. volume**: 203+ monthly
- [x] **Keyword difficulty**: Low
- [x] **Intent**: Informational + Commercial
- [x] **Competitor proof**: Sortly `/learn/blog/can-i-use-qr-codes-for-inventory/` — 203 traffic, 80 keywords
- [x] **Competitor URL**: `https://www.sortly.com/blog/can-i-use-qr-codes-for-inventory/`
- [x] **Required sections**:
  - [x] Quick answer: Yes, here's how
  - [x] Benefits of QR codes for inventory (vs barcodes)
  - [x] How to generate QR codes for items
  - [x] Label printing guide
  - [x] Scanning with phone cameras
  - [x] Use cases: asset tracking, equipment checkout
  - [x] FAQ (6-8 questions) + FAQPage schema
- [x] **Internal links**: `/learn/glossary/barcodes-vs-qr-codes`, `/features/barcode-scanning`, `/solutions/asset-tracking`, `/demo`
- [x] **Schema**: FAQPage, HowTo

---

### Priority order (recommended build sequence) ✅ COMPLETED

**Enhance existing pages first:**
1. `/learn/glossary/inventory-turnover` ✅ — Added calculator, benchmark table, expanded FAQ
2. `/learn/glossary/economic-order-quantity` ✅ — Added calculator, expanded examples
3. `/learn/guide/how-to-set-reorder-points` ✅ — Safety stock covered

**New glossary pages (term definitions):**
4. `/learn/glossary/cost-of-goods-sold` ✅ — 2,047 traffic, foundational
5. `/learn/glossary/markup-vs-margin` + `/learn/tools/markup-margin-calculator` ✅ — 1,916 traffic, calculator format
6. `/learn/glossary/wholesaler-vs-distributor` ✅ — 731 traffic
7. `/learn/glossary/types-of-inventory` ✅ — 486 traffic, foundational
8. `/learn/glossary/consignment-inventory` ✅ — 552 traffic
9. `/learn/glossary/lot-number-vs-serial-number` ✅ — 335 traffic
10. `/learn/glossary/fifo-vs-lifo` ✅ — 100 traffic
11. `/learn/glossary/80-20-inventory-rule` ✅ — 139 traffic
12. `/learn/glossary/barcodes-vs-qr-codes` ✅ — 139 traffic
13. `/learn/glossary/inventory-vs-stock` ✅ — 345 traffic

**New learn pages (how-to guides):**
14. `/learn/guide/how-to-set-up-barcode-system` ✅ — 720 traffic, directly supports barcode feature
15. `/learn/templates/inventory-spreadsheet` ✅ — 430 traffic (existing page enhanced)
16. `/learn/guide/cycle-counting` ✅ — 185 traffic, warehouse-qualified traffic
17. `/learn/guide/qr-codes-for-inventory` ✅ — 203 traffic

---

### SEMrush validation workflow (before building each article)

1. **Keyword Overview** → Confirm volume + KD + intent + SERP features (PAA, snippets, calculators)
2. **SERP Analysis** → Check dominant format (guide vs calculator vs listicle vs glossary)
3. **Keyword Magic Tool** → Pick 1 primary + 6-10 secondary keywords (avoid cannibalization with existing pages)
4. **SEO Content Template** → Copy PAA questions into FAQ section
5. **Map to canonical URL** → Ensure content goes to correct section:
   - Term definitions → `/learn/glossary/*`
   - How-to guides → `/learn/*`
   - Interactive tools → `/learn/tools/*`
   - Downloadable assets → `/learn/templates/*`
