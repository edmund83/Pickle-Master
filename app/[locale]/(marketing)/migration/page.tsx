import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import { breadcrumbJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/migration',
    title: 'Migration',
    description:
      'Migration guides and checklists to help you move inventory data quickly and confidently.',
  })
}

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
          name: 'StockZip Inventory',
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
          <div className="card card-border shadow-none">
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">CSV migration checklist</h2>
                <span className="badge badge-primary badge-soft rounded-full">Recommended</span>
              </div>
              <p className="text-base-content/80">
                Export your catalog to CSV, map fields, import into StockZip, then run a scan-first verification count.
              </p>
              <span className="text-base-content/60 mt-2 text-sm">
                Need help with mapping or cleanup? Request a demo for guided migration support.
              </span>
            </div>
          </div>

          <div className="card card-border shadow-none border-base-content/10">
            <div className="card-body">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base-content text-xl font-semibold">Templates &amp; field mapping</h2>
                <span className="badge badge-outline badge-secondary rounded-full">Included</span>
              </div>
              <p className="text-base-content/80">
                StockZip supports CSV import with field mapping, so you can match your existing columns to the right
                fields.
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
            <Link href="/demo" className="btn btn-primary btn-lg">
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
