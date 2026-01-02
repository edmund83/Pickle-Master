import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Demo',
  description: 'Watch a quick demo of Pickle inventory management: scanning, adjustments, and check-in/check-out.',
  pathname: '/demo',
})

export default function DemoPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Demo', pathname: '/demo' },
        ])}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Pickle demo</h1>
        <p className="text-base-content/80 mt-3 text-lg">
          A quick walkthrough of the workflows teams use most: scan &amp; adjust, stock counts, and check-in/out.
        </p>

        <div className="mt-8 rounded-box border border-base-content/10 bg-base-200 p-8">
          <p className="text-base-content/80">
            Video embed placeholder — add your 90-second demo clip here.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-secondary">
              See Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

