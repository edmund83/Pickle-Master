/**
 * Inventory Turnover Glossary Term Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (definition hero)
 * - Features: /marketing-ui/features/features-8 (formula breakdown)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "inventory turnover ratio"
 * Secondary keywords: "inventory turnover formula", "how to calculate inventory turnover",
 *   "what is a good inventory turnover ratio", "inventory turnover calculator"
 * Est. volume: 1,100+ monthly (Sortly proof: 1,113 traffic, 248 keywords)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'
import { InventoryTurnoverCalculator } from './InventoryTurnoverCalculator'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory Turnover | Definition, Formula & How to Improve',
  description:
    'Learn what inventory turnover is, how to calculate the inventory turnover ratio, and strategies to improve it. Includes formula, examples, and benchmarks.',
  pathname: '/glossary/inventory-turnover',
})

const TURNOVER_FAQS: FaqItem[] = [
  {
    question: 'What is a good inventory turnover ratio?',
    answer:
      'It varies by industry. Grocery and perishables often see 12-20 turns per year. Retail clothing might be 4-6 turns. Luxury goods or heavy equipment might be 1-2 turns. Compare to your industry benchmarks, not a universal number.',
  },
  {
    question: 'How do I calculate inventory turnover?',
    answer:
      'Divide your Cost of Goods Sold (COGS) by your Average Inventory for the period. For example, if COGS is $500,000 and average inventory is $100,000, your turnover is 5 (you sold through your inventory 5 times that year).',
  },
  {
    question: 'What is the inventory turnover formula?',
    answer:
      'The inventory turnover formula is: Inventory Turnover = Cost of Goods Sold (COGS) / Average Inventory. Average Inventory is calculated as (Beginning Inventory + Ending Inventory) / 2.',
  },
  {
    question: 'What does a low inventory turnover mean?',
    answer:
      'Low turnover suggests slow-moving inventory. You might have too much stock, the wrong products, or pricing issues. It ties up cash and increases holding costs. However, some industries naturally have lower turnover.',
  },
  {
    question: 'What does a high inventory turnover mean?',
    answer:
      'High turnover means you are selling through inventory quickly. This is usually good — less cash tied up, lower holding costs. But if it is too high, you might be understocked and losing sales to stockouts.',
  },
  {
    question: 'How can I improve my inventory turnover?',
    answer:
      'Strategies include: better demand forecasting, reducing lead times, clearing slow-moving stock with promotions, adjusting reorder points, using ABC analysis to focus on high-velocity items, and improving supplier relationships.',
  },
  {
    question: 'What is days sales of inventory (DSI)?',
    answer:
      'DSI is the inverse of turnover, expressed in days. It shows how many days of inventory you have on hand. Calculate it as: 365 / Inventory Turnover. If turnover is 5, DSI is 73 days.',
  },
  {
    question: 'How often should I calculate inventory turnover?',
    answer:
      'Most businesses calculate inventory turnover monthly or quarterly to track trends. Annual calculations give a big-picture view, but more frequent monitoring helps you spot issues early and make timely adjustments.',
  },
  {
    question: 'Is inventory turnover the same as stock turnover?',
    answer:
      'Yes, inventory turnover and stock turnover are the same metric. "Stock" and "inventory" are often used interchangeably, especially in retail contexts. The formula and interpretation are identical.',
  },
  {
    question: 'Why is my inventory turnover decreasing?',
    answer:
      'Decreasing turnover could indicate: slowing sales, overstocking, obsolete inventory building up, seasonal effects, or increased lead times causing you to hold more safety stock. Review your sales trends and inventory aging reports.',
  },
]

export default function InventoryTurnoverPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Inventory Turnover', pathname: '/learn/glossary/inventory-turnover' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(TURNOVER_FAQS)} />

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Metrics</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Inventory Turnover</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          <strong>Inventory turnover</strong> is a ratio that measures how many times a business sells and replaces its
          inventory over a given period, typically a year. It indicates how efficiently a company manages its stock.
        </p>

        {/* Formula Section */}
        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold">The Formula</h2>
          <div className="mt-4 rounded-lg bg-base-100 p-6 text-center">
            <p className="text-base-content text-lg font-mono">
              Inventory Turnover = <span className="text-primary">Cost of Goods Sold (COGS)</span> /{' '}
              <span className="text-secondary">Average Inventory</span>
            </p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-base-content font-semibold">Cost of Goods Sold (COGS)</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                The direct costs of producing the goods you sold during the period. Found on your income statement.
              </p>
            </div>
            <div>
              <h3 className="text-base-content font-semibold">Average Inventory</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                (Beginning Inventory + Ending Inventory) / 2. Smooths out seasonal fluctuations.
              </p>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Example Calculation</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Metric</th>
                  <th className="text-base-content text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content">Annual COGS</td>
                  <td className="text-base-content text-right">$500,000</td>
                </tr>
                <tr>
                  <td className="text-base-content">Beginning Inventory</td>
                  <td className="text-base-content text-right">$80,000</td>
                </tr>
                <tr>
                  <td className="text-base-content">Ending Inventory</td>
                  <td className="text-base-content text-right">$120,000</td>
                </tr>
                <tr>
                  <td className="text-base-content">Average Inventory</td>
                  <td className="text-base-content text-right">$100,000</td>
                </tr>
                <tr className="bg-base-200">
                  <td className="text-base-content font-semibold">Inventory Turnover</td>
                  <td className="text-primary text-right font-semibold">5.0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-base-content/80 mt-4">
            In this example, the business sold through its inventory 5 times during the year. That means, on average,
            inventory sat for about 73 days before being sold (365 / 5 = 73 days).
          </p>
        </div>

        {/* Interactive Calculator */}
        <InventoryTurnoverCalculator />

        {/* Benchmarks Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Industry Benchmarks</h2>
          <p className="text-base-content/80 mt-2">
            Turnover varies significantly by industry. Here are typical ranges:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Grocery / Perishables</h3>
                <p className="text-primary text-2xl font-semibold">12-20</p>
                <p className="text-base-content/60 text-sm">turns per year</p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Retail Apparel</h3>
                <p className="text-primary text-2xl font-semibold">4-6</p>
                <p className="text-base-content/60 text-sm">turns per year</p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Electronics</h3>
                <p className="text-primary text-2xl font-semibold">6-10</p>
                <p className="text-base-content/60 text-sm">turns per year</p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Automotive Parts</h3>
                <p className="text-primary text-2xl font-semibold">4-8</p>
                <p className="text-base-content/60 text-sm">turns per year</p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Furniture</h3>
                <p className="text-primary text-2xl font-semibold">3-5</p>
                <p className="text-base-content/60 text-sm">turns per year</p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Heavy Equipment</h3>
                <p className="text-primary text-2xl font-semibold">1-2</p>
                <p className="text-base-content/60 text-sm">turns per year</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Improve Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">How to Improve Inventory Turnover</h2>
          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <span className="icon-[tabler--chart-line] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Better demand forecasting</h3>
                <p className="text-base-content/80 text-sm">
                  Use historical sales data and seasonality patterns to order the right quantities at the right time.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="icon-[tabler--clock] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Reduce lead times</h3>
                <p className="text-base-content/80 text-sm">
                  Work with suppliers to shorten delivery times. Shorter lead times mean you can order less safety stock.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="icon-[tabler--tag] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Clear slow-moving stock</h3>
                <p className="text-base-content/80 text-sm">
                  Use promotions, bundles, or liquidation to move dead stock. It frees up cash and warehouse space.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="icon-[tabler--bell] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Optimize reorder points</h3>
                <p className="text-base-content/80 text-sm">
                  Set reorder points per SKU based on lead time and demand variability. Avoid blanket thresholds.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="icon-[tabler--sort-ascending-letters] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Use ABC analysis</h3>
                <p className="text-base-content/80 text-sm">
                  Focus on A-items (high value, high velocity). These drive most of your turnover and deserve close
                  attention.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Track turnover with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip inventory management gives you real-time visibility into stock levels, movement history, and valuation
            — the data you need to calculate and improve your inventory turnover.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/features" className="btn btn-outline btn-secondary">
              See Features
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/learn/glossary/cost-of-goods-sold"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Cost of Goods Sold (COGS)</h3>
                <p className="text-base-content/80 text-sm">Direct costs of producing the goods you sold.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/economic-order-quantity"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Economic Order Quantity (EOQ)</h3>
                <p className="text-base-content/80 text-sm">The optimal order quantity that minimizes total costs.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/fifo-vs-lifo"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">FIFO vs LIFO</h3>
                <p className="text-base-content/80 text-sm">Inventory valuation methods that affect COGS and turnover.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={TURNOVER_FAQS} />
    </div>
  )
}
