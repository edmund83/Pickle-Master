import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Perpetual vs periodic inventory',
  description:
    'Perpetual inventory vs periodic inventory explained: definitions, pros/cons, and which system small teams can keep accurate with barcode scanning.',
  pathname: '/learn/perpetual-vs-periodic-inventory',
  ogType: 'article',
})

const FAQS: FaqItem[] = [
  {
    question: 'Is perpetual inventory always better than periodic?',
    answer:
      'Not always. Perpetual is better for speed and day-to-day accuracy, but it requires disciplined workflows (scanning, audit trail, cycle counts) to stay trustworthy.',
  },
  {
    question: 'What’s the biggest weakness of periodic inventory?',
    answer:
      'You don’t know what you truly have between counts. That creates stockouts, over-ordering, and “we’ll fix it later” drift.',
  },
  {
    question: 'How do small businesses keep perpetual inventory accurate?',
    answer:
      'Scan everything, standardize locations, use low-stock alerts, and run small cycle counts weekly. The goal is a trusted baseline and fast correction.',
  },
  {
    question: 'Can I start periodic and transition to perpetual later?',
    answer:
      'Yes. Many teams start by importing inventory, labeling top movers, and using scan-first adjustments. Over time, perpetual becomes the default as workflows stick.',
  },
]

export default function PerpetualVsPeriodicInventoryPage() {
  const published = '2026-01-01'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Perpetual vs periodic inventory', pathname: '/learn/perpetual-vs-periodic-inventory' },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          headline: 'Perpetual vs periodic inventory: what’s the difference?',
          description:
            'A practical guide for small teams: definitions, pros/cons, and how barcode scanning makes perpetual inventory easier to keep accurate.',
          pathname: '/learn/perpetual-vs-periodic-inventory',
          datePublished: published,
          dateModified: published,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header>
          <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Guide</p>
          <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
            Perpetual vs periodic inventory
          </h1>
          <p className="text-base-content/80 mt-3 text-lg">
            If you&apos;re trying to keep stock accurate with a small team, this is the decision that shapes everything:
            how often you update inventory, how much you trust the numbers, and how painful counts feel.
          </p>
          <p className="text-base-content/60 mt-4 text-sm">Last updated: {published}</p>
        </header>

        <section className="mt-10 space-y-10">
          <div>
            <h2 className="text-base-content text-2xl font-semibold">Quick definitions</h2>
            <p className="text-base-content/80 mt-3">
              <span className="text-base-content font-semibold">Perpetual inventory</span> updates quantities continuously as
              transactions happen (receiving, sales, transfers, adjustments).{' '}
              <span className="text-base-content font-semibold">Periodic inventory</span> updates quantities at specific
              intervals (weekly, monthly, quarterly) based on a physical count.
            </p>
          </div>

          <div>
            <h2 className="text-base-content text-2xl font-semibold">Side-by-side comparison</h2>
            <div className="mt-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Category</th>
                  <th className="text-base-content">Perpetual</th>
                  <th className="text-base-content">Periodic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Accuracy between counts</td>
                  <td className="text-base-content/80">Higher (if workflows are disciplined)</td>
                  <td className="text-base-content/80">Lower (unknown between counts)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Effort</td>
                  <td className="text-base-content/80">Distributed daily (scan + small corrections)</td>
                  <td className="text-base-content/80">Spiky (big counts + reconciliations)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Best for</td>
                  <td className="text-base-content/80">Warehouses, ecommerce, tool tracking</td>
                  <td className="text-base-content/80">Very small catalogs or low transaction volume</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Biggest risk</td>
                  <td className="text-base-content/80">Bad process creates “false confidence”</td>
                  <td className="text-base-content/80">You make decisions on stale numbers</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <div>
            <h2 className="text-base-content text-2xl font-semibold">Which should a small business choose?</h2>
            <p className="text-base-content/80 mt-3">
              If you reorder regularly, sell online, move stock between locations, or issue tools to staff, perpetual inventory
              usually wins — <span className="text-base-content font-semibold">but only</span> if you can keep updates fast and simple.
            </p>
            <p className="text-base-content/80 mt-3">
              The turning point is scanning. When a team can <span className="text-base-content font-semibold">scan → confirm → done</span>,
              perpetual inventory stops feeling like overhead and starts feeling like insurance.
            </p>
          </div>

          <div>
            <h2 className="text-base-content text-2xl font-semibold">How to make perpetual inventory work (without an ERP)</h2>
            <ol className="text-base-content/80 mt-4 list-decimal space-y-2 pl-6">
              <li>Label top movers first (don’t wait for perfection).</li>
              <li>Standardize locations (warehouse → shelf → bin).</li>
              <li>Scan to receive, transfer, and adjust — don’t “fix later.”</li>
              <li>Run small weekly cycle counts to maintain trust.</li>
              <li>Use low-stock alerts so reorder decisions aren’t guesswork.</li>
            </ol>
          </div>
        </section>

        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-2xl font-semibold">Want perpetual inventory without the pain?</h2>
          <p className="text-base-content/80 mt-3">
            Pickle is built for small teams: barcode scanning, offline reliability, and audit trails that keep counts
            trustworthy.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-primary btn-gradient btn-lg">
              Watch demo
            </Link>
            <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary btn-lg">
              Barcode scanning
            </Link>
          </div>
        </div>
      </article>

      <FaqBlock items={FAQS} />
    </div>
  )
}
