/**
 * Learn Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory management guides"
 * Secondary keywords: perpetual vs periodic inventory, reorder points, inventory best practices
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/learn',
    title: 'Inventory Management Guides',
    description:
      'Learn inventory management with practical guides, templates, and tools for perpetual vs periodic systems, reorder points, and barcode workflows.',
  })
}

const LEARN_FAQS: FaqItem[] = [
  {
    question: 'What will I learn from these guides?',
    answer:
      'You’ll find practical inventory management guidance: perpetual vs periodic systems, setting reorder points, barcode scanning workflows, cycle counting, and more. We also link to templates, tools, and glossary definitions to help you apply what you learn.',
  },
  {
    question: 'Which guide should I read first?',
    answer:
      'Start with "Perpetual vs periodic inventory" to understand the fundamentals. Then move to "How to set reorder points" for practical setup advice. Both guides work together to help you build accurate inventory habits.',
  },
  {
    question: 'Are these guides free?',
    answer:
      'Yes, all guides are completely free. We believe in helping teams improve their inventory management, whether or not they use StockZip.',
  },
  {
    question: 'Do I need StockZip to use these guides?',
    answer:
      'No. While we show examples using StockZip, the concepts apply to any inventory system — spreadsheets, other software, or pen and paper. The principles of accuracy and workflow design are universal.',
  },
  {
    question: 'How often are guides updated?',
    answer:
      'We update guides whenever best practices change or we get feedback from readers. Each guide shows a "last updated" date so you know the content is current.',
  },
  {
    question: 'Can I suggest a guide topic?',
    answer:
      'Absolutely. We prioritize guides based on what teams actually need. Reach out through our contact page or in-app chat to suggest topics.',
  },
]

const GUIDES = [
  {
    title: "Perpetual vs Periodic Inventory: What's the Difference?",
    description:
      'A practical guide for small businesses: definitions, pros/cons, and which system is easier to keep accurate.',
    href: '/learn/guide/perpetual-vs-periodic-inventory',
    icon: 'icon-[tabler--exchange]',
    readTime: '8 min read',
  },
  {
    title: 'How to Set Reorder Points and Low Stock Alerts',
    description:
      'Calculate reorder points, set up low stock alerts, and prevent stockouts. A practical formula for small teams.',
    href: '/learn/guide/how-to-set-reorder-points',
    icon: 'icon-[tabler--alert-triangle]',
    readTime: '10 min read',
  },
]

const TEMPLATES = [
  {
    title: 'Inventory Spreadsheet Template',
    description: 'Ready-to-use spreadsheet with 12 essential columns. Import directly into StockZip.',
    href: '/templates/inventory-spreadsheet',
    icon: 'icon-[tabler--file-spreadsheet]',
  },
  {
    title: 'Cycle Count Sheet Template',
    description: 'Weekly and monthly cycle count schedules with ABC analysis and zone rotation strategies.',
    href: '/templates/cycle-count-sheet',
    icon: 'icon-[tabler--clipboard-check]',
  },
]

const TOOLS = [
  {
    title: 'Reorder Point Calculator',
    description: 'Calculate optimal reorder points based on lead time, demand, and safety stock.',
    href: '/tools/reorder-point-calculator',
    icon: 'icon-[tabler--calculator]',
  },
]

const GLOSSARY_FEATURED = [
  {
    title: 'Inventory Turnover',
    description: 'Learn the formula, see industry benchmarks, and discover how to improve your turnover ratio.',
    href: '/glossary/inventory-turnover',
    icon: 'icon-[tabler--refresh]',
  },
  {
    title: 'Economic Order Quantity (EOQ)',
    description: 'The classic formula for calculating optimal order quantities to minimize costs.',
    href: '/glossary/economic-order-quantity',
    icon: 'icon-[tabler--math-function]',
  },
]

const WHAT_YOU_LEARN = [
  {
    title: 'Inventory Best Practices',
    description: 'Learn proven methods for keeping inventory accurate without enterprise complexity.',
    icon: 'icon-[tabler--certificate]',
  },
  {
    title: 'Perpetual vs Periodic Systems',
    description: 'Understand the difference and choose the right approach for your team size.',
    icon: 'icon-[tabler--arrows-exchange]',
  },
  {
    title: 'Reorder Points & Alerts',
    description: 'Calculate when to reorder and set up alerts to prevent stockouts.',
    icon: 'icon-[tabler--bell-ringing]',
  },
  {
    title: 'Barcode Workflow Tips',
    description: 'Speed up inventory updates with scan-first workflows that reduce errors.',
    icon: 'icon-[tabler--scan]',
  },
]

export default function LearnPage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory Guides',
          description:
            'Inventory management guides, templates, and tools covering perpetual vs periodic systems, reorder points, barcode workflows, and best practices for small teams.',
          pathname: '/learn',
        })}
      />
      <JsonLd data={faqPageJsonLd(LEARN_FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">Learn</span>
              <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Inventory Management Guides for Small Teams
              </h1>
              <p className="text-base-content/80 mt-6 text-lg md:text-xl">
                Short, practical guides for people who manage real inventory. No enterprise jargon — just clear advice
                for warehouses, small retail, construction tools, and ecommerce.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="#guides" className="btn btn-primary btn-lg">
                  Browse Guides
                  <span className="icon-[tabler--arrow-down] size-5"></span>
                </Link>
                <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                  Watch Demo
                </Link>
              </div>
            </div>
            {/* Hero Image Placeholder */}
            <div className="bg-base-200 flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-2xl border border-base-content/10 lg:aspect-square">
              <div className="text-center p-8">
                <span className="icon-[tabler--book-2] text-primary/30 size-24"></span>
                <p className="text-base-content/40 mt-4 text-sm">Person reading inventory guide on tablet</p>
                <p className="text-base-content/30 mt-1 text-xs">Image placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU'LL LEARN SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              What You&apos;ll Learn About Inventory Best Practices
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Each guide is written for busy teams who need clear, actionable advice.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_YOU_LEARN.map((item) => (
              <div key={item.title} className="card bg-base-100 shadow-sm">
                <div className="card-body items-center text-center">
                  <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                    <span className={`${item.icon} text-primary size-7`}></span>
                  </div>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="text-base-content/70 mt-2 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GUIDES SECTION ===== */}
      <section id="guides" className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary text-sm font-medium uppercase">Guides</p>
              <h2 className="text-base-content mt-1 text-2xl font-semibold md:text-3xl">Practical Inventory Guides</h2>
            </div>
            <Link href="/learn/guide" className="link link-primary hidden sm:inline-flex items-center gap-1">
              View all guides
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {GUIDES.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="card card-border shadow-none hover:border-primary hover:shadow-md transition-all duration-300"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <span className={`${guide.icon} text-primary size-6`}></span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base-content text-xl font-semibold">{guide.title}</h3>
                      <p className="text-base-content/80 mt-2">{guide.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-base-content/50 text-sm">{guide.readTime}</span>
                        <span className="link link-primary link-animated">Read guide →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/learn/guide" className="link link-primary inline-flex items-center gap-1">
              View all guides
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TEMPLATES SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success text-sm font-medium uppercase">Templates</p>
              <h2 className="text-base-content mt-1 text-2xl font-semibold md:text-3xl">Downloadable Templates</h2>
            </div>
            <Link href="/learn/templates" className="link link-primary hidden sm:inline-flex items-center gap-1">
              View all templates
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {TEMPLATES.map((template) => (
              <Link
                key={template.href}
                href={template.href}
                className="card card-border shadow-none hover:border-success hover:shadow-md transition-all duration-300"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="bg-success/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <span className={`${template.icon} text-success size-6`}></span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base-content text-xl font-semibold">{template.title}</h3>
                      <p className="text-base-content/80 mt-2">{template.description}</p>
                      <div className="mt-4">
                        <span className="link link-success link-animated">Download template →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/learn/templates" className="link link-primary inline-flex items-center gap-1">
              View all templates
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TOOLS SECTION ===== */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-info text-sm font-medium uppercase">Tools</p>
              <h2 className="text-base-content mt-1 text-2xl font-semibold md:text-3xl">Interactive Calculators</h2>
            </div>
            <Link href="/learn/tools" className="link link-primary hidden sm:inline-flex items-center gap-1">
              View all tools
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="card card-border shadow-none hover:border-info hover:shadow-md transition-all duration-300"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="bg-info/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <span className={`${tool.icon} text-info size-6`}></span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base-content text-xl font-semibold">{tool.title}</h3>
                      <p className="text-base-content/80 mt-2">{tool.description}</p>
                      <div className="mt-4">
                        <span className="link link-info link-animated">Use calculator →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/learn/tools" className="link link-primary inline-flex items-center gap-1">
              View all tools
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== GLOSSARY SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent text-sm font-medium uppercase">Glossary</p>
              <h2 className="text-base-content mt-1 text-2xl font-semibold md:text-3xl">Key Inventory Terms</h2>
            </div>
            <Link href="/learn/glossary" className="link link-primary hidden sm:inline-flex items-center gap-1">
              View all terms
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {GLOSSARY_FEATURED.map((term) => (
              <Link
                key={term.href}
                href={term.href}
                className="card card-border shadow-none hover:border-accent hover:shadow-md transition-all duration-300"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <span className={`${term.icon} text-accent size-6`}></span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base-content text-xl font-semibold">{term.title}</h3>
                      <p className="text-base-content/80 mt-2">{term.description}</p>
                      <div className="mt-4">
                        <span className="link link-accent link-animated">Learn more →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/learn/glossary" className="link link-primary inline-flex items-center gap-1">
              View all terms
              <span className="icon-[tabler--arrow-right] size-4"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHO THIS IS FOR SECTION ===== */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Who These Guides Are For</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Whether you manage a warehouse, run a small shop, or track construction tools — these guides are for you.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/solutions/small-business"
              className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--building-store] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Small Businesses</h3>
                <p className="text-base-content/70 mt-2 text-sm">Retail shops, repair services, and growing teams</p>
              </div>
            </Link>

            <Link
              href="/solutions/warehouse-inventory"
              className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-success/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--building-warehouse] text-success size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Warehouses</h3>
                <p className="text-base-content/70 mt-2 text-sm">Multi-location tracking with bin-level precision</p>
              </div>
            </Link>

            <Link
              href="/solutions/construction-tools"
              className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-accent/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--tool] text-accent size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Construction Teams</h3>
                <p className="text-base-content/70 mt-2 text-sm">Tool tracking with offline jobsite support</p>
              </div>
            </Link>

            <Link
              href="/solutions/ecommerce-inventory"
              className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-info/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--shopping-cart] text-info size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">E-commerce Sellers</h3>
                <p className="text-base-content/70 mt-2 text-sm">Sync stock across channels and fulfillment</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (MCP: cta-4) ===== */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-base-200 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex grow flex-col gap-6">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Ready to Put These Guides Into Practice?
                </h2>
                <p className="text-base-content/80 max-w-2xl text-lg">
                  The quickest win is scan-first workflows: label items, scan to update, and run lightweight cycle
                  counts weekly. That&apos;s how small teams keep trust without overhead.
                </p>
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
                    <span className="text-base-content/80">CSV import to get started fast</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-4 max-sm:w-full max-sm:flex-col">
                <Link href="/signup" className="btn btn-primary">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary">
                  Barcode Scanning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED FEATURES SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Related Features</h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            Put your learning into practice with these StockZip features.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link
              href="/features/barcode-scanning"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--scan] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/80 mt-2">Scan to find and update items. Camera, Bluetooth, or hardware scanners.</p>
              </div>
            </Link>

            <Link
              href="/features/low-stock-alerts"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--bell-ringing] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Low Stock Alerts</h3>
                <p className="text-base-content/80 mt-2">Set reorder points and get notified before you run out.</p>
              </div>
            </Link>

            <Link
              href="/features/offline-mobile-scanning"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--wifi-off] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Offline Mobile</h3>
                <p className="text-base-content/80 mt-2">Keep working without signal. Sync automatically when back online.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={LEARN_FAQS} />
    </div>
  )
}
