/**
 * Solutions Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (solution cards grid with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory management software use cases"
 * Secondary keywords: warehouse inventory tracking, ecommerce inventory management, tool tracking software
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, softwareApplicationJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/solutions',
    title: 'Inventory Management Software Use Cases',
    description:
      'Find the right inventory solution for warehouses, ecommerce, construction, small business, and mobile teams. Barcode scanning, offline mode, and team accountability.',
  })
}

const SOLUTIONS = [
  {
    title: 'Warehouse Inventory',
    description:
      'Receive shipments, run cycle counts, and pick orders with scan-first workflows. Works offline in dead zones.',
    href: '/solutions/warehouse-inventory',
    icon: 'icon-[tabler--building-warehouse]',
    keywords: 'warehouse inventory tracking, receiving, cycle counts',
  },
  {
    title: 'Ecommerce Inventory',
    description:
      'Keep accurate stock counts across locations and channels. Prevent stockouts and overselling with real-time sync.',
    href: '/solutions/ecommerce-inventory',
    icon: 'icon-[tabler--shopping-cart]',
    keywords: 'ecommerce inventory management, multi-channel stock',
  },
  {
    title: 'Construction & Tools',
    description:
      'Issue tools to crew members by scan. Track what is out, who has it, and when it is due back. Stop losses.',
    href: '/solutions/construction-tools',
    icon: 'icon-[tabler--hammer]',
    keywords: 'tool tracking software, check-in/check-out, jobsite',
  },
  {
    title: 'Small Business',
    description:
      'Replace spreadsheets without training your whole team. Simple inventory tracking that grows with you.',
    href: '/solutions/small-business',
    icon: 'icon-[tabler--building-store]',
    keywords: 'simple inventory tracking, replace spreadsheets',
  },
  {
    title: 'Mobile Inventory App',
    description:
      'Scan barcodes and manage inventory from any Android or iOS device. Full offline mode for field teams.',
    href: '/solutions/mobile-inventory-app',
    icon: 'icon-[tabler--device-mobile]',
    keywords: 'inventory app android, offline inventory app',
  },
]

const FAQS: FaqItem[] = [
  {
    question: 'Which inventory solution is right for my business?',
    answer:
      'It depends on your primary workflow. Warehouses benefit from receiving and cycle count features. Ecommerce sellers need multi-location stock sync. Construction teams need tool check-in/check-out. Small businesses usually start with basic inventory tracking and grow from there. The good news: StockZip includes all these capabilities in every plan, so you can use multiple solutions as your needs evolve.',
  },
  {
    question: 'Can I use StockZip for multiple use cases at once?',
    answer:
      'Yes. Many customers use StockZip across different workflows — for example, a contractor might use tool tracking for equipment, warehouse features for materials, and the mobile app for field crews. All features are included in every plan with no add-on fees.',
  },
  {
    question: 'Does StockZip work offline for warehouse and field teams?',
    answer:
      'Yes. StockZip is built offline-first specifically for environments with unreliable connectivity — warehouses with metal racking, construction jobsites, basements, and rural areas. Scan barcodes, adjust quantities, and check items in/out even without internet. Changes sync automatically when you reconnect.',
  },
  {
    question: 'What barcode scanners work with StockZip inventory software?',
    answer:
      'StockZip supports three scanning methods: (1) Phone cameras for 1D barcodes and QR codes, (2) Bluetooth barcode scanners from Socket Mobile, Zebra, and Honeywell for faster high-volume scanning, and (3) Rugged Android devices with built-in hardware scanners. Use whatever fits your workflow.',
  },
  {
    question: 'How do I migrate from spreadsheets to StockZip?',
    answer:
      'Import your existing inventory via CSV in minutes. StockZip provides templates and field mapping to match your current data structure. Most teams are up and running in under 30 minutes.',
  },
  {
    question: 'Is there a free trial for StockZip inventory software?',
    answer:
      'Yes. Every plan includes a 14-day free trial with full access to all features. No credit card required to start. Import your inventory, test barcode scanning, and run your workflows before you commit.',
  },
  {
    question: 'How does StockZip pricing compare to other inventory software?',
    answer:
      'StockZip uses trust-first pricing with no surprise tier jumps or hard SKU limits. You get unlimited items on all plans. Pricing scales fairly based on team size, not inventory volume. Check our pricing page for current plans.',
  },
  {
    question: 'Can I track inventory across multiple locations?',
    answer:
      'Yes. StockZip supports unlimited locations with full hierarchy: warehouses, zones, aisles, racks, shelves, and bins. Track stock levels per location, transfer items between locations, and run reports by location. All plans include multi-location support.',
  },
]

export default function SolutionsPage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory Solutions',
          description:
            'Inventory management software for warehouses, ecommerce, construction, small business, and mobile teams.',
          pathname: '/solutions',
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">
              Solutions
            </span>
            <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Inventory Management Software for Every Use Case
            </h1>
            <p className="text-base-content/80 mt-6 max-w-3xl text-lg md:text-xl">
              Whether you run a warehouse, sell online, manage tools, or just need to replace spreadsheets — StockZip
              adapts to how you work. Barcode scanning, offline reliability, and pricing that does not punish growth.
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
                <span className="icon-[tabler--building] text-primary size-5"></span>
                <span className="text-base-content/70">Multi-location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--history] text-primary size-5"></span>
                <span className="text-base-content/70">Full audit trail</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOLUTIONS GRID SECTION (MCP: features-8) ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Find Your Inventory Solution</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Click to explore how StockZip works for your industry. Every solution includes barcode scanning, offline
              mode, and team accountability.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((solution) => (
              <Link
                key={solution.href}
                href={solution.href}
                className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
              >
                <div className="card-body">
                  <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                    <span className={`${solution.icon} text-primary size-7`}></span>
                  </div>
                  <h3 className="text-base-content mt-4 text-xl font-semibold">{solution.title}</h3>
                  <p className="text-base-content/80 mt-2">{solution.description}</p>
                  <span className="link link-primary link-animated mt-4 inline-flex items-center gap-1">
                    Learn more
                    <span className="icon-[tabler--arrow-right] size-4"></span>
                  </span>
                </div>
              </Link>
            ))}

            {/* Browse All Features Card */}
            <Link
              href="/features"
              className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--list-details] text-primary size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">Browse All Features</h3>
                <p className="text-base-content/80 mt-2">
                  Explore barcode scanning, low stock alerts, bulk editing, and more core features included in every
                  plan.
                </p>
                <span className="link link-primary link-animated mt-4 inline-flex items-center gap-1">
                  View features
                  <span className="icon-[tabler--arrow-right] size-4"></span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 3 CORE PROMISES SECTION ===== */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">What Makes StockZip Different</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Three promises we keep for every solution, every customer, every day.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-success/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <span className="icon-[tabler--bolt] text-success size-8"></span>
              </div>
              <h3 className="text-base-content mt-6 text-xl font-semibold">Speed</h3>
              <p className="text-base-content/80 mt-3">
                Scan → update → done. Add, find, and adjust items in seconds on mobile or desktop. No waiting, no lag,
                no complexity.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-info/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <span className="icon-[tabler--target] text-info size-8"></span>
              </div>
              <h3 className="text-base-content mt-6 text-xl font-semibold">Accuracy</h3>
              <p className="text-base-content/80 mt-3">
                Real-time stock counts you can trust. Every change is logged with who, when, and why. Full audit trail
                for accountability.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <span className="icon-[tabler--sparkles] text-accent size-8"></span>
              </div>
              <h3 className="text-base-content mt-6 text-xl font-semibold">Simplicity</h3>
              <p className="text-base-content/80 mt-3">
                Not an ERP. Minimal setup, staff-friendly UI. Your whole team can use StockZip in minutes without
                training manuals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY NOT SPREADSHEETS SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Why Not Spreadsheets?</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Spreadsheets work until they do not. Here is what you gain with dedicated inventory software.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-base-content/10">
              <div className="grid grid-cols-3 bg-base-100">
                <div className="border-b border-r border-base-content/10 p-4 font-semibold"></div>
                <div className="border-b border-r border-base-content/10 p-4 text-center font-semibold">
                  <span className="text-error">Spreadsheets</span>
                </div>
                <div className="border-b border-base-content/10 p-4 text-center font-semibold">
                  <span className="text-success">StockZip</span>
                </div>
              </div>

              {[
                { feature: 'Multi-user editing', spreadsheet: 'Conflicts & overwrites', stockzip: 'Real-time sync' },
                { feature: 'Mobile access', spreadsheet: 'Clunky on phones', stockzip: 'Touch-first design' },
                { feature: 'Barcode scanning', spreadsheet: 'Manual entry', stockzip: 'Scan to update' },
                { feature: 'Offline mode', spreadsheet: 'Requires internet', stockzip: 'Works anywhere' },
                { feature: 'Audit trail', spreadsheet: 'No history', stockzip: 'Every change logged' },
                { feature: 'Low stock alerts', spreadsheet: 'Manual checking', stockzip: 'Automatic notifications' },
              ].map((row, index) => (
                <div key={index} className="grid grid-cols-3 bg-base-100">
                  <div className="border-b border-r border-base-content/10 p-4 font-medium">{row.feature}</div>
                  <div className="border-b border-r border-base-content/10 p-4 text-center">
                    <span className="text-base-content/60">{row.spreadsheet}</span>
                  </div>
                  <div className="border-b border-base-content/10 p-4 text-center">
                    <span className="flex items-center justify-center gap-2">
                      <span className="icon-[tabler--check] text-success size-5"></span>
                      <span className="text-base-content/80">{row.stockzip}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/learn/perpetual-vs-periodic-inventory" className="link link-primary">
                Learn more about inventory management approaches →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (MCP: cta-4) ===== */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-base-200 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex grow flex-col gap-6">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Ready to find your inventory solution?
                </h2>
                <p className="text-base-content/80 max-w-2xl text-lg">
                  Start with a free trial. Import your items, test barcode scanning, and see which solution fits your
                  workflow.
                </p>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">14-day free trial</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">No credit card required</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Unlimited items on all plans</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Import from CSV</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Works on any device</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Cancel anytime</span>
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

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={FAQS} />
    </div>
  )
}
