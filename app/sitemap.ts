import type { MetadataRoute } from 'next'
import { LOCALES, buildUrl } from '@/lib/seo'

/**
 * Marketing pages to include in sitemap
 * These will be generated for all supported locales
 */
const MARKETING_PAGES = [
  '/',
  '/pricing',
  '/pricing/free-inventory-software',
  '/demo',
  '/features',
  '/features/barcode-scanning',
  '/features/offline-mobile-scanning',
  '/features/check-in-check-out',
  '/features/bulk-editing',
  '/features/low-stock-alerts',
  '/solutions',
  '/solutions/warehouse-inventory',
  '/solutions/ecommerce-inventory',
  '/solutions/construction-tools',
  '/solutions/small-business',
  '/solutions/mobile-inventory-app',
  '/solutions/asset-tracking',
  '/compare',
  '/compare/sortly-alternative',
  '/compare/boxhero-alternative',
  '/compare/fishbowl-alternative',
  '/compare/inflow-alternative',
  '/migration',
  '/migration/sortly',
  '/integrations',
  '/security',
  '/learn',
  '/learn/guide',
  '/learn/guide/cycle-counting',
  '/learn/guide/qr-codes-for-inventory',
  '/learn/guide/how-to-set-up-barcode-system',
  '/learn/guide/how-to-set-reorder-points',
  '/learn/guide/perpetual-vs-periodic-inventory',
  '/learn/blog',
  '/learn/blog/inventory-management-platforms-for-ecommerce-2025',
  '/learn/glossary',
  '/learn/glossary/80-20-inventory-rule',
  '/learn/glossary/barcodes-vs-qr-codes',
  '/learn/glossary/consignment-inventory',
  '/learn/glossary/cost-of-goods-sold',
  '/learn/glossary/economic-order-quantity',
  '/learn/glossary/fifo-vs-lifo',
  '/learn/glossary/inventory-turnover',
  '/learn/glossary/inventory-vs-stock',
  '/learn/glossary/lot-number-vs-serial-number',
  '/learn/glossary/markup-vs-margin',
  '/learn/glossary/types-of-inventory',
  '/learn/glossary/wholesaler-vs-distributor',
  '/learn/tools',
  '/learn/tools/markup-margin-calculator',
  '/learn/tools/reorder-point-calculator',
  '/learn/templates',
  '/learn/templates/inventory-spreadsheet',
  '/learn/templates/cycle-count-sheet',
  '/privacy',
  '/terms',
]

/**
 * Generate sitemap with all locale URLs
 * Each marketing page is generated for all 4 supported locales:
 * - en-us (United States)
 * - en-gb (United Kingdom)
 * - en-au (Australia)
 * - en-ca (Canada)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Generate URLs for all locales
  const urls: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    MARKETING_PAGES.map((pathname) => ({
      url: buildUrl(locale, pathname),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: pathname === '/' ? 1.0 : pathname === '/pricing' ? 0.9 : 0.8,
    }))
  )

  return urls
}
