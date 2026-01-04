/**
 * Tools Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (hub page hero)
 * - Features: /marketing-ui/features/features-8 (tool cards)
 *
 * Primary keyword: "inventory management tools"
 * Secondary keywords: "inventory calculators", "reorder point calculator"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Free Inventory Tools | Calculators & Resources',
  description:
    'Free inventory management tools and calculators. Calculate reorder points, EOQ, and more. Optimize your inventory without spreadsheets.',
  pathname: '/tools',
})

const TOOLS = [
  {
    title: 'Reorder Point Calculator',
    slug: 'reorder-point-calculator',
    description: 'Calculate when to reorder based on lead time, daily demand, and safety stock.',
    icon: 'icon-[tabler--calculator]',
    status: 'Available',
  },
]

export default function ToolsPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Tools', pathname: '/tools' },
        ])}
      />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Free Resources</p>
          <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
            Free Inventory Tools
          </h1>
          <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
            Online calculators and tools to help you manage inventory smarter. No signup required.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <span className={`${tool.icon} text-primary size-10`}></span>
                  <span className="badge badge-success badge-soft">{tool.status}</span>
                </div>
                <h2 className="text-base-content mt-4 text-xl font-semibold">{tool.title}</h2>
                <p className="text-base-content/80 mt-2">{tool.description}</p>
                <div className="mt-4">
                  <span className="text-primary text-sm font-medium">Use tool →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-box bg-base-200 p-8 text-center">
          <h2 className="text-base-content text-2xl font-semibold">Want all these calculations automated?</h2>
          <p className="text-base-content/80 mx-auto mt-3 max-w-2xl">
            StockZip inventory management calculates reorder points, tracks stock levels, and alerts you when it is time to
            order. Start free, upgrade when you are ready.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/features/low-stock-alerts" className="btn btn-outline btn-secondary btn-lg">
              See Low-Stock Alerts
            </Link>
          </div>
        </div>

        {/* Related Resources */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link
              href="/learn/templates"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--file-download] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Templates</h3>
                <p className="text-base-content/80 mt-2">Download free inventory spreadsheet templates.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--book] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Glossary</h3>
                <p className="text-base-content/80 mt-2">Key terms and definitions for inventory management.</p>
              </div>
            </Link>
            <Link
              href="/learn"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--school] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Learn Center</h3>
                <p className="text-base-content/80 mt-2">Guides and tutorials for inventory best practices.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
