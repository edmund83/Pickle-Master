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
