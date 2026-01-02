import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Barcode scanning inventory software',
  description:
    'Scan barcodes or QR codes to find, update, and verify inventory fast. Works with phone cameras and compatible Bluetooth scanners.',
  pathname: '/features/barcode-scanning',
})

export default function BarcodeScanningFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Barcode scanning', pathname: '/features/barcode-scanning' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Pickle Inventory',
          description: 'Barcode scanning inventory management with offline-first mobile workflows.',
          pathname: '/features/barcode-scanning',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="space-y-4">
          <p className="badge badge-soft badge-primary rounded-full">Feature</p>
          <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
            Barcode scanning that keeps teams fast and accurate
          </h1>
          <p className="text-base-content/80 max-w-3xl text-lg">
            Scan to find items instantly, make quick adjustments, and keep an audit trail of what changed — and who did it.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary">
              Watch demo
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">1) Scan</h2>
              <p className="text-base-content/80">Scan a barcode/QR to pull the item instantly — no typing.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">2) Confirm</h2>
              <p className="text-base-content/80">Adjust quantity, location, or status with guardrails.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">3) Done</h2>
              <p className="text-base-content/80">Changes are recorded with timestamps for accountability.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Supported hardware</h2>
          <ul className="mt-4 space-y-3 text-base-content/80">
            <li className="flex gap-2">
              <span className="icon-[tabler--device-mobile] text-primary size-5"></span>
              Phone camera scanning (iOS/Android)
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--bluetooth] text-primary size-5"></span>
              Compatible Bluetooth scanners (keyboard-mode)
            </li>
            <li className="flex gap-2">
              <span className="icon-[tabler--qrcode] text-primary size-5"></span>
              Barcodes and QR codes
            </li>
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="btn btn-outline btn-secondary">
            See pricing
          </Link>
          <Link href="/migration/sortly" className="btn btn-outline btn-secondary">
            Migrate from Sortly
          </Link>
        </div>
      </div>
    </div>
  )
}

