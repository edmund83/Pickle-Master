/**
 * Lot Number vs Serial Number Glossary Page
 * Primary keyword: "lot number vs serial number"
 * Secondary keywords: "difference between lot and serial number", "lot tracking"
 * Est. volume: 335+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Lot Number vs Serial Number | When to Use Each',
  description:
    'Learn the difference between lot numbers and serial numbers, when to use each, and how they help with traceability and recalls.',
  pathname: '/learn/glossary/lot-number-vs-serial-number',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is the difference between lot number and serial number?',
    answer:
      'A lot number identifies a batch of identical items made together. A serial number uniquely identifies a single individual item. Lot numbers group items; serial numbers distinguish them.',
  },
  {
    question: 'What is a lot number?',
    answer:
      'A lot number (or batch number) identifies a group of products manufactured or processed together under the same conditions. All items in a lot share the same lot number.',
  },
  {
    question: 'What is a serial number?',
    answer:
      'A serial number is a unique identifier assigned to an individual item. No two items ever share the same serial number. It allows tracking of specific units throughout their lifecycle.',
  },
  {
    question: 'When should I use lot tracking?',
    answer:
      'Use lot tracking for perishables (expiration dates), regulated products (pharma, food), chemicals, and any products where you may need to recall a batch. It is simpler than serial tracking.',
  },
  {
    question: 'When should I use serial tracking?',
    answer:
      'Use serial tracking for high-value items (electronics, equipment), warrantied products, assets that need individual history, and items with specific configurations or customizations.',
  },
  {
    question: 'Can I use both lot and serial numbers?',
    answer:
      'Yes, many industries use both. A product might have a lot number (for the production batch) and a serial number (for the specific unit). This provides both batch and individual traceability.',
  },
]

export default function LotVsSerialNumberPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Lot Number vs Serial Number', pathname: '/learn/glossary/lot-number-vs-serial-number' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Traceability</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Lot Number vs Serial Number</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          Both <strong>lot numbers</strong> and <strong>serial numbers</strong> enable traceability, but they work at
          different levels. Lot numbers group batches; serial numbers identify individual items.
        </p>

        {/* Visual Comparison */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-box bg-base-200 p-6">
            <h2 className="text-base-content text-xl font-semibold">Lot Number</h2>
            <p className="text-base-content/60 text-sm">Batch/Group Identifier</p>
            <div className="bg-base-100 mt-4 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex size-10 items-center justify-center rounded text-lg font-mono">L</div>
                <div>
                  <p className="text-base-content font-mono text-sm">LOT-2024-0542</p>
                  <p className="text-base-content/60 text-xs">Same number for 500+ items</p>
                </div>
              </div>
            </div>
            <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
              <li>• Groups items made together</li>
              <li>• Same lot = same production conditions</li>
              <li>• Useful for batch recalls</li>
              <li>• Tracks expiration dates</li>
            </ul>
          </div>

          <div className="rounded-box bg-base-200 p-6">
            <h2 className="text-base-content text-xl font-semibold">Serial Number</h2>
            <p className="text-base-content/60 text-sm">Unique Item Identifier</p>
            <div className="bg-base-100 mt-4 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 flex size-10 items-center justify-center rounded text-lg font-mono">S</div>
                <div>
                  <p className="text-base-content font-mono text-sm">SN-X7K9M2P4</p>
                  <p className="text-base-content/60 text-xs">Unique to one item only</p>
                </div>
              </div>
            </div>
            <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
              <li>• One number per item</li>
              <li>• Tracks individual unit history</li>
              <li>• Useful for warranty claims</li>
              <li>• Enables asset lifecycle tracking</li>
            </ul>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Factor</th>
                  <th className="text-base-content">Lot Number</th>
                  <th className="text-base-content">Serial Number</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Scope</td>
                  <td className="text-base-content/80">Group/batch of items</td>
                  <td className="text-base-content/80">Individual item</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Uniqueness</td>
                  <td className="text-base-content/80">Shared by many items</td>
                  <td className="text-base-content/80">Globally unique per item</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Tracking effort</td>
                  <td className="text-base-content/80">Lower (group level)</td>
                  <td className="text-base-content/80">Higher (item level)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Best for</td>
                  <td className="text-base-content/80">Perishables, chemicals, pharma</td>
                  <td className="text-base-content/80">Electronics, equipment, assets</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Recall precision</td>
                  <td className="text-base-content/80">Entire batch</td>
                  <td className="text-base-content/80">Specific unit only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Industry Examples */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Industry Examples</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Industries Using Lot Numbers</h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-1 text-sm">
                  <li>Food & Beverage (expiration tracking)</li>
                  <li>Pharmaceuticals (FDA compliance)</li>
                  <li>Cosmetics (batch recalls)</li>
                  <li>Chemicals (safety data sheets)</li>
                  <li>Automotive parts (production batches)</li>
                </ul>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Industries Using Serial Numbers</h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-1 text-sm">
                  <li>Consumer electronics (warranty)</li>
                  <li>Medical devices (patient safety)</li>
                  <li>Heavy equipment (maintenance history)</li>
                  <li>Vehicles (VIN tracking)</li>
                  <li>IT assets (lifecycle management)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Track lots and serials with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip supports both lot and serial number tracking. Scan items, record batch information, and maintain full
            traceability for compliance and recalls.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary">
              Barcode Scanning
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/glossary/barcodes-vs-qr-codes"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Barcodes vs QR Codes</h3>
                <p className="text-base-content/80 text-sm">How to encode lot and serial data.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/fifo-vs-lifo"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">FIFO vs LIFO</h3>
                <p className="text-base-content/80 text-sm">Lot tracking enables FIFO compliance.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
