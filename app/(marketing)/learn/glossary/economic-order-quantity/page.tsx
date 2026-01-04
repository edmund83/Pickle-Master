/**
 * Economic Order Quantity (EOQ) Glossary Term Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (definition hero)
 * - Features: /marketing-ui/features/features-8 (formula breakdown)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "economic order quantity"
 * Secondary keywords: "EOQ formula", "economic order quantity calculator", "EOQ model", "how to calculate EOQ"
 * Est. volume: 837+ monthly (Sortly proof: 837 traffic, 79 keywords)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'
import { EOQCalculator } from './EOQCalculator'

export const metadata: Metadata = marketingMetadata({
  title: 'Economic Order Quantity (EOQ) | Formula, Calculator & Examples',
  description:
    'Learn the Economic Order Quantity (EOQ) formula, how to calculate optimal order quantities, and when to use EOQ for inventory management. Includes examples.',
  pathname: '/glossary/economic-order-quantity',
})

const EOQ_FAQS: FaqItem[] = [
  {
    question: 'What is Economic Order Quantity (EOQ)?',
    answer:
      'EOQ is the optimal order quantity that minimizes total inventory costs, balancing ordering costs (placing and receiving orders) with holding costs (storing inventory). It tells you how much to order to spend the least on inventory overall.',
  },
  {
    question: 'What is the EOQ formula?',
    answer:
      'EOQ = square root of (2 x D x S) / H, where D is annual demand, S is ordering cost per order, and H is holding cost per unit per year. The formula finds the point where ordering costs equal holding costs.',
  },
  {
    question: 'When should I use EOQ?',
    answer:
      'EOQ works best for items with stable, predictable demand, known ordering and holding costs, and no significant quantity discounts. It is less useful for seasonal items, new products, or items with highly variable demand.',
  },
  {
    question: 'What are the limitations of EOQ?',
    answer:
      'EOQ assumes constant demand, fixed ordering and holding costs, instant replenishment, and no quantity discounts. In reality, demand fluctuates, costs change, and suppliers offer bulk discounts. Treat EOQ as a starting point, not a strict rule.',
  },
  {
    question: 'How do I calculate holding cost for EOQ?',
    answer:
      'Holding cost includes storage, insurance, obsolescence, and capital cost. A common estimate is 20-30% of the item value per year. For a $10 item, holding cost might be $2-3 per unit per year.',
  },
  {
    question: 'How often should I order using EOQ?',
    answer:
      'Divide annual demand by EOQ to get the number of orders per year. If demand is 1,000 units and EOQ is 200, you would order 5 times per year (about every 10-11 weeks).',
  },
  {
    question: 'When should I NOT use EOQ?',
    answer:
      'Avoid using EOQ for: products with highly seasonal demand, new products without demand history, perishable items with short shelf life, items with significant quantity discounts from suppliers, or products with long and variable lead times.',
  },
  {
    question: 'What is ordering cost in EOQ?',
    answer:
      'Ordering cost (S) includes all expenses to place and receive an order: purchase order processing, communication with suppliers, receiving and inspection, invoice processing, and shipping fees. Calculate by dividing total annual ordering expenses by number of orders placed.',
  },
]

export default function EconomicOrderQuantityPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Economic Order Quantity', pathname: '/learn/glossary/economic-order-quantity' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(EOQ_FAQS)} />

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Formulas</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Economic Order Quantity (EOQ)</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          <strong>Economic Order Quantity (EOQ)</strong> is a formula that calculates the optimal order quantity to
          minimize total inventory costs. It balances the cost of ordering (placing and receiving orders) against the
          cost of holding inventory (storage, insurance, capital).
        </p>

        {/* Formula Section */}
        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold">The EOQ Formula</h2>
          <div className="mt-4 rounded-lg bg-base-100 p-6 text-center">
            <p className="text-base-content text-lg font-mono">
              EOQ = √(<span className="text-primary">2 × D × S</span> / <span className="text-secondary">H</span>)
            </p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-base-content font-semibold">D = Annual Demand</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Total units needed per year. Based on historical sales or forecasts.
              </p>
            </div>
            <div>
              <h3 className="text-base-content font-semibold">S = Ordering Cost</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Cost to place and receive one order. Includes admin, shipping, inspection.
              </p>
            </div>
            <div>
              <h3 className="text-base-content font-semibold">H = Holding Cost</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Cost to hold one unit for a year. Storage, insurance, obsolescence, capital.
              </p>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Example Calculation</h2>
          <p className="text-base-content/80 mt-2">
            Let&apos;s calculate EOQ for a product with the following data:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Variable</th>
                  <th className="text-base-content">Value</th>
                  <th className="text-base-content">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-mono">D</td>
                  <td className="text-base-content">1,000 units</td>
                  <td className="text-base-content/80">Annual demand</td>
                </tr>
                <tr>
                  <td className="text-base-content font-mono">S</td>
                  <td className="text-base-content">$50</td>
                  <td className="text-base-content/80">Cost per order</td>
                </tr>
                <tr>
                  <td className="text-base-content font-mono">H</td>
                  <td className="text-base-content">$5</td>
                  <td className="text-base-content/80">Holding cost per unit per year</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-lg bg-base-200 p-6">
            <p className="text-base-content font-mono text-sm">
              EOQ = √(2 × 1,000 × 50 / 5)
              <br />
              EOQ = √(100,000 / 5)
              <br />
              EOQ = √20,000
              <br />
              <strong className="text-primary">EOQ ≈ 141 units</strong>
            </p>
          </div>
          <p className="text-base-content/80 mt-4">
            The optimal order quantity is about 141 units. With annual demand of 1,000 units, you would place about 7
            orders per year (1,000 / 141 ≈ 7), or roughly every 7-8 weeks.
          </p>
        </div>

        {/* Interactive Calculator */}
        <EOQCalculator />

        {/* When to Use Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">When to Use EOQ</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card card-border bg-success/5">
              <div className="card-body">
                <h3 className="text-success flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--check] size-5"></span>
                  Good fit for EOQ
                </h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>Stable, predictable demand</li>
                  <li>Known, consistent ordering costs</li>
                  <li>Known, consistent holding costs</li>
                  <li>No significant quantity discounts</li>
                  <li>Replenishment is relatively quick</li>
                </ul>
              </div>
            </div>
            <div className="card card-border bg-warning/5">
              <div className="card-body">
                <h3 className="text-warning flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--alert-triangle] size-5"></span>
                  EOQ may not fit
                </h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>Highly seasonal or variable demand</li>
                  <li>New products with no demand history</li>
                  <li>Significant bulk discounts available</li>
                  <li>Perishable items with short shelf life</li>
                  <li>Long, variable lead times</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Metrics Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related Calculations</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Orders Per Year</h3>
                <p className="text-base-content font-mono mt-2">D / EOQ</p>
                <p className="text-base-content/80 mt-2 text-sm">
                  Annual demand divided by EOQ gives you how many orders to place per year.
                </p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Reorder Interval</h3>
                <p className="text-base-content font-mono mt-2">365 / (D / EOQ)</p>
                <p className="text-base-content/80 mt-2 text-sm">
                  Days between orders. Helps you plan ordering schedules.
                </p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Total Annual Cost</h3>
                <p className="text-base-content font-mono mt-2">(D/Q × S) + (Q/2 × H)</p>
                <p className="text-base-content/80 mt-2 text-sm">
                  Sum of ordering costs and holding costs. EOQ minimizes this value.
                </p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Reorder Point</h3>
                <p className="text-base-content font-mono mt-2">Lead Time × Daily Demand + Safety Stock</p>
                <p className="text-base-content/80 mt-2 text-sm">
                  When to place the order. Combine with EOQ for complete ordering strategy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Optimize ordering with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip inventory management gives you the demand data and stock visibility you need to calculate EOQ and set
            smart reorder points. Track stock levels, get low-stock alerts, and maintain accurate counts.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/learn/guide/how-to-set-reorder-points" className="btn btn-outline btn-secondary">
              Learn About Reorder Points
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover</h3>
                <p className="text-base-content/80 text-sm">How many times you sell through inventory per year.</p>
              </div>
            </Link>
            <Link
              href="/learn/tools/reorder-point-calculator"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Reorder Point Calculator</h3>
                <p className="text-base-content/80 text-sm">Calculate when to place your next order.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/how-to-set-reorder-points"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">How to Set Reorder Points</h3>
                <p className="text-base-content/80 text-sm">Complete guide to setting optimal reorder levels.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={EOQ_FAQS} />
    </div>
  )
}
