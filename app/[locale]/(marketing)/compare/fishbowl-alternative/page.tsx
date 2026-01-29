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
  title: 'Fishbowl Alternative | StockZip Warehouse Barcode Inventory',
  description:
    'Exploring Fishbowl alternatives? StockZip focuses on warehouse barcode scanning, offline-first mobile workflows, and scan-first verification for small teams.',
  pathname: '/compare/fishbowl-alternative',
})

// FAQ items following FlyonUI faq-1 template structure
const FISHBOWL_FAQS: FaqItem[] = [
  {
    question: 'How is StockZip different from Fishbowl?',
    answer:
      'Fishbowl is a comprehensive inventory system used by teams with advanced workflows. StockZip is a focused alternative built for small teams that want warehouse barcode scanning, offline-first mobile workflows, and fast rollout.',
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
    question: 'How does StockZip pricing work?',
    answer: 'StockZip uses clear pricing designed for small teams and predictable growth.',
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
    category: 'Best fit',
    stockzip: 'Small teams wanting scan-first warehouse workflows',
    fishbowl: 'Teams wanting a comprehensive platform for advanced workflows',
    stockzipWins: true,
  },
  {
    category: 'Getting started',
    stockzip: 'Self-serve rollout with CSV import and scanning',
    fishbowl: 'Structured setup for full-featured workflows',
    stockzipWins: true,
  },
  {
    category: 'Mobile scanning',
    stockzip: 'Mobile-first, offline-first scanning',
    fishbowl: 'Configurable warehouse scanning workflows',
    stockzipWins: true,
  },
  {
    category: 'Manufacturing',
    stockzip: 'Focused on inventory tracking',
    fishbowl: 'Manufacturing and BOM capabilities',
    stockzipWins: true,
  },
  {
    category: 'Team scale',
    stockzip: 'Designed for small teams',
    fishbowl: 'Often used by mid-size operations',
    stockzipWins: true,
  },
  {
    category: 'Pricing approach',
    stockzip: 'Clear pricing that scales predictably',
    fishbowl: 'Multiple plan options for different needs',
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
    title: 'Fast rollout',
    description:
      'Import your CSV, label your top movers, and start scanning. Your team can be productive on day one.',
  },
  {
    id: 'predictable-pricing',
    icon: 'icon-[tabler--currency-dollar]',
    title: 'Clear pricing',
    description:
      'Clear pricing designed for small teams, with predictable scaling as your catalog grows.',
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
            'Warehouse barcode inventory management for small teams. A Fishbowl alternative focused on scan-first workflows.',
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
                Fishbowl is a comprehensive inventory system used by teams with advanced workflows. StockZip is a focused
                alternative for small teams that want scan-first warehouse barcode workflows with offline-first mobile
                scanning.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="#stockzip-alternative" className="btn btn-primary btn-lg">
                  See StockZip as an alternative
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="#fishbowl-fit" className="btn btn-outline btn-secondary btn-lg">
                  When Fishbowl works well
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
                  Clear team pricing
                </span>
                <span className="flex items-center gap-1">
                  <span className="icon-[tabler--check] text-success size-4"></span>
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Right Content - Competitor-first context */}
            <div className="bg-base-200 rounded-box flex flex-col justify-center p-6 sm:p-8">
              <h2 className="text-base-content text-xl font-semibold">Why teams choose Fishbowl</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--settings] text-success mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Comprehensive workflows</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Designed for teams that want deeper configuration and advanced operations.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--tools] text-success mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Manufacturing and BOM support</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Useful when your inventory workflows include production and assembly.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--building-factory] text-success mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Built for growing operations</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Often chosen by teams with more locations, products, and process needs.
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
              A quick overview to help you evaluate which product fits your workflows.
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
            StockZip is not affiliated with or endorsed by Fishbowl. Fishbowl is a trademark of its respective owner.
            Comparison is based on publicly available information as of January 2026; features and pricing may change.
          </p>
        </div>
      </section>

      {/* Key Differentiators - Based on FlyonUI features-3 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Why small teams choose StockZip</h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              StockZip is designed for small teams that want warehouse-grade scanning with a staff-friendly experience.
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
      <section id="fishbowl-fit" className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 scroll-mt-28">
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

            {/* When StockZip is a fit */}
            <div className="card border-primary/30 bg-base-100 border shadow-none">
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">When StockZip is a great fit</h2>
                <p className="text-base-content/70 mt-2">StockZip is a great fit when:</p>
                <ul className="text-base-content/80 mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want scan-first warehouse barcode workflows</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want a self-serve setup your team can learn quickly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You need offline mobile scanning for warehouses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want clear pricing that scales predictably</span>
                  </li>
                </ul>
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
              StockZip includes warehouse-grade inventory features in a staff-friendly experience.
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
                      <span className="text-base-content/80">Guided CSV import with field mapping</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Scan-first verification workflow</span>
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
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Based on FlyonUI faq-1 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Frequently asked questions about Fishbowl alternatives
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
              <Link href="#stockzip-alternative" className="btn btn-primary">
                See StockZip as an alternative
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="stockzip-alternative" className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 scroll-mt-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
            Explore StockZip as a Fishbowl alternative
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
            If you want scan-first warehouse barcode workflows with offline-first mobile scanning for a small team, StockZip
            is worth trying.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/demo" className="btn btn-primary btn-lg">
              Watch demo
              <span className="icon-[tabler--player-play] size-5"></span>
            </Link>
            <Link href="/signup" className="btn btn-outline btn-secondary btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
