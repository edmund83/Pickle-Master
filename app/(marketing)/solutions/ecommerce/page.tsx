import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Ecommerce inventory management',
  description:
    'Prevent stockouts with accurate inventory counts, reorder points, and fast barcode scanning across locations.',
  pathname: '/solutions/ecommerce',
})

export default function EcommerceSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Ecommerce', pathname: '/solutions/ecommerce' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Ecommerce inventory management with low-stock alerts and barcode scanning.',
          pathname: '/solutions/ecommerce',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Ecommerce stock you can trust</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Keep accurate counts, set reorder points, and avoid the costly cycle of stockouts and overselling.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/features/low-stock-alerts" className="btn btn-outline btn-secondary">Low-stock alerts</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Accurate counts</h2>
              <p className="text-base-content/80 mt-2">Use scan-based counts to catch discrepancies fast.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Reorder points</h2>
              <p className="text-base-content/80 mt-2">Prevent stockouts with alerts you can act on early.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Multi-location</h2>
              <p className="text-base-content/80 mt-2">Track what you have and where it is across locations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

