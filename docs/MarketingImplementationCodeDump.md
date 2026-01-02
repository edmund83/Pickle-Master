# Marketing + Landing Implementation (Code Dump)

Generated: 2026-01-01T17:51:10.765Z

This file is an auto-generated dump of the new/modified marketing + SEO + build files.

## Deleted
- `app/page.tsx`

## .gitignore
```
# Dependencies
node_modules/
.pnp
.pnp.js
.yarn/install-state.gz

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/
dist-ssr/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Local env files
.env
.env*.local
*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea/
.vscode/*
!.vscode/extensions.json
*.swp
*.swo
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Supabase
supabase/.branches
supabase/.temp

# Playwright
.playwright/
test-results/
playwright-report/

# PWA build outputs
public/sw.js
public/workbox-*.js
public/swe-worker-*.js
```

## app/(marketing)/compare/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Compare',
  description:
    'Compare Nook to other inventory tools. See how trust-first pricing, offline scanning, and check-in/check-out workflows stack up for small teams.',
  pathname: '/compare',
})

export default function CompareHubPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Compare', pathname: '/compare' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Inventory management with barcode scanning and offline-first mobile workflows.',
          pathname: '/compare',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Compare Nook
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          If you&apos;re switching tools, you probably care about predictable pricing, reliable scanning, and workflows
          that match real work (warehouses, jobsites, and small teams).
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/compare/sortly-alternative"
            className="card card-border shadow-none hover:border-primary transition-colors"
          >
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">Sortly alternative</h2>
                <span className="badge badge-primary badge-soft rounded-full">Most requested</span>
              </div>
              <p className="text-base-content/80">
                See why teams switch: trust-first pricing, offline-first scanning, and real check-in/check-out.
              </p>
              <span className="link link-primary link-animated mt-2 w-fit">View comparison</span>
            </div>
          </Link>

          <div className="card card-border shadow-none border-base-content/10">
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">More comparisons</h2>
                <span className="badge badge-outline badge-secondary rounded-full">Coming soon</span>
              </div>
              <p className="text-base-content/80">
                We&apos;re adding more alternatives (inFlow, Fishbowl, BoxHero) with factual workflow-by-workflow comparisons.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Want to see Nook in action?</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            Watch the 90-second demo or start a free trial and scan your first items today.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-primary btn-gradient btn-lg">
              Watch demo
              <span className="icon-[tabler--player-play] size-5"></span>
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
```

## app/(marketing)/compare/sortly-alternative/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Sortly alternative',
  description:
    'Switch from Sortly to Nook for trust-first pricing, offline-first barcode scanning, and real check-in/check-out workflows built for small teams.',
  pathname: '/compare/sortly-alternative',
})

const SORTLY_FAQS: FaqItem[] = [
  {
    question: 'Do you have hard SKU limits or surprise tier jumps?',
    answer:
      'No. Nook is designed to scale predictably so you aren’t forced into a huge tier jump just because your catalog grows.',
  },
  {
    question: 'Can my team scan and update inventory offline?',
    answer:
      'Yes. Nook is built for offline-first mobile workflows so scanning and updates keep working when Wi‑Fi is unreliable.',
  },
  {
    question: 'Can I track tools and assets checked out to employees?',
    answer:
      'Yes. Nook supports a real check-in/check-out workflow so you can assign items, set due dates, and stay accountable.',
  },
  {
    question: 'How long does it take to migrate from Sortly?',
    answer:
      'Most teams can export and import their core data in under an hour. If you have custom fields, multiple locations, or a lot of cleanup, we’ll help you map it.',
  },
  {
    question: 'Do you help with the migration?',
    answer:
      'Yes. If you want a guided migration, request a demo and we’ll walk through your CSV structure and field mapping.',
  },
]

const COMPARISON_ROWS = [
  {
    category: 'Pricing trust',
    pickle: 'Predictable scaling; no “punished for growth” surprises',
    sortly: 'Users frequently cite price hikes and SKU caps as pain points',
  },
  {
    category: 'Offline reliability',
    pickle: 'Offline-first mobile scanning + sync when back online',
    sortly: 'Users report sync delays and trust issues in the field',
  },
  {
    category: 'Check-in / check-out',
    pickle: 'Native issue/return workflow (assets, tools, staff)',
    sortly: 'Often requires workarounds for asset workflows',
  },
  {
    category: 'Bulk editing',
    pickle: 'Excel-grade bulk updates with guardrails (preview/undo)',
    sortly: 'Bulk workflows can be limiting as catalogs grow',
  },
  {
    category: 'Inventory trust layer',
    pickle: 'Audit trail + “who changed what” accountability',
    sortly: 'Teams often double-check counts due to trust gaps',
  },
  {
    category: 'Switching',
    pickle: 'Migration path designed for Sortly switchers',
    sortly: 'Leaving can feel risky without a clear migration plan',
  },
]

export default function SortlyAlternativePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Compare', pathname: '/compare' },
          { name: 'Sortly alternative', pathname: '/compare/sortly-alternative' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Barcode inventory management that works offline, with real check-in/check-out workflows.',
          pathname: '/compare/sortly-alternative',
        })}
      />
      <JsonLd data={faqPageJsonLd(SORTLY_FAQS)} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Comparison</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              A Sortly alternative built for real inventory work
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              Nook is built for barcode scanning, offline reliability, and accountability workflows (check-in/check-out)
              — with pricing that doesn&apos;t punish growth.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/migration/sortly" className="btn btn-outline btn-secondary btn-lg">
              Migrate from Sortly
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">Quick verdict</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            If you&apos;re feeling price shock, need offline scanning, or you track tools/assets checked out to staff, Nook
            is purpose-built for that reality.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Category</th>
                  <th className="text-base-content">Nook</th>
                  <th className="text-base-content">Sortly (common complaints)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.category}>
                    <td className="text-base-content font-medium">{row.category}</td>
                    <td className="text-base-content/80">{row.pickle}</td>
                    <td className="text-base-content/80">{row.sortly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-base-content/60 mt-4 text-sm">
            Nook and Sortly are trademarks of their respective owners. This page is based on publicly available
            information and recurring user-reported pain points.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">When Sortly is enough</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You have a small catalog and stable connectivity
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You don&apos;t need tool issue/return accountability
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  You rarely bulk edit or run frequent counts
                </li>
              </ul>
            </div>
          </div>

          <div className="card card-border shadow-none border-primary/20">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">When you should switch</h2>
              <ul className="text-base-content/80 mt-4 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  You&apos;ve been hit by pricing jumps or SKU/user caps
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  Your team scans in warehouses/jobsites with unreliable internet
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--alert-triangle] text-warning size-5"></span>
                  You need real check-in/check-out workflows to stop losses and disputes
                </li>
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className="btn btn-primary btn-gradient">
                  Watch demo
                </Link>
                <Link href="/pricing" className="btn btn-outline btn-secondary">
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-2xl font-semibold">Switch without the risk</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            The fastest way to build confidence is to migrate a small subset of items, label them, and run one scan-first
            cycle count. It takes minutes — and it&apos;s usually enough to feel the difference.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/migration/sortly" className="btn btn-primary btn-gradient btn-lg">
              Follow the migration guide
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/solutions/construction-tools" className="btn btn-outline btn-secondary btn-lg">
              Track tools &amp; assets
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={SORTLY_FAQS} />
    </div>
  )
}
```

## app/(marketing)/demo/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Demo',
  description: 'Watch a quick demo of Nook inventory management: scanning, adjustments, and check-in/check-out.',
  pathname: '/demo',
})

export default function DemoPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Demo', pathname: '/demo' },
        ])}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Nook demo</h1>
        <p className="text-base-content/80 mt-3 text-lg">
          A quick walkthrough of the workflows teams use most: scan &amp; adjust, stock counts, and check-in/out.
        </p>

        <div className="mt-8 rounded-box border border-base-content/10 bg-base-200 p-8">
          <p className="text-base-content/80">
            Video embed placeholder — add your 90-second demo clip here.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient">
              Start Free Trial
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-secondary">
              See Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/features/barcode-scanning/page.tsx
```tsx
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
          name: 'Nook Inventory',
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
```

## app/(marketing)/features/bulk-editing/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Bulk editing with preview and undo',
  description:
    'Make Excel-grade bulk edits with guardrails: preview diffs, avoid mistakes, and undo changes when needed.',
  pathname: '/features/bulk-editing',
})

export default function BulkEditingFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Bulk editing', pathname: '/features/bulk-editing' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Bulk inventory editing with preview and undo.',
          pathname: '/features/bulk-editing',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="badge badge-soft badge-primary rounded-full">Feature</p>
        <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
          Bulk edits with guardrails (so mistakes don’t ship)
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Spreadsheets are fast — until they break trust. Nook keeps speed while adding preview and undo so your team
          can move quickly without fear.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">
            Start Free Trial
          </Link>
          <Link href="/demo" className="btn btn-outline btn-secondary">
            Watch demo
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Preview diffs</h2>
              <p className="text-base-content/80 mt-2">See exactly what will change before you apply it.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Guardrails</h2>
              <p className="text-base-content/80 mt-2">Reduce errors with validation and clear warnings.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Undo</h2>
              <p className="text-base-content/80 mt-2">Reverse a change when something doesn’t look right.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Perfect for</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--upload] text-primary size-5"></span>
              <span className="text-base-content/80">Imports and cleanup after migration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--arrows-exchange] text-primary size-5"></span>
              <span className="text-base-content/80">Mass location/folder updates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--tag] text-primary size-5"></span>
              <span className="text-base-content/80">Tagging and status updates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--calculator] text-primary size-5"></span>
              <span className="text-base-content/80">Recount corrections after audits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/features/check-in-check-out/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Check-in / check-out inventory workflow',
  description:
    'Issue tools and assets to staff with scan-based check-in/check-out and a clear audit trail. Stop losses and disputes.',
  pathname: '/features/check-in-check-out',
})

export default function CheckInCheckOutFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Check-in / check-out', pathname: '/features/check-in-check-out' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Inventory check-in/check-out with barcode scanning and audit trails.',
          pathname: '/features/check-in-check-out',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="badge badge-soft badge-primary rounded-full">Feature</p>
        <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
          Check-in / check-out that creates accountability (without extra admin work)
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Issue tools, equipment, or assets to staff by scan. Track who has what, when it left, and when it came back.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">
            Start Free Trial
          </Link>
          <Link href="/demo" className="btn btn-outline btn-secondary">
            Watch demo
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Issue by scan</h2>
              <p className="text-base-content/80 mt-2">
                Select a staff member, scan the item, and confirm. Done.
              </p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Return by scan</h2>
              <p className="text-base-content/80 mt-2">
                Scan on return to close the loop and keep inventory accurate.
              </p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Audit trail</h2>
              <p className="text-base-content/80 mt-2">
                See when items moved and who touched them last — no guesswork.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Best for</h2>
          <ul className="mt-4 space-y-3 text-base-content/80">
            <li className="flex gap-2"><span className="icon-[tabler--hammer] text-primary size-5"></span>Construction tools</li>
            <li className="flex gap-2"><span className="icon-[tabler--truck] text-primary size-5"></span>Shared equipment</li>
            <li className="flex gap-2"><span className="icon-[tabler--briefcase] text-primary size-5"></span>Field kits &amp; cases</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/features/low-stock-alerts/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Low-stock alerts and reorder points',
  description:
    'Set reorder points and get notified before you run out. Prevent stockouts and keep ordering predictable.',
  pathname: '/features/low-stock-alerts',
})

export default function LowStockAlertsFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Low-stock alerts', pathname: '/features/low-stock-alerts' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Low-stock alerts and reorder points for inventory management.',
          pathname: '/features/low-stock-alerts',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="badge badge-soft badge-primary rounded-full">Feature</p>
        <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
          Low-stock alerts that prevent stockouts
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Set reorder points per item and get notified when inventory dips — so you can reorder early and keep customers
          happy.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">
            Start Free Trial
          </Link>
          <Link href="/demo" className="btn btn-outline btn-secondary">
            Watch demo
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Set reorder points</h2>
              <p className="text-base-content/80 mt-2">Define thresholds that match your lead times and demand.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">See what’s at risk</h2>
              <p className="text-base-content/80 mt-2">Quickly view items approaching low stock across locations.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Act early</h2>
              <p className="text-base-content/80 mt-2">Avoid emergency orders and last-minute substitutions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/features/offline-mobile-scanning/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Offline-first inventory scanning',
  description:
    'Keep scanning and updating inventory even without internet. Nook syncs changes when you’re back online.',
  pathname: '/features/offline-mobile-scanning',
})

export default function OfflineMobileScanningFeaturePage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Offline mobile scanning', pathname: '/features/offline-mobile-scanning' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Offline-first mobile inventory management with barcode scanning.',
          pathname: '/features/offline-mobile-scanning',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="badge badge-soft badge-primary rounded-full">Feature</p>
        <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
          Offline-first: keep scanning when Wi‑Fi disappears
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Warehouses, basements, and jobsites don&apos;t always have signal. Nook is designed for real conditions — work
          offline and sync later.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">
            Start Free Trial
          </Link>
          <Link href="/demo" className="btn btn-outline btn-secondary">
            Watch demo
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">What works offline</h2>
              <ul className="mt-4 space-y-3 text-base-content/80">
                <li className="flex gap-2"><span className="icon-[tabler--scan] text-primary size-5"></span>Scanning &amp; lookup</li>
                <li className="flex gap-2"><span className="icon-[tabler--plus-minus] text-primary size-5"></span>Quick adjustments</li>
                <li className="flex gap-2"><span className="icon-[tabler--arrow-left-right] text-primary size-5"></span>Check-in / check-out</li>
              </ul>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Sync you can trust</h2>
              <p className="text-base-content/80 mt-4">
                Changes are synced when you&apos;re back online. The audit trail keeps a clear record of what happened,
                even across devices.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-xl font-semibold">Best for</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--building-warehouse] text-primary size-5"></span>
              <span className="text-base-content/80">Warehouses with dead zones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--briefcase] text-primary size-5"></span>
              <span className="text-base-content/80">Field teams &amp; jobsites</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--truck] text-primary size-5"></span>
              <span className="text-base-content/80">Receiving docks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--home] text-primary size-5"></span>
              <span className="text-base-content/80">Back rooms and basements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/features/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Features',
  description:
    'Explore Nook features: barcode scanning, offline-first mobile inventory, check-in/check-out workflows, bulk editing with undo, and low-stock alerts.',
  pathname: '/features',
})

const FEATURE_PAGES = [
  {
    title: 'Barcode scanning',
    description: 'Scan to find and update items fast — receiving, picking, and audits.',
    href: '/features/barcode-scanning',
  },
  {
    title: 'Offline mobile scanning',
    description: 'Keep working without signal. Sync when you’re back online.',
    href: '/features/offline-mobile-scanning',
  },
  {
    title: 'Check-in / check-out',
    description: 'Issue and return tools/assets by scan with accountability.',
    href: '/features/check-in-check-out',
  },
  {
    title: 'Bulk editing',
    description: 'Excel-grade edits with preview + undo to avoid mistakes.',
    href: '/features/bulk-editing',
  },
  {
    title: 'Low-stock alerts',
    description: 'Reorder point notifications that prevent stockouts.',
    href: '/features/low-stock-alerts',
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Mobile-first inventory management with barcode scanning and offline mode.',
          pathname: '/features',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Features</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Built around speed, accuracy, and simplicity — so your whole team can scan and stay accurate in minutes.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {FEATURE_PAGES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="card card-border shadow-none hover:border-primary transition-colors"
            >
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">{feature.title}</h2>
                <p className="text-base-content/80">{feature.description}</p>
                <span className="link link-primary link-animated mt-2 w-fit">
                  Learn more
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/integrations/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Integrations',
  description:
    'Integrations for inventory management: ecommerce, accounting, and automation. Connect Nook with tools like Shopify, WooCommerce, QuickBooks, Xero, and Zapier.',
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
          name: 'Nook Inventory',
          description: 'Inventory management with barcode scanning and offline-first workflows.',
          pathname: '/integrations',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Integrations</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Most small teams don&apos;t want 50 integrations — they want 2–3 that actually work. Nook focuses on ecommerce,
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
```

## app/(marketing)/layout.tsx
```tsx
import type { Metadata } from 'next'
import { FlyonUIInit } from '@/components/marketing/FlyonUIInit'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar'

export const metadata: Metadata = {
  title: {
    template: '%s | Nook',
    default: 'Nook | Simple inventory management',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <FlyonUIInit />
      <header className="border-base-content/20 bg-base-100 fixed top-0 z-10 w-full border-b py-0.25">
        <MarketingNavbar />
      </header>
      {children}
      <MarketingFooter />
    </div>
  )
}
```

## app/(marketing)/learn/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Learn',
  description:
    'Learn inventory best practices: perpetual vs periodic inventory, reorder points, barcode workflows, and practical guides for small teams.',
  pathname: '/learn',
})

const GUIDES = [
  {
    title: 'Perpetual vs periodic inventory: what’s the difference?',
    description:
      'A practical guide for small businesses: definitions, pros/cons, and which system is easier to keep accurate.',
    href: '/learn/perpetual-vs-periodic-inventory',
  },
]

export default function LearnPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Learning Center</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Short, practical guides for people who manage real inventory — warehouses, small retail, construction tools,
          and ecommerce.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="card card-border shadow-none hover:border-primary transition-colors"
            >
              <div className="card-body">
                <h2 className="text-base-content text-xl font-semibold">{guide.title}</h2>
                <p className="text-base-content/80 mt-2">{guide.description}</p>
                <span className="link link-primary link-animated mt-3 w-fit">Read guide</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Want the fastest path to accuracy?</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            The quickest win is scan-first workflows: label items, scan to update, and run lightweight cycle counts
            weekly. That’s how small teams keep trust without overhead.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/features/barcode-scanning" className="btn btn-primary btn-gradient btn-lg">
              Barcode scanning
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
```

## app/(marketing)/learn/perpetual-vs-periodic-inventory/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Perpetual vs periodic inventory',
  description:
    'Perpetual inventory vs periodic inventory explained: definitions, pros/cons, and which system small teams can keep accurate with barcode scanning.',
  pathname: '/learn/perpetual-vs-periodic-inventory',
  ogType: 'article',
})

const FAQS: FaqItem[] = [
  {
    question: 'Is perpetual inventory always better than periodic?',
    answer:
      'Not always. Perpetual is better for speed and day-to-day accuracy, but it requires disciplined workflows (scanning, audit trail, cycle counts) to stay trustworthy.',
  },
  {
    question: 'What’s the biggest weakness of periodic inventory?',
    answer:
      'You don’t know what you truly have between counts. That creates stockouts, over-ordering, and “we’ll fix it later” drift.',
  },
  {
    question: 'How do small businesses keep perpetual inventory accurate?',
    answer:
      'Scan everything, standardize locations, use low-stock alerts, and run small cycle counts weekly. The goal is a trusted baseline and fast correction.',
  },
  {
    question: 'Can I start periodic and transition to perpetual later?',
    answer:
      'Yes. Many teams start by importing inventory, labeling top movers, and using scan-first adjustments. Over time, perpetual becomes the default as workflows stick.',
  },
]

export default function PerpetualVsPeriodicInventoryPage() {
  const published = '2026-01-01'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Perpetual vs periodic inventory', pathname: '/learn/perpetual-vs-periodic-inventory' },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          headline: 'Perpetual vs periodic inventory: what’s the difference?',
          description:
            'A practical guide for small teams: definitions, pros/cons, and how barcode scanning makes perpetual inventory easier to keep accurate.',
          pathname: '/learn/perpetual-vs-periodic-inventory',
          datePublished: published,
          dateModified: published,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header>
          <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Guide</p>
          <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
            Perpetual vs periodic inventory
          </h1>
          <p className="text-base-content/80 mt-3 text-lg">
            If you&apos;re trying to keep stock accurate with a small team, this is the decision that shapes everything:
            how often you update inventory, how much you trust the numbers, and how painful counts feel.
          </p>
          <p className="text-base-content/60 mt-4 text-sm">Last updated: {published}</p>
        </header>

        <section className="mt-10 space-y-10">
          <div>
            <h2 className="text-base-content text-2xl font-semibold">Quick definitions</h2>
            <p className="text-base-content/80 mt-3">
              <span className="text-base-content font-semibold">Perpetual inventory</span> updates quantities continuously as
              transactions happen (receiving, sales, transfers, adjustments).{' '}
              <span className="text-base-content font-semibold">Periodic inventory</span> updates quantities at specific
              intervals (weekly, monthly, quarterly) based on a physical count.
            </p>
          </div>

          <div>
            <h2 className="text-base-content text-2xl font-semibold">Side-by-side comparison</h2>
            <div className="mt-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Category</th>
                  <th className="text-base-content">Perpetual</th>
                  <th className="text-base-content">Periodic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Accuracy between counts</td>
                  <td className="text-base-content/80">Higher (if workflows are disciplined)</td>
                  <td className="text-base-content/80">Lower (unknown between counts)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Effort</td>
                  <td className="text-base-content/80">Distributed daily (scan + small corrections)</td>
                  <td className="text-base-content/80">Spiky (big counts + reconciliations)</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Best for</td>
                  <td className="text-base-content/80">Warehouses, ecommerce, tool tracking</td>
                  <td className="text-base-content/80">Very small catalogs or low transaction volume</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Biggest risk</td>
                  <td className="text-base-content/80">Bad process creates “false confidence”</td>
                  <td className="text-base-content/80">You make decisions on stale numbers</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <div>
            <h2 className="text-base-content text-2xl font-semibold">Which should a small business choose?</h2>
            <p className="text-base-content/80 mt-3">
              If you reorder regularly, sell online, move stock between locations, or issue tools to staff, perpetual inventory
              usually wins — <span className="text-base-content font-semibold">but only</span> if you can keep updates fast and simple.
            </p>
            <p className="text-base-content/80 mt-3">
              The turning point is scanning. When a team can <span className="text-base-content font-semibold">scan → confirm → done</span>,
              perpetual inventory stops feeling like overhead and starts feeling like insurance.
            </p>
          </div>

          <div>
            <h2 className="text-base-content text-2xl font-semibold">How to make perpetual inventory work (without an ERP)</h2>
            <ol className="text-base-content/80 mt-4 list-decimal space-y-2 pl-6">
              <li>Label top movers first (don’t wait for perfection).</li>
              <li>Standardize locations (warehouse → shelf → bin).</li>
              <li>Scan to receive, transfer, and adjust — don’t “fix later.”</li>
              <li>Run small weekly cycle counts to maintain trust.</li>
              <li>Use low-stock alerts so reorder decisions aren’t guesswork.</li>
            </ol>
          </div>
        </section>

        <div className="mt-10 rounded-box bg-base-200 p-8">
          <h2 className="text-base-content text-2xl font-semibold">Want perpetual inventory without the pain?</h2>
          <p className="text-base-content/80 mt-3">
            Nook is built for small teams: barcode scanning, offline reliability, and audit trails that keep counts
            trustworthy.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-primary btn-gradient btn-lg">
              Watch demo
            </Link>
            <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary btn-lg">
              Barcode scanning
            </Link>
          </div>
        </div>
      </article>

      <FaqBlock items={FAQS} />
    </div>
  )
}
```

## app/(marketing)/migration/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Migration',
  description:
    'Migration guides and checklists to help you switch inventory tools quickly — including a Sortly migration guide built for small teams.',
  pathname: '/migration',
})

export default function MigrationHubPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Migration', pathname: '/migration' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Inventory management with barcode scanning and offline-first workflows.',
          pathname: '/migration',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Migration</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Switching inventory systems should feel safe, not scary. Use these guides to export your data, map it cleanly,
          and verify accuracy quickly.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/migration/sortly"
            className="card card-border shadow-none hover:border-primary transition-colors"
          >
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">Sortly migration</h2>
                <span className="badge badge-primary badge-soft rounded-full">Step-by-step</span>
              </div>
              <p className="text-base-content/80">
                Export your catalog, import via CSV, label items, and run a scan-first verification count.
              </p>
              <span className="link link-primary link-animated mt-2 w-fit">Open guide</span>
            </div>
          </Link>

          <div className="card card-border shadow-none border-base-content/10">
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">More migrations</h2>
                <span className="badge badge-outline badge-secondary rounded-full">Coming soon</span>
              </div>
              <p className="text-base-content/80">
                We&apos;re adding migration playbooks for BoxHero, inFlow, and spreadsheets.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Want a guided migration?</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            If you have multiple locations, complex tags, or a large catalog, request a demo and we&apos;ll help map your
            data and verify accuracy.
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
```

## app/(marketing)/migration/sortly/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Sortly migration',
  description:
    'Migrate from Sortly to Nook with a simple checklist: export CSV, map folders/locations, import, label, and run a scan-first verification count.',
  pathname: '/migration/sortly',
})

const MIGRATION_FAQS: FaqItem[] = [
  {
    question: 'What’s the fastest way to migrate safely?',
    answer:
      'Import a small subset first (one location or category), label items, then run a scan-first verification count. Once you trust the workflow, import the rest.',
  },
  {
    question: 'Do I need barcodes already?',
    answer:
      'No. You can generate labels after import. If you already have barcodes/QR codes, keep them and start scanning immediately.',
  },
  {
    question: 'Can you help me map fields and locations?',
    answer:
      'Yes. Request a demo and we’ll help map your CSV columns, folder/location structure, and any custom fields.',
  },
  {
    question: 'How do I prevent count mismatches after import?',
    answer:
      'Do one scan-first count right after import and treat it as your “baseline verification.” After that, you’ll have a clean starting point for ongoing accuracy.',
  },
]

export default function SortlyMigrationPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Migration', pathname: '/migration' },
          { name: 'Sortly', pathname: '/migration/sortly' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Inventory management with barcode scanning, offline-first mobile, and check-in/check-out.',
          pathname: '/migration/sortly',
        })}
      />
      <JsonLd data={faqPageJsonLd(MIGRATION_FAQS)} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Migration</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Sortly migration guide
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              A simple, safe way to move from Sortly to Nook — without breaking your counts or slowing your team down.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Request a demo
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="card card-border shadow-none lg:col-span-2">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">Step-by-step checklist</h2>
              <ol className="text-base-content/80 mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">1</span>
                  <span>
                    <span className="text-base-content font-medium">Export from Sortly</span> as CSV (items, folders/locations,
                    tags, and any custom fields you rely on).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">2</span>
                  <span>
                    <span className="text-base-content font-medium">Decide your structure</span>: map Sortly folders to Nook
                    locations (warehouse → shelf → bin) so scanning and counts match reality.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">3</span>
                  <span>
                    <span className="text-base-content font-medium">Clean the CSV</span>: normalize SKUs, remove duplicates,
                    and make sure quantities are numeric (no “N/A”).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">4</span>
                  <span>
                    <span className="text-base-content font-medium">Import into Nook</span> and spot-check 20–30 items for
                    names, SKUs, quantities, locations, and tags.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">5</span>
                  <span>
                    <span className="text-base-content font-medium">Label your top movers first</span> (fast-moving items,
                    tools, or high-value stock) so scanning starts paying off immediately.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-primary badge-soft rounded-full">6</span>
                  <span>
                    <span className="text-base-content font-medium">Run one scan-first verification count</span> to establish
                    a trusted baseline. After that, your ongoing counts are faster and cleaner.
                  </span>
                </li>
              </ol>
            </div>
          </div>

          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-xl font-semibold">Common mapping</h2>
              <p className="text-base-content/80 mt-2">
                Keep it simple. A clean location hierarchy is usually the biggest win.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-base-content">Sortly</th>
                      <th className="text-base-content">Nook</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-base-content/80">Folder</td>
                      <td className="text-base-content/80">Location / Folder</td>
                    </tr>
                    <tr>
                      <td className="text-base-content/80">Item</td>
                      <td className="text-base-content/80">Item</td>
                    </tr>
                    <tr>
                      <td className="text-base-content/80">Quantity</td>
                      <td className="text-base-content/80">Quantity + audit trail</td>
                    </tr>
                    <tr>
                      <td className="text-base-content/80">Tags</td>
                      <td className="text-base-content/80">Tags</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <Link href="/compare/sortly-alternative" className="link link-primary link-animated">
                  See why teams switch
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Lower the switching risk</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            The goal isn&apos;t “perfect data” on day one — it&apos;s a trusted baseline and a workflow your team actually uses.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/features/barcode-scanning" className="btn btn-primary btn-gradient btn-lg">
              Barcode scanning
            </Link>
            <Link href="/features/offline-mobile-scanning" className="btn btn-outline btn-secondary btn-lg">
              Offline mode
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={MIGRATION_FAQS} />
    </div>
  )
}
```

## app/(marketing)/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { HomeHero } from '@/components/marketing/HomeHero'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FaqBlock, DEFAULT_FAQS } from '@/components/marketing/FaqBlock'
import { TestimonialGrid } from '@/components/marketing/TestimonialGrid'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { faqPageJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Inventory management with barcode scanning',
  description:
    'A simple, mobile-first inventory management system for small teams — barcode scanning, offline reliability, check-in/check-out, and trust-first pricing.',
  pathname: '/',
})

export default function MarketingHomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqPageJsonLd(DEFAULT_FAQS)} />

      <HomeHero />
      <FeatureGrid />

      <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-6 md:grid-cols-4">
            <Link href="/solutions/warehouse" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Warehouse</h3>
                <p className="text-base-content/80">Fast receiving, counts, and picking — with scans you can trust.</p>
              </div>
            </Link>
            <Link href="/solutions/ecommerce" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Ecommerce</h3>
                <p className="text-base-content/80">Prevent stockouts and stay accurate across locations and channels.</p>
              </div>
            </Link>
            <Link href="/solutions/construction-tools" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Construction &amp; Tools</h3>
                <p className="text-base-content/80">Issue and return tools by scan — stop losses and disputes.</p>
              </div>
            </Link>
            <Link href="/solutions/small-business" className="card card-border shadow-none hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Small business</h3>
                <p className="text-base-content/80">Replace spreadsheets in minutes — no training required.</p>
              </div>
            </Link>
          </div>

          <div className="rounded-box bg-base-200 p-8 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Switching from Sortly?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              Nook is built for real workflows (offline scanning + check-in/out) with pricing that won&apos;t punish growth.
              Migrate your data fast and keep your team moving.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/compare/sortly-alternative" className="btn btn-primary btn-gradient">
                See why teams switch
              </Link>
              <Link href="/migration/sortly" className="btn btn-outline btn-secondary">
                Sortly migration
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TestimonialGrid />
      <PricingSection />
      <FaqBlock />

      <div className="bg-base-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-base-200 p-10 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Start tracking stock with confidence
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              Try Nook free and see how fast your team can scan, update, and stay accurate.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/login" className="btn btn-outline btn-secondary btn-lg">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

## app/(marketing)/pricing/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FaqBlock, DEFAULT_FAQS } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Pricing',
  description:
    'Simple, trust-first pricing for barcode inventory management. No surprise tier jumps. Start free and scale without penalties.',
  pathname: '/pricing',
})

export default function PricingPage() {
  return (
    <div className="pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Pricing', pathname: '/pricing' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Mobile-first inventory management with barcode scanning and offline mode.',
          pathname: '/pricing',
        })}
      />
      <JsonLd data={faqPageJsonLd(DEFAULT_FAQS)} />

      <PricingSection />
      <FaqBlock />

      <div className="bg-base-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-base-200 p-10 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Questions about your use-case?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              If you have scanners, multiple locations, or a big migration — we&apos;ll help you map the best plan.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
              </Link>
              <Link href="/migration/sortly" className="btn btn-outline btn-secondary btn-lg">
                Migrate from Sortly
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/privacy/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Privacy policy',
  description:
    'Privacy policy for Nook Inventory. Learn what data we collect, how we use it, and your choices as a customer.',
  pathname: '/privacy',
})

export default function PrivacyPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Privacy', pathname: '/privacy' },
        ])}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Privacy Policy</h1>
        <p className="text-base-content/80 mt-3">
          This is a plain-language privacy policy for Nook. Replace this with your final legal copy before launch.
        </p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-base-content text-2xl font-semibold">What we collect</h2>
            <ul className="text-base-content/80 mt-4 list-disc space-y-2 pl-6">
              <li>Account information (name, email).</li>
              <li>Workspace data you store in Nook (inventory items, locations, activity logs).</li>
              <li>Usage data to improve reliability and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">How we use data</h2>
            <ul className="text-base-content/80 mt-4 list-disc space-y-2 pl-6">
              <li>To provide the service (authentication, syncing, notifications).</li>
              <li>To improve product quality (bug fixes, performance).</li>
              <li>To provide support and respond to requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">Data ownership</h2>
            <p className="text-base-content/80 mt-3">
              Your inventory data belongs to you. You can export your data and stop using the service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">Security</h2>
            <p className="text-base-content/80 mt-3">
              We use tenant isolation, access control, and auditability to protect customer data. See{' '}
              <Link href="/security" className="link link-primary">
                Security
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">Contact</h2>
            <p className="text-base-content/80 mt-3">If you have privacy questions, contact support.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/security/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Security',
  description:
    'Security-first inventory software for small teams. Learn how Nook protects tenant data with row-level security, role-based access, and audit trails.',
  pathname: '/security',
})

const SECURITY_FAQS: FaqItem[] = [
  {
    question: 'How is tenant data isolated?',
    answer:
      'Nook uses strict database row-level security (RLS) so tenants cannot access each other’s data at the database layer.',
  },
  {
    question: 'Do you support roles and permissions?',
    answer:
      'Yes. Nook supports role-based access control (RBAC) so teams can limit who can edit, delete, or manage settings.',
  },
  {
    question: 'Do you keep an audit trail?',
    answer:
      'Yes. Nook tracks inventory movements and key changes so you can see who did what, when, and why.',
  },
  {
    question: 'Can we export our data?',
    answer:
      'Yes. Data ownership matters — you can export inventory and key reports so you’re never locked in.',
  },
]

export default function SecurityPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Security', pathname: '/security' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Multi-tenant inventory management with barcode scanning and tenant isolation.',
          pathname: '/security',
        })}
      />
      <JsonLd data={faqPageJsonLd(SECURITY_FAQS)} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Security</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Inventory is trust. Nook is built with tenant isolation, access control, and auditability so small teams can
          move fast without losing confidence.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--shield-lock] text-primary size-6"></span>
                <h2 className="text-base-content text-xl font-semibold">Tenant isolation</h2>
              </div>
              <p className="text-base-content/80 mt-2">
                Multi-tenant data isolation enforced with database row-level security (RLS), not just application logic.
              </p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--user-shield] text-primary size-6"></span>
                <h2 className="text-base-content text-xl font-semibold">Role-based access</h2>
              </div>
              <p className="text-base-content/80 mt-2">
                Admin/manager/staff roles with permissions so the right people can approve changes and manage settings.
              </p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--clipboard-check] text-primary size-6"></span>
                <h2 className="text-base-content text-xl font-semibold">Auditability</h2>
              </div>
              <p className="text-base-content/80 mt-2">
                Stock movements and key actions are tracked so you can answer “what changed?” without guesswork.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-box bg-base-200 p-10">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Security should be simple</h2>
          <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
            You shouldn&apos;t need an IT team to run inventory correctly. Nook focuses on the basics that prevent real
            problems: tenant isolation, access control, and an audit trail your team can understand.
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

      <FaqBlock items={SECURITY_FAQS} />
    </div>
  )
}
```

## app/(marketing)/solutions/construction-tools/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Construction tools and asset tracking',
  description:
    'Track tools and assets with barcode scanning, offline mode, and check-in/check-out workflows for field teams.',
  pathname: '/solutions/construction-tools',
})

export default function ConstructionToolsSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Construction & Tools', pathname: '/solutions/construction-tools' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Tool and asset tracking with check-in/check-out and offline scanning.',
          pathname: '/solutions/construction-tools',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Stop losing tools: issue and return by scan
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Field teams need accountability without paperwork. Use scan-based check-in/check-out and keep working offline
          on jobsites.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/features/check-in-check-out" className="btn btn-outline btn-secondary">Check-in / check-out</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Accountability</h2>
              <p className="text-base-content/80 mt-2">Know who has what — and when it was issued.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Offline reliability</h2>
              <p className="text-base-content/80 mt-2">Keep scanning without signal and sync later.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Faster audits</h2>
              <p className="text-base-content/80 mt-2">Spot missing tools and close gaps quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/solutions/ecommerce/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Ecommerce inventory management',
  description:
    'Prevent stockouts with accurate inventory counts, reorder points, and fast barcode scanning across locations.',
  pathname: '/solutions/ecommerce',
})

export default function EcommerceSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Ecommerce', pathname: '/solutions/ecommerce' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Ecommerce inventory management with low-stock alerts and barcode scanning.',
          pathname: '/solutions/ecommerce',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Ecommerce stock you can trust</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Keep accurate counts, set reorder points, and avoid the costly cycle of stockouts and overselling.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/features/low-stock-alerts" className="btn btn-outline btn-secondary">Low-stock alerts</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Accurate counts</h2>
              <p className="text-base-content/80 mt-2">Use scan-based counts to catch discrepancies fast.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Reorder points</h2>
              <p className="text-base-content/80 mt-2">Prevent stockouts with alerts you can act on early.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Multi-location</h2>
              <p className="text-base-content/80 mt-2">Track what you have and where it is across locations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/solutions/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Solutions',
  description:
    'Nook inventory solutions for warehouses, ecommerce, construction/tools, and small businesses — built for scanning, offline work, and accountability.',
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
          name: 'Nook Inventory',
          description: 'Inventory management solutions for small teams.',
          pathname: '/solutions',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Solutions</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Nook is flexible enough for warehouses and field teams, but still simple enough for small businesses.
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
```

## app/(marketing)/solutions/small-business/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Small business inventory management',
  description:
    'Replace spreadsheets with a simple inventory system your team can use in minutes — barcode scanning, offline mode, and predictable pricing.',
  pathname: '/solutions/small-business',
})

export default function SmallBusinessSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Small business', pathname: '/solutions/small-business' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Simple inventory management for small businesses with barcode scanning.',
          pathname: '/solutions/small-business',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">
          Replace spreadsheets without training your whole team
        </h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Nook keeps setup light so you can start scanning and staying accurate quickly — without feeling like you
          bought an ERP.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/migration/sortly" className="btn btn-outline btn-secondary">Import &amp; migrate</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Fast setup</h2>
              <p className="text-base-content/80 mt-2">Import from CSV and start scanning in minutes.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Staff-friendly</h2>
              <p className="text-base-content/80 mt-2">Plain language UI with scan-first workflows.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Predictable pricing</h2>
              <p className="text-base-content/80 mt-2">No surprise jumps as your catalog grows.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/solutions/warehouse/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Warehouse inventory management',
  description:
    'Warehouse inventory tracking with barcode scanning, fast stock counts, and offline reliability for real-world conditions.',
  pathname: '/solutions/warehouse',
})

export default function WarehouseSolutionPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Warehouse', pathname: '/solutions/warehouse' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'Nook Inventory',
          description: 'Warehouse inventory management with barcode scanning and offline mode.',
          pathname: '/solutions/warehouse',
        })}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Warehouse inventory that stays accurate</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Receive, count, and pick with scan-first workflows. Keep working in dead zones, sync later, and always know
          who changed what.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary btn-gradient">Start Free Trial</Link>
          <Link href="/features/barcode-scanning" className="btn btn-outline btn-secondary">Barcode scanning</Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Receiving</h2>
              <p className="text-base-content/80 mt-2">Scan in stock, verify quantities, and avoid miscounts.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Cycle counts</h2>
              <p className="text-base-content/80 mt-2">Run counts quickly and close gaps with accountability.</p>
            </div>
          </div>
          <div className="card card-border shadow-none">
            <div className="card-body">
              <h2 className="text-base-content text-lg font-semibold">Picking</h2>
              <p className="text-base-content/80 mt-2">Find items fast with search + scan and clear locations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## app/(marketing)/terms/page.tsx
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Terms of service',
  description:
    'Terms of service for Nook Inventory. Service rules, acceptable use, and customer responsibilities.',
  pathname: '/terms',
})

export default function TermsPage() {
  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Terms', pathname: '/terms' },
        ])}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Terms of Service</h1>
        <p className="text-base-content/80 mt-3">
          This is a simplified placeholder. Replace this with your final legal terms before launch.
        </p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-base-content text-2xl font-semibold">Using the service</h2>
            <p className="text-base-content/80 mt-3">
              You agree to use Nook lawfully and not to attempt to access other tenants’ data.
            </p>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">Your data</h2>
            <p className="text-base-content/80 mt-3">
              You are responsible for the accuracy of the data you import. You own your inventory data and can export it.
            </p>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">Availability</h2>
            <p className="text-base-content/80 mt-3">
              We aim for reliable uptime, but outages can happen. For security details, see{' '}
              <Link href="/security" className="link link-primary">
                Security
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">Billing</h2>
            <p className="text-base-content/80 mt-3">
              Plans and pricing are described on{' '}
              <Link href="/pricing" className="link link-primary">
                Pricing
              </Link>
              . You can cancel according to your plan.
            </p>
          </section>

          <section>
            <h2 className="text-base-content text-2xl font-semibold">Contact</h2>
            <p className="text-base-content/80 mt-3">If you have questions about these terms, contact support.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
```

## app/layout.tsx
```tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nook - Simple Inventory Management',
  description: 'A simple, mobile-first inventory management SaaS for small businesses',
  keywords: ['inventory', 'management', 'small business', 'stock tracking'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nook',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Nook',
    title: 'Nook - Simple Inventory Management',
    description: 'A simple, mobile-first inventory management SaaS for small businesses',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#de4a4a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-base-100 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

## app/robots.ts
```ts
import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().toString().replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api',
          '/auth',
          '/login',
          '/signup',
          '/onboarding',
          '/dashboard',
          '/inventory',
          '/tasks',
          '/reports',
          '/settings',
          '/scan',
          '/search',
          '/help',
          '/ai-assistant',
          '/notifications',
          '/reminders',
          '/tags',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
```

## app/sitemap.ts
```ts
import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const marketingPages = [
    '/',
    '/pricing',
    '/demo',
    '/features',
    '/features/barcode-scanning',
    '/features/offline-mobile-scanning',
    '/features/check-in-check-out',
    '/features/bulk-editing',
    '/features/low-stock-alerts',
    '/solutions',
    '/solutions/warehouse',
    '/solutions/ecommerce',
    '/solutions/construction-tools',
    '/solutions/small-business',
    '/compare',
    '/compare/sortly-alternative',
    '/migration',
    '/migration/sortly',
    '/integrations',
    '/security',
    '/learn',
    '/learn/perpetual-vs-periodic-inventory',
    '/privacy',
    '/terms',
  ]

  return marketingPages.map((pathname) => ({
    url: absoluteUrl(pathname),
    lastModified,
  }))
}
```

## components/chatter/MentionInput.tsx
```tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getTeamMembersForMention, type TeamMember } from '@/app/actions/chatter'

interface MentionInputProps {
    value: string
    onChange: (value: string) => void
    onMentionsChange: (userIds: string[]) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function MentionInput({
    value,
    onChange,
    onMentionsChange,
    placeholder = 'Write a message... Use @ to mention',
    className,
    disabled = false
}: MentionInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<TeamMember[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [mentionStartIndex, setMentionStartIndex] = useState(-1)
    const [trackedMentions, setTrackedMentions] = useState<Map<string, string>>(new Map()) // name -> userId
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Load suggestions when @ is detected
    const loadSuggestions = useCallback(async (query: string) => {
        const result = await getTeamMembersForMention(query)
        if (result.success && result.data) {
            setSuggestions(result.data)
            setSelectedIndex(0)
        }
    }, [])

    // Update tracked mentions based on current text
    const updateTrackedMentions = useCallback((text: string) => {
        const newTracked = new Map<string, string>()
        trackedMentions.forEach((userId, name) => {
            if (text.includes(`@${name}`)) {
                newTracked.set(name, userId)
            }
        })
        setTrackedMentions(newTracked)
        onMentionsChange(Array.from(newTracked.values()))
    }, [trackedMentions, onMentionsChange])

    // Handle input changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        const cursor = e.target.selectionStart || 0

        onChange(newValue)

        // Check for @ trigger
        const textBeforeCursor = newValue.slice(0, cursor)
        const lastAtIndex = textBeforeCursor.lastIndexOf('@')

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
            // Only search if no space after @ (still typing mention)
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                setMentionStartIndex(lastAtIndex)
                setShowSuggestions(true)
                loadSuggestions(textAfterAt)
            } else {
                setShowSuggestions(false)
                setMentionStartIndex(-1)
            }
        } else {
            setShowSuggestions(false)
            setMentionStartIndex(-1)
        }

        // Update tracked mentions (remove ones that were deleted)
        updateTrackedMentions(newValue)
    }, [onChange, loadSuggestions, updateTrackedMentions])

    // Handle selecting a mention
    const selectMention = useCallback((member: TeamMember) => {
        if (mentionStartIndex === -1) return

        const beforeMention = value.slice(0, mentionStartIndex)
        const afterCursor = value.slice(inputRef.current?.selectionStart || value.length)

        // Use display name for mention
        const mentionText = `@${member.user_name} `
        const newValue = beforeMention + mentionText + afterCursor

        onChange(newValue)
        setShowSuggestions(false)
        setMentionStartIndex(-1)

        // Track this mention
        const newTracked = new Map(trackedMentions)
        newTracked.set(member.user_name, member.user_id)
        setTrackedMentions(newTracked)
        onMentionsChange(Array.from(newTracked.values()))

        // Focus back on input and set cursor position
        setTimeout(() => {
            if (inputRef.current) {
                const newCursorPos = beforeMention.length + mentionText.length
                inputRef.current.focus()
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
            }
        }, 0)
    }, [value, mentionStartIndex, onChange, trackedMentions, onMentionsChange])

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            // Allow Enter to submit when not showing suggestions
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % suggestions.length)
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
                break
            case 'Enter':
            case 'Tab':
                e.preventDefault()
                selectMention(suggestions[selectedIndex])
                break
            case 'Escape':
                setShowSuggestions(false)
                setMentionStartIndex(-1)
                break
        }
    }, [showSuggestions, suggestions, selectedIndex, selectMention])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={cn('relative', className)}>
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    'w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
                    'resize-none placeholder:text-neutral-400',
                    'disabled:bg-neutral-50 disabled:cursor-not-allowed'
                )}
                rows={2}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 mb-1 w-full max-h-48 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg z-50"
                >
                    {suggestions.map((member, index) => (
                        <button
                            key={member.user_id}
                            onClick={() => selectMention(member)}
                            className={cn(
                                'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                                index === selectedIndex
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-neutral-50'
                            )}
                        >
                            {member.user_avatar ? (
                                <img
                                    src={member.user_avatar}
                                    alt=""
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                                    {member.user_name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                    {member.user_name}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {member.user_email}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
```

## components/marketing/FaqBlock.tsx
```tsx
import type { FaqItem } from '@/lib/marketing/jsonld'

export const DEFAULT_FAQS: FaqItem[] = [
  {
    question: 'Do you work with barcodes and QR codes?',
    answer:
      'Yes. You can scan with a phone camera or compatible Bluetooth scanners. Use barcodes or QR codes depending on your labels and workflow.',
  },
  {
    question: 'Will it work when my team has no internet?',
    answer:
      'Yes. Nook is built for offline-first mobile workflows. You can keep scanning and updating, then sync when you’re back online.',
  },
  {
    question: 'Can I migrate from Sortly?',
    answer:
      'Yes. Import via CSV and we’ll help map fields, folders/locations, tags, and custom data so you can go live quickly.',
  },
  {
    question: 'Do you have surprise pricing jumps or SKU cliffs?',
    answer:
      'No. Pricing is designed to be predictable so you can grow your catalog without suddenly being forced into an expensive tier.',
  },
]

export function FaqBlock({ items = DEFAULT_FAQS }: { items?: FaqItem[] }) {
  return (
    <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            Need help? We&apos;ve got answers
          </h2>
          <p className="text-base-content/80 text-xl">
            Common questions about scanning, offline mode, pricing, and migration.
          </p>
        </div>

        <div className="accordion divide-neutral/20 w-full divide-y">
          {items.map((faq, index) => {
            const id = `faq-${index + 1}`
            const contentId = `${id}-collapse`
            const isActive = index === 0

            return (
              <div key={faq.question} className={`accordion-item${isActive ? ' active' : ''}`} id={id}>
                <button
                  className="accordion-toggle inline-flex items-center justify-between text-start"
                  aria-controls={contentId}
                  aria-expanded="false"
                >
                  {faq.question}
                  <span className="icon-[tabler--plus] accordion-item-active:hidden text-base-content block size-4.5 shrink-0"></span>
                  <span className="icon-[tabler--minus] accordion-item-active:block text-base-content hidden size-4.5 shrink-0"></span>
                </button>
                <div
                  id={contentId}
                  className={`accordion-content transition-height w-full overflow-hidden duration-300${isActive ? '' : ' hidden'}`}
                  aria-labelledby={id}
                  role="region"
                >
                  <div className="px-5 pb-4">
                    <p className="text-base-content/80">{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

## components/marketing/FeatureGrid.tsx
```tsx
import Link from 'next/link'

const FEATURES = [
  {
    icon: 'icon-[tabler--scan]',
    title: 'Barcode scanning',
    description: 'Scan to find and update items fast — receiving, picking, and audits.',
    href: '/features/barcode-scanning',
  },
  {
    icon: 'icon-[tabler--wifi-off]',
    title: 'Offline-first mobile',
    description: 'Keep scanning on jobsites and warehouses. Sync when you’re back online.',
    href: '/features/offline-mobile-scanning',
  },
  {
    icon: 'icon-[tabler--arrow-left-right]',
    title: 'Check-in / check-out',
    description: 'Issue tools/assets to staff with accountability — no folder hacks.',
    href: '/features/check-in-check-out',
  },
  {
    icon: 'icon-[tabler--table]',
    title: 'Bulk edits with guardrails',
    description: 'Excel-grade edits with preview + undo to prevent expensive mistakes.',
    href: '/features/bulk-editing',
  },
  {
    icon: 'icon-[tabler--bell-ringing]',
    title: 'Low-stock alerts',
    description: 'Set reorder points and get notified before you run out.',
    href: '/features/low-stock-alerts',
  },
  {
    icon: 'icon-[tabler--switch-3]',
    title: '1-click migration',
    description: 'Bring your data over fast — especially from Sortly.',
    href: '/migration/sortly',
  },
]

export function FeatureGrid() {
  return (
    <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            All essentials in one place — without ERP complexity
          </h2>
          <p className="text-base-content/80 max-w-4xl text-xl">
            Built around how small teams actually manage inventory: scanning, counting, issuing, and staying accurate
            over time.
          </p>
          <div className="flex items-center gap-1.5">
            <Link href="/features" className="link link-primary link-animated text-lg font-medium">
              See all features
            </Link>
            <span className="icon-[tabler--arrow-right] text-primary size-5"></span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="card card-border hover:border-primary border-primary/30 shadow-none transition-colors duration-300"
            >
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-primary bg-primary/10 rounded-field size-11.5">
                    <span className={`${feature.icon} size-7.5`}></span>
                  </div>
                </div>
                <h3 className="card-title text-lg">{feature.title}</h3>
                <p className="text-base-content/80">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## components/marketing/FlyonUIInit.tsx
```tsx
'use client'

import { useEffect } from 'react'

export function FlyonUIInit() {
  useEffect(() => {
    let cancelled = false

    void import('flyonui/dist/index.mjs').then((flyonui) => {
      if (cancelled) return

      flyonui.HSCollapse?.autoInit?.()
      flyonui.HSAccordion?.autoInit?.()
      flyonui.HSDropdown?.autoInit?.()
      flyonui.HSCarousel?.autoInit?.()
      flyonui.HSTabs?.autoInit?.()
      flyonui.HSTooltip?.autoInit?.()
    })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
```

## components/marketing/HomeHero.tsx
```tsx
import Link from 'next/link'

export function HomeHero() {
  return (
    <div className="bg-base-100">
      <main className="h-screen">
        <div className="flex h-full flex-col justify-between gap-18 overflow-x-hidden pt-40 md:gap-24 md:pt-45 lg:gap-35 lg:pt-47.5">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 justify-self-center px-4 text-center sm:px-6 lg:px-8">
            <div className="bg-base-200 border-base-content/20 flex w-fit items-center gap-2.5 rounded-full border px-3 py-2">
              <span className="badge badge-primary shrink-0 rounded-full">Barcode + Offline</span>
              <span className="text-base-content/80">Inventory that works in the real world</span>
            </div>

            <h1 className="text-base-content relative z-1 text-5xl leading-[1.15] font-bold max-md:text-2xl md:max-w-4xl md:text-balance">
              <span>Inventory management with barcode scanning — built for small teams</span>
              <svg
                width="223"
                height="12"
                viewBox="0 0 223 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -bottom-1.5 left-10 -z-1 max-lg:left-4 max-md:hidden"
              >
                <path
                  d="M1.30466 10.7431C39.971 5.28788 76.0949 3.02 115.082 2.30401C143.893 1.77489 175.871 0.628649 204.399 3.63102C210.113 3.92052 215.332 4.91391 221.722 6.06058"
                  stroke="url(#paint0_linear_10365_68643)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_10365_68643"
                    x1="19.0416"
                    y1="4.03539"
                    x2="42.8362"
                    y2="66.9459"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.2" stopColor="var(--color-primary)" />
                    <stop offset="1" stopColor="var(--color-primary-content)" />
                  </linearGradient>
                </defs>
              </svg>
            </h1>

            <p className="text-base-content/80 max-w-3xl">
              Scan, count, and track stock across locations. Check items in/out to staff. Works offline on mobile.
              Trust-first pricing with no surprise tier jumps.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch 90-second demo
                <span className="icon-[tabler--player-play] size-5"></span>
              </Link>
            </div>

            <p className="text-base-content/70 text-sm">
              No credit card • Cancel anytime • Import from CSV/Sortly
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=80"
            alt="Warehouse inventory shelves"
            className="min-h-67 w-full object-cover"
          />
        </div>
      </main>
    </div>
  )
}
```

## components/marketing/JsonLd.tsx
```tsx
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a string; Next will safely escape by default.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

## components/marketing/MarketingFooter.tsx
```tsx
import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer>
      <div className="bg-base-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-6">
            {/* Newsletter section */}
            <div className="col-span-2 mb-8 flex flex-col justify-between gap-6 sm:mb-16 lg:mb-0 lg:gap-12">
              <div>
                <Link title="Nook" className="text-base-content flex items-center gap-3 text-xl font-bold" href="/">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
                    <span className="text-base font-bold text-white">P</span>
                  </div>
                  <span>Nook</span>
                </Link>
                <p className="text-base-content/80 mt-4 text-balance lg:max-w-md">
                  Simple, mobile-first inventory management for small teams — barcode scanning, offline reliability, and
                  trust-first pricing that doesn&apos;t punish growth.
                </p>
              </div>
              <div>
                <h4 className="text-base-content text-lg font-medium">Subscribe to Newsletter</h4>
                <div className="join mt-4 w-full lg:max-w-sm">
                  <label className="join-item input w-full">
                    <span className="icon-[tabler--mail] text-base-content/80 size-5"></span>
                    <span className="sr-only">Email address</span>
                    <input type="text" placeholder="Email" />
                  </label>
                  <button className="btn btn-primary join-item">Subscribe</button>
                </div>
                <span className="text-base-content/80 mt-2 text-sm">No spam. Unsubscribe anytime.</span>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="link link-animated text-base-content/80">Features</Link></li>
                <li><Link href="/solutions" className="link link-animated text-base-content/80">Solutions</Link></li>
                <li><Link href="/pricing" className="link link-animated text-base-content/80">Pricing</Link></li>
                <li><Link href="/migration/sortly" className="link link-animated text-base-content/80">Sortly migration</Link></li>
              </ul>
            </div>

            {/* Compare */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Compare</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/compare/sortly-alternative" className="link link-animated text-base-content/80">
                    Sortly alternative
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/learn" className="link link-animated text-base-content/80">Learning Center</Link></li>
                <li><Link href="/security" className="link link-animated text-base-content/80">Security</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="link link-animated text-base-content/80">Privacy</Link></li>
                <li><Link href="/terms" className="link link-animated text-base-content/80">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="via-primary/30 mx-auto h-px w-3/4 bg-gradient-to-r from-transparent to-transparent"></div>

        {/* Product section */}
        <div className="mx-auto flex max-w-7xl justify-between gap-5 px-4 py-6 max-lg:flex-col sm:px-6 lg:items-center lg:px-8">
          <div className="text-base-content text-lg font-medium">Built for real inventory work:</div>
          <div className="flex w-fit gap-y-3 max-sm:flex-col">
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--scan] text-primary size-5"></span>
              Barcode scanning
            </span>
            <div className="divider divider-horizontal mx-5 max-sm:hidden"></div>
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--wifi-off] text-primary size-5"></span>
              Offline-first
            </span>
            <div className="divider divider-horizontal mx-5 max-sm:hidden"></div>
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--shield-check-filled] text-primary size-5"></span>
              Audit trail
            </span>
          </div>
        </div>

        <div className="divider"></div>

        {/* Payment / Copyright section */}
        <div className="mx-auto flex max-w-7xl justify-between gap-3 px-4 py-6 max-lg:flex-col sm:px-6 lg:items-center lg:px-8">
          <div className="text-base-content text-base text-wrap">
            &copy;{new Date().getFullYear()} <Link href="/" className="text-primary">Nook</Link>. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--shield-check-filled] text-success size-5"></span>
              Secure by design
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

## components/marketing/MarketingNavbar.tsx
```tsx
import Link from 'next/link'

export function MarketingNavbar() {
  return (
    <nav className="navbar px-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:flex md:items-center md:gap-2 lg:px-8">
        <div className="navbar-start w-max items-center justify-between max-md:w-full">
          <Link className="text-base-content flex items-center gap-3 text-xl font-bold" href="/">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <span className="text-base font-bold text-white">P</span>
            </div>
            Nook
          </Link>
          <div className="md:hidden">
            <button
              type="button"
              className="collapse-toggle btn btn-outline btn-secondary btn-square"
              data-collapse="#navbar-block-1"
              aria-controls="navbar-block-1"
              aria-label="Toggle navigation"
            >
              <span className="icon-[tabler--menu-2] collapse-open:hidden size-5.5"></span>
              <span className="icon-[tabler--x] collapse-open:block hidden size-5.5"></span>
            </button>
          </div>
        </div>

        <div
          id="navbar-block-1"
          className="md:navbar-end transition-height collapse hidden grow basis-full overflow-hidden duration-300 max-md:w-full"
        >
          <div className="text-base-content *:hover:text-primary *:active:text-primary flex gap-6 text-base font-medium max-md:mt-4 max-md:flex-col md:items-center">
            <Link href="/">Home</Link>
            <Link href="/features">Features</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/learn">Learn</Link>
            <Link href="/login" className="md:hidden">Sign in</Link>
          </div>

          <div className="divider md:divider-horizontal my-6 md:mx-6 md:my-2"></div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Link href="/login" className="btn btn-text max-md:btn-block max-md:hidden">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-gradient max-md:btn-block">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## components/marketing/PricingSection.tsx
```tsx
import Link from 'next/link'

export function PricingSection() {
  return (
    <div className="bg-base-200 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            Trust-first pricing that scales with you
          </h2>
          <p className="text-base-content/80 text-xl">
            No surprise tier jumps. No hard SKU cliffs. Start small and grow without penalties.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card card-border shadow-none">
            <div className="card-body gap-6">
              <div className="space-y-1">
                <h3 className="text-base-content text-xl font-semibold">Starter</h3>
                <p className="text-base-content/70">For solo operators &amp; small teams.</p>
              </div>
              <div className="text-base-content text-4xl font-semibold">
                $19 <span className="text-base-content/50 text-base font-normal">/month</span>
              </div>
              <ul className="space-y-3 text-base-content/80">
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Barcode scanning</li>
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Offline mobile mode</li>
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Low-stock alerts</li>
              </ul>
              <Link href="/signup" className="btn btn-primary btn-gradient">
                Start free trial
              </Link>
            </div>
          </div>

          <div className="card card-border shadow-none border-primary/40">
            <div className="card-body gap-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base-content text-xl font-semibold">Team</h3>
                  <span className="badge badge-primary badge-soft rounded-full">Most popular</span>
                </div>
                <p className="text-base-content/70">For teams who need accountability.</p>
              </div>
              <div className="text-base-content text-4xl font-semibold">
                $49 <span className="text-base-content/50 text-base font-normal">/month</span>
              </div>
              <ul className="space-y-3 text-base-content/80">
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Check-in / check-out workflow</li>
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Roles &amp; permissions</li>
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Audit trail</li>
              </ul>
              <Link href="/signup" className="btn btn-primary btn-gradient">
                Start free trial
              </Link>
            </div>
          </div>

          <div className="card card-border shadow-none">
            <div className="card-body gap-6">
              <div className="space-y-1">
                <h3 className="text-base-content text-xl font-semibold">Business</h3>
                <p className="text-base-content/70">For multi-location inventory operations.</p>
              </div>
              <div className="text-base-content text-4xl font-semibold">
                $99 <span className="text-base-content/50 text-base font-normal">/month</span>
              </div>
              <ul className="space-y-3 text-base-content/80">
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Multiple locations</li>
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Advanced reports</li>
                <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Priority support</li>
              </ul>
              <Link href="/signup" className="btn btn-primary btn-gradient">
                Start free trial
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/pricing" className="link link-primary link-animated text-lg font-medium">
            See full pricing details
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## components/marketing/TestimonialGrid.tsx
```tsx
const TESTIMONIALS = [
  {
    name: 'Warehouse Manager',
    title: 'Fewer count mistakes',
    quote:
      'We cut our monthly stock count time in half. Scanning + quick adjustments make discrepancies obvious, and the audit trail keeps everyone honest.',
  },
  {
    name: 'Small Business Owner',
    title: 'Finally predictable pricing',
    quote:
      'We outgrew spreadsheets fast, but other tools punished us for having more items. Nook stayed simple and the pricing didn’t spike.',
  },
  {
    name: 'Construction Ops',
    title: 'Tools stop “walking away”',
    quote:
      'Check-out to staff by scan changed everything. We know who has what, and returns don’t rely on memory anymore.',
  },
]

export function TestimonialGrid() {
  return (
    <div className="py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <p className="text-primary text-sm font-medium uppercase">Real teams</p>
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">Loved for speed and simplicity</h2>
          <p className="text-base-content/80 text-xl">Short feedback from people who manage inventory every day.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.title} className="card card-border shadow-none">
              <div className="card-body gap-5">
                <div className="flex gap-1">
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                </div>
                <p className="text-base-content/80">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <h3 className="text-base-content font-semibold">{t.title}</h3>
                  <p className="text-base-content/70 text-sm">{t.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## components/stock-count/shared/LiveProgressIndicator.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TeamMemberAvatar, TeamMemberAvatarGroup } from './TeamMemberAvatar'

interface TeamMemberProgress {
  id: string
  name: string | null
  countedItems: number
  lastActivity?: Date
}

interface LiveProgressIndicatorProps {
  stockCountId: string
  totalItems: number
  countedItems: number
  teamProgress?: TeamMemberProgress[]
  isLive?: boolean
  className?: string
}

export function LiveProgressIndicator({
  stockCountId,
  totalItems,
  countedItems,
  teamProgress = [],
  isLive = false,
  className,
}: LiveProgressIndicatorProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const percent = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0

  // Simulate live updates (in a real app, this would use Supabase Realtime)
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }

  // Get active counters (last activity within 5 minutes)
  const activeCounters = teamProgress.filter((tp) => {
    if (!tp.lastActivity) return false
    const fiveMinutesAgo = new Date(lastRefresh.getTime() - 5 * 60 * 1000)
    return new Date(tp.lastActivity) > fiveMinutesAgo
  })

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-neutral-500" />
          <h3 className="font-medium text-neutral-900">Team Progress</h3>
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'p-1.5 rounded-lg',
            'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
            'transition-colors duration-200',
            isRefreshing && 'animate-spin'
          )}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-neutral-500">Overall Progress</span>
          <span className="font-semibold text-neutral-900">
            {countedItems} of {totalItems}
          </span>
        </div>
        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              percent === 100 ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Active Counters */}
      {activeCounters.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-neutral-500 mb-2">Currently counting:</p>
          <div className="flex items-center gap-2">
            <TeamMemberAvatarGroup
              members={activeCounters.map((tc) => ({
                id: tc.id,
                name: tc.name,
              }))}
              size="sm"
            />
            <span className="text-sm text-neutral-600">
              {activeCounters.length} active
            </span>
          </div>
        </div>
      )}

      {/* Team Member Breakdown */}
      {teamProgress.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Individual progress:</p>
          {teamProgress.map((member) => {
            const memberPercent =
              totalItems > 0
                ? Math.round((member.countedItems / totalItems) * 100)
                : 0
            return (
              <div key={member.id} className="flex items-center gap-2">
                <TeamMemberAvatar name={member.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-neutral-700 truncate">
                      {member.name || 'Unknown'}
                    </span>
                    <span className="text-neutral-500 ml-2">
                      {member.countedItems} items
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all duration-300"
                      style={{ width: `${memberPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {teamProgress.length === 0 && (
        <div className="text-center py-4">
          <Users className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">
            No team members assigned yet
          </p>
        </div>
      )}

      {/* Last Updated */}
      <p className="text-xs text-neutral-400 mt-3 text-center">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </p>
    </div>
  )
}
```

## components/stock-count/unified/CompletionModal.tsx
```tsx
'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, X, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VarianceSummary {
  total: number
  short: number
  over: number
  netUnits: number
}

interface CompletionModalProps {
  open: boolean
  onClose: () => void
  onComplete: (applyAdjustments: boolean) => Promise<void>
  countedItems: number
  totalItems: number
  variances: VarianceSummary
}

export function CompletionModal({
  open,
  onClose,
  onComplete,
  countedItems,
  totalItems,
  variances,
}: CompletionModalProps) {
  const [applyAdjustments, setApplyAdjustments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const allCounted = countedItems === totalItems
  const hasVariances = variances.total > 0

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await onComplete(applyAdjustments)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full',
                hasVariances ? 'bg-amber-100' : 'bg-green-100'
              )}
            >
              {hasVariances ? (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-neutral-900 text-center mb-2">
            {allCounted ? 'Complete Stock Count' : 'Finish Early?'}
          </h2>

          {/* Description */}
          <p className="text-neutral-500 text-center mb-4">
            {!allCounted ? (
              <>
                You&apos;ve counted{' '}
                <span className="font-semibold text-neutral-700">
                  {countedItems} of {totalItems}
                </span>{' '}
                items. Uncounted items will remain unchanged.
              </>
            ) : hasVariances ? (
              <>
                Found{' '}
                <span className="font-semibold text-amber-700">
                  {variances.total} variance{variances.total !== 1 ? 's' : ''}
                </span>{' '}
                across your inventory.
              </>
            ) : (
              'All items match expected quantities. Great job!'
            )}
          </p>

          {/* Variance summary */}
          {hasVariances && (
            <div className="mb-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-red-600">-{variances.short}</p>
                  <p className="text-xs text-neutral-500">Short</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">+{variances.over}</p>
                  <p className="text-xs text-neutral-500">Over</p>
                </div>
                <div>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      variances.netUnits < 0 ? 'text-red-600' : variances.netUnits > 0 ? 'text-green-600' : 'text-neutral-600'
                    )}
                  >
                    {variances.netUnits > 0 ? '+' : ''}{variances.netUnits}
                  </p>
                  <p className="text-xs text-neutral-500">Net</p>
                </div>
              </div>
            </div>
          )}

          {/* Apply adjustments toggle */}
          {hasVariances && (
            <label className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer mb-4 hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={applyAdjustments}
                onChange={(e) => setApplyAdjustments(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <div>
                <p className="font-medium text-neutral-900 text-sm">
                  Apply adjustments to inventory
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Update actual quantities to match counted values
                </p>
              </div>
            </label>
          )}

          {/* Warning for adjustments */}
          {applyAdjustments && hasVariances && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Inventory quantities will be permanently updated. This cannot be undone.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : applyAdjustments ? (
                <Package className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {applyAdjustments ? 'Apply & Complete' : 'Complete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## eslint.config.mjs
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
    "public/workbox-*.js",
    "public/swe-worker-*.js",
    "supabase/functions/**",
  ]),
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      // Downgrade to warning: setState in useEffect is common for hydration patterns
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
```

## lib/marketing/jsonld.ts
```ts
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

export type FaqItem = { question: string; answer: string }

export function organizationJsonLd() {
  const siteUrl = getSiteUrl().toString()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nook',
    url: siteUrl,
  }
}

export function websiteJsonLd() {
  const siteUrl = getSiteUrl().toString()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nook',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl.replace(/\/$/, '')}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function softwareApplicationJsonLd({
  name,
  description,
  pathname,
}: {
  name: string
  description: string
  pathname: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: absoluteUrl(pathname),
  }
}

export function breadcrumbJsonLd(items: { name: string; pathname: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname),
    })),
  }
}

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function articleJsonLd({
  headline,
  description,
  pathname,
  datePublished,
  dateModified,
}: {
  headline: string
  description: string
  pathname: string
  datePublished: string
  dateModified?: string
}) {
  const url = absoluteUrl(pathname)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    mainEntityOfPage: url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { '@type': 'Organization', name: 'Nook' },
    publisher: { '@type': 'Organization', name: 'Nook' },
  }
}
```

## lib/marketing/metadata.ts
```ts
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site-url'

type MarketingMetadataInput = {
  title: string
  description: string
  pathname: string
  ogType?: 'website' | 'article'
}

export function marketingMetadata({
  title,
  description,
  pathname,
  ogType = 'website',
}: MarketingMetadataInput): Metadata {
  const canonical = absoluteUrl(pathname)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: 'Nook',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
```

## lib/site-url.ts
```ts
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return new URL(explicit)

  const vercel = process.env.VERCEL_URL
  if (vercel) return new URL(`https://${vercel}`)

  return new URL('http://localhost:3000')
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}
```

## next.config.ts
```ts
import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    // Avoid @rollup/plugin-terser worker threads during SW bundling.
    mode: process.env.WORKBOX_MODE ?? 'development',
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'supabase-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutes
          },
        },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  // Add empty turbopack config to satisfy Next.js 16
  turbopack: {},
  async redirects() {
    return [
      {
        source: '/marketing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/marketing/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withPWA(nextConfig)
```

## package.json
```json
{
  "name": "nook-master",
  "version": "0.1.0",
  "private": true,
    "scripts": {
      "dev": "NODE_ENV=development next dev",
    "build": "next build --webpack",
      "start": "next start",
      "lint": "eslint .",
      "test": "vitest",
      "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "dependencies": {
    "@ducanh2912/next-pwa": "^10.2.9",
    "@google/generative-ai": "^0.24.1",
    "@hookform/resolvers": "^3.9.1",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.47.10",
    "@tailwindcss/postcss": "^4.1.18",
    "browser-image-compression": "^2.0.2",
    "bwip-js": "^4.8.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "dexie": "^4.2.1",
    "flyonui": "^2.4.1",
    "html5-qrcode": "^2.3.8",
    "jspdf": "^3.0.4",
    "lucide-react": "^0.468.0",
    "next": "^16.0.10",
    "qrcode": "^1.5.4",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-hook-form": "^7.54.1",
    "read-excel-file": "^6.0.1",
    "recharts": "^3.6.0",
    "resend": "^6.6.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@types/node": "^22.10.2",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.2",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.17.0",
    "eslint-config-next": "^16.0.10",
    "jsdom": "^27.4.0",
    "lodash": "^4.17.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "5.9.3",
    "vite": "^7.3.0",
    "vitest": "^4.0.16"
  }
}
```

## types/database.types.augment.d.ts
```ts
import type { Enums, Tables } from './database.types'

declare module '@/types/database.types' {
  export type Profile = Tables<'profiles'>
  export type Folder = Tables<'folders'>
  export type InventoryItem = Tables<'inventory_items'>
  export type ActivityLog = Tables<'activity_logs'>
  export type Notification = Tables<'notifications'>
  export type CustomFieldDefinition = Tables<'custom_field_definitions'>
  export type Tag = Tables<'tags'>
  export type Vendor = Tables<'vendors'>
  export type Tenant = Tables<'tenants'>
  export type Alert = Tables<'alerts'>
  export type Location = Tables<'locations'>
  export type Job = Tables<'jobs'>

  export type InventoryItemWithTags = Tables<'items_with_tags'>
  export type TagListItem = Pick<Tag, 'id' | 'name' | 'color'>

  export type ItemCondition = Enums<'item_condition'>
  export type LocationType = Enums<'location_type'>
  export type ComparisonOperator = Enums<'comparison_operator_enum'>
  export type ReminderType = Enums<'reminder_type_enum'>
  export type ReminderRecurrence = Enums<'reminder_recurrence_enum'>
  export type ReminderStatus = Enums<'reminder_status_enum'>

  export type ItemTrackingMode = 'none' | 'serialized' | 'lot_expiry'

  export type PurchaseOrder = Tables<'purchase_orders'>
  export type PickList = Tables<'pick_lists'>

  export type PurchaseOrderWithRelations = PurchaseOrder & {
    vendors?: Pick<Vendor, 'id' | 'name'> | null
    created_by_profile?: Pick<Profile, 'id' | 'full_name'> | null
    submitted_by_profile?: Pick<Profile, 'id' | 'full_name'> | null
  }

  export type PickListWithRelations = PickList & {
    assigned_to_profile?: Pick<Profile, 'id' | 'full_name'> | null
    created_by_profile?: Pick<Profile, 'id' | 'full_name'> | null
  }

  export interface ItemReminderWithDetails {
    id: string
    source_type: 'item' | 'folder'
    item_id: string | null
    folder_id: string | null
    item_name: string | null
    folder_name: string | null
    reminder_type: ReminderType
    title: string | null
    message: string | null
    threshold: number | null
    comparison_operator: ComparisonOperator | null
    days_before_expiry: number | null
    scheduled_at: string | null
    recurrence: ReminderRecurrence | null
    recurrence_end_date: string | null
    notify_in_app: boolean
    notify_email: boolean
    notify_user_ids: string[] | null
    status: ReminderStatus
    last_triggered_at: string | null
    next_trigger_at: string | null
    trigger_count: number | null
    trigger_description: string
    created_at: string
    updated_at: string | null
    created_by: string
    created_by_name: string | null
  }

  export interface CreateReminderInput {
    itemId: string
    reminderType: ReminderType
    title?: string
    message?: string
    threshold?: number
    daysBeforeExpiry?: number
    scheduledAt?: string
    recurrence?: ReminderRecurrence
    recurrenceEndDate?: string
    notifyInApp?: boolean
    notifyEmail?: boolean
    notifyUserIds?: string[]
    comparisonOperator?: ComparisonOperator
  }
}
```

## types/flyonui-runtime.d.ts
```ts
declare module 'flyonui/dist/index.mjs' {
  export const HSCollapse:
    | {
        autoInit?: () => void
      }
    | undefined
  export const HSAccordion:
    | {
        autoInit?: () => void
      }
    | undefined
  export const HSDropdown:
    | {
        autoInit?: () => void
      }
    | undefined
  export const HSCarousel:
    | {
        autoInit?: () => void
      }
    | undefined
  export const HSTabs:
    | {
        autoInit?: () => void
      }
    | undefined
  export const HSTooltip:
    | {
        autoInit?: () => void
      }
    | undefined
}
```
