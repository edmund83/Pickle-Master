/**
 * Wholesaler vs Distributor Glossary Page
 * Primary keyword: "wholesaler vs distributor"
 * Secondary keywords: "difference between wholesaler and distributor"
 * Est. volume: 731+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Wholesaler vs Distributor | Key Differences Explained',
  description:
    'Learn the difference between wholesalers and distributors, when to use each, and how they affect your supply chain. Includes comparison table and examples.',
  pathname: '/learn/glossary/wholesaler-vs-distributor',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is the main difference between a wholesaler and a distributor?',
    answer:
      'Distributors have a direct relationship with manufacturers and often have exclusive territories or product lines. Wholesalers buy from multiple sources and sell to any buyer without exclusive arrangements.',
  },
  {
    question: 'What is a wholesaler?',
    answer:
      'A wholesaler buys products in bulk from various manufacturers or distributors and resells them to retailers or other businesses. They focus on volume and competitive pricing without manufacturer exclusivity.',
  },
  {
    question: 'What is a distributor?',
    answer:
      'A distributor has a formal agreement with a manufacturer to sell their products, often with exclusive rights to a territory or market. They provide additional services like marketing support and technical training.',
  },
  {
    question: 'Which should I buy from: wholesaler or distributor?',
    answer:
      'Buy from a distributor if you need manufacturer support, warranty coverage, or the latest products. Buy from a wholesaler if you prioritize price and are comfortable without manufacturer backing.',
  },
  {
    question: 'Do distributors offer better prices than wholesalers?',
    answer:
      'Not necessarily. Wholesalers may offer lower prices due to competitive sourcing. Distributors may have higher prices but include value-added services. Compare total cost including support and terms.',
  },
  {
    question: 'Can a company be both a wholesaler and a distributor?',
    answer:
      'Yes, some companies act as distributors for certain brands (with exclusive agreements) while also wholesaling other products they source from various suppliers.',
  },
]

export default function WholesalerVsDistributorPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Wholesaler vs Distributor', pathname: '/learn/glossary/wholesaler-vs-distributor' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Supply Chain</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Wholesaler vs Distributor</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          <strong>Wholesalers</strong> and <strong>distributors</strong> both serve as intermediaries between
          manufacturers and end sellers, but they operate differently. Understanding the distinction helps you choose
          the right supply chain partners.
        </p>

        {/* Quick Answer */}
        <div className="mt-8 rounded-lg border-l-4 border-primary bg-primary/5 p-6">
          <h2 className="text-base-content font-semibold">Quick Answer</h2>
          <p className="text-base-content/80 mt-2">
            <strong>Distributor:</strong> Has an exclusive relationship with manufacturers; provides support services.
            <br />
            <strong>Wholesaler:</strong> Buys from multiple sources; focuses on volume and price, no exclusivity.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Key Differences</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Factor</th>
                  <th className="text-base-content">Distributor</th>
                  <th className="text-base-content">Wholesaler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Manufacturer Relationship</td>
                  <td className="text-base-content/80">Direct, often exclusive</td>
                  <td className="text-base-content/80">Indirect, buys from multiple sources</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Territory</td>
                  <td className="text-base-content/80">May have exclusive territories</td>
                  <td className="text-base-content/80">No territorial restrictions</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Services</td>
                  <td className="text-base-content/80">Marketing, training, warranty support</td>
                  <td className="text-base-content/80">Primarily logistics and fulfillment</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Product Range</td>
                  <td className="text-base-content/80">Limited to contracted brands</td>
                  <td className="text-base-content/80">Wide variety from multiple brands</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Pricing</td>
                  <td className="text-base-content/80">May be higher, includes services</td>
                  <td className="text-base-content/80">Competitive, volume-focused</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Risk</td>
                  <td className="text-base-content/80">Shares risk with manufacturer</td>
                  <td className="text-base-content/80">Bears inventory risk independently</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* When to Use Each */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">When to Use Each</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Work with a Distributor When:</h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>You need manufacturer warranty support</li>
                  <li>You want access to the latest product releases</li>
                  <li>You require technical training or marketing materials</li>
                  <li>Brand authenticity and provenance matter</li>
                  <li>You want a long-term partnership relationship</li>
                </ul>
              </div>
            </div>
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Work with a Wholesaler When:</h3>
                <ul className="text-base-content/80 mt-3 list-inside list-disc space-y-2 text-sm">
                  <li>Price is your primary concern</li>
                  <li>You need products from multiple brands</li>
                  <li>You are comfortable without manufacturer backing</li>
                  <li>You want flexibility in sourcing</li>
                  <li>You need quick access to varied inventory</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Manage inventory from any source</h2>
          <p className="text-base-content/80 mt-2">
            Whether you buy from distributors or wholesalers, Nook helps you track all your inventory in one place.
            Manage multiple suppliers, track costs, and maintain accurate stock levels.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/solutions/warehouse-inventory" className="btn btn-outline btn-secondary">
              Warehouse Solutions
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/glossary/consignment-inventory"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Consignment Inventory</h3>
                <p className="text-base-content/80 text-sm">When suppliers retain ownership until sale.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/types-of-inventory"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Types of Inventory</h3>
                <p className="text-base-content/80 text-sm">Raw materials, WIP, finished goods, and MRO.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
