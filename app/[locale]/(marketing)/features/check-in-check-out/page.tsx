/**
 * Check-In / Check-Out Feature Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "asset check-out software"
 * Secondary keywords: "tool checkout system", "equipment check-in check-out tracking"
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import { breadcrumbJsonLd, softwareApplicationJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/features/check-in-check-out',
    title: 'Asset Check-Out Software | Tool & Equipment Checkout Tracking',
    description:
      'Issue tools and assets to staff with scan-based check-in/check-out and a clear audit trail. Know who has what, when it left, and when it came back.',
  })
}

const faqs = [
  {
    question: 'How does the check-out process work?',
    answer:
      'Select a team member from your roster, scan the item barcode or QR code, and confirm. The item is now assigned to that person with a timestamp. The entire process takes about 3 seconds per item.',
  },
  {
    question: 'Can team members check out items themselves?',
    answer:
      'Yes! Team members can self-service check out items using the mobile app. They scan their employee badge or log in, then scan the items they need. Managers can configure which items require approval and which allow self-checkout.',
  },
  {
    question: 'How do I see who has which items?',
    answer:
      'The Assignments view shows all currently checked-out items grouped by person. You can also search for any item to see its current assignment and full custody history. Filter by department, location, or date range.',
  },
  {
    question: 'What happens if someone forgets to check in an item?',
    answer:
      'StockZip can send automatic reminders for overdue items. Configure reminder schedules per item category — daily reminders for high-value tools, weekly for general equipment. Escalate to managers after a set period.',
  },
  {
    question: 'Can I track check-outs across multiple locations?',
    answer:
      'Absolutely. Multi-location support is built in. Track equipment pools at each site, transfer items between locations, and view consolidated reports across your entire organization.',
  },
  {
    question: 'Does this work for consumable items too?',
    answer:
      'Yes, but we recommend using quantity adjustments for consumables instead. Check-in/check-out is designed for reusable assets where you need to know who has the item. Consumables are better tracked with stock levels and usage logs.',
  },
  {
    question: 'Can I see the full history of an asset?',
    answer:
      'Every asset has a complete custody chain: who checked it out, when, for how long, and any notes or condition updates. This audit trail is permanent and cannot be edited — perfect for compliance and dispute resolution.',
  },
  {
    question: 'How do I handle damaged or missing items during check-in?',
    answer:
      'During check-in, team members can flag items as damaged, missing, or requiring maintenance. Attach photos and notes documenting the condition. Managers receive alerts and can route items to repair or write-off.',
  },
]

export default function CheckInCheckOutFeaturePage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Features', pathname: '/features' },
          { name: 'Check-In / Check-Out', pathname: '/features/check-in-check-out' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Inventory - Check-In/Check-Out',
          description:
            'Asset check-out software for tracking tool and equipment assignments. Scan-based checkout with complete audit trails.',
          pathname: '/features/check-in-check-out',
        })}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      {/* Hero Section - Based on /marketing-ui/hero/hero-12 */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="badge badge-soft badge-primary mb-4 rounded-full">Feature</span>
            <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Asset Check-Out Software That Creates Accountability
            </h1>
            <p className="text-base-content/80 mt-6 max-w-3xl text-lg md:text-xl">
              Issue tools, equipment, or assets to staff by scan. Track who has what, when it left, and when it came
              back — without paperwork or spreadsheets.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Tools disappear. Disputes start. Nobody knows who had it last.
            </h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Expensive equipment walks off. Sign-out sheets get lost. &quot;I thought you had it&quot; becomes a daily
              conversation. Without a system, you are guessing — and losing money on tools and equipment that never come
              back.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section - Based on /marketing-ui/features/features-8 */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Scan-Based Checkout in 3 Seconds
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Fast enough that your team will actually use it. Simple enough that no training is needed.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--user-check] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">1. Select Person</h3>
                <p className="text-base-content/80 mt-2">
                  Pick from your team roster, scan an employee badge, or let team members self-identify via the app.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--scan] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">2. Scan Item</h3>
                <p className="text-base-content/80 mt-2">
                  Scan the barcode or QR code on the tool or equipment. Batch scan multiple items in one session.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <span className="icon-[tabler--check] text-primary size-8"></span>
                </div>
                <h3 className="text-base-content mt-4 text-xl font-semibold">3. Done</h3>
                <p className="text-base-content/80 mt-2">
                  Item is assigned with timestamp and user. Full custody chain tracked automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Complete Asset Accountability
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Everything you need to track equipment assignments and stop losses.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--history] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Complete Audit Trail</h3>
                <p className="text-base-content/80 mt-1">
                  Every assignment logged with timestamp, user, and device. Immutable history for compliance.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--bell] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Overdue Reminders</h3>
                <p className="text-base-content/80 mt-1">
                  Automatic reminders when items are not returned on time. Escalate to managers after set periods.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--camera] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Condition Documentation</h3>
                <p className="text-base-content/80 mt-1">
                  Attach photos on check-out and check-in. Document condition changes and damage.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--users] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Self-Service Checkout</h3>
                <p className="text-base-content/80 mt-1">
                  Let team members check out items themselves. Configure approval requirements by category.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--building] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Multi-Location Support</h3>
                <p className="text-base-content/80 mt-1">
                  Track equipment pools at each site. Transfer items between locations with full tracking.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <span className="icon-[tabler--report] text-primary size-6"></span>
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Utilization Reports</h3>
                <p className="text-base-content/80 mt-1">
                  See which assets are used most, sitting idle, or frequently assigned to specific people.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Built for Teams That Share Equipment
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Any industry where assets move between people benefits from check-in/check-out tracking.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--hammer] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">Construction Tools</h3>
                <p className="text-base-content/80 mt-2">
                  Track power tools, hand tools, and equipment across job sites. Know which crew has what.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Job site assignment tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Tool crib management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Loss prevention</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--device-laptop] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">IT Equipment</h3>
                <p className="text-base-content/80 mt-2">
                  Issue laptops, monitors, and peripherals to employees. Track the complete asset lifecycle.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Employee onboarding kits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Offboarding return tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Loaner equipment pools</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--video] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">AV & Production Gear</h3>
                <p className="text-base-content/80 mt-2">
                  Manage cameras, lighting, audio equipment, and production kits for shoots and events.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Project-based assignments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Kit composition tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Rental/billing integration</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--stethoscope] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">Medical Equipment</h3>
                <p className="text-base-content/80 mt-2">
                  Track diagnostic equipment, patient monitors, and shared medical devices across departments.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Department assignments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Sterilization tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Compliance documentation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--key] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">Keys & Access Cards</h3>
                <p className="text-base-content/80 mt-2">
                  Issue and track physical keys, access cards, and security badges with full audit trails.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Key assignment tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Access level documentation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Security audit reports</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 card-border shadow-sm">
              <div className="card-body">
                <span className="icon-[tabler--briefcase] text-primary size-10"></span>
                <h3 className="text-base-content mt-3 text-lg font-semibold">Field Service Kits</h3>
                <p className="text-base-content/80 mt-2">
                  Assign field service kits, tool bags, and equipment cases to technicians by route.
                </p>
                <ul className="text-base-content/80 mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Vehicle inventory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Kit restocking alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--circle-check-filled] text-primary size-4"></span>
                    <span>Technician accountability</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Based on /marketing-ui/cta/cta-4 */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-base-100 rounded-3xl p-8 shadow-sm sm:p-12 lg:p-16">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex grow flex-col gap-6">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Stop losing equipment to the &quot;nobody knows&quot; problem
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">3-second scan-based checkout</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Complete custody chain</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Overdue reminders</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Photo documentation</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Self-service checkout</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Multi-location support</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">14-day free trial</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">No credit card required</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 max-sm:w-full max-sm:flex-col">
                  <Link href="/signup" className="btn btn-primary">
                    Start Free Trial
                  </Link>
                  <Link href="/pricing" className="btn btn-outline btn-secondary">
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Related Features</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link href="/features/barcode-scanning" className="card bg-base-100 card-border shadow-sm hover:shadow-md">
              <div className="card-body">
                <span className="icon-[tabler--scan] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Barcode Scanning</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Scan any barcode or QR code with your phone or Bluetooth scanner.
                </p>
              </div>
            </Link>

            <Link
              href="/features/offline-mobile-scanning"
              className="card bg-base-100 card-border shadow-sm hover:shadow-md"
            >
              <div className="card-body">
                <span className="icon-[tabler--wifi-off] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Offline Mode</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Check out equipment even without internet. Sync when connected.
                </p>
              </div>
            </Link>

            <Link
              href="/solutions/construction-tools"
              className="card bg-base-100 card-border shadow-sm hover:shadow-md"
            >
              <div className="card-body">
                <span className="icon-[tabler--hammer] text-primary size-8"></span>
                <h3 className="text-base-content mt-2 text-lg font-semibold">Construction Tools</h3>
                <p className="text-base-content/80 mt-1 text-sm">
                  Purpose-built inventory for construction tool tracking.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section - Based on /marketing-ui/faq/faq-1 */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Frequently Asked Questions About Check-In/Check-Out
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Everything you need to know about asset checkout tracking in StockZip.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="accordion divide-base-content/10 divide-y" data-accordion="default-open">
              {faqs.map((faq, index) => (
                <div key={index} className="accordion-item" id={`faq-${index}`}>
                  <button
                    className="accordion-toggle inline-flex w-full items-center justify-between gap-4 py-5 text-start font-medium"
                    aria-controls={`faq-content-${index}`}
                    aria-expanded={index === 0 ? 'true' : 'false'}
                  >
                    <span className="text-base-content">{faq.question}</span>
                    <span className="icon-[tabler--chevron-down] text-base-content/60 accordion-icon size-5 shrink-0 transition-transform"></span>
                  </button>
                  <div
                    id={`faq-content-${index}`}
                    className="accordion-content w-full overflow-hidden transition-[height] duration-300"
                    role="region"
                    aria-labelledby={`faq-${index}`}
                  >
                    <p className="text-base-content/80 pb-5">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Know Who Has What, Always
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Start tracking equipment assignments today. No spreadsheets, no sign-out sheets, no guessing.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
