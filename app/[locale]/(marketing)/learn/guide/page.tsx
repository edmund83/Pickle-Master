/**
 * Guide Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (hub page hero)
 * - Features: /marketing-ui/features/features-8 (guide cards)
 *
 * Primary keyword: "inventory management guides"
 * Secondary keywords: "how to guides inventory", "inventory best practices", "inventory setup guides"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/learn/guide',
    title: 'Inventory Management Guides | How-To Tutorials & Best Practices',
    description:
      'Step-by-step inventory management guides. Learn barcode setup, reorder points, cycle counting, and more. Practical tutorials for small teams.',
  })
}

const GUIDES = [
  {
    title: 'Perpetual vs Periodic Inventory',
    slug: 'perpetual-vs-periodic-inventory',
    description:
      'Understand the key differences between inventory systems and which is right for your business.',
    icon: 'icon-[tabler--exchange]',
    readTime: '8 min read',
    category: 'Fundamentals',
  },
  {
    title: 'How to Set Reorder Points',
    slug: 'how-to-set-reorder-points',
    description:
      'Calculate reorder points and safety stock to prevent stockouts without overstocking.',
    icon: 'icon-[tabler--bell-ringing]',
    readTime: '10 min read',
    category: 'Alerts',
  },
  {
    title: 'How to Set Up a Barcode System',
    slug: 'how-to-set-up-barcode-system',
    description: 'Step-by-step guide to implementing barcode scanning for inventory tracking.',
    icon: 'icon-[tabler--barcode]',
    readTime: '12 min read',
    category: 'Setup',
  },
  {
    title: 'Cycle Counting Guide',
    slug: 'cycle-counting',
    description: 'Maintain inventory accuracy with scheduled counts instead of annual shutdowns.',
    icon: 'icon-[tabler--clipboard-check]',
    readTime: '7 min read',
    category: 'Processes',
  },
  {
    title: 'QR Codes for Inventory',
    slug: 'qr-codes-for-inventory',
    description: 'When and how to use QR codes for asset tracking and inventory management.',
    icon: 'icon-[tabler--qrcode]',
    readTime: '6 min read',
    category: 'Technology',
  },
]

export default function GuidesPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Guides', pathname: '/learn/guide' },
        ])}
      />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">
            How-To Guides
          </p>
          <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
            Inventory Management Guides
          </h1>
          <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
            Practical, step-by-step guides for inventory setup, workflows, and best practices.
            Written for small teams who need clear advice without enterprise complexity.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/learn/guide/${guide.slug}`}
              className="card card-border shadow-none transition-all duration-300 hover:border-primary/30 hover:shadow-md"
            >
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <span className={`${guide.icon} text-primary size-6`}></span>
                  </div>
                  <span className="badge badge-outline text-xs">{guide.category}</span>
                </div>
                <h2 className="text-base-content mt-4 text-xl font-semibold">{guide.title}</h2>
                <p className="text-base-content/80 mt-2">{guide.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-base-content/50 text-sm">{guide.readTime}</span>
                  <span className="text-primary text-sm font-medium">Read guide →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-box bg-base-200 p-8 text-center">
          <h2 className="text-base-content text-2xl font-semibold">
            Put these guides into practice
          </h2>
          <p className="text-base-content/80 mx-auto mt-3 max-w-2xl">
            StockZip inventory management software helps you apply these concepts with barcode scanning,
            low-stock alerts, and real-time tracking. Start free, upgrade when you are ready.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Related Resources */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link
              href="/learn/glossary"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--book] text-accent size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Inventory Glossary</h3>
                <p className="text-base-content/80 mt-2">
                  Key terms and definitions for inventory management.
                </p>
              </div>
            </Link>
            <Link
              href="/learn/templates"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--file-spreadsheet] text-success size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">
                  Downloadable Templates
                </h3>
                <p className="text-base-content/80 mt-2">
                  Free spreadsheets and cycle count sheets ready to use.
                </p>
              </div>
            </Link>
            <Link
              href="/learn/tools"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--calculator] text-info size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">
                  Interactive Calculators
                </h3>
                <p className="text-base-content/80 mt-2">
                  Calculate reorder points, markup, and more.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
