/**
 * Free Warehouse Inventory Software Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-1 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "free warehouse inventory software"
 * Secondary keywords: "free inventory software", "free stock management"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Free Warehouse Inventory Software | No Credit Card Required',
  description:
    'Free warehouse inventory software with barcode scanning, low-stock alerts, and offline mode. Start tracking inventory without paying—upgrade only when you grow.',
  pathname: '/pricing/free-inventory-software',
})

const FREE_TIER_FAQS: FaqItem[] = [
  {
    question: 'What is included in the free warehouse inventory software?',
    answer:
      'The free tier includes barcode scanning, item management, location tracking, low-stock alerts, CSV import/export, and audit trail. You get full access to core inventory features with limits on items and team members.',
  },
  {
    question: 'Is the free inventory software really free?',
    answer:
      'Yes. No credit card required to start. You can use Nook indefinitely on the free tier with reasonable limits. We make money from teams who grow and need higher limits or advanced features.',
  },
  {
    question: 'What are the limits on the free tier?',
    answer:
      'The free tier supports up to 100 items and 1 team member. For most small operations just getting started, this is plenty. When you outgrow it, upgrade to a paid plan with transparent, predictable pricing.',
  },
  {
    question: 'Can I upgrade from free to paid later?',
    answer:
      'Yes. Upgrade anytime from your account settings. Your data, locations, and history all carry over. No migration needed—just unlock higher limits and additional features.',
  },
  {
    question: 'How does free inventory software compare to spreadsheets?',
    answer:
      'Spreadsheets require manual entry, break with version conflicts, and have no audit trail. Free inventory software gives you barcode scanning, real-time updates, low-stock alerts, and accountability—without the spreadsheet chaos.',
  },
  {
    question: 'Does the free tier include barcode scanning?',
    answer:
      'Yes. Barcode and QR code scanning via phone camera is included on the free tier. You can scan to look up items, adjust quantities, and track movements without paying.',
  },
  {
    question: 'Can I use the free tier offline?',
    answer:
      'Yes. Nook works offline on all tiers, including free. Scan and update inventory without internet—changes sync automatically when you reconnect.',
  },
  {
    question: 'Is there a time limit on the free tier?',
    answer:
      'No. The free tier is available indefinitely. We do not expire accounts or force upgrades. Use it as long as it meets your needs.',
  },
]

const FREE_FEATURES = [
  {
    icon: 'icon-[tabler--scan]',
    title: 'Barcode Scanning',
    description: 'Use your phone camera to scan barcodes and QR codes. No additional hardware required.',
    included: true,
  },
  {
    icon: 'icon-[tabler--package]',
    title: 'Item Management',
    description: 'Add, edit, and organize up to 100 items with photos, notes, and custom fields.',
    included: true,
  },
  {
    icon: 'icon-[tabler--building-warehouse]',
    title: 'Location Tracking',
    description: 'Create locations (warehouse, shelf, bin) and track where every item lives.',
    included: true,
  },
  {
    icon: 'icon-[tabler--bell]',
    title: 'Low-Stock Alerts',
    description: 'Set minimum stock levels and get notified before items run out.',
    included: true,
  },
  {
    icon: 'icon-[tabler--wifi-off]',
    title: 'Offline Mode',
    description: 'Keep working without internet. Changes sync when you reconnect.',
    included: true,
  },
  {
    icon: 'icon-[tabler--history]',
    title: 'Audit Trail',
    description: 'Every change is logged with who, what, when, and why. Full accountability.',
    included: true,
  },
  {
    icon: 'icon-[tabler--upload]',
    title: 'CSV Import/Export',
    description: 'Import your existing spreadsheet. Export anytime. Your data is never locked in.',
    included: true,
  },
  {
    icon: 'icon-[tabler--printer]',
    title: 'Label Printing',
    description: 'Generate and print barcode or QR labels for your items and locations.',
    included: true,
  },
]

const SPREADSHEET_COMPARISON = [
  {
    feature: 'Barcode scanning',
    spreadsheet: 'No',
    freeNook: 'Yes',
  },
  {
    feature: 'Low-stock alerts',
    spreadsheet: 'Manual formulas',
    freeNook: 'Automatic',
  },
  {
    feature: 'Audit trail',
    spreadsheet: 'No',
    freeNook: 'Yes',
  },
  {
    feature: 'Offline access',
    spreadsheet: 'Limited',
    freeNook: 'Full',
  },
  {
    feature: 'Multi-user sync',
    spreadsheet: 'Version conflicts',
    freeNook: 'Real-time',
  },
  {
    feature: 'Location tracking',
    spreadsheet: 'Manual columns',
    freeNook: 'Hierarchical',
  },
  {
    feature: 'Mobile friendly',
    spreadsheet: 'Poor',
    freeNook: 'Native',
  },
]

export default function FreeInventorySoftwarePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Pricing', pathname: '/pricing' },
          { name: 'Free Inventory Software', pathname: '/pricing/free-inventory-software' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Free Inventory Software',
          description: 'Free warehouse inventory software with barcode scanning, offline mode, and audit trail.',
          pathname: '/pricing/free-inventory-software',
        })}
      />
      <JsonLd data={faqPageJsonLd(FREE_TIER_FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="badge badge-soft badge-success mb-4 rounded-full font-medium uppercase">Free Forever</span>
            <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Free Warehouse Inventory Software
            </h1>
            <p className="text-base-content/80 mt-4 text-lg md:text-xl">
              Stop paying for spreadsheet alternatives. Get real inventory software with barcode scanning, low-stock
              alerts, and offline mode — completely free to start.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free — No Credit Card
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
                Compare Plans
              </Link>
            </div>
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--credit-card-off] text-success size-5"></span>
                <span className="text-base-content/70">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--infinity] text-success size-5"></span>
                <span className="text-base-content/70">Free forever tier</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--upload] text-success size-5"></span>
                <span className="text-base-content/70">Export anytime</span>
              </div>
            </div>
          </div>

          {/* Visual - Free tier card */}
          <div className="card bg-base-200 w-full max-w-sm border border-success/30 shadow-lg">
            <div className="card-body">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base-content text-xl font-semibold">Free Tier</h2>
                <span className="badge badge-success">Forever Free</span>
              </div>
              <div className="mb-6">
                <span className="text-base-content text-4xl font-bold">$0</span>
                <span className="text-base-content/60 ml-1">/month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="icon-[tabler--check] text-success size-5"></span>
                  <span className="text-base-content/80">Up to 100 items</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="icon-[tabler--check] text-success size-5"></span>
                  <span className="text-base-content/80">1 team member</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="icon-[tabler--check] text-success size-5"></span>
                  <span className="text-base-content/80">Barcode scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="icon-[tabler--check] text-success size-5"></span>
                  <span className="text-base-content/80">Offline mode</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="icon-[tabler--check] text-success size-5"></span>
                  <span className="text-base-content/80">Low-stock alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="icon-[tabler--check] text-success size-5"></span>
                  <span className="text-base-content/80">Audit trail</span>
                </li>
              </ul>
              <Link href="/signup" className="btn btn-success mt-6 w-full">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY FREE SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Why Offer Free Inventory Software?
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              We believe small teams deserve real inventory tools, not spreadsheet workarounds. The free tier lets you
              start without risk and upgrade only when you genuinely need more.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--heart] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Small Teams Deserve Tools</h3>
                <p className="text-base-content/70 mt-2">
                  Spreadsheets are not inventory software. Even small operations need scanning, alerts, and audit
                  trails.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--trending-up] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Grow When Ready</h3>
                <p className="text-base-content/70 mt-2">
                  No pressure to upgrade. Use the free tier as long as it works. Upgrade only when you need higher
                  limits.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--lock-open] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">No Lock-In</h3>
                <p className="text-base-content/70 mt-2">
                  Export your data anytime. We do not hold your inventory hostage. Stay because you want to, not
                  because you have to.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES INCLUDED SECTION (MCP: features-1) ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              What is Included in Free Warehouse Inventory Software
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Real inventory features, not a crippled demo. Everything you need to track inventory accurately.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FREE_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-success hover:shadow-md"
              >
                <div className="card-body">
                  <div className="bg-success/10 flex h-12 w-12 items-center justify-center rounded-xl">
                    <span className={`${feature.icon} text-success size-6`}></span>
                  </div>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-base-content/80 mt-2 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SPREADSHEET COMPARISON SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Free Inventory Software vs Spreadsheets
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Spreadsheets were never designed for inventory management. See what you gain by switching.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl overflow-x-auto">
            <table className="table table-lg">
              <thead>
                <tr>
                  <th className="text-base-content">Feature</th>
                  <th className="text-base-content text-center">Spreadsheets</th>
                  <th className="text-base-content text-center">Nook Free</th>
                </tr>
              </thead>
              <tbody>
                {SPREADSHEET_COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td className="text-base-content font-medium">{row.feature}</td>
                    <td className="text-center">
                      {row.spreadsheet === 'No' ? (
                        <span className="icon-[tabler--x] text-error size-5"></span>
                      ) : (
                        <span className="text-base-content/60">{row.spreadsheet}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.freeNook === 'Yes' ? (
                        <span className="icon-[tabler--check] text-success size-5"></span>
                      ) : (
                        <span className="text-success font-medium">{row.freeNook}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== UPGRADE PATH SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            <div className="lg:w-1/2">
              <h2 className="text-base-content text-2xl font-semibold md:text-3xl">When to Upgrade from Free</h2>
              <p className="text-base-content/80 mt-4 text-lg">
                The free tier is designed for small operations getting started. Here is when it makes sense to upgrade.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <span className="icon-[tabler--package] text-primary size-5"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content font-semibold">More than 100 items</h3>
                    <p className="text-base-content/70">When your catalog grows beyond the free tier limit.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <span className="icon-[tabler--users] text-primary size-5"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content font-semibold">Multiple team members</h3>
                    <p className="text-base-content/70">When you need more than one person managing inventory.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <span className="icon-[tabler--arrows-exchange] text-primary size-5"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content font-semibold">Check-in/check-out workflows</h3>
                    <p className="text-base-content/70">When you need to track tool or asset custody.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <span className="icon-[tabler--chart-bar] text-primary size-5"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content font-semibold">Advanced reporting</h3>
                    <p className="text-base-content/70">When you need deeper analytics and custom reports.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/pricing" className="btn btn-primary">
                  Compare All Plans
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="rounded-2xl border border-base-content/10 bg-base-200 p-8">
                <h3 className="text-base-content text-xl font-semibold">Upgrade is Seamless</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span className="text-base-content/80">All your data carries over automatically</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span className="text-base-content/80">No migration or re-import needed</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span className="text-base-content/80">Upgrade or downgrade anytime</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span className="text-base-content/80">Predictable pricing—no surprise tier jumps</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span className="text-base-content/80">Cancel anytime, export your data</span>
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
          <div className="rounded-3xl bg-success/10 border border-success/20 p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Start Tracking Inventory for Free
                </h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  No credit card. No time limit. Import your spreadsheet, scan a few items, and see why real inventory
                  software beats manual tracking.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Free forever tier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Barcode scanning included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Works offline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Export your data anytime</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/signup" className="btn btn-success btn-lg">
                  Start Free
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED PAGES SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Related Resources</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link
              href="/solutions/warehouse-inventory"
              className="card bg-base-100 card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body">
                <span className="icon-[tabler--building-warehouse] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Warehouse Inventory</h3>
                <p className="text-base-content/80 mt-2">
                  Full warehouse management with receiving, cycle counts, and multi-location tracking.
                </p>
              </div>
            </Link>

            <Link
              href="/pricing"
              className="card bg-base-100 card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body">
                <span className="icon-[tabler--currency-dollar] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">All Pricing Plans</h3>
                <p className="text-base-content/80 mt-2">
                  Compare free, pro, and team plans. Transparent pricing that grows with you.
                </p>
              </div>
            </Link>

            <Link
              href="/demo"
              className="card bg-base-100 card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body">
                <span className="icon-[tabler--player-play] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Watch Demo</h3>
                <p className="text-base-content/80 mt-2">
                  See Nook in action. Scanning, stock adjustments, and low-stock alerts.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={FREE_TIER_FAQS} />
    </div>
  )
}
