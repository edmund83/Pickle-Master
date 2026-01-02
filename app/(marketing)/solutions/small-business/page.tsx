import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Small business inventory management',
  description:
    'Replace spreadsheets with a simple inventory system your team can use in minutes — barcode scanning, offline mode, and predictable pricing.',
  pathname: '/solutions/small-business',
})

export default function SmallBusinessSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Small business', pathname: '/solutions/small-business' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Simple inventory management for small businesses with barcode scanning.',
          pathname: '/solutions/small-business',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Replace spreadsheets without training your whole team
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Pickle keeps setup light so you can start scanning and staying accurate quickly — without feeling like you
          bought an ERP.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/migration/sortly" className="btn btn-outline btn-secondary">Import &amp; migrate</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Fast setup</h2>
              <p className="text-base-content/80 mt-2">Import from CSV and start scanning in minutes.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Staff-friendly</h2>
              <p className="text-base-content/80 mt-2">Plain language UI with scan-first workflows.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Predictable pricing</h2>
              <p className="text-base-content/80 mt-2">No surprise jumps as your catalog grows.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

