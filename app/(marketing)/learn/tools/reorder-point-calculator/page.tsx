/**
 * Reorder Point Calculator Tool Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (tool page hero)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 *
 * Primary keyword: "reorder point calculator"
 * Secondary keywords: "calculate reorder point", "reorder level formula"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'
import { ReorderPointCalculator } from './ReorderPointCalculator'

export const metadata: Metadata = marketingMetadata({
  title: 'Free Reorder Point Calculator | Calculate When to Reorder',
  description:
    'Calculate your reorder point based on lead time, daily demand, and safety stock. Know exactly when to place orders to avoid stockouts.',
  pathname: '/tools/reorder-point-calculator',
})

export default function ReorderPointCalculatorPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Tools', pathname: '/learn/tools' },
          { name: 'Reorder Point Calculator', pathname: '/learn/tools/reorder-point-calculator' },
        ])}
      />

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/tools" className="text-primary text-sm hover:underline">
            ← Tools
          </Link>
          <span className="badge badge-soft badge-success">Free Tool</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Reorder Point Calculator
        </h1>
        <p className="text-base-content/80 mt-4 text-lg">
          Calculate the inventory level at which you should place a new order. The reorder point accounts for lead time
          and safety stock to prevent stockouts.
        </p>

        {/* Calculator Component */}
        <ReorderPointCalculator />

        {/* Formula Explanation */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">The formula</h2>
          <div className="mt-4 rounded-lg bg-base-200 p-6 text-center">
            <p className="text-base-content text-lg font-mono">
              Reorder Point = (<span className="text-primary">Lead Time</span> ×{' '}
              <span className="text-secondary">Daily Demand</span>) + <span className="text-accent">Safety Stock</span>
            </p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-base-content font-semibold">Lead Time</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Days between placing an order and receiving it. Include shipping, processing, and any buffer.
              </p>
            </div>
            <div>
              <h3 className="text-base-content font-semibold">Daily Demand</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Average units sold or used per day. Calculate from historical sales data.
              </p>
            </div>
            <div>
              <h3 className="text-base-content font-semibold">Safety Stock</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Extra inventory to cover demand variability and supply delays. Higher for critical items.
              </p>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Example calculation</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <tbody>
                <tr>
                  <td className="text-base-content">Lead time</td>
                  <td className="text-base-content text-right">7 days</td>
                </tr>
                <tr>
                  <td className="text-base-content">Daily demand</td>
                  <td className="text-base-content text-right">20 units/day</td>
                </tr>
                <tr>
                  <td className="text-base-content">Safety stock</td>
                  <td className="text-base-content text-right">50 units</td>
                </tr>
                <tr className="bg-base-200">
                  <td className="text-base-content font-semibold">Reorder point</td>
                  <td className="text-primary text-right font-semibold">(7 × 20) + 50 = 190 units</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-base-content/80 mt-4">
            When inventory drops to 190 units, place a new order. This gives you enough stock to cover the 7-day lead
            time (140 units) plus safety stock (50 units) for unexpected demand.
          </p>
        </div>

        {/* Tips Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Tips for setting reorder points</h2>
          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <span className="icon-[tabler--chart-line] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Use actual data</h3>
                <p className="text-base-content/80 text-sm">
                  Base daily demand on real sales history, not estimates. Account for seasonality if demand varies.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="icon-[tabler--truck] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Pad your lead time</h3>
                <p className="text-base-content/80 text-sm">
                  Suppliers are sometimes late. Use worst-case lead time for critical items, average for others.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="icon-[tabler--shield-check] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Adjust safety stock by importance</h3>
                <p className="text-base-content/80 text-sm">
                  High-margin or critical items deserve more safety stock. Low-value items can run leaner.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="icon-[tabler--refresh] text-primary size-6 shrink-0 mt-1"></span>
              <div>
                <h3 className="text-base-content font-semibold">Review regularly</h3>
                <p className="text-base-content/80 text-sm">
                  Demand and lead times change. Review reorder points quarterly or when patterns shift.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Automate reorder alerts with Nook</h2>
          <p className="text-base-content/80 mt-2">
            Set reorder points per SKU in Nook and get automatic alerts when stock drops below the threshold. No more
            spreadsheets, no more manual checks.
          </p>
          <ul className="text-base-content/80 mt-4 space-y-2">
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Set reorder points per item
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Get email and in-app alerts
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              See low-stock dashboard at a glance
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Works for multiple locations
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/features/low-stock-alerts" className="btn btn-outline btn-secondary">
              See Low-Stock Alerts
            </Link>
          </div>
        </div>

        {/* Related Resources */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/guide/how-to-set-reorder-points"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--book] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 font-semibold">How to Set Reorder Points</h3>
                <p className="text-base-content/80 text-sm">Complete guide to calculating and setting reorder points.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/economic-order-quantity"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--calculator] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 font-semibold">Economic Order Quantity (EOQ)</h3>
                <p className="text-base-content/80 text-sm">Calculate how much to order, not just when.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
