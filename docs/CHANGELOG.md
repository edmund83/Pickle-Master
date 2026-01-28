# Changelog

All notable changes to StockZip are documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Fixed

#### Stripe Webhook 307 Redirect Issue
Fixed billing plan changes (upgrade/downgrade) not updating the database because Stripe webhooks were being redirected by the auth middleware.

**Root Cause**:
- The `proxy.ts` middleware was checking auth on all routes including `/api/*`
- Stripe webhook POST requests have no auth cookies
- Middleware returned 307 redirect to `/login` instead of letting webhooks through

**Solution**:
- Added early return in `proxy.ts` to skip auth checks for `/api/` routes
- Webhooks now return 200 and correctly update tenant subscription data

**Files Modified**:
- `proxy.ts` - Skip auth middleware for API routes

### Added

#### Authenticated User Landing Page Redirect
Added redirect logic to automatically redirect signed-in users from the landing page to the dashboard.

**Features**:
- Proxy checks auth status before page renders (no flash of landing page content)
- Uses `getUser()` for secure session validation with Supabase server
- Only redirects from the landing page (`/`), other marketing pages remain accessible

**Files Modified**:
- `proxy.ts` - Added redirect for authenticated users on landing page

#### AI Request Timeouts
Added timeout protection to all AI API calls to prevent runaway costs and improve reliability.

**Features**:
- 30-second timeout for chat requests (Gemini and OpenRouter)
- 15-second timeout for quick operations (insights, label scanning, summaries)
- Graceful error messages when timeouts occur
- AbortController-based cancellation for fetch requests

**Files Added**:
- `lib/ai/timeout.ts` - Timeout utilities (`withTimeout`, `fetchWithTimeout`, `AiTimeoutError`)

**Files Modified**:
- `lib/ai/gemini.ts` - Added timeouts to all Gemini SDK calls
- `lib/ai/openrouter.ts` - Added timeouts to all OpenRouter fetch calls

**Why This Matters**:
- Prevents serverless functions from running indefinitely when AI providers hang
- Protects against unexpected cost accumulation
- Improves UX with clear timeout messages instead of infinite loading

#### Scanner Diagnostics & Engine Status
Added comprehensive diagnostics to identify barcode scanning issues and improved user feedback.

**New Features**:
- **Engine Status UI**: Shows warning banner when using jsQR engine (QR codes only)
- **Console Logging**: Detailed logs for engine selection, frame capture, and detection activity
- **Video Stream Diagnostics**: Logs camera resolution, frame rate, and video dimensions

**UI Changes**:
- Added amber warning banner when scanner falls back to jsQR (QR codes only mode)
- Updated footer text to show "Point camera at a QR code" when 1D barcodes not supported
- Added `engineName` and `supports1DBarcodes` to scanner hook interface

**Files Modified**:
- `lib/scanner/useBarcodeScanner.ts` - Added engine name state, frame capture diagnostics
- `lib/scanner/engines/index.ts` - Enhanced logging for engine selection
- `lib/scanner/utils/camera-manager.ts` - Added video stream and capture diagnostics
- `components/scanner/BarcodeScanner.tsx` - Added engine status warning banner

#### Barcode Check Digit Validation
Added check digit validation for scanned barcodes to catch scanning errors before they enter the database.

**Supported Formats**:
- UPC-A (12 digits) - Modulo 10 check digit
- UPC-E (8 digits) - Expanded to UPC-A for validation
- EAN-13 (13 digits) - Modulo 10 check digit
- EAN-8 (8 digits) - Modulo 10 check digit
- ISBN-10 (10 characters) - Modulo 11 check digit
- ISBN-13 (13 digits) - Uses EAN-13 validation

**Features**:
- Validates barcodes immediately after scanning
- Shows warning banner when check digit is invalid
- Auto-detects format for hardware scanners
- Allows proceeding despite warning (barcode may be valid but non-standard)

**Files Added**:
- `lib/scanner/utils/checkdigit-validator.ts` - Validation functions for all supported formats

**Files Modified**:
- `lib/scanner/index.ts` - Exported validation functions
- `app/(dashboard)/scan/page.tsx` - Integrated validation into scan flow
- `components/scanner/ScanResultModal.tsx` - Added validation warning UI

#### Admin Email Notifications
Added email notifications to admin for new user signups and bug report submissions.

**New Features**:
- **Signup Notifications**: Receive email when a new user registers (includes name, email, company, plan)
- **Bug Report Notifications**: Receive email when a user submits a bug report (includes category, subject, description, page URL)

**Files Added**:
- `app/api/webhooks/supabase-auth/route.ts` - Webhook endpoint for Supabase Auth events

**Files Modified**:
- `app/actions/email.ts` - Added `sendAdminNewUserNotification()` and `sendAdminBugReportNotification()` functions
- `app/actions/bug-reports.ts` - Integrated admin notification on bug report submission
- `.env.example` - Added SMTP and admin notification variables

**Setup Required**:
1. Add to `.env.local`:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Your SMTP server credentials
   - `ADMIN_EMAIL` - Your email for receiving notifications
   - `SUPABASE_AUTH_WEBHOOK_SECRET` - Random secret for webhook verification
2. Configure Supabase Database Webhook:
   - Go to Supabase Dashboard → Database → Webhooks
   - Create webhook on `auth.users` table for `INSERT` events
   - URL: `https://your-domain.com/api/webhooks/supabase-auth`
   - Add the same secret as `SUPABASE_AUTH_WEBHOOK_SECRET`

#### Migrated Email from Resend to SMTP
Switched email sending from Resend API to standard SMTP for more flexibility.

**Files Modified**:
- `lib/resend.ts` - Replaced Resend with nodemailer SMTP transport (maintains backwards-compatible interface)
- `app/actions/email.ts` - Updated to use SMTP configuration
- `app/api/labels/email/route.ts` - Updated to use SMTP configuration
- `.env.example` - Replaced `RESEND_API_KEY` with SMTP variables

**Dependencies Changed**:
- Added: `nodemailer`, `@types/nodemailer`

### Changed

#### Barcode Scanner "Holy Grail" PWA Polyfill Architecture
Replaced slow `html5-qrcode` library with a 3-layer progressive polyfill strategy for dramatically faster barcode scanning, especially on mobile devices.

**New Architecture**:
- **Layer 1: Native BarcodeDetector API** (Android Chrome, iOS 17+, Edge) - Hardware accelerated using ML Kit/Vision framework, Speed: 10/10
- **Layer 2: ZBar-WASM** (older iOS, Firefox, fallback) - Fast C library compiled to WebAssembly, excellent for 1D barcodes, Speed: 8/10
- **Layer 3: jsQR** (QR-specific fallback) - Pure JavaScript QR detector, Speed: 7/10

**Performance Improvements**:
| Metric | Before | After |
|--------|--------|-------|
| FPS | 10 | 30 |
| Scan box | Fixed 250×250px | Responsive 70% of container |
| 1D barcode speed | Slow (ZXing-based) | Fast (ZBar/Native) |
| Angle tolerance | Poor | Better (3× more frames analyzed) |
| Bundle size | ~150KB | ~60KB (lazy loaded WASM) |

**Files Added**:
- `lib/scanner/engines/types.ts` - Unified ScannerEngine interface
- `lib/scanner/engines/native-detector.ts` - Native BarcodeDetector wrapper
- `lib/scanner/engines/zbar-engine.ts` - ZBar-WASM engine with dynamic import
- `lib/scanner/engines/jsqr-engine.ts` - jsQR fallback engine
- `lib/scanner/engines/index.ts` - Engine factory with auto-detection
- `lib/scanner/utils/camera-manager.ts` - Unified camera stream handling
- `lib/scanner/utils/format-normalizer.ts` - Normalize format names across engines

**Files Modified**:
- `lib/scanner/useBarcodeScanner.ts` - Refactored to use engine factory (interface unchanged)
- `components/scanner/BarcodeScanner.tsx` - Responsive scan box with ResizeObserver
- `lib/scanner/index.ts` - Updated exports

**Dependencies Changed**:
- Removed: `html5-qrcode`
- Added: `@undecaf/zbar-wasm`, `jsqr`

**Backwards Compatibility**: The `ScanResult` interface and `useBarcodeScanner` hook signature remain unchanged. All 6 task pages using the scanner work without modification.

---

### Added

#### Sentry Error Tracking Integration
Integrated `@sentry/nextjs` for production error monitoring and reporting.

**Features**:
- Client-side error capture with session replay (10% sampling, 100% on error)
- Server-side error capture for API routes and server actions
- Edge runtime support
- Source map upload for better stack traces
- Tunnel route `/monitoring` to bypass ad-blockers

**Files Added**:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

**Files Modified**:
- `next.config.ts` - Added `withSentryConfig` wrapper
- `.env.example` - Added Sentry environment variables
- `app/error.tsx` - Added `Sentry.captureException()`
- `app/global-error.tsx` - Added `Sentry.captureException()`

---

#### Production Readiness Audit Completed
Comprehensive production readiness audit based on `docs/productioncheck_updated.md`.

**Audit Coverage**:
- Phase 1: Scope, risks, test data definitions
- Phase 2: Smoke + stability tests
- Phase 4: Workflow testing (CRUD, uploads, data integrity)
- Phase 5: Auth, RLS, security (OWASP basics)
- Phase 6: PWA checklist
- Phase 7: Non-functional (performance, a11y, responsiveness)
- Phase 8: Regression pack + release gate
- Phase 9: Scale readiness (rate limiting, indexing, pagination)

**Results**:
- All 1429 tests passing
- Build succeeds
- 148 pages verified
- Security checks pass (RLS, tenant isolation, input validation)
- 432 accessibility patterns verified
- 1657 responsive design patterns verified

**Evidence Location**: `/docs/audit/`

---

#### Alphanumeric Display ID Format
Updated display ID format to include alphanumeric prefix for increased capacity and better visual progression.

**New Format**: `{PREFIX}-{ORGCODE}-{LETTER(S)}{5-digit}`

**Examples**:
- `SO-ACM01-A00001` → `SO-ACM01-A99999` (first 99,999 entries)
- `SO-ACM01-B00001` → `SO-ACM01-B99999` (next 99,999 entries)
- `SO-ACM01-Z99999` → `SO-ACM01-AA00001` (after 2.6M entries, extends to double letter)

**Capacity**: ~70 million documents per entity type per tenant (A-Z + AA-ZZ)

**Capacity Alerts**:
- Automatic notification when reaching Y territory (92% of single-letter capacity)
- Second alert at Z territory (96% - last single letter)
- Final alert when transitioning to double-letter (AA+)
- Admin RPC `get_display_id_capacity()` to check status of all entity types

**Migration**:
- Existing display IDs automatically backfilled with 'A' prefix (e.g., `SO-ACM01-00001` → `SO-ACM01-A00001`)
- All entity types updated: Items, Folders, Pick Lists, Purchase Orders, Receives, Sales Orders, Delivery Orders, Invoices, Credit Notes, Customers

**Files Added**:
- `supabase/migrations/00102_alphanumeric_display_id.sql`

---

#### Credit Notes Support
Added simple credit note functionality for mom and pop businesses. Credit notes are implemented as a type of invoice (not a separate entity) for simplicity.

**Features**:
- Credit notes have their own display ID prefix: `CN-ACM01-A00001`
- Create credit notes from any sent/paid/partial invoice via "Create Credit Note" in the More menu
- Specify credit reason (Return, Damaged, Overcharge, Discount, Other)
- Add items to credit notes with negative amounts
- Apply credit notes to reduce original invoice balance
- Filter invoice list by type (Invoices / Credit Notes / All)
- Visual distinction: Credit notes show red badge and icon in list and detail views

**Database Changes**:
- Added `invoice_type` column to invoices table (`invoice` or `credit_note`)
- Added `original_invoice_id` to link credit notes to original invoices
- Added `credit_reason` column for tracking why credit was issued
- Added `credit_note` entity type to `generate_display_id` function

**Files Added**:
- `supabase/migrations/00100_credit_notes.sql` - Migration with columns, indexes, and RPC functions

**Files Modified**:
- `app/actions/invoices.ts` - Added credit note actions and updated types
- `app/(dashboard)/tasks/invoices/InvoicesListClient.tsx` - Added type filter and credit note badge
- `app/(dashboard)/tasks/invoices/page.tsx` - Added type filter parameter
- `app/(dashboard)/tasks/invoices/[id]/page.tsx` - Updated interface with credit note fields
- `app/(dashboard)/tasks/invoices/[id]/InvoiceDetailClient.tsx` - Added create/apply credit note UI

#### Standalone Receives / Stock Returns
Enable creating Receives without a Purchase Order - for customer returns, stock adjustments, and ad-hoc inventory additions.

**Source Types**:
- `customer_return` - Returned goods from customers (requires return reason)
- `stock_adjustment` - Manual stock additions not tied to a PO

**Return Reasons** (for customer returns):
- Defective
- Wrong Item
- Changed Mind
- Damaged in Transit
- Other

**Database Changes** (Migrations: `00098_standalone_receives.sql`, `00099_extend_standalone_receive.sql`):
- Added `source_type` column to `receives` table (purchase_order, customer_return, stock_adjustment)
- Made `purchase_order_id` nullable (previously required)
- Added `return_reason` column to `receive_items` table
- Added `delivery_note_number`, `carrier`, `tracking_number` fields for shipment tracking
- New RPC functions:
  - `create_standalone_receive()` - Create a new standalone receive with delivery details
  - `add_standalone_receive_item()` - Add items with optional return reason
  - `get_standalone_receives()` - Query standalone receives with source type and status filtering

**Server Actions** (`app/actions/receives.ts`):
- Updated to support standalone receive creation
- Added return reason handling for customer returns
- Integrated with existing complete_receive flow (stock updates work the same)

**UI Changes**:
- "New Receive" option without requiring a PO
- Source type selector (Customer Return / Stock Adjustment)
- Return reason dropdown for customer returns
- Additional fields: delivery note number, carrier, tracking number

**Workflow**:
- PO-linked: Purchase Order → Receive (unchanged)
- Standalone: Receives → New → Select Type → Add Items → Complete

#### Region Change Confirmation Dialog
Added a safety confirmation dialog when changing business region to prevent accidental data inconsistency.

**Problem Solved**: If a tenant accidentally changes their region (e.g., US → Malaysia) after having live data, prices would display with the wrong currency symbol without any conversion, causing confusion in reports and documents.

**Features**:
- Shows confirmation dialog before region change takes effect
- Fetches and displays counts of affected data (items with prices, invoices, sales orders, tax rates)
- Warns about currency symbol change and that values won't be converted
- Uses destructive button variant when existing data is at risk
- Allows cancellation to revert to previous region

**Files Added**:
- `components/settings/region-change-dialog.tsx` - Confirmation dialog component

**Files Modified**:
- `app/actions/tenant-settings.ts` - Added `getTenantDataCounts()` server action
- `app/(dashboard)/settings/company/page.tsx` - Integrated confirmation dialog
- `components/settings/index.ts` - Exported new component

### Changed

#### Simplified Regional Settings UI for Small Business Users
Reduced the Regional Settings form from 6 dropdowns to a single "Business Location" dropdown with auto-inference. This improves user-friendliness for mom and pop small business users who don't want to make 6 separate decisions.

**Before**: 6 dropdowns (Country, Timezone, Date Format, Time Format, Currency, Decimals)
**After**: 1 dropdown (Business Location) + preview card + optional "Customize formatting" section

**Features**:
- Auto-detects country from browser timezone on first load
- Auto-infers currency, timezone, date format, and time format from country selection
- Shows a preview card with inferred settings for transparency
- Collapsible "Customize formatting" section for power users who need to override defaults
- "Reset to country defaults" button to undo customizations
- Preserves existing custom settings for tenants who already customized

**Files Modified**:
- `lib/i18n/resolver.ts` - Added `COUNTRY_TO_PRIMARY_TIMEZONE` mapping and `getSettingsFromCountry()` function
- `app/(dashboard)/settings/company/page.tsx` - Refactored Regional Settings UI with simplified design

### Added

#### Internationalization (i18n) System Overhaul
Implemented industry-standard i18n following best practices from Stripe, Shopify, and Notion with three-tier locale resolution (User > Tenant > Browser > Default).

**New i18n Library (`lib/i18n/`)**:
- `types.ts` - BCP 47 locale types, IANA timezone support, ISO 4217 currency codes
- `resolver.ts` - Three-tier preference resolution with validation functions
- `formatters.ts` - Cached Intl-based formatters for optimal performance
- `index.ts` - Barrel export for clean imports

**Features**:
- Country-to-locale mapping (40+ countries)
- Country-to-currency mapping
- Timezone-to-country detection for onboarding
- Locale-aware date/time formatting with configurable formats
- Locale-aware currency formatting (proper symbol placement and separators)
- Locale-aware number formatting (thousands separators, decimal places)
- Relative time formatting using `Intl.RelativeTimeFormat`
- ISO format helpers for data exchange

**Database Migrations**:
- `00096_user_locale_preferences.sql` - User-level locale overrides (highest priority)
- `00097_tenant_locale_enhancement.sql` - Enhanced tenant settings validation and locale backfill

**Files**:
- `lib/i18n/types.ts` - Core types and mappings
- `lib/i18n/resolver.ts` - Locale resolution logic
- `lib/i18n/formatters.ts` - Intl-based formatters with caching
- `lib/i18n/index.ts` - Barrel export
- `contexts/LocaleContext.tsx` - React context for locale settings
- `hooks/useFormatting.ts` - Updated to use new i18n system

### Fixed

#### Hardcoded Currency in Invoice Components
Removed hardcoded USD currency formatting in invoice components, now using tenant settings.

**Files Fixed**:
- `app/(dashboard)/tasks/invoices/InvoicesListClient.tsx`
- `app/(dashboard)/tasks/invoices/[id]/InvoiceDetailClient.tsx`

#### Stock Movement Report Date Formatting
Replaced `toLocaleString()` with locale-aware `formatDateTime()` for proper timezone and format handling.

**Files Fixed**:
- `app/(dashboard)/reports/stock-movement/page.tsx`

#### Chatter Timestamps
Replaced `date-fns` `formatDistanceToNow` with locale-aware `formatRelativeTime` for proper localization.

**Files Fixed**:
- `components/chatter/MessageItem.tsx`

---

#### Report a Problem Feature
Added a "Report a Problem" button on the Help page that allows users to submit bug reports and feedback directly from within the app.

**Features**:
- Dialog form with category selection (Bug, Feature Request, Performance, UI/UX, Data, Other)
- Subject and description fields with validation
- Auto-captures current page URL and browser info for context
- Submissions stored in `bug_reports` table with RLS policies

**Files**:
- `supabase/migrations/00096_bug_reports.sql` - Database table and RLS policies
- `app/actions/bug-reports.ts` - Server action for submitting reports
- `components/help/ReportProblemDialog.tsx` - Dialog component
- `app/(dashboard)/help/page.tsx` - Added button to support section

### Fixed

#### Pricing Page Alignment with Current Pricing Plan
Updated the pricing page and PricingSection component to accurately reflect the features in docs/pricingplan.md.

**Issues Fixed**:
1. **Check-in/check-out feature** - Comparison table now correctly shows this feature is available in ALL plans including Starter (was showing "—" for Starter)
2. **AskZoe AI for Starter** - Fixed FAQ and comparison table to show Starter gets 50 questions/month (was incorrectly stated as "trial only")
3. **Growth plan features** - Updated feature list to emphasize Sales Orders & Invoices as key differentiators (was showing Check-in/check-out which is in all plans)
4. **Starter plan features** - Added Pick lists & check-in/out to feature list (these are included per pricing doc)

**New Features Added to Comparison Table**:
- Sales orders & invoices row (Growth and Scale only)
- Stock counts & cycle counting row (Growth and Scale only)
- Renamed "Check-in / check-out" row to "Pick lists & check-in/out" for clarity

**Files Updated**:
- `app/(marketing)/pricing/page.tsx` - Fixed comparison table, feature cards, and FAQ
- `components/marketing/PricingSection.tsx` - Updated Starter and Growth feature lists

#### Pricing Plan Sync Issues
Fixed critical bugs where pricing plans were not properly synchronized between Stripe, database, and frontend.

**Issues Fixed**:
1. **Webhook didn't sync limits** - When users upgraded/downgraded via Stripe, `max_users`/`max_items` were not updated
2. **Plan name mismatch** - Database trigger used `team`/`business` but Stripe uses `growth`/`scale`
3. **Wrong limits on signup** - All plans got 10,000 items instead of 1,200/3,000/8,000
4. **Price typo** - PricingComparisonTable showed Scale at $79 instead of $89

**Changes**:
- Created `lib/plans/config.ts` - Single source of truth for plan definitions
- Added `get_plan_limits()` and `update_tenant_limits()` database functions
- Updated `handle_new_user()` trigger to recognize `early_access`, `starter`, `growth`, `scale`
- Stripe webhook now syncs `max_users`, `max_items`, `max_folders` on plan changes
- Data migration to fix existing tenants with incorrect limits

**Files**:
- `lib/plans/config.ts` (new)
- `supabase/migrations/00093_sync_pricing_plans.sql` (new)
- `supabase/migrations/00094_fix_existing_tenant_limits.sql` (new)
- `app/api/stripe/webhook/route.ts`
- `lib/subscription/status.ts`
- `components/marketing/PricingComparisonTable.tsx`

#### Pick List Creation from Sales Order
Fixed bug where clicking "Start Picking" on a confirmed Sales Order failed with constraint violation.

**Root Cause**: The RPC function `generate_pick_list_from_sales_order` was using `'pending'` status, but the `pick_lists` table has a CHECK constraint (`chk_pick_list_status`) that only allows: `'draft'`, `'in_progress'`, `'completed'`, `'cancelled'`.

**Fix** (Migration: `00084_fix_pick_list_status_from_so.sql`):
- Changed pick list status from `'pending'` to `'draft'`
- Fixed activity_logs insert to use correct column names (`action_type` instead of `action`, `changes` instead of `details`)

#### Invoice Add Line Item UI
Fixed missing UI for adding line items to invoices - previously showed "No items on this invoice" with no way to add items.

**Changes** (`app/(dashboard)/tasks/invoices/[id]/InvoiceDetailClient.tsx`):
- Added search input with debounced item lookup
- Added barcode scanner integration (Scan button)
- Added search results dropdown with item selection
- Items can now be searched by name or SKU and added to invoices

**Server Action** (`app/actions/invoices.ts`):
- Added `searchInventoryItemsForInvoice()` function for item search

### Changed

#### Pricing Plans - Removed Location Caps
Removed location and folder cap limits from all pricing plans. Plans now differentiate by items, users, and features only.

**Files Updated**:
- `docs/pricingplan.md` - Removed Locations column from plan summary and features table
- `components/marketing/PricingSection.tsx` - Removed Locations row from Early Access card, replaced Growth feature
- `components/marketing/PricingComparisonTable.tsx` - Removed Locations row from feature comparison
- `app/(marketing)/pricing/page.tsx` - Removed Locations rows from all plan cards and comparison table

#### UI/UX Consistency Improvements for Fulfillment Tasks
Improved consistency across Sales Orders, Pick Lists, Delivery Orders, and Invoices detail pages.

**Sticky Action Footers**:
- Added sticky footer to Delivery Orders detail page showing item count and status actions (Mark Ready / Dispatch)
- Added sticky footer to Invoices detail page showing line item count, total amount, and status actions (Mark Pending / Send Invoice)
- Now consistent with Sales Orders and Pick Lists which already had sticky footers

**User Experience**:
- Clear action guidance at bottom of all task detail pages
- Consistent validation messaging across all task types
- Mobile-friendly sticky footers that stay visible during scroll

### Added

#### Standalone Delivery Orders (Flexible Workflow)
Enable creating Delivery Orders without requiring a Sales Order - for direct shipments, samples, returns, etc.

**Database** (Migration: `00083_delivery_orders_standalone.sql`):
- Made `sales_order_id` nullable on `delivery_orders` table
- Added `customer_id` column for direct customer reference
- Added CHECK constraint requiring either `sales_order_id` OR `customer_id`
- Made `sales_order_item_id` nullable on `delivery_order_items` for manual item entry
- Backfilled existing records with customer_id from linked sales orders

**Server Actions** (`app/actions/delivery-orders.ts`):
- Updated `createDeliveryOrder()` to accept either sales_order_id or customer_id
- Updated validation schemas and interfaces for optional SO link
- Added `is_standalone` flag to list queries
- Updated status change handlers to handle null sales_order_id

**UI Changes**:
- New "New Delivery Order" button on Delivery Orders list page
- New standalone creation form (`/tasks/delivery-orders/new`)
- Customer dropdown with address auto-fill option
- "Direct" badge shown in list for standalone DOs
- "Direct Delivery" indicator on detail page
- Customer info card shows direct customer for standalone DOs

**Workflow**:
- Chained: Sales Order → Pick List → Delivery Order → Invoice (unchanged)
- Standalone: Delivery Orders → New → Select Customer → Add Items → Ship

#### Per-User AI Usage Cost Tracking
Cost-based usage limits for AI features to control spending:

**Database** (Migration: `00082_ai_usage_cost_tracking.sql`):
- `ai_usage_tracking` table - Logs every AI request with token counts and USD cost
- `ai_usage_limits` table - Per-user monthly limits (default $0.05/month)
- `check_ai_usage_limit()` RPC - Pre-request validation
- `track_ai_usage()` RPC - Post-request logging with model-specific pricing
- `get_ai_usage_summary()` RPC - Usage dashboard data
- `set_user_ai_limit()` RPC - Admin function to adjust user limits
- Auto-creates limits for new users via trigger

**TypeScript** (`lib/ai/usage-tracking.ts`):
- `checkAiUsageLimit()` - Server-side pre-check
- `trackAiUsage()` - Server-side usage logging
- `estimateCost()` - Token-to-cost estimation
- Client-side variants for UI display

**API Routes Updated**:
- `/api/ai/chat` - Checks limit before AI call, tracks usage after
- `/api/ai/insights` - Checks limit before AI call, tracks usage after

**Pricing**:
- Default limit: $0.05/month (~100-160 questions with Gemini Flash)
- Model-specific rates: Gemini Flash ($0.075/$0.30 per 1M tokens), GPT-4o, Claude, etc.
- 80% warning threshold before limit reached

#### PDF Downloads for Task Documents
- Added Download PDF actions for Purchase Orders, Pick Lists, Sales Orders, Delivery Orders, and Invoices.

#### Create Delivery Order from Completed Pick List
- Added "Create Delivery Order" button on completed Pick Lists that are linked to Sales Orders
- Button appears only when Pick List is completed and originated from a Sales Order
- Automatically creates a Delivery Order with all picked items ready to ship

### Changed

#### Ask Zoe AI Assistant Optimization
Major performance and cost optimization for the Ask Zoe AI assistant:

**Database Optimizations** (Migrations: `00080_zoe_context_rpc.sql`, `00081_validate_ai_request.sql`):
- New `get_zoe_context()` RPC function replaces 7+ individual queries with 1 server-side call
- New `validate_ai_request()` RPC combines auth + profile + rate limit checks (3 calls → 1)
- Server-side SQL aggregation instead of fetching all rows for counts

**Token Usage Optimization**:
- Compact pipe-delimited format for inventory data (60% token reduction)
- Status abbreviations (in_stock → I, low_stock → L, out_of_stock → O)
- Tiered system prompts based on query complexity (minimal/standard/extended)
- Conversation history summarization (20 messages → 6 recent + summary)

**New Files**:
- `lib/ai/context-compressor.ts` - Compact formatting utilities
- `lib/ai/history-manager.ts` - Conversation history management with summarization

**Expected Results**:
- API calls: 3-10 → 2-3 (70% reduction)
- Data transfer: 100-500KB → 5-20KB (95% reduction)
- Token usage: ~8000 → ~3000 tokens per chat (60% reduction)
- Cost per chat: ~$0.02 → ~$0.008 (60% savings)

#### PDF Headers
- PDF exports now include the tenant company name in the document header when available.

#### PDF Layouts
- Updated task document PDFs to a QuickBooks-style layout with logo support, two-column address blocks, and balance due callouts for invoices.
- Added company address/contact/tax ID fields in Company Settings for PDF headers.

### Added

#### User Documentation Guide
- **Learn.md** (`docs/Learn.md`) - Comprehensive user guide covering all StockZip features
  - 23 sections covering the complete user workflow
  - Step-by-step instructions for all features
  - Tables and formatting for easy reference
  - Troubleshooting & FAQ section
  - Getting Started checklist for new users

### Changed

#### Pricing Plan Notes
- **Pricing plan** (`docs/pricingplan.md`) now calls out PDF downloads for document workflows.

### Removed

#### Multi-Location Stock Tracking Feature
- **Removed Settings → Locations page** - The location management UI has been removed from settings
- **Removed "Multi-Location Inventory" feature toggle** - This feature flag is no longer available in Settings → Features
- **Removed ItemLocationsPanel** - The panel showing stock quantities per location on item detail pages
- **Removed StockTransferModal** - The modal for transferring stock between locations
- **Renamed inventory dropdown** - Changed "All Locations" to "All Folders" in the inventory view for clarity

**Note**: The underlying `locations` and `location_stock` database tables are retained for Goods Receiving functionality (assigning received items to storage locations). Only the multi-location stock tracking feature UI has been removed.

### Added

#### Auto-Reorder Suggestions Feature
- **Reorder Suggestions Page** (`/tasks/reorder-suggestions`) - Identifies items below their reorder point and groups them by vendor
- **Item-Vendor Linking** (Migration: `00055_auto_reorder_suggestions.sql`):
  - New `item_vendors` table to link items to their suppliers with pricing, lead times, and preferred vendor flags
  - New columns on `inventory_items`: `reorder_point` and `reorder_quantity`
- **Smart Reorder Logic**:
  - Detects items at or below reorder point (or min_quantity if not set)
  - Calculates suggested order quantities automatically
  - Urgency levels: Critical (out of stock), Urgent (below min), Reorder (below reorder point)
- **Grouped by Vendor View**:
  - Items grouped by preferred vendor for batch PO creation
  - Shows estimated total per vendor
  - One-click "Create PO" button per vendor group
- **One-Click PO Creation**:
  - Creates draft purchase orders directly from suggestions
  - Pre-populates vendor SKU and unit cost from item-vendor relationship
  - Calculates order totals automatically
- **Dashboard Stats**:
  - Total items needing reorder
  - Critical/Urgent counts
  - Estimated total value
- **Navigation**: Added "Reorder" link under Tasks in sidebar
- **RPC Functions**:
  - `get_reorder_suggestions()` - Returns items below reorder point with vendor info
  - `get_reorder_suggestions_by_vendor()` - Groups suggestions by vendor
  - `create_po_from_suggestions()` - Creates draft PO from suggestion items
  - `link_item_to_vendor()` - Creates/updates item-vendor relationships
  - `get_item_vendors()` - Returns all vendors for a specific item
  - `get_reorder_suggestions_count()` - Returns count for sidebar badge

### Changed

#### Partial Picking Support
- **Quantity Input**: Pick any quantity (1 to remaining) per item instead of all-or-nothing
- **Progress Bar**: Visual progress indicator showing picked/total units with percentage
- **Partial Completion**: Can complete pick lists with partial picks (shows "Complete Partial" button)
- **Smart Defaults**: Quantity input defaults to remaining quantity for each item
- **Real-World Flexibility**: Handles common scenario where full quantity isn't available

#### Location-Aware Pick Lists
- **Item Location Data**: Pick list items now display warehouse location for each item (Migration: `00053_pick_list_locations.sql`)
- **Updated RPC**: `get_pick_list_with_items` returns location data (location name, type, quantity) for each item
- **UI Enhancement**: Location badge with MapPin icon shows primary location on each item row
- **Multiple Locations**: Items in multiple locations show "+N more" indicator
- **Picker Efficiency**: Pickers can now see exactly where to find each item in the warehouse

#### Pick List Draft Mode Layout Redesign
- **Two-Column Layout** on desktop (lg+): Main content area (2/3) for Ship To + items, sidebar (1/3) for settings
- **Ship To Card at Top**: Prominent card in main content area with compact 2-column address form (destination-first workflow)
- **Summary Stats Bar**: Shows item count, total units, and validation status at a glance
- **Required Settings Card**: Emphasized sidebar card with Assign To, Item Outcome, and Due Date fields
- **Collapsible Notes**: Notes section collapsed by default in sidebar, auto-expands if has content
- **Enhanced Footer**: Shows validation hints when required fields are missing
- **Streamlined Header**: Cleaner header with title and status on single line
- **New Component**: `CollapsibleSection` (`components/ui/collapsible-section.tsx`) for reusable expand/collapse UI

### Added

#### Tasks Section (New Unified Workflow Interface)
- **Tasks Hub** (`/tasks`) - New centralized task management interface replacing `/workflows`
- **Consolidated Navigation** with sub-menu categories:
  - **Inbound** (`/tasks/inbound`) - Purchase Orders, Receives
  - **Fulfillment** (`/tasks/fulfillment`) - Pick Lists
  - **Inventory Operations** (`/tasks/inventory-operations`) - Checkouts, Transfers, Moves, Stock Count
- **Sidebar Sub-Menu Navigation** - Expandable sub-menus in primary sidebar for workflow categories
- **Mobile Bottom Navigation** updated with Tasks tab

#### Display ID System (Human-Readable Document Numbers)
- **Organization Codes** (Migration: `00036_tenant_org_code.sql`):
  - Auto-generated 5-character org code per tenant (e.g., "ACM01" for "Acme Corp")
  - 3 letters from company name + 2-digit suffix
  - Immutable after creation to ensure document ID consistency
- **Entity Display IDs** with format: `{PREFIX}-{ORG_CODE}-{SEQUENCE}`:
  - Purchase Orders: `PO-ACM01-00001`
  - Pick Lists: `PL-ACM01-00001`
  - Receives: `RCV-ACM01-00001`
  - Stock Counts: `SC-ACM01-00001`
- **Database Schema** (Migrations: `00036-00043`):
  - `entity_sequence_counters` table for per-entity-type sequence tracking
  - `display_id` column added to `purchase_orders`, `pick_lists`, `receives`, `stock_counts`
  - Atomic RPC functions for entity creation with display ID generation
  - Search functions to find entities by display ID
  - Immutability triggers to prevent display ID modification after creation

#### Item Reminders System (Migrations: `00021-00025`)
- **Reminder Types**:
  - **Low Stock** - Trigger when quantity falls below threshold
  - **Expiry** - Trigger N days before expiry date
  - **Restock** - Scheduled reminders for reordering
- **Recurrence Options**: Once, Daily, Weekly, Monthly
- **Notification Channels**: In-app notifications, Email (optional)
- **Reminder Management Page** (`/reminders`) with:
  - Tabbed view: All, Low Stock, Expiry, Restock
  - Reminder cards showing item, type, status, last triggered
  - Edit/Delete actions
  - Status badges (Active, Paused, Triggered, Expired)
- **Item Detail Integration**:
  - Inline reminders card showing item-specific reminders
  - Quick add reminder modal
  - Edit reminder modal with full configuration
- **Edge Function** (`process-reminders`) for daily reminder processing
- **GitHub Actions Workflow** (`.github/workflows/process-reminders.yml`) for daily CRON trigger

#### Checkout Serial Tracking (Migration: `00030_checkout_serials.sql`)
- **Serial-Aware Checkouts** - Link checkouts to specific serial numbers
- `checkout_serials` junction table tracking which serials are checked out
- Per-serial return condition tracking
- Constraint ensuring each serial can only be in one active checkout

#### Pick List Enhancements (Migration: `00031_pick_list_enhancements.sql`)
- **Item Outcome Options**: `decrement` (default), `checkout`, `transfer`
- **Ship To Address** fields: name, address1, address2, city, state, postal code, country
- **Assigned At** timestamp (Migration: `00034_pick_list_assigned_at.sql`)
- **Pick List Number** auto-generation (Migration: `00035_pick_list_number.sql`)
- **Pick List Detail Page** (`/tasks/pick-lists/[pickListId]`) with:
  - Items table with pick status
  - Assignee management
  - Status workflow (Draft → Assigned → In Progress → Completed)

#### Activity Log Enhancements (Migration: `00032_activity_logs_move_details.sql`)
- **Move Details** in activity logs for item relocations
- Tracks source/destination folder information

#### Custom Field Enhancements (Migrations: `00028-00029`)
- **Folder-Scoped Custom Fields** - Custom fields can be limited to specific folders
- **Custom Field Limits** - Per-tenant limits on number of custom fields

#### Tenant Settings Validation (Migration: `00027_tenant_settings_validation.sql`)
- Database-level validation for tenant settings

#### Workflow Reorganization & Stock Count Feature
- **Workflow Hub Restructured** into 3 category-based sub-hubs:
  - **Inbound** (`/workflows/inbound`) - Purchase Orders, Receives
  - **Fulfillment** (`/workflows/fulfillment`) - Pick Lists
  - **Inventory Operations** (`/workflows/inventory-operations`) - Check-In/Out, Transfers, Moves, Stock Count
- **Stock Count Feature** - New inventory audit workflow:
  - **List Page** (`/workflows/stock-count`) with sortable table, status badges, and progress indicators
  - **Detail Page** (`/workflows/stock-count/[id]`) with:
    - Stats cards (Total, Counted, Remaining, Variances)
    - Progress bar visualization
    - Item search and filtering
    - Inline count recording with variance calculation
    - Status workflow (Draft → In Progress → Review → Completed)
    - Option to apply inventory adjustments on completion
  - **Server Actions**: `getStockCounts()`, `getStockCount()`, `createStockCount()`, `startStockCount()`, `recordCount()`, `submitForReview()`, `completeStockCount()`, `cancelStockCount()`
  - **Database Schema** (Migration: `00044_stock_counts.sql`):
    - `stock_counts` table with display_id, status workflow, scope settings, assignment, progress tracking
    - `stock_count_items` table with expected/counted quantities and variance tracking
    - RLS policies for tenant isolation
    - PostgreSQL functions for atomic operations and display_id generation

#### Purchase Orders Workflow (Complete Implementation)
- **New Order Modal** - Full-featured modal for creating purchase orders with:
  - Vendor dropdown with quick "Add New Vendor" option
  - Auto-generated or manual order numbers (PO-0001 format)
  - Expected delivery date picker
  - Item search from existing inventory or custom item entry
  - **Low-stock items filter** - Checkbox to show only items below minimum stock level
  - **Part Number field** - Vendor/manufacturer part number per line item
  - Quantity and unit price per item
  - Auto-calculated subtotal/total
  - Notes field
  - **Ship To address section** (collapsible) - Name, address, city, state, postal code, country
  - **Bill To address section** (collapsible) - Same fields with "Same as Ship To" button
- **Vendor Management** - Quick-add vendor modal with:
  - Required vendor name
  - Contact name, email, phone
  - Full address fields (optional)
  - Notes
- **Purchase Order Detail Page** (`/workflows/purchase-orders/[id]`) with:
  - Full PO header with status badge
  - Vendor information sidebar with contact details
  - Order items table with quantities, **part numbers**, prices, and receive progress
  - Inline quantity editing for draft orders
  - Add/remove items for draft orders
  - Status workflow buttons (Submit, Confirm, Cancel, Restore)
  - Link to Receives page for receiving items
  - **Ship To address card** in sidebar (when configured)
  - **Bill To address card** in sidebar (when configured)
  - **Submitted/Approved date display** in order details
- **Server Actions** for PO CRUD operations:
  - `getVendors()`, `createVendor()`
  - `createPurchaseOrder()`, `getPurchaseOrder()`
  - `updatePurchaseOrder()`, `updatePurchaseOrderStatus()`
  - `addPurchaseOrderItem()`, `removePurchaseOrderItem()`, `updatePurchaseOrderItem()`
  - `deletePurchaseOrder()` (draft only)
  - `searchInventoryItemsForPO()` - Now supports `lowStockOnly` filter

#### Goods Receiving (GRN) Workflow (Migration: `00045_receives.sql`)
- **Formal Receive Documents** - Multiple receives per PO (supports partial shipments)
  - Display ID format: `RCV-{ORG_CODE}-{SEQUENCE}` (e.g., RCV-ACM01-00001)
  - Status workflow: draft → completed / cancelled
- **Receives List Page** (`/workflows/receives`) with:
  - Tabbed interface: "Receives" list + "Pending POs" list
  - Quick "Receive" button to create new receive from pending PO
  - Status badges and date display
- **Receive Detail Page** (`/workflows/receives/[id]`) with:
  - Header info: received date, delivery note #, carrier, tracking number
  - Default location selector for all items
  - Items table with:
    - Quantity received (editable in draft)
    - Lot/batch tracking (lot number, batch code, expiry date)
    - Per-item location override
    - Item condition (good, damaged, rejected)
  - Complete/Cancel actions
- **Integration with PO**:
  - "Receive Items" button on PO detail page creates new receive
  - Auto-updates PO item received quantities on completion
  - Auto-transitions PO status (partial → received when complete)
- **Lot Tracking Integration**:
  - Creates lot records during receive for lot-tracked items
  - Captures lot number, batch code, expiry date, manufactured date
- **Location Stock Integration**:
  - Upserts location_stock with received quantities
  - Supports per-item location assignment
- **Server Actions**:
  - `createReceive()`, `getReceive()`, `getReceives()`, `getPOReceives()`
  - `addReceiveItem()`, `updateReceiveItem()`, `removeReceiveItem()`
  - `completeReceive()`, `cancelReceive()`, `updateReceive()`
  - `getLocations()`, `getPendingPurchaseOrders()`
- **RPC Functions**:
  - `create_receive()` - Atomic creation with display_id generation
  - `create_receive_with_items()` - Creates receive and pre-populates all PO items with remaining quantities
  - `add_receive_item()`, `update_receive_item()`, `remove_receive_item()`
  - `complete_receive()` - Updates inventory, creates lots, updates PO status
  - `cancel_receive()`, `get_po_receives()`, `get_receive_with_items()`
- **Pre-populated Receive Items**: When creating a receive from a PO, all PO items are automatically added to the receive document with their remaining quantities (ordered - already received). Users can then review and adjust quantities, add lot/batch info before completing.

#### Serial Number Entry for Serialized Items (Migration: `00047_receive_item_serials.sql`)
- **Serial Number Tracking** - For items with `tracking_mode = 'serial'`:
  - **Scan-focused entry modal** with auto-focus input for barcode scanner workflows
  - **Progress indicator** showing "X of Y serials entered" with visual progress bar
  - **Duplicate detection** - Immediate warning if serial already in list
  - **Bulk entry mode** - Paste multiple serials (newline/comma separated)
  - **Remove serials** - Trash icon to remove mistaken entries
  - **Additional options** - Location, condition, expiry date apply to all serials
- **Database Schema**:
  - `receive_item_serials` table linking serial numbers to receive items
  - Unique constraint per receive item to prevent duplicate serials
  - RLS policies for tenant isolation
- **Server Actions**:
  - `addReceiveItemSerial()` - Add single serial with duplicate check
  - `removeReceiveItemSerial()` - Remove a serial number
  - `bulkAddReceiveItemSerials()` - Parse and add multiple serials
  - `getReceiveItemSerials()` - Fetch serials for a receive item
- **UI Indicators**:
  - Purple barcode icon with serial count in items table for serialized items
  - Auto-detects `tracking_mode` to show appropriate modal (lot/batch vs serial)

#### Purchase Orders Schema Enhancements (Migration: `00033_purchase_order_enhancements.sql`)
- **Ship To address fields**: `ship_to_name`, `ship_to_address1`, `ship_to_address2`, `ship_to_city`, `ship_to_state`, `ship_to_postal_code`, `ship_to_country`
- **Bill To address fields**: `bill_to_name`, `bill_to_address1`, `bill_to_address2`, `bill_to_city`, `bill_to_state`, `bill_to_postal_code`, `bill_to_country`
- **Submission tracking**: `submitted_by`, `submitted_at`
- **Approval tracking**: `approved_by`, `approved_at`
- **Part number field**: `part_number` column added to `purchase_order_items` table

### Security

#### Critical RLS and Multi-Tenancy Fixes (Migration: `00026_security_audit_fixes.sql`)

Based on a comprehensive security audit, the following vulnerabilities were identified and fixed:

- **CRITICAL: Profiles RLS tenant hopping** - Fixed UPDATE policy to prevent users from changing their `tenant_id` to gain access to other tenants' data. Added database trigger as belt-and-suspenders protection.

- **HIGH: `activity_logs_archive` RLS** - Enabled RLS on the archive table and added tenant-scoped SELECT policy. Blocked direct inserts (archive function uses SECURITY DEFINER).

- **HIGH: `items_with_tags` view** - Added `tenant_id` filter to prevent cross-tenant data leakage through the view.

- **HIGH: `tenant_stats` materialized view** - Revoked direct SELECT access from authenticated users. Access now only through tenant-scoped `get_my_tenant_stats()` function.

- **HIGH: Cross-tenant status updates** - Fixed `update_overdue_checkouts()` and `update_expired_lots()` functions to scope updates to current tenant only.

- **HIGH: Internal function exposure** - Revoked EXECUTE permissions on `get_due_reminders()`, `process_reminder_trigger()`, `archive_old_activity_logs()`, `purge_old_archives()`, and `refresh_all_tenant_stats()` from authenticated users. These are now service-role only.

- **MEDIUM: `get_item_details` activity leak** - Added tenant filter to tags and activity subqueries to prevent metadata leakage via guessed item IDs.

- **MEDIUM: Child-table FK validation** - Updated RLS INSERT/UPDATE policies on `location_stock`, `lots`, `stock_transfers`, `item_reminders`, and `checkouts` to validate that referenced `item_id` and `location_id` belong to the same tenant.

- **LOW: Edge Function authentication** - Added `CRON_SECRET` header validation to `process-reminders` Edge Function to prevent unauthorized invocation.

- **Belt-and-suspenders: Tenant ID immutability** - Added `prevent_tenant_id_change()` trigger to `profiles`, `inventory_items`, and `folders` tables to block any attempt to modify `tenant_id` at the database level.

### Added

#### Sortly-Compatible Label System
- **5 QR Label Sizes** matching Sortly's label options:
  - Extra Large (5½" × 8½") - Half sheet, 2/sheet - Avery 8126
  - Large (3⅓" × 4") - 6/sheet - Avery 5164/8164
  - Medium (2" × 4") - 10/sheet - Avery 5163/8163
  - Small (1⅓" × 4") - 14/sheet - Avery 5162/8162
  - Extra Small (1" × 2⅝") - 30/sheet - Avery 5160/8160
- **Universal Label Printer Support** with 19 industry-standard label sizes:
  - Small: 1" × 3", 1.125" × 1.25", 1.1875" × 1", 1.2" × 0.85", 1.25" × 1"
  - Medium: 2" × 1", 2.2" × 0.5", 2.25" × 0.5", 2.25" × 1.25", 2.25" × 2", 2.25" × 2.5"
  - Large: 3" × 2", 3" × 3", 4" × 1.5", 4" × 2", 4" × 2.5", 4" × 3", 4" × 5", 4" × 6"
- **Label Size Dropdown** for selecting printer label sizes (replacing fixed thermal options)
- **Dynamic Label Features** based on size:
  - Extra Large/Large & 4"×5"/4"×6" labels: Photo, logo, up to 3 details, note
  - Medium & 4"×3" labels: Photo, 1-2 details
  - Small labels: Name and code only
- **Live Preview Components** for all 6 label sizes
- **Smart UI** that hides unavailable options for smaller label sizes
- **Multiple Barcode Symbologies** for inventory workflows:
  - Auto-detect (UPC/EAN/ITF/GS1)
  - Code 128, Code 39
  - UPC-A, EAN-13, EAN-8
  - ITF-14, GS1-128
- Updated Avery product compatibility references

### Changed

#### UI/UX Improvements
- **Item Detail Page Redesign**:
  - New Quick Actions card with inline quantity adjustment (+1/-1 buttons)
  - Improved QR/Barcode card layout
  - Enhanced checkout section for borrow/return workflows
  - Serial number and shipping dimension display
- **Expandable Edge Button** - Touch 'n Go style floating action button with slide-out menu
- **Notification Bell Improvements** - Badge count display in sidebar navigation
- **Sidebar State Persistence** - Remembers collapsed/expanded state via `useSidebarState` hook
- **Inventory Desktop View** - Improved folder tree navigation and item highlighting
- **Edit Page Highlighting** - Visual feedback when editing items

- **Label Extras Section**: Replaced toggle switches with image selector fields for photo and logo
  - Photo: Select from item's existing photos or upload a custom image
  - Logo: Select company logo or upload a custom image
  - Click to select, with visual checkmark overlay for selected state
  - Remove button to clear selection
  - Fields conditionally shown based on label size support
- Refreshed the label wizard UI with a preview-first layout, card-based option pickers, and a mobile Settings/Preview toggle.
- Simplified printing to two choices: print a full paper sheet (max labels) or print to a label printer.
- Removed DYMO-specific branding - now shows "Works with any label printer" for universal compatibility.
- Label printer sizes now presented in a dropdown selector for easier selection.

### Fixed

- **Auto-generate barcode** is now disabled for formats that require specific numeric patterns (EAN-13, EAN-8, UPC-A, ITF-14, GS1-128). Auto-generate creates alphanumeric barcodes (e.g., `PKL12345678`) which are only compatible with Code 128 and Code 39.
- When selecting a numeric-only barcode format with "Auto-generate" active, the system now automatically switches to "Use existing barcode" (if available) or "Enter manually".

### Database Migrations

| Migration | Purpose |
|-----------|---------|
| `00019_saved_searches.sql` | Saved search functionality |
| `00020_serial_numbers.sql` | Serial number tracking tables |
| `00021_item_reminders.sql` | Item reminders system |
| `00022_reminder_comparison_operator.sql` | Reminder comparison operators |
| `00023_reminder_management_system.sql` | Full reminder management |
| `00024_update_reminder_function.sql` | Reminder update functions |
| `00025_get_item_reminders_with_folder.sql` | Reminders with folder context |
| `00026_security_audit_fixes.sql` | Critical RLS security fixes |
| `00027_tenant_settings_validation.sql` | Tenant settings validation |
| `00028_custom_field_folders.sql` | Folder-scoped custom fields |
| `00029_custom_field_limit.sql` | Custom field limits |
| `00030_checkout_serials.sql` | Checkout serial tracking |
| `00031_pick_list_enhancements.sql` | Pick list ship-to & outcomes |
| `00032_activity_logs_move_details.sql` | Move details in activity logs |
| `00033_purchase_order_enhancements.sql` | PO ship/bill-to addresses |
| `00034_pick_list_assigned_at.sql` | Pick list assigned timestamp |
| `00035_pick_list_number.sql` | Pick list auto-numbering |
| `00036_tenant_org_code.sql` | Organization codes for tenants |
| `00037_entity_sequence_counters.sql` | Sequence counters for display IDs |
| `00038_entity_display_ids.sql` | Display ID columns |
| `00039_backfill_display_ids.sql` | Backfill existing entity IDs |
| `00040_entity_creation_rpcs.sql` | Atomic entity creation RPCs |
| `00041_search_by_display_id.sql` | Search by display ID functions |
| `00042_display_id_letter_prefix.sql` | Letter prefix for display IDs |
| `00043_display_id_immutability.sql` | Prevent display ID changes |
| `00044_stock_counts.sql` | Stock count workflow tables |
| `00045_receives.sql` | Goods receiving (GRN) tables |
| `00046_create_receive_with_items.sql` | Pre-populate receive items RPC |
| `00047_receive_item_serials.sql` | Serial tracking for receives |
| `00048_create_get_item_locations_function.sql` | RPC function for item location stock |

---

## [0.1.0] - 2024-12-20

### Added

#### Core Platform
- Multi-tenant SaaS architecture with pool model (shared tables, RLS isolation)
- Row Level Security (RLS) policies on all 19+ tables
- User authentication via Supabase Auth
- Role-based access control (owner, admin, editor, viewer, member)
- Tenant settings with subscription tiers (free, starter, professional, enterprise)

#### Inventory Management
- Items with full attributes (name, SKU, quantity, price, cost_price, status, barcode, QR code)
- Hierarchical folder structure with materialized path
- Normalized tags with junction table (item_tags)
- Custom field definitions
- Photo uploads to Supabase Storage
- Full-text search with tsvector
- AI semantic search with vector embeddings (pgvector)

#### Check-In/Check-Out System
- Jobs/projects for asset assignments
- Checkout tracking (person, job, or location assignments)
- Due date management with overdue status
- Return condition tracking (good, damaged, needs_repair, lost)

#### Multi-Location Inventory
- Location types: warehouse, van, store, job_site
- Per-location stock tracking (location_stock table)
- Stock transfers between locations with status workflow
- AI-suggested transfers with reasoning

#### Lot/Expiry Tracking
- Multiple lots per item with different expiry dates
- FEFO (First Expired First Out) consumption logic
- Lot status management (active, expired, depleted, blocked)
- Automatic quantity sync from lots

#### Quota Enforcement
- Database-level triggers to enforce max_items and max_users limits
- Application-level validation before item/user creation
- Warning banner at 80% usage on all dashboard pages
- Grandfather strategy for existing over-limit tenants

#### Workflow Features
- Pick lists for order fulfillment
- Purchase orders with vendor management
- Activity logging with full audit trail
- Notifications system (in-app, email for low stock)

#### UI/UX
- Mobile-first responsive design
- Touch 'n Go style expandable action button
- CSV import/export
- QR/barcode scanning
- Offline-first with sync queue

### Database Migrations

| Migration | Purpose |
|-----------|---------|
| `00001_initial_schema.sql` | Core tables & triggers |
| `00002_rls_policies.sql` | RLS policies |
| `00003_storage_setup.sql` | Storage buckets |
| `00004_auth_trigger.sql` | Profile creation trigger |
| `00005_performance_indexes.sql` | Additional indexes |
| `00006_rls_optimization.sql` | Optimized RLS with functions |
| `00007_enum_types.sql` | Enum types & validation |
| `00008_normalize_tags.sql` | Tag junction table |
| `00009_activity_log_partitioning.sql` | Log partitioning |
| `00010_tenant_stats_view.sql` | Statistics views |
| `00011_ai_embeddings.sql` | Vector search support |
| `00012_api_functions.sql` | API helper functions |
| `00013_check_in_out.sql` | Check-in/check-out system |
| `00014_multi_location_inventory.sql` | Multi-location inventory |
| `00015_lot_expiry_tracking.sql` | Lot/expiry tracking |
| `00016_extended_inventory_fields.sql` | Shipping dimensions, tracking mode |
| `00017_allow_admin_update_tenant.sql` | Admin RLS for tenant settings |
| `00018_quota_enforcement.sql` | Quota enforcement triggers |

### Technical Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, RLS)
- FlyonUI components

---

## Version History Format

Each release should document:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed in future
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
- **Database**: Migration changes
