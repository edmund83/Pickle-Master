/**
 * Sortly Alternative Comparison Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "Sortly alternative"
 * Secondary keywords: "Sortly vs Nook", "better than Sortly", "switch from Sortly"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Sortly Alternative | Switch to Nook for Better Inventory Management',
  description:
    'Switch from Sortly to Nook for trust-first pricing, offline-first barcode scanning, and real check-in/check-out workflows built for small teams.',
  pathname: '/compare/sortly-alternative',
})

const SORTLY_FAQS: FaqItem[] = [
  {
    question: 'Do you have hard SKU limits or surprise tier jumps?',
    answer:
      'No. Nook is designed to scale predictably so you aren’t forced into a huge tier jump just because your catalog grows.',
  },
  {
    question: 'Can my team scan and update inventory offline?',
    answer:
      'Yes. Nook is built for offline-first mobile workflows so scanning and updates keep working when Wi‑Fi is unreliable.',
  },
  {
    question: 'Can I track tools and assets checked out to employees?',
    answer:
      'Yes. Nook supports a real check-in/check-out workflow so you can assign items, set due dates, and stay accountable.',
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
    category: 'Pricing trust',
    nook: 'Predictable scaling; no “punished for growth” surprises',
    sortly: 'Users frequently cite price hikes and SKU caps as pain points',
  },
  {
    category: 'Offline reliability',
    nook: 'Offline-first mobile scanning + sync when back online',
    sortly: 'Users report sync delays and trust issues in the field',
  },
  {
    category: 'Check-in / check-out',
    nook: 'Native issue/return workflow (assets, tools, staff)',
    sortly: 'Often requires workarounds for asset workflows',
  },
  {
    category: 'Bulk editing',
    nook: 'Excel-grade bulk updates with guardrails (preview/undo)',
    sortly: 'Bulk workflows can be limiting as catalogs grow',
  },
  {
    category: 'Inventory trust layer',
    nook: 'Audit trail + “who changed what” accountability',
    sortly: 'Teams often double-check counts due to trust gaps',
  },
  {
    category: 'Switching',
    nook: 'Migration path designed for Sortly switchers',
    sortly: 'Leaving can feel risky without a clear migration plan',
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
          name: 'Nook Inventory',
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
              A Sortly alternative built for real inventory work
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              Nook is built for barcode scanning, offline reliability, and accountability workflows (check-in/check-out)
              — with pricing that doesn&apos;t punish growth.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/migration/sortly" className="btn btn-outline btn-secondary btn-lg">
              Migrate from Sortly
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">Quick verdict</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            If you&apos;re feeling price shock, need offline scanning, or you track tools/assets checked out to staff, Nook
            is purpose-built for that reality.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Category</th>
                  <th className="text-base-content">Nook</th>
                  <th className="text-base-content">Sortly (common complaints)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.category}>
                    <td className="text-base-content font-medium">{row.category}</td>
                    <td className="text-base-content/80">{row.nook}</td>
                    <td className="text-base-content/80">{row.sortly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-base-content/60 mt-4 text-sm">
            Nook and Sortly are trademarks of their respective owners. This page is based on publicly available
            information and recurring user-reported pain points.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">When Sortly is enough</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You have a small catalog and stable connectivity
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You don&apos;t need tool issue/return accountability
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You rarely bulk edit or run frequent counts
                </li>
              </ul>
            </div>
          </div>

          <div className="card card-border shadow-none border-primary/20">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">When you should switch</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  You&apos;ve been hit by pricing jumps or SKU/user caps
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  Your team scans in warehouses/jobsites with unreliable internet
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  You need real check-in/check-out workflows to stop losses and disputes
                </li>
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className="btn btn-primary btn-gradient">
                  Watch demo
                </Link>
                <Link href="/pricing" className="btn btn-outline btn-secondary">
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-2xl font-semibold">Switch without the risk</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            The fastest way to build confidence is to migrate a small subset of items, label them, and run one scan-first
            cycle count. It takes minutes — and it&apos;s usually enough to feel the difference.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/migration/sortly" className="btn btn-primary btn-gradient btn-lg">
              Follow the migration guide
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/solutions/construction-tools" className="btn btn-outline btn-secondary btn-lg">
              Track tools &amp; assets
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={SORTLY_FAQS} />
    </div>
  )
}

