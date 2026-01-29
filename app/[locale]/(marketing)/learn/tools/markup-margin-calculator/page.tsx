/**
 * Markup & Margin Calculator Tool Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (tool hero)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "markup vs margin calculator"
 * Secondary keywords: "markup calculator", "margin calculator", "markup to margin"
 * Companion page: /learn/glossary/markup-vs-margin
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'
import { MarkupMarginCalculator } from '../../glossary/markup-vs-margin/MarkupMarginCalculator'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/learn/tools/markup-margin-calculator',
    title: 'Markup & Margin Calculator | Free Pricing Calculator',
    description:
      'Free markup and margin calculator. Convert between markup and margin, calculate selling prices from cost, and find your profit percentages instantly.',
  })
}

const CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'How do I calculate markup from cost and price?',
    answer:
      'Markup = ((Selling Price - Cost) / Cost) × 100. If an item costs $40 and sells for $60, the markup is (($60 - $40) / $40) × 100 = 50%.',
  },
  {
    question: 'How do I calculate margin from cost and price?',
    answer:
      'Margin = ((Selling Price - Cost) / Selling Price) × 100. If an item costs $40 and sells for $60, the margin is (($60 - $40) / $60) × 100 = 33.3%.',
  },
  {
    question: 'How do I calculate selling price from cost and markup?',
    answer:
      'Selling Price = Cost × (1 + Markup / 100). If an item costs $40 and you want a 50% markup, the selling price is $40 × 1.50 = $60.',
  },
  {
    question: 'How do I calculate selling price from cost and margin?',
    answer:
      'Selling Price = Cost / (1 - Margin / 100). If an item costs $40 and you want a 33.3% margin, the selling price is $40 / 0.667 = $60.',
  },
  {
    question: 'What is the difference between markup and margin?',
    answer:
      'Markup is calculated as a percentage of cost; margin is calculated as a percentage of selling price. For the same dollar profit, markup percentage is always higher than margin percentage.',
  },
  {
    question: 'What is keystone pricing?',
    answer:
      'Keystone pricing means a 100% markup (doubling your cost). A $50 cost becomes a $100 price. This equals a 50% margin. Common in retail industries like apparel and home goods.',
  },
]

export default function MarkupMarginCalculatorPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Tools', pathname: '/learn/tools' },
          { name: 'Markup & Margin Calculator', pathname: '/learn/tools/markup-margin-calculator' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(CALCULATOR_FAQS)} />

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/tools" className="text-primary text-sm hover:underline">
            ← Tools
          </Link>
          <span className="badge badge-soft badge-neutral">Calculator</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Markup & Margin Calculator</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          Calculate selling prices from cost, or find your markup and margin percentages from known prices. Switch
          between modes to solve different pricing problems.
        </p>

        {/* Calculator */}
        <MarkupMarginCalculator />

        {/* Quick Reference */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Quick Reference: Markup ↔ Margin</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Markup %</th>
                  <th className="text-base-content">Margin %</th>
                  <th className="text-base-content">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content">15%</td>
                  <td className="text-primary">13.0%</td>
                  <td className="text-base-content/80">×1.15</td>
                </tr>
                <tr>
                  <td className="text-base-content">25%</td>
                  <td className="text-primary">20.0%</td>
                  <td className="text-base-content/80">×1.25</td>
                </tr>
                <tr>
                  <td className="text-base-content">33.3%</td>
                  <td className="text-primary">25.0%</td>
                  <td className="text-base-content/80">×1.33</td>
                </tr>
                <tr>
                  <td className="text-base-content">50%</td>
                  <td className="text-primary">33.3%</td>
                  <td className="text-base-content/80">×1.50</td>
                </tr>
                <tr className="bg-base-200">
                  <td className="text-base-content font-semibold">100%</td>
                  <td className="text-primary font-semibold">50.0%</td>
                  <td className="text-base-content/80 font-semibold">×2.00 (Keystone)</td>
                </tr>
                <tr>
                  <td className="text-base-content">150%</td>
                  <td className="text-primary">60.0%</td>
                  <td className="text-base-content/80">×2.50</td>
                </tr>
                <tr>
                  <td className="text-base-content">200%</td>
                  <td className="text-primary">66.7%</td>
                  <td className="text-base-content/80">×3.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulas */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Formulas</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-base-200 p-4">
              <h3 className="text-base-content font-semibold">Markup</h3>
              <p className="text-base-content mt-2 font-mono text-sm">Markup = (Price - Cost) / Cost × 100</p>
            </div>
            <div className="rounded-lg bg-base-200 p-4">
              <h3 className="text-base-content font-semibold">Margin</h3>
              <p className="text-base-content mt-2 font-mono text-sm">Margin = (Price - Cost) / Price × 100</p>
            </div>
            <div className="rounded-lg bg-base-200 p-4">
              <h3 className="text-base-content font-semibold">Markup → Margin</h3>
              <p className="text-base-content mt-2 font-mono text-sm">Margin = Markup / (100 + Markup) × 100</p>
            </div>
            <div className="rounded-lg bg-base-200 p-4">
              <h3 className="text-base-content font-semibold">Margin → Markup</h3>
              <p className="text-base-content mt-2 font-mono text-sm">Markup = Margin / (100 - Margin) × 100</p>
            </div>
          </div>
        </div>

        {/* Learn More */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Want to learn more?</h2>
          <p className="text-base-content/80 mt-2">
            Read our complete guide on markup vs margin, including when to use each, common mistakes, and industry
            benchmarks.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/learn/glossary/markup-vs-margin" className="btn btn-primary">
              Read the Guide
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/learn/glossary/cost-of-goods-sold" className="btn btn-outline btn-secondary">
              Learn About COGS
            </Link>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/tools/reorder-point-calculator"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Reorder Point Calculator</h3>
                <p className="text-base-content/80 text-sm">Calculate when to reorder inventory.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover Calculator</h3>
                <p className="text-base-content/80 text-sm">Calculate how fast you sell through inventory.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={CALCULATOR_FAQS} />
    </div>
  )
}
