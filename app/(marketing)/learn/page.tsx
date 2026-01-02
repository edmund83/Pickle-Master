import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Learn',
  description:
    'Learn inventory best practices: perpetual vs periodic inventory, reorder points, barcode workflows, and practical guides for small teams.',
  pathname: '/learn',
})

const GUIDES = [
  {
    title: 'Perpetual vs periodic inventory: what’s the difference?',
    description:
      'A practical guide for small businesses: definitions, pros/cons, and which system is easier to keep accurate.',
    href: '/learn/perpetual-vs-periodic-inventory',
  },
]

export default function LearnPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Learning Center</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Short, practical guides for people who manage real inventory — warehouses, small retail, construction tools,
          and ecommerce.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="card card-border shadow-none hover:border-primary transition-colors"
            >
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">{guide.title}</h2>
                <p className="text-base-content/80 mt-2">{guide.description}</p>
                <span className="link link-primary link-animated mt-3 w-fit">Read guide</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Want the fastest path to accuracy?</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            The quickest win is scan-first workflows: label items, scan to update, and run lightweight cycle counts
            weekly. That’s how small teams keep trust without overhead.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/features/barcode-scanning" className="btn btn-primary btn-gradient btn-lg">
              Barcode scanning
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

