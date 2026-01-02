# New Marketing Pages Planning (SEMrush‑driven)
Last updated: **2026-01-02**

- [ ] SEMrush inputs used:
  - [ ] `docs/semrush/MissingKeyword2Jan2026.csv` (Missing keywords)
  - [ ] `docs/semrush/sortly.com-organic.PagesV2-us-20260101-2026-01-02T15_37_55Z.csv` (Top pages)
  - [ ] `docs/semrush/boxhero.io-organic.PagesV2-us-20260101-2026-01-02T15_38_27Z.csv` (Top pages)
  - [ ] `docs/semrush/fishbowlinventory.com-organic.PagesV2-us-20260101-2026-01-02T15_38_48Z.csv` (Top pages)
  - [ ] `docs/semrush/inflowinventory.com-organic.PagesV2-us-20260101-2026-01-02T15_39_09Z.csv` (Top pages)
  - [ ] `docs/semrush/sortly.com-backlinks_matrix.csv` (Backlinks sources — competitor only)
  - [ ] `docs/semrush/boxhero.io-backlinks_matrix.csv` (Backlinks sources — competitor only)
  - [ ] `docs/semrush/fishbowlinventory.com-backlinks_matrix.csv` (Backlinks sources — competitor only)
  - [ ] `docs/semrush/inflowinventory.com-backlinks_matrix.csv` (Backlinks sources — competitor only)

---

## Research references (must inform every page)
- [ ] Market overview + demand signals: `docs/Market Research.md`
- [ ] What users want (directional %; not survey data): `docs/Features Needed.md`
- [ ] Pain point → feature mapping: `docs/Pain Point Feature.md`
- [ ] Anti‑Sortly “switcher” pain points: `docs/Sortly PainPoint.md`
- [ ] What Nook actually has (features + benefits): `docs/Features&Benefits.md`

## Non‑negotiable build + content safety conditions
### 1) FlyonUI MCP requirement (always)
- [ ] Every new marketing page **must** be created from a FlyonUI MCP page template (no hand-built layouts).
- [ ] Every refinement/update of an existing marketing page **must** start from FlyonUI MCP (refine/re-instantiate via template; preserve section order).
- [ ] Record MCP evidence for each page: template name + MCP path + snapshot (per `docs/MarketingTodo.md`).

### 2) Content safety requirement (avoid legal risk)
- [ ] No defamatory or insulting language about competitors; keep comparisons factual and workflow-based.
- [ ] No unverified claims (“best”, “#1”, “top-rated”, “most trusted”, etc.) unless you can cite a verifiable source.
- [ ] No promises/guarantees that can be challenged (“never loses items”, “works offline everywhere”, “syncs instantly”) unless the product behavior truly supports it; otherwise qualify or mark as TODO/roadmap.
- [ ] No competitor trademark misuse in headings/ads-like copy; use neutral “Alternative” framing on compare pages.
- [ ] No fabricated stats/testimonials/logos; if proof is missing, use explicit TODO placeholders instead.
- [ ] Add image/icon placeholders where visuals are required (don’t leave “Proof” sections empty).
- [ ] Any “% of users” numbers remain labeled as directional estimates from Reddit synthesis (`docs/Features Needed.md`).

### Market overview checklist (from `docs/Market Research.md`)
- [ ] Price sensitivity + distrust of surprise tier jumps (especially Sortly)
- [ ] Spreadsheet pain (errors, version conflicts, manual effort)
- [ ] “Too complex / ERP vibe” rejection (needs zero training)
- [ ] Inventory trust gap (counts not matching reality, lost items)
- [ ] Integration gaps (Shopify/Xero/QuickBooks + double entry)
- [ ] Feature gaps (alerts, scanning, workflows) drive switching

### Sortly “killer” checklist (from `docs/Sortly PainPoint.md`)
- [ ] Predictable pricing narrative (no sudden hikes, no artificial SKU/user cliffs)
- [ ] Smooth barcode scanning workflow (phone + Bluetooth where applicable)
- [ ] Real check‑in/check‑out workflow (tools/assets accountability)
- [ ] Reliable sync + “trust layer” (reduce mismatch anxiety)
- [ ] Growth path (integrations/automation) without ERP complexity

### Page writing constraint (from `docs/Features Needed.md`)
- [ ] Any “% of users” numbers are **directional estimates**; label accordingly (avoid implying survey data)
- [ ] Every money page explicitly addresses top needs: simple UI, speed, mobile, scanning, alerts, multi-user, folders, search, CSV import

### Pain point → feature → benefit mapping checklist
Use this as a requirement: each P0/P1 page must explicitly address at least **3** pain points and map them to **real** Nook features.

- [ ] High cost / tier shock → transparent pricing + no SKU cliffs messaging → “budget confidence” (ref: `docs/Market Research.md`, `docs/Sortly PainPoint.md`)
- [ ] Spreadsheet errors / lost items → stock movements + audit trail → “inventory you can trust” (ref: `docs/Features&Benefits.md`)
- [ ] Too complex / training required → clean UI + minimal setup → “team adoption without training” (ref: `docs/Features Needed.md`)
- [ ] Manual counts / slow updates → fast item add/edit + scanning → “speed on the floor” (ref: `docs/Features Needed.md`, `docs/Features&Benefits.md`)
- [ ] Stockouts / reordering stress → low stock alerts + min/max → “prevent stockouts” (ref: `docs/Features&Benefits.md`)
- [ ] Tools go missing → check-in/check-out + due dates/history → “accountability” (ref: `docs/Pain Point Feature.md`, `docs/Features&Benefits.md`)
- [ ] Integration double-entry → integrations (only if real) → “less reconciliation” (ref: `docs/Market Research.md`, `docs/Features&Benefits.md`)

### Claim validation checklist (only say what we actually have)
Before writing copy, confirm the capability exists in `docs/Features&Benefits.md` (or mark as roadmap/TODO on the page).

- [ ] Folder/location hierarchy (warehouse → shelf → bin)
- [ ] Barcode/QR scanning experience (phone scanning and/or scanner support)
- [ ] Low stock alerts + min/max thresholds
- [ ] Check-in/check-out workflow (tools/assets accountability)
- [ ] Bulk import/export (CSV/Excel) with mapping/preview
- [ ] Multi-user real-time sync + audit trail
- [ ] Multi-location support (warehouse/store/van/job site)
- [ ] Labels/printing (Sortly-compatible sizes) if referenced on barcode pages
- [ ] Integrations/API only if implemented (otherwise “planned” + waitlist)

## 0) One‑time decisions (avoid rework + cannibalization)
- [ ] Confirm final brand name (replace “Nook Inventory” in copy specs)
- [ ] Confirm final marketing domain
- [ ] Confirm primary CTA: **Start Free Trial** vs **Request a Demo**
- [ ] Confirm which integrations are real today (Shopify/WooCommerce/QuickBooks/Xero/etc) — don’t publish “integration pages” if not supported
- [ ] Confirm canonical owner for barcode cluster (recommend: `/features/barcode-scanning` owns variants; Home stays broader)

---

## 1) SEMrush “Missing” keyword coverage checklist (47 keywords)
Goal: every keyword below is assigned to **one** canonical URL (variants go in H2/FAQ/body on that URL).

- [ ] inventory management with barcode scanning → `/features/barcode-scanning` (Title/H1 or H2 depending on canonical decision)
- [ ] barcode and inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode inventory tracking software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode inventory control software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory management software with barcode scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode stock management software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode stock software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] stock barcode scanner → `/features/barcode-scanning` (FAQ: scanner compatibility)
- [ ] barcode scanner inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode scanner and software for inventory → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory scanners and software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory control software barcode → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory management software with barcode → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory software with barcode → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode stock control software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcoding software for inventory → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode scanning inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] best inventory management software with barcode scanner → `/features/barcode-scanning` (FAQ + comparison snippet)
- [ ] scanner inventory software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory management with scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory scanner software → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory management software with scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] inventory software with scanner → `/features/barcode-scanning` (H2/FAQ/body)
- [ ] barcode inventory management system for small business → `/solutions/small-business` (H2/FAQ) + `/features/barcode-scanning` (FAQ)

- [ ] warehouse inventory tracking → `/solutions/warehouse-inventory` (Title/H1)
- [ ] warehouse management system for small business → `/solutions/warehouse-inventory` (H2/FAQ: “WMS vs simple tracking”)
- [ ] warehouse inventory management software with barcode scanner → `/solutions/warehouse-inventory` (H2/FAQ/body)
- [ ] free warehouse inventory software → `/pricing/free-inventory-software` (Title/H1) + `/solutions/warehouse-inventory` (FAQ)

- [ ] ecommerce stock management → `/solutions/ecommerce-inventory` (H2/Body)
- [ ] best inventory management software for ecommerce → `/solutions/ecommerce-inventory` (Title/H1 or H2)
- [ ] best ecommerce inventory management → `/solutions/ecommerce-inventory` (H2/FAQ)
- [ ] best inventory software for ecommerce → `/solutions/ecommerce-inventory` (FAQ)
- [ ] inventory management platforms for ecommerce 2025 → `/blog/inventory-management-platforms-for-ecommerce-2025` (new guide)

- [ ] simple inventory software for small business → `/solutions/small-business` (Title/H1)

- [ ] inventory tracking app android → `/solutions/mobile-inventory-app` (Title/H1)
- [ ] stock management app android → `/solutions/mobile-inventory-app` (H2/FAQ/body)

- [ ] inventory management software demo → `/demo` (Title/H1 or H2)
- [ ] inventory management system demo → `/demo` (H2/FAQ/body)
- [ ] inventory management demo → `/demo` (H2/FAQ/body)
- [ ] stock management software demo → `/demo` (H2/FAQ/body)

- [ ] perpetual inventory vs periodic inventory → `/blog/perpetual-vs-periodic-inventory` (Title/H1)
- [ ] inventory perpetual vs periodic → `/blog/perpetual-vs-periodic-inventory` (H2/FAQ/body)
- [ ] periodic inventory vs perpetual inventory → `/blog/perpetual-vs-periodic-inventory` (H2/FAQ/body)
- [ ] what is the difference between periodic and perpetual inventory systems → `/blog/perpetual-vs-periodic-inventory` (FAQ question)

- [ ] best construction inventory management software → `/solutions/construction-tools` (Title/H1) + `/features/check-in-check-out` (supporting internal link)

- [ ] real time inventory management software → `/` (H2/Body) + consider `/features/real-time-inventory` (only if SERP demands a dedicated page)

- [ ] inventory mangement system inventory mangement software → **ignore** (misspelling; don’t target intentionally)

---

## 2) Page backlog (build/refine) — all in checklist form
Rule: every page must follow `docs/MarketingTodo.md` (FlyonUI MCP template, deep content, metadata, schema, internal links, validation loop).

### P0 — Refine core conversion pages (ship first)
- [ ] **`/` (Home)** — broad product positioning + routes users to the right solution/feature
  - [ ] Primary keyword (choose one and stick to it): `inventory management with barcode scanning` **or** `real time inventory management software`
  - [ ] Secondary variants (H2/FAQ/body only): `barcode inventory control software`, `simple inventory tracking`, `offline inventory app`, `inventory check in check out`
  - [ ] Title tag (≤60 chars) written for CTR
  - [ ] Meta description (≤155 chars) written for CTR
  - [ ] H1 + subhead match the 3 core promises (speed, accuracy, simplicity)
  - [ ] Hero CTAs: trial + demo (with trust bar: “No credit card • Cancel anytime • Import CSV/Sortly”)
  - [ ] Section checklist (keep this order)
    - [ ] Pain → promise (3 bullets)
    - [ ] Feature highlights (scan, check‑in/out, low‑stock alerts, bulk edit)
    - [ ] Social proof (logos/testimonials) — if no proof yet, include specific TODO placeholders
    - [ ] Use-case tiles (Warehouse / Ecommerce / Construction / Small business)
    - [ ] “Why different than Sortly” teaser + link to `/compare/sortly-alternative` + `/migration/sortly`
    - [ ] FAQ (5–10) + FAQ schema
    - [ ] Final CTA
  - [ ] Internal links: `/pricing`, `/demo`, `/features/barcode-scanning`, `/solutions/warehouse-inventory`, `/blog/perpetual-vs-periodic-inventory`
  - [ ] Schema: Organization + WebSite + SoftwareApplication/Product + FAQPage
  - [ ] Proof asset TODOs are explicit (what to record, what screenshot to capture)

- [ ] **`/pricing`** — remove price anxiety + highlight “trust-first pricing”
  - [ ] Primary keyword: `simple inventory software for small business`
  - [ ] Secondary variants: `inventory management with barcode scanning` (supporting), `inventory software pricing`, `inventory app pricing`
  - [ ] Plan cards include transparent scaling (avoid “SKU cliffs”)
  - [ ] “Price-lock” / risk reversal block (cancel anytime, export anytime)
  - [ ] Feature comparison table includes: barcode scan, offline, check‑in/out, audit, multi‑location, roles
  - [ ] FAQ (pricing edge cases) + FAQ schema
  - [ ] Internal links: `/demo`, `/features/barcode-scanning`, `/compare/sortly-alternative`

- [ ] **`/demo`** — capture demo intent and convert
  - [ ] Primary keyword: `inventory management demo` (keep demo cluster here)
  - [ ] Secondary variants (H2/FAQ/body): `inventory management software demo`, `inventory management system demo`, `stock management software demo`
  - [ ] Above-the-fold: 90s overview video (or specific placeholder) + lead form
  - [ ] “What you’ll see” checklist (scan/stock count/check‑out workflow)
  - [ ] 3 workflow clips (10–30s each) + VideoObject schema when real
  - [ ] Who it’s for: owner / ops / field / ecommerce (links to solutions)
  - [ ] Internal links: `/pricing`, `/features/barcode-scanning`, `/solutions/*`

### P1 — Build pages that directly cover SEMrush “Missing” keywords
- [ ] **`/features/barcode-scanning`** — canonical for barcode + scanner cluster
  - [ ] Primary keyword (Title/H1): `inventory management with barcode scanning` (or `barcode scanning inventory software`)
  - [ ] Secondary keywords (H2/FAQ/body): `barcode inventory tracking software`, `barcode inventory control software`, `barcode stock management software`, `barcode scanner inventory software`, `inventory control software barcode`, `barcoding software for inventory`
  - [ ] Competitor SERP references (format cues):
    - [ ] Sortly: `https://www.sortly.com/barcode-inventory-system/` (landing)
    - [ ] inFlow: `https://www.inflowinventory.com/features/barcode-software` (feature page) + `.../blog/inventory-barcode-system/` (guide)
  - [ ] Section checklist
    - [ ] Outcome-first hero + “Works offline” + CTA
    - [ ] How it works (3 steps: scan → confirm → done)
    - [ ] Supported hardware (camera, Bluetooth scanners, rugged devices) — list what you support; don’t guess
    - [ ] Real workflows (receiving, counting, transfers, check‑in/out)
    - [ ] Proof section (screens/clips; or explicit TODOs)
    - [ ] FAQ (5–10) with exact-match phrasing + FAQ schema
    - [ ] Final CTA
  - [ ] Internal links: `/pricing`, `/demo`, `/solutions/warehouse-inventory`, `/solutions/ecommerce-inventory`, `/compare/sortly-alternative`

- [ ] **`/solutions/warehouse-inventory`** — canonical for warehouse inventory tracking
  - [ ] Primary keyword (Title/H1): `warehouse inventory tracking`
  - [ ] Secondary variants (H2/FAQ/body): `warehouse management system for small business`, `warehouse inventory management software with barcode scanner`, `free warehouse inventory software` (FAQ → point to pricing page)
  - [ ] Competitor format cues:
    - [ ] Sortly industry page: `https://www.sortly.com/industries/warehouse-inventory-management-software/`
    - [ ] BoxHero solution page: `https://www.boxhero.io/en/solutions/warehouse-management`
  - [ ] Section checklist
    - [ ] “Typical day” narrative (receiving → putaway → pick/pack → count)
    - [ ] 3 biggest pains + how we solve
    - [ ] Relevant features only (scan, multi-location, audit, low-stock, roles)
    - [ ] Setup steps (import → label → scan)
    - [ ] Proof section (counts, audit trail, speed)
    - [ ] FAQ + schema
  - [ ] Internal links: `/features/barcode-scanning`, `/pricing/free-inventory-software`, `/demo`

- [ ] **`/solutions/ecommerce-inventory`** — canonical for ecommerce inventory management
  - [ ] Primary keyword (Title/H1): `ecommerce inventory management`
  - [ ] Secondary variants: `ecommerce stock management`, `best inventory management software for ecommerce`, `best ecommerce inventory management`, `best inventory software for ecommerce`
  - [ ] Competitor format cues:
    - [ ] Fishbowl guide: `https://www.fishbowlinventory.com/blog/e-commerce-inventory-management-techniques-and-software`
    - [ ] BoxHero guide: `https://www.boxhero.io/en/blog/best-e-commerce-inventory-management-software`
  - [ ] Section checklist
    - [ ] Multi-channel + multi-location “stock truth” narrative (even if “integrations” are manual today — be explicit)
    - [ ] Prevent oversells + stockouts (alerts, reorder points)
    - [ ] Import/migration section (CSV mapping)
    - [ ] Proof section (examples of stock accuracy)
    - [ ] FAQ (Shopify/Woo/etc) — only if supported
  - [ ] Internal links: `/integrations` (if real), `/features/barcode-scanning`, `/pricing`, `/demo`

- [ ] **`/solutions/mobile-inventory-app`** — canonical for Android mobile intent
  - [ ] Primary keyword (Title/H1): `inventory tracking app android`
  - [ ] Secondary variants: `stock management app android`
  - [ ] Section checklist
    - [ ] Offline mode (if real) + sync behavior explained plainly
    - [ ] Mobile workflows (scan, adjust, count, lookup)
    - [ ] Device/scanner compatibility section
    - [ ] Proof (short clip or TODO)
    - [ ] FAQ + schema
  - [ ] Internal links: `/features/barcode-scanning`, `/solutions/warehouse-inventory`, `/pricing`, `/demo`

- [ ] **`/solutions/small-business`** — canonical for “simple inventory software” intent
  - [ ] Primary keyword (Title/H1): `simple inventory software for small business`
  - [ ] Secondary variants (H2/FAQ/body): `simple inventory tracking`, `barcode inventory management system for small business`
  - [ ] Section checklist
    - [ ] “Replace spreadsheets in a day” onboarding narrative (only if true)
    - [ ] Team-friendly UI + minimal setup
    - [ ] Bulk edit/import section (guardrails, preview diffs)
    - [ ] Proof + FAQ + schema
  - [ ] Internal links: `/pricing`, `/demo`, `/migration/sortly`, `/features/barcode-scanning`

- [ ] **`/pricing/free-inventory-software`** — canonical for “free” warehouse intent
  - [ ] Primary keyword (Title/H1): `free warehouse inventory software`
  - [ ] Secondary variants: `free inventory software`, `free warehouse stock management software` (if you plan to target it)
  - [ ] Section checklist
    - [ ] Define “free” clearly (limits, what’s included, what’s not)
    - [ ] Comparison vs spreadsheets (credibility)
    - [ ] Upgrade path (when teams outgrow free)
    - [ ] FAQ + schema
  - [ ] Internal links: `/pricing`, `/demo`, `/solutions/warehouse-inventory`

- [ ] **`/blog/perpetual-vs-periodic-inventory`** — canonical for education + authority
  - [ ] Primary keyword (Title/H1): `perpetual inventory vs periodic inventory`
  - [ ] Secondary variants: `inventory perpetual vs periodic`, `periodic inventory vs perpetual inventory`, `what is the difference between periodic and perpetual inventory systems`
  - [ ] Section checklist
    - [ ] Definitions (plain language)
    - [ ] Side-by-side table (pros/cons, best for who)
    - [ ] Examples (small business + warehouse)
    - [ ] “Which one should you use?” decision flow
    - [ ] FAQ + schema
  - [ ] Internal links: `/features/barcode-scanning`, `/solutions/warehouse-inventory`, `/pricing`, `/demo`

- [ ] **`/solutions/construction-tools`** — competitive match vs Sortly/Fishbowl construction pages
  - [ ] Primary keyword (Title/H1): `best construction inventory management software`
  - [ ] Secondary variants: `tool tracking`, `equipment tracking`, `jobsite inventory tracking` (validate in SEMrush)
  - [ ] Competitor format cues:
    - [ ] Sortly industry page: `https://www.sortly.com/industries/construction-inventory-management-software/`
    - [ ] Fishbowl industry page: `https://www.fishbowlinventory.com/industries/construction-and-trades`
  - [ ] Section checklist
    - [ ] Check‑in/check‑out workflow as the hero narrative
    - [ ] Offline scanning + accountability (who has what)
    - [ ] Proof assets (issue/return clip; overdue list screenshot)
    - [ ] FAQ + schema
  - [ ] Internal links: `/features/check-in-check-out`, `/pricing`, `/demo`

### P2 — Add pages competitors use to win (validate keywords in SEMrush before building)
- [ ] **`/blog/inventory-management-platforms-for-ecommerce-2025`** (new) — listicle/guide SERP
  - [ ] Primary keyword: `inventory management platforms for ecommerce 2025`
  - [ ] Section checklist
    - [ ] “How to choose” criteria (must include barcode, multi-location, integrations, audit)
    - [ ] Comparison table (include your product as one option; be factual)
    - [ ] FAQ
  - [ ] Internal links: `/solutions/ecommerce-inventory`, `/pricing`, `/demo`

- [ ] **`/solutions/asset-tracking`** (new) — match Sortly’s asset tracking strength
  - [ ] Keyword validation in SEMrush completed (asset tracking terms)
  - [ ] Section checklist: definition → workflows → check-in/out → proof → FAQ
  - [ ] Internal links: `/features/check-in-check-out`, `/compare/sortly-alternative`, `/migration/sortly`

- [ ] **`/glossary` hub + 2 starter terms** (new) — match Sortly’s glossary footprint
  - [ ] `/glossary/inventory-turnover` (validate keyword + write definition + link to guide/tool)
  - [ ] `/glossary/economic-order-quantity` (EOQ) (validate keyword + link to calculator/guide)

### P3 — Linkable assets (helps backlinks + TOFU like inFlow)
- [ ] **`/templates/inventory-spreadsheet`** (new)
  - [ ] Includes downloadable template + preview
  - [ ] “How to use” + “How to import into {Product}” section
  - [ ] Internal links: `/features/barcode-scanning`, `/pricing`, `/demo`

- [ ] **`/templates/cycle-count-sheet`** (new)
  - [ ] Includes schedule template (weekly/monthly; ABC/velocity)
  - [ ] Explains cycle count workflow + common mistakes
  - [ ] Internal links: `/solutions/warehouse-inventory`, `/demo`

- [ ] **`/tools/reorder-point-calculator`** (new)
  - [ ] Inputs: lead time, demand, safety stock; outputs: reorder point + min/max suggestion
  - [ ] Example calculation + downloadable result
  - [ ] Internal links: `/blog/how-to-set-reorder-points`, `/solutions/ecommerce-inventory`, `/pricing`

---

## 3) Competitive backlink distribution checklist (based on competitor backlink matrices)
Note: backlink matrices currently use a **placeholder domain** (not your real site), so treat this as “where competitors get links”, not a true “gap vs us”.

- [ ] Create/claim product listings (fast wins)
  - [ ] G2 (`g2.com`)
  - [ ] TrustRadius (`trustradius.com`)
  - [ ] Capterra (`capterra.com`) *(if applicable/available)*
  - [ ] AlternativeTo (`alternativeto.net`)
  - [ ] GoodFirms (`goodfirms.co`)
  - [ ] SaaSWorthy (`saasworthy.com`)
  - [ ] Product Hunt (`producthunt.com`)
  - [ ] StackShare (`stackshare.io`)

- [ ] Prepare listing assets (reusable kit)
  - [ ] 1‑sentence positioning
  - [ ] 5 differentiator bullets (anti‑Sortly levers)
  - [ ] Pricing link + demo link
  - [ ] Logo + 6 screenshots + 1 short video
  - [ ] 2–3 customer quotes (even short)
