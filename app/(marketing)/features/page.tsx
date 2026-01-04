/**
 * Features Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory management software features"
 * Secondary keywords: barcode scanning, offline mode, check-in/check-out, low stock alerts, bulk editing
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory Management Features',
  description:
    "Explore StockZip's inventory features: barcode scanning, offline mobile, check-in/check-out, bulk editing, and low stock alerts. Start free.",
  pathname: '/features',
})

const FEATURES_FAQS: FaqItem[] = [
  {
    question: 'What barcode scanners work with StockZip?',
    answer:
      'StockZip supports three scanning methods: (1) Your phone camera for 1D barcodes and QR codes, (2) Bluetooth barcode scanners for faster high-volume scanning, and (3) Rugged Android devices with built-in hardware scanners like Zebra or Honeywell.',
  },
  {
    question: 'Does StockZip work offline?',
    answer:
      'Yes. StockZip is built offline-first. You can scan barcodes, adjust quantities, and check items in/out even without internet. Changes sync automatically when connectivity returns — no data loss.',
  },
  {
    question: 'What is check-in/check-out?',
    answer:
      'Check-in/check-out is a workflow for tracking who has tools, equipment, or assets. Scan to issue an item to a team member, set a due date, and see overdue items at a glance. When returned, scan to check back in.',
  },
  {
    question: 'Can I import my existing inventory?',
    answer:
      'Yes. Import via CSV with field mapping. StockZip guides you through matching your columns to our fields. Most teams import and are scanning within 30 minutes.',
  },
  {
    question: 'How do low stock alerts work?',
    answer:
      'Set a minimum stock level (reorder point) for any item. When quantity drops below that threshold, you get notified via email or in-app alert. See all low stock items in a single report.',
  },
  {
    question: 'Is there an undo for bulk edits?',
    answer:
      'Yes. Bulk editing shows a preview of changes before applying. After applying, you can undo the entire batch if something went wrong. No more spreadsheet disasters.',
  },
  {
    question: 'How does StockZip compare to Sortly?',
    answer:
      'StockZip offers similar features to Sortly — barcode scanning, offline mode, check-in/check-out — but with transparent pricing (no SKU limits or surprise fees). See our detailed comparison at /compare/sortly-alternative.',
  },
  {
    question: 'Can I use StockZip to track construction tools?',
    answer:
      'Yes. StockZip is popular with construction teams for tool tracking. Features like offline jobsite scanning, check-in/check-out workflows, and multi-location support make it ideal for the field. Learn more at /solutions/construction-tools.',
  },
]

const CORE_FEATURES = [
  {
    title: 'Barcode Scanning',
    description: 'Scan to find and update items instantly. Camera, Bluetooth, or hardware scanners.',
    icon: 'icon-[tabler--scan]',
    href: '/features/barcode-scanning',
    color: 'primary',
  },
  {
    title: 'Offline Mobile Mode',
    description: 'Keep working without signal. Sync automatically when back online.',
    icon: 'icon-[tabler--wifi-off]',
    href: '/features/offline-mobile-scanning',
    color: 'success',
  },
  {
    title: 'Check-In / Check-Out',
    description: 'Issue tools and assets to staff. Track who has what and when it is due.',
    icon: 'icon-[tabler--arrows-exchange]',
    href: '/features/check-in-check-out',
    color: 'warning',
  },
  {
    title: 'Bulk Editing',
    description: 'Excel-grade edits with preview and undo. No more spreadsheet disasters.',
    icon: 'icon-[tabler--table]',
    href: '/features/bulk-editing',
    color: 'info',
  },
  {
    title: 'Low Stock Alerts',
    description: 'Set reorder points. Get notified before you run out.',
    icon: 'icon-[tabler--bell-ringing]',
    href: '/features/low-stock-alerts',
    color: 'error',
  },
]

const ADDITIONAL_FEATURES = [
  { title: 'Multi-location inventory', description: 'Track stock across warehouses, shelves, and bins.' },
  { title: 'Custom fields', description: 'Add any data you need — serial numbers, warranty dates, etc.' },
  { title: 'Photo capture', description: 'Attach photos to items for visual identification.' },
  { title: 'QR code labels', description: 'Generate and print labels with QR codes for fast scanning.' },
  { title: 'Stock count / cycle counts', description: 'Run counts by location. See and fix discrepancies.' },
  { title: 'Activity audit trail', description: 'See who changed what and when. Full accountability.' },
  { title: 'Reports and analytics', description: 'Inventory value, low stock, movement history, and more.' },
  { title: 'Team roles and permissions', description: 'Control who can view, edit, or manage inventory.' },
  { title: 'CSV import/export', description: 'Bulk import from spreadsheets. Export anytime.' },
]

export default function FeaturesPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description:
            'Inventory management software with barcode scanning, offline mode, check-in/check-out, and low stock alerts.',
          pathname: '/features',
        })}
      />
      <JsonLd data={faqPageJsonLd(FEATURES_FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">Features</span>
            <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Inventory Management Software Features
            </h1>
            <p className="text-base-content/80 mt-4 text-lg md:text-xl">
              Built for speed, accuracy, and simplicity. Everything your team needs to scan, count, and stay accurate —
              without the complexity of enterprise software.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
          </div>
          {/* Hero Image Placeholder */}
          <div className="bg-base-200 flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-2xl border border-base-content/10 lg:aspect-square">
            <div className="text-center p-8">
              <span className="icon-[tabler--device-mobile-search] text-primary/30 size-24"></span>
              <p className="text-base-content/40 mt-4 text-sm">Phone scanning inventory items</p>
              <p className="text-base-content/30 mt-1 text-xs">Image placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE PROMISE SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <span className="icon-[tabler--bolt] text-primary mx-auto size-12"></span>
              <h2 className="text-base-content mt-4 text-xl font-semibold">Speed</h2>
              <p className="text-base-content/70 mt-2">
                Scan and update in seconds. One-tap adjustments. No waiting for pages to load.
              </p>
            </div>
            <div className="text-center">
              <span className="icon-[tabler--target] text-primary mx-auto size-12"></span>
              <h2 className="text-base-content mt-4 text-xl font-semibold">Accuracy</h2>
              <p className="text-base-content/70 mt-2">
                Barcode scanning eliminates typos. Audit trail shows every change. Counts you can trust.
              </p>
            </div>
            <div className="text-center">
              <span className="icon-[tabler--puzzle] text-primary mx-auto size-12"></span>
              <h2 className="text-base-content mt-4 text-xl font-semibold">Simplicity</h2>
              <p className="text-base-content/70 mt-2">
                Learn in minutes, not weeks. No training required. Works the way you expect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE FEATURES SECTION (MCP: features-8) ===== */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Core Features</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              The workflows teams use most. Click any feature to learn more.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`card card-border hover:border-${feature.color} shadow-none transition-colors duration-300`}
              >
                <div className="card-body">
                  <div className="avatar avatar-placeholder mb-2">
                    <div className={`text-${feature.color} bg-${feature.color}/10 rounded-field size-12`}>
                      <span className={`${feature.icon} size-7`}></span>
                    </div>
                  </div>
                  <h3 className="card-title text-lg">{feature.title}</h3>
                  <p className="text-base-content/80">{feature.description}</p>
                  <span className="link link-primary link-animated mt-2 w-fit">Learn more</span>
                </div>
              </Link>
            ))}

            {/* View all features card */}
            <div className="card card-border bg-base-200 shadow-none">
              <div className="card-body items-center justify-center text-center">
                <p className="text-base-content/70">Looking for something specific?</p>
                <p className="text-base-content mt-1 font-medium">See all features below ↓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ADDITIONAL FEATURES SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Everything Else You Need</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              All the features that make StockZip a complete inventory solution.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ADDITIONAL_FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                <div>
                  <h3 className="text-base-content font-medium">{feature.title}</h3>
                  <p className="text-base-content/70 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO USES NOOK SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Who Uses Real-Time Inventory Management Software?
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Teams across industries use StockZip to track inventory, assets, and equipment.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/solutions/small-business"
              className="card card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--building-store] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Small Businesses</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Retail shops, repair services, and growing teams
                </p>
              </div>
            </Link>

            <Link
              href="/solutions/warehouse-inventory"
              className="card card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-success/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--building-warehouse] text-success size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Warehouses</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Multi-location tracking with bin-level precision
                </p>
              </div>
            </Link>

            <Link
              href="/solutions/construction-tools"
              className="card card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-accent/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--tool] text-accent size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Construction Teams</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Tool tracking with offline jobsite support
                </p>
              </div>
            </Link>

            <Link
              href="/solutions/ecommerce-inventory"
              className="card card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body items-center text-center">
                <div className="bg-info/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--shopping-cart] text-info size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">E-commerce Sellers</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Sync stock across channels and fulfillment
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== METRICS/SOCIAL PROOF SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Best App to Track Inventory
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Teams trust StockZip for fast, accurate inventory management.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <p className="text-primary text-4xl font-bold">1,000+</p>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Teams Using StockZip</h3>
                <p className="text-base-content/70 mt-2">From solo operators to 50+ person warehouses</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <p className="text-primary text-4xl font-bold">10M+</p>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Items Tracked</h3>
                <p className="text-base-content/70 mt-2">Products, tools, assets, and equipment</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <p className="text-primary text-4xl font-bold">99.9%</p>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Uptime</h3>
                <p className="text-base-content/70 mt-2">Reliable cloud infrastructure you can count on</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPARED TO SPREADSHEETS SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Why Not Just Use Spreadsheets?</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Spreadsheets work until they don&apos;t. Here&apos;s what you&apos;re missing.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card card-border bg-error/5 shadow-none">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Spreadsheets</h3>
                <ul className="text-base-content/70 mt-4 space-y-2">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--x] text-error size-5 shrink-0"></span>
                    No barcode scanning
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--x] text-error size-5 shrink-0"></span>
                    Manual data entry = typos
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--x] text-error size-5 shrink-0"></span>
                    No real-time sync
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--x] text-error size-5 shrink-0"></span>
                    No mobile-first experience
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--x] text-error size-5 shrink-0"></span>
                    No audit trail
                  </li>
                </ul>
              </div>
            </div>

            <div className="card card-border bg-success/5 shadow-none">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">StockZip</h3>
                <ul className="text-base-content/70 mt-4 space-y-2">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--check] text-success size-5 shrink-0"></span>
                    Scan barcodes with your phone
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--check] text-success size-5 shrink-0"></span>
                    One-tap adjustments, no typing
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--check] text-success size-5 shrink-0"></span>
                    Real-time sync across devices
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--check] text-success size-5 shrink-0"></span>
                    Built for phones and tablets
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--check] text-success size-5 shrink-0"></span>
                    Full audit trail of every change
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (MCP: cta-4) ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-primary/5 border-primary/20 border p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">See It In Action</h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  Watch the 90-second demo or start a free trial. Import your inventory and start scanning today.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">14-day free trial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">No credit card required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Unlimited items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">CSV import included</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/demo" className="btn btn-primary btn-lg">
                  Watch Demo
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
                  See Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED SOLUTIONS SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Explore Barcoding Software for Inventory
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            See how StockZip fits your specific use case.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link
              href="/solutions/warehouse-inventory"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--building-warehouse] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Warehouse Inventory</h3>
                <p className="text-base-content/80 mt-2">
                  Multi-location tracking with bin-level precision for warehouses.
                </p>
              </div>
            </Link>

            <Link
              href="/solutions/ecommerce-inventory"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--shopping-cart] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">E-commerce Inventory</h3>
                <p className="text-base-content/80 mt-2">
                  Sync stock across sales channels and fulfillment centers.
                </p>
              </div>
            </Link>

            <Link
              href="/compare/sortly-alternative"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--arrows-exchange-2] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Compare to Sortly</h3>
                <p className="text-base-content/80 mt-2">
                  See how StockZip stacks up against Sortly on features and pricing.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={FEATURES_FAQS} />
    </div>
  )
}
