import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FaqBlock, DEFAULT_FAQS } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Pricing',
  description:
    'Simple, trust-first pricing for barcode inventory management. No surprise tier jumps. Start free and scale without penalties.',
  pathname: '/pricing',
})

export default function PricingPage() {
  return (
    <div className="pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Pricing', pathname: '/pricing' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Mobile-first inventory management with barcode scanning and offline mode.',
          pathname: '/pricing',
        })}
      />
      <JsonLd data={faqPageJsonLd(DEFAULT_FAQS)} />

      <PricingSection />
      <FaqBlock />

      <div className="bg-base-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-base-200 p-10 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Questions about your use-case?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              If you have scanners, multiple locations, or a big migration — we&apos;ll help you map the best plan.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
              </Link>
              <Link href="/migration/sortly" className="btn btn-outline btn-secondary btn-lg">
                Migrate from Sortly
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

