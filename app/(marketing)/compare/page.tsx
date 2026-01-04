import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Compare',
  description:
    'Compare StockZip to other inventory tools. See how trust-first pricing, offline scanning, and check-in/check-out workflows stack up for small teams.',
  pathname: '/compare',
})

export default function CompareHubPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Compare', pathname: '/compare' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description: 'Inventory management with barcode scanning and offline-first mobile workflows.',
          pathname: '/compare',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Compare StockZip
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          If you&apos;re switching tools, you probably care about predictable pricing, reliable scanning, and workflows
          that match real work (warehouses, jobsites, and small teams).
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/compare/sortly-alternative"
            className="card card-border shadow-none hover:border-primary transition-colors"
          >
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">Sortly alternative</h2>
                <span className="badge badge-primary badge-soft rounded-full">Most requested</span>
              </div>
              <p className="text-base-content/80">
                See why teams switch: trust-first pricing, offline-first scanning, and real check-in/check-out.
              </p>
              <span className="link link-primary link-animated mt-2 w-fit">View comparison</span>
            </div>
          </Link>

          <Link
            href="/compare/boxhero-alternative"
            className="card card-border shadow-none hover:border-primary transition-colors"
          >
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">BoxHero alternative</h2>
              </div>
              <p className="text-base-content/80">
                Compare offline reliability, check-in/check-out workflows, and predictable pricing.
              </p>
              <span className="link link-primary link-animated mt-2 w-fit">View comparison</span>
            </div>
          </Link>

          <Link
            href="/compare/inflow-alternative"
            className="card card-border shadow-none hover:border-primary transition-colors"
          >
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">inFlow alternative</h2>
              </div>
              <p className="text-base-content/80">
                Looking for simplicity over ERP complexity? See how StockZip compares.
              </p>
              <span className="link link-primary link-animated mt-2 w-fit">View comparison</span>
            </div>
          </Link>

          <Link
            href="/compare/fishbowl-alternative"
            className="card card-border shadow-none hover:border-primary transition-colors"
          >
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">Fishbowl alternative</h2>
              </div>
              <p className="text-base-content/80">
                Warehouse inventory for small teams without enterprise pricing or complexity.
              </p>
              <span className="link link-primary link-animated mt-2 w-fit">View comparison</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Want to see StockZip in action?</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            Watch the 90-second demo or start a free trial and scan your first items today.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-primary btn-lg">
              Watch demo
              <span className="icon-[tabler--player-play] size-5"></span>
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

