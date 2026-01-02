import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Construction tools and asset tracking',
  description:
    'Track tools and assets with barcode scanning, offline mode, and check-in/check-out workflows for field teams.',
  pathname: '/solutions/construction-tools',
})

export default function ConstructionToolsSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Construction & Tools', pathname: '/solutions/construction-tools' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Tool and asset tracking with check-in/check-out and offline scanning.',
          pathname: '/solutions/construction-tools',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Stop losing tools: issue and return by scan
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Field teams need accountability without paperwork. Use scan-based check-in/check-out and keep working offline
          on jobsites.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/features/check-in-check-out" className="btn btn-outline btn-secondary">Check-in / check-out</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Accountability</h2>
              <p className="text-base-content/80 mt-2">Know who has what — and when it was issued.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Offline reliability</h2>
              <p className="text-base-content/80 mt-2">Keep scanning without signal and sync later.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Faster audits</h2>
              <p className="text-base-content/80 mt-2">Spot missing tools and close gaps quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

