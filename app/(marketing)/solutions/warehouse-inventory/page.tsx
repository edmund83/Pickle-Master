/**
 * Warehouse Inventory Management Solution Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "warehouse inventory management"
 * Secondary keywords: "warehouse barcode scanning", "warehouse cycle counts", "receiving workflow"
 *
 * TODO: Proof Assets Required
 * - Screenshot: Cycle count workflow showing discrepancies
 * - Screenshot: Receiving workflow with scan-to-confirm
 * - Screenshot: Audit trail showing stock movement history
 * - Case study or testimonial from warehouse team
 * - Speed metrics (e.g., "50% faster cycle counts")
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Warehouse Inventory Tracking | Barcode Scanning for Receiving & Cycle Counts',
  description:
    'Warehouse inventory tracking with barcode scanning, fast stock counts, and offline reliability for real-world conditions. Scan to receive, count, and pick.',
  pathname: '/solutions/warehouse-inventory',
})

const faqs = [
  {
    question: 'Does Nook work in warehouses with poor WiFi?',
    answer:
      'Yes. Nook is built offline-first specifically for warehouse environments. Metal racking, concrete walls, and receiving docks often kill connectivity. Nook keeps working without signal and syncs automatically when you reconnect.',
  },
  {
    question: 'What barcode scanners work with Nook?',
    answer:
      'Nook supports phone cameras for 1D barcodes and QR codes, Bluetooth barcode scanners (Socket Mobile, Zebra, Honeywell), and rugged Android devices with built-in hardware scanners. Use whatever fits your workflow best.',
  },
  {
    question: 'Can multiple warehouse workers scan at the same time?',
    answer:
      'Yes. Every team member can scan simultaneously on their own device. Changes sync in real-time when connected, and offline changes merge automatically when devices reconnect. No conflicts, no double-counting.',
  },
  {
    question: 'How do cycle counts work in Nook?',
    answer:
      'Start a cycle count for a zone, location, or full warehouse. Team members scan items and enter counts. Nook flags discrepancies between expected and actual quantities. Review and approve adjustments with full audit trail.',
  },
  {
    question: 'Can I track items by bin and shelf location?',
    answer:
      'Yes. Nook supports hierarchical locations: warehouse → zone → aisle → rack → shelf → bin. Create as many levels as you need. Move items between locations with scan-based workflows.',
  },
  {
    question: 'Does Nook support receiving against purchase orders?',
    answer:
      'Yes. Create a receive from a purchase order and scan incoming items. Nook flags shortages and overages automatically. Close the receive when done and quantities update across your system.',
  },
  {
    question: 'How does Nook handle serial numbers and lot tracking?',
    answer:
      'Nook supports custom fields for serial numbers, lot numbers, expiration dates, and any other item-level data. Search and filter by these fields, and track them through the audit trail.',
  },
  {
    question: 'Can warehouse staff adjust quantities without manager approval?',
    answer:
      'You control permissions with role-based access. Give staff the ability to adjust, or require manager approval for certain actions. Every adjustment is logged with user, timestamp, and reason.',
  },
]

export default function WarehouseSolutionPage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Warehouse Inventory', pathname: '/solutions/warehouse-inventory' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory - Warehouse Inventory Tracking',
          description:
            'Warehouse inventory tracking with barcode scanning, cycle counts, and offline mode for real-world warehouse conditions.',
          pathname: '/solutions/warehouse-inventory',
        })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      {/* Hero Section - Based on /marketing-ui/hero/hero-12 */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full">Solution</span>
            <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Warehouse Inventory Management That Stays Accurate
            </h1>
            <p className="text-base-content/80 mt-6 max-w-3xl text-lg md:text-xl">
              Receive, count, and pick with scan-first workflows. Keep working in dead zones, sync later, and always
              know who changed what.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--wifi-off] text-primary size-5"></span>
                <span className="text-base-content/70">Offline-first</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--scan] text-primary size-5"></span>
                <span className="text-base-content/70">Barcode scanning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--users] text-primary size-5"></span>
                <span className="text-base-content/70">Multi-user sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Why Warehouse Inventory Goes Wrong
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Common problems that cost warehouses time, money, and customer trust.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--wifi-off] text-error mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Dead Zones Kill Accuracy</h3>
                <p className="text-base-content/70 mt-2">
                  Cloud-only apps stop working in the back of the warehouse. Workers give up and update later — or not
                  at all.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--clipboard-x] text-error mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Counts Do Not Match Reality</h3>
                <p className="text-base-content/70 mt-2">
                  Manual entry, paper lists, and end-of-day updates create drift. Nobody trusts the numbers.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--users-minus] text-error mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">No Accountability</h3>
                <p className="text-base-content/70 mt-2">
                  When counts are wrong, nobody knows who touched what or when. Disputes and finger-pointing follow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflows Section - Based on /marketing-ui/features/features-8 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Warehouse Workflows That Work
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Every core warehouse operation, powered by scan-first simplicity.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--package] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">Receiving</h3>
                <p className="text-base-content/80 mt-2">
                  Scan incoming shipments to add inventory instantly. Match against purchase orders, flag shortages,
                  and route items to the correct location.
                </p>
                <ul className="text-base-content/70 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>PO matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Shortage/overage alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Rapid scan mode</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--clipboard-check] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">Cycle Counts</h3>
                <p className="text-base-content/80 mt-2">
                  Run accurate counts without stopping operations. Scan to verify, flag discrepancies, and close gaps
                  with full audit trail.
                </p>
                <ul className="text-base-content/70 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Zone-by-zone counting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Variance reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Blind count option</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--shopping-cart] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">Picking</h3>
                <p className="text-base-content/80 mt-2">
                  Find items fast with search and scan. Verify picks before packing to eliminate shipping errors and
                  customer complaints.
                </p>
                <ul className="text-base-content/70 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Pick list verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Wrong-item alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-4"></span>
                    <span>Location guidance</span>
                  </li>
                </ul>
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
              Built for Real Warehouse Operations
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Features designed by teams who manage thousands of SKUs across multiple locations.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--wifi-off] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Offline-First</h3>
                <p className="text-base-content/80 mt-1">
                  Full functionality in dead zones. Scan, count, and adjust without internet. Sync when connected.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--building] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Multi-Location</h3>
                <p className="text-base-content/80 mt-1">
                  Manage multiple warehouses, zones, aisles, and bins. Full hierarchy with unlimited levels.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--history] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Complete Audit Trail</h3>
                <p className="text-base-content/80 mt-1">
                  Every adjustment logged with who, when, why. Know exactly what happened and when.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--bell] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Low Stock Alerts</h3>
                <p className="text-base-content/80 mt-1">
                  Get notified before stockouts happen. Set reorder points per item, per location.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--users] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Role-Based Access</h3>
                <p className="text-base-content/80 mt-1">
                  Control who can adjust, approve, and view. Assign staff to specific locations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--printer] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Label Printing</h3>
                <p className="text-base-content/80 mt-1">
                  Generate barcode and QR labels. Print on thermal printers or as PDF sheets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Section - Screenshots & Workflow Examples */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">See It In Action</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Real warehouse workflows, captured from Nook.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {/* Screenshot 1: Cycle Count */}
            <div className="rounded-box bg-base-200 p-6">
              {/* TODO: Screenshot - Cycle count workflow showing discrepancies */}
              <div className="bg-base-100 mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-base-content/20">
                <div className="text-center">
                  <span className="icon-[tabler--clipboard-check] text-base-content/30 mx-auto size-12"></span>
                  <p className="text-base-content/40 mt-2 text-sm">Cycle count screenshot</p>
                </div>
              </div>
              <h3 className="text-base-content font-semibold">Cycle Count with Variance</h3>
              <p className="text-base-content/70 mt-1 text-sm">
                Flag discrepancies immediately. Review and resolve with one tap.
              </p>
            </div>

            {/* Screenshot 2: Receiving */}
            <div className="rounded-box bg-base-200 p-6">
              {/* TODO: Screenshot - Receiving workflow with scan-to-confirm */}
              <div className="bg-base-100 mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-base-content/20">
                <div className="text-center">
                  <span className="icon-[tabler--package] text-base-content/30 mx-auto size-12"></span>
                  <p className="text-base-content/40 mt-2 text-sm">Receiving workflow screenshot</p>
                </div>
              </div>
              <h3 className="text-base-content font-semibold">Scan-to-Receive</h3>
              <p className="text-base-content/70 mt-1 text-sm">
                Scan incoming items against purchase orders. Spot shortages instantly.
              </p>
            </div>

            {/* Screenshot 3: Audit Trail */}
            <div className="rounded-box bg-base-200 p-6">
              {/* TODO: Screenshot - Audit trail showing stock movement history */}
              <div className="bg-base-100 mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-base-content/20">
                <div className="text-center">
                  <span className="icon-[tabler--history] text-base-content/30 mx-auto size-12"></span>
                  <p className="text-base-content/40 mt-2 text-sm">Audit trail screenshot</p>
                </div>
              </div>
              <h3 className="text-base-content font-semibold">Complete Audit Trail</h3>
              <p className="text-base-content/70 mt-1 text-sm">
                Every change logged with who, when, and why. Full accountability.
              </p>
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
                  Ready to trust your warehouse counts?
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Offline-first scanning</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Multi-location hierarchy</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Cycle count workflows</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Complete audit trail</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">PO receiving</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Multi-user sync</span>
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

      {/* Related Solutions */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Related Solutions</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link href="/solutions/ecommerce-inventory" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--shopping-cart] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">E-commerce</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Multi-channel inventory sync for online sellers.
                </p>
              </div>
            </Link>

            <Link href="/features/barcode-scanning" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--scan] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Learn about supported scanners and workflows.
                </p>
              </div>
            </Link>

            <Link href="/features/offline-mobile-scanning" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--wifi-off] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Offline Mode</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  How offline-first design works in warehouse conditions.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section - Based on /marketing-ui/faq/faq-1 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Frequently Asked Questions About Warehouse Inventory
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Common questions from warehouse teams evaluating Nook.
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
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Warehouse Inventory You Can Trust
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Start with a free trial. Import your items, label a few locations, and run your first cycle count.
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
