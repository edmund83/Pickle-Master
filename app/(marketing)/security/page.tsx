/**
 * Security & Data Protection Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "inventory software security"
 * Secondary keywords: "data protection", "audit trail", "role-based access"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Security | Data Protection & Access Control for Inventory',
  description:
    'Inventory software security you can trust. Row-level tenant isolation, role-based access control, full audit trails, and data export — no IT team required.',
  pathname: '/security',
})

const SECURITY_FAQS: FaqItem[] = [
  {
    question: 'How is tenant data isolated?',
    answer:
      'Nook uses strict database row-level security (RLS) enforced at the database layer, not just application logic. Each tenant can only access their own data, and this is enforced on every query.',
  },
  {
    question: 'Do you support roles and permissions?',
    answer:
      'Yes. Nook supports role-based access control (RBAC) with Admin, Manager, and Staff roles. Each role has specific permissions so you can control who can edit, delete, or manage settings.',
  },
  {
    question: 'Do you keep an audit trail?',
    answer:
      'Yes. Every inventory movement, adjustment, and key action is logged with who did it, what changed, when it happened, and why (if a reason was provided). You can review the full history anytime.',
  },
  {
    question: 'Can we export our data?',
    answer:
      'Yes. Data ownership matters. You can export your inventory, movement history, and reports as CSV at any time. You are never locked in.',
  },
  {
    question: 'Is data encrypted?',
    answer:
      'Yes. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Your inventory data is protected whether it is moving or stored.',
  },
  {
    question: 'Where is data stored?',
    answer:
      'Nook runs on Supabase infrastructure with data stored in secure, SOC 2 Type II compliant data centers. We use reputable cloud providers with strong security track records.',
  },
  {
    question: 'Do you have a privacy policy?',
    answer:
      'Yes. Our privacy policy explains exactly what data we collect, how we use it, and your rights. We collect only what is necessary to provide the service.',
  },
  {
    question: 'Can I restrict access to specific locations?',
    answer:
      'Yes. Location-scoped access lets you restrict team members to specific warehouses or locations. They only see inventory in the locations you assign.',
  },
]

const SECURITY_FEATURES = [
  {
    icon: 'icon-[tabler--shield-lock]',
    title: 'Row-level security',
    description: 'Tenant isolation enforced at the database layer. Every query is filtered to only return data belonging to your organization.',
  },
  {
    icon: 'icon-[tabler--user-shield]',
    title: 'Role-based access',
    description: 'Admin, Manager, and Staff roles with granular permissions. Control who can edit inventory, manage settings, or delete items.',
  },
  {
    icon: 'icon-[tabler--history]',
    title: 'Complete audit trail',
    description: 'Every inventory change is logged with who, what, when, and why. Review the full history of any item or location.',
  },
  {
    icon: 'icon-[tabler--lock]',
    title: 'Encryption everywhere',
    description: 'TLS 1.2+ for data in transit, AES-256 for data at rest. Your inventory data is protected at every stage.',
  },
  {
    icon: 'icon-[tabler--map-pin]',
    title: 'Location-scoped access',
    description: 'Restrict team members to specific warehouses or locations. They only see what you allow.',
  },
  {
    icon: 'icon-[tabler--download]',
    title: 'Data portability',
    description: 'Export your data anytime as CSV. You own your data and can take it with you if you leave.',
  },
]

const TRUST_SIGNALS = [
  {
    icon: 'icon-[tabler--certificate]',
    title: 'SOC 2 compliant infrastructure',
    description: 'Nook runs on Supabase, which maintains SOC 2 Type II compliance for its infrastructure.',
  },
  {
    icon: 'icon-[tabler--cloud-lock]',
    title: 'Secure cloud hosting',
    description: 'Hosted in reputable data centers with physical security, redundancy, and disaster recovery.',
  },
  {
    icon: 'icon-[tabler--refresh]',
    title: 'Regular backups',
    description: 'Automated daily backups with point-in-time recovery capability for disaster scenarios.',
  },
]

const ACCESS_CONTROL_TABLE = [
  { action: 'View inventory', admin: true, manager: true, staff: true },
  { action: 'Edit item quantities', admin: true, manager: true, staff: true },
  { action: 'Create new items', admin: true, manager: true, staff: false },
  { action: 'Delete items', admin: true, manager: false, staff: false },
  { action: 'Manage locations', admin: true, manager: true, staff: false },
  { action: 'Manage team members', admin: true, manager: false, staff: false },
  { action: 'View audit trail', admin: true, manager: true, staff: false },
  { action: 'Export data', admin: true, manager: true, staff: false },
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
          description: 'Secure inventory management with tenant isolation, audit trails, and role-based access.',
          pathname: '/security',
        })}
      />
      <JsonLd data={faqPageJsonLd(SECURITY_FAQS)} />

      {/* Hero Section - hero-12 pattern */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge badge-soft badge-primary rounded-full font-medium uppercase">Security</p>
            <h1 className="text-base-content mt-4 text-3xl font-semibold md:text-4xl">
              Inventory software security your team can trust
            </h1>
            <p className="text-base-content/80 mt-3 max-w-3xl text-lg">
              Inventory is trust. Nook is built with tenant isolation, role-based access, and complete audit trails
              so your team can move fast without losing confidence in your data.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
              Request Demo
            </Link>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TRUST_SIGNALS.map((signal) => (
            <div key={signal.title} className="card card-border shadow-none">
              <div className="card-body">
                <span className={`${signal.icon} text-primary size-8`}></span>
                <h2 className="text-base-content mt-4 text-lg font-semibold">{signal.title}</h2>
                <p className="text-base-content/80 mt-2">{signal.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Security Features Section - features-8 pattern */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Security built in, not bolted on</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Every security feature is designed for small teams who need protection without complexity.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY_FEATURES.map((feature) => (
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

        {/* Role Permissions Table */}
        <div className="mt-16 rounded-box bg-base-200 p-6 sm:p-8">
          <h2 className="text-base-content text-xl font-semibold sm:text-2xl">Role-based permissions</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Control exactly what each team member can do. Default roles cover most use cases, and you can customize as
            needed.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Action</th>
                  <th className="text-base-content text-center">Admin</th>
                  <th className="text-base-content text-center">Manager</th>
                  <th className="text-base-content text-center">Staff</th>
                </tr>
              </thead>
              <tbody>
                {ACCESS_CONTROL_TABLE.map((row) => (
                  <tr key={row.action}>
                    <td className="text-base-content/80">{row.action}</td>
                    <td className="text-center">
                      {row.admin ? (
                        <span className="icon-[tabler--circle-check] text-success size-5"></span>
                      ) : (
                        <span className="icon-[tabler--x] text-base-content/40 size-5"></span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.manager ? (
                        <span className="icon-[tabler--circle-check] text-success size-5"></span>
                      ) : (
                        <span className="icon-[tabler--x] text-base-content/40 size-5"></span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.staff ? (
                        <span className="icon-[tabler--circle-check] text-success size-5"></span>
                      ) : (
                        <span className="icon-[tabler--x] text-base-content/40 size-5"></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail Section */}
        <div className="mt-16">
          <h2 className="text-base-content text-2xl font-semibold">Complete audit trail</h2>
          <p className="text-base-content/80 mt-2 max-w-3xl">
            Every inventory change is logged automatically. No guesswork when you need to answer &quot;what happened?&quot;
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card card-border shadow-none">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">What gets logged</h3>
                <ul className="text-base-content/80 mt-4 space-y-2">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Quantity changes (add, remove, adjust)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Location transfers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Check-in/check-out events</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>Item creation and deletion</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--circle-check] text-success size-5 shrink-0"></span>
                    <span>User and permission changes</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card card-border shadow-none">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">What you can see</h3>
                <ul className="text-base-content/80 mt-4 space-y-2">
                  <li className="flex gap-2">
                    <span className="icon-[tabler--user] text-primary size-5 shrink-0"></span>
                    <span>Who made the change (user name/email)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--clock] text-primary size-5 shrink-0"></span>
                    <span>When it happened (timestamp)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--arrows-exchange] text-primary size-5 shrink-0"></span>
                    <span>What changed (before/after values)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--message] text-primary size-5 shrink-0"></span>
                    <span>Why (reason code or note, if provided)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="icon-[tabler--device-mobile] text-primary size-5 shrink-0"></span>
                    <span>How (web, mobile, API)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section - cta-4 pattern */}
        <div className="mt-16 rounded-box bg-base-200 p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base-content text-2xl font-semibold">Security should be simple</h2>
              <p className="text-base-content/80 mt-3 max-w-2xl">
                You should not need an IT team to run inventory securely. Nook focuses on the basics that prevent
                real problems: tenant isolation, access control, and an audit trail your team can understand.
              </p>
              <ul className="text-base-content/80 mt-6 space-y-3">
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Row-level security enforced at database layer
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Role-based access out of the box
                </li>
                <li className="flex gap-2">
                  <span className="icon-[tabler--circle-check] text-success size-5"></span>
                  Full audit trail for accountability
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-16">
          <h2 className="text-base-content text-xl font-semibold">Related resources</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Link href="/features" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--list-check] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">All features</h3>
                <p className="text-base-content/80 mt-2">
                  See everything Nook offers for inventory management.
                </p>
              </div>
            </Link>
            <Link href="/pricing" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--currency-dollar] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Pricing</h3>
                <p className="text-base-content/80 mt-2">
                  Transparent, predictable pricing for teams of any size.
                </p>
              </div>
            </Link>
            <Link href="/demo" className="card card-border shadow-none hover:border-primary/30 transition-colors">
              <div className="card-body">
                <span className="icon-[tabler--player-play] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Request demo</h3>
                <p className="text-base-content/80 mt-2">
                  See Nook in action with a personalized walkthrough.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <FaqBlock items={SECURITY_FAQS} />
    </div>
  )
}
