import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

/**
 * Fishbowl Alternative Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with CTA)
 * - Features: /marketing-ui/features/features-3 (SaaS features with accordion)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: Fishbowl alternative
 * Secondary keywords: warehouse inventory management software with barcode scanner
 */

export const metadata: Metadata = marketingMetadata({
  title: 'Fishbowl alternative',
  description:
    'Looking for a Fishbowl alternative? StockZip offers warehouse inventory management with barcode scanning, offline mode, and simpler pricing for small teams.',
  pathname: '/compare/fishbowl-alternative',
})

// FAQ items following FlyonUI faq-1 template structure
const FISHBOWL_FAQS: FaqItem[] = [
  {
    question: 'How is StockZip different from Fishbowl?',
    answer:
      'StockZip is designed for small teams that need warehouse scanning and accountability without the complexity and cost of enterprise software like Fishbowl. We focus on core inventory accuracy, not ERP features.',
  },
  {
    question: 'Does StockZip integrate with QuickBooks?',
    answer:
      'QuickBooks integration is on our roadmap. StockZip focuses on core inventory accuracy first, with accounting integrations coming soon. You can export data as CSV for accounting workflows.',
  },
  {
    question: 'Can StockZip handle warehouse inventory management?',
    answer:
      'Yes. StockZip supports multi-location hierarchies (warehouse → shelf → bin), barcode scanning, cycle counts, receiving workflows, and full audit trails for warehouse operations.',
  },
  {
    question: 'Is StockZip cheaper than Fishbowl?',
    answer:
      'StockZip uses trust-first pricing designed for small teams. No enterprise licensing fees, no per-seat costs that scale unpredictably, no implementation consultants required.',
  },
  {
    question: 'Can I migrate from Fishbowl to StockZip?',
    answer:
      'Yes. Export your Fishbowl data as CSV, import into StockZip with our guided field mapping, and verify with a scan-first count. We help with complex migrations if needed.',
  },
  {
    question: 'Does StockZip work offline in warehouses?',
    answer:
      'Yes. StockZip is built offline-first so scanning works in warehouses with unreliable Wi-Fi. Changes sync automatically when you reconnect.',
  },
  {
    question: 'Does StockZip have manufacturing and BOM features?',
    answer:
      'StockZip focuses on inventory tracking, not manufacturing. If you need Bill of Materials and manufacturing features, Fishbowl may be a better fit. We do what we do exceptionally well.',
  },
]

// Comparison data following WebsiteGuideline.md comparison template
const COMPARISON_ROWS = [
  {
    category: 'Target audience',
    stockzip: 'Small teams and growing businesses',
    fishbowl: 'Mid-market and enterprise companies',
    stockzipWins: true,
  },
  {
    category: 'Complexity',
    stockzip: 'Simple, staff-friendly interface',
    fishbowl: 'Full-featured with steep learning curve',
    stockzipWins: true,
  },
  {
    category: 'Pricing model',
    stockzip: 'Trust-first, predictable scaling',
    fishbowl: 'Enterprise licensing with per-seat costs',
    stockzipWins: true,
  },
  {
    category: 'Mobile scanning',
    stockzip: 'Offline-first, camera + Bluetooth scanners',
    fishbowl: 'Mobile app with hardware requirements',
    stockzipWins: true,
  },
  {
    category: 'Setup time',
    stockzip: 'Import and scan in minutes',
    fishbowl: 'Days to weeks for full implementation',
    stockzipWins: true,
  },
  {
    category: 'Check-in / check-out',
    stockzip: 'Native asset workflow with accountability',
    fishbowl: 'Requires additional modules',
    stockzipWins: true,
  },
]

// Key differentiators for the features section (FlyonUI features-3 pattern)
const KEY_DIFFERENTIATORS = [
  {
    id: 'right-sized',
    icon: 'icon-[tabler--target]',
    title: 'Right-Sized for Small Teams',
    description:
      'Fishbowl is powerful software built for mid-market companies. If you are a smaller team that just needs reliable scanning, counts, and accountability — StockZip is purpose-built for you.',
  },
  {
    id: 'fast-setup',
    icon: 'icon-[tabler--rocket]',
    title: 'Minutes, Not Weeks',
    description:
      'No implementation consultants. No weeks of training. Import your CSV, label your top movers, and start scanning. Your team can be productive on day one.',
  },
  {
    id: 'predictable-pricing',
    icon: 'icon-[tabler--currency-dollar]',
    title: 'No Enterprise Pricing',
    description:
      'No per-seat licensing that scales unpredictably. No surprise tier jumps. StockZip uses trust-first pricing that stays fair as your business grows.',
  },
]

export default function FishbowlAlternativePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Compare', pathname: '/compare' },
          { name: 'Fishbowl alternative', pathname: '/compare/fishbowl-alternative' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description:
            'Warehouse inventory management with barcode scanning for small teams. A Fishbowl alternative without enterprise complexity.',
          pathname: '/compare/fishbowl-alternative',
        })}
      />
      <JsonLd data={faqPageJsonLd(FISHBOWL_FAQS)} />

      {/* Hero Section - Based on FlyonUI hero-12 template */}
      <section className="bg-base-100 px-4 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl py-10 sm:py-14">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-6">
              <span className="badge badge-soft badge-primary w-fit rounded-full px-3 py-2 font-medium uppercase">
                Fishbowl Alternative
              </span>
              <h1 className="text-base-content text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                A Fishbowl alternative for{' '}
                <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                  small teams
                </span>
              </h1>
              <p className="text-base-content/80 text-lg">
                StockZip gives you warehouse inventory management with barcode scanning — without the enterprise
                complexity and pricing of Fishbowl. Right-sized for growing businesses.
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
                  No per-seat licensing
                </span>
                <span className="flex items-center gap-1">
                  <span className="icon-[tabler--check] text-success size-4"></span>
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Right Content - Problem/Pain visualization */}
            <div className="bg-base-200 rounded-box flex flex-col justify-center p-6 sm:p-8">
              <h2 className="text-base-content text-xl font-semibold">Common Fishbowl frustrations</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--building-2] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Overkill for your team size</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Enterprise features you don&apos;t need when you just want scanning and counts.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--receipt-2] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Complex pricing and licensing</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Per-seat costs, implementation fees, and unpredictable scaling.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--calendar-time] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Long implementation timeline</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Weeks or months to get fully operational with training requirements.
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
              Quick comparison: StockZip vs Fishbowl
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              See how StockZip compares for teams that don&apos;t need enterprise-grade complexity.
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
                  <th className="text-base-content text-left">Fishbowl</th>
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
                    <td className="text-base-content/60">{row.fishbowl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-base-content/50 mt-6 text-center text-sm">
            StockZip and Fishbowl are trademarks of their respective owners. Comparison based on publicly available
            information as of January 2026.
          </p>
        </div>
      </section>

      {/* Key Differentiators - Based on FlyonUI features-3 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Why small teams choose StockZip</h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              StockZip is purpose-built for teams that need warehouse-grade features without enterprise overhead.
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

      {/* When to Switch / When Fishbowl Works - Decision helper */}
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* When Fishbowl works well */}
            <div className="card bg-base-100 shadow-none">
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">When Fishbowl works well</h2>
                <p className="text-base-content/70 mt-2">Fishbowl may be the right choice if:</p>
                <ul className="text-base-content/80 mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You need deep QuickBooks integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You have IT resources for implementation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You need manufacturing/BOM features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Your budget supports enterprise licensing</span>
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
                    <span>Fishbowl is overkill for your team size</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want faster setup without consultants</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You need offline mobile scanning for warehouses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want predictable pricing without per-seat fees</span>
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

      {/* Warehouse Features Section */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Warehouse-grade features, small-team simplicity
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              StockZip includes the warehouse inventory management features you need without the enterprise overhead.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="icon-[tabler--building-warehouse] text-primary mt-0.5 size-6"></span>
              <div>
                <h3 className="text-base-content font-semibold">Multi-location hierarchy</h3>
                <p className="text-base-content/70 mt-1 text-sm">Warehouse → shelf → bin organization</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="icon-[tabler--scan] text-primary mt-0.5 size-6"></span>
              <div>
                <h3 className="text-base-content font-semibold">Barcode scanning</h3>
                <p className="text-base-content/70 mt-1 text-sm">Camera, Bluetooth, and rugged devices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="icon-[tabler--clipboard-check] text-primary mt-0.5 size-6"></span>
              <div>
                <h3 className="text-base-content font-semibold">Cycle counts</h3>
                <p className="text-base-content/70 mt-1 text-sm">Regular verification workflows</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="icon-[tabler--package-import] text-primary mt-0.5 size-6"></span>
              <div>
                <h3 className="text-base-content font-semibold">Receiving workflows</h3>
                <p className="text-base-content/70 mt-1 text-sm">Scan in new inventory with verification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="icon-[tabler--history] text-primary mt-0.5 size-6"></span>
              <div>
                <h3 className="text-base-content font-semibold">Full audit trail</h3>
                <p className="text-base-content/70 mt-1 text-sm">Who changed what, and when</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-6"></span>
              <div>
                <h3 className="text-base-content font-semibold">Offline reliability</h3>
                <p className="text-base-content/70 mt-1 text-sm">Scan without internet, sync later</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Migration CTA - Based on FlyonUI cta-4 template */}
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="bg-base-100 rounded-box p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Right-sized for small teams
                </h2>
                <p className="text-base-content/80 mt-3 text-lg">
                  Fishbowl is powerful software built for mid-market companies. If you&apos;re a smaller team that just
                  needs reliable scanning, counts, and accountability — StockZip is purpose-built for you.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">No implementation consultants</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">No per-seat licensing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Import and scan in minutes</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Warehouse-grade features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Offline-first scanning</span>
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
                <Link href="/solutions/warehouse-inventory" className="btn btn-outline btn-secondary btn-lg">
                  Warehouse solution
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Based on FlyonUI faq-1 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Frequently asked questions about switching from Fishbowl
            </h2>
            <p className="text-base-content/80 mt-3 text-lg">
              Common questions from teams evaluating StockZip as a Fishbowl alternative.
            </p>
          </div>

          <div className="divide-base-content/10 divide-y">
            {FISHBOWL_FAQS.map((faq, index) => (
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
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
            Get warehouse-grade features without enterprise overhead
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
            Join teams who switched from Fishbowl for simpler pricing, faster setup, and the features they actually
            need.
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
