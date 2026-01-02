/**
 * Integrations Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory management integrations"
 * Secondary keywords: "Shopify inventory sync", "QuickBooks integration", "ecommerce inventory"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Integrations | Connect Nook with Shopify, QuickBooks, Zapier & More',
  description:
    'Inventory management integrations that actually work. Connect Nook with Shopify, WooCommerce, QuickBooks, Xero, and Zapier. Keep stock accurate everywhere.',
  pathname: '/integrations',
})

const INTEGRATIONS_FAQS: FaqItem[] = [
  {
    question: 'Which ecommerce platforms does Nook integrate with?',
    answer:
      'Shopify and WooCommerce integrations are currently in development. These will sync inventory levels automatically so you avoid overselling.',
  },
  {
    question: 'Will Nook sync with QuickBooks?',
    answer:
      'QuickBooks Online integration is planned. It will sync inventory valuation and cost of goods sold (COGS) to reduce manual accounting work.',
  },
  {
    question: 'Can I use Nook with Zapier?',
    answer:
      'Zapier integration is planned. Once available, you can connect Nook to 5,000+ apps for alerts, notifications, and custom workflows.',
  },
  {
    question: 'What if I need an integration that is not listed?',
    answer:
      'Contact us through the demo request form. We prioritize integrations based on real customer needs, so your request directly influences the roadmap.',
  },
  {
    question: 'Can I export data manually until integrations are ready?',
    answer:
      'Yes. You can export your inventory and movement history as CSV anytime. This works for manual imports into other systems.',
  },
  {
    question: 'Will integrations work in real-time?',
    answer:
      'Ecommerce integrations will support near real-time sync. Accounting integrations may sync on a schedule (hourly or daily) to batch updates efficiently.',
  },
  {
    question: 'Do integrations cost extra?',
    answer:
      'Core integrations (ecommerce, accounting) are included in paid plans at no extra cost. We focus on the integrations that matter most.',
  },
  {
    question: 'Can I request early access to an integration?',
    answer:
      'Yes. Request a demo and mention which integration you need. We often invite early users to test integrations before general availability.',
  },
]

const ECOMMERCE_INTEGRATIONS = [
  {
    icon: 'icon-[tabler--brand-shopify]',
    title: 'Shopify',
    description: 'Sync inventory with your Shopify store. When stock changes in Nook, Shopify updates automatically to prevent overselling.',
    status: 'In progress',
    statusColor: 'badge-info',
  },
  {
    icon: 'icon-[tabler--shopping-cart]',
    title: 'WooCommerce',
    description: 'Connect your WooCommerce catalog. Keep stock accurate across your WordPress store and warehouse.',
    status: 'In progress',
    statusColor: 'badge-info',
  },
]

const ACCOUNTING_INTEGRATIONS = [
  {
    icon: 'icon-[tabler--file-invoice]',
    title: 'QuickBooks Online',
    description: 'Sync inventory valuation and COGS. Reduce manual data entry and keep your books accurate as you grow.',
    status: 'Planned',
    statusColor: 'badge-neutral',
  },
  {
    icon: 'icon-[tabler--brand-xing]',
    title: 'Xero',
    description: 'Connect Nook to Xero for inventory value sync. Less reconciliation, more accurate financial reporting.',
    status: 'Planned',
    statusColor: 'badge-neutral',
  },
]

const AUTOMATION_INTEGRATIONS = [
  {
    icon: 'icon-[tabler--bolt]',
    title: 'Zapier',
    description: 'Connect Nook to 5,000+ apps. Trigger Slack alerts, email notifications, or custom workflows when inventory changes.',
    status: 'Planned',
    statusColor: 'badge-neutral',
  },
  {
    icon: 'icon-[tabler--api]',
    title: 'REST API',
    description: 'Build custom integrations with our REST API. Programmatic access to inventory, items, and movements.',
    status: 'Available',
    statusColor: 'badge-success',
  },
]

const NATIVE_FEATURES = [
  {
    icon: 'icon-[tabler--upload]',
    title: 'CSV Import',
    description: 'Import your existing catalog from any system. Map fields, validate data, and go live in minutes.',
  },
  {
    icon: 'icon-[tabler--download]',
    title: 'CSV Export',
    description: 'Export your inventory, movement history, and reports anytime. Your data, your way.',
  },
  {
    icon: 'icon-[tabler--printer]',
    title: 'Label Printing',
    description: 'Generate barcode and QR labels. Print to thermal or laser printers directly from Nook.',
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
          name: 'Nook Inventory',
          description: 'Inventory management integrations with Shopify, QuickBooks, Zapier, and more.',
          pathname: '/integrations',
        })}
      />
      <JsonLd data={faqPageJsonLd(INTEGRATIONS_FAQS)} />

      {/* Hero Section - hero-12 pattern */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Integrations</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Inventory management integrations that actually work
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              Most small teams do not need 50 integrations — they need 2–3 that work reliably. Nook focuses on
              ecommerce, accounting, and lightweight automation so inventory stays accurate everywhere.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Request Integration
            </Link>
          </div>
        </div>

        {/* Native Features */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {NATIVE_FEATURES.map((feature) => (
            <div key={feature.title} className="card card-border shadow-none">
              <div className="card-body">
                <span className={`${feature.icon} text-primary size-8`}></span>
                <h2 className="text-base-content mt-4 text-lg font-semibold">{feature.title}</h2>
                <p className="text-base-content/80 mt-2">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ecommerce Integrations */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Ecommerce</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Keep your online store in sync with your actual inventory. No more overselling or manual stock updates.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {ECOMMERCE_INTEGRATIONS.map((integration) => (
              <div key={integration.title} className="card card-border shadow-none">
                <div className="card-body">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`${integration.icon} text-primary size-8`}></span>
                      <h3 className="text-base-content text-xl font-semibold">{integration.title}</h3>
                    </div>
                    <span className={`badge ${integration.statusColor} rounded-full`}>{integration.status}</span>
                  </div>
                  <p className="text-base-content/80 mt-3">{integration.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accounting Integrations */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Accounting</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Sync inventory value with your accounting software. Reduce manual data entry and keep financial reports accurate.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {ACCOUNTING_INTEGRATIONS.map((integration) => (
              <div key={integration.title} className="card card-border shadow-none">
                <div className="card-body">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`${integration.icon} text-primary size-8`}></span>
                      <h3 className="text-base-content text-xl font-semibold">{integration.title}</h3>
                    </div>
                    <span className={`badge ${integration.statusColor} rounded-full`}>{integration.status}</span>
                  </div>
                  <p className="text-base-content/80 mt-3">{integration.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automation Integrations */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Automation & API</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Automate workflows and build custom integrations. Connect Nook to your existing tools and processes.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {AUTOMATION_INTEGRATIONS.map((integration) => (
              <div key={integration.title} className="card card-border shadow-none">
                <div className="card-body">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`${integration.icon} text-primary size-8`}></span>
                      <h3 className="text-base-content text-xl font-semibold">{integration.title}</h3>
                    </div>
                    <span className={`badge ${integration.statusColor} rounded-full`}>{integration.status}</span>
                  </div>
                  <p className="text-base-content/80 mt-3">{integration.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Integration CTA */}
        <div className="mt-16 rounded-box bg-base-200 p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base-content text-2xl font-semibold">Need an integration sooner?</h2>
              <p className="text-base-content/80 mt-3 max-w-2xl">
                We prioritize integrations based on real customer needs. If you have a must-have workflow, tell us
                and we will move it up the roadmap.
              </p>
              <ul className="text-base-content/80 mt-6 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Core integrations included in paid plans
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  CSV import/export available now
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  REST API for custom builds
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/demo" className="btn btn-primary btn-gradient btn-lg">
                Request Integration
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link href="/solutions/ecommerce" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--shopping-cart] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Ecommerce</h3>
                <p className="text-base-content/80 mt-2">
                  Inventory management for online sellers.
                </p>
              </div>
            </Link>
            <Link href="/features/barcode-scanning" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--barcode] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Barcode scanning</h3>
                <p className="text-base-content/80 mt-2">
                  Fast, accurate inventory updates by scan.
                </p>
              </div>
            </Link>
            <Link href="/features" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--list-check] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">All features</h3>
                <p className="text-base-content/80 mt-2">
                  See everything Nook offers.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={INTEGRATIONS_FAQS} />
    </div>
  )
}
