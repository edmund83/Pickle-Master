/**
 * QR Codes for Inventory Management - Educational Guide Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (guide hero with badge)
 * - Features: /marketing-ui/features/features-8 (use case cards)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "qr codes for inventory"
 * Secondary keywords: "qr code inventory system", "inventory qr codes", "qr code asset tracking"
 * Est. volume: 203+ monthly
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'QR Codes for Inventory | How to Use QR Codes for Asset Tracking',
  description:
    'Learn how to use QR codes for inventory management and asset tracking. Includes use cases, comparison with barcodes, and implementation guide for small businesses.',
  pathname: '/learn/guide/qr-codes-for-inventory',
  ogType: 'article',
})

const FAQS: FaqItem[] = [
  {
    question: 'Can I use QR codes for inventory management?',
    answer:
      'Yes, QR codes work well for inventory management, especially when you need to store more information than a simple barcode. They are scannable by any smartphone camera, making them accessible without specialized hardware.',
  },
  {
    question: 'What is the difference between QR codes and barcodes for inventory?',
    answer:
      'Traditional barcodes (1D) hold 10-25 characters—just an ID number. QR codes (2D) hold up to 4,000 characters, including URLs, detailed specs, or multiple data fields. Barcodes are simpler and faster for basic ID lookup; QR codes offer richer data.',
  },
  {
    question: 'What information should I encode in an inventory QR code?',
    answer:
      'For simple inventory, encode just the SKU or item ID (like a barcode). For richer use cases, encode a URL linking to the item details page, or encode structured data like SKU + location + batch number. Keep it simple—more data means larger QR codes.',
  },
  {
    question: 'Can phones scan QR codes for inventory?',
    answer:
      'Yes, most smartphone cameras can scan QR codes directly (iOS and recent Android). You can also use free QR scanner apps or inventory management apps with built-in scanning. No special hardware needed.',
  },
  {
    question: 'Are QR codes better than barcodes for inventory?',
    answer:
      'It depends on your needs. QR codes are better when you need more data, phone scanning, or customer-facing links. Barcodes are better for high-speed scanning with dedicated scanners, small labels, and simple ID lookup. Many businesses use both.',
  },
  {
    question: 'How do I generate QR codes for inventory?',
    answer:
      'Most inventory management software generates QR codes automatically. You can also use free online QR code generators. Enter your SKU or a URL to your item page, download the image, and print on labels.',
  },
  {
    question: 'What size should inventory QR codes be?',
    answer:
      'Minimum 1 inch (2.5 cm) for reliable phone scanning. Larger is better for distance scanning or outdoor use. Ensure adequate quiet zone (white space) around the code. Test scanning before printing large batches.',
  },
  {
    question: 'Can QR codes link to inventory software?',
    answer:
      'Yes, this is a powerful use case. The QR code encodes a URL to the item in your inventory software. When scanned, it opens directly to the item details, ready for updates. This works for maintenance logs, asset history, and field updates.',
  },
]

export default function QRCodesForInventoryPage() {
  const published = '2026-01-03'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'QR Codes for Inventory', pathname: '/learn/guide/qr-codes-for-inventory' },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          headline: 'QR Codes for Inventory Management and Asset Tracking',
          description:
            'A practical guide to using QR codes for inventory management. Learn when to use QR codes vs barcodes, what data to encode, and how to implement QR-based tracking.',
          pathname: '/learn/guide/qr-codes-for-inventory',
          datePublished: published,
          dateModified: published,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      {/* ===== HERO SECTION ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl">
          <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">
            Inventory Guide
          </span>
          <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            QR Codes for Inventory Management
          </h1>
          <p className="text-base-content/80 mt-4 text-lg md:text-xl">
            QR codes offer more flexibility than traditional barcodes—they hold more data, scan from any angle, and work
            with smartphone cameras. Learn when to use QR codes for inventory, what data to encode, and how to implement
            them effectively.
          </p>
          <p className="text-base-content/60 mt-4 text-sm">Last updated: {published}</p>
        </div>
      </section>

      {/* ===== WHY QR CODES ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Why QR Codes for Inventory?</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              QR codes offer unique advantages over traditional barcodes for certain use cases.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--qrcode] text-primary size-9"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">More Data Capacity</h3>
                <p className="text-base-content/70 mt-2">
                  QR codes hold up to 4,000 characters vs. 20-25 for barcodes. Encode URLs, detailed specs, or multiple
                  data fields.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-secondary/10 mx-auto flex size-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--device-mobile] text-secondary size-9"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Phone Scanning</h3>
                <p className="text-base-content/70 mt-2">
                  Any smartphone camera can scan QR codes. No dedicated scanner needed—perfect for mobile teams and
                  field use.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-accent/10 mx-auto flex size-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--rotate-360] text-accent size-9"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Scan from Any Angle</h3>
                <p className="text-base-content/70 mt-2">
                  QR codes scan from any direction. Unlike barcodes that need horizontal alignment, QR codes are
                  forgiving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QR VS BARCODE COMPARISON ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">QR Code vs Barcode</h2>
          <p className="text-base-content/80 mt-4 text-center text-lg">When to use each for inventory management.</p>

          <div className="mt-10 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Feature</th>
                  <th className="text-base-content">QR Code</th>
                  <th className="text-base-content">Barcode (1D)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Data capacity</td>
                  <td className="text-base-content/80">Up to 4,000 characters</td>
                  <td className="text-base-content/80">10-25 characters</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Scan angle</td>
                  <td className="text-base-content/80">Any direction (360°)</td>
                  <td className="text-base-content/80">Horizontal only</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Phone scanning</td>
                  <td className="text-base-content/80">Built-in camera works</td>
                  <td className="text-base-content/80">Needs app or scanner</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Scan speed</td>
                  <td className="text-base-content/80">Fast, but slower than laser</td>
                  <td className="text-base-content/80">Fastest with laser scanner</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Label size</td>
                  <td className="text-base-content/80">Larger (1&quot; minimum)</td>
                  <td className="text-base-content/80">Can be very small</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Best for</td>
                  <td className="text-base-content/80">Assets, URLs, detailed data</td>
                  <td className="text-base-content/80">High-volume, simple ID</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-box bg-info/10 border-info/30 border p-6">
            <p className="text-base-content">
              <strong>Recommendation:</strong> Use QR codes when you need richer data, phone-based scanning, or
              customer/public-facing labels. Use traditional barcodes for high-speed checkout, warehouse picking, and
              when dedicated scanners are available.
            </p>
          </div>
        </div>
      </section>

      {/* ===== USE CASES ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">QR Code Inventory Use Cases</h2>
            <p className="text-base-content/80 mt-4 text-lg">Where QR codes add the most value.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Use Case 1 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--tool] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Asset Tracking</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Track equipment, tools, and fixed assets. QR code links to maintenance history, warranty info, and
                  assignment records. Scan to check out or log service.
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="badge badge-soft badge-primary badge-sm">Equipment</span>
                  <span className="badge badge-soft badge-primary badge-sm">Tools</span>
                  <span className="badge badge-soft badge-primary badge-sm">IT Assets</span>
                </div>
              </div>
            </div>

            {/* Use Case 2 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--building-warehouse] text-secondary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Location Labels</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Label shelves, bins, and zones with QR codes. Scan to see all items at that location, or to assign
                  items during put-away. Speeds up warehouse navigation.
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="badge badge-soft badge-secondary badge-sm">Warehouse</span>
                  <span className="badge badge-soft badge-secondary badge-sm">Storage</span>
                  <span className="badge badge-soft badge-secondary badge-sm">Shelving</span>
                </div>
              </div>
            </div>

            {/* Use Case 3 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--users] text-info size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Field Service</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Technicians scan QR codes on equipment to access manuals, log service, or order parts. No app
                  needed—just a phone camera and a URL.
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="badge badge-soft badge-info badge-sm">Maintenance</span>
                  <span className="badge badge-soft badge-info badge-sm">Repairs</span>
                  <span className="badge badge-soft badge-info badge-sm">HVAC</span>
                </div>
              </div>
            </div>

            {/* Use Case 4 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--package] text-success size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Receiving & Put-Away</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Include QR codes on shipment labels or pallets. Scan to receive entire shipment, view contents, or
                  update inventory—faster than scanning individual items.
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="badge badge-soft badge-success badge-sm">Receiving</span>
                  <span className="badge badge-soft badge-success badge-sm">Bulk</span>
                  <span className="badge badge-soft badge-success badge-sm">Shipping</span>
                </div>
              </div>
            </div>

            {/* Use Case 5 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--id-badge-2] text-accent size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Consumables & Supplies</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Post QR codes near supply cabinets. Staff scan to request restock, log usage, or see supply levels.
                  Low barrier—no training needed.
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="badge badge-soft badge-accent badge-sm">Office</span>
                  <span className="badge badge-soft badge-accent badge-sm">MRO</span>
                  <span className="badge badge-soft badge-accent badge-sm">Medical</span>
                </div>
              </div>
            </div>

            {/* Use Case 6 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--brand-shopee] text-error size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Customer-Facing Products</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  QR codes on products can link to manuals, warranty registration, or reorder pages. Customers scan with
                  their phones—no app required.
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="badge badge-soft badge-error badge-sm">Retail</span>
                  <span className="badge badge-soft badge-error badge-sm">E-commerce</span>
                  <span className="badge badge-soft badge-error badge-sm">DTC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT TO ENCODE ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            What to Encode in Inventory QR Codes
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            Keep it simple—more data means larger QR codes. Choose based on your use case.
          </p>

          <div className="mt-10 space-y-6">
            {/* Option 1 */}
            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <span className="icon-[tabler--id] size-6"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Simple: Item ID Only</h3>
                    <p className="text-base-content/80 mt-2">
                      Encode just the SKU or asset ID. The QR code acts like a barcode—your software looks up the item
                      by ID. Smallest QR code, most compatible.
                    </p>
                    <div className="mt-3 rounded bg-base-200 p-3 font-mono text-sm">TOOL-DRILL-001</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/10 text-secondary flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <span className="icon-[tabler--link] size-6"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Recommended: URL to Item Page</h3>
                    <p className="text-base-content/80 mt-2">
                      Encode a URL that opens the item in your inventory software. Anyone with a phone can scan and see
                      item details, make updates, or log activity. Most flexible for multiple use cases.
                    </p>
                    <div className="mt-3 rounded bg-base-200 p-3 font-mono text-sm">
                      https://app.nookinventory.com/item/abc123
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 3 */}
            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 text-accent flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <span className="icon-[tabler--database] size-6"></span>
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Advanced: Structured Data</h3>
                    <p className="text-base-content/80 mt-2">
                      Encode multiple fields (SKU, location, batch, serial) in structured format. Useful for offline
                      scenarios or when you need data without network access. Requires custom parsing.
                    </p>
                    <div className="mt-3 rounded bg-base-200 p-3 font-mono text-sm">
                      {'{"sku":"DRILL-001","loc":"WH-A3","batch":"2024-03"}'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPLEMENTATION STEPS ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Implementing QR Codes for Inventory
          </h2>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                1
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Decide What to Encode</h3>
                <p className="text-base-content/80 mt-1">
                  For most inventory use cases, encode a URL to the item page in your software. This is flexible, works
                  with any phone, and lets you update what the URL shows without changing labels.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                2
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Generate QR Codes</h3>
                <p className="text-base-content/80 mt-1">
                  Use your inventory software&apos;s built-in generator, or free tools like QR Code Generator. For
                  batch generation, export a list of URLs and use bulk generators.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                3
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Choose Label Size and Material</h3>
                <p className="text-base-content/80 mt-1">
                  Minimum 1 inch (2.5 cm) for reliable phone scanning. Use synthetic labels for outdoor or harsh
                  environments. Test scanning before printing large batches.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                4
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Print and Apply Labels</h3>
                <p className="text-base-content/80 mt-1">
                  Print on Avery-compatible labels with a standard printer, or use a thermal label printer for higher
                  volume. Apply to items, shelves, or equipment where scanning is convenient.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                5
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Train Your Team</h3>
                <p className="text-base-content/80 mt-1">
                  Show staff how to scan with phone cameras or your inventory app. Define workflows: scan to check out
                  equipment, scan to log service, scan to update quantity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BEST PRACTICES ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">QR Code Best Practices</h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Use High Contrast</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Black on white is most reliable. Avoid colored QR codes unless you test scanning thoroughly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Add Human-Readable Text</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Print the item name or ID below the QR code. Helps when codes are damaged or scanners unavailable.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Include Quiet Zone</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Leave white space around the QR code (at least 4 modules). Crowded labels cause scanning failures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Test Before Bulk Printing</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Print a few test labels and scan with multiple phones. Check readability at expected distances.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Use URL Shorteners Carefully</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Shorter URLs make smaller QR codes. But if the shortener service goes down, your codes break. Use
                      your own domain when possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Protect Outdoor Labels</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Use UV-resistant synthetic labels or laminate covers for outdoor equipment. Faded codes do not
                      scan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-base-100 border-primary/20 border p-8 shadow-sm sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Generate QR Codes with Nook
                </h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  Nook generates QR codes for every item and location. Scan with any phone to view details, update
                  quantities, or log activity. No app download required.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Auto-generate QR codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Print labels in batches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Scan with phone camera</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Works with no app</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary btn-lg">
                  Learn About Scanning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED CONTENT ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold">Related Content</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/learn/glossary/barcodes-vs-qr-codes"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Barcodes vs QR Codes</h3>
                <p className="text-base-content/80 text-sm">Detailed comparison and when to use each.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/how-to-set-up-barcode-system"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Barcode System Setup</h3>
                <p className="text-base-content/80 text-sm">Complete guide to barcode implementation.</p>
              </div>
            </Link>
            <Link
              href="/features/barcode-scanning"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Nook Scanning Features</h3>
                <p className="text-base-content/80 text-sm">See how Nook handles barcode and QR scanning.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <FaqBlock items={FAQS} />
    </div>
  )
}
