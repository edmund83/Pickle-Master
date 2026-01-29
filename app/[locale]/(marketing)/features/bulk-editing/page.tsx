/**
 * Bulk Editing Feature Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "bulk inventory update software"
 * Secondary keywords: "mass inventory editing", "batch update inventory"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Bulk Inventory Update Software | Mass Editing with Preview & Undo',
  description:
    'Make Excel-grade bulk edits with guardrails: preview diffs, avoid mistakes, and undo changes when needed. Update thousands of items in seconds.',
  pathname: '/features/bulk-editing',
})

const faqs = [
  {
    question: 'How do I select items for bulk editing?',
    answer:
      'Select items using filters (category, location, tag, custom field), search results, or manual checkbox selection. You can also paste a list of SKUs or barcodes to select specific items. Save common filters as presets for repeated use.',
  },
  {
    question: 'What fields can I bulk edit?',
    answer:
      'Almost any field: quantity, price, cost, location, category, tags, custom fields, minimum/maximum stock levels, supplier, notes, and status. You can also bulk add or remove tags, move items between locations, and update multiple custom fields at once.',
  },
  {
    question: 'How does the preview feature work?',
    answer:
      'Before applying changes, StockZip shows a diff view highlighting exactly what will change for each item. Review the before/after values, catch errors, and confirm or cancel. Nothing changes until you click Apply.',
  },
  {
    question: 'Can I undo a bulk edit after applying it?',
    answer:
      'Yes! Every bulk edit creates a snapshot. Click Undo to revert all affected items to their previous values. The undo history is available for 30 days, and you can also selectively revert individual items.',
  },
  {
    question: 'Is there a limit to how many items I can edit at once?',
    answer:
      'There is no hard limit. We have tested bulk edits on 50,000+ items. For very large operations, StockZip processes in batches and shows progress. You can continue working while large edits complete in the background.',
  },
  {
    question: 'Can I import changes from a spreadsheet?',
    answer:
      'Absolutely. Export your items to CSV, make changes in Excel or Google Sheets, then re-import. StockZip matches by SKU or barcode and shows a preview of all changes before applying. Perfect for complex multi-field updates.',
  },
  {
    question: 'What validation does StockZip provide for bulk edits?',
    answer:
      'StockZip validates data types, required fields, and business rules before applying. For example, it warns if quantity would go negative, if a barcode already exists, or if a required custom field is empty. You can proceed or fix issues first.',
  },
  {
    question: 'Can I schedule bulk edits to run later?',
    answer:
      'Yes. Schedule bulk updates to apply at a specific time — useful for price changes, seasonal updates, or coordinating with other systems. Scheduled edits show in a queue where you can review, modify, or cancel before execution.',
  },
]

export default function BulkEditingFeaturePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Bulk Editing', pathname: '/features/bulk-editing' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory - Bulk Editing',
          description:
            'Bulk inventory update software with preview diffs, validation guardrails, and undo capability.',
          pathname: '/features/bulk-editing',
        })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      {/* Hero Section - Based on /marketing-ui/hero/hero-12 */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full">Feature</span>
            <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Bulk Inventory Updates with Guardrails
            </h1>
            <p className="text-base-content/80 mt-6 max-w-3xl text-lg md:text-xl">
              Spreadsheet speed with database safety. Preview every change, catch errors before they happen, and undo
              when something goes wrong.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Spreadsheets are fast — until they break trust
            </h2>
            <p className="text-base-content/80 mt-4 text-lg">
              One wrong formula, one pasted column, one accidental overwrite — and your inventory data is corrupted.
              Teams lose confidence. Audits fail. Recovery takes hours. Bulk editing without guardrails is a disaster
              waiting to happen.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section - Based on /marketing-ui/features/features-8 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Select → Preview → Apply</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Three steps that prevent disasters and save hours of cleanup.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--checkbox] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">1. Select Items</h3>
                <p className="text-base-content/80 mt-2">
                  Filter, search, or manually select the items you want to update. Use saved filters for recurring
                  tasks.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--eye] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">2. Preview Changes</h3>
                <p className="text-base-content/80 mt-2">
                  See exactly what will change before applying. Catch errors, validate data, and confirm the scope.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--check] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">3. Apply (with Undo)</h3>
                <p className="text-base-content/80 mt-2">
                  Changes apply instantly with full audit trail. Click Undo anytime to revert all changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Bulk Editing Built for Real Operations
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              All the power of spreadsheets, none of the risk.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--git-compare] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Diff Preview</h3>
                <p className="text-base-content/80 mt-1">
                  See before/after for every item. Red for removed, green for added. Catch errors before they happen.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--arrow-back-up] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">One-Click Undo</h3>
                <p className="text-base-content/80 mt-1">
                  Revert any bulk edit instantly. Full snapshot stored for 30 days. Undo all or select individual
                  items.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--shield-check] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Validation Rules</h3>
                <p className="text-base-content/80 mt-1">
                  Automatic checks for data types, required fields, duplicates, and business rules before applying.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--table] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">CSV Import/Export</h3>
                <p className="text-base-content/80 mt-1">
                  Export to Excel, make changes, re-import. Preview matches by SKU/barcode before applying.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--clock] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Scheduled Updates</h3>
                <p className="text-base-content/80 mt-1">
                  Schedule bulk edits to apply later. Perfect for price changes, seasonal updates, and coordinated
                  releases.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--bookmark] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Saved Filters</h3>
                <p className="text-base-content/80 mt-1">
                  Save common selection criteria as presets. One click to select the same group next time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Common Bulk Edit Operations</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              StockZip handles the updates your team makes every week.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <span className="icon-[tabler--upload] text-primary size-8"></span>
                  <h3 className="text-base-content text-lg font-semibold">Post-Import Cleanup</h3>
                </div>
                <p className="text-base-content/80 mt-3">
                  After migrating from another system or spreadsheet, bulk fix categories, normalize locations, and fill
                  missing fields.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Standardize category names</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Fill missing SKUs or barcodes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Assign default locations</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <span className="icon-[tabler--currency-dollar] text-primary size-8"></span>
                  <h3 className="text-base-content text-lg font-semibold">Price Updates</h3>
                </div>
                <p className="text-base-content/80 mt-3">
                  Apply percentage increases, set new prices by category, or update cost basis across your catalog.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Percentage or fixed adjustments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Preview margin impact</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Schedule effective date</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <span className="icon-[tabler--arrows-exchange] text-primary size-8"></span>
                  <h3 className="text-base-content text-lg font-semibold">Location Reorganization</h3>
                </div>
                <p className="text-base-content/80 mt-3">
                  Restructuring your warehouse? Move items between locations, shelves, or bins in bulk.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Move by category or filter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Merge duplicate locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Preserve audit history</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <span className="icon-[tabler--calculator] text-primary size-8"></span>
                  <h3 className="text-base-content text-lg font-semibold">Audit Corrections</h3>
                </div>
                <p className="text-base-content/80 mt-3">
                  After a physical count, bulk update quantities to match actual inventory levels.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Import count results from CSV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Preview variance before applying</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Tag adjustments for reporting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Based on /marketing-ui/cta/cta-4 */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-base-100 rounded-3xl p-8 shadow-sm sm:p-12 lg:p-16">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex grow flex-col gap-6">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Edit with confidence, not fear
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Preview every change</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">One-click undo</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Validation guardrails</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">CSV import/export</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">50,000+ item capacity</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Scheduled updates</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">14-day free trial</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">No credit card required</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 max-sm:w-full max-sm:flex-col">
                  <Link href="/signup" className="btn btn-primary">
                    Start Free Trial
                  </Link>
                  <Link href="/pricing" className="btn btn-outline btn-secondary">
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Related Features</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link href="/features/barcode-scanning" className="card bg-base-100 card-border shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--scan] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Scan items to select for bulk editing. Faster than clicking.
                </p>
              </div>
            </Link>

            <Link href="/features/low-stock-alerts" className="card bg-base-100 card-border shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--bell] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Low Stock Alerts</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Bulk update reorder points and minimum stock levels.
                </p>
              </div>
            </Link>

            <Link href="/migration" className="card bg-base-100 card-border shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--database-import] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Data Migration</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Import your existing inventory and clean up with bulk editing.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section - Based on /marketing-ui/faq/faq-1 */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Frequently Asked Questions About Bulk Editing
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Everything you need to know about mass inventory updates in StockZip.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="accordion divide-base-content/10 divide-y" data-accordion="default-open">
              {faqs.map((faq, index) => (
                <div key={index} className="accordion-item" id={`faq-${index}`}>
                  <button
                    className="accordion-toggle inline-flex w-full items-center justify-between gap-4 py-5 text-start font-medium"
                    aria-controls={`faq-content-${index}`}
                    aria-expanded={index === 0 ? 'true' : 'false'}
                  >
                    <span className="text-base-content">{faq.question}</span>
                    <span className="icon-[tabler--chevron-down] text-base-content/60 accordion-icon size-5 shrink-0 transition-transform"></span>
                  </button>
                  <div
                    id={`faq-content-${index}`}
                    className="accordion-content w-full overflow-hidden transition-[height] duration-300"
                    role="region"
                    aria-labelledby={`faq-${index}`}
                  >
                    <p className="text-base-content/80 pb-5">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Update Thousands of Items in Seconds
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Experience bulk editing that is powerful and safe. Preview, apply, undo — all with confidence.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
