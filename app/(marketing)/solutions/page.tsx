import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Solutions',
  description:
    'Pickle inventory solutions for warehouses, ecommerce, construction/tools, and small businesses — built for scanning, offline work, and accountability.',
  pathname: '/solutions',
})

const SOLUTIONS = [
  {
    title: 'Warehouse',
    description: 'Receive, count, and pick faster with scan-first workflows.',
    href: '/solutions/warehouse',
  },
  {
    title: 'Ecommerce',
    description: 'Prevent stockouts and keep accurate counts across locations.',
    href: '/solutions/ecommerce',
  },
  {
    title: 'Construction & Tools',
    description: 'Issue and return tools by scan — stop losses and disputes.',
    href: '/solutions/construction-tools',
  },
  {
    title: 'Small business',
    description: 'Replace spreadsheets without training your whole team.',
    href: '/solutions/small-business',
  },
]

export default function SolutionsPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Inventory management solutions for small teams.',
          pathname: '/solutions',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Solutions</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Pickle is flexible enough for warehouses and field teams, but still simple enough for small businesses.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SOLUTIONS.map((solution) => (
            <Link
              key={solution.href}
              href={solution.href}
              className="card card-border shadow-none hover:border-primary transition-colors"
            >
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">{solution.title}</h2>
                <p className="text-base-content/80">{solution.description}</p>
                <span className="link link-primary link-animated mt-2 w-fit">View solution</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

