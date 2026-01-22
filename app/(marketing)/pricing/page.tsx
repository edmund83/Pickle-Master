/**
 * Pricing Page
 * Built from FlyonUI MCP templates:
 * - Pricing: /marketing-ui/pricing/pricing (pricing cards with features)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory management software pricing"
 * Secondary keywords: founders pricing, small business inventory, barcode inventory pricing
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory Management Software Pricing | Founders Pricing - Lock In Your Rate',
  description:
    'Simple inventory software pricing for small businesses. Founders pricing from $18/mo. Lock in your rate forever. Start free for 14 days.',
  pathname: '/pricing',
})

const PRICING_FAQS: FaqItem[] = [
  {
    question: 'What is Founders Pricing?',
    answer:
      "We're launching StockZip with special Founders Pricing to help early customers get started. Sign up now and you'll lock in your rate forever — even as we add features and raise prices. As long as your subscription stays active, your price won't change.",
  },
  {
    question: 'How does StockZip pricing work?',
    answer:
      'Simple monthly pricing based on your needs. Starter ($18/mo) gives you 1,200 items and 3 users. Growth ($39/mo) bumps that to 3,000 items, 5 users, and multi-location support. Scale ($89/mo) offers 8,000 items, 8 users, and advanced controls. All plans include barcode scanning, mobile app, and offline mode.',
  },
  {
    question: 'What are the item and user limits?',
    answer:
      'Each plan has generous limits designed for real small businesses. Starter: 1,200 items, 3 users. Growth: 3,000 items, 5 users. Scale: 8,000 items, 8 users. Need more? Scale plan offers flexible add-ons: $5/user/month and $10 per 1,000 extra items.',
  },
  {
    question: 'What is AskZoe AI?',
    answer:
      "AskZoe is your AI inventory assistant. Ask questions like 'What's running low?' or 'Show me items that haven't moved in 30 days.' Growth plan includes 100 questions/month, Scale includes 500. Starter users get 50 free questions during their first 7 days to try it out.",
  },
  {
    question: 'What happens after the 14-day free trial?',
    answer:
      "Your trial includes full access to all Growth plan features. If you don't subscribe, your account pauses — no surprise charges. You can export your data anytime. When you're ready, pick the plan that fits.",
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes. Upgrade or downgrade anytime from Settings. Changes take effect on your next billing cycle. No penalty fees, cancel anytime.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer:
      'Yes. Annual plans save 20% compared to monthly billing. Contact us for custom pricing on larger teams or organizations with special requirements.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) via Stripe. Annual Scale plans can be invoiced.',
  },
  {
    question: 'What if I need to cancel?',
    answer:
      "Cancel anytime from Settings. Your data remains accessible for 30 days after cancellation, and you can export everything in CSV format. If you come back later, note that Founders Pricing may no longer be available — you'd pay the current rate.",
  },
]

export default function PricingPage() {
  const lastUpdated = '2026-01-19'

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
          name: 'StockZip Inventory',
          description:
            'Inventory management software with barcode scanning, offline mode, and Founders Pricing. Lock in your rate forever.',
          pathname: '/pricing',
        })}
      />
      <JsonLd data={faqPageJsonLd(PRICING_FAQS)} />

      {/* ===== HERO SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center space-y-4 text-center sm:mb-16">
            <span className="badge badge-soft badge-primary rounded-full font-medium uppercase">
              Founders Pricing (Limited Time)
            </span>
            <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Lock In Your Rate Forever
            </h1>
            <p className="text-base-content/80 max-w-3xl text-lg md:text-xl">
              We&apos;re launching and keeping prices low to help early customers get started. Sign up now and keep
              this rate as long as you stay with us.
            </p>
            {/* Early Access callout */}
            <p className="text-accent font-medium">
              <span className="icon-[tabler--rocket] mr-1.5 inline-block size-4 align-text-bottom"></span>
              Early Access: Get 3 months free for early supporters
              <span className="text-base-content/60 font-normal"> (limited seats • no card required)</span>
            </p>
            {/* Founders Pricing explainer */}
            <div className="bg-primary/5 border-primary/20 mt-2 flex flex-col items-center gap-2 rounded-xl border px-6 py-4 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="icon-[tabler--discount-check] text-primary size-5"></span>
                <span className="text-base-content/80">Limited-time launch pricing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="icon-[tabler--lock] text-primary size-5"></span>
                <span className="text-base-content/80">Early customers lock in their rate</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="icon-[tabler--rotate-clockwise] text-primary size-5"></span>
                <span className="text-base-content/80">Cancel anytime</span>
              </div>
            </div>
            <p className="text-base-content/60 text-sm">Last updated: {lastUpdated}</p>
          </div>

          {/* ===== PRICING CARDS ===== */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Early Access Plan - Highlighted */}
            <div className="relative origin-bottom scale-[1.02] lg:scale-105">
              <div className="card bg-base-100 shadow-xl ring-2 ring-accent h-full">
              <div className="card-body flex h-full flex-col gap-6">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base-content text-xl font-bold">Early Access</h2>
                    <span className="badge badge-accent rounded-full text-xs text-white">
                      <span className="icon-[tabler--rocket] mr-1 size-3"></span>
                      Early Bird
                    </span>
                  </div>
                  <p className="text-base-content/70">3 months free for early supporters.</p>
                </div>
                <div className="text-base-content text-4xl font-bold">
                  $0 <span className="text-base-content/50 text-base font-normal">for 3 months</span>
                </div>
                {/* Plan limits */}
                <div className="bg-accent/10 -mx-2 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Items</span>
                    <span className="text-base-content font-semibold">1,200</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Users</span>
                    <span className="text-base-content font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Locations</span>
                    <span className="text-accent font-semibold">Up to 3</span>
                  </div>
                </div>
                <ul className="text-base-content/80 space-y-3">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>All Scale features included</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Lot & serial number tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Advanced role permissions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Approvals & audit trail</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--sparkles] text-primary/60 size-5 shrink-0"></span>
                    <span>500 AskZoe AI questions/month</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--mood-smile] text-accent/60 size-5 shrink-0"></span>
                    <span className="text-base-content/60">Brief survey each month</span>
                  </li>
                </ul>
                <div className="mt-auto flex flex-col items-center gap-2">
                  <Link href="/signup?plan=early_access" className="btn btn-accent">
                    Join Early Access
                  </Link>
                  <p className="text-base-content/60 text-center text-xs">Limited seats • No card required</p>
                </div>
              </div>
            </div>
            </div>

            {/* Starter Plan */}
            <div className="card card-border bg-base-100 shadow-sm h-full">
              <div className="card-body flex h-full flex-col gap-6">
                <div className="space-y-1">
                  <h2 className="text-base-content text-xl font-semibold">Starter</h2>
                  <p className="text-base-content/70">Perfect for getting started.</p>
                </div>
                <div className="text-base-content text-4xl font-semibold">
                  $18 <span className="text-base-content/50 text-base font-normal">/month</span>
                </div>
                {/* Plan limits */}
                <div className="bg-base-200/50 -mx-2 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Items</span>
                    <span className="text-base-content font-medium">1,200</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Users</span>
                    <span className="text-base-content font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Locations</span>
                    <span className="text-base-content font-medium">Single</span>
                  </div>
                </div>
                <ul className="space-y-3 text-base-content/80">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Core features included:</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Barcode & QR scanning</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Mobile app + offline mode</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Low-stock alerts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>CSV import/export & label printing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--sparkles] text-primary/60 size-5 shrink-0"></span>
                    <span>50 AskZoe AI questions/month</span>
                  </li>
                </ul>
                <div className="mt-auto flex flex-col items-center gap-2">
                  <Link href="/signup?plan=starter" className="btn btn-primary">
                    Start 14-Day Free Trial
                  </Link>
                  <p className="text-base-content/60 text-center text-xs">No credit card required</p>
                </div>
              </div>
            </div>

            {/* Growth Plan */}
            <div className="card card-border bg-base-100 shadow-sm h-full">
              <div className="card-body flex h-full flex-col gap-6">
                <div className="space-y-1">
                  <h2 className="text-base-content text-xl font-semibold">Growth</h2>
                  <p className="text-base-content/70">Best value for growing teams.</p>
                </div>
                <div className="text-base-content text-4xl font-semibold">
                  $39 <span className="text-base-content/50 text-base font-normal">/month</span>
                </div>
                {/* Plan limits */}
                <div className="bg-base-200/50 -mx-2 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Items</span>
                    <span className="text-base-content font-medium">3,000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Users</span>
                    <span className="text-base-content font-medium">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Locations</span>
                    <span className="text-base-content font-medium">Multi-location</span>
                  </div>
                </div>
                <ul className="space-y-3 text-base-content/80">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Everything in Starter, plus:</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Multi-location inventory</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Purchase orders & receiving</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Check-in / check-out workflow</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Stock counts & cycle counting</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--sparkles] text-primary/60 size-5 shrink-0"></span>
                    <span>100 AskZoe AI questions/month</span>
                  </li>
                </ul>
                <div className="mt-auto flex flex-col items-center gap-2">
                  <Link href="/signup?plan=growth" className="btn btn-primary">
                    Start 14-Day Free Trial
                  </Link>
                  <p className="text-base-content/60 text-center text-xs">No credit card required</p>
                </div>
              </div>
            </div>

            {/* Scale Plan */}
            <div className="card card-border bg-base-100 shadow-sm h-full">
              <div className="card-body flex h-full flex-col gap-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base-content text-xl font-semibold">Scale</h2>
                    <span className="badge badge-outline badge-secondary rounded-full text-xs">Add-ons available</span>
                  </div>
                  <p className="text-base-content/70">For teams needing control & compliance.</p>
                </div>
                <div className="text-base-content text-4xl font-semibold">
                  $89 <span className="text-base-content/50 text-base font-normal">/month</span>
                </div>
                {/* Plan limits */}
                <div className="bg-base-200/50 -mx-2 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Items</span>
                    <span className="text-base-content font-medium">8,000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Users</span>
                    <span className="text-base-content font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Locations</span>
                    <span className="text-base-content font-medium">Multi-location</span>
                  </div>
                </div>
                <ul className="space-y-3 text-base-content/80">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Everything in Growth, plus:</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Lot & serial number tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Advanced role permissions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Approvals & audit trail</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Priority support & onboarding</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--sparkles] text-primary size-5 shrink-0"></span>
                    <span>500 AskZoe AI questions/month</span>
                  </li>
                </ul>
                <div className="mt-auto flex flex-col items-center gap-2">
                  <Link href="/signup?plan=scale" className="btn btn-primary">
                    Start 14-Day Free Trial
                  </Link>
                  <p className="text-base-content/60 text-center text-xs">No credit card required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons callout (Scale only) */}
          <div className="mt-8 text-center">
            <div className="bg-base-100 border-base-300 mx-auto inline-flex flex-col items-center gap-2 rounded-xl border px-6 py-4 sm:flex-row sm:gap-6">
              <span className="text-base-content/70 text-sm font-medium">Scale plan add-ons:</span>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <span className="text-base-content">
                  <span className="font-semibold">+$5</span>
                  <span className="text-base-content/70">/user/month</span>
                </span>
                <span className="text-base-content/30">|</span>
                <span className="text-base-content">
                  <span className="font-semibold">+$10</span>
                  <span className="text-base-content/70">/1,000 items/month</span>
                </span>
              </div>
            </div>
          </div>

          {/* Enterprise callout */}
          <div className="mt-6 text-center">
            <p className="text-base-content/70">
              Need higher limits or custom integrations?{' '}
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
          <div className="mb-12 space-y-3 text-center md:space-y-4">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Compare Plans</h2>
            <p className="text-base-content/70 text-lg">
              All plans include barcode scanning, mobile app, and offline mode.
            </p>
          </div>

          {/* Pricing Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              {/* Header Row */}
              <thead>
                <tr className="normal-case">
                  <th className="bg-transparent"></th>
                  <th className="bg-accent text-accent-content rounded-t-box space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-lg font-semibold">Early Access</span>
                      <span className="icon-[tabler--rocket] size-4"></span>
                    </div>
                    <div className="text-2xl font-bold">$0</div>
                    <div className="text-sm font-normal opacity-80">3 months free</div>
                  </th>
                  <th className="space-y-1 text-center">
                    <div className="text-base-content text-lg font-semibold">Starter</div>
                    <div className="text-base-content text-2xl font-bold">$18</div>
                    <div className="text-base-content/50 text-sm font-normal">Per month</div>
                  </th>
                  <th className="space-y-1 text-center">
                    <div className="text-base-content text-lg font-semibold">Growth</div>
                    <div className="text-base-content text-2xl font-bold">$39</div>
                    <div className="text-base-content/50 text-sm font-normal">Per month</div>
                  </th>
                  <th className="space-y-1 text-center">
                    <div className="text-base-content text-lg font-semibold">Scale</div>
                    <div className="text-base-content text-2xl font-bold">$89</div>
                    <div className="text-base-content/50 text-sm font-normal">Per month</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Items */}
                <tr className="text-base-content">
                  <td className="font-medium">Items</td>
                  <td className="bg-accent/10 text-accent text-center font-semibold">1,200</td>
                  <td className="text-center">1,200</td>
                  <td className="text-center">3,000</td>
                  <td className="text-center">8,000</td>
                </tr>
                {/* Users */}
                <tr className="text-base-content">
                  <td className="font-medium">Users</td>
                  <td className="bg-accent/10 text-accent text-center font-semibold">3</td>
                  <td className="text-center">3</td>
                  <td className="text-center">5</td>
                  <td className="text-center">8</td>
                </tr>
                {/* Locations */}
                <tr className="text-base-content">
                  <td className="font-medium">Locations</td>
                  <td className="bg-accent/10 text-accent text-center font-semibold">Up to 3</td>
                  <td className="text-center">Single</td>
                  <td className="text-center">Multi</td>
                  <td className="text-center">Multi</td>
                </tr>
                {/* AskZoe AI */}
                <tr className="text-base-content">
                  <td className="font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="icon-[tabler--sparkles] text-primary size-4"></span>
                      AskZoe AI questions/mo
                    </span>
                  </td>
                  <td className="bg-accent/10 text-accent text-center font-semibold">500</td>
                  <td className="text-base-content/50 text-center text-sm">50 trial*</td>
                  <td className="text-center">100</td>
                  <td className="text-center">500</td>
                </tr>
                {/* Barcode & QR scanning */}
                <tr className="text-base-content">
                  <td className="font-medium">Barcode & QR scanning</td>
                  <td className="bg-accent/10">
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                </tr>
                {/* Mobile app + offline */}
                <tr className="text-base-content">
                  <td className="font-medium">Mobile app + offline</td>
                  <td className="bg-accent/10">
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                </tr>
                {/* Purchase orders */}
                <tr className="text-base-content">
                  <td className="font-medium">Purchase orders</td>
                  <td className="bg-accent/10">
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                </tr>
                {/* Check-in / check-out */}
                <tr className="text-base-content">
                  <td className="font-medium">Check-in / check-out</td>
                  <td className="bg-accent/10">
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                </tr>
                {/* Lot & serial tracking */}
                <tr className="text-base-content">
                  <td className="font-medium">Lot & serial tracking</td>
                  <td className="bg-accent/10">
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                </tr>
                {/* Audit trail & approvals */}
                <tr className="text-base-content">
                  <td className="font-medium">Audit trail & approvals</td>
                  <td className="bg-accent/10">
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                </tr>
                {/* Priority support */}
                <tr className="text-base-content">
                  <td className="font-medium">Priority support</td>
                  <td className="bg-accent/10">
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td className="text-base-content/30 text-center">—</td>
                  <td>
                    <div className="flex justify-center">
                      <span className="icon-[tabler--circle-check-filled] text-success size-5 shrink-0"></span>
                    </div>
                  </td>
                </tr>
                {/* CTA Row */}
                <tr className="text-base-content">
                  <td></td>
                  <td className="bg-accent rounded-b-box">
                    <Link href="/signup?plan=early_access" className="text-accent-content flex items-center justify-center gap-1 font-medium">
                      Join Now
                      <span className="icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
                    </Link>
                  </td>
                  <td>
                    <Link href="/signup?plan=starter" className="link link-primary flex items-center justify-center gap-1 font-medium">
                      Get Started
                      <span className="icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
                    </Link>
                  </td>
                  <td>
                    <Link href="/signup?plan=growth" className="link link-primary flex items-center justify-center gap-1 font-medium">
                      Get Started
                      <span className="icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
                    </Link>
                  </td>
                  <td>
                    <Link href="/signup?plan=scale" className="link link-primary flex items-center justify-center gap-1 font-medium">
                      Get Started
                      <span className="icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-base-content/50 mt-4 text-center text-xs">
            *Starter plan includes 50 AskZoe AI questions during the first 7 days
          </p>
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
              We believe trust starts with transparency. Here&apos;s our promise to you.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--lock] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Founders Rate Lock</h3>
                <p className="text-base-content/70 mt-2">
                  Sign up during our launch and keep your rate forever — even as we add features and raise prices. Your
                  loyalty is rewarded.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--database-export] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Export Anytime</h3>
                <p className="text-base-content/70 mt-2">
                  Your inventory data belongs to you. Export items, history, and reports in CSV format — anytime you
                  need.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--rotate-clockwise] text-primary mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Cancel Anytime</h3>
                <p className="text-base-content/70 mt-2">
                  Pay month-to-month. No contracts, no penalty fees. If you need to pause, your data stays safe for 30
                  days.
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
                <Link href="/migration/sortly" className="btn btn-primary btn-lg">
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
              Ready to Get Organized?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              Start your 14-day free trial today. Lock in Founders Pricing before it&apos;s gone.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup?plan=growth" className="btn btn-primary btn-lg">
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
