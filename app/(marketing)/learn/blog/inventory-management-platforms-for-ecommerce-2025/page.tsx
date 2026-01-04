/**
 * Ecommerce Inventory Management Platforms Guide 2025
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (blog article hero)
 * - Blog: /marketing-ui/blog/blog (article layout)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "inventory management platforms for ecommerce 2025"
 * Secondary keywords: "best ecommerce inventory software", "inventory tools for online sellers"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Best Inventory Management Platforms for Ecommerce in 2025 | Comparison Guide',
  description:
    'Compare the top inventory management platforms for ecommerce in 2025. Learn what features matter, how to choose, and which tools fit different business sizes.',
  pathname: '/blog/inventory-management-platforms-for-ecommerce-2025',
})

const ARTICLE_FAQS: FaqItem[] = [
  {
    question: 'What is the best inventory management platform for small ecommerce businesses?',
    answer:
      'For small ecommerce businesses, look for platforms that offer easy setup, barcode scanning, low-stock alerts, and predictable pricing. Avoid enterprise tools with features you will never use. StockZip, Sortly, and inFlow are popular choices for small sellers.',
  },
  {
    question: 'How much does ecommerce inventory software cost in 2025?',
    answer:
      'Pricing varies widely. Free tiers exist but often have item or user limits. Paid plans typically range from $19-99/month for small teams to $200+/month for multi-location enterprises. Watch for per-SKU charges that can spike costs as you grow.',
  },
  {
    question: 'Do I need inventory software if I use Shopify?',
    answer:
      'Shopify has basic inventory tracking, but dedicated inventory software adds barcode scanning, multi-location management, low-stock alerts, and audit trails. If you have more than one sales channel or warehouse, standalone inventory software is usually worth it.',
  },
  {
    question: 'What features are essential for ecommerce inventory management?',
    answer:
      'Essential features include: barcode/QR scanning for speed and accuracy, low-stock alerts with customizable thresholds, multi-location support if you have multiple warehouses, CSV import/export for data portability, and a mobile app for warehouse work.',
  },
  {
    question: 'Can inventory software prevent overselling?',
    answer:
      'Yes. By keeping counts accurate through scan-based workflows and real-time updates, inventory software reduces the data drift that causes overselling. Some platforms also sync directly with sales channels to update available quantities automatically.',
  },
]

const PLATFORMS = [
  {
    name: 'StockZip Inventory',
    focus: 'Scan-first simplicity',
    bestFor: 'Small teams, warehouse + ecommerce hybrid',
    strengths: ['Offline mode', 'Check-in/check-out', 'Predictable pricing', 'Fast barcode scanning'],
    considerations: ['Newer platform', 'Fewer native integrations (CSV-based workflow)'],
    pricing: 'From $19/month',
  },
  {
    name: 'Sortly',
    focus: 'Visual inventory',
    bestFor: 'Photo-heavy catalogs, asset tracking',
    strengths: ['Photo-centric UI', 'QR code labels', 'Folder organization', 'Mobile app'],
    considerations: ['Price tier jumps', 'SKU limits on lower tiers', 'Reported sync issues'],
    pricing: 'From $29/month (limited SKUs)',
  },
  {
    name: 'inFlow Inventory',
    focus: 'Order management',
    bestFor: 'B2B sellers, wholesale operations',
    strengths: ['Purchase orders', 'Sales orders', 'Reporting', 'Integrations'],
    considerations: ['Desktop-centric', 'Steeper learning curve', 'Higher price point'],
    pricing: 'From $89/month',
  },
  {
    name: 'Fishbowl',
    focus: 'Manufacturing + warehousing',
    bestFor: 'Manufacturers, QuickBooks users',
    strengths: ['Deep QuickBooks integration', 'Manufacturing workflows', 'Multi-warehouse'],
    considerations: ['Complex setup', 'Enterprise pricing', 'Overkill for simple ecommerce'],
    pricing: 'From $349/month',
  },
  {
    name: 'Cin7',
    focus: 'Omnichannel commerce',
    bestFor: 'Multi-channel sellers with high volume',
    strengths: ['Native sales channel integrations', '3PL support', 'Automation', 'EDI'],
    considerations: ['High price', 'Long implementation', 'Complex for small sellers'],
    pricing: 'From $349/month',
  },
]

const SELECTION_CRITERIA = [
  {
    criterion: 'Barcode scanning',
    why: 'Reduces data entry errors and speeds up receiving, picking, and counting by 3-5x.',
    questions: ['Does it support phone camera scanning?', 'Can I use Bluetooth scanners?', 'Does scanning work offline?'],
  },
  {
    criterion: 'Multi-location support',
    why: 'Essential if you have inventory in more than one place (warehouse, store, 3PL, home office).',
    questions: ['Can I track stock per location?', 'Can I transfer between locations?', 'Are locations included in the base price?'],
  },
  {
    criterion: 'Low-stock alerts',
    why: 'Prevents stockouts by notifying you before items run out.',
    questions: ['Can I set different thresholds per SKU?', 'How are alerts delivered (email, push, in-app)?', 'Can I set reorder points?'],
  },
  {
    criterion: 'Pricing transparency',
    why: 'Avoid surprise costs as you grow. Some platforms charge per SKU or user.',
    questions: ['Are there SKU or item limits?', 'What happens when I exceed limits?', 'Is there a free trial to test?'],
  },
  {
    criterion: 'Data portability',
    why: 'You should be able to export your data if you switch platforms.',
    questions: ['Can I export to CSV?', 'Can I export full history?', 'Is there a lock-in contract?'],
  },
]

export default function EcommerceInventoryPlatforms2025Page() {
  const publishDate = '2026-01-02'
  const updateDate = '2026-01-02'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Ecommerce Inventory Platforms 2025', pathname: '/blog/inventory-management-platforms-for-ecommerce-2025' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(ARTICLE_FAQS)} />

      {/* Article Header */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm">
            <span className="badge badge-soft badge-primary rounded-full">Guide</span>
            <time dateTime={publishDate} className="text-base-content/60">
              Published {publishDate}
            </time>
            {updateDate !== publishDate && (
              <span className="text-base-content/60">· Updated {updateDate}</span>
            )}
          </div>
          <h1 className="text-base-content mt-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Best Inventory Management Platforms for Ecommerce in 2025
          </h1>
          <p className="text-base-content/80 mt-6 text-lg md:text-xl">
            A practical comparison of inventory tools for online sellers. What features matter, what to watch out for,
            and how to choose the right platform for your business size.
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="rounded-box bg-base-200 mb-12 p-6">
          <h2 className="text-base-content mb-4 text-lg font-semibold">In this guide</h2>
          <ol className="text-base-content/80 list-inside list-decimal space-y-2">
            <li>
              <a href="#why-dedicated-software" className="link link-hover">
                Why use dedicated inventory software?
              </a>
            </li>
            <li>
              <a href="#how-to-choose" className="link link-hover">
                How to choose the right platform
              </a>
            </li>
            <li>
              <a href="#platform-comparison" className="link link-hover">
                Platform comparison: 5 options reviewed
              </a>
            </li>
            <li>
              <a href="#recommendations" className="link link-hover">
                Recommendations by business size
              </a>
            </li>
            <li>
              <a href="#faq" className="link link-hover">
                Frequently asked questions
              </a>
            </li>
          </ol>
        </nav>

        {/* Section 1: Why Dedicated Software */}
        <section id="why-dedicated-software" className="prose prose-lg max-w-none mb-12">
          <h2 className="text-base-content text-2xl font-semibold">Why use dedicated inventory software?</h2>
          <p className="text-base-content/80">
            Spreadsheets and basic platform tools (like Shopify&apos;s built-in inventory) work when you have a handful of
            products and one sales channel. But as you grow, their limitations become painful:
          </p>
          <ul className="text-base-content/80 space-y-2">
            <li>
              <strong>Manual updates are slow and error-prone.</strong> Every typo creates a discrepancy that compounds
              over time.
            </li>
            <li>
              <strong>No visibility across locations.</strong> If you sell from multiple warehouses, fulfillment centers,
              or pop-up shops, you need per-location stock levels.
            </li>
            <li>
              <strong>No proactive alerts.</strong> You find out you are out of stock when a customer complains, not
              before.
            </li>
            <li>
              <strong>No audit trail.</strong> When counts are wrong, you have no idea who changed what or when.
            </li>
          </ul>
          <p className="text-base-content/80">
            Dedicated inventory software solves these problems with barcode scanning (faster, more accurate), low-stock
            alerts (proactive reordering), multi-location tracking (one source of truth), and audit trails
            (accountability).
          </p>
        </section>

        {/* Section 2: How to Choose */}
        <section id="how-to-choose" className="mb-12">
          <h2 className="text-base-content mb-6 text-2xl font-semibold">How to choose the right platform</h2>
          <p className="text-base-content/80 mb-8">
            Not every feature matters equally. Focus on these criteria when evaluating inventory tools:
          </p>
          <div className="space-y-6">
            {SELECTION_CRITERIA.map((item) => (
              <div key={item.criterion} className="card card-border bg-base-100">
                <div className="card-body">
                  <h3 className="text-base-content text-lg font-semibold">{item.criterion}</h3>
                  <p className="text-base-content/80">{item.why}</p>
                  <div className="mt-4">
                    <p className="text-base-content/60 mb-2 text-sm font-medium">Questions to ask:</p>
                    <ul className="text-base-content/70 list-inside list-disc space-y-1 text-sm">
                      {item.questions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Platform Comparison */}
        <section id="platform-comparison" className="mb-12">
          <h2 className="text-base-content mb-6 text-2xl font-semibold">Platform comparison: 5 options reviewed</h2>
          <p className="text-base-content/80 mb-8">
            We reviewed five popular inventory management platforms for ecommerce sellers. Here is how they compare:
          </p>
          <div className="space-y-6">
            {PLATFORMS.map((platform) => (
              <div key={platform.name} className="card card-border bg-base-100">
                <div className="card-body">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base-content text-xl font-semibold">{platform.name}</h3>
                      <p className="text-primary text-sm font-medium">{platform.focus}</p>
                    </div>
                    <span className="badge badge-outline">{platform.pricing}</span>
                  </div>
                  <p className="text-base-content/70 mt-2 text-sm">
                    <strong>Best for:</strong> {platform.bestFor}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-success mb-2 text-sm font-medium">Strengths</p>
                      <ul className="text-base-content/80 list-inside list-disc space-y-1 text-sm">
                        {platform.strengths.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-warning mb-2 text-sm font-medium">Considerations</p>
                      <ul className="text-base-content/80 list-inside list-disc space-y-1 text-sm">
                        {platform.considerations.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Recommendations */}
        <section id="recommendations" className="mb-12">
          <h2 className="text-base-content mb-6 text-2xl font-semibold">Recommendations by business size</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <span className="icon-[tabler--user] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Solo seller</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Start with a free tier to validate your workflow. StockZip or Sortly work well for under 500 items.
                  Prioritize mobile scanning and easy CSV import.
                </p>
              </div>
            </div>
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <span className="icon-[tabler--users] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Small team (2-10)</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Need multi-user access and role permissions. StockZip, inFlow, or Sortly Team plans. Watch for per-user
                  pricing that scales poorly.
                </p>
              </div>
            </div>
            <div className="card card-border bg-base-100">
              <div className="card-body">
                <span className="icon-[tabler--building] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Multi-location / high volume</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Need robust multi-warehouse, integrations, and automation. Cin7 or Fishbowl if budget allows. inFlow
                  for mid-market.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-box bg-base-200 mb-12 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base-content text-2xl font-semibold">Try StockZip for your ecommerce inventory</h2>
              <p className="text-base-content/80 mt-2 max-w-2xl">
                StockZip is built for ecommerce teams who want accurate counts without enterprise complexity. Start with a
                14-day free trial — no credit card required.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/solutions/ecommerce-inventory" className="btn btn-outline btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="mb-12">
          <h2 className="text-base-content mb-6 text-xl font-semibold">Related resources</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/solutions/ecommerce-inventory"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--shopping-cart] text-primary size-6"></span>
                <h3 className="text-base-content mt-2 font-semibold">Ecommerce inventory</h3>
                <p className="text-base-content/70 mt-1 text-sm">How StockZip helps online sellers.</p>
              </div>
            </Link>
            <Link
              href="/features/barcode-scanning"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--barcode] text-primary size-6"></span>
                <h3 className="text-base-content mt-2 font-semibold">Barcode scanning</h3>
                <p className="text-base-content/70 mt-1 text-sm">Scan-first workflows explained.</p>
              </div>
            </Link>
            <Link
              href="/pricing"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--receipt] text-primary size-6"></span>
                <h3 className="text-base-content mt-2 font-semibold">Pricing</h3>
                <p className="text-base-content/70 mt-1 text-sm">Transparent, predictable pricing.</p>
              </div>
            </Link>
          </div>
        </section>
      </article>

      {/* FAQ Section */}
      <div id="faq">
        <FaqBlock items={ARTICLE_FAQS} />
      </div>
    </div>
  )
}
