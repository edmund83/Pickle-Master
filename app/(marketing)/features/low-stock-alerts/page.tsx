import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Low-stock alerts and reorder points',
  description:
    'Set reorder points and get notified before you run out. Prevent stockouts and keep ordering predictable.',
  pathname: '/features/low-stock-alerts',
})

export default function LowStockAlertsFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Low-stock alerts', pathname: '/features/low-stock-alerts' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Low-stock alerts and reorder points for inventory management.',
          pathname: '/features/low-stock-alerts',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="badge badge-soft badge-primary rounded-full">Feature</p>
        <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
          Low-stock alerts that prevent stockouts
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Set reorder points per item and get notified when inventory dips — so you can reorder early and keep customers
          happy.
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
              <h2 className="text-base-content text-lg font-semibold">Set reorder points</h2>
              <p className="text-base-content/80 mt-2">Define thresholds that match your lead times and demand.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">See what’s at risk</h2>
              <p className="text-base-content/80 mt-2">Quickly view items approaching low stock across locations.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Act early</h2>
              <p className="text-base-content/80 mt-2">Avoid emergency orders and last-minute substitutions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

