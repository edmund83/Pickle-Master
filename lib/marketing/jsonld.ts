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

export function softwareApplicationJsonLd({
  name,
  description,
  pathname,
}: {
  name: string
  description: string
  pathname: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: absoluteUrl(pathname),
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
