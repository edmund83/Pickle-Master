import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Offline-first inventory scanning',
  description:
    'Keep scanning and updating inventory even without internet. Pickle syncs changes when you’re back online.',
  pathname: '/features/offline-mobile-scanning',
})

export default function OfflineMobileScanningFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Offline mobile scanning', pathname: '/features/offline-mobile-scanning' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Offline-first mobile inventory management with barcode scanning.',
          pathname: '/features/offline-mobile-scanning',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="badge badge-soft badge-primary rounded-full">Feature</p>
        <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
          Offline-first: keep scanning when Wi‑Fi disappears
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Warehouses, basements, and jobsites don&apos;t always have signal. Pickle is designed for real conditions — work
          offline and sync later.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">
            Start Free Trial
          </Link>
          <Link href="/demo" className="btn btn-outline btn-secondary">
            Watch demo
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">What works offline</h2>
              <ul className="mt-4 space-y-3 text-base-content/80">
                <li className="flex gap-2"><span className="icon-[tabler--scan] text-primary size-5"></span>Scanning &amp; lookup</li>
                <li className="flex gap-2"><span className="icon-[tabler--plus-minus] text-primary size-5"></span>Quick adjustments</li>
                <li className="flex gap-2"><span className="icon-[tabler--arrow-left-right] text-primary size-5"></span>Check-in / check-out</li>
              </ul>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Sync you can trust</h2>
              <p className="text-base-content/80 mt-4">
                Changes are synced when you&apos;re back online. The audit trail keeps a clear record of what happened,
                even across devices.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Best for</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--building-warehouse] text-primary size-5"></span>
              <span className="text-base-content/80">Warehouses with dead zones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--briefcase] text-primary size-5"></span>
              <span className="text-base-content/80">Field teams &amp; jobsites</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--truck] text-primary size-5"></span>
              <span className="text-base-content/80">Receiving docks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--home] text-primary size-5"></span>
              <span className="text-base-content/80">Back rooms and basements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

