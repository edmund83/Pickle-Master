/**
 * Low Stock Alerts Feature Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "low stock alerts software"
 * Secondary keywords: "reorder point notifications", "inventory alert system"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import { breadcrumbJsonLd, softwareApplicationJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/features/low-stock-alerts',
    title: 'Low Stock Alerts Software | Reorder Point Notifications',
    description:
      'Set reorder points and get notified before you run out. Prevent stockouts, avoid emergency orders, and keep customers happy with automated alerts.',
  })
}

const faqs = [
  {
    question: 'How do I set reorder points for items?',
    answer:
      'Edit any item and set the "Minimum Stock" field. When quantity drops to or below this level, StockZip triggers a low-stock alert. You can bulk-set reorder points using the bulk editing feature.',
  },
  {
    question: 'How will I receive low stock alerts?',
    answer:
      'Alerts appear in the StockZip dashboard, mobile app notifications, and optionally via email. Configure alert preferences per user — some team members might only want daily digests while buyers need immediate notifications.',
  },
  {
    question: 'Can I set different reorder points per location?',
    answer:
      'Yes! Each location can have its own reorder point for the same item. This is useful when different warehouses or stores have different sales velocities or lead times.',
  },
  {
    question: 'How do I calculate the right reorder point?',
    answer:
      'Consider your lead time (how long it takes to receive new stock) and average daily usage. A simple formula: Reorder Point = Daily Usage × Lead Time Days + Safety Stock. StockZip shows usage trends to help you estimate.',
  },
  {
    question: 'Can I set alerts for both low stock and overstock?',
    answer:
      'Yes! Set both Minimum Stock (triggers low-stock alert) and Maximum Stock (triggers overstock alert). Overstock alerts help identify slow-moving inventory and prevent over-ordering.',
  },
  {
    question: 'Do alerts work for items in multiple locations?',
    answer:
      'StockZip can alert on per-location quantities or total quantity across all locations. Configure this based on whether you care about overall stock or location-specific availability.',
  },
  {
    question: 'Can I export a low-stock report for purchasing?',
    answer:
      'Absolutely. The Low Stock report shows all items below reorder point with current quantity, reorder point, suggested order quantity, and supplier info. Export to CSV or PDF for purchasing workflows.',
  },
  {
    question: 'How do I silence alerts during expected shortages?',
    answer:
      'Mark items as "Backordered" or "Discontinued" to suppress alerts. You can also snooze alerts for specific items for a set period if you know stock is coming soon.',
  },
]

export default function LowStockAlertsFeaturePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Low Stock Alerts', pathname: '/features/low-stock-alerts' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory - Low Stock Alerts',
          description:
            'Low stock alerts and reorder point notifications. Prevent stockouts with automated inventory monitoring.',
          pathname: '/features/low-stock-alerts',
        })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      {/* Hero Section - Based on /marketing-ui/hero/hero-12 */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full">Feature</span>
            <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Low Stock Alerts That Prevent Stockouts
            </h1>
            <p className="text-base-content/80 mt-6 max-w-3xl text-lg md:text-xl">
              Set reorder points per item and get notified when inventory dips. Reorder early, avoid emergency orders,
              and never disappoint a customer with &quot;out of stock.&quot;
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
              Stockouts cost more than lost sales
            </h2>
            <p className="text-base-content/80 mt-4 text-lg">
              When you run out of a popular item, customers leave — and often do not come back. Emergency orders cost
              more. Rushed shipping burns margin. And your team wastes time scrambling instead of selling. Proactive
              reordering is cheaper than reactive firefighting.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section - Based on /marketing-ui/features/features-8 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Set It, Forget It, Get Alerted</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Three steps to never be surprised by a stockout again.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--adjustments] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">1. Set Reorder Points</h3>
                <p className="text-base-content/80 mt-2">
                  Define minimum stock levels based on lead times and demand. Bulk-set for efficiency.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--eye] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">2. StockZip Monitors</h3>
                <p className="text-base-content/80 mt-2">
                  Automatic monitoring of all stock levels. No manual checking required.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--bell-ringing] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">3. Get Alerted</h3>
                <p className="text-base-content/80 mt-2">
                  Receive notifications via dashboard, mobile, or email when items hit reorder point.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Complete Stock Level Monitoring
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              More than just low stock alerts. Full visibility into stock health.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--bell] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Low Stock Alerts</h3>
                <p className="text-base-content/80 mt-1">
                  Instant notification when any item drops to or below reorder point. Never miss a reorder window.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--arrow-up] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Overstock Alerts</h3>
                <p className="text-base-content/80 mt-1">
                  Identify items above maximum stock. Reduce tied-up capital and storage costs.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--building] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Per-Location Thresholds</h3>
                <p className="text-base-content/80 mt-1">
                  Different reorder points for different locations. Match local demand patterns.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--mail] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Flexible Notifications</h3>
                <p className="text-base-content/80 mt-1">
                  Choose instant alerts, daily digests, or weekly summaries per user. Email, push, or in-app.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--report] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Low Stock Report</h3>
                <p className="text-base-content/80 mt-1">
                  Exportable report with all items below reorder point, suggested quantities, and supplier info.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--chart-line] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Usage Trends</h3>
                <p className="text-base-content/80 mt-1">
                  View historical usage to set smarter reorder points. See seasonality and velocity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Dashboard Visualization */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                See Stock Status at a Glance
              </h2>
              <p className="text-base-content/80 mt-4 text-lg">
                The StockZip dashboard shows stock health across your entire catalog. Red for critical, yellow for low,
                green for healthy. Know exactly what needs attention.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="bg-error/20 text-error flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold">
                    12
                  </span>
                  <div>
                    <p className="text-base-content font-medium">Critical (at or below zero)</p>
                    <p className="text-base-content/60 text-sm">Items that may already be causing stockouts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-warning/20 text-warning flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold">
                    34
                  </span>
                  <div>
                    <p className="text-base-content font-medium">Low (below reorder point)</p>
                    <p className="text-base-content/60 text-sm">Items that need reordering soon</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-success/20 text-success flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold">
                    523
                  </span>
                  <div>
                    <p className="text-base-content font-medium">Healthy (above reorder point)</p>
                    <p className="text-base-content/60 text-sm">Items with sufficient stock</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-base-200 p-6 shadow-sm">
              <h3 className="text-base-content text-lg font-semibold">Low Stock Items</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-base-100 p-4">
                  <div>
                    <p className="text-base-content font-medium">Widget Pro Max</p>
                    <p className="text-base-content/60 text-sm">SKU: WPM-001</p>
                  </div>
                  <div className="text-end">
                    <p className="text-error font-semibold">3 left</p>
                    <p className="text-base-content/60 text-sm">Reorder: 25</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-base-100 p-4">
                  <div>
                    <p className="text-base-content font-medium">Standard Bracket</p>
                    <p className="text-base-content/60 text-sm">SKU: SB-042</p>
                  </div>
                  <div className="text-end">
                    <p className="text-warning font-semibold">18 left</p>
                    <p className="text-base-content/60 text-sm">Reorder: 20</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-base-100 p-4">
                  <div>
                    <p className="text-base-content font-medium">Premium Cable 6ft</p>
                    <p className="text-base-content/60 text-sm">SKU: PC6-100</p>
                  </div>
                  <div className="text-end">
                    <p className="text-warning font-semibold">45 left</p>
                    <p className="text-base-content/60 text-sm">Reorder: 50</p>
                  </div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm mt-4 w-full">View Full Report</button>
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
                  Never run out of your best sellers again
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Per-item reorder points</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Per-location thresholds</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Email and push notifications</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Exportable reorder reports</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Low and overstock alerts</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Usage trend analysis</span>
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
            <Link href="/features/bulk-editing" className="card bg-base-100 card-border shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--list-check] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Bulk Editing</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Set reorder points for hundreds of items at once.
                </p>
              </div>
            </Link>

            <Link href="/features/barcode-scanning" className="card bg-base-100 card-border shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--scan] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Scan items during receiving to update stock levels.
                </p>
              </div>
            </Link>

            <Link
              href="/learn/how-to-set-reorder-points"
              className="card bg-base-100 card-border shadow-sm hover:shadow-md"
            >
              <div className="card-body">
                <span className="icon-[tabler--book] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Reorder Point Guide</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Learn how to calculate the right reorder points.
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
              Frequently Asked Questions About Low Stock Alerts
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Everything you need to know about reorder points and stock alerts in StockZip.
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
              Stop Stockouts Before They Happen
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Set up reorder points in minutes. Get alerted automatically. Keep customers happy.
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
