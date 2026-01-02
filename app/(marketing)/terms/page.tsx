import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import { breadcrumbJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Terms of service',
  description:
    'Terms of service for Pickle Inventory. Service rules, acceptable use, and customer responsibilities.',
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
              You agree to use Pickle lawfully and not to attempt to access other tenants’ data.
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
