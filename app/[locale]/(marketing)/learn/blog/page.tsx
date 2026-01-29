/**
 * Blog Hub Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (hub page hero)
 * - Blog: /marketing-ui/blog/blog-3 (article cards)
 *
 * Primary keyword: "inventory management blog"
 * Secondary keywords: "inventory tips", "ecommerce inventory guide"
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
    pathname: '/learn/blog',
    title: 'Inventory Management Blog | Tips, Guides & Industry Insights',
    description:
      'Practical inventory management tips, software comparisons, and industry insights. Learn how to improve accuracy, reduce costs, and scale your operations.',
  })
}

const BLOG_ARTICLES = [
  {
    title: 'Best Inventory Management Platforms for Ecommerce in 2025',
    slug: 'inventory-management-platforms-for-ecommerce-2025',
    description:
      'Compare the top inventory management platforms for ecommerce. Learn what features matter, how to choose, and which tools fit different business sizes.',
    date: '2025-01-03',
    readTime: '12 min read',
    category: 'Comparison',
    icon: 'icon-[tabler--shopping-cart]',
  },
]

export default function BlogPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Blog', pathname: '/blog' },
        ])}
      />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Blog</p>
          <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
            Inventory Management Blog
          </h1>
          <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
            Practical tips, software comparisons, and industry insights. Learn how small teams keep inventory accurate
            without enterprise complexity.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="card card-border shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <span className={`${article.icon} text-primary size-6`}></span>
                  </div>
                  <span className="badge badge-soft badge-secondary">{article.category}</span>
                </div>
                <h2 className="text-base-content mt-4 text-xl font-semibold">{article.title}</h2>
                <p className="text-base-content/80 mt-2 line-clamp-3">{article.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-base-content/50 text-sm">
                    <span>{article.date}</span>
                    <span className="mx-2">·</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="link link-primary link-animated">Read article →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Note */}
        <div className="mt-8 text-center">
          <p className="text-base-content/60 text-sm">
            More articles coming soon. Subscribe to get notified when we publish new content.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-box bg-base-200 p-8 text-center">
          <h2 className="text-base-content text-2xl font-semibold">Put these insights into practice</h2>
          <p className="text-base-content/80 mx-auto mt-3 max-w-2xl">
            Try StockZip free and see how scan-first workflows, low-stock alerts, and real-time tracking can transform your
            inventory management.
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
        <div className="mt-16 pb-16">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link
              href="/learn"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--book] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Inventory Guides</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Step-by-step guides for perpetual vs periodic inventory, reorder points, and barcode workflows.
                </p>
              </div>
            </Link>
            <Link
              href="/learn/templates"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--file-spreadsheet] text-success size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Free Templates</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Download inventory spreadsheets, cycle count sheets, and more.
                </p>
              </div>
            </Link>
            <Link
              href="/learn/glossary"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--book-2] text-accent size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Glossary</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Clear definitions for inventory turnover, EOQ, and other key terms.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
