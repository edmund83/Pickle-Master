import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

/**
 * BoxHero Alternative Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with CTA)
 * - Features: /marketing-ui/features/features-3 (SaaS features with accordion)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: BoxHero alternative
 * Secondary keywords: barcode inventory tracking software, offline inventory app
 */

export const metadata: Metadata = marketingMetadata({
  title: 'BoxHero alternative',
  description:
    'Switch from BoxHero to StockZip for offline-first barcode scanning, real check-in/check-out workflows, and trust-first pricing designed for growing teams.',
  pathname: '/compare/boxhero-alternative',
})

// FAQ items following FlyonUI faq-1 template structure
const BOXHERO_FAQS: FaqItem[] = [
  {
    question: 'How is StockZip different from BoxHero?',
    answer:
      'StockZip focuses on offline-first reliability, native check-in/check-out workflows, and trust-first pricing that scales predictably as your catalog grows. Unlike BoxHero, StockZip works seamlessly in warehouses and jobsites with unreliable internet.',
  },
  {
    question: 'Can I scan barcodes offline with StockZip?',
    answer:
      'Yes. StockZip is built for offline-first mobile workflows so scanning and updates work in warehouses, jobsites, and areas with unreliable Wi-Fi. Changes sync automatically when you reconnect.',
  },
  {
    question: 'Does StockZip support check-in/check-out for tools and assets?',
    answer:
      'Yes. StockZip has a native issue/return workflow where you can assign items to staff, set due dates, track overdue items, and maintain full accountability for who has what.',
  },
  {
    question: 'How long does it take to migrate from BoxHero?',
    answer:
      'Most teams can export from BoxHero, import via CSV, and run a verification count in under an hour. We provide guided field mapping and help with complex migrations.',
  },
  {
    question: 'Is StockZip pricing predictable?',
    answer:
      'Yes. StockZip uses trust-first pricing with no surprise tier jumps or hard SKU limits that force expensive upgrades as your business grows. Your price stays predictable.',
  },
  {
    question: 'What barcode scanners work with StockZip?',
    answer:
      'StockZip works with your phone camera, Bluetooth barcode scanners, and rugged Android devices with built-in scanners. No proprietary hardware required.',
  },
  {
    question: 'Can I export my data from StockZip anytime?',
    answer:
      'Yes. Your data belongs to you. Export your full inventory as CSV anytime with no restrictions or fees. We believe in data ownership.',
  },
]

// Comparison data following WebsiteGuideline.md comparison template
const COMPARISON_ROWS = [
  {
    category: 'Offline reliability',
    stockzip: 'Offline-first mobile scanning with automatic sync',
    boxhero: 'Requires stable internet for real-time updates',
    stockzipWins: true,
  },
  {
    category: 'Check-in / check-out',
    stockzip: 'Native issue/return workflow with due dates and accountability',
    boxhero: 'Limited asset tracking workflows',
    stockzipWins: true,
  },
  {
    category: 'Pricing model',
    stockzip: 'Trust-first pricing with predictable scaling',
    boxhero: 'Tiered pricing with feature gating',
    stockzipWins: true,
  },
  {
    category: 'Bulk editing',
    stockzip: 'Excel-grade bulk updates with preview diffs and undo',
    boxhero: 'Standard bulk operations',
    stockzipWins: true,
  },
  {
    category: 'Audit trail',
    stockzip: 'Full audit trail with "who changed what" accountability',
    boxhero: 'Basic activity logging',
    stockzipWins: true,
  },
  {
    category: 'Migration',
    stockzip: 'CSV import with guided field mapping + verification workflow',
    boxhero: 'Standard export options',
    stockzipWins: true,
  },
]

// Key differentiators for the features section (FlyonUI features-3 pattern)
const KEY_DIFFERENTIATORS = [
  {
    id: 'offline-first',
    icon: 'icon-[tabler--wifi-off]',
    title: 'Offline-First Scanning',
    description:
      'Scan barcodes, adjust quantities, and check items in/out even without internet. Changes sync automatically when you reconnect. Built for warehouses, jobsites, and basements where Wi-Fi is unreliable.',
  },
  {
    id: 'check-in-out',
    icon: 'icon-[tabler--arrows-exchange]',
    title: 'Native Check-In/Check-Out',
    description:
      'Issue tools and assets to staff with a scan. Set due dates, track overdue items, and see exactly who has what. No folder hacks or workarounds needed.',
  },
  {
    id: 'trust-pricing',
    icon: 'icon-[tabler--currency-dollar]',
    title: 'Trust-First Pricing',
    description:
      'No surprise tier jumps. No hard SKU limits that force expensive upgrades. Your price scales predictably as your catalog grows, so you can focus on your business.',
  },
]

export default function BoxHeroAlternativePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Compare', pathname: '/compare' },
          { name: 'BoxHero alternative', pathname: '/compare/boxhero-alternative' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description:
            'Barcode inventory management with offline scanning and check-in/check-out workflows. A BoxHero alternative for small teams.',
          pathname: '/compare/boxhero-alternative',
        })}
      />
      <JsonLd data={faqPageJsonLd(BOXHERO_FAQS)} />

      {/* Hero Section - Based on FlyonUI hero-12 template */}
      <section className="bg-base-100 px-4 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl py-10 sm:py-14">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-6">
              <span className="badge badge-soft badge-primary w-fit rounded-full px-3 py-2 font-medium uppercase">
                BoxHero Alternative
              </span>
              <h1 className="text-base-content text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                A BoxHero alternative with{' '}
                <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                  offline reliability
                </span>
              </h1>
              <p className="text-base-content/80 text-lg">
                StockZip is built for barcode scanning that works offline, with native check-in/check-out workflows and
                trust-first pricing that scales with your business. No surprise tier jumps. No internet dependency.
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
              <h2 className="text-base-content text-xl font-semibold">Common BoxHero frustrations</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--wifi-off] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Scanning fails without internet</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      In warehouses and jobsites with poor connectivity, you lose real-time updates.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--tool] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">No proper tool check-out tracking</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Workarounds and folder hacks to track who has what equipment.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--trending-up] text-error mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Pricing jumps as you grow</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Hit a tier limit and suddenly face expensive upgrades.
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
              Quick comparison: StockZip vs BoxHero
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              See how StockZip compares for small teams that need reliable scanning and accountability.
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
                  <th className="text-base-content text-left">BoxHero</th>
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
                    <td className="text-base-content/60">{row.boxhero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-base-content/50 mt-6 text-center text-sm">
            StockZip and BoxHero are trademarks of their respective owners. Comparison based on publicly available
            information as of January 2026.
          </p>
        </div>
      </section>

      {/* Key Differentiators - Based on FlyonUI features-3 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Why teams switch to StockZip</h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-2xl text-lg">
              StockZip is purpose-built for teams that need reliability, accountability, and predictable pricing.
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

      {/* When to Switch / When BoxHero Works - Decision helper */}
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* When BoxHero works well */}
            <div className="card bg-base-100 shadow-none">
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">When BoxHero works well</h2>
                <p className="text-base-content/70 mt-2">BoxHero may be sufficient if:</p>
                <ul className="text-base-content/80 mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You always have reliable internet connectivity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You don&apos;t need tool/asset check-in/check-out tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Your catalog fits comfortably within their tier limits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You don&apos;t need detailed audit trails with accountability</span>
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
                    <span>You scan in warehouses or jobsites with unreliable Wi-Fi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You need to track tools/assets checked out to staff</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want pricing that scales predictably without tier jumps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You need &quot;who changed what&quot; accountability for inventory</span>
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
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Ready to switch from BoxHero?
                </h2>
                <p className="text-base-content/80 mt-3 text-lg">
                  Export your BoxHero data as CSV, import into StockZip, and run one scan-first verification count. Most
                  teams are up and running in under an hour.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">CSV import with field mapping</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">No data left behind</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Verification workflow included</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Migration support available</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Keep your item history</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5"></span>
                      <span className="text-base-content/80">Start scanning same day</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary btn-lg">
                  Barcode scanning
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
              Frequently asked questions about switching from BoxHero
            </h2>
            <p className="text-base-content/80 mt-3 text-lg">
              Common questions from teams evaluating StockZip as a BoxHero alternative.
            </p>
          </div>

          <div className="divide-base-content/10 divide-y">
            {BOXHERO_FAQS.map((faq, index) => (
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
            Stop fighting unreliable scanning. Start with StockZip.
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
            Join teams who switched from BoxHero for offline reliability, native check-in/check-out, and pricing that
            grows with you.
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
