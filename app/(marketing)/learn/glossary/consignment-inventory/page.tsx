/**
 * Consignment Inventory Glossary Page
 * Primary keyword: "consignment inventory"
 * Secondary keywords: "what is consignment inventory", "consignment vs wholesale"
 * Est. volume: 552+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Consignment Inventory | Definition, Accounting & Pros/Cons',
  description:
    'Learn what consignment inventory is, how it works, and when to use it. Understand the difference between consignment and wholesale arrangements.',
  pathname: '/learn/glossary/consignment-inventory',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is consignment inventory?',
    answer:
      'Consignment inventory is stock owned by a supplier (consignor) but held and sold by a retailer (consignee). The retailer only pays for items after they are sold to end customers.',
  },
  {
    question: 'How does consignment inventory work?',
    answer:
      'The supplier delivers goods to the retailer. The retailer displays and sells them. When items sell, the retailer pays the supplier their agreed share (usually wholesale price). Unsold items can be returned.',
  },
  {
    question: 'Who owns consignment inventory?',
    answer:
      'The supplier (consignor) retains ownership until the item is sold to an end customer. The retailer (consignee) never owns the goods; they simply store and sell them on behalf of the supplier.',
  },
  {
    question: 'What is the difference between consignment and wholesale?',
    answer:
      'With wholesale, the retailer buys inventory upfront and owns it. With consignment, the retailer does not pay until items sell and can return unsold goods. Consignment shifts risk to the supplier.',
  },
  {
    question: 'How is consignment inventory accounted for?',
    answer:
      'The consignor keeps consigned goods on their balance sheet as inventory. The consignee does not record the goods as an asset. Sales revenue is split based on the consignment agreement.',
  },
  {
    question: 'What are the risks of consignment for suppliers?',
    answer:
      'Suppliers bear the risk of unsold inventory, damage, or theft while goods are at the retailer. They also wait longer for payment since they only get paid after end-customer sales.',
  },
]

export default function ConsignmentInventoryPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Consignment Inventory', pathname: '/learn/glossary/consignment-inventory' },
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
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Consignment Inventory</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          <strong>Consignment inventory</strong> is a supply arrangement where the supplier retains ownership of goods
          until they are sold by the retailer. The retailer only pays for what sells and can return unsold items.
        </p>

        {/* How It Works */}
        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold">How Consignment Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full text-xl font-bold">
                1
              </div>
              <h3 className="text-base-content mt-3 font-semibold">Supplier Ships Goods</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Consignor sends inventory to the retailer (consignee). Ownership stays with the supplier.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full text-xl font-bold">
                2
              </div>
              <h3 className="text-base-content mt-3 font-semibold">Retailer Sells Items</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Consignee displays and sells goods. Title transfers to customer at point of sale.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full text-xl font-bold">
                3
              </div>
              <h3 className="text-base-content mt-3 font-semibold">Retailer Pays Supplier</h3>
              <p className="text-base-content/80 mt-1 text-sm">
                Consignee remits the agreed amount per sale. Unsold items may be returned.
              </p>
            </div>
          </div>
        </div>

        {/* Consignment vs Wholesale */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Consignment vs Wholesale</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Factor</th>
                  <th className="text-base-content">Consignment</th>
                  <th className="text-base-content">Wholesale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Who owns the goods?</td>
                  <td className="text-base-content/80">Supplier (until sold)</td>
                  <td className="text-base-content/80">Retailer (after purchase)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">When does retailer pay?</td>
                  <td className="text-base-content/80">After items sell</td>
                  <td className="text-base-content/80">At time of order/delivery</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Unsold inventory</td>
                  <td className="text-base-content/80">Can be returned</td>
                  <td className="text-base-content/80">Retailer's problem</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Inventory risk</td>
                  <td className="text-base-content/80">Supplier bears risk</td>
                  <td className="text-base-content/80">Retailer bears risk</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Cash flow for retailer</td>
                  <td className="text-base-content/80">Better (no upfront payment)</td>
                  <td className="text-base-content/80">Worse (capital tied up)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Supplier margin</td>
                  <td className="text-base-content/80">Often lower (more risk)</td>
                  <td className="text-base-content/80">Often higher</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Pros and Cons</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-base-content mb-4 font-semibold">For Retailers (Consignee)</h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-success text-sm font-medium">✓ No upfront inventory cost</p>
                </div>
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-success text-sm font-medium">✓ No risk on unsold goods</p>
                </div>
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-success text-sm font-medium">✓ Can test new products safely</p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-warning text-sm font-medium">− Lower profit per sale</p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-warning text-sm font-medium">− Must track supplier's inventory</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base-content mb-4 font-semibold">For Suppliers (Consignor)</h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-success text-sm font-medium">✓ Get shelf space without sales effort</p>
                </div>
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-success text-sm font-medium">✓ Reach customers through retailers</p>
                </div>
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-success text-sm font-medium">✓ Maintain brand presence</p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-warning text-sm font-medium">− Bear all inventory risk</p>
                </div>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-warning text-sm font-medium">− Delayed payment (after sale)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Track consignment inventory with Nook</h2>
          <p className="text-base-content/80 mt-2">
            Nook helps you track inventory regardless of ownership. Tag consigned goods separately, track sales, and
            generate reports for supplier settlements.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/solutions/ecommerce-inventory" className="btn btn-outline btn-secondary">
              Ecommerce Solutions
            </Link>
          </div>
        </div>

        {/* Related Terms */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Related terms</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/glossary/wholesaler-vs-distributor"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Wholesaler vs Distributor</h3>
                <p className="text-base-content/80 text-sm">Understanding supply chain intermediaries.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover</h3>
                <p className="text-base-content/80 text-sm">How fast consigned goods move.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
