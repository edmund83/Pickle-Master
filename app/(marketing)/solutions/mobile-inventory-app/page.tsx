/**
 * Mobile Inventory App Solution Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with CTA)
 * - Features: /marketing-ui/features/features-8 (feature cards grid with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "mobile inventory app"
 * Secondary keywords: inventory app android, inventory app ios, offline inventory app, barcode scanner app
 *
 * TODO: Proof Assets Required
 * - Screenshot: Mobile app UI on Android device
 * - Screenshot: Mobile app UI on iOS device
 * - Screenshot: Offline mode indicator and sync status
 * - Short video clip: Mobile scanning workflow (15-30 seconds)
 * - Device compatibility list with photos
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Mobile Inventory App for Android and iOS | Offline Barcode Scanning',
  description:
    'Free mobile inventory app with offline barcode scanning for Android and iOS. Camera-based scanning, Bluetooth scanner support, and real-time sync for warehouse and field teams.',
  pathname: '/solutions/mobile-inventory-app',
})

const MOBILE_APP_FAQS: FaqItem[] = [
  {
    question: 'Does Nook work as a mobile inventory app on Android?',
    answer:
      'Yes. Nook works as a progressive web app (PWA) on Android devices with full camera scanning, offline mode, and automatic sync capabilities. No app store download required — just open nook.app in Chrome and add to home screen.',
  },
  {
    question: 'Does the mobile inventory app work offline?',
    answer:
      'Yes. Nook is built offline-first specifically for warehouse and field environments. You can scan barcodes, adjust quantities, check items in/out, and search inventory even without internet. All changes queue locally and sync automatically when connectivity returns.',
  },
  {
    question: 'What barcode scanners work with the mobile inventory app?',
    answer:
      'Nook supports three scanning methods: (1) Your phone camera for 1D barcodes and QR codes, (2) Bluetooth barcode scanners for faster high-volume scanning, and (3) Rugged Android devices with built-in hardware scanners like Zebra or Honeywell.',
  },
  {
    question: 'Is there an iOS version of the inventory app?',
    answer:
      'Yes. Nook works on iPhone and iPad as a progressive web app with the same offline scanning, real-time sync, and full feature set as Android. Open nook.app in Safari and tap "Add to Home Screen" for the native app experience.',
  },
  {
    question: 'Can multiple team members use the mobile inventory app simultaneously?',
    answer:
      'Yes. Nook syncs in real-time across all devices. Your warehouse team can scan items at the same time from different locations, and everyone sees accurate counts immediately. Conflict resolution handles simultaneous edits automatically.',
  },
  {
    question: 'Does the mobile app support printing labels?',
    answer:
      'Yes. Generate QR code and barcode labels from any device and print via Bluetooth thermal printers, shared network printers, or download as PDF. Print individual labels on scan or batch-print entire locations.',
  },
]

export default function MobileInventoryAppPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Mobile Inventory App', pathname: '/solutions/mobile-inventory-app' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Mobile Inventory App',
          description:
            'Mobile inventory app with offline barcode scanning for Android and iOS. Camera scanning, Bluetooth support, real-time sync.',
          pathname: '/solutions/mobile-inventory-app',
        })}
      />
      <JsonLd data={faqPageJsonLd(MOBILE_APP_FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">
              Mobile Solution
            </span>
            <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Mobile Inventory App That Works Offline
            </h1>
            <p className="text-base-content/80 mt-4 text-lg md:text-xl">
              Scan barcodes, adjust stock, and track items on Android or iOS — even without internet. Your mobile
              inventory app that syncs automatically when you&apos;re back online.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--device-mobile] text-primary size-5"></span>
                <span className="text-base-content/70">Works on any smartphone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--wifi-off] text-primary size-5"></span>
                <span className="text-base-content/70">Offline-first</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--credit-card-off] text-primary size-5"></span>
                <span className="text-base-content/70">No credit card required</span>
              </div>
            </div>
          </div>
          {/* Visual placeholder - in production would be app screenshot/mockup */}
          <div className="bg-base-200 flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-2xl lg:aspect-square">
            <div className="text-center">
              <span className="icon-[tabler--device-mobile-code] text-primary/40 size-24"></span>
              <p className="text-base-content/40 mt-2 text-sm">Mobile app interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM/PAIN SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Why Teams Need a Mobile Inventory App
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Spreadsheets and desktop software fail when your inventory lives in warehouses, trucks, and job sites.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--wifi-off] text-error mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">No WiFi in the Warehouse</h3>
                <p className="text-base-content/70 mt-2">
                  Concrete walls, metal shelving, and basement locations kill connectivity. You need an inventory app
                  that works offline.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--clock-x] text-error mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Manual Entry Kills Productivity</h3>
                <p className="text-base-content/70 mt-2">
                  Walking back to a computer to update spreadsheets wastes hours. Your team needs to scan and go.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--users-minus] text-error mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Counts Are Always Wrong</h3>
                <p className="text-base-content/70 mt-2">
                  When updates happen on paper or after-the-fact, your inventory data is stale before it&apos;s
                  recorded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE FEATURES SECTION (MCP: features-8) ===== */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
              Everything You Need in a Mobile Inventory App
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Built for warehouses, field teams, and anyone who needs to track inventory away from a desk.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Offline Mode */}
            <div className="card card-border hover:border-primary border-primary/30 shadow-none transition-colors duration-300">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-primary bg-primary/10 rounded-field size-12">
                    <span className="icon-[tabler--wifi-off] size-7"></span>
                  </div>
                </div>
                <h3 className="card-title text-lg">Offline-First Design</h3>
                <p className="text-base-content/80">
                  Scan, count, and adjust inventory without internet. Changes queue locally and sync automatically when
                  connectivity returns. Zero data loss.
                </p>
              </div>
            </div>

            {/* Camera Scanning */}
            <div className="card card-border hover:border-success border-success/30 shadow-none transition-colors duration-300">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-success bg-success/10 rounded-field size-12">
                    <span className="icon-[tabler--scan] size-7"></span>
                  </div>
                </div>
                <h3 className="card-title text-lg">Camera Barcode Scanning</h3>
                <p className="text-base-content/80">
                  Use your phone camera to scan 1D barcodes and QR codes. No additional hardware required. Works on any
                  modern Android or iOS device.
                </p>
              </div>
            </div>

            {/* Bluetooth Scanners */}
            <div className="card card-border hover:border-secondary border-secondary/30 shadow-none transition-colors duration-300">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-secondary bg-secondary/10 rounded-field size-12">
                    <span className="icon-[tabler--bluetooth] size-7"></span>
                  </div>
                </div>
                <h3 className="card-title text-lg">Bluetooth Scanner Support</h3>
                <p className="text-base-content/80">
                  Pair Bluetooth barcode scanners for faster high-volume scanning. Works with popular models from
                  Socket, Zebra, and Honeywell.
                </p>
              </div>
            </div>

            {/* Real-time Sync */}
            <div className="card card-border hover:border-info border-info/30 shadow-none transition-colors duration-300">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-info bg-info/10 rounded-field size-12">
                    <span className="icon-[tabler--refresh] size-7"></span>
                  </div>
                </div>
                <h3 className="card-title text-lg">Real-Time Sync</h3>
                <p className="text-base-content/80">
                  Changes sync instantly across all devices. Your warehouse team, office staff, and field crews all see
                  the same accurate counts.
                </p>
              </div>
            </div>

            {/* Check-in/Check-out */}
            <div className="card card-border hover:border-error border-error/30 shadow-none transition-colors duration-300">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-error bg-error/10 rounded-field size-12">
                    <span className="icon-[tabler--arrows-exchange] size-7"></span>
                  </div>
                </div>
                <h3 className="card-title text-lg">Check-In / Check-Out</h3>
                <p className="text-base-content/80">
                  Issue tools, equipment, and assets to staff by scan. Track who has what and when it&apos;s due back.
                  Full custody chain.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card card-border hover:border-accent border-accent/30 shadow-none transition-colors duration-300">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-accent bg-accent/10 rounded-field size-12">
                    <span className="icon-[tabler--bolt] size-7"></span>
                  </div>
                </div>
                <h3 className="card-title text-lg">One-Tap Adjustments</h3>
                <p className="text-base-content/80">
                  Quick +1/-1 buttons, fast quantity adjustments, and scan-to-action workflows. Designed for speed when
                  you&apos;re on the floor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLATFORM SUPPORT SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Works on Every Device</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              No app store downloads. Just open in your browser and start scanning.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center text-center">
                <span className="icon-[tabler--brand-android] text-success size-12"></span>
                <h3 className="text-base-content mt-3 font-semibold">Android Phones</h3>
                <p className="text-base-content/70 mt-1 text-sm">Chrome, Samsung Internet, Edge</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center text-center">
                <span className="icon-[tabler--brand-apple] text-base-content size-12"></span>
                <h3 className="text-base-content mt-3 font-semibold">iPhone & iPad</h3>
                <p className="text-base-content/70 mt-1 text-sm">Safari with Add to Home Screen</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center text-center">
                <span className="icon-[tabler--device-tablet] text-primary size-12"></span>
                <h3 className="text-base-content mt-3 font-semibold">Tablets</h3>
                <p className="text-base-content/70 mt-1 text-sm">Android tablets, iPads</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center text-center">
                <span className="icon-[tabler--device-mobile-bolt] text-secondary size-12"></span>
                <h3 className="text-base-content mt-3 font-semibold">Rugged Devices</h3>
                <p className="text-base-content/70 mt-1 text-sm">Zebra, Honeywell, Datalogic</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== USE CASES / BEST FOR SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Built For Teams On The Move</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Nook&apos;s mobile inventory app is designed for people who work away from desks.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-box bg-base-200 p-6 text-center">
              <span className="icon-[tabler--building-warehouse] text-primary size-10"></span>
              <h3 className="text-base-content mt-4 font-semibold">Warehouse Teams</h3>
              <p className="text-base-content/70 mt-2 text-sm">
                Pick, pack, and count inventory from any aisle. Offline mode for dead zones.
              </p>
            </div>
            <div className="rounded-box bg-base-200 p-6 text-center">
              <span className="icon-[tabler--truck-delivery] text-primary size-10"></span>
              <h3 className="text-base-content mt-4 font-semibold">Field Service</h3>
              <p className="text-base-content/70 mt-2 text-sm">
                Track van stock, job materials, and equipment at customer sites.
              </p>
            </div>
            <div className="rounded-box bg-base-200 p-6 text-center">
              <span className="icon-[tabler--hammer] text-primary size-10"></span>
              <h3 className="text-base-content mt-4 font-semibold">Construction</h3>
              <p className="text-base-content/70 mt-2 text-sm">
                Manage tools and materials across job sites. Check-out to crew members.
              </p>
            </div>
            <div className="rounded-box bg-base-200 p-6 text-center">
              <span className="icon-[tabler--shopping-cart] text-primary size-10"></span>
              <h3 className="text-base-content mt-4 font-semibold">Retail</h3>
              <p className="text-base-content/70 mt-2 text-sm">
                Floor counts, receiving, and stockroom management from any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE CAPABILITIES TABLE ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">What You Can Do on Mobile</h2>
                <ul className="text-base-content/80 mt-4 space-y-3">
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Barcode and QR code scanning (camera + Bluetooth)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Quantity adjustments (+/- with notes)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Check-in / check-out for asset tracking</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Item lookup and global search</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Cycle counts and physical inventory</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Low stock alerts and notifications</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Photo capture for item documentation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--check] text-success mt-0.5 size-5 shrink-0"></span>
                    <span>Label printing via Bluetooth or network</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">Offline Mode Capabilities</h2>
                <ul className="text-base-content/80 mt-4 space-y-3">
                  <li className="flex gap-3">
                    <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-5 shrink-0"></span>
                    <span>Full barcode scanning without internet</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-5 shrink-0"></span>
                    <span>Quantity adjustments queue locally</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-5 shrink-0"></span>
                    <span>Check-in/out works in dead zones</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-5 shrink-0"></span>
                    <span>Search cached inventory data</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-5 shrink-0"></span>
                    <span>Automatic sync when back online</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-5 shrink-0"></span>
                    <span>Conflict resolution for simultaneous edits</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-[tabler--wifi-off] text-primary mt-0.5 size-5 shrink-0"></span>
                    <span>No data loss — ever</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (MCP: cta-4) ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-primary/5 border-primary/20 border p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Start Scanning in Under 5 Minutes
                </h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  Import your inventory, open Nook on your phone, and start scanning. No app store downloads, no
                  complex setup, no IT department required.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Free 14-day trial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">No credit card required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Unlimited items on all plans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Works on your existing devices</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary btn-lg">
                  Learn About Scanning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={MOBILE_APP_FAQS} />
    </div>
  )
}
