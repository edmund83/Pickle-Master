/**
 * Pricing Page
 * Built from FlyonUI MCP templates:
 * - Pricing: /marketing-ui/pricing/pricing (pricing cards with features)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory management software pricing"
 * Secondary keywords: inventory software cost, trust-first pricing, no SKU cliffs, barcode inventory pricing
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory Management Software Pricing | Trust-First, No SKU Cliffs',
  description:
    'Simple, transparent inventory software pricing. No surprise tier jumps. No hard SKU limits. Start free for 14 days and scale without penalties.',
  pathname: '/pricing',
})

const PRICING_FAQS: FaqItem[] = [
  {
    question: 'How does Nook inventory software pricing work?',
    answer:
      'Nook uses trust-first pricing with no hidden fees or surprise tier jumps. You pay a flat monthly rate based on your plan — Starter ($19/mo), Team ($49/mo), or Business ($99/mo). All plans include unlimited items and barcode scanning. Upgrade or downgrade anytime.',
  },
  {
    question: 'Are there SKU limits or per-item charges?',
    answer:
      'No SKU cliffs, no per-item pricing. All Nook plans include unlimited items. We believe your inventory software cost should be predictable — not a tax on growth.',
  },
  {
    question: 'What happens after the 14-day free trial?',
    answer:
      "Your trial includes full access to all features on the Team plan. If you don't upgrade, your account pauses — no surprise charges. You can export your data anytime, even on the free tier.",
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes. Upgrade or downgrade anytime from Settings. Changes take effect on your next billing cycle. No penalty fees, no lock-in contracts.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer:
      'Yes. Annual plans save 20% compared to monthly billing. Contact us for custom pricing on teams larger than 25 users or organizations with multiple locations.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and can invoice for annual Business plans. All payments are processed securely via Stripe.',
  },
  {
    question: 'Is there a setup fee or onboarding cost?',
    answer:
      'No setup fees. Nook is self-service — import your inventory via CSV, print labels, and start scanning in minutes. If you need hands-on migration help, our team assists Business plan customers at no extra charge.',
  },
  {
    question: 'What if I need to cancel?',
    answer:
      'Cancel anytime from Settings. Your data remains accessible for 30 days after cancellation, and you can export everything (items, history, reports) in CSV format. We believe you own your data.',
  },
]

export default function PricingPage() {
  const lastUpdated = '2026-01-02'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Pricing', pathname: '/pricing' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description:
            'Inventory management software with barcode scanning, offline mode, and trust-first pricing. No SKU cliffs.',
          pathname: '/pricing',
        })}
      />
      <JsonLd data={faqPageJsonLd(PRICING_FAQS)} />

      {/* ===== HERO SECTION (MCP: pricing hero) ===== */}
      <section className="bg-base-200 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center space-y-4 text-center sm:mb-16">
            <span className="badge badge-soft badge-primary rounded-full font-medium uppercase">Pricing</span>
            <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Inventory Management Software Pricing
            </h1>
            <p className="text-base-content/80 max-w-3xl text-lg md:text-xl">
              Trust-first pricing that scales with you. No surprise tier jumps. No hard SKU cliffs. Start small and
              grow without penalties.
            </p>
            <p className="text-base-content/60 text-sm">Last updated: {lastUpdated}</p>
          </div>

          {/* ===== PRICING CARDS (MCP: pricing cards) ===== */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Starter Plan */}
            <div className="card card-border bg-base-100 shadow-sm">
              <div className="card-body gap-6">
                <div className="space-y-1">
                  <h2 className="text-base-content text-xl font-semibold">Starter</h2>
                  <p className="text-base-content/70">For solo operators and small teams getting started.</p>
                </div>
                <div className="text-base-content text-4xl font-semibold">
                  $19 <span className="text-base-content/50 text-base font-normal">/month</span>
                </div>
                <ul className="space-y-3 text-base-content/80">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Unlimited items (no SKU cliffs)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Barcode and QR code scanning</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Offline mobile mode</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Low stock alerts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>CSV import/export</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>1 user included</span>
                  </li>
                </ul>
                <Link href="/signup" className="btn btn-primary btn-gradient">
                  Start 14-Day Free Trial
                </Link>
                <p className="text-base-content/60 text-center text-xs">No credit card required</p>
              </div>
            </div>

            {/* Team Plan (Most Popular) */}
            <div className="card card-border border-primary/40 bg-base-100 shadow-md">
              <div className="card-body gap-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base-content text-xl font-semibold">Team</h2>
                    <span className="badge badge-primary badge-soft rounded-full">Most Popular</span>
                  </div>
                  <p className="text-base-content/70">For teams who need accountability and workflows.</p>
                </div>
                <div className="text-base-content text-4xl font-semibold">
                  $49 <span className="text-base-content/50 text-base font-normal">/month</span>
                </div>
                <ul className="space-y-3 text-base-content/80">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Everything in Starter, plus:</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Check-in / check-out workflow</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Roles and permissions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Full audit trail</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Activity reports</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Up to 10 users</span>
                  </li>
                </ul>
                <Link href="/signup" className="btn btn-primary btn-gradient">
                  Start 14-Day Free Trial
                </Link>
                <p className="text-base-content/60 text-center text-xs">No credit card required</p>
              </div>
            </div>

            {/* Business Plan */}
            <div className="card card-border bg-base-100 shadow-sm">
              <div className="card-body gap-6">
                <div className="space-y-1">
                  <h2 className="text-base-content text-xl font-semibold">Business</h2>
                  <p className="text-base-content/70">For multi-location inventory operations.</p>
                </div>
                <div className="text-base-content text-4xl font-semibold">
                  $99 <span className="text-base-content/50 text-base font-normal">/month</span>
                </div>
                <ul className="space-y-3 text-base-content/80">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Everything in Team, plus:</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Multiple locations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Advanced reports and analytics</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Priority email support</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Hands-on migration help</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Up to 25 users</span>
                  </li>
                </ul>
                <Link href="/signup" className="btn btn-primary btn-gradient">
                  Start 14-Day Free Trial
                </Link>
                <p className="text-base-content/60 text-center text-xs">No credit card required</p>
              </div>
            </div>
          </div>

          {/* Enterprise callout */}
          <div className="mt-10 text-center">
            <p className="text-base-content/70">
              Need more than 25 users or custom integrations?{' '}
              <Link href="/demo" className="link link-primary link-animated font-medium">
                Contact us for Enterprise pricing
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURE COMPARISON TABLE ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Compare Plans</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              All plans include unlimited items and barcode scanning. No SKU cliffs.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Feature</th>
                  <th className="text-base-content text-center">Starter</th>
                  <th className="text-base-content text-center">Team</th>
                  <th className="text-base-content text-center">Business</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Unlimited items</td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Barcode scanning</td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Offline mobile mode</td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Low stock alerts</td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Check-in / check-out</td>
                  <td className="text-center">
                    <span className="icon-[tabler--x] text-base-content/30 size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Roles and permissions</td>
                  <td className="text-center">
                    <span className="icon-[tabler--x] text-base-content/30 size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Audit trail</td>
                  <td className="text-center">
                    <span className="icon-[tabler--x] text-base-content/30 size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Multiple locations</td>
                  <td className="text-center">
                    <span className="icon-[tabler--x] text-base-content/30 size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--x] text-base-content/30 size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Advanced reports</td>
                  <td className="text-center">
                    <span className="icon-[tabler--x] text-base-content/30 size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--x] text-base-content/30 size-5"></span>
                  </td>
                  <td className="text-center">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                  </td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Users included</td>
                  <td className="text-base-content/80 text-center">1</td>
                  <td className="text-base-content/80 text-center">Up to 10</td>
                  <td className="text-base-content/80 text-center">Up to 25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== TRUST / RISK REVERSAL SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Your Data, Your Control — Always
            </h2>
            <p className="text-base-content/80 mt-4 text-lg">
              We believe trust starts with transparency. Here&apos;s our promise.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--lock-open] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">No Lock-In Contracts</h3>
                <p className="text-base-content/70 mt-2">
                  Pay month-to-month. Cancel anytime from Settings. No penalty fees, no surprise charges.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--database-export] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Export Anytime</h3>
                <p className="text-base-content/70 mt-2">
                  Your inventory data belongs to you. Export items, history, and reports in CSV format — even on the
                  free tier.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--shield-check] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Price-Lock Guarantee</h3>
                <p className="text-base-content/70 mt-2">
                  Your plan price won&apos;t increase while you&apos;re a customer. No surprise tier jumps when you
                  grow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MIGRATION CTA SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-primary/5 border-primary/20 border p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Switching from Another Tool?
                </h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  We make migration painless. Import your inventory from Sortly, spreadsheets, or any CSV in minutes.
                  Business plan customers get hands-on migration help at no extra cost.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">CSV import with field mapping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Sortly migration guide</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Keep your existing barcodes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Import in under 30 minutes</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/migration/sortly" className="btn btn-primary btn-gradient btn-lg">
                  Migrate from Sortly
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={PRICING_FAQS} />

      {/* ===== FINAL CTA SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Questions About Your Use-Case?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              If you have multiple locations, specialized scanners, or a large migration — we&apos;ll help you map the
              best plan.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/features" className="btn btn-outline btn-secondary btn-lg">
                See All Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
