/**
 * Sortly Migration Guide Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "migrate from Sortly"
 * Secondary keywords: "Sortly export", "switch from Sortly", "Sortly to StockZip"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Migrate from Sortly | Step-by-Step Guide to Switch to StockZip',
  description:
    'Migrate from Sortly to StockZip with our step-by-step guide. Export CSV, map locations, import items, and verify with a scan-based count — usually under an hour.',
  pathname: '/migration/sortly',
})

const MIGRATION_FAQS: FaqItem[] = [
  {
    question: 'How long does the Sortly migration take?',
    answer:
      'Most teams complete the core migration in under an hour. Export from Sortly, import into StockZip, spot-check a few items, and you are ready. More complex setups with custom fields or many locations may take a bit longer.',
  },
  {
    question: 'What is the fastest way to migrate safely?',
    answer:
      'Import a small subset first (one location or category), label those items, then run a scan-first verification count. Once you trust the workflow, import the rest.',
  },
  {
    question: 'Do I need barcodes already on my items?',
    answer:
      'No. You can generate and print labels after import. If you already have barcodes or QR codes on items, keep them — StockZip will scan them immediately.',
  },
  {
    question: 'Can you help me map fields and locations?',
    answer:
      'Yes. Request a demo and we will help map your Sortly CSV columns, folder/location structure, and any custom fields to StockZip.',
  },
  {
    question: 'How do I prevent count mismatches after import?',
    answer:
      'Do one scan-first count right after import and treat it as your baseline verification. After that, you have a clean starting point for ongoing accuracy.',
  },
  {
    question: 'What happens to my Sortly folders?',
    answer:
      'Sortly folders map to StockZip locations. You can keep the same hierarchy (Warehouse → Shelf → Bin) or restructure during migration.',
  },
  {
    question: 'Can I import custom fields from Sortly?',
    answer:
      'Yes. StockZip supports custom fields. During import, map your Sortly custom columns to StockZip fields. We will help you set up any new fields you need.',
  },
  {
    question: 'What if I have thousands of items?',
    answer:
      'StockZip handles large catalogs. Import your full CSV, then label and verify in batches. Start with high-value or fast-moving items for immediate wins.',
  },
]

const BENEFITS = [
  {
    icon: 'icon-[tabler--clock]',
    title: 'Under an hour',
    description: 'Most migrations complete in 30–60 minutes. No IT team or consultant required.',
  },
  {
    icon: 'icon-[tabler--shield-check]',
    title: 'Zero downtime',
    description: 'Keep using Sortly until you are confident. Switch when you are ready.',
  },
  {
    icon: 'icon-[tabler--lifebuoy]',
    title: 'Migration support',
    description: 'We help map your data structure and answer questions along the way.',
  },
]

const MIGRATION_STEPS = [
  {
    step: '1',
    title: 'Export from Sortly',
    description:
      'Go to Settings → Export in Sortly and download your items as CSV. Include folders, tags, quantities, and any custom fields you use.',
  },
  {
    step: '2',
    title: 'Decide your structure',
    description:
      'Map Sortly folders to StockZip locations. Keep the same hierarchy or restructure now — this is your chance to clean things up.',
  },
  {
    step: '3',
    title: 'Clean the CSV',
    description:
      'Normalize SKUs, remove duplicates, and ensure quantities are numeric (no "N/A" or blanks). A few minutes here saves headaches later.',
  },
  {
    step: '4',
    title: 'Import into StockZip',
    description:
      'Upload your CSV. StockZip maps common columns automatically. Review the preview, adjust any mappings, and confirm the import.',
  },
  {
    step: '5',
    title: 'Spot-check items',
    description:
      'Verify 20–30 items for correct names, SKUs, quantities, locations, and tags. Fix any mapping issues before proceeding.',
  },
  {
    step: '6',
    title: 'Label your top movers',
    description:
      'Print QR or barcode labels for fast-moving items, high-value stock, or tools. Start scanning immediately.',
  },
  {
    step: '7',
    title: 'Run a verification count',
    description:
      'Do one scan-first count to establish a trusted baseline. After this, your ongoing counts will be faster and cleaner.',
  },
]

const FIELD_MAPPINGS = [
  { sortly: 'Folder', stockzip: 'Location / Folder', notes: 'Hierarchical structure supported' },
  { sortly: 'Item name', stockzip: 'Name', notes: 'Direct mapping' },
  { sortly: 'Quantity', stockzip: 'Quantity', notes: 'Plus full audit trail' },
  { sortly: 'Price', stockzip: 'Price', notes: 'Per-item valuation' },
  { sortly: 'Tags', stockzip: 'Tags', notes: 'Multi-tag support' },
  { sortly: 'Notes', stockzip: 'Notes', notes: 'Preserved as-is' },
  { sortly: 'Custom fields', stockzip: 'Custom fields', notes: 'Create matching fields first' },
  { sortly: 'Photos', stockzip: 'Photos', notes: 'Re-upload or link' },
]

export default function SortlyMigrationPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Migration', pathname: '/migration' },
          { name: 'Sortly', pathname: '/migration/sortly' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description: 'Migrate from Sortly to StockZip with barcode scanning, offline mode, and check-in/check-out.',
          pathname: '/migration/sortly',
        })}
      />
      <JsonLd data={faqPageJsonLd(MIGRATION_FAQS)} />

      {/* Hero Section - hero-12 pattern */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Migration Guide</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Migrate from Sortly to StockZip
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              A step-by-step guide to move from Sortly to StockZip — without breaking your counts, losing data, or
              slowing your team down. Most migrations take under an hour.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Request Migration Help
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="card card-border shadow-none">
              <div className="card-body">
                <span className={`${benefit.icon} text-primary size-8`}></span>
                <h2 className="text-base-content mt-4 text-lg font-semibold">{benefit.title}</h2>
                <p className="text-base-content/80 mt-2">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Step-by-Step Section */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Step-by-step migration checklist</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Follow these steps for a clean, safe migration. Take your time — there is no rush.
          </p>
          <div className="mt-8 space-y-6">
            {MIGRATION_STEPS.map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-base-content text-lg font-semibold">{item.title}</h3>
                  <p className="text-base-content/80 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Mapping Table */}
        <div className="mt-16 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">Field mapping reference</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Here is how Sortly fields map to StockZip. Most columns map automatically during import.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Sortly field</th>
                  <th className="text-base-content">StockZip field</th>
                  <th className="text-base-content">Notes</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_MAPPINGS.map((row) => (
                  <tr key={row.sortly}>
                    <td className="text-base-content font-medium">{row.sortly}</td>
                    <td className="text-base-content/80">{row.stockzip}</td>
                    <td className="text-base-content/60 text-sm">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">Pro tips for a smooth migration</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                  <span>Start with one location or category to build confidence before importing everything</span>
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                  <span>Label high-value and fast-moving items first for immediate scanning benefits</span>
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                  <span>Run a verification count immediately after import to establish a trusted baseline</span>
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                  <span>Keep Sortly active until your team is confident in StockZip — no need to rush</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card card-border shadow-none border-warning/20">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">Common mistakes to avoid</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5 shrink-0"></span>
                  <span>Importing dirty data — clean your CSV first (duplicates, blank quantities, etc.)</span>
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5 shrink-0"></span>
                  <span>Skipping the verification count — one quick count establishes trust</span>
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5 shrink-0"></span>
                  <span>Trying to migrate everything at once — start small and expand</span>
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5 shrink-0"></span>
                  <span>Forgetting to label items — scanning only works if items have labels</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section - cta-4 pattern */}
        <div className="mt-16 rounded-box bg-base-200 p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base-content text-2xl font-semibold">Ready to switch?</h2>
              <p className="text-base-content/80 mt-3 max-w-2xl">
                Start your free trial and import a subset of items. Once you trust the workflow, migrate everything.
                We are here to help if you get stuck.
              </p>
              <ul className="text-base-content/80 mt-6 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Free CSV import, no limits
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Migration support included
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Keep using Sortly until you are confident
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/compare/sortly-alternative" className="btn btn-outline btn-secondary btn-lg">
                Why Teams Switch
              </Link>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link href="/compare/sortly-alternative" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--vs] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Sortly vs StockZip</h3>
                <p className="text-base-content/80 mt-2">
                  See why teams switch from Sortly to StockZip.
                </p>
              </div>
            </Link>
            <Link href="/features/barcode-scanning" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--barcode] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Barcode scanning</h3>
                <p className="text-base-content/80 mt-2">
                  Fast, accurate inventory updates by scan.
                </p>
              </div>
            </Link>
            <Link href="/features/offline-mobile-scanning" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--wifi-off] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Offline mode</h3>
                <p className="text-base-content/80 mt-2">
                  Keep scanning when internet is unavailable.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={MIGRATION_FAQS} />
    </div>
  )
}
