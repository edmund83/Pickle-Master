/**
 * Ecommerce Inventory Management Solution Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "ecommerce inventory management"
 * Secondary keywords: "inventory software for online sellers", "stock sync", "prevent stockouts"
 *
 * TODO: Proof Assets Required
 * - Screenshot: Low stock alerts dashboard
 * - Screenshot: Multi-location inventory view
 * - Screenshot: CSV import mapping interface
 * - Case study or testimonial from ecommerce seller
 * - Accuracy metrics (e.g., "99% stock accuracy")
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
    pathname: '/solutions/ecommerce-inventory',
    title: 'Ecommerce Inventory Management | Prevent Stockouts & Overselling',
    description:
      'Ecommerce inventory management software that keeps your stock accurate across locations, prevents stockouts with low-stock alerts, and scales with your growth.',
  })
}

const ECOMMERCE_FAQS: FaqItem[] = [
  {
    question: 'How does StockZip prevent stockouts for my online store?',
    answer:
      'StockZip uses low-stock alerts with customizable thresholds per SKU. When inventory drops below your reorder point, you get notified immediately so you can replenish before running out.',
  },
  {
    question: 'Can I track inventory across multiple warehouses or locations?',
    answer:
      'Yes. StockZip supports unlimited locations with per-location stock levels. You can see total available quantity across all locations or drill into each warehouse independently.',
  },
  {
    question: 'How do I import my existing product catalog?',
    answer:
      'Export your catalog as CSV from your current system (Shopify, WooCommerce, etc.) and import directly into StockZip. We map common fields automatically and let you customize the rest.',
  },
  {
    question: 'Does StockZip support barcode scanning for faster fulfillment?',
    answer:
      'Yes. Use your phone camera or a Bluetooth scanner to scan barcodes during picking, packing, and receiving. Each scan updates inventory in real-time.',
  },
  {
    question: 'Can I set different reorder points for different products?',
    answer:
      'Absolutely. Each SKU can have its own minimum stock threshold. Fast-moving items can trigger alerts earlier, while slow-movers can have lower thresholds.',
  },
  {
    question: 'How does StockZip handle overselling?',
    answer:
      'By keeping your inventory counts accurate through scan-based workflows and real-time updates, StockZip reduces the data drift that leads to overselling. You always know your true available quantity.',
  },
  {
    question: 'Can multiple team members manage inventory simultaneously?',
    answer:
      'Yes. StockZip is built for teams with role-based permissions, real-time sync, and an audit trail showing who changed what and when.',
  },
  {
    question: 'What if I need to adjust inventory after a count discrepancy?',
    answer:
      'Use bulk adjustments with a reason code (damage, shrinkage, found stock). Every adjustment is logged in the audit trail for accountability.',
  },
]

const PAIN_POINTS = [
  {
    icon: 'icon-[tabler--alert-triangle]',
    title: 'Stockouts that cost sales',
    description: 'Running out of popular items means lost revenue and disappointed customers who may not come back.',
  },
  {
    icon: 'icon-[tabler--arrows-cross]',
    title: 'Overselling and cancellations',
    description: 'Inaccurate counts lead to selling items you do not have, forcing painful order cancellations.',
  },
  {
    icon: 'icon-[tabler--clock]',
    title: 'Manual count chaos',
    description: 'Spreadsheets and guesswork create discrepancies that compound over time.',
  },
]

const KEY_FEATURES = [
  {
    icon: 'icon-[tabler--bell-ringing]',
    title: 'Low-stock alerts',
    description: 'Set reorder points per SKU and get notified before you run out. Never miss a restock window.',
  },
  {
    icon: 'icon-[tabler--barcode]',
    title: 'Scan-based accuracy',
    description: 'Use barcode scanning for receiving, picking, and counts. Reduce human error and speed up operations.',
  },
  {
    icon: 'icon-[tabler--building-warehouse]',
    title: 'Multi-location tracking',
    description: 'Manage inventory across warehouses, stores, and fulfillment centers from one dashboard.',
  },
  {
    icon: 'icon-[tabler--chart-line]',
    title: 'Inventory valuation',
    description: 'See the total value of your stock by location, category, or custom grouping at any time.',
  },
  {
    icon: 'icon-[tabler--history]',
    title: 'Movement history',
    description: 'Track every stock change with timestamps, quantities, and reason codes for full accountability.',
  },
  {
    icon: 'icon-[tabler--upload]',
    title: 'Easy CSV import',
    description: 'Migrate your catalog from any platform. Map fields, validate data, and go live in minutes.',
  },
]

const WORKFLOWS = [
  {
    step: '1',
    title: 'Receiving',
    description:
      'Scan incoming shipments against purchase orders. StockZip updates stock levels and flags discrepancies automatically.',
  },
  {
    step: '2',
    title: 'Picking & packing',
    description:
      'Scan items as you pick them for orders. Real-time updates ensure your available quantity stays accurate.',
  },
  {
    step: '3',
    title: 'Cycle counts',
    description:
      'Run quick scan-based counts on high-velocity SKUs. Catch discrepancies early before they compound.',
  },
]

export default function EcommerceSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Ecommerce Inventory', pathname: '/solutions/ecommerce-inventory' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory - Ecommerce',
          description: 'Ecommerce inventory management with low-stock alerts, barcode scanning, and multi-location tracking.',
          pathname: '/solutions/ecommerce-inventory',
        })}
      />
      <JsonLd data={faqPageJsonLd(ECOMMERCE_FAQS)} />

      {/* Hero Section - hero-12 pattern */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Ecommerce</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Ecommerce inventory management that prevents stockouts
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              Keep accurate counts across every location, set smart reorder points, and stop the costly cycle of
              stockouts and overselling that kills your margins.
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
          <h2 className="text-base-content text-2xl font-semibold">The ecommerce inventory problem</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Online sellers face a constant battle: stock too much and tie up cash, stock too little and lose sales.
            Spreadsheets and guesswork make it worse.
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

        {/* Core Workflows Section */}
        <div className="mt-16 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">How StockZip fits your workflow</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            StockZip integrates into the three core inventory workflows that keep your ecommerce operation running.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {WORKFLOWS.map((workflow) => (
              <div key={workflow.step} className="flex gap-4">
                <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                  {workflow.step}
                </div>
                <div>
                  <h3 className="text-base-content text-lg font-semibold">{workflow.title}</h3>
                  <p className="text-base-content/80 mt-1">{workflow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Section - features-8 pattern */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Built for online sellers</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Every feature is designed to keep your stock accurate and your operations efficient.
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

        {/* Proof Section - Screenshots & Examples */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">See It In Action</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Real ecommerce workflows, captured from StockZip.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Screenshot 1: Low Stock Alerts */}
            <div className="rounded-box bg-base-200 p-6">
              {/* TODO: Screenshot - Low stock alerts dashboard */}
              <div className="bg-base-100 mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-base-content/20">
                <div className="text-center">
                  <span className="icon-[tabler--bell-ringing] text-base-content/30 mx-auto size-12"></span>
                  <p className="text-base-content/40 mt-2 text-sm">Low stock alerts screenshot</p>
                </div>
              </div>
              <h3 className="text-base-content font-semibold">Low Stock Alerts</h3>
              <p className="text-base-content/70 mt-1 text-sm">
                Get notified before stockouts happen. Never miss a sale.
              </p>
            </div>

            {/* Screenshot 2: Multi-Location View */}
            <div className="rounded-box bg-base-200 p-6">
              {/* TODO: Screenshot - Multi-location inventory view */}
              <div className="bg-base-100 mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-base-content/20">
                <div className="text-center">
                  <span className="icon-[tabler--map-pin] text-base-content/30 mx-auto size-12"></span>
                  <p className="text-base-content/40 mt-2 text-sm">Multi-location view screenshot</p>
                </div>
              </div>
              <h3 className="text-base-content font-semibold">Multi-Location Stock</h3>
              <p className="text-base-content/70 mt-1 text-sm">
                See stock levels across all warehouses at a glance.
              </p>
            </div>

            {/* Screenshot 3: CSV Import */}
            <div className="rounded-box bg-base-200 p-6">
              {/* TODO: Screenshot - CSV import mapping interface */}
              <div className="bg-base-100 mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-base-content/20">
                <div className="text-center">
                  <span className="icon-[tabler--file-import] text-base-content/30 mx-auto size-12"></span>
                  <p className="text-base-content/40 mt-2 text-sm">CSV import screenshot</p>
                </div>
              </div>
              <h3 className="text-base-content font-semibold">Easy CSV Import</h3>
              <p className="text-base-content/70 mt-1 text-sm">
                Map fields and import your catalog in minutes.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - cta-4 pattern */}
        <div className="mt-16 rounded-box bg-base-200 p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base-content text-2xl font-semibold">Stop losing sales to stockouts</h2>
              <p className="text-base-content/80 mt-3 max-w-2xl">
                Join thousands of online sellers who trust StockZip to keep their inventory accurate and their customers
                happy.
              </p>
              <ul className="text-base-content/80 mt-6 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  14-day free trial, no credit card required
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Import your existing catalog in minutes
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Predictable pricing that scales with your growth
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
            <Link href="/solutions/warehouse-inventory" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--building-warehouse] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Warehouse management</h3>
                <p className="text-base-content/80 mt-2">
                  Optimize receiving, put-away, and picking for larger operations.
                </p>
              </div>
            </Link>
            <Link href="/solutions/small-business" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--building-store] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Small business</h3>
                <p className="text-base-content/80 mt-2">
                  Simple inventory management without the enterprise complexity.
                </p>
              </div>
            </Link>
            <Link href="/features/low-stock-alerts" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--bell-ringing] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Low-stock alerts</h3>
                <p className="text-base-content/80 mt-2">
                  Never run out of stock with customizable reorder notifications.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={ECOMMERCE_FAQS} />
    </div>
  )
}
