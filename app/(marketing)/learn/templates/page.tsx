/**
 * Templates Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (hub page hero)
 * - Features: /marketing-ui/features/features-8 (template cards)
 *
 * Primary keyword: "inventory templates"
 * Secondary keywords: "inventory spreadsheet template", "cycle count template"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Free Inventory Templates | Spreadsheets, Cycle Count Sheets & More',
  description:
    'Download free inventory management templates. Inventory spreadsheets, cycle count sheets, and more. Ready to use or import into Nook.',
  pathname: '/templates',
})

const TEMPLATES = [
  {
    title: 'Inventory Spreadsheet Template',
    slug: 'inventory-spreadsheet',
    description: 'A simple spreadsheet to track items, quantities, locations, and values. Ready for Excel or Google Sheets.',
    icon: 'icon-[tabler--table]',
    format: 'CSV / Excel',
    bestFor: 'Getting started with inventory tracking',
  },
  {
    title: 'Cycle Count Sheet',
    slug: 'cycle-count-sheet',
    description: 'A template for conducting physical inventory counts. Schedule, record, and track variances.',
    icon: 'icon-[tabler--clipboard-check]',
    format: 'PDF / Excel',
    bestFor: 'Auditing and verifying stock',
  },
]

export default function TemplatesPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Templates', pathname: '/templates' },
        ])}
      />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Free Resources</p>
          <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
            Free Inventory Templates
          </h1>
          <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
            Download ready-to-use inventory templates. Use them standalone or import into Nook to upgrade from
            spreadsheets to scan-based tracking.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TEMPLATES.map((template) => (
            <Link
              key={template.slug}
              href={`/templates/${template.slug}`}
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <span className={`${template.icon} text-primary size-10`}></span>
                  <span className="badge badge-outline">{template.format}</span>
                </div>
                <h2 className="text-base-content mt-4 text-xl font-semibold">{template.title}</h2>
                <p className="text-base-content/80 mt-2">{template.description}</p>
                <p className="text-base-content/60 mt-4 text-sm">
                  <strong>Best for:</strong> {template.bestFor}
                </p>
                <div className="mt-4">
                  <span className="text-primary text-sm font-medium">View template →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-box bg-base-200 p-8 text-center">
          <h2 className="text-base-content text-2xl font-semibold">Ready to upgrade from spreadsheets?</h2>
          <p className="text-base-content/80 mx-auto mt-3 max-w-2xl">
            Import your spreadsheet data into Nook and get barcode scanning, low-stock alerts, and real-time tracking.
            Start free, upgrade when you are ready.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Related Resources */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link
              href="/learn/tools/reorder-point-calculator"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--calculator] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Reorder Point Calculator</h3>
                <p className="text-base-content/80 mt-2">Calculate when to reorder based on lead time and demand.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--book] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Inventory Glossary</h3>
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
