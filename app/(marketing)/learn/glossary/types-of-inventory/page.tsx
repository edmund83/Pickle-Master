/**
 * Types of Inventory Glossary Page
 * Primary keyword: "types of inventory"
 * Secondary keywords: "4 types of inventory", "inventory types"
 * Est. volume: 486+ monthly
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Types of Inventory | The 4 Categories Explained',
  description:
    'Learn about the 4 types of inventory: raw materials, work-in-progress, finished goods, and MRO. Understand how to manage each type effectively.',
  pathname: '/learn/glossary/types-of-inventory',
})

const FAQS: FaqItem[] = [
  {
    question: 'What are the 4 types of inventory?',
    answer:
      'The four main types are: (1) Raw Materials - unprocessed inputs, (2) Work-in-Progress (WIP) - partially completed goods, (3) Finished Goods - completed products ready for sale, and (4) MRO - maintenance, repair, and operations supplies.',
  },
  {
    question: 'What is raw materials inventory?',
    answer:
      'Raw materials are the basic inputs used to manufacture products. Examples include wood for furniture, fabric for clothing, steel for machinery. They have not yet entered the production process.',
  },
  {
    question: 'What is work-in-progress (WIP) inventory?',
    answer:
      'WIP inventory consists of partially completed products that are still in the manufacturing process. It includes raw materials that have begun transformation but are not yet finished goods.',
  },
  {
    question: 'What is finished goods inventory?',
    answer:
      'Finished goods are completed products ready for sale to customers. They have passed through all manufacturing stages and quality checks. Examples include packaged food, assembled electronics, or sewn garments.',
  },
  {
    question: 'What is MRO inventory?',
    answer:
      'MRO (Maintenance, Repair, and Operations) inventory includes supplies used to support production but not incorporated into products. Examples: tools, lubricants, cleaning supplies, safety equipment, spare parts.',
  },
  {
    question: 'Why is it important to categorize inventory types?',
    answer:
      'Different inventory types require different management strategies. Raw materials need supplier coordination, WIP needs production flow optimization, finished goods need sales forecasting, and MRO needs preventive maintenance planning.',
  },
]

export default function TypesOfInventoryPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Glossary', pathname: '/learn/glossary' },
          { name: 'Types of Inventory', pathname: '/learn/glossary/types-of-inventory' },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/learn/glossary" className="text-primary text-sm hover:underline">
            ← Glossary
          </Link>
          <span className="badge badge-soft badge-neutral">Fundamentals</span>
        </div>
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Types of Inventory</h1>
        <p className="text-base-content/80 mt-4 text-lg">
          Inventory is typically classified into four main categories based on its stage in the production process or
          its purpose. Understanding these categories helps you manage each type appropriately.
        </p>

        {/* The 4 Types */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card card-border">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg text-lg font-bold">
                  1
                </span>
                <h2 className="text-base-content text-xl font-semibold">Raw Materials</h2>
              </div>
              <p className="text-base-content/80 mt-4">
                Basic inputs that have not yet entered the production process. These are the building blocks of your
                products.
              </p>
              <div className="mt-4">
                <h3 className="text-base-content text-sm font-semibold">Examples:</h3>
                <ul className="text-base-content/80 mt-2 list-inside list-disc text-sm">
                  <li>Lumber for furniture manufacturing</li>
                  <li>Fabric for clothing production</li>
                  <li>Steel sheets for automotive parts</li>
                  <li>Flour for a bakery</li>
                </ul>
              </div>
              <div className="mt-4 rounded-lg bg-base-200 p-3">
                <p className="text-base-content/80 text-sm">
                  <strong>Management tip:</strong> Track supplier lead times and maintain safety stock to prevent
                  production delays.
                </p>
              </div>
            </div>
          </div>

          <div className="card card-border">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg text-lg font-bold">
                  2
                </span>
                <h2 className="text-base-content text-xl font-semibold">Work-in-Progress (WIP)</h2>
              </div>
              <p className="text-base-content/80 mt-4">
                Partially completed goods currently in the manufacturing process. They have begun transformation but
                are not yet ready for sale.
              </p>
              <div className="mt-4">
                <h3 className="text-base-content text-sm font-semibold">Examples:</h3>
                <ul className="text-base-content/80 mt-2 list-inside list-disc text-sm">
                  <li>Assembled but unpainted furniture</li>
                  <li>Cars on the assembly line</li>
                  <li>Dough rising before baking</li>
                  <li>Circuit boards before final assembly</li>
                </ul>
              </div>
              <div className="mt-4 rounded-lg bg-base-200 p-3">
                <p className="text-base-content/80 text-sm">
                  <strong>Management tip:</strong> Minimize WIP to reduce carrying costs and production bottlenecks.
                </p>
              </div>
            </div>
          </div>

          <div className="card card-border">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg text-lg font-bold">
                  3
                </span>
                <h2 className="text-base-content text-xl font-semibold">Finished Goods</h2>
              </div>
              <p className="text-base-content/80 mt-4">
                Completed products that have passed quality control and are ready for sale to customers.
              </p>
              <div className="mt-4">
                <h3 className="text-base-content text-sm font-semibold">Examples:</h3>
                <ul className="text-base-content/80 mt-2 list-inside list-disc text-sm">
                  <li>Packaged consumer electronics</li>
                  <li>Bottled beverages on shelves</li>
                  <li>Assembled and boxed furniture</li>
                  <li>Clothing ready for retail</li>
                </ul>
              </div>
              <div className="mt-4 rounded-lg bg-base-200 p-3">
                <p className="text-base-content/80 text-sm">
                  <strong>Management tip:</strong> Use demand forecasting to balance availability with holding costs.
                </p>
              </div>
            </div>
          </div>

          <div className="card card-border">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg text-lg font-bold">
                  4
                </span>
                <h2 className="text-base-content text-xl font-semibold">MRO Supplies</h2>
              </div>
              <p className="text-base-content/80 mt-4">
                Maintenance, Repair, and Operations supplies. Items used to support production but not incorporated
                into the final product.
              </p>
              <div className="mt-4">
                <h3 className="text-base-content text-sm font-semibold">Examples:</h3>
                <ul className="text-base-content/80 mt-2 list-inside list-disc text-sm">
                  <li>Machine lubricants and oils</li>
                  <li>Cleaning supplies</li>
                  <li>Safety equipment (gloves, goggles)</li>
                  <li>Spare parts for machinery</li>
                </ul>
              </div>
              <div className="mt-4 rounded-lg bg-base-200 p-3">
                <p className="text-base-content/80 text-sm">
                  <strong>Management tip:</strong> Align reorder points with preventive maintenance schedules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Examples */}
        <div className="mt-10">
          <h2 className="text-base-content text-xl font-semibold">Industry Examples</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Industry</th>
                  <th className="text-base-content">Raw Materials</th>
                  <th className="text-base-content">WIP</th>
                  <th className="text-base-content">Finished Goods</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Furniture</td>
                  <td className="text-base-content/80">Lumber, fabric, hardware</td>
                  <td className="text-base-content/80">Frames, upholstered pieces</td>
                  <td className="text-base-content/80">Completed chairs, tables</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Electronics</td>
                  <td className="text-base-content/80">Chips, wires, plastics</td>
                  <td className="text-base-content/80">Assembled PCBs</td>
                  <td className="text-base-content/80">Packaged devices</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Food & Beverage</td>
                  <td className="text-base-content/80">Ingredients, packaging</td>
                  <td className="text-base-content/80">Batter, fermenting products</td>
                  <td className="text-base-content/80">Packaged food, bottles</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Retail</td>
                  <td className="text-base-content/80">N/A (buy finished)</td>
                  <td className="text-base-content/80">N/A</td>
                  <td className="text-base-content/80">All store inventory</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Track all inventory types with StockZip</h2>
          <p className="text-base-content/80 mt-2">
            StockZip helps you organize inventory by type, location, and status. Use folders and tags to categorize raw
            materials, WIP, finished goods, and MRO supplies all in one system.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary">
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
              href="/learn/glossary/inventory-turnover"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Inventory Turnover</h3>
                <p className="text-base-content/80 text-sm">How fast you sell through finished goods.</p>
              </div>
            </Link>
            <Link
              href="/learn/glossary/fifo-vs-lifo"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">FIFO vs LIFO</h3>
                <p className="text-base-content/80 text-sm">Methods for valuing inventory.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={FAQS} />
    </div>
  )
}
