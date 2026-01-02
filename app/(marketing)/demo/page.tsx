/**
 * Demo Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with CTA)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory management software demo"
 * Secondary keywords: barcode inventory demo, inventory software walkthrough, inventory barcode scanning demo
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory Management Software Demo | See Nook in Action',
  description:
    'Watch a quick demo of Nook inventory management: barcode scanning, stock adjustments, check-in/check-out workflows, and offline mobile mode.',
  pathname: '/demo',
})

const DEMO_FAQS: FaqItem[] = [
  {
    question: 'How long is the Nook inventory software demo?',
    answer:
      'The main overview demo is 90 seconds. We also have focused workflow demos (barcode scanning, stock counts, check-in/check-out) that are 30-60 seconds each.',
  },
  {
    question: 'Do I need to sign up to watch the demo?',
    answer:
      "No. The demo videos are free to watch without signing up. When you're ready to try it yourself, start a 14-day free trial — no credit card required.",
  },
  {
    question: 'Can I get a personalized demo for my team?',
    answer:
      'Yes. For teams with complex workflows, multiple locations, or specific integration needs, we offer live demos. Contact us to schedule a call.',
  },
  {
    question: 'What does the demo cover?',
    answer:
      "The overview demo shows the core workflows: scanning barcodes, adjusting quantities, setting up low stock alerts, and check-in/check-out for tools and assets. It's designed to show you how fast Nook is to use day-to-day.",
  },
  {
    question: 'Is there a mobile app demo?',
    answer:
      'Yes. Nook works as a progressive web app on Android and iOS. The mobile demo shows camera scanning, offline mode, and real-time sync — the workflows your warehouse and field teams will use most.',
  },
  {
    question: 'How quickly can I get started after watching the demo?',
    answer:
      'Most teams import their inventory and start scanning within 30 minutes. Import via CSV, print labels for your top movers, and you&apos;re live.',
  },
]

export default function DemoPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Demo', pathname: '/demo' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory Demo',
          description:
            'Watch a demo of Nook inventory management software: barcode scanning, stock adjustments, and check-in/check-out workflows.',
          pathname: '/demo',
        })}
      />
      <JsonLd data={faqPageJsonLd(DEMO_FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">Demo</span>
          <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Inventory Management Software Demo
          </h1>
          <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg md:text-xl">
            See Nook in action. Watch how teams scan barcodes, adjust stock, run counts, and track tool checkouts —
            in under 90 seconds.
          </p>
        </div>
      </section>

      {/* ===== MAIN VIDEO SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">90-Second Overview</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              The core workflows your team will use every day: scan, adjust, count, and check-out.
            </p>
          </div>

          {/* Video placeholder */}
          <div className="mt-8 aspect-video overflow-hidden rounded-2xl border border-base-content/10 bg-base-300">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <span className="icon-[tabler--player-play] text-primary/40 size-20"></span>
                <p className="text-base-content/50 mt-4">90-second demo video</p>
                <p className="text-base-content/40 mt-1 text-sm">TODO: Embed overview video</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU'LL SEE SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">What You&apos;ll See in the Demo</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              The workflows that make Nook fast to learn and fast to use.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="card card-border shadow-none">
              <div className="card-body text-center">
                <span className="icon-[tabler--scan] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Scan with your phone camera or Bluetooth scanner. Look up items instantly.
                </p>
              </div>
            </div>
            <div className="card card-border shadow-none">
              <div className="card-body text-center">
                <span className="icon-[tabler--plus-minus] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Quick Adjustments</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  One-tap +/- buttons. Scan and adjust in seconds, not minutes.
                </p>
              </div>
            </div>
            <div className="card card-border shadow-none">
              <div className="card-body text-center">
                <span className="icon-[tabler--clipboard-check] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Stock Counts</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Run cycle counts by location. See discrepancies and fix them on the spot.
                </p>
              </div>
            </div>
            <div className="card card-border shadow-none">
              <div className="card-body text-center">
                <span className="icon-[tabler--arrows-exchange] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Check-In / Check-Out</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Issue tools and assets to staff. Track who has what and when it&apos;s due back.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW DEMOS SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Focused Workflow Demos</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Deep dives into the workflows that matter most to your team.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {/* Scan & Adjust Demo */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="aspect-video overflow-hidden rounded-lg bg-base-300">
                  <div className="flex h-full items-center justify-center">
                    <span className="icon-[tabler--player-play] text-primary/30 size-12"></span>
                  </div>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Scan &amp; Adjust</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  See how fast it is to scan a barcode and update quantity. Camera scanning, Bluetooth scanners, and
                  quick +/- adjustments.
                </p>
                <p className="text-base-content/50 mt-2 text-xs">30 seconds • TODO: Add video</p>
              </div>
            </div>

            {/* Stock Count Demo */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="aspect-video overflow-hidden rounded-lg bg-base-300">
                  <div className="flex h-full items-center justify-center">
                    <span className="icon-[tabler--player-play] text-primary/30 size-12"></span>
                  </div>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Stock Count Workflow</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Create a count, scan items, see discrepancies, and fix them. Cycle counts made simple.
                </p>
                <p className="text-base-content/50 mt-2 text-xs">45 seconds • TODO: Add video</p>
              </div>
            </div>

            {/* Check-out Demo */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="aspect-video overflow-hidden rounded-lg bg-base-300">
                  <div className="flex h-full items-center justify-center">
                    <span className="icon-[tabler--player-play] text-primary/30 size-12"></span>
                  </div>
                </div>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Check-Out to Staff</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Issue tools or equipment to a team member. Set due dates, see overdue items, check back in.
                </p>
                <p className="text-base-content/50 mt-2 text-xs">30 seconds • TODO: Add video</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Who Uses Nook?</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Teams that need fast, accurate inventory tracking without ERP complexity.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/solutions/warehouse"
              className="card card-border shadow-none transition-colors hover:border-primary"
            >
              <div className="card-body text-center">
                <span className="icon-[tabler--building-warehouse] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Warehouse Teams</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Receiving, picking, cycle counts, and multi-location inventory.
                </p>
              </div>
            </Link>
            <Link
              href="/solutions/ecommerce"
              className="card card-border shadow-none transition-colors hover:border-primary"
            >
              <div className="card-body text-center">
                <span className="icon-[tabler--shopping-cart] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Ecommerce Sellers</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Single source of truth across channels. Prevent stockouts.
                </p>
              </div>
            </Link>
            <Link
              href="/solutions/construction-tools"
              className="card card-border shadow-none transition-colors hover:border-primary"
            >
              <div className="card-body text-center">
                <span className="icon-[tabler--hammer] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Construction &amp; Tools</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Tool tracking, jobsite inventory, and check-out accountability.
                </p>
              </div>
            </Link>
            <Link
              href="/solutions/small-business"
              className="card card-border shadow-none transition-colors hover:border-primary"
            >
              <div className="card-body text-center">
                <span className="icon-[tabler--briefcase] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 font-semibold">Small Business</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Replace spreadsheets. Get accurate counts without complexity.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (MCP: cta-4) ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-primary/5 border-primary/20 border p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Ready to Try It Yourself?</h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  Start a 14-day free trial. Import your inventory, print labels, and start scanning. No credit card
                  required.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Full feature access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Unlimited items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">CSV import included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Export anytime</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/migration/sortly" className="btn btn-outline btn-secondary btn-lg">
                  Migrate from Sortly
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={DEMO_FAQS} />
    </div>
  )
}
