import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const marketingPages = [
    '/',
    '/pricing',
    '/demo',
    '/features',
    '/features/barcode-scanning',
    '/features/offline-mobile-scanning',
    '/features/check-in-check-out',
    '/features/bulk-editing',
    '/features/low-stock-alerts',
    '/solutions',
    '/solutions/warehouse',
    '/solutions/ecommerce',
    '/solutions/construction-tools',
    '/solutions/small-business',
    '/solutions/mobile-inventory-app',
    '/compare',
    '/compare/sortly-alternative',
    '/compare/boxhero-alternative',
    '/compare/inflow-alternative',
    '/compare/fishbowl-alternative',
    '/migration',
    '/migration/sortly',
    '/integrations',
    '/security',
    '/learn',
    '/learn/perpetual-vs-periodic-inventory',
    '/learn/how-to-set-reorder-points',
    '/privacy',
    '/terms',
  ]

  return marketingPages.map((pathname) => ({
    url: absoluteUrl(pathname),
    lastModified,
  }))
}

