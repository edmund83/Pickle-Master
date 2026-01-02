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
          name: 'Pickle Inventory',
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
          Spreadsheets are fast — until they break trust. Pickle keeps speed while adding preview and undo so your team
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

