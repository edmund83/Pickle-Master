/**
 * Inventory vs Stock Glossary Page
 * Primary keyword: "inventory vs stock"
 * Secondary keywords: "difference between inventory and stock"
 * Est. volume: 345+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory vs Stock | What is the Difference?',
  description:
    'Learn the difference between inventory and stock. In most contexts they mean the same thing, but there are important distinctions in accounting and regional usage.',
  pathname: '/learn/glossary/inventory-vs-stock',
})

const FAQS: FaqItem[] = [
  {
    question: 'Is inventory the same as stock?',
    answer:
      'In everyday business usage, yes — inventory and stock are used interchangeably to mean goods held for sale. The terms differ mainly in regional preference (US vs UK) and in specific accounting contexts.',
  },
  {
    question: 'Why do some companies say "stock" and others say "inventory"?',
    answer:
      'Americans typically use "inventory" while British English prefers "stock." Both refer to goods a business holds for sale or use in production.',
  },
  {
    question: 'What does "stock" mean in accounting?',
    answer:
      'In accounting, "stock" can mean two things: (1) inventory of goods, or (2) shares of ownership in a company (equity stock). Context determines the meaning.',
  },
  {
    question: 'What is stock-taking vs inventory count?',
    answer:
      'They mean the same thing: counting physical items to verify quantities. Stock-taking is more common in British English; inventory count is preferred in American English.',
  },
  {
    question: 'Is inventory an asset?',
    answer:
      'Yes, inventory (stock) is a current asset on the balance sheet. It represents goods owned by the business that are expected to be sold within one year.',
  },
  {
    question: 'What is the difference between stock and inventory in retail?',
    answer:
      'In retail, there is no practical difference. Both terms refer to the merchandise held in stores or warehouses for sale to customers.',
  },
]

export default function InventoryVsStockPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Inventory vs Stock', pathname: '/learn/glossary/inventory-vs-stock' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Terminology</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Inventory vs Stock</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          In most business contexts, <strong>inventory</strong> and <strong>stock</strong> mean the same thing: goods
          held by a business for sale or use. The distinction is mainly regional (US vs UK) and contextual
          (accounting).
        </p>

        {/* Quick Answer */}
        <div className="mt-8 rounded-lg border-l-4 border-primary bg-primary/5 p-6">
          <h2 className="text-base-content font-semibold">Quick Answer</h2>
          <p className="text-base-content/80 mt-2">
            <strong>Inventory</strong> = American English term for goods on hand.
            <br />
            <strong>Stock</strong> = British English term for goods on hand (or shares in a company).
            <br />
            <br />
            For inventory management purposes, the terms are interchangeable.
          </p>
        </div>

        {/* Regional Usage */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Regional Terminology</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-box bg-base-200 p-6">
              <h3 className="text-base-content text-lg font-semibold">🇺🇸 American English</h3>
              <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                <li>
                  <strong>Inventory</strong> — goods for sale
                </li>
                <li>
                  <strong>Inventory management</strong> — tracking goods
                </li>
                <li>
                  <strong>Inventory count</strong> — physical count
                </li>
                <li>
                  <strong>Out of inventory</strong> — sold out
                </li>
                <li>
                  <strong>Stock</strong> — usually means company shares
                </li>
              </ul>
            </div>
            <div className="rounded-box bg-base-200 p-6">
              <h3 className="text-base-content text-lg font-semibold">🇬🇧 British English</h3>
              <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                <li>
                  <strong>Stock</strong> — goods for sale
                </li>
                <li>
                  <strong>Stock control</strong> — tracking goods
                </li>
                <li>
                  <strong>Stocktake</strong> — physical count
                </li>
                <li>
                  <strong>Out of stock</strong> — sold out
                </li>
                <li>
                  <strong>Shares</strong> — company ownership
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accounting Context */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">The Accounting Distinction</h2>
          <p className="text-base-content/80 mt-2">
            In accounting, &quot;stock&quot; has an additional meaning that can cause confusion:
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Stock (as Inventory)</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Physical goods held for sale. Appears as a current asset on the balance sheet. Also called &quot;stock on
                  hand&quot; or &quot;stock in trade.&quot;
                </p>
                <div className="bg-base-200 mt-4 rounded-lg p-3">
                  <p className="text-base-content/80 text-xs">
                    <strong>Example:</strong> &quot;Our stock of widgets is running low.&quot;
                  </p>
                </div>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Stock (as Equity)</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Ownership shares in a company. Represents shareholder equity. Traded on stock exchanges.
                </p>
                <div className="bg-base-200 mt-4 rounded-lg p-3">
                  <p className="text-base-content/80 text-xs">
                    <strong>Example:</strong> &quot;She owns 100 shares of company stock.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practical Usage */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">What This Means for You</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <h3 className="text-success flex items-center gap-2 font-semibold">
                <span className="icon-[tabler--check] size-5"></span>
                For inventory management
              </h3>
              <p className="text-base-content/80 mt-2 text-sm">
                Use &quot;inventory&quot; or &quot;stock&quot; interchangeably. Your team and software will understand both. Choose the
                term that matches your region or industry convention.
              </p>
            </div>
            <div className="rounded-lg border border-info/30 bg-info/5 p-4">
              <h3 className="text-info flex items-center gap-2 font-semibold">
                <span className="icon-[tabler--info-circle] size-5"></span>
                For financial reporting
              </h3>
              <p className="text-base-content/80 mt-2 text-sm">
                Be clear about context. Say &quot;inventory of goods&quot; or &quot;finished goods inventory&quot; to avoid confusion with
                &quot;capital stock&quot; or &quot;treasury stock.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Manage your inventory with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            Whether you call it inventory or stock, StockZip helps you track it. Manage quantities, locations, costs, and
            movements all in one place.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/solutions/small-business" className="btn btn-outline btn-secondary">
              Small Business Solutions
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/glossary/types-of-inventory"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Types of Inventory</h3>
                <p className="text-base-content/80 text-sm">Raw materials, WIP, finished goods, MRO.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover</h3>
                <p className="text-base-content/80 text-sm">How fast you sell through your stock.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
