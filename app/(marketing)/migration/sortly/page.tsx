import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Sortly migration',
  description:
    'Migrate from Sortly to Pickle with a simple checklist: export CSV, map folders/locations, import, label, and run a scan-first verification count.',
  pathname: '/migration/sortly',
})

const MIGRATION_FAQS: FaqItem[] = [
  {
    question: 'What’s the fastest way to migrate safely?',
    answer:
      'Import a small subset first (one location or category), label items, then run a scan-first verification count. Once you trust the workflow, import the rest.',
  },
  {
    question: 'Do I need barcodes already?',
    answer:
      'No. You can generate labels after import. If you already have barcodes/QR codes, keep them and start scanning immediately.',
  },
  {
    question: 'Can you help me map fields and locations?',
    answer:
      'Yes. Request a demo and we’ll help map your CSV columns, folder/location structure, and any custom fields.',
  },
  {
    question: 'How do I prevent count mismatches after import?',
    answer:
      'Do one scan-first count right after import and treat it as your “baseline verification.” After that, you’ll have a clean starting point for ongoing accuracy.',
  },
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
          name: 'Pickle Inventory',
          description: 'Inventory management with barcode scanning, offline-first mobile, and check-in/check-out.',
          pathname: '/migration/sortly',
        })}
      />
      <JsonLd data={faqPageJsonLd(MIGRATION_FAQS)} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Migration</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Sortly migration guide
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              A simple, safe way to move from Sortly to Pickle — without breaking your counts or slowing your team down.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Request a demo
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="card card-border shadow-none lg:col-span-2">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">Step-by-step checklist</h2>
              <ol className="text-base-content/80 mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">1</span>
                  <span>
                    <span className="text-base-content font-medium">Export from Sortly</span> as CSV (items, folders/locations,
                    tags, and any custom fields you rely on).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">2</span>
                  <span>
                    <span className="text-base-content font-medium">Decide your structure</span>: map Sortly folders to Pickle
                    locations (warehouse → shelf → bin) so scanning and counts match reality.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">3</span>
                  <span>
                    <span className="text-base-content font-medium">Clean the CSV</span>: normalize SKUs, remove duplicates,
                    and make sure quantities are numeric (no “N/A”).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">4</span>
                  <span>
                    <span className="text-base-content font-medium">Import into Pickle</span> and spot-check 20–30 items for
                    names, SKUs, quantities, locations, and tags.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">5</span>
                  <span>
                    <span className="text-base-content font-medium">Label your top movers first</span> (fast-moving items,
                    tools, or high-value stock) so scanning starts paying off immediately.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">6</span>
                  <span>
                    <span className="text-base-content font-medium">Run one scan-first verification count</span> to establish
                    a trusted baseline. After that, your ongoing counts are faster and cleaner.
                  </span>
                </li>
              </ol>
            </div>
          </div>

          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">Common mapping</h2>
              <p className="text-base-content/80 mt-2">
                Keep it simple. A clean location hierarchy is usually the biggest win.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-base-content">Sortly</th>
                      <th className="text-base-content">Pickle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-base-content/80">Folder</td>
                      <td className="text-base-content/80">Location / Folder</td>
                    </tr>
                    <tr>
                      <td className="text-base-content/80">Item</td>
                      <td className="text-base-content/80">Item</td>
                    </tr>
                    <tr>
                      <td className="text-base-content/80">Quantity</td>
                      <td className="text-base-content/80">Quantity + audit trail</td>
                    </tr>
                    <tr>
                      <td className="text-base-content/80">Tags</td>
                      <td className="text-base-content/80">Tags</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <Link href="/compare/sortly-alternative" className="link link-primary link-animated">
                  See why teams switch
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Lower the switching risk</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            The goal isn&apos;t “perfect data” on day one — it&apos;s a trusted baseline and a workflow your team actually uses.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/features/barcode-scanning" className="btn btn-primary btn-gradient btn-lg">
              Barcode scanning
            </Link>
            <Link href="/features/offline-mobile-scanning" className="btn btn-outline btn-secondary btn-lg">
              Offline mode
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={MIGRATION_FAQS} />
    </div>
  )
}

