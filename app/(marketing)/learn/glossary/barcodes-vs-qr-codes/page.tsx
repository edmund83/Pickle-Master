/**
 * Barcodes vs QR Codes Glossary Page
 * Primary keyword: "barcodes vs qr codes"
 * Secondary keywords: "barcode vs qr code for inventory"
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
  title: 'Barcodes vs QR Codes | Which is Better for Inventory?',
  description:
    'Compare barcodes and QR codes for inventory management. Learn when to use each, their pros and cons, and which works best for your business.',
  pathname: '/learn/glossary/barcodes-vs-qr-codes',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is the difference between barcodes and QR codes?',
    answer:
      'Barcodes (1D) store data in horizontal lines and hold 20-25 characters. QR codes (2D) use a square matrix and can hold thousands of characters, including URLs, text, and images.',
  },
  {
    question: 'Which is better for inventory: barcode or QR code?',
    answer:
      'For simple inventory tracking (SKU lookup, quantity updates), barcodes are faster and more widely compatible. QR codes are better when you need to store more data or link to web content.',
  },
  {
    question: 'Can phones scan barcodes?',
    answer:
      'Yes, most smartphone cameras can scan both barcodes and QR codes. However, barcodes may require a dedicated barcode scanning app, while QR codes often work with the native camera app.',
  },
  {
    question: 'Are QR codes more expensive than barcodes?',
    answer:
      'The cost to generate and print is similar. QR codes require slightly more label space but can be printed on the same label stock as barcodes.',
  },
  {
    question: 'Which is faster to scan?',
    answer:
      'Traditional 1D barcodes are generally faster to scan with dedicated hardware scanners. QR codes are faster with phone cameras due to their larger, more visible pattern.',
  },
  {
    question: 'Can I use both barcodes and QR codes?',
    answer:
      'Yes, many businesses use barcodes for retail/POS scanning and QR codes for asset tracking or customer-facing applications. Some labels include both.',
  },
]

export default function BarcodesVsQrCodesPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Barcodes vs QR Codes', pathname: '/learn/glossary/barcodes-vs-qr-codes' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Scanning</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Barcodes vs QR Codes</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          Both <strong>barcodes</strong> and <strong>QR codes</strong> enable quick item identification, but they work
          differently and suit different use cases. Here is how to choose the right one for your inventory needs.
        </p>

        {/* Visual Comparison */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-box bg-base-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-base-100 flex h-20 w-32 items-center justify-center rounded-lg">
                {/* Placeholder for barcode visual */}
                <div className="flex h-12 w-24 items-end gap-0.5">
                  {[3, 1, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2].map((h, i) => (
                    <div key={i} className="bg-base-content" style={{ width: '3px', height: `${h * 10}px` }}></div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-base-content text-xl font-semibold">Barcode (1D)</h2>
                <p className="text-base-content/60 text-sm">Linear, horizontal lines</p>
              </div>
            </div>
            <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                Fast scanning with dedicated scanners
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                Universal retail/POS compatibility
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                Smaller label footprint
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base-content/40 mt-0.5">−</span>
                Limited data (20-25 characters)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base-content/40 mt-0.5">−</span>
                Requires line-of-sight alignment
              </li>
            </ul>
          </div>

          <div className="rounded-box bg-base-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-base-100 flex size-20 items-center justify-center rounded-lg">
                {/* Placeholder for QR code visual */}
                <div className="grid size-14 grid-cols-7 gap-0.5">
                  {/* Static QR code pattern - deterministic for SSR */}
                  {[1,0,1,0,1,0,1,0,1,1,0,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,0,1,1,0,1,0,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1].map((v, i) => (
                    <div key={i} className={`size-1.5 ${v ? 'bg-base-content' : 'bg-base-100'}`}></div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-base-content text-xl font-semibold">QR Code (2D)</h2>
                <p className="text-base-content/60 text-sm">Square matrix pattern</p>
              </div>
            </div>
            <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                Stores thousands of characters
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                Easy phone camera scanning
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                Can link to URLs, images, forms
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base-content/40 mt-0.5">−</span>
                Requires more label space
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base-content/40 mt-0.5">−</span>
                Slower with some hardware scanners
              </li>
            </ul>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Feature Comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Feature</th>
                  <th className="text-base-content">Barcode (1D)</th>
                  <th className="text-base-content">QR Code (2D)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Data capacity</td>
                  <td className="text-base-content/80">20-25 characters</td>
                  <td className="text-base-content/80">Up to 4,296 characters</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Data types</td>
                  <td className="text-base-content/80">Numbers, some text</td>
                  <td className="text-base-content/80">Text, URLs, images, binary</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Scanning speed</td>
                  <td className="text-base-content/80">Very fast (hardware)</td>
                  <td className="text-base-content/80">Fast (phones), moderate (hardware)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Error correction</td>
                  <td className="text-base-content/80">None</td>
                  <td className="text-base-content/80">Built-in (can read if 30% damaged)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Label size</td>
                  <td className="text-base-content/80">Narrow strip</td>
                  <td className="text-base-content/80">Square, needs more space</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Phone scanning</td>
                  <td className="text-base-content/80">Requires app</td>
                  <td className="text-base-content/80">Native camera works</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* When to Use Each */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">When to Use Each</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Use Barcodes When:</h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>You have retail POS systems</li>
                  <li>Speed is critical (warehouse picking)</li>
                  <li>You use dedicated hardware scanners</li>
                  <li>Label space is limited</li>
                  <li>You only need SKU/product ID</li>
                </ul>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Use QR Codes When:</h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>Staff use smartphones to scan</li>
                  <li>You need to link to web content</li>
                  <li>Asset tracking with detailed info</li>
                  <li>Customer-facing applications</li>
                  <li>You need error correction (outdoor use)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Label Printing Tips */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Label Printing Tips</h2>
          <p className="text-base-content/80 mt-2">
            Proper labeling ensures reliable scanning in any environment.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-box bg-base-200 p-6">
              {/* TODO: Add label printing visual - barcode and QR examples side by side */}
              <div className="bg-base-100 mb-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-base-content/20">
                <span className="text-base-content/40 text-sm">Label examples image placeholder</span>
              </div>
              <h3 className="text-base-content font-semibold">Sizing Guidelines</h3>
              <ul className="text-base-content/80 mt-2 space-y-1 text-sm">
                <li>• Barcodes: Minimum 1.5&quot; wide × 0.5&quot; tall</li>
                <li>• QR codes: Minimum 1&quot; × 1&quot; square</li>
                <li>• Leave 0.1&quot; quiet zone around codes</li>
              </ul>
            </div>
            <div className="rounded-box bg-base-200 p-6">
              <h3 className="text-base-content font-semibold">Material Recommendations</h3>
              <ul className="text-base-content/80 mt-2 space-y-1 text-sm">
                <li>• <strong>Indoor:</strong> Standard paper labels work fine</li>
                <li>• <strong>Outdoor:</strong> Use synthetic (polypropylene) labels</li>
                <li>• <strong>High-wear:</strong> Laminate or use polyester labels</li>
                <li>• <strong>Cold storage:</strong> Use freezer-grade adhesive</li>
              </ul>
              <h3 className="text-base-content mt-4 font-semibold">Printing</h3>
              <ul className="text-base-content/80 mt-2 space-y-1 text-sm">
                <li>• Laser printers produce sharper codes than inkjet</li>
                <li>• Thermal printers are ideal for high-volume labeling</li>
                <li>• Always test scan before bulk printing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Scan both with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip supports both barcode and QR code scanning using your phone camera or Bluetooth scanner. Look up
            items, adjust quantities, and track movements instantly.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary">
              Barcode Scanning Features
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/guide/how-to-set-up-barcode-system"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">How to Set Up a Barcode System</h3>
                <p className="text-base-content/80 text-sm">Step-by-step guide to implementing scanning.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/qr-codes-for-inventory"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">QR Codes for Inventory</h3>
                <p className="text-base-content/80 text-sm">Using QR codes for asset and inventory tracking.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
