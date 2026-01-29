import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

export type FaqItem = { question: string; answer: string }

export function organizationJsonLd() {
  const siteUrl = getSiteUrl().toString()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'StockZip',
    url: siteUrl,
  }
}

export function websiteJsonLd() {
  const siteUrl = getSiteUrl().toString()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'StockZip',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl.replace(/\/$/, '')}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export type SoftwareApplicationOffer = {
  price: number | string
  priceCurrency?: string
  priceValidUntil?: string
}

export type AggregateRating = {
  ratingValue: number
  ratingCount: number
  bestRating?: number
  worstRating?: number
}

export function softwareApplicationJsonLd({
  name,
  description,
  pathname,
  offers,
  aggregateRating,
}: {
  name: string
  description: string
  pathname: string
  offers?: SoftwareApplicationOffer | SoftwareApplicationOffer[]
  aggregateRating?: AggregateRating
}) {
  // Default offers: show price range from Starter ($18) to Scale ($89)
  const defaultOffers = {
    '@type': 'AggregateOffer',
    lowPrice: '18',
    highPrice: '89',
    priceCurrency: 'USD',
    offerCount: 3,
  }

  // Build offers schema
  let offersSchema
  if (offers) {
    if (Array.isArray(offers)) {
      offersSchema = offers.map((offer) => ({
        '@type': 'Offer',
        price: String(offer.price),
        priceCurrency: offer.priceCurrency ?? 'USD',
        ...(offer.priceValidUntil && { priceValidUntil: offer.priceValidUntil }),
      }))
    } else {
      offersSchema = {
        '@type': 'Offer',
        price: String(offers.price),
        priceCurrency: offers.priceCurrency ?? 'USD',
        ...(offers.priceValidUntil && { priceValidUntil: offers.priceValidUntil }),
      }
    }
  } else {
    offersSchema = defaultOffers
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: absoluteUrl(pathname),
    offers: offersSchema,
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        ratingCount: aggregateRating.ratingCount,
        bestRating: aggregateRating.bestRating ?? 5,
        worstRating: aggregateRating.worstRating ?? 1,
      },
    }),
  }
}

export function breadcrumbJsonLd(items: { name: string; pathname: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname),
    })),
  }
}

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function articleJsonLd({
  headline,
  description,
  pathname,
  datePublished,
  dateModified,
}: {
  headline: string
  description: string
  pathname: string
  datePublished: string
  dateModified?: string
}) {
  const url = absoluteUrl(pathname)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    mainEntityOfPage: url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { '@type': 'Organization', name: 'StockZip' },
    publisher: { '@type': 'Organization', name: 'StockZip' },
  }
}
