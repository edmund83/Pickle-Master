/**
 * Asset Tracking Solution Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "asset tracking software"
 * Secondary keywords: "equipment tracking", "tool tracking app", "asset management"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Asset Tracking Software | Track Equipment, Tools & Devices',
  description:
    'Asset tracking software with check-in/check-out, barcode scanning, and full custody chain. Know who has what, where it is, and when it is due back.',
  pathname: '/solutions/asset-tracking',
})

const ASSET_TRACKING_FAQS: FaqItem[] = [
  {
    question: 'What is asset tracking software?',
    answer:
      'Asset tracking software helps organizations track physical assets like equipment, tools, devices, and vehicles. It records who has each asset, where it is located, its condition, and its full history of assignments and movements.',
  },
  {
    question: 'How does check-in/check-out work for asset tracking?',
    answer:
      'With check-in/check-out, you scan an asset to assign it to a person or location. The system records who took it, when, and when it is due back. When the asset is returned, scan again to check it back in. The full custody chain is logged.',
  },
  {
    question: 'Can I track assets across multiple locations?',
    answer:
      'Yes. StockZip supports unlimited locations. You can track assets at your main office, warehouse, job sites, vehicles, or any other place. See where each asset is and its current assignment status.',
  },
  {
    question: 'What types of assets can I track?',
    answer:
      'Any physical asset with a barcode or QR label. Common examples include: IT equipment (laptops, monitors), tools and power tools, safety equipment, vehicles and keys, audio/video gear, medical devices, and loaner inventory.',
  },
  {
    question: 'How do I label assets that do not have barcodes?',
    answer:
      'Generate QR code labels directly in StockZip and print them on any thermal or laser label printer. Apply labels to assets, scan to add them to your system, and start tracking immediately.',
  },
  {
    question: 'Can I set due dates for checked-out assets?',
    answer:
      'Yes. When checking out an asset, you can set an expected return date. StockZip flags overdue items so you can follow up before losses occur.',
  },
  {
    question: 'Does asset tracking work offline?',
    answer:
      'Yes. StockZip is built offline-first. Scan and update assets even without internet — changes sync automatically when you reconnect. Essential for field work and job sites.',
  },
  {
    question: 'Can I track maintenance and service history?',
    answer:
      'Yes. Use custom fields and notes to record maintenance dates, service history, warranty information, and condition. Search and filter assets by any of these fields.',
  },
]

const ASSET_TYPES = [
  {
    icon: 'icon-[tabler--device-laptop]',
    title: 'IT equipment',
    description: 'Laptops, monitors, keyboards, phones, tablets, and peripherals. Track assignments to employees.',
  },
  {
    icon: 'icon-[tabler--tool]',
    title: 'Tools & power tools',
    description: 'Drills, saws, measuring instruments, and specialty tools. Know who has what on each job site.',
  },
  {
    icon: 'icon-[tabler--first-aid-kit]',
    title: 'Safety equipment',
    description: 'Hard hats, harnesses, fire extinguishers, and PPE. Track certifications and inspection dates.',
  },
  {
    icon: 'icon-[tabler--car]',
    title: 'Vehicles & keys',
    description: 'Company vehicles, fleet keys, and access badges. Log usage and mileage.',
  },
  {
    icon: 'icon-[tabler--camera]',
    title: 'AV & production gear',
    description: 'Cameras, microphones, lighting, and studio equipment. Perfect for rental and production houses.',
  },
  {
    icon: 'icon-[tabler--stethoscope]',
    title: 'Medical devices',
    description: 'Diagnostic equipment, monitors, and loaner devices. Track calibration and compliance.',
  },
]

const KEY_FEATURES = [
  {
    icon: 'icon-[tabler--arrows-exchange]',
    title: 'Check-in / check-out',
    description: 'Scan to assign assets to people or locations. Set due dates and track returns.',
  },
  {
    icon: 'icon-[tabler--barcode]',
    title: 'Barcode & QR scanning',
    description: 'Use your phone camera or Bluetooth scanner. Generate and print labels for any asset.',
  },
  {
    icon: 'icon-[tabler--history]',
    title: 'Full custody chain',
    description: 'See every assignment, location change, and update with timestamps and user IDs.',
  },
  {
    icon: 'icon-[tabler--bell-ringing]',
    title: 'Overdue alerts',
    description: 'Get notified when assets are not returned on time. Reduce losses and disputes.',
  },
  {
    icon: 'icon-[tabler--map-pin]',
    title: 'Multi-location tracking',
    description: 'Track assets across offices, job sites, warehouses, and vehicles.',
  },
  {
    icon: 'icon-[tabler--wifi-off]',
    title: 'Offline mode',
    description: 'Works without internet. Scan and update in the field, sync when connected.',
  },
]

const WORKFLOWS = [
  {
    step: '1',
    title: 'Label your assets',
    description: 'Generate QR code labels in StockZip and apply them to your equipment, tools, and devices.',
  },
  {
    step: '2',
    title: 'Check out to staff',
    description: 'Scan the asset label, select the person, set a due date, and confirm. Done in seconds.',
  },
  {
    step: '3',
    title: 'Track and follow up',
    description: 'See all checked-out assets, filter by overdue, and follow up with assigned staff.',
  },
  {
    step: '4',
    title: 'Check back in',
    description: 'When the asset is returned, scan to check it in. The custody chain is updated automatically.',
  },
]

export default function AssetTrackingSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Asset Tracking', pathname: '/solutions/asset-tracking' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory - Asset Tracking',
          description: 'Asset tracking software with check-in/check-out, barcode scanning, and full custody chain.',
          pathname: '/solutions/asset-tracking',
        })}
      />
      <JsonLd data={faqPageJsonLd(ASSET_TRACKING_FAQS)} />

      {/* Hero Section - hero-12 pattern */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Asset Tracking</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Asset tracking software that shows who has what
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              Track equipment, tools, and devices with scan-based check-in/check-out. See the full custody chain, get
              overdue alerts, and stop losing assets to the black hole of &quot;someone borrowed it.&quot;
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Problem Section */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">The asset tracking problem</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Equipment disappears. Tools go missing. Nobody knows who borrowed the projector. Without a system, assets
            drift into a black hole of &quot;I thought someone else had it.&quot;
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="card card-border shadow-none">
              <div className="card-body">
                <span className="icon-[tabler--ghost] text-warning size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Assets go missing</h3>
                <p className="text-base-content/80 mt-2">
                  Expensive equipment walks off. Nobody knows who took it or when it was last seen.
                </p>
              </div>
            </div>
            <div className="card card-border shadow-none">
              <div className="card-body">
                <span className="icon-[tabler--users-minus] text-warning size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">No accountability</h3>
                <p className="text-base-content/80 mt-2">
                  When something is lost or damaged, there is no record of who had it or where it went.
                </p>
              </div>
            </div>
            <div className="card card-border shadow-none">
              <div className="card-body">
                <span className="icon-[tabler--clock-x] text-warning size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Overdue returns pile up</h3>
                <p className="text-base-content/80 mt-2">
                  Borrowed items are never returned. Follow-up is manual and often forgotten.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">How asset tracking works in StockZip</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            A simple four-step workflow that creates a complete custody chain for every asset.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOWS.map((workflow) => (
              <div key={workflow.step} className="flex gap-4">
                <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                  {workflow.step}
                </div>
                <div>
                  <h3 className="text-base-content text-lg font-semibold">{workflow.title}</h3>
                  <p className="text-base-content/80 mt-1">{workflow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Types Section */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Track any physical asset</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            StockZip works for any asset with a barcode or QR label. Here are the most common use cases.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ASSET_TYPES.map((asset) => (
              <div key={asset.title} className="card card-border shadow-none">
                <div className="card-body">
                  <span className={`${asset.icon} text-primary size-8`}></span>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{asset.title}</h3>
                  <p className="text-base-content/80 mt-2">{asset.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Section - features-8 pattern */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Built for asset accountability</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Every feature is designed to show you who has what, where it is, and when it is due back.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_FEATURES.map((feature) => (
              <div key={feature.title} className="card card-border shadow-none">
                <div className="card-body">
                  <span className={`${feature.icon} text-primary size-8`}></span>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-base-content/80 mt-2">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - cta-4 pattern */}
        <div className="mt-16 rounded-box bg-base-200 p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base-content text-2xl font-semibold">Stop losing assets</h2>
              <p className="text-base-content/80 mt-3 max-w-2xl">
                Start tracking equipment with scan-based check-in/check-out. Know who has what, set due dates, and get
                alerts for overdue items.
              </p>
              <ul className="text-base-content/80 mt-6 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  14-day free trial, no credit card required
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Generate and print QR labels in minutes
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Works offline for field and job site use
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/features/check-in-check-out" className="btn btn-outline btn-secondary btn-lg">
                Learn About Check-Out
              </Link>
            </div>
          </div>
        </div>

        {/* Related Solutions */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related solutions</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link
              href="/solutions/construction-tools"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--hammer] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Construction & tools</h3>
                <p className="text-base-content/80 mt-2">Tool tracking for job sites and contractors.</p>
              </div>
            </Link>
            <Link
              href="/features/check-in-check-out"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--arrows-exchange] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Check-in / check-out</h3>
                <p className="text-base-content/80 mt-2">Learn how the check-out workflow works.</p>
              </div>
            </Link>
            <Link
              href="/compare"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <span className="icon-[tabler--exchange] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Compare options</h3>
                <p className="text-base-content/80 mt-2">See how StockZip compares for asset tracking workflows.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={ASSET_TRACKING_FAQS} />
    </div>
  )
}
