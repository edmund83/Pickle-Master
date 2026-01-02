import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Features',
  description:
    'Explore Pickle features: barcode scanning, offline-first mobile inventory, check-in/check-out workflows, bulk editing with undo, and low-stock alerts.',
  pathname: '/features',
})

const FEATURE_PAGES = [
  {
    title: 'Barcode scanning',
    description: 'Scan to find and update items fast — receiving, picking, and audits.',
    href: '/features/barcode-scanning',
  },
  {
    title: 'Offline mobile scanning',
    description: 'Keep working without signal. Sync when you’re back online.',
    href: '/features/offline-mobile-scanning',
  },
  {
    title: 'Check-in / check-out',
    description: 'Issue and return tools/assets by scan with accountability.',
    href: '/features/check-in-check-out',
  },
  {
    title: 'Bulk editing',
    description: 'Excel-grade edits with preview + undo to avoid mistakes.',
    href: '/features/bulk-editing',
  },
  {
    title: 'Low-stock alerts',
    description: 'Reorder point notifications that prevent stockouts.',
    href: '/features/low-stock-alerts',
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Mobile-first inventory management with barcode scanning and offline mode.',
          pathname: '/features',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Features</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Built around speed, accuracy, and simplicity — so your whole team can scan and stay accurate in minutes.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {FEATURE_PAGES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="card card-border shadow-none hover:border-primary transition-colors"
            >
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">{feature.title}</h2>
                <p className="text-base-content/80">{feature.description}</p>
                <span className="link link-primary link-animated mt-2 w-fit">
                  Learn more
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

