import type { Metadata } from 'next'
import Link from 'next/link'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { HomeHero } from '@/components/marketing/HomeHero'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FaqBlock, DEFAULT_FAQS } from '@/components/marketing/FaqBlock'
import { TestimonialGrid } from '@/components/marketing/TestimonialGrid'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { faqPageJsonLd, organizationJsonLd, softwareApplicationJsonLd, websiteJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory management with barcode scanning',
  description:
    'A simple, mobile-first inventory management system for small teams — barcode scanning, offline reliability, check-in/check-out, and trust-first pricing.',
  pathname: '/',
})

export default function MarketingHomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description:
            'Inventory management software with barcode scanning, offline mode, check-in/check-out workflows, and trust-first pricing.',
          pathname: '/',
        })}
      />
      <JsonLd data={faqPageJsonLd(DEFAULT_FAQS)} />

      <HomeHero />
      <FeatureGrid />

      <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-6 md:grid-cols-4">
            <Link href="/solutions/warehouse-inventory" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Warehouse</h3>
                <p className="text-base-content/80">Fast receiving, counts, and picking — with scans you can trust.</p>
              </div>
            </Link>
            <Link href="/solutions/ecommerce-inventory" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Ecommerce</h3>
                <p className="text-base-content/80">Prevent stockouts and stay accurate across locations and channels.</p>
              </div>
            </Link>
            <Link href="/solutions/construction-tools" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Construction &amp; Tools</h3>
                <p className="text-base-content/80">Issue and return tools by scan — stop losses and disputes.</p>
              </div>
            </Link>
            <Link href="/solutions/small-business" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Small business</h3>
                <p className="text-base-content/80">Replace spreadsheets in minutes — no training required.</p>
              </div>
            </Link>
          </div>

          <div className="rounded-box bg-base-200 p-8 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Switching from Sortly?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              Nook is built for real workflows (offline scanning + check-in/out) with pricing that won&apos;t punish growth.
              Migrate your data fast and keep your team moving.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/compare/sortly-alternative" className="btn btn-primary btn-gradient">
                See why teams switch
              </Link>
              <Link href="/migration/sortly" className="btn btn-outline btn-secondary">
                Sortly migration
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TestimonialGrid />
      <PricingSection />
      <FaqBlock />

      <div className="bg-base-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-base-200 p-10 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Start tracking stock with confidence
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              Try Nook free and see how fast your team can scan, update, and stay accurate.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/login" className="btn btn-outline btn-secondary btn-lg">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
