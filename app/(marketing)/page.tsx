import type { Metadata } from 'next'
import Link from 'next/link'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { FeaturesShowcase } from '@/components/marketing/FeaturesShowcase'
import { HomeHero } from '@/components/marketing/HomeHero'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { TestimonialGrid } from '@/components/marketing/TestimonialGrid'
import { StatsSection } from '@/components/marketing/StatsSection'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { faqPageJsonLd, organizationJsonLd, softwareApplicationJsonLd, websiteJsonLd } from '@/lib/marketing/jsonld'
import { DEFAULT_FAQS } from '@/lib/marketing/faqs'
import { SolutionsGrid } from '@/components/marketing/SolutionsGrid'
import { SortlyCta } from '@/components/marketing/SortlyCta'
import { FinalCta } from '@/components/marketing/FinalCta'

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
          name: 'StockZip Inventory',
          description:
            'Inventory management software with barcode scanning, offline mode, check-in/check-out workflows, and trust-first pricing.',
          pathname: '/',
        })}
      />
      <JsonLd data={faqPageJsonLd(DEFAULT_FAQS)} />

      <HomeHero />
      <FeaturesShowcase />
      <FeatureGrid />
      <StatsSection />
      <SolutionsGrid />
      <SortlyCta />
      <TestimonialGrid />
      <PricingSection />
      <FaqBlock />
      <FinalCta />
    </>
  )
}
