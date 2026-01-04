/**
 * Markup vs Margin Glossary Term Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (definition hero)
 * - Features: /marketing-ui/features/features-8 (formula breakdown)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "markup vs margin"
 * Secondary keywords: "markup vs margin calculator", "difference between markup and margin",
 *   "margin vs markup formula", "how to calculate markup", "how to calculate margin"
 * Est. volume: 1,916+ monthly (inFlow proof: 1,916 traffic, 1,108 keywords)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'
import { MarkupMarginCalculator } from './MarkupMarginCalculator'

export const metadata: Metadata = marketingMetadata({
  title: 'Markup vs Margin | Difference, Formulas & Calculator',
  description:
    'Learn the difference between markup and margin, how to calculate each, and when to use them. Includes formulas, conversion chart, and interactive calculator.',
  pathname: '/learn/glossary/markup-vs-margin',
})

const MARKUP_MARGIN_FAQS: FaqItem[] = [
  {
    question: 'What is the difference between markup and margin?',
    answer:
      'Markup is the percentage added to cost to get the selling price (based on cost). Margin is the percentage of the selling price that is profit (based on price). For the same item, markup percentage is always higher than margin percentage.',
  },
  {
    question: 'What is the markup formula?',
    answer:
      'Markup = ((Price - Cost) / Cost) × 100. For example, if an item costs $50 and sells for $75, the markup is (($75 - $50) / $50) × 100 = 50%.',
  },
  {
    question: 'What is the margin formula?',
    answer:
      'Margin = ((Price - Cost) / Price) × 100. For example, if an item costs $50 and sells for $75, the margin is (($75 - $50) / $75) × 100 = 33.3%.',
  },
  {
    question: 'How do I convert markup to margin?',
    answer:
      'Margin = Markup / (1 + Markup). For example, a 50% markup equals 50% / 150% = 33.3% margin. Alternatively, Margin = Markup / (100 + Markup) × 100.',
  },
  {
    question: 'How do I convert margin to markup?',
    answer:
      'Markup = Margin / (1 - Margin). For example, a 33.3% margin equals 33.3% / 66.7% = 50% markup. Alternatively, Markup = Margin / (100 - Margin) × 100.',
  },
  {
    question: 'When should I use markup vs margin?',
    answer:
      'Use markup when setting prices based on your costs (common in wholesale and manufacturing). Use margin when analyzing profitability or comparing to industry benchmarks (common in retail and finance). Many businesses use both.',
  },
  {
    question: 'Why is markup always higher than margin?',
    answer:
      'Markup is calculated on the smaller number (cost), while margin is calculated on the larger number (price). The same dollar profit divided by a smaller base gives a larger percentage.',
  },
  {
    question: 'What is a good markup percentage?',
    answer:
      'It varies by industry. Grocery stores might use 10-15% markup. Apparel retail often uses 50-100% (keystone). Jewelry might use 100-300%. Your markup should cover overhead and leave desired profit.',
  },
  {
    question: 'What is a good profit margin?',
    answer:
      'Gross profit margins vary by industry: grocery 20-25%, apparel retail 45-55%, software 70-90%. Net profit margins are typically 5-20% after all expenses. Compare to your industry benchmarks.',
  },
  {
    question: 'What is keystone pricing?',
    answer:
      'Keystone pricing is a 100% markup, meaning you double your cost to get the selling price. A $50 cost becomes a $100 price. This gives a 50% margin. Common in apparel and home goods retail.',
  },
]

export default function MarkupVsMarginPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Markup vs Margin', pathname: '/learn/glossary/markup-vs-margin' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(MARKUP_MARGIN_FAQS)} />

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Pricing</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Markup vs Margin</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          <strong>Markup</strong> and <strong>margin</strong> both measure profitability, but they use different bases.
          Markup is the percentage added to your cost. Margin is the percentage of the selling price that is profit.
          Understanding both is essential for pricing and profitability analysis.
        </p>

        {/* Quick Answer */}
        <div className="mt-8 rounded-lg border-l-4 border-primary bg-primary/5 p-6">
          <h2 className="text-base-content font-semibold">Quick Answer</h2>
          <p className="text-base-content/80 mt-2">
            <strong>Markup</strong> = (Profit / Cost) × 100 — percentage of cost
            <br />
            <strong>Margin</strong> = (Profit / Price) × 100 — percentage of selling price
          </p>
          <p className="text-base-content/80 mt-2">
            Example: $50 cost, $75 price, $25 profit → <strong>50% markup</strong>, <strong>33.3% margin</strong>
          </p>
        </div>

        {/* Formulas Section */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-box bg-base-200 p-6">
            <h2 className="text-base-content text-xl font-semibold">Markup Formula</h2>
            <div className="mt-4 rounded-lg bg-base-100 p-4 text-center">
              <p className="text-base-content font-mono">
                Markup = (<span className="text-primary">Price - Cost</span>) /{' '}
                <span className="text-secondary">Cost</span> × 100
              </p>
            </div>
            <p className="text-base-content/80 mt-4 text-sm">
              Markup tells you what percentage you added to your cost. A 50% markup means you added half of your cost
              on top.
            </p>
            <div className="mt-4 rounded-lg bg-base-100 p-4">
              <p className="text-base-content text-sm">
                <strong>Example:</strong> Cost $50, Price $75
                <br />
                Markup = ($75 - $50) / $50 × 100 = <span className="text-primary font-semibold">50%</span>
              </p>
            </div>
          </div>

          <div className="rounded-box bg-base-200 p-6">
            <h2 className="text-base-content text-xl font-semibold">Margin Formula</h2>
            <div className="mt-4 rounded-lg bg-base-100 p-4 text-center">
              <p className="text-base-content font-mono">
                Margin = (<span className="text-primary">Price - Cost</span>) /{' '}
                <span className="text-secondary">Price</span> × 100
              </p>
            </div>
            <p className="text-base-content/80 mt-4 text-sm">
              Margin tells you what percentage of the selling price is profit. A 33% margin means one-third of your
              revenue is profit.
            </p>
            <div className="mt-4 rounded-lg bg-base-100 p-4">
              <p className="text-base-content text-sm">
                <strong>Example:</strong> Cost $50, Price $75
                <br />
                Margin = ($75 - $50) / $75 × 100 = <span className="text-primary font-semibold">33.3%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Visual Comparison</h2>
          <p className="text-base-content/80 mt-2">
            Same item, same profit — but markup and margin show different percentages:
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Markup Perspective</h3>
                <div className="mt-4 flex items-center gap-2">
                  <div className="bg-secondary/20 h-8 w-2/3 rounded-lg"></div>
                  <span className="text-base-content/60 text-sm">Cost: $50 (100%)</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="bg-primary/20 h-8 w-1/3 rounded-lg"></div>
                  <span className="text-base-content/60 text-sm">Profit: $25 (50% of cost)</span>
                </div>
                <p className="text-primary mt-4 text-lg font-semibold">50% Markup</p>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Margin Perspective</h3>
                <div className="mt-4 flex items-center gap-2">
                  <div className="bg-secondary/20 h-8 w-2/3 rounded-lg"></div>
                  <span className="text-base-content/60 text-sm">Cost: $50 (66.7%)</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="bg-primary/20 h-8 w-1/3 rounded-lg"></div>
                  <span className="text-base-content/60 text-sm">Profit: $25 (33.3% of price)</span>
                </div>
                <p className="text-primary mt-4 text-lg font-semibold">33.3% Margin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Chart */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Markup to Margin Conversion Chart</h2>
          <p className="text-base-content/80 mt-2">
            Use this table to quickly convert between markup and margin:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Markup %</th>
                  <th className="text-base-content">Margin %</th>
                  <th className="text-base-content">Example (Cost $100)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content">10%</td>
                  <td className="text-primary">9.1%</td>
                  <td className="text-base-content/80">Price $110, Profit $10</td>
                </tr>
                <tr>
                  <td className="text-base-content">20%</td>
                  <td className="text-primary">16.7%</td>
                  <td className="text-base-content/80">Price $120, Profit $20</td>
                </tr>
                <tr>
                  <td className="text-base-content">25%</td>
                  <td className="text-primary">20%</td>
                  <td className="text-base-content/80">Price $125, Profit $25</td>
                </tr>
                <tr>
                  <td className="text-base-content">33.3%</td>
                  <td className="text-primary">25%</td>
                  <td className="text-base-content/80">Price $133, Profit $33</td>
                </tr>
                <tr>
                  <td className="text-base-content">50%</td>
                  <td className="text-primary">33.3%</td>
                  <td className="text-base-content/80">Price $150, Profit $50</td>
                </tr>
                <tr className="bg-base-200">
                  <td className="text-base-content font-semibold">100% (Keystone)</td>
                  <td className="text-primary font-semibold">50%</td>
                  <td className="text-base-content/80">Price $200, Profit $100</td>
                </tr>
                <tr>
                  <td className="text-base-content">150%</td>
                  <td className="text-primary">60%</td>
                  <td className="text-base-content/80">Price $250, Profit $150</td>
                </tr>
                <tr>
                  <td className="text-base-content">200%</td>
                  <td className="text-primary">66.7%</td>
                  <td className="text-base-content/80">Price $300, Profit $200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Calculator */}
        <MarkupMarginCalculator />

        {/* When to Use Each */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">When to Use Markup vs Margin</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--tag] text-primary size-5"></span>
                  Use Markup When...
                </h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>Setting prices based on your product costs</li>
                  <li>Working in wholesale or manufacturing</li>
                  <li>Communicating pricing internally</li>
                  <li>Calculating prices for quotes</li>
                  <li>Your industry uses cost-based pricing standards</li>
                </ul>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--chart-pie] text-primary size-5"></span>
                  Use Margin When...
                </h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>Analyzing profitability and financial performance</li>
                  <li>Comparing to industry benchmarks</li>
                  <li>Reporting to investors or stakeholders</li>
                  <li>Working in retail or e-commerce</li>
                  <li>Making decisions about discounts and promotions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Common Mistakes to Avoid</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <h3 className="text-warning flex items-center gap-2 font-semibold">
                <span className="icon-[tabler--alert-triangle] size-5"></span>
                Confusing markup with margin
              </h3>
              <p className="text-base-content/80 mt-2 text-sm">
                A 30% markup is NOT a 30% margin. If you price at 30% markup expecting 30% margin, you will be short.
                30% markup = 23% margin.
              </p>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <h3 className="text-warning flex items-center gap-2 font-semibold">
                <span className="icon-[tabler--alert-triangle] size-5"></span>
                Ignoring overhead in markup
              </h3>
              <p className="text-base-content/80 mt-2 text-sm">
                Your markup must cover not just product cost, but also operating expenses (rent, labor, marketing). A
                50% markup may not leave enough after expenses.
              </p>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <h3 className="text-warning flex items-center gap-2 font-semibold">
                <span className="icon-[tabler--alert-triangle] size-5"></span>
                Applying discounts incorrectly
              </h3>
              <p className="text-base-content/80 mt-2 text-sm">
                A 20% discount on a 25% margin product wipes out most of your profit. Calculate margin impact before
                offering discounts.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Track costs and margins with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip inventory management tracks your item costs and helps you maintain visibility into your margins. Set
            cost prices, track purchase history, and understand your profitability per item.
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
              href="/learn/glossary/cost-of-goods-sold"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Cost of Goods Sold</h3>
                <p className="text-base-content/80 text-sm">Direct costs used to calculate margin.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover</h3>
                <p className="text-base-content/80 text-sm">How fast you sell through inventory.</p>
              </div>
            </Link>
            <Link
              href="/learn/tools/reorder-point-calculator"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Reorder Point Calculator</h3>
                <p className="text-base-content/80 text-sm">Calculate when to restock inventory.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={MARKUP_MARGIN_FAQS} />
    </div>
  )
}
