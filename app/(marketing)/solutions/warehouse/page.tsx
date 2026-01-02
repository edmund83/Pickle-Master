import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Warehouse inventory management',
  description:
    'Warehouse inventory tracking with barcode scanning, fast stock counts, and offline reliability for real-world conditions.',
  pathname: '/solutions/warehouse',
})

export default function WarehouseSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Warehouse', pathname: '/solutions/warehouse' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Warehouse inventory management with barcode scanning and offline mode.',
          pathname: '/solutions/warehouse',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Warehouse inventory that stays accurate</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Receive, count, and pick with scan-first workflows. Keep working in dead zones, sync later, and always know
          who changed what.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary">Barcode scanning</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Receiving</h2>
              <p className="text-base-content/80 mt-2">Scan in stock, verify quantities, and avoid miscounts.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Cycle counts</h2>
              <p className="text-base-content/80 mt-2">Run counts quickly and close gaps with accountability.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Picking</h2>
              <p className="text-base-content/80 mt-2">Find items fast with search + scan and clear locations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

