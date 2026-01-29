import type { Metadata } from 'next'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { FeaturesShowcase } from '@/components/marketing/FeaturesShowcase'
import { HomeHero } from '@/components/marketing/HomeHero'
import { InterfaceShowcase } from '@/components/marketing/InterfaceShowcase'
import { VideoShowcase } from '@/components/marketing/VideoShowcase'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { TestimonialGrid } from '@/components/marketing/TestimonialGrid'
import { StatsSection } from '@/components/marketing/StatsSection'
import { JsonLd } from '@/components/marketing/JsonLd'
import { faqPageJsonLd, organizationJsonLd, softwareApplicationJsonLd, websiteJsonLd } from '@/lib/marketing/jsonld'
import { DEFAULT_FAQS } from '@/lib/marketing/faqs'
import { SolutionsGrid } from '@/components/marketing/SolutionsGrid'
import { MigrationCta } from '@/components/marketing/MigrationCta'
import { FinalCta } from '@/components/marketing/FinalCta'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/',
    title: 'Inventory management with barcode scanning',
    description:
      'A simple, mobile-first inventory management system for small teams — barcode scanning, offline reliability, check-in/check-out, and trust-first pricing.',
  })
}

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
      <VideoShowcase />
      <InterfaceShowcase />
      <FeaturesShowcase />
      <FeatureGrid />
      <StatsSection />
      <SolutionsGrid />
      <MigrationCta />
      <TestimonialGrid />
      <PricingSection />
      <FaqBlock />
      <FinalCta />
    </>
  )
}
