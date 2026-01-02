import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site-url'

type MarketingMetadataInput = {
  title: string
  description: string
  pathname: string
  ogType?: 'website' | 'article'
}

export function marketingMetadata({
  title,
  description,
  pathname,
  ogType = 'website',
}: MarketingMetadataInput): Metadata {
  const canonical = absoluteUrl(pathname)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: 'Nook',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

