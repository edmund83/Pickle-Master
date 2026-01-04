/**
 * Offline Mobile Scanning Feature Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "offline inventory app"
 * Secondary keywords: "mobile inventory without internet", "offline-first inventory management"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Offline Inventory App | Mobile Scanning Without Internet',
  description:
    'Keep scanning and updating inventory even without internet. StockZip syncs changes automatically when you reconnect. Perfect for warehouses with dead zones.',
  pathname: '/features/offline-mobile-scanning',
})

const faqs = [
  {
    question: 'What inventory functions work offline?',
    answer:
      'Almost everything works offline: barcode scanning, item lookup, quantity adjustments, location moves, check-in/check-out, and adding notes or photos. The only features requiring connectivity are real-time collaboration updates and syncing with external integrations.',
  },
  {
    question: 'How does data sync when I go back online?',
    answer:
      'When your device reconnects, StockZip automatically syncs all pending changes in the background. You can continue working while sync happens. Each change includes a timestamp so the audit trail remains accurate even across multiple offline sessions.',
  },
  {
    question: 'What happens if two people edit the same item offline?',
    answer:
      'StockZip uses smart conflict resolution. For quantity changes, we apply changes in timestamp order. For other fields, the most recent change wins. Conflicts are flagged in the activity log so you can review and correct if needed.',
  },
  {
    question: 'How much data is stored offline on my device?',
    answer:
      'Your full item catalog is cached locally, including photos and custom fields. Storage usage depends on your catalog size — typically 50-500MB. You can configure which locations to cache if you need to limit storage usage.',
  },
  {
    question: 'Can I use offline mode on tablets and phones?',
    answer:
      'Yes! Offline mode works on iOS and Android phones and tablets. The StockZip mobile app is designed for offline-first operation, so the experience is identical whether you have signal or not.',
  },
  {
    question: 'Does offline mode work for multiple users simultaneously?',
    answer:
      'Each team member can work offline independently. When devices reconnect, changes from all users sync and merge. StockZip handles the complexity of multi-user offline sync automatically.',
  },
  {
    question: 'How long can I work offline before syncing?',
    answer:
      'There is no time limit for offline work. You can accumulate days or weeks of changes if needed. However, we recommend syncing regularly to keep your team coordinated and to back up your data.',
  },
  {
    question: 'Is offline data encrypted and secure?',
    answer:
      'Yes. All offline data is encrypted on your device using industry-standard encryption. If your device is lost or stolen, your inventory data remains protected. You can also remotely wipe cached data from the admin dashboard.',
  },
]

export default function OfflineMobileScanningFeaturePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Offline Mobile Scanning', pathname: '/features/offline-mobile-scanning' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory - Offline Mode',
          description:
            'Offline-first mobile inventory management. Scan, update, and manage inventory without internet connection.',
          pathname: '/features/offline-mobile-scanning',
        })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      {/* Hero Section - Based on /marketing-ui/hero/hero-12 */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full">Feature</span>
            <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Offline Inventory App That Never Stops Working
            </h1>
            <p className="text-base-content/80 mt-6 max-w-3xl text-lg md:text-xl">
              Warehouses, basements, and jobsites do not always have signal. StockZip is designed for real conditions —
              scan and update inventory offline, then sync when you reconnect.
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
              Wi-Fi dead zones kill productivity
            </h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Your receiving dock has no signal. The back corner of the warehouse drops connection. Your field team
              works in basements. Every time the app says &quot;connecting...&quot; your team stops working. Cloud-only
              inventory apps were not built for real warehouse conditions.
            </p>
          </div>
        </div>
      </section>

      {/* What Works Offline Section - Based on /marketing-ui/features/features-8 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Full Functionality Without Internet
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Not a stripped-down offline mode. Nearly every feature works without connection.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--scan] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/80 mt-2">
                  Scan any barcode or QR code to pull up item details instantly. Full catalog cached locally.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--search] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Item Lookup</h3>
                <p className="text-base-content/80 mt-2">
                  Search by name, SKU, or custom fields. Browse locations and categories. All data available offline.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--plus-minus] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Quantity Adjustments</h3>
                <p className="text-base-content/80 mt-2">
                  Add, remove, or adjust stock levels. Changes queue up and sync when you reconnect.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--arrows-exchange] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Location Moves</h3>
                <p className="text-base-content/80 mt-2">
                  Move items between locations, bins, or warehouses. Location hierarchy cached for navigation.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--transfer] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Check-In / Check-Out</h3>
                <p className="text-base-content/80 mt-2">
                  Track asset assignments offline. Record who took what and when, sync custody chain later.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--camera] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Photos & Notes</h3>
                <p className="text-base-content/80 mt-2">
                  Attach photos and notes to items offline. Document conditions, damage, or special handling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Sync Works Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                Smart Sync You Can Trust
              </h2>
              <p className="text-base-content/80 mt-4 text-lg">
                When your device reconnects, StockZip syncs all pending changes automatically. Work continues in the
                background — no waiting, no interruption.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <span className="icon-[tabler--clock] text-primary size-6"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Timestamp Ordering</h3>
                    <p className="text-base-content/80 mt-1">
                      Every change is timestamped. Sync applies changes in the correct order, even across multiple
                      offline sessions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <span className="icon-[tabler--git-merge] text-primary size-6"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Conflict Resolution</h3>
                    <p className="text-base-content/80 mt-1">
                      When two users edit the same item offline, StockZip merges changes intelligently and flags anything
                      that needs review.
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
                      Every offline action is logged with user, timestamp, and device. Your audit trail stays accurate
                      even with intermittent connectivity.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-base-100 p-8 shadow-sm">
              <h3 className="text-base-content text-xl font-semibold">Sync Status Dashboard</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-base-200/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-[tabler--circle-check-filled] text-success size-5"></span>
                    <span className="text-base-content">Quantity adjustments</span>
                  </div>
                  <span className="text-base-content/60 text-sm">12 synced</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-base-200/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-[tabler--circle-check-filled] text-success size-5"></span>
                    <span className="text-base-content">Location moves</span>
                  </div>
                  <span className="text-base-content/60 text-sm">5 synced</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-base-200/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-[tabler--loader] text-warning size-5 animate-spin"></span>
                    <span className="text-base-content">Photo uploads</span>
                  </div>
                  <span className="text-base-content/60 text-sm">3 pending</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-base-200/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                    <span className="text-base-content">Conflicts to review</span>
                  </div>
                  <span className="text-base-content/60 text-sm">1 flagged</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Built for Real-World Conditions
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              StockZip shines where other apps fail. Designed for the places where connectivity is unreliable.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--building-warehouse] text-primary mx-auto size-12"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Warehouses</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Deep racking, metal shelving, and concrete walls block signals. Keep scanning in every aisle.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--truck-delivery] text-primary mx-auto size-12"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Receiving Docks</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Verify shipments at the dock door, even when the dock is a connectivity dead zone.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--briefcase] text-primary mx-auto size-12"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Field Teams</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Jobsites, customer locations, and remote areas. Work offline, sync at the office.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--stairs-down] text-primary mx-auto size-12"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Back Rooms</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Basements, storage rooms, and closets. No signal required for inventory control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Offline Data, Enterprise Security
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Your inventory data is protected even when stored locally on devices.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--lock] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Device Encryption</h3>
                <p className="text-base-content/80 mt-1">
                  All cached data is encrypted using AES-256. Protected even if device is lost or stolen.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--device-mobile-off] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Remote Wipe</h3>
                <p className="text-base-content/80 mt-1">
                  Admin dashboard lets you remotely clear cached data from any device instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--fingerprint] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Biometric Lock</h3>
                <p className="text-base-content/80 mt-1">
                  Require Face ID, Touch ID, or PIN to access the app. Extra protection for sensitive inventory.
                </p>
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
                  Never lose productivity to dead zones again
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Full scanning offline</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Quantity adjustments work offline</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Smart conflict resolution</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Encrypted local storage</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Automatic background sync</span>
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
            <Link href="/features/barcode-scanning" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--scan] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Scan any barcode or QR code with your phone camera or Bluetooth scanner.
                </p>
              </div>
            </Link>

            <Link href="/features/check-in-check-out" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--transfer] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Check-In/Check-Out</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Track asset assignments with offline-capable checkout workflows.
                </p>
              </div>
            </Link>

            <Link href="/solutions/mobile-inventory-app" className="card bg-base-100 shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--device-mobile] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Mobile Inventory App</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Full-featured mobile app for iOS and Android with offline-first design.
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
              Frequently Asked Questions About Offline Mode
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Everything you need to know about offline inventory management in StockZip.
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
              Work Anywhere, Sync Everywhere
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Download StockZip and experience true offline-first inventory management. No connectivity anxiety.
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
