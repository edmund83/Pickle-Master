/**
 * How to Set Up a Barcode System - Educational Guide Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (guide hero with badge)
 * - Features: /marketing-ui/features/features-8 (step-by-step cards)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "how to set up a barcode system"
 * Secondary keywords: "barcode system for small business", "barcode inventory system", "barcode setup guide"
 * Est. volume: 720+ monthly (Sortly proof: 720 traffic)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'How to Set Up a Barcode System for Inventory | Step-by-Step Guide',
  description:
    'Learn how to set up a barcode system for your small business. Complete guide covering hardware, software, barcode types, and implementation best practices.',
  pathname: '/learn/guide/how-to-set-up-barcode-system',
  ogType: 'article',
})

const FAQS: FaqItem[] = [
  {
    question: 'How much does a barcode system cost for a small business?',
    answer:
      'A basic barcode system can start under $100: a free barcode app on your phone plus printed labels. A more complete setup with a dedicated scanner ($50-200) and label printer ($100-300) costs $150-500. Cloud inventory software adds $0-50/month depending on the plan.',
  },
  {
    question: 'What type of barcode should I use for inventory?',
    answer:
      'Code 128 or Code 39 are the most common for internal inventory. They encode alphanumeric characters and are supported by virtually all scanners. For products you sell retail, you may need UPC (12 digits) or EAN (13 digits) barcodes.',
  },
  {
    question: 'Can I use my phone as a barcode scanner?',
    answer:
      "Yes, most smartphone cameras can scan barcodes using free apps or inventory management software. Phone scanning works well for occasional use or small volumes. For high-volume scanning (100+ scans/day), a dedicated scanner is faster and more ergonomic.",
  },
  {
    question: 'Do I need special barcode labels?',
    answer:
      'For basic use, standard paper labels work fine. For durability (outdoor, warehouse, cold storage), use synthetic labels (polyester, polypropylene). Direct thermal labels are cheaper but fade in sunlight; thermal transfer labels last longer.',
  },
  {
    question: 'How do I create barcodes for my products?',
    answer:
      'Most inventory software generates barcodes automatically from SKU numbers. You can also use free online barcode generators. Simply enter your product code, choose the barcode type (Code 128 recommended), and download or print the barcode image.',
  },
  {
    question: 'What is the difference between 1D and 2D barcodes?',
    answer:
      '1D barcodes (traditional lines) hold limited data (up to 20-25 characters) and are widely compatible. 2D barcodes (QR codes, Data Matrix) hold more data (URLs, detailed info) but require 2D-capable scanners. For simple inventory ID, 1D is sufficient.',
  },
  {
    question: 'Can I use barcodes without inventory software?',
    answer:
      'Technically yes—you can scan barcodes into a spreadsheet. But this defeats much of the purpose. Inventory software instantly looks up product details, updates quantities, and tracks movements when you scan. The software makes barcodes truly useful.',
  },
  {
    question: 'How do I barcode existing inventory?',
    answer:
      'Start with your most frequently moved items (80/20 rule). Generate barcodes using your inventory software, print labels in batches, and apply them during a quiet period or as items are handled. You do not need to label everything at once.',
  },
]

export default function HowToSetUpBarcodeSystemPage() {
  const published = '2026-01-03'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'How to Set Up a Barcode System', pathname: '/learn/guide/how-to-set-up-barcode-system' },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          headline: 'How to Set Up a Barcode System for Inventory',
          description:
            'A practical guide for small businesses: choose hardware, select barcode types, configure software, and implement barcode scanning for inventory management.',
          pathname: '/learn/guide/how-to-set-up-barcode-system',
          datePublished: published,
          dateModified: published,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      {/* ===== HERO SECTION ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl">
          <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">
            Implementation Guide
          </span>
          <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            How to Set Up a Barcode System for Your Business
          </h1>
          <p className="text-base-content/80 mt-4 text-lg md:text-xl">
            Barcode scanning transforms inventory management from slow manual data entry to instant, accurate updates.
            This guide walks you through everything you need: hardware, software, labels, and implementation steps.
          </p>
          <p className="text-base-content/60 mt-4 text-sm">Last updated: {published}</p>
        </div>
      </section>

      {/* ===== BENEFITS SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Why Your Business Needs Barcode Scanning
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Even a simple barcode system dramatically improves accuracy and speed.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--bolt] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">10× Faster</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Scan in under 1 second vs. typing SKUs manually. Process inventory movements in a fraction of the
                  time.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--target] text-success mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">99.9% Accurate</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Eliminate typos and data entry errors. The barcode encodes the exact product identifier every time.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--users] text-info mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Easy Training</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Anyone can learn to scan barcodes in minutes. No memorizing product codes or navigating complex
                  screens.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--clock-check] text-warning mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Real-Time Data</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Inventory updates instantly when scanned. Always know what you have, where it is, and when it moved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU NEED SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">What You Need for a Barcode System</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              A complete barcode system has four components. You may already have some.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Component 1: Barcodes */}
            <div className="card card-border">
              <div className="card-body">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--barcode] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">1. Barcodes</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  The encoded symbols on your products. Generated from your SKU/product codes using software.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-base-content/60 text-xs font-medium uppercase">Common Types</p>
                  <ul className="text-base-content/80 list-inside list-disc text-sm">
                    <li>Code 128 (recommended)</li>
                    <li>Code 39 (simpler)</li>
                    <li>UPC/EAN (retail)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Component 2: Labels */}
            <div className="card card-border">
              <div className="card-body">
                <div className="bg-secondary/10 text-secondary flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--tag] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">2. Labels & Printer</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Print barcode labels to affix to products, shelves, or bins. Options range from regular printers to
                  dedicated label printers.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-base-content/60 text-xs font-medium uppercase">Options</p>
                  <ul className="text-base-content/80 list-inside list-disc text-sm">
                    <li>Avery labels + inkjet</li>
                    <li>Thermal label printer</li>
                    <li>Pre-printed labels</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Component 3: Scanner */}
            <div className="card card-border">
              <div className="card-body">
                <div className="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--scan] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">3. Barcode Scanner</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Reads the barcode and sends the data to your software. Phone cameras work for basic use; dedicated
                  scanners for volume.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-base-content/60 text-xs font-medium uppercase">Options</p>
                  <ul className="text-base-content/80 list-inside list-disc text-sm">
                    <li>Smartphone camera</li>
                    <li>USB wired scanner</li>
                    <li>Bluetooth wireless</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Component 4: Software */}
            <div className="card card-border">
              <div className="card-body">
                <div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--device-laptop] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">4. Inventory Software</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Receives scanned barcodes, looks up products, and updates inventory. This is what makes scanning
                  useful.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-base-content/60 text-xs font-medium uppercase">Key Features</p>
                  <ul className="text-base-content/80 list-inside list-disc text-sm">
                    <li>Barcode generation</li>
                    <li>Mobile scanning app</li>
                    <li>Real-time sync</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STEP BY STEP SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Step-by-Step Implementation
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            Follow these steps to get your barcode system up and running.
          </p>

          <div className="mt-10 space-y-6">
            {/* Step 1 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Choose Your Inventory Software</h3>
                    <p className="text-base-content/80 mt-2">
                      Start with software that supports barcode scanning, generation, and mobile apps. The software is
                      the brain of your system—barcodes and scanners are just input devices.
                    </p>
                    <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                      <li>Look for built-in barcode generation</li>
                      <li>Ensure mobile app with camera scanning</li>
                      <li>Check that it supports your barcode type (Code 128 is standard)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Set Up Your Product Catalog</h3>
                    <p className="text-base-content/80 mt-2">
                      Enter your products into the software with unique SKUs. These codes become your barcodes. If you
                      sell products with existing UPC codes, you can use those directly.
                    </p>
                    <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                      <li>Use consistent SKU naming (e.g., WIDGET-001, TOOL-HAMMER-SM)</li>
                      <li>Import existing data via CSV if available</li>
                      <li>Add photos for visual confirmation when scanning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Generate and Print Barcode Labels</h3>
                    <p className="text-base-content/80 mt-2">
                      Use your inventory software to generate barcodes from your SKUs. Print labels in batches and apply
                      them to products or shelves.
                    </p>
                    <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                      <li>Start with high-volume items first (apply 80/20 rule)</li>
                      <li>Choose label size appropriate for your products</li>
                      <li>Consider durability needs (paper vs. synthetic)</li>
                      <li>Print a few test labels before batch printing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Choose Your Scanning Hardware</h3>
                    <p className="text-base-content/80 mt-2">
                      Match your scanner to your volume and environment. Phone scanning is free and works for light use;
                      dedicated scanners are faster for high volume.
                    </p>
                    <div className="mt-4 overflow-x-auto">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr>
                            <th className="text-base-content">Scanner Type</th>
                            <th className="text-base-content">Best For</th>
                            <th className="text-base-content">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-base-content/80">Smartphone app</td>
                            <td className="text-base-content/80">&lt;50 scans/day, mobile use</td>
                            <td className="text-base-content/80">Free</td>
                          </tr>
                          <tr>
                            <td className="text-base-content/80">USB wired scanner</td>
                            <td className="text-base-content/80">Desk/checkout, high volume</td>
                            <td className="text-base-content/80">$30-100</td>
                          </tr>
                          <tr>
                            <td className="text-base-content/80">Bluetooth wireless</td>
                            <td className="text-base-content/80">Warehouse, mobile + speed</td>
                            <td className="text-base-content/80">$80-200</td>
                          </tr>
                          <tr>
                            <td className="text-base-content/80">Rugged handheld</td>
                            <td className="text-base-content/80">Harsh environments</td>
                            <td className="text-base-content/80">$300+</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Test and Train Your Team</h3>
                    <p className="text-base-content/80 mt-2">
                      Test scanning with a few products before full rollout. Train staff on basic workflows: receiving
                      inventory, picking orders, cycle counting.
                    </p>
                    <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                      <li>Test scan distance and angles</li>
                      <li>Verify products update correctly in software</li>
                      <li>Create simple workflow guides (scan to add, scan to remove)</li>
                      <li>Assign scanning responsibilities to specific roles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="text-base-content text-lg font-semibold">Roll Out Gradually</h3>
                    <p className="text-base-content/80 mt-2">
                      Do not try to label everything at once. Start with one product category or location. Expand as you
                      refine your process.
                    </p>
                    <ul className="text-base-content/80 mt-3 list-inside list-disc text-sm">
                      <li>Week 1: Top 20 high-volume products</li>
                      <li>Week 2-3: Expand to full category</li>
                      <li>Month 2: Add remaining products as handled</li>
                      <li>Ongoing: Label new products as they arrive</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CHOOSING BARCODE TYPE ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Choosing the Right Barcode Type
          </h2>
          <p className="text-base-content/80 mt-4 text-center text-lg">
            Most small businesses should use Code 128 for internal inventory. Here is when to use other types.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Code 128 (Recommended)</h3>
                <p className="text-base-content/60 text-sm">Best for internal inventory</p>
                <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-1 text-sm">
                  <li>Encodes letters, numbers, and symbols</li>
                  <li>Compact and high-density</li>
                  <li>Supported by all scanners</li>
                  <li>Ideal for SKUs like &quot;TOOL-HAMMER-SM&quot;</li>
                </ul>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Code 39</h3>
                <p className="text-base-content/60 text-sm">Simple, widely compatible</p>
                <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-1 text-sm">
                  <li>Letters, numbers, and a few symbols</li>
                  <li>Larger than Code 128 (less dense)</li>
                  <li>Easy to read, very reliable</li>
                  <li>Good for labels with limited space</li>
                </ul>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">UPC / EAN</h3>
                <p className="text-base-content/60 text-sm">Retail product codes</p>
                <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-1 text-sm">
                  <li>UPC: 12 digits (North America)</li>
                  <li>EAN: 13 digits (International)</li>
                  <li>Required for products sold in retail stores</li>
                  <li>Requires registration with GS1 for unique codes</li>
                </ul>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">QR Codes</h3>
                <p className="text-base-content/60 text-sm">2D codes with more data</p>
                <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-1 text-sm">
                  <li>Holds URLs, detailed product info</li>
                  <li>Scannable by any smartphone</li>
                  <li>Requires 2D-capable scanner (or phone)</li>
                  <li>Good for linking to product pages or manuals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMON MISTAKES ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Common Mistakes to Avoid</h2>
          <p className="text-base-content/80 mt-4 text-center text-lg">
            Learn from others&apos; mistakes when implementing barcode systems.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Trying to Label Everything at Once</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      This overwhelms staff and delays the benefits. Start with top movers and expand gradually.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Poor Label Placement</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Labels hidden, damaged, or at awkward angles slow down scanning. Place consistently where scanners
                      can easily read them.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Ignoring the Software</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Barcodes without proper inventory software are just labels. The software makes scanning useful by
                      updating inventory in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Cheap Labels in Harsh Environments</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Paper labels fade in sunlight and peel in moisture. Invest in synthetic labels for outdoor,
                      warehouse, or refrigerated storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-primary/5 border-primary/20 border p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Set Up Barcode Scanning with Nook
                </h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  Nook includes everything you need: barcode generation, mobile scanning, label printing, and real-time
                  inventory updates. Start scanning in minutes.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Generate barcodes from SKUs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Scan with phone or Bluetooth scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Print labels in batches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Real-time inventory sync</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/features/barcode-scanning" className="btn btn-primary btn-gradient btn-lg">
                  Learn About Scanning
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/signup" className="btn btn-outline btn-secondary btn-lg">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED GUIDES ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold">Related Guides</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/glossary/barcodes-vs-qr-codes"
              className="card card-border bg-base-100 shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Barcodes vs QR Codes</h3>
                <p className="text-base-content/80 text-sm">
                  Understand the differences and when to use each type.
                </p>
              </div>
            </Link>
            <Link
              href="/learn/guide/cycle-counting"
              className="card card-border bg-base-100 shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Cycle Counting Guide</h3>
                <p className="text-base-content/80 text-sm">Use barcode scanning to speed up inventory counts.</p>
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
