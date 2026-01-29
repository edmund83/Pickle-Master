import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
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

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/compare/boxhero-alternative',
    title: 'BoxHero Alternative | StockZip Offline Barcode Inventory',
    description:
      'Exploring BoxHero alternatives? StockZip is built for offline-first barcode scanning, tool check-in/check-out, and clear pricing for small teams.',
  })
}

// FAQ items following FlyonUI faq-1 template structure
const BOXHERO_FAQS: FaqItem[] = [
  {
    question: 'How is StockZip different from BoxHero?',
    answer:
      'BoxHero is a great fit for straightforward inventory tracking for small teams. StockZip focuses on scan-first, offline-first barcode workflows and tool/asset check-in/check-out accountability.',
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
      'Yes. StockZip uses clear pricing that scales predictably as your catalog grows.',
  },
  {
    question: 'What barcode scanners work with StockZip?',
    answer:
      'StockZip works with your phone camera, Bluetooth barcode scanners, and rugged Android devices with built-in scanners. No proprietary hardware required.',
  },
  {
    question: 'Can I export my data from StockZip anytime?',
    answer:
      'Yes. Export your full inventory as CSV anytime. We believe in data ownership.',
  },
]

// Comparison data following WebsiteGuideline.md comparison template
const COMPARISON_ROWS = [
  {
    category: 'Offline reliability',
    stockzip: 'Offline-first mobile scanning with automatic sync',
    boxhero: 'Cloud-first workflows for teams that work online',
    stockzipWins: true,
  },
  {
    category: 'Check-in / check-out',
    stockzip: 'Native issue/return workflow with due dates and accountability',
    boxhero: 'Straightforward inventory tracking with flexible organization',
    stockzipWins: true,
  },
  {
    category: 'Pricing model',
    stockzip: 'Trust-first pricing with predictable scaling',
    boxhero: 'Plans designed for different team sizes and needs',
    stockzipWins: true,
  },
  {
    category: 'Bulk editing',
    stockzip: 'Excel-grade bulk updates with preview diffs and undo',
    boxhero: 'Simple bulk updates for routine changes',
    stockzipWins: true,
  },
  {
    category: 'Audit trail',
    stockzip: 'Full audit trail with "who changed what" accountability',
    boxhero: 'Activity history to keep teams aligned',
    stockzipWins: true,
  },
  {
    category: 'Migration',
    stockzip: 'CSV import with guided field mapping + verification workflow',
    boxhero: 'CSV export options to help move data',
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
      'Issue tools and assets to staff with a scan. Set due dates, track overdue items, and see exactly who has what.',
  },
  {
    id: 'trust-pricing',
    icon: 'icon-[tabler--currency-dollar]',
    title: 'Trust-First Pricing',
    description:
      'Clear pricing that scales predictably as your catalog grows, so you can budget with confidence.',
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
                trust-first pricing that scales with your business.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="#stockzip-alternative" className="btn btn-primary btn-lg">
                  See StockZip as an alternative
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="#boxhero-fit" className="btn btn-outline btn-secondary btn-lg">
                  When BoxHero is a great fit
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

            {/* Right Content - Competitor-first context */}
            <div className="bg-base-200 rounded-box flex flex-col justify-center p-6 sm:p-8">
              <h2 className="text-base-content text-xl font-semibold">Why teams choose BoxHero</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--rocket] text-success mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Simple setup for small teams</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Get inventory organized quickly and keep everyone aligned.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--list-check] text-success mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Straightforward day-to-day workflows</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      A clean, simple experience for routine inventory tracking.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="icon-[tabler--cloud] text-success mt-0.5 size-5 shrink-0"></span>
                  <div>
                    <span className="text-base-content font-medium">Cloud-first collaboration</span>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Shared visibility that works well for teams managing inventory together.
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
            StockZip is not affiliated with or endorsed by BoxHero. BoxHero is a trademark of its respective owner.
            Comparison is based on publicly available information as of January 2026; features and pricing may change.
          </p>
        </div>
      </section>

      {/* Key Differentiators - Based on FlyonUI features-3 template */}
      <section className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">What StockZip focuses on</h2>
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
      <section id="boxhero-fit" className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 scroll-mt-28">
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
                    <span>You&apos;ve found a plan that fits your catalog size</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--circle-check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>You don&apos;t need detailed audit trails with accountability</span>
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
                    <span>You scan in warehouses or jobsites with unreliable Wi-Fi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You need to track tools/assets checked out to staff</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You want pricing that scales predictably</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="icon-[tabler--alert-triangle] text-warning mt-0.5 size-5 shrink-0"></span>
                    <span>You need &quot;who changed what&quot; accountability for inventory</span>
                  </li>
                </ul>
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
                  A simple way to evaluate StockZip
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
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Based on FlyonUI faq-1 template */}
      <section className="bg-base-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Frequently asked questions about BoxHero alternatives
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
              <Link href="#stockzip-alternative" className="btn btn-primary">
                See StockZip as an alternative
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="stockzip-alternative" className="bg-base-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 scroll-mt-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
            Explore StockZip as a BoxHero alternative
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
            If you like BoxHero&apos;s simplicity and want scan-first, offline-first barcode workflows with check-in/check-out
            accountability, StockZip is worth trying.
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
