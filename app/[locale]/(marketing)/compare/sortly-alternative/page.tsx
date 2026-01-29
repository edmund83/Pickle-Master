/**
 * Sortly Alternative Comparison Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "Sortly alternative"
 * Secondary keywords: "Sortly vs StockZip", "Sortly alternative comparison", "barcode inventory app"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/compare/sortly-alternative',
    title: 'Sortly Alternative | StockZip Offline Barcode Inventory',
    description:
      'Exploring Sortly alternatives? StockZip is built for offline-first barcode scanning, check-in/check-out workflows, and clear pricing for small teams.',
  })
}

const SORTLY_FAQS: FaqItem[] = [
  {
    question: 'How does StockZip pricing scale as you grow?',
    answer:
      'StockZip uses clear pricing that scales predictably with your catalog and team.',
  },
  {
    question: 'Can my team scan and update inventory offline?',
    answer:
      'Yes. StockZip is built for offline-first mobile workflows so scanning and updates keep working when Wi‑Fi is unreliable.',
  },
  {
    question: 'Can I track tools and assets checked out to employees?',
    answer:
      'Yes. StockZip supports a real check-in/check-out workflow so you can assign items, set due dates, and stay accountable.',
  },
  {
    question: 'How long does it take to migrate from Sortly?',
    answer:
      'Most teams can export and import their core data in under an hour. If you have custom fields, multiple locations, or a lot of cleanup, we’ll help you map it.',
  },
  {
    question: 'Do you help with the migration?',
    answer:
      'Yes. If you want a guided migration, request a demo and we’ll walk through your CSV structure and field mapping.',
  },
]

const COMPARISON_ROWS = [
  {
    category: 'Best for',
    stockzip: 'Scan-first barcode inventory for teams in the field',
    sortly: 'Visual inventory organization with photos and folders',
  },
  {
    category: 'Mobile workflows',
    stockzip: 'Offline-first scanning and fast updates on the go',
    sortly: 'Mobile-friendly organization for day-to-day tracking',
  },
  {
    category: 'Tools & assets',
    stockzip: 'Built-in check-in/check-out with due dates and accountability',
    sortly: 'Flexible fields for organizing items and locations',
  },
  {
    category: 'Bulk updates',
    stockzip: 'Bulk editing with preview diffs and undo',
    sortly: 'Simple editing for routine inventory changes',
  },
  {
    category: 'Audit history',
    stockzip: 'Item history and audit trail for inventory confidence',
    sortly: 'Inventory records designed for easy reference',
  },
  {
    category: 'Getting started',
    stockzip: 'Guided import + scan-first verification',
    sortly: 'Quick setup for small teams',
  },
]

export default function SortlyAlternativePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Compare', pathname: '/compare' },
          { name: 'Sortly alternative', pathname: '/compare/sortly-alternative' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory',
          description: 'Barcode inventory management that works offline, with real check-in/check-out workflows.',
          pathname: '/compare/sortly-alternative',
        })}
      />
      <JsonLd data={faqPageJsonLd(SORTLY_FAQS)} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Comparison</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              A Sortly alternative for scan-first inventory workflows
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              StockZip is built for barcode scanning, offline-first reliability, and check-in/check-out accountability — with
              clear pricing that scales predictably.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="#stockzip-alternative" className="btn btn-primary btn-lg">
              See the StockZip alternative
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="#sortly-fit" className="btn btn-outline btn-secondary btn-lg">
              When Sortly is a great fit
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">Quick verdict</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Sortly is a popular choice for visual, photo-first inventory organization. If you&apos;re exploring an alternative
            built around scan-first barcode workflows, offline-first scanning, and tool check-in/check-out accountability,
            StockZip is worth a look.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Category</th>
                  <th className="text-base-content">StockZip</th>
                  <th className="text-base-content">Sortly</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.category}>
                    <td className="text-base-content font-medium">{row.category}</td>
                    <td className="text-base-content/80">{row.stockzip}</td>
                    <td className="text-base-content/80">{row.sortly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-base-content/60 mt-4 text-sm">
            StockZip is not affiliated with or endorsed by Sortly. Sortly is a trademark of its respective owner.
            Comparison is based on publicly available information as of January 2026; features and pricing may change.
          </p>
        </div>

        <div id="sortly-fit" className="mt-12 grid gap-6 lg:grid-cols-2 scroll-mt-28">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">When Sortly is a great fit</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You prefer visual organization with photos and folders
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You want straightforward tracking for a small team
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Your workflows are mostly online and office-based
                </li>
              </ul>
            </div>
          </div>

          <div className="card card-border shadow-none border-primary/20">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">When StockZip is a great fit</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  You want scan-first barcode workflows
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  You need offline-first scanning in warehouses or jobsites
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  You need tool and asset check-in/check-out accountability
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div id="stockzip-alternative" className="mt-12 rounded-box bg-base-200 p-8 scroll-mt-28">
          <h2 className="text-base-content text-2xl font-semibold">Try StockZip as an alternative</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            The fastest way to evaluate StockZip is a small pilot: import a subset of items, label your top movers, and run
            a scan-first count. You&apos;ll know quickly whether the workflow fits your team.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-primary btn-lg">
              Watch demo
              <span className="icon-[tabler--player-play] size-5"></span>
            </Link>
            <Link href="/signup" className="btn btn-outline btn-secondary btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
          </div>
          <p className="text-base-content/70 mt-4 text-sm">
            Already using Sortly? Follow the{' '}
            <Link href="/migration/sortly" className="link link-primary">
              Sortly migration guide
            </Link>{' '}
            or explore{' '}
            <Link href="/solutions/construction-tools" className="link link-primary">
              tool &amp; asset tracking
            </Link>
            .
          </p>
        </div>
      </div>

      <FaqBlock items={SORTLY_FAQS} />
    </div>
  )
}
