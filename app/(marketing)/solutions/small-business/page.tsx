/**
 * Small Business Inventory Management Solution Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "small business inventory software"
 * Secondary keywords: "simple inventory management", "inventory app for small business", "replace spreadsheets"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Small Business Inventory Software | Simple, Affordable, No Training Required',
  description:
    'Small business inventory software that replaces spreadsheets without the complexity. Barcode scanning, offline mode, and predictable pricing that grows with you.',
  pathname: '/solutions/small-business',
})

const SMALL_BUSINESS_FAQS: FaqItem[] = [
  {
    question: 'How long does it take to set up StockZip?',
    answer:
      'Most small businesses are scanning and tracking within 30 minutes. Import your existing spreadsheet or product list, print labels, and start. No IT team required.',
  },
  {
    question: 'Can my staff learn to use it without training?',
    answer:
      'Yes. StockZip uses scan-first workflows with plain language. If your team can use a smartphone, they can use StockZip.',
  },
  {
    question: 'What if I already have data in spreadsheets?',
    answer:
      'Export your spreadsheet as CSV and import directly into StockZip. We map common columns automatically and let you review before finalizing.',
  },
  {
    question: 'How much does StockZip cost for a small business?',
    answer:
      'StockZip uses predictable, usage-based pricing. Start with the free tier to test it out, then upgrade as you grow. No surprise jumps or hidden fees.',
  },
  {
    question: 'Does StockZip work on my phone?',
    answer:
      'Yes. Use the StockZip web app on any smartphone or tablet. No app store download required — just log in and start scanning.',
  },
  {
    question: 'What if I have multiple locations?',
    answer:
      'StockZip supports unlimited locations. Track inventory at your shop, warehouse, storage unit, or anywhere else. See stock levels per location or across all.',
  },
  {
    question: 'Can I print barcode labels?',
    answer:
      'Yes. Generate QR or barcode labels from StockZip and print to any thermal or laser printer. Label your products, shelves, or bins.',
  },
  {
    question: 'What happens when my business grows?',
    answer:
      'StockZip scales with you. Add team members, locations, and items without hitting surprise tier jumps. The same simple interface works at any size.',
  },
]

const PAIN_POINTS = [
  {
    icon: 'icon-[tabler--table]',
    title: 'Spreadsheet chaos',
    description: 'Multiple versions, manual updates, formulas that break — spreadsheets were never designed for real inventory.',
  },
  {
    icon: 'icon-[tabler--clock]',
    title: 'Time wasted on counts',
    description: 'Manual counting is slow and error-prone. Discrepancies compound until you cannot trust your numbers.',
  },
  {
    icon: 'icon-[tabler--currency-dollar]',
    title: 'Enterprise software is overkill',
    description: 'Big inventory systems cost too much, take months to implement, and have features you will never use.',
  },
]

const KEY_FEATURES = [
  {
    icon: 'icon-[tabler--rocket]',
    title: 'Fast setup',
    description: 'Import your data and start scanning in under 30 minutes. No IT team or consultant required.',
  },
  {
    icon: 'icon-[tabler--barcode]',
    title: 'Barcode scanning',
    description: 'Use your phone camera to scan. Faster and more accurate than typing or counting.',
  },
  {
    icon: 'icon-[tabler--wifi-off]',
    title: 'Offline mode',
    description: 'Keep working without internet. Changes sync automatically when you reconnect.',
  },
  {
    icon: 'icon-[tabler--users]',
    title: 'Team-friendly',
    description: 'Add staff members with role-based permissions. Everyone sees what they need, nothing more.',
  },
  {
    icon: 'icon-[tabler--bell]',
    title: 'Low-stock alerts',
    description: 'Set reorder points and get notified before you run out of critical items.',
  },
  {
    icon: 'icon-[tabler--chart-bar]',
    title: 'Simple reports',
    description: 'See inventory value, movement history, and low-stock items at a glance.',
  },
]

const IDEAL_FOR = [
  {
    title: 'Retail shops',
    description: 'Track products on shelves and in the back room. Know what to reorder.',
    icon: 'icon-[tabler--building-store]',
  },
  {
    title: 'Service businesses',
    description: 'Track parts, supplies, and equipment across jobs and vehicles.',
    icon: 'icon-[tabler--tool]',
  },
  {
    title: 'Home-based sellers',
    description: 'Manage inventory for Etsy, eBay, or local markets from your garage or spare room.',
    icon: 'icon-[tabler--home]',
  },
  {
    title: 'Nonprofits',
    description: 'Track donations, supplies, and equipment with accountability.',
    icon: 'icon-[tabler--heart-handshake]',
  },
]

export default function SmallBusinessSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Small business', pathname: '/solutions/small-business' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description: 'Small business inventory software with barcode scanning and offline mode.',
          pathname: '/solutions/small-business',
        })}
      />
      <JsonLd data={faqPageJsonLd(SMALL_BUSINESS_FAQS)} />

      {/* Hero Section - hero-12 pattern */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Small Business</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Small business inventory software that replaces spreadsheets
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              Stop wrestling with spreadsheets. Get accurate inventory with barcode scanning, simple setup, and
              pricing that grows with you — not against you.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Pain Points Section */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">The small business inventory problem</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            You are caught between spreadsheets that do not work and enterprise software you do not need.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((pain) => (
              <div key={pain.title} className="card card-border shadow-none">
                <div className="card-body">
                  <span className={`${pain.icon} text-warning size-8`}></span>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{pain.title}</h3>
                  <p className="text-base-content/80 mt-2">{pain.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">Get started in three steps</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            No consultants, no training sessions, no IT department. Just import, label, and scan.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                1
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Import your data</h3>
                <p className="text-base-content/80 mt-1">
                  Upload a CSV from your spreadsheet or start fresh. We map common fields automatically.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                2
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Print labels</h3>
                <p className="text-base-content/80 mt-1">
                  Generate QR or barcode labels and apply them to your products, shelves, or bins.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                3
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Scan and go</h3>
                <p className="text-base-content/80 mt-1">
                  Use your phone to scan items for updates, counts, and lookups. No app download required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Section - features-8 pattern */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Built for small businesses</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Every feature is designed for simplicity first. Use what you need, ignore what you do not.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_FEATURES.map((feature) => (
              <div key={feature.title} className="card card-border shadow-none">
                <div className="card-body">
                  <span className={`${feature.icon} text-primary size-8`}></span>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-base-content/80 mt-2">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ideal For Section */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Ideal for</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            StockZip works for any small business that needs to track physical inventory.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {IDEAL_FOR.map((useCase) => (
              <div key={useCase.title} className="card card-border shadow-none">
                <div className="card-body items-center text-center">
                  <span className={`${useCase.icon} text-primary size-10`}></span>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{useCase.title}</h3>
                  <p className="text-base-content/80 mt-2 text-sm">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - cta-4 pattern */}
        <div className="mt-16 rounded-box bg-base-200 p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base-content text-2xl font-semibold">Ready to ditch the spreadsheet?</h2>
              <p className="text-base-content/80 mt-3 max-w-2xl">
                Join thousands of small businesses who switched to StockZip and finally trust their inventory numbers.
              </p>
              <ul className="text-base-content/80 mt-6 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Free to start, upgrade when you are ready
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Import your spreadsheet in minutes
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  No credit card required
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
                See Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Related Solutions */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related solutions</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link href="/solutions/ecommerce-inventory" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--shopping-cart] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Ecommerce</h3>
                <p className="text-base-content/80 mt-2">
                  Prevent stockouts and overselling for your online store.
                </p>
              </div>
            </Link>
            <Link href="/features/barcode-scanning" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--barcode] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Barcode scanning</h3>
                <p className="text-base-content/80 mt-2">
                  Fast, accurate updates with your phone camera.
                </p>
              </div>
            </Link>
            <Link href="/features/low-stock-alerts" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--bell-ringing] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Low-stock alerts</h3>
                <p className="text-base-content/80 mt-2">
                  Know when to reorder before you run out.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={SMALL_BUSINESS_FAQS} />
    </div>
  )
}
