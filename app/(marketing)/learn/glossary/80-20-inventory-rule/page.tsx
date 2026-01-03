/**
 * 80/20 Inventory Rule (Pareto Principle) Glossary Page
 * Primary keyword: "80 20 inventory rule"
 * Secondary keywords: "pareto principle inventory", "ABC inventory analysis"
 * Est. volume: 139+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: '80/20 Inventory Rule | Pareto Principle for Inventory Management',
  description:
    'Learn how the 80/20 rule (Pareto Principle) applies to inventory management. Focus on the vital few items that drive most of your revenue.',
  pathname: '/learn/glossary/80-20-inventory-rule',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is the 80/20 inventory rule?',
    answer:
      'The 80/20 rule (Pareto Principle) states that roughly 80% of your sales come from 20% of your products. It helps prioritize inventory management efforts on the items that matter most.',
  },
  {
    question: 'How do I apply the 80/20 rule to inventory?',
    answer:
      'Analyze your sales data to identify which 20% of products generate 80% of revenue. Focus your inventory management, counting, and reorder attention on these high-value items first.',
  },
  {
    question: 'What is ABC inventory analysis?',
    answer:
      'ABC analysis extends the 80/20 rule: A-items (top 20%, 80% of value) get the most attention, B-items (next 30%, 15% of value) get moderate attention, and C-items (bottom 50%, 5% of value) get minimal attention.',
  },
  {
    question: 'Why is the 80/20 rule important for inventory?',
    answer:
      'It prevents you from treating all inventory equally. By focusing resources on A-items, you reduce stockouts on high-value products while spending less time on low-impact items.',
  },
  {
    question: 'How often should I review ABC classifications?',
    answer:
      'Review quarterly or when you notice significant changes in demand patterns. Seasonal products may shift categories throughout the year.',
  },
  {
    question: 'Does the 80/20 rule apply to all businesses?',
    answer:
      'The exact percentages vary, but most businesses see a similar pattern where a small portion of products drives most revenue. The principle applies across retail, wholesale, and manufacturing.',
  },
]

export default function EightyTwentyRulePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: '80/20 Inventory Rule', pathname: '/learn/glossary/80-20-inventory-rule' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Strategy</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">80/20 Inventory Rule</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          The <strong>80/20 rule</strong> (Pareto Principle) applied to inventory states that approximately 80% of your
          sales come from 20% of your products. This insight helps you prioritize where to focus your inventory
          management efforts.
        </p>

        {/* Visual Representation */}
        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold">The 80/20 Principle</h2>
          <div className="mt-6 flex flex-col items-center gap-4 md:flex-row">
            <div className="text-center">
              <div className="bg-primary text-primary-content flex size-24 items-center justify-center rounded-full text-3xl font-bold">
                20%
              </div>
              <p className="text-base-content mt-2 font-medium">of your products</p>
            </div>
            <span className="text-base-content/40 text-4xl">→</span>
            <div className="text-center">
              <div className="bg-success text-success-content flex size-24 items-center justify-center rounded-full text-3xl font-bold">
                80%
              </div>
              <p className="text-base-content mt-2 font-medium">of your revenue</p>
            </div>
          </div>
          <p className="text-base-content/80 mt-6 text-center">
            Focus your inventory management efforts on this critical 20%.
          </p>
        </div>

        {/* ABC Analysis */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">ABC Analysis: Extending the 80/20 Rule</h2>
          <p className="text-base-content/80 mt-2">
            ABC analysis classifies inventory into three categories based on value contribution:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card card-border border-primary/30 bg-primary/5">
              <div className="card-body">
                <h3 className="text-primary text-xl font-bold">A Items</h3>
                <p className="text-base-content text-sm">Top 20% of SKUs</p>
                <p className="text-base-content/80 mt-2">
                  Account for ~80% of total value. Require tight control, frequent counting, and optimized reorder
                  points.
                </p>
                <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                  <li>Weekly cycle counts</li>
                  <li>Precise safety stock</li>
                  <li>Priority supplier relationships</li>
                </ul>
              </div>
            </div>

            <div className="card card-border border-secondary/30 bg-secondary/5">
              <div className="card-body">
                <h3 className="text-secondary text-xl font-bold">B Items</h3>
                <p className="text-base-content text-sm">Next 30% of SKUs</p>
                <p className="text-base-content/80 mt-2">
                  Account for ~15% of total value. Moderate control with periodic review. Balance between A and C
                  approaches.
                </p>
                <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                  <li>Monthly cycle counts</li>
                  <li>Standard reorder rules</li>
                  <li>Regular supplier check-ins</li>
                </ul>
              </div>
            </div>

            <div className="card card-border border-neutral/30 bg-base-200">
              <div className="card-body">
                <h3 className="text-base-content text-xl font-bold">C Items</h3>
                <p className="text-base-content/60 text-sm">Bottom 50% of SKUs</p>
                <p className="text-base-content/80 mt-2">
                  Account for only ~5% of total value. Simplify management with basic controls and less frequent
                  attention.
                </p>
                <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                  <li>Quarterly or annual counts</li>
                  <li>Higher safety stock (simpler)</li>
                  <li>Automated reordering</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How to Classify */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">How to Classify Your Inventory</h2>
          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full font-bold">
                1
              </span>
              <div>
                <h3 className="text-base-content font-semibold">Export your sales data</h3>
                <p className="text-base-content/80 text-sm">Pull annual sales by SKU from your inventory system.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full font-bold">
                2
              </span>
              <div>
                <h3 className="text-base-content font-semibold">Calculate revenue per SKU</h3>
                <p className="text-base-content/80 text-sm">Multiply units sold by unit price for each product.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full font-bold">
                3
              </span>
              <div>
                <h3 className="text-base-content font-semibold">Sort by revenue (highest first)</h3>
                <p className="text-base-content/80 text-sm">Rank all products from highest to lowest revenue.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full font-bold">
                4
              </span>
              <div>
                <h3 className="text-base-content font-semibold">Calculate cumulative percentage</h3>
                <p className="text-base-content/80 text-sm">
                  Add running totals; products reaching 80% of total revenue are A items.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full font-bold">
                5
              </span>
              <div>
                <h3 className="text-base-content font-semibold">Assign categories</h3>
                <p className="text-base-content/80 text-sm">
                  A = top 80% of value, B = next 15%, C = remaining 5%.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Focus on what matters with Nook</h2>
          <p className="text-base-content/80 mt-2">
            Nook helps you identify and track your most valuable inventory. Use tags, filters, and reports to focus
            your attention on the items that drive your business.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/learn/glossary/inventory-turnover" className="btn btn-outline btn-secondary">
              Learn About Turnover
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover</h3>
                <p className="text-base-content/80 text-sm">A items typically have higher turnover.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/cycle-counting"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Cycle Counting</h3>
                <p className="text-base-content/80 text-sm">Count A items more frequently than C items.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
