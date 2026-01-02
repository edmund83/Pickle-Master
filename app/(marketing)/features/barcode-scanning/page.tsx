/**
 * Barcode Scanning Feature Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "barcode scanning inventory software"
 * Secondary keywords: "QR code inventory app", "mobile barcode scanner for inventory"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Barcode Scanning Inventory Software | Scan Barcodes & QR Codes',
  description:
    'Scan barcodes and QR codes to find, update, and verify inventory instantly. Works with phone cameras and Bluetooth scanners. Free 14-day trial.',
  pathname: '/features/barcode-scanning',
})

const faqs = [
  {
    question: 'What barcode formats does Nook support?',
    answer:
      'Nook supports all common barcode formats including UPC-A, UPC-E, EAN-13, EAN-8, Code 39, Code 128, ITF, QR codes, and Data Matrix. Our scanner automatically detects the format — no configuration needed.',
  },
  {
    question: 'Can I use my phone camera to scan barcodes?',
    answer:
      'Yes! The Nook mobile app uses your phone camera as a barcode scanner. Simply tap the scan button, point at any barcode or QR code, and the item appears instantly. Works on both iOS and Android devices.',
  },
  {
    question: 'Do you support external Bluetooth scanners?',
    answer:
      'Absolutely. Nook works with any Bluetooth barcode scanner that operates in keyboard/HID mode. Popular options include Socket Mobile, Zebra, and Honeywell scanners. Just pair your scanner and start scanning.',
  },
  {
    question: 'Can I scan barcodes without internet connection?',
    answer:
      'Yes! Nook includes offline scanning mode. Scan items, update quantities, and move inventory even without internet. All changes sync automatically when you reconnect. Perfect for warehouses with spotty WiFi.',
  },
  {
    question: 'How do I create barcodes for items that do not have one?',
    answer:
      'Nook can generate QR code labels for any item. Simply select items, click "Print Labels," and choose your label size. Print on any standard label printer or use a thermal printer for professional results.',
  },
  {
    question: 'Can multiple team members scan at the same time?',
    answer:
      'Yes! Every team member can scan simultaneously on their own device. Changes sync in real-time, and our conflict resolution ensures accurate counts even during busy receiving or counting sessions.',
  },
  {
    question: 'Does scanning work for inventory counts and audits?',
    answer:
      'Nook has a dedicated Cycle Count mode designed for inventory audits. Scan items to verify counts, flag discrepancies, and generate variance reports. Makes physical inventory counts 3x faster.',
  },
  {
    question: 'What happens when I scan an unknown barcode?',
    answer:
      'When you scan a barcode not in your system, Nook offers to create a new item with that barcode pre-filled. You can also configure custom actions like showing an alert or searching your supplier catalog.',
  },
]

export default function BarcodeScanningFeaturePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Barcode Scanning', pathname: '/features/barcode-scanning' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory - Barcode Scanning',
          description:
            'Barcode scanning inventory software with phone camera and Bluetooth scanner support. Scan to find, update, and verify inventory instantly.',
          pathname: '/features/barcode-scanning',
        })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      {/* Hero Section - Based on /marketing-ui/hero/hero-12 */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full">Feature</span>
            <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Barcode Scanning Inventory Software
            </h1>
            <p className="text-base-content/80 mt-6 max-w-3xl text-lg md:text-xl">
              Scan barcodes or QR codes to find, update, and verify inventory in seconds. Use your phone camera or
              connect a Bluetooth scanner — no special hardware required.
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
              Manual lookups waste time and cause mistakes
            </h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Searching for items by name or scrolling through lists slows down your team. Typos lead to wrong items.
              Miscounts go unnoticed until a customer order fails. Traditional inventory software was not designed for
              the speed of modern operations.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section - Based on /marketing-ui/features/features-8 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Scan → Confirm → Done</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Three simple steps to update any item. No training manual required.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--scan] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">1. Scan</h3>
                <p className="text-base-content/80 mt-2">
                  Point your phone camera or Bluetooth scanner at any barcode or QR code. The item appears instantly —
                  no typing required.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--edit] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">2. Confirm</h3>
                <p className="text-base-content/80 mt-2">
                  Review the item details and make your update. Adjust quantity, change location, or log a movement
                  with one tap.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--check] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">3. Done</h3>
                <p className="text-base-content/80 mt-2">
                  Changes are saved with timestamps, user ID, and full audit trail. Ready for the next scan in under 2
                  seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Hardware Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Works with Your Existing Hardware</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              No expensive scanners required. Use what you already have or choose from our recommended options.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--device-mobile] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">Phone Camera</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  iPhone and Android cameras work perfectly. No external hardware needed to get started.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--bluetooth] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">Bluetooth Scanners</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Socket Mobile, Zebra, Honeywell — any scanner in keyboard/HID mode pairs instantly.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--barcode] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">1D Barcodes</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  UPC-A, UPC-E, EAN-13, EAN-8, Code 39, Code 128, ITF — all formats supported automatically.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--qrcode] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">QR & 2D Codes</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  QR codes, Data Matrix, and custom labels. Generate and print your own labels in Nook.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Built for Real Warehouse Operations
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Features designed by teams who scan thousands of items per day.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--wifi-off] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Offline Scanning</h3>
                <p className="text-base-content/80 mt-1">
                  Scan and update inventory without internet. Changes sync automatically when you reconnect.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--bolt] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Rapid Scan Mode</h3>
                <p className="text-base-content/80 mt-1">
                  Continuous scanning for receiving and counting. Scan multiple items without re-triggering.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--clipboard-check] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Cycle Count Mode</h3>
                <p className="text-base-content/80 mt-1">
                  Dedicated inventory audit workflow. Scan to verify, flag discrepancies, generate variance reports.
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
                  Generate QR codes for any item. Print on standard or thermal label printers in multiple sizes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--users] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Multi-User Scanning</h3>
                <p className="text-base-content/80 mt-1">
                  Entire team scans simultaneously. Real-time sync with smart conflict resolution.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--history] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Full Audit Trail</h3>
                <p className="text-base-content/80 mt-1">
                  Every scan logged with timestamp, user, location, and before/after values. Complete accountability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Scanning for Every Workflow</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              One scanner, many use cases. Nook adapts to how your team actually works.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="text-base-content text-xl font-semibold">Receiving & Check-In</h3>
                <p className="text-base-content/80 mt-2">
                  Scan incoming shipments to add inventory instantly. Match against purchase orders, flag shortages, and
                  route items to the correct location — all from one screen.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Rapid scan mode for bulk receiving</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>PO matching and variance alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Photo documentation of condition</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="text-base-content text-xl font-semibold">Order Picking</h3>
                <p className="text-base-content/80 mt-2">
                  Scan to confirm picks and eliminate shipping errors. Nook guides pickers to the right location and
                  validates each item before packing.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Pick list verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Wrong-item alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Batch picking support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="text-base-content text-xl font-semibold">Inventory Counts</h3>
                <p className="text-base-content/80 mt-2">
                  Cycle counts and full physical inventories made simple. Scan to verify counts, flag discrepancies, and
                  generate variance reports for review.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Zone-by-zone counting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Variance highlighting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Blind count option</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="text-base-content text-xl font-semibold">Asset Tracking</h3>
                <p className="text-base-content/80 mt-2">
                  Track equipment, tools, and reusable assets. Scan to check out, check in, and maintain a complete
                  custody chain for every asset.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Check-out/check-in workflow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Assignment history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                    <span>Maintenance scheduling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Based on /marketing-ui/cta/cta-4 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-base-200 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex grow flex-col gap-6">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Ready to scan smarter?
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Phone camera scanning included</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">All barcode formats supported</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Works offline</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Label printing built-in</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Multi-user scanning</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Complete audit trail</span>
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
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Related Features</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link href="/features/offline-mobile-scanning" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--wifi-off] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Offline Mobile Scanning</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Full functionality without internet. Scan, update, and sync when connected.
                </p>
              </div>
            </Link>

            <Link href="/features/check-in-check-out" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--transfer] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Check-In/Check-Out</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Track asset assignments with scan-based checkout workflows.
                </p>
              </div>
            </Link>

            <Link href="/features/low-stock-alerts" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--bell] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Low Stock Alerts</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Get notified when scanned items drop below minimum thresholds.
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
              Frequently Asked Questions About Barcode Scanning
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Everything you need to know about barcode and QR code scanning in Nook.
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
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Start Scanning in Minutes</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Download the Nook app, import your items, and start scanning. No hardware purchase required.
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
