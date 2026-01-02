import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Integrations',
  description:
    'Integrations for inventory management: ecommerce, accounting, and automation. Connect Pickle with tools like Shopify, WooCommerce, QuickBooks, Xero, and Zapier.',
  pathname: '/integrations',
})

const INTEGRATIONS = [
  {
    title: 'Shopify',
    description: 'Sync inventory with your Shopify store to prevent oversells and stock mismatches.',
    status: 'In progress',
  },
  {
    title: 'WooCommerce',
    description: 'Connect your WooCommerce catalog and keep stock accurate across locations.',
    status: 'In progress',
  },
  {
    title: 'QuickBooks Online',
    description: 'Keep inventory valuation, COGS, and accounting workflows clean as you grow.',
    status: 'Planned',
  },
  {
    title: 'Xero',
    description: 'Sync inventory value and reduce manual reconciliation for your accountant.',
    status: 'Planned',
  },
  {
    title: 'Zapier',
    description: 'Automate handoffs with 5,000+ apps (alerts, Slack messages, and workflows).',
    status: 'Planned',
  },
]

export default function IntegrationsPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Integrations', pathname: '/integrations' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Inventory management with barcode scanning and offline-first workflows.',
          pathname: '/integrations',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Integrations</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Most small teams don&apos;t want 50 integrations — they want 2–3 that actually work. Pickle focuses on ecommerce,
          accounting, and lightweight automation so inventory stays truthful everywhere.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.title} className="card card-border shadow-none">
              <div className="card-body">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base-content text-xl font-semibold">{integration.title}</h2>
                  <span className="badge badge-outline badge-secondary rounded-full">{integration.status}</span>
                </div>
                <p className="text-base-content/80 mt-2">{integration.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Need an integration sooner?</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            If you have a must-have workflow (Shopify sync, QuickBooks valuation, alerts), request a demo and we&apos;ll
            prioritize based on real needs.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-primary btn-gradient btn-lg">
              Request a demo
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

