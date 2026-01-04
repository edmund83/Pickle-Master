import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

/**
 * inFlow Alternative Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with CTA)
 * - Features: /marketing-ui/features/features-3 (SaaS features with accordion)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: inFlow alternative
 * Secondary keywords: inventory scanner software, simple inventory tracking
 */

export const metadata: Metadata = marketingMetadata({
  title: 'inFlow alternative',
  description:
    'Switch from inFlow to StockZip for simpler inventory management with offline barcode scanning, check-in/check-out workflows, and predictable pricing.',
  pathname: '/compare/inflow-alternative',
})

// FAQ items following FlyonUI faq-1 template structure
const INFLOW_FAQS: FaqItem[] = [
  {
    question: 'How is StockZip different from inFlow?',
    answer:
      'StockZip is designed for small teams that need mobile-first scanning, offline reliability, and simple workflows without the complexity of full ERP features. We focus on doing fewer things exceptionally well.',
  },
  {
    question: 'Does StockZip work offline?',
    answer:
      'Yes. StockZip is built offline-first so you can scan, adjust, and check in/out items even in warehouses or jobsites without reliable internet. Changes sync automatically when you reconnect.',
  },
  {
    question: 'Can I track tools checked out to employees?',
    answer:
      'Yes. StockZip has a native check-in/check-out workflow for issuing tools and assets to staff with due dates, overdue tracking, and full accountability.',
  },
  {
    question: 'Is StockZip easier to set up than inFlow?',
    answer:
      'Yes. StockZip focuses on simplicity — import your CSV, label top movers, and start scanning. No complex configuration, no ERP-style setup wizard, no weeks of implementation.',
  },
  {
    question: 'How does StockZip pricing compare to inFlow?',
    answer:
      'StockZip uses trust-first pricing that scales predictably. No surprise tier jumps or feature gating as your business grows. Your price stays fair as your catalog expands.',
  },
  {
    question: 'Can I migrate my data from inFlow?',
    answer:
      'Yes. Export from inFlow as CSV, import into StockZip with our guided field mapping, and run a verification count. Most teams complete the migration in under an hour.',
  },
  {
    question: 'Does StockZip have purchase orders and sales orders?',
    answer:
      'StockZip focuses on core inventory accuracy, scanning, and accountability. If you need full ERP features like POs and sales orders, inFlow may be a better fit. We do what we do exceptionally well.',
  },
]

// Comparison data following WebsiteGuideline.md comparison template
const COMPARISON_ROWS = [
  {
    category: 'Complexity',
    stockzip: 'Simple, staff-friendly UI focused on scanning and counts',
    inflow: 'Full-featured with ERP-like complexity',
    stockzipWins: true,
  },
  {
    category: 'Offline mode',
    stockzip: 'Offline-first mobile scanning with automatic sync',
    inflow: 'Desktop-focused with limited offline capability',
    stockzipWins: true,
  },
  {
    category: 'Check-in / check-out',
    stockzip: 'Native issue/return workflow with due dates',
    inflow: 'Requires workarounds for asset tracking',
    stockzipWins: true,
  },
  {
    category: 'Mobile experience',
    stockzip: 'Touch-first, camera scanning, works offline',
    inflow: 'Mobile app available but desktop-centric design',
    stockzipWins: true,
  },
  {
    category: 'Setup time',
    stockzip: 'Import CSV and start scanning in minutes',
    inflow: 'Longer setup for full feature configuration',
    stockzipWins: true,
  },
  {
    category: 'Pricing',
    stockzip: 'Trust-first pricing with predictable scaling',
    inflow: 'Tiered pricing with feature-based gating',
    stockzipWins: true,
  },
]

// Key differentiators for the features section (FlyonUI features-3 pattern)
const KEY_DIFFERENTIATORS = [
  {
    id: 'simplicity',
    icon: 'icon-[tabler--sparkles]',
    title: 'Simplicity Over Complexity',
    description:
      'StockZip does fewer things, but does them exceptionally well. No ERP feature bloat. No weeks of configuration. Just fast, reliable inventory tracking that your whole team can use in minutes.',
  },
  {
    id: 'mobile-first',
    icon: 'icon-[tabler--device-mobile]',
    title: 'Mobile-First, Offline-First',
    description:
      'Built for scanning on the floor, not sitting at a desk. StockZip works offline, syncs when connected, and is designed from the ground up for touch-first workflows.',
  },
  {
    id: 'check-in-out',
    icon: 'icon-[tabler--arrows-exchange]',
    title: 'Native Check-In/Check-Out',
    description:
      'Issue tools and assets to staff with a scan. Set due dates, track overdue items, and maintain accountability. No workarounds or folder hacks required.',
  },
]

export default function InFlowAlternativePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Compare', pathname: '/compare' },
          { name: 'inFlow alternative', pathname: '/compare/inflow-alternative' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description:
            'Simple inventory management with barcode scanning and offline reliability. An inFlow alternative for small teams.',
          pathname: '/compare/inflow-alternative',
        })}
      />
      <JsonLd data={faqPageJsonLd(INFLOW_FAQS)} />

      {/* Hero Section - Based on FlyonUI hero-12 template */}
      <section className="bg-base-100 px-4 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl py-10 sm:py-14">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-6">
              <span className="badge badge-soft badge-primary w-fit rounded-full px-3 py-2 font-medium uppercase">
                inFlow Alternative
              </span>
              <h1 className="text-base-content text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                An inFlow alternative that keeps things{' '}
                <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">simple</span>
              </h1>
              <p className="text-base-content/80 text-lg">
                StockZip gives you barcode scanning, offline reliability, and check-in/check-out workflows without the
                complexity of a full ERP. We do fewer things, but do them exceptionally well.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                  <span className="icon-[tabler--player-play] size-5"></span>
                  Watch Demo
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="text-base-content/60 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="icon-[tabler--check] text-success size-4"></span>
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <span className="icon-[tabler--check] text-success size-4"></span>
                  Import from CSV
                </span>
                <span className="flex items-center gap-1">
                  <span className="icon-[tabler--check] text-success size-4"></span>
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Right Content - Problem/Pain visualization */}
            <div className="bg-base-200 rounded-box flex flex-col justify-center p-6 sm:p-8">
              <h2 className="text-base-content text-xl font-semibold">Common inFlow frustrations</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--puzzle] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Too many features you don&apos;t need</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      ERP-style complexity when all you need is fast scanning and accurate counts.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--device-desktop] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Desktop-centric design</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Mobile feels like an afterthought when you need to scan on the floor.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--clock] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Long setup and configuration</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Weeks of setup when you just want to start scanning and tracking.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Comparison Table Section */}
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Quick comparison: StockZip vs inFlow
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              See how StockZip compares for teams that want simplicity over ERP complexity.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content text-left">Category</th>
                  <th className="text-base-content text-left">
                    <span className="text-primary flex items-center gap-2">
                      <span className="icon-[tabler--circle-check] size-5"></span>
                      StockZip
                    </span>
                  </th>
                  <th className="text-base-content text-left">inFlow</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.category}>
                    <td className="text-base-content font-medium">{row.category}</td>
                    <td className="text-base-content/80">
                      <span className="flex items-start gap-2">
                        {row.stockzipWins && (
                          <span className="icon-[tabler--check] text-success mt-0.5 size-4 shrink-0"></span>
                        )}
                        {row.stockzip}
                      </span>
                    </td>
                    <td className="text-base-content/60">{row.inflow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-base-content/50 mt-6 text-center text-sm">
            StockZip and inFlow are trademarks of their respective owners. Comparison based on publicly available
            information as of January 2026.
          </p>
        </div>
      </section>

      {/* Key Differentiators - Based on FlyonUI features-3 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Why teams choose StockZip</h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              StockZip focuses on what small teams actually need: fast scanning, reliable counts, and accountability.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {KEY_DIFFERENTIATORS.map((diff) => (
              <div key={diff.id} className="card card-border bg-base-100 shadow-none">
                <div className="card-body">
                  <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-lg">
                    <span className={`${diff.icon} text-primary size-6`}></span>
                  </div>
                  <h3 className="text-base-content text-xl font-semibold">{diff.title}</h3>
                  <p className="text-base-content/80 mt-2">{diff.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When to Switch / When inFlow Works - Decision helper */}
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* When inFlow works well */}
            <div className="card bg-base-100 shadow-none">
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">When inFlow works well</h2>
                <p className="text-base-content/70 mt-2">inFlow may be the right choice if:</p>
                <ul className="text-base-content/80 mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You need full ERP features (purchasing, sales orders)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Your team works primarily on desktop</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You have time for complex configuration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You don&apos;t need offline mobile scanning</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* When you should switch */}
            <div className="card border-primary/30 bg-base-100 border shadow-none">
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">When you should switch to StockZip</h2>
                <p className="text-base-content/70 mt-2">StockZip is the better choice when:</p>
                <ul className="text-base-content/80 mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want simplicity over ERP complexity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>Your team scans on mobile in the field</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You need offline reliability for warehouses/jobsites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want to be up and running in minutes, not weeks</span>
                  </li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/demo" className="btn btn-primary btn-gradient">
                    Watch demo
                  </Link>
                  <Link href="/pricing" className="btn btn-outline btn-secondary">
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Migration CTA - Based on FlyonUI cta-4 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="bg-base-200 rounded-box p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Simplicity without sacrifice</h2>
                <p className="text-base-content/80 mt-3 text-lg">
                  StockZip focuses on what small teams actually need: fast scanning, reliable counts, and accountability.
                  No weeks of setup, no feature bloat. Start scanning today.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Import CSV in minutes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">No complex configuration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Staff can use it immediately</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Offline-first scanning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Native check-in/check-out</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Predictable pricing</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/solutions/small-business" className="btn btn-outline btn-secondary btn-lg">
                  Small business solution
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Based on FlyonUI faq-1 template */}
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Frequently asked questions about switching from inFlow
            </h2>
            <p className="text-base-content/80 mt-3 text-lg">
              Common questions from teams evaluating StockZip as an inFlow alternative.
            </p>
          </div>

          <div className="divide-base-content/10 divide-y">
            {INFLOW_FAQS.map((faq, index) => (
              <details key={index} className="group py-4" open={index === 0}>
                <summary className="text-base-content flex cursor-pointer list-none items-center justify-between font-medium">
                  {faq.question}
                  <span className="icon-[tabler--plus] group-open:hidden size-5"></span>
                  <span className="icon-[tabler--minus] hidden group-open:block size-5"></span>
                </summary>
                <p className="text-base-content/80 mt-3 pr-8">{faq.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-base-content/70">Have more questions?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/demo" className="btn btn-primary btn-gradient">
                Watch demo
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-secondary">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
            Ready for inventory management that just works?
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
            Join teams who switched from inFlow for simplicity, offline reliability, and pricing that grows with you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/compare" className="btn btn-outline btn-secondary btn-lg">
              See all comparisons
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
