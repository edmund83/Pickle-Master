/**
 * Cycle Count Sheet Template Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (template page hero)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 *
 * Primary keyword: "cycle count template"
 * Secondary keywords: "inventory count sheet", "physical inventory template"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Free Cycle Count Sheet Template | Inventory Audit Template',
  description:
    'Download a free cycle count sheet template for physical inventory counts. Schedule counts, record results, and track variances. PDF and Excel formats.',
  pathname: '/templates/cycle-count-sheet',
})

const COUNT_FIELDS = [
  { name: 'Location', description: 'Where the count is being performed', example: 'Aisle 3, Shelf B' },
  { name: 'Item Name / SKU', description: 'The item being counted', example: 'Widget A (WGT-001)' },
  { name: 'Expected Quantity', description: 'What the system says should be there', example: '50' },
  { name: 'Counted Quantity', description: 'What you actually count', example: '48' },
  { name: 'Variance', description: 'Difference between expected and counted', example: '-2' },
  { name: 'Counter', description: 'Who performed the count', example: 'John D.' },
  { name: 'Date / Time', description: 'When the count was performed', example: '2026-01-02 14:30' },
  { name: 'Notes', description: 'Reason for variance or other observations', example: '2 units damaged' },
]

const SCHEDULE_TYPES = [
  {
    name: 'ABC Analysis',
    description: 'Count A-items weekly, B-items monthly, C-items quarterly',
    icon: 'icon-[tabler--sort-ascending-letters]',
  },
  {
    name: 'Zone Rotation',
    description: 'Count one zone or aisle each day until all are covered',
    icon: 'icon-[tabler--map-pin]',
  },
  {
    name: 'Random Sampling',
    description: 'Randomly select items to count each period',
    icon: 'icon-[tabler--dice]',
  },
  {
    name: 'High-Velocity Focus',
    description: 'Count fast-moving items more frequently',
    icon: 'icon-[tabler--bolt]',
  },
]

export default function CycleCountSheetPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Templates', pathname: '/learn/templates' },
          { name: 'Cycle Count Sheet', pathname: '/learn/templates/cycle-count-sheet' },
        ])}
      />

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/templates" className="text-primary text-sm hover:underline">
            ← Templates
          </Link>
          <span className="badge badge-soft badge-neutral">Free Download</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Free Cycle Count Sheet Template
        </h1>
        <p className="text-base-content/80 mt-4 text-lg">
          A template for conducting physical inventory counts. Record what you count, compare to expected quantities,
          and track variances. Works for cycle counts or full physical inventories.
        </p>

        {/* Download Section */}
        <div className="mt-8 rounded-box bg-base-200 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base-content text-xl font-semibold">Download the template</h2>
              <p className="text-base-content/80 mt-1">
                PDF for printing, or Excel for digital recording.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="btn btn-primary btn-gradient"
                disabled
                title="Coming soon"
              >
                <span className="icon-[tabler--file-type-pdf] size-5"></span>
                Download PDF (Coming Soon)
              </button>
              <button
                className="btn btn-outline btn-secondary"
                disabled
                title="Coming soon"
              >
                <span className="icon-[tabler--file-type-xls] size-5"></span>
                Download Excel (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Template Fields */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Fields included</h2>
          <p className="text-base-content/80 mt-2">
            The template captures all the information needed for accurate inventory counts.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Field</th>
                  <th className="text-base-content">Description</th>
                  <th className="text-base-content">Example</th>
                </tr>
              </thead>
              <tbody>
                {COUNT_FIELDS.map((field) => (
                  <tr key={field.name}>
                    <td className="text-base-content font-medium">{field.name}</td>
                    <td className="text-base-content/80">{field.description}</td>
                    <td className="text-base-content/60 font-mono text-sm">{field.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Count Scheduling Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Cycle count scheduling strategies</h2>
          <p className="text-base-content/80 mt-2">
            Choose a counting strategy that fits your operation. Cycle counting spreads the work over time instead of
            one big annual count.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SCHEDULE_TYPES.map((schedule) => (
              <div key={schedule.name} className="card card-border">
                <div className="card-body">
                  <span className={`${schedule.icon} text-primary size-8`}></span>
                  <h3 className="text-base-content mt-2 font-semibold">{schedule.name}</h3>
                  <p className="text-base-content/80 mt-1 text-sm">{schedule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">How to use this template</h2>
          <div className="mt-6 space-y-6">
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="text-base-content font-semibold">Plan your count</h3>
                <p className="text-base-content/80 mt-1">
                  Decide which items or locations to count. Pre-fill the expected quantities from your inventory system.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="text-base-content font-semibold">Conduct the count</h3>
                <p className="text-base-content/80 mt-1">
                  Go to each location and physically count items. Record the counted quantity. For blind counts, hide
                  the expected column until after counting.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="text-base-content font-semibold">Calculate variances</h3>
                <p className="text-base-content/80 mt-1">
                  Compare counted to expected. Note any discrepancies and document the likely cause.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                4
              </div>
              <div>
                <h3 className="text-base-content font-semibold">Investigate and adjust</h3>
                <p className="text-base-content/80 mt-1">
                  Recount items with large variances. After verification, update your inventory system with the correct
                  counts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Mistakes Section */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Common cycle count mistakes</h2>
          <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-2">
            <li>
              <strong>Counting during active operations</strong> — Stock moves while you count, causing false variances
            </li>
            <li>
              <strong>Skipping recounts</strong> — Large variances should always be verified before adjusting
            </li>
            <li>
              <strong>Not documenting reasons</strong> — Knowing why variances occur helps prevent future issues
            </li>
            <li>
              <strong>Infrequent counting</strong> — Problems compound when counts happen too rarely
            </li>
            <li>
              <strong>Ignoring patterns</strong> — Repeated variances in the same location or item signal a process
              problem
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Simplify counts with Nook</h2>
          <p className="text-base-content/80 mt-2">
            Nook has a built-in cycle count workflow. Scan items to count, see expected vs. actual in real-time, and
            flag variances automatically. No paper sheets, no data entry.
          </p>
          <ul className="text-base-content/80 mt-4 space-y-2">
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Scan to count — no typing
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Automatic variance highlighting
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Works offline in the warehouse
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Full audit trail of every adjustment
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/solutions/warehouse-inventory" className="btn btn-outline btn-secondary">
              Warehouse Features
            </Link>
          </div>
        </div>

        {/* Related Templates */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related templates</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/templates/inventory-spreadsheet"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--table] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 font-semibold">Inventory Spreadsheet</h3>
                <p className="text-base-content/80 text-sm">Basic inventory tracking spreadsheet template.</p>
              </div>
            </Link>
            <Link
              href="/learn/tools/reorder-point-calculator"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--calculator] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 font-semibold">Reorder Point Calculator</h3>
                <p className="text-base-content/80 text-sm">Calculate when to reorder based on lead time and demand.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
