/**
 * Inventory Spreadsheet Template Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (template page hero)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 *
 * Primary keyword: "inventory spreadsheet template"
 * Secondary keywords: "inventory tracking spreadsheet", "free inventory template"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/learn/templates/inventory-spreadsheet',
    title: 'Free Inventory Spreadsheet Template | Excel & Google Sheets',
    description:
      'Download a free inventory spreadsheet template for Excel or Google Sheets. Track items, quantities, locations, and values. Ready to import into StockZip.',
  })
}

const COLUMNS = [
  { name: 'Item Name', description: 'The name or description of the item', example: 'Widget A' },
  { name: 'SKU', description: 'Unique identifier for the item', example: 'WGT-001' },
  { name: 'Barcode', description: 'UPC, EAN, or custom barcode number', example: '012345678901' },
  { name: 'Category', description: 'Product category or type', example: 'Electronics' },
  { name: 'Location', description: 'Where the item is stored', example: 'Warehouse A, Shelf 3' },
  { name: 'Quantity', description: 'Current stock count', example: '150' },
  { name: 'Unit', description: 'Unit of measure', example: 'Each' },
  { name: 'Cost', description: 'Cost per unit', example: '$5.00' },
  { name: 'Price', description: 'Selling price per unit', example: '$12.99' },
  { name: 'Reorder Point', description: 'Quantity that triggers reorder', example: '25' },
  { name: 'Supplier', description: 'Vendor or manufacturer', example: 'Acme Corp' },
  { name: 'Notes', description: 'Additional information', example: 'Fragile, handle with care' },
]

export default function InventorySpreadsheetTemplatePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Templates', pathname: '/learn/templates' },
          { name: 'Inventory Spreadsheet', pathname: '/learn/templates/inventory-spreadsheet' },
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
          Free Inventory Spreadsheet Template
        </h1>
        <p className="text-base-content/80 mt-4 text-lg">
          A simple, ready-to-use spreadsheet for tracking your inventory. Works with Excel, Google Sheets, or any
          CSV-compatible tool. Import directly into StockZip when you are ready to upgrade.
        </p>

        {/* Download Section */}
        <div className="mt-8 rounded-box bg-base-200 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base-content text-xl font-semibold">Download the template</h2>
              <p className="text-base-content/80 mt-1">
                Choose your preferred format. Both include the same columns and sample data.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="btn btn-primary"
                disabled
                title="Coming soon"
              >
                <span className="icon-[tabler--file-type-csv] size-5"></span>
                Download CSV (Coming Soon)
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

        {/* Template Preview */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Template columns</h2>
          <p className="text-base-content/80 mt-2">
            The template includes these columns. Add, remove, or customize as needed for your business.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Column</th>
                  <th className="text-base-content">Description</th>
                  <th className="text-base-content">Example</th>
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map((col) => (
                  <tr key={col.name}>
                    <td className="text-base-content font-medium">{col.name}</td>
                    <td className="text-base-content/80">{col.description}</td>
                    <td className="text-base-content/60 font-mono text-sm">{col.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <h3 className="text-base-content font-semibold">Download and open</h3>
                <p className="text-base-content/80 mt-1">
                  Download the CSV or Excel file. Open it in Excel, Google Sheets, or any spreadsheet app.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="text-base-content font-semibold">Customize columns</h3>
                <p className="text-base-content/80 mt-1">
                  Delete columns you do not need. Add columns for custom fields specific to your business.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="text-base-content font-semibold">Enter your inventory</h3>
                <p className="text-base-content/80 mt-1">
                  Replace the sample data with your actual items. Add one row per item or SKU.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                4
              </div>
              <div>
                <h3 className="text-base-content font-semibold">Keep it updated</h3>
                <p className="text-base-content/80 mt-1">
                  Update quantities as you receive, sell, or move inventory. Set a schedule for regular updates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations Section */}
        <div className="mt-10 rounded-box border border-warning/30 bg-warning/5 p-6">
          <h2 className="text-base-content flex items-center gap-2 text-lg font-semibold">
            <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
            Spreadsheet limitations
          </h2>
          <p className="text-base-content/80 mt-2">
            Spreadsheets are a good starting point, but they have limitations that become painful as you grow:
          </p>
          <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-2">
            <li>Manual updates are slow and error-prone</li>
            <li>No barcode scanning — you type everything</li>
            <li>Multiple versions create confusion</li>
            <li>No alerts when stock runs low</li>
            <li>No audit trail of who changed what</li>
            <li>Formulas break when columns are added or moved</li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Ready to upgrade from spreadsheets?</h2>
          <p className="text-base-content/80 mt-2">
            Import this spreadsheet directly into StockZip and get barcode scanning, low-stock alerts, and real-time
            tracking. Keep your data, lose the manual work.
          </p>
          <ul className="text-base-content/80 mt-4 space-y-2">
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Import CSV in minutes with field mapping
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Scan barcodes with your phone — no typing
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Get alerts before you run out of stock
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--circle-check] text-success size-5"></span>
              Full audit trail of every change
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary">
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Related Templates */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related templates</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/templates/cycle-count-sheet"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--clipboard-check] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 font-semibold">Cycle Count Sheet</h3>
                <p className="text-base-content/80 text-sm">Template for physical inventory counts and audits.</p>
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
