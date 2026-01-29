/**
 * Cost of Goods Sold (COGS) Glossary Term Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (definition hero)
 * - Features: /marketing-ui/features/features-8 (formula breakdown)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "cost of goods sold"
 * Secondary keywords: "COGS formula", "how to calculate COGS", "cost of goods sold formula",
 *   "COGS calculator", "what is COGS"
 * Est. volume: 2,047+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'
import { COGSCalculator } from './COGSCalculator'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/learn/glossary/cost-of-goods-sold',
    title: 'Cost of Goods Sold (COGS) | Formula, Calculator & Examples',
    description:
      'Learn what Cost of Goods Sold (COGS) is, how to calculate it with the COGS formula, and why it matters for your business. Includes calculator and examples.',
  })
}

const COGS_FAQS: FaqItem[] = [
  {
    question: 'What is Cost of Goods Sold (COGS)?',
    answer:
      'Cost of Goods Sold (COGS) represents the direct costs of producing or purchasing the goods that a company sells during a specific period. It includes the cost of materials, direct labor, and manufacturing overhead directly tied to production.',
  },
  {
    question: 'What is the COGS formula?',
    answer:
      'The basic COGS formula is: COGS = Beginning Inventory + Purchases During Period - Ending Inventory. For manufacturers, it also includes direct labor and manufacturing overhead costs.',
  },
  {
    question: 'What costs are included in COGS?',
    answer:
      'COGS includes: cost of raw materials, cost of merchandise purchased for resale, direct labor costs, manufacturing overhead (factory rent, utilities, equipment depreciation), and freight-in costs. It excludes selling, general, and administrative expenses.',
  },
  {
    question: 'What costs are NOT included in COGS?',
    answer:
      'COGS excludes: marketing and advertising expenses, administrative salaries, office rent and utilities, sales commissions, shipping to customers, and research and development costs. These are operating expenses, not cost of goods.',
  },
  {
    question: 'How does COGS affect taxes?',
    answer:
      'COGS is deducted from revenue to calculate gross profit, which reduces taxable income. Higher COGS means lower gross profit and lower taxes. This is why accurate COGS calculation is important for both financial reporting and tax purposes.',
  },
  {
    question: 'What is the difference between COGS and expenses?',
    answer:
      'COGS are costs directly tied to producing or purchasing products you sell. Operating expenses are costs of running the business (rent, marketing, salaries) that are not directly tied to specific products. COGS appears above gross profit; operating expenses appear below.',
  },
  {
    question: 'How do I calculate COGS for a service business?',
    answer:
      'Service businesses typically do not have COGS since they do not sell physical products. However, some service businesses track "cost of services" which includes direct labor and materials used to deliver services.',
  },
  {
    question: 'What is a good COGS ratio?',
    answer:
      'COGS as a percentage of revenue varies by industry. Grocery stores might have 75-80% COGS, software companies might have 10-20%. Compare to your industry benchmarks. Lower COGS means higher gross margins and profitability.',
  },
  {
    question: 'How does inventory valuation method affect COGS?',
    answer:
      'The inventory valuation method (FIFO, LIFO, or weighted average) affects which costs are assigned to COGS versus ending inventory. FIFO assigns older (often lower) costs to COGS. LIFO assigns newer (often higher) costs. The choice impacts both COGS and taxes.',
  },
  {
    question: 'How often should I calculate COGS?',
    answer:
      'Most businesses calculate COGS monthly for management reporting and annually for tax purposes. Retail and e-commerce businesses with perpetual inventory systems can calculate COGS in real-time for each sale.',
  },
]

export default function CostOfGoodsSoldPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Cost of Goods Sold', pathname: '/learn/glossary/cost-of-goods-sold' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(COGS_FAQS)} />

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Accounting</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Cost of Goods Sold (COGS)</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          <strong>Cost of Goods Sold (COGS)</strong> is the direct cost of producing or purchasing the products a
          company sells. It includes materials, labor, and manufacturing costs directly tied to the goods sold during a
          specific period. COGS is subtracted from revenue to calculate gross profit.
        </p>

        {/* Formula Section */}
        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold">The COGS Formula</h2>
          <div className="mt-4 rounded-lg bg-base-100 p-6 text-center">
            <p className="text-base-content text-lg font-mono">
              COGS = <span className="text-primary">Beginning Inventory</span> +{' '}
              <span className="text-secondary">Purchases</span> -{' '}
              <span className="text-accent">Ending Inventory</span>
            </p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-base-content font-semibold">Beginning Inventory</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Value of inventory on hand at the start of the accounting period.
              </p>
            </div>
            <div>
              <h3 className="text-base-content font-semibold">Purchases</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Total cost of inventory purchased or manufactured during the period.
              </p>
            </div>
            <div>
              <h3 className="text-base-content font-semibold">Ending Inventory</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Value of inventory remaining at the end of the accounting period.
              </p>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Example Calculation</h2>
          <p className="text-base-content/80 mt-2">
            Let&apos;s calculate COGS for a retail business:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Component</th>
                  <th className="text-base-content text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content">Beginning Inventory (Jan 1)</td>
                  <td className="text-base-content text-right">$50,000</td>
                </tr>
                <tr>
                  <td className="text-base-content">Purchases During Year</td>
                  <td className="text-base-content text-right">$200,000</td>
                </tr>
                <tr>
                  <td className="text-base-content">Goods Available for Sale</td>
                  <td className="text-base-content text-right">$250,000</td>
                </tr>
                <tr>
                  <td className="text-base-content">Less: Ending Inventory (Dec 31)</td>
                  <td className="text-base-content text-right">($60,000)</td>
                </tr>
                <tr className="bg-base-200">
                  <td className="text-base-content font-semibold">Cost of Goods Sold</td>
                  <td className="text-primary text-right font-semibold">$190,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-base-content/80 mt-4">
            In this example, the business had $250,000 worth of goods available to sell. After subtracting the $60,000
            still in inventory at year end, COGS is $190,000 — the cost of the goods actually sold.
          </p>
        </div>

        {/* Interactive Calculator */}
        <COGSCalculator />

        {/* COGS for Different Business Types */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">COGS by Business Type</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Retail / Ecommerce</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  <strong>COGS includes:</strong> Cost of merchandise purchased for resale, freight-in costs,
                  import duties.
                </p>
                <p className="text-base-content/80 mt-2 text-sm">
                  <strong>Typical range:</strong> 60-80% of revenue
                </p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Manufacturing</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  <strong>COGS includes:</strong> Raw materials, direct labor, manufacturing overhead (factory rent,
                  equipment, utilities).
                </p>
                <p className="text-base-content/80 mt-2 text-sm">
                  <strong>Typical range:</strong> 40-70% of revenue
                </p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Service Business</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  <strong>COGS includes:</strong> Direct labor costs, materials used to deliver services. Many service
                  businesses have minimal or no COGS.
                </p>
                <p className="text-base-content/80 mt-2 text-sm">
                  <strong>Typical range:</strong> 0-40% of revenue
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COGS vs Operating Expenses */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">COGS vs Operating Expenses</h2>
          <p className="text-base-content/80 mt-2">
            Understanding the difference is critical for accurate financial reporting:
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Cost Type</th>
                  <th className="text-base-content">Included in COGS</th>
                  <th className="text-base-content">Operating Expense</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content">Raw materials / Merchandise</td>
                  <td className="text-success text-center">✓</td>
                  <td className="text-center">-</td>
                </tr>
                <tr>
                  <td className="text-base-content">Direct labor (factory workers)</td>
                  <td className="text-success text-center">✓</td>
                  <td className="text-center">-</td>
                </tr>
                <tr>
                  <td className="text-base-content">Factory rent / utilities</td>
                  <td className="text-success text-center">✓</td>
                  <td className="text-center">-</td>
                </tr>
                <tr>
                  <td className="text-base-content">Freight-in (shipping to you)</td>
                  <td className="text-success text-center">✓</td>
                  <td className="text-center">-</td>
                </tr>
                <tr>
                  <td className="text-base-content">Office rent / utilities</td>
                  <td className="text-center">-</td>
                  <td className="text-success text-center">✓</td>
                </tr>
                <tr>
                  <td className="text-base-content">Marketing / Advertising</td>
                  <td className="text-center">-</td>
                  <td className="text-success text-center">✓</td>
                </tr>
                <tr>
                  <td className="text-base-content">Sales commissions</td>
                  <td className="text-center">-</td>
                  <td className="text-success text-center">✓</td>
                </tr>
                <tr>
                  <td className="text-base-content">Shipping to customers</td>
                  <td className="text-center">-</td>
                  <td className="text-success text-center">✓</td>
                </tr>
                <tr>
                  <td className="text-base-content">Administrative salaries</td>
                  <td className="text-center">-</td>
                  <td className="text-success text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* How COGS Affects Financials */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">How COGS Affects Your Financials</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card card-border bg-success/5">
              <div className="card-body">
                <h3 className="text-success flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--chart-line] size-5"></span>
                  Gross Profit
                </h3>
                <p className="text-base-content font-mono mt-2">Revenue - COGS = Gross Profit</p>
                <p className="text-base-content/80 mt-2 text-sm">
                  Lower COGS means higher gross profit margin. This is the first indicator of business efficiency.
                </p>
              </div>
            </div>
            <div className="card card-border bg-info/5">
              <div className="card-body">
                <h3 className="text-info flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--receipt-tax] size-5"></span>
                  Tax Implications
                </h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  COGS is a deductible expense. Accurate COGS tracking ensures you are not overpaying on taxes. Choosing
                  FIFO vs LIFO affects your tax liability.
                </p>
              </div>
            </div>
            <div className="card card-border bg-warning/5">
              <div className="card-body">
                <h3 className="text-warning flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--package] size-5"></span>
                  Inventory Valuation
                </h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  COGS and ending inventory are linked. Overstate COGS and you understate inventory (and profit).
                  Accurate inventory counts are essential.
                </p>
              </div>
            </div>
            <div className="card card-border bg-secondary/5">
              <div className="card-body">
                <h3 className="text-secondary flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--trending-up] size-5"></span>
                  Pricing Decisions
                </h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Understanding your COGS per unit helps you set profitable prices. If COGS is 60% of price, you have a
                  40% gross margin to cover expenses and profit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Track inventory costs with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip inventory management gives you real-time visibility into stock levels, purchase costs, and valuation —
            the data you need to calculate accurate COGS. Track every item from receipt to sale.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/solutions/ecommerce-inventory" className="btn btn-outline btn-secondary">
              Ecommerce Inventory
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
                <p className="text-base-content/80 text-sm">COGS divided by average inventory value.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/fifo-vs-lifo"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">FIFO vs LIFO</h3>
                <p className="text-base-content/80 text-sm">Inventory valuation methods that affect COGS.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/markup-vs-margin"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Markup vs Margin</h3>
                <p className="text-base-content/80 text-sm">How to price products based on cost.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={COGS_FAQS} />
    </div>
  )
}
