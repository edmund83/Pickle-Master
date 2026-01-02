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
    'Security-first inventory software for small teams. Learn how Pickle protects tenant data with row-level security, role-based access, and audit trails.',
  pathname: '/security',
})

const SECURITY_FAQS: FaqItem[] = [
  {
    question: 'How is tenant data isolated?',
    answer:
      'Pickle uses strict database row-level security (RLS) so tenants cannot access each other’s data at the database layer.',
  },
  {
    question: 'Do you support roles and permissions?',
    answer:
      'Yes. Pickle supports role-based access control (RBAC) so teams can limit who can edit, delete, or manage settings.',
  },
  {
    question: 'Do you keep an audit trail?',
    answer:
      'Yes. Pickle tracks inventory movements and key changes so you can see who did what, when, and why.',
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
          name: 'Pickle Inventory',
          description: 'Multi-tenant inventory management with barcode scanning and tenant isolation.',
          pathname: '/security',
        })}
      />
      <JsonLd data={faqPageJsonLd(SECURITY_FAQS)} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-base-content text-3xl font-semibold md:text-4xl">Security</h1>
        <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
          Inventory is trust. Pickle is built with tenant isolation, access control, and auditability so small teams can
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
            You shouldn&apos;t need an IT team to run inventory correctly. Pickle focuses on the basics that prevent real
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

