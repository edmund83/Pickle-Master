/**
 * FIFO vs LIFO Glossary Page
 * Primary keyword: "fifo vs lifo"
 * Secondary keywords: "fifo vs lifo inventory", "first in first out vs last in first out"
 * Est. volume: 100+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'FIFO vs LIFO | Inventory Valuation Methods Explained',
  description:
    'Learn the difference between FIFO (First In, First Out) and LIFO (Last In, First Out) inventory methods. Understand tax implications, pros, cons, and when to use each.',
  pathname: '/learn/glossary/fifo-vs-lifo',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is the difference between FIFO and LIFO?',
    answer:
      'FIFO (First In, First Out) assumes oldest inventory is sold first. LIFO (Last In, First Out) assumes newest inventory is sold first. They affect which costs are assigned to COGS and ending inventory.',
  },
  {
    question: 'What is FIFO inventory method?',
    answer:
      'FIFO assigns the cost of the oldest inventory to Cost of Goods Sold. Remaining inventory reflects newer, often higher costs. This typically results in higher ending inventory value and higher reported profits during inflation.',
  },
  {
    question: 'What is LIFO inventory method?',
    answer:
      'LIFO assigns the cost of the newest inventory to Cost of Goods Sold. During inflation, this results in higher COGS, lower profits, and lower taxes. However, ending inventory shows older, often understated costs.',
  },
  {
    question: 'Which is better: FIFO or LIFO?',
    answer:
      'It depends on your goals. FIFO shows higher profits and is required for IFRS reporting. LIFO reduces taxes during inflation but is only allowed under US GAAP. Most small businesses and international companies use FIFO.',
  },
  {
    question: 'Is LIFO legal?',
    answer:
      'LIFO is permitted under US GAAP but prohibited under IFRS (International Financial Reporting Standards). Most countries outside the US require FIFO or weighted average methods.',
  },
  {
    question: 'Which method do most businesses use?',
    answer:
      'FIFO is the most common method globally because it is simpler, allowed under all accounting standards, and matches the physical flow of most inventory (especially perishables).',
  },
  {
    question: 'What is the weighted average method?',
    answer:
      'Weighted average calculates COGS using the average cost of all inventory available during the period. It smooths out price fluctuations and is simpler than tracking specific costs.',
  },
  {
    question: 'How does inflation affect FIFO vs LIFO?',
    answer:
      'During inflation, FIFO results in lower COGS (older, cheaper costs) and higher profits/taxes. LIFO results in higher COGS (newer, higher costs) and lower profits/taxes. The opposite occurs during deflation.',
  },
]

export default function FifoVsLifoPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'FIFO vs LIFO', pathname: '/learn/glossary/fifo-vs-lifo' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Accounting</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">FIFO vs LIFO</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          <strong>FIFO</strong> (First In, First Out) and <strong>LIFO</strong> (Last In, First Out) are inventory
          valuation methods that determine how costs are assigned to goods sold and remaining inventory. Your choice
          affects reported profits, taxes, and balance sheet values.
        </p>

        {/* Quick Definitions */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-box bg-base-200 p-6">
            <h2 className="text-base-content text-xl font-semibold">FIFO</h2>
            <p className="text-base-content/60 text-sm">First In, First Out</p>
            <p className="text-base-content/80 mt-4">
              The oldest inventory costs are assigned to Cost of Goods Sold first. Ending inventory reflects the most
              recent (often higher) costs.
            </p>
            <div className="mt-4 rounded-lg bg-base-100 p-4">
              <p className="text-base-content text-sm">
                <strong>Think of it like:</strong> A grocery store shelf where older products are sold before newer
                ones.
              </p>
            </div>
          </div>

          <div className="rounded-box bg-base-200 p-6">
            <h2 className="text-base-content text-xl font-semibold">LIFO</h2>
            <p className="text-base-content/60 text-sm">Last In, First Out</p>
            <p className="text-base-content/80 mt-4">
              The newest inventory costs are assigned to Cost of Goods Sold first. Ending inventory reflects the oldest
              (often lower) costs.
            </p>
            <div className="mt-4 rounded-lg bg-base-100 p-4">
              <p className="text-base-content text-sm">
                <strong>Think of it like:</strong> A stack of plates where you take from the top (newest) first.
              </p>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Example: How They Differ</h2>
          <p className="text-base-content/80 mt-2">Imagine you purchased inventory at different prices:</p>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Purchase</th>
                  <th className="text-base-content text-right">Units</th>
                  <th className="text-base-content text-right">Cost/Unit</th>
                  <th className="text-base-content text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content">January (oldest)</td>
                  <td className="text-base-content text-right">100</td>
                  <td className="text-base-content text-right">$10</td>
                  <td className="text-base-content text-right">$1,000</td>
                </tr>
                <tr>
                  <td className="text-base-content">March</td>
                  <td className="text-base-content text-right">100</td>
                  <td className="text-base-content text-right">$12</td>
                  <td className="text-base-content text-right">$1,200</td>
                </tr>
                <tr>
                  <td className="text-base-content">June (newest)</td>
                  <td className="text-base-content text-right">100</td>
                  <td className="text-base-content text-right">$15</td>
                  <td className="text-base-content text-right">$1,500</td>
                </tr>
                <tr className="bg-base-200">
                  <td className="text-base-content font-semibold">Total Available</td>
                  <td className="text-base-content text-right font-semibold">300</td>
                  <td className="text-base-content text-right">-</td>
                  <td className="text-base-content text-right font-semibold">$3,700</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-base-content/80 mt-6">If you sold 150 units:</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-base-300 p-4">
              <h3 className="text-base-content font-semibold">FIFO (oldest first)</h3>
              <p className="text-base-content/80 mt-2 text-sm">
                100 units @ $10 = $1,000
                <br />
                50 units @ $12 = $600
                <br />
                <strong className="text-primary">COGS = $1,600</strong>
              </p>
              <p className="text-base-content/60 mt-2 text-xs">Remaining inventory: 150 units @ $13.40 avg = $2,100</p>
            </div>
            <div className="rounded-lg border border-base-300 p-4">
              <h3 className="text-base-content font-semibold">LIFO (newest first)</h3>
              <p className="text-base-content/80 mt-2 text-sm">
                100 units @ $15 = $1,500
                <br />
                50 units @ $12 = $600
                <br />
                <strong className="text-primary">COGS = $2,100</strong>
              </p>
              <p className="text-base-content/60 mt-2 text-xs">Remaining inventory: 150 units @ $10.67 avg = $1,600</p>
            </div>
          </div>
          <p className="text-base-content/80 mt-4">
            In this inflationary example, LIFO shows $500 higher COGS and $500 lower profits/taxes.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">FIFO vs LIFO Comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Factor</th>
                  <th className="text-base-content">FIFO</th>
                  <th className="text-base-content">LIFO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">COGS during inflation</td>
                  <td className="text-base-content/80">Lower (older costs)</td>
                  <td className="text-base-content/80">Higher (newer costs)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Reported profits (inflation)</td>
                  <td className="text-base-content/80">Higher</td>
                  <td className="text-base-content/80">Lower</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Tax liability (inflation)</td>
                  <td className="text-base-content/80">Higher</td>
                  <td className="text-base-content/80">Lower</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Ending inventory value</td>
                  <td className="text-base-content/80">Higher (newer costs)</td>
                  <td className="text-base-content/80">Lower (older costs)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">IFRS allowed?</td>
                  <td className="text-success">Yes</td>
                  <td className="text-error">No</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">US GAAP allowed?</td>
                  <td className="text-success">Yes</td>
                  <td className="text-success">Yes</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Matches physical flow</td>
                  <td className="text-base-content/80">Usually yes</td>
                  <td className="text-base-content/80">Rarely</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* When to Use */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">When to Use Each Method</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card card-border bg-success/5">
              <div className="card-body">
                <h3 className="text-success flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--check] size-5"></span>
                  Use FIFO When:
                </h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>You have perishable goods</li>
                  <li>You report under IFRS</li>
                  <li>You want to show higher profits for investors</li>
                  <li>Inventory costs are relatively stable</li>
                  <li>You want simpler, more intuitive tracking</li>
                </ul>
              </div>
            </div>
            <div className="card card-border bg-info/5">
              <div className="card-body">
                <h3 className="text-info flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--info-circle] size-5"></span>
                  Use LIFO When:
                </h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>You are in the US and use GAAP</li>
                  <li>You want to reduce tax liability during inflation</li>
                  <li>You have non-perishable goods</li>
                  <li>Inventory costs are rising consistently</li>
                  <li>You prioritize cash flow over reported profits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Track inventory costs with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip helps you track purchase costs and maintain accurate inventory valuation. Import cost data, track
            price changes over time, and export reports for your accountant.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/learn/glossary/cost-of-goods-sold" className="btn btn-outline btn-secondary">
              Learn About COGS
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/glossary/cost-of-goods-sold"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Cost of Goods Sold</h3>
                <p className="text-base-content/80 text-sm">How FIFO/LIFO affects your COGS.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover</h3>
                <p className="text-base-content/80 text-sm">Measuring how fast inventory sells.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
