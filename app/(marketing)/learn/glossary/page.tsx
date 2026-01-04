/**
 * Glossary Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (hub page hero)
 * - Features: /marketing-ui/features/features-8 (term cards)
 *
 * Primary keyword: "inventory management glossary"
 * Secondary keywords: "inventory terms", "warehouse terminology"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory Management Glossary | Key Terms & Definitions',
  description:
    'Learn key inventory management terms and definitions. From inventory turnover to EOQ, understand the concepts that drive efficient stock management.',
  pathname: '/glossary',
})

const GLOSSARY_TERMS = [
  // Tier 1 - High Volume Terms
  {
    term: 'Inventory Turnover',
    slug: 'inventory-turnover',
    definition: 'A ratio measuring how many times inventory is sold and replaced over a period.',
    category: 'Metrics',
    hasPage: true,
  },
  {
    term: 'Economic Order Quantity (EOQ)',
    slug: 'economic-order-quantity',
    definition: 'The optimal order quantity that minimizes total inventory costs.',
    category: 'Formulas',
    hasPage: true,
  },
  {
    term: 'Cost of Goods Sold (COGS)',
    slug: 'cost-of-goods-sold',
    definition: 'The direct costs of producing goods sold by a business, including materials and labor.',
    category: 'Metrics',
    hasPage: true,
  },
  {
    term: 'Markup vs Margin',
    slug: 'markup-vs-margin',
    definition: 'Markup is added to cost; margin is the percentage of revenue that is profit.',
    category: 'Pricing',
    hasPage: true,
  },
  // Tier 2 - Medium-High Volume Terms
  {
    term: 'Wholesaler vs Distributor',
    slug: 'wholesaler-vs-distributor',
    definition: 'Wholesalers buy and resell in bulk; distributors represent manufacturers directly.',
    category: 'Concepts',
    hasPage: true,
  },
  {
    term: 'Consignment Inventory',
    slug: 'consignment-inventory',
    definition: 'Goods held by a retailer but owned by the supplier until sold.',
    category: 'Concepts',
    hasPage: true,
  },
  {
    term: 'Types of Inventory',
    slug: 'types-of-inventory',
    definition: 'The four main types: raw materials, work-in-progress, finished goods, and MRO.',
    category: 'Basics',
    hasPage: true,
  },
  {
    term: 'Lot Number vs Serial Number',
    slug: 'lot-number-vs-serial-number',
    definition: 'Lot numbers identify batches; serial numbers identify individual items.',
    category: 'Traceability',
    hasPage: true,
  },
  // Tier 3 - Strategic Terms
  {
    term: 'Inventory vs Stock',
    slug: 'inventory-vs-stock',
    definition: 'Often used interchangeably; inventory is broader and includes assets and supplies.',
    category: 'Basics',
    hasPage: true,
  },
  {
    term: 'Barcodes vs QR Codes',
    slug: 'barcodes-vs-qr-codes',
    definition: 'Barcodes hold limited data; QR codes hold more and scan from any angle.',
    category: 'Technology',
    hasPage: true,
  },
  {
    term: '80/20 Inventory Rule',
    slug: '80-20-inventory-rule',
    definition: 'The Pareto principle: 20% of products typically generate 80% of revenue.',
    category: 'Strategy',
    hasPage: true,
  },
  {
    term: 'FIFO vs LIFO',
    slug: 'fifo-vs-lifo',
    definition: 'FIFO sells oldest inventory first; LIFO sells newest first for accounting purposes.',
    category: 'Methods',
    hasPage: true,
  },
  // Terms without dedicated pages (yet)
  {
    term: 'Safety Stock',
    slug: 'safety-stock',
    definition: 'Extra inventory held to protect against variability in demand or supply.',
    category: 'Concepts',
    hasPage: false,
  },
  {
    term: 'Reorder Point',
    slug: 'reorder-point',
    definition: 'The inventory level at which a new order should be placed to avoid stockouts.',
    category: 'Concepts',
    hasPage: false,
  },
  {
    term: 'Cycle Count',
    slug: 'cycle-count',
    definition: 'A method of auditing inventory by counting a subset of items on a rotating schedule.',
    category: 'Processes',
    hasPage: false,
  },
  {
    term: 'SKU (Stock Keeping Unit)',
    slug: 'sku',
    definition: 'A unique identifier for each distinct product and its variants.',
    category: 'Basics',
    hasPage: false,
  },
  {
    term: 'Lead Time',
    slug: 'lead-time',
    definition: 'The time between placing an order and receiving the goods.',
    category: 'Concepts',
    hasPage: false,
  },
  {
    term: 'Perpetual Inventory',
    slug: 'perpetual-inventory',
    definition: 'A system that updates inventory counts in real-time as transactions occur.',
    category: 'Systems',
    hasPage: false,
  },
  {
    term: 'Periodic Inventory',
    slug: 'periodic-inventory',
    definition: 'A system that updates inventory counts at fixed intervals through physical counts.',
    category: 'Systems',
    hasPage: false,
  },
  {
    term: 'ABC Analysis',
    slug: 'abc-analysis',
    definition: 'A method of categorizing inventory by value and importance (A=high, B=medium, C=low).',
    category: 'Methods',
    hasPage: false,
  },
  {
    term: 'Dead Stock',
    slug: 'dead-stock',
    definition: 'Inventory that has not sold or been used for an extended period.',
    category: 'Concepts',
    hasPage: false,
  },
]

const CATEGORIES = ['All', 'Metrics', 'Formulas', 'Pricing', 'Concepts', 'Basics', 'Methods', 'Systems', 'Technology', 'Traceability', 'Strategy', 'Processes']

export default function GlossaryPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Glossary', pathname: '/glossary' },
        ])}
      />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Reference</p>
          <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
            Inventory Management Glossary
          </h1>
          <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
            Key terms and definitions for inventory management, warehouse operations, and stock control. Learn the
            language of efficient inventory.
          </p>
        </div>

        {/* Category Filter (visual only - could be made interactive with client component) */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((category) => (
            <span
              key={category}
              className={`badge badge-outline cursor-pointer ${category === 'All' ? 'badge-primary' : ''}`}
            >
              {category}
            </span>
          ))}
        </div>

        {/* Terms Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GLOSSARY_TERMS.map((item) => {
            const CardContent = (
              <div className="card-body">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base-content text-lg font-semibold">{item.term}</h2>
                  <span className="badge badge-soft badge-neutral text-xs">{item.category}</span>
                </div>
                <p className="text-base-content/80 mt-2">{item.definition}</p>
                {item.hasPage && (
                  <div className="mt-4">
                    <span className="text-primary text-sm font-medium">Read full definition →</span>
                  </div>
                )}
              </div>
            )

            if (item.hasPage) {
              return (
                <Link
                  key={item.slug}
                  href={`/learn/glossary/${item.slug}`}
                  className="card card-border shadow-none transition-colors hover:border-primary/30"
                >
                  {CardContent}
                </Link>
              )
            }

            return (
              <div key={item.slug} className="card card-border shadow-none">
                {CardContent}
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-box bg-base-200 p-8 text-center">
          <h2 className="text-base-content text-2xl font-semibold">Put these concepts into practice</h2>
          <p className="text-base-content/80 mx-auto mt-3 max-w-2xl">
            StockZip inventory management software helps you apply these concepts with barcode scanning, low-stock alerts,
            and real-time tracking.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/features" className="btn btn-outline btn-secondary btn-lg">
              See Features
            </Link>
          </div>
        </div>

        {/* Related Resources */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related guides</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/learn/guide/how-to-set-up-barcode-system"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--barcode] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Barcode system setup</h3>
                <p className="text-base-content/80 mt-2">Complete guide to barcode implementation.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/cycle-counting"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--clipboard-check] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Cycle counting</h3>
                <p className="text-base-content/80 mt-2">Maintain accuracy without full shutdowns.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/how-to-set-reorder-points"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--bell-ringing] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Reorder points</h3>
                <p className="text-base-content/80 mt-2">Calculate and configure reorder alerts.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/qr-codes-for-inventory"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--qrcode] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">QR codes for inventory</h3>
                <p className="text-base-content/80 mt-2">When and how to use QR codes.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
