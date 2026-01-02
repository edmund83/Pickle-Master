import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Check-in / check-out inventory workflow',
  description:
    'Issue tools and assets to staff with scan-based check-in/check-out and a clear audit trail. Stop losses and disputes.',
  pathname: '/features/check-in-check-out',
})

export default function CheckInCheckOutFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Check-in / check-out', pathname: '/features/check-in-check-out' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Inventory check-in/check-out with barcode scanning and audit trails.',
          pathname: '/features/check-in-check-out',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="badge badge-soft badge-primary rounded-full">Feature</p>
        <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
          Check-in / check-out that creates accountability (without extra admin work)
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Issue tools, equipment, or assets to staff by scan. Track who has what, when it left, and when it came back.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">
            Start Free Trial
          </Link>
          <Link href="/demo" className="btn btn-outline btn-secondary">
            Watch demo
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Issue by scan</h2>
              <p className="text-base-content/80 mt-2">
                Select a staff member, scan the item, and confirm. Done.
              </p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Return by scan</h2>
              <p className="text-base-content/80 mt-2">
                Scan on return to close the loop and keep inventory accurate.
              </p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Audit trail</h2>
              <p className="text-base-content/80 mt-2">
                See when items moved and who touched them last — no guesswork.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Best for</h2>
          <ul className="mt-4 space-y-3 text-base-content/80">
            <li className="flex gap-2"><span className="icon-[tabler--hammer] text-primary size-5"></span>Construction tools</li>
            <li className="flex gap-2"><span className="icon-[tabler--truck] text-primary size-5"></span>Shared equipment</li>
            <li className="flex gap-2"><span className="icon-[tabler--briefcase] text-primary size-5"></span>Field kits &amp; cases</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

