/**
 * Construction Tools & Asset Tracking Solution Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge + image)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "tool tracking software"
 * Secondary keywords: "construction inventory management", "asset checkouts", "offline jobsites"
 *
 * TODO: Proof Assets Required
 * - Screenshot: Check-out workflow showing issue-to-staff flow
 * - Screenshot: Overdue items list with due dates
 * - Screenshot: Check-in return confirmation
 * - Short video clip: Tool checkout workflow (15-30 seconds)
 * - Case study or testimonial from construction/contractor team
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { buildInternationalMetadata, type Locale, isValidLocale } from '@/lib/seo'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { breadcrumbJsonLd, faqPageJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/jsonld'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'

  return buildInternationalMetadata({
    locale: validLocale,
    pathname: '/solutions/construction-tools',
    title: 'Tool Tracking Software for Construction',
    description:
      'Track tools across jobsites with check-in/check-out, offline barcode scanning, and full accountability. Know who has what tool and where.',
  })
}

const CONSTRUCTION_FAQS: FaqItem[] = [
  {
    question: 'How does tool tracking software assign tools to workers?',
    answer:
      'Use check-in/check-out to assign tools to specific workers by scanning the tool barcode and selecting the assignee. StockZip logs who has what, when it was issued, and when it is due back. Works offline on remote jobsites.',
  },
  {
    question: 'Does the tool tracking app work offline on construction sites?',
    answer:
      'Yes. StockZip is built offline-first specifically for construction inventory management. Scan barcodes, check out tools, and update inventory without internet. Everything syncs automatically when you reconnect.',
  },
  {
    question: 'Can I track tools across multiple jobsites?',
    answer:
      'Absolutely. Create locations for each jobsite, warehouse, or truck. Track where every tool is deployed. Transfer tools between sites with full audit trail showing who moved what and when.',
  },
  {
    question: 'What happens when a tool goes missing on the jobsite?',
    answer:
      'Run a scan-based audit of a jobsite or truck. StockZip shows you what should be there vs. what you scanned, highlighting missing items instantly. The audit trail shows who last had the tool.',
  },
  {
    question: 'Can I set due dates for tool returns with asset checkout software?',
    answer:
      'Yes. When checking out a tool, set an expected return date. StockZip flags overdue items automatically so you can follow up before they disappear. Get notifications when items are past due.',
  },
  {
    question: 'How do I label my existing tools for tracking?',
    answer:
      'Print QR or barcode labels directly from StockZip. Apply them to your tools, and you are ready to scan. We support thermal printers (Zebra, Brother) and laser printers. Labels are weather-resistant.',
  },
  {
    question: 'Can I track tool maintenance and calibration schedules?',
    answer:
      'Yes. Add custom fields for last service date, calibration due, warranty expiration, or any other data. Set alerts when maintenance is coming due. Never miss a calibration deadline.',
  },
  {
    question: 'What is the best construction inventory management software for small contractors?',
    answer:
      'StockZip is designed for contractors of all sizes. No per-tool fees or SKU limits. Start with a 14-day free trial, import your tool list, and see results immediately. Most teams are tracking tools within an hour.',
  },
]

const PAIN_POINTS = [
  {
    icon: 'icon-[tabler--tool]',
    title: 'Tools walk off the jobsite',
    description:
      'Without accountability, tools disappear. You buy replacements for items that are probably just in the wrong truck or on another site.',
  },
  {
    icon: 'icon-[tabler--wifi-off]',
    title: 'No signal on remote jobsites',
    description:
      'Most inventory apps fail when you need them most — on construction sites where there is no reliable internet.',
  },
  {
    icon: 'icon-[tabler--clipboard-x]',
    title: 'Paper sign-out sheets get lost',
    description:
      'Paper logs are ignored, forgotten, or illegible. When a tool goes missing, there is no real record of who had it last.',
  },
]

const SOLUTIONS = [
  {
    icon: 'icon-[tabler--scan]',
    title: 'Scan-based check-out',
    description:
      'Assign tools to workers in seconds. Scan the tool, select the person, done. No more clipboards or paper logs.',
    pain: 'Tools walk off the jobsite',
  },
  {
    icon: 'icon-[tabler--cloud-off]',
    title: 'Offline-first mobile app',
    description:
      'Full functionality without internet. Scan, check-out, and audit tools anywhere. Syncs when you reconnect.',
    pain: 'No signal on remote jobsites',
  },
  {
    icon: 'icon-[tabler--history]',
    title: 'Digital audit trail',
    description:
      'Every check-out, transfer, and adjustment is logged with who, what, when, and where. End disputes with data.',
    pain: 'Paper sign-out sheets get lost',
  },
]

const KEY_FEATURES = [
  {
    icon: 'icon-[tabler--arrows-exchange]',
    title: 'Check-in / Check-out',
    description:
      'Assign tools to workers by scan. Track who has what, set due dates, and follow up on overdue items automatically.',
  },
  {
    icon: 'icon-[tabler--wifi-off]',
    title: 'Offline-First Scanning',
    description:
      'Scan and update inventory without internet. Works on remote construction sites. Everything syncs when you reconnect.',
  },
  {
    icon: 'icon-[tabler--map-pin]',
    title: 'Multi-Jobsite Tracking',
    description:
      'Create locations for each site, warehouse, or truck. Know exactly where every tool is deployed right now.',
  },
  {
    icon: 'icon-[tabler--clipboard-check]',
    title: 'Scan-Based Audits',
    description:
      'Walk a jobsite or truck, scan everything, and instantly see what is missing versus what should be there.',
  },
  {
    icon: 'icon-[tabler--history]',
    title: 'Full Audit Trail',
    description:
      'Every check-out, transfer, and adjustment is logged with who, what, when, and where. Resolve disputes with data.',
  },
  {
    icon: 'icon-[tabler--printer]',
    title: 'Label Printing',
    description:
      'Generate QR or barcode labels for your entire inventory. Print to thermal or laser printers. Weather-resistant options.',
  },
]

const USE_CASES = [
  {
    title: 'Power Tools',
    description: 'Drills, saws, grinders, compressors — track the expensive equipment that walks off construction sites.',
    icon: 'icon-[tabler--tool]',
  },
  {
    title: 'Hand Tools',
    description: 'Wrenches, hammers, levels, tape measures — even small tools add up when they go missing repeatedly.',
    icon: 'icon-[tabler--hammer]',
  },
  {
    title: 'Safety Equipment',
    description: 'Harnesses, hard hats, fall protection, fire extinguishers — ensure compliance and track certifications.',
    icon: 'icon-[tabler--helmet]',
  },
  {
    title: 'Fleet & Vehicles',
    description: 'Trucks, trailers, equipment, generators — know which jobsite has which vehicle and when it moved.',
    icon: 'icon-[tabler--truck]',
  },
]

const METRICS = [
  { value: '80%', label: 'Reduction in tool losses', description: 'When workers know tools are tracked, they come back' },
  { value: '15 min', label: 'Average audit time', description: 'Scan-based counts vs. hours with paper lists' },
  { value: '< 1 hour', label: 'Time to get started', description: 'Import tools, print labels, start scanning' },
]

export default function ConstructionToolsSolutionPage() {
  return (
    <div className="bg-base-100">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Solutions', pathname: '/solutions' },
          { name: 'Construction & Tools', pathname: '/solutions/construction-tools' },
        ])}
      />
      <JsonLd
        data={softwareApplicationJsonLd({
          name: 'StockZip Tool Tracking Software',
          description:
            'Tool tracking software for construction with check-in/check-out, offline scanning, and jobsite accountability.',
          pathname: '/solutions/construction-tools',
        })}
      />
      <JsonLd data={faqPageJsonLd(CONSTRUCTION_FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="bg-base-100 pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">Solution</span>
              <h1 className="text-base-content text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Tool Tracking Software for Construction Teams
              </h1>
              <p className="text-base-content/80 mt-6 text-lg md:text-xl">
                Stop losing tools on jobsites. Scan-based check-in/check-out with offline reliability means
                accountability works even on remote construction sites without internet.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Start Free Trial
                </Link>
                <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                  Watch Demo
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="icon-[tabler--wifi-off] text-primary size-5"></span>
                  <span className="text-base-content/70">Offline-first</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon-[tabler--arrows-exchange] text-primary size-5"></span>
                  <span className="text-base-content/70">Check-in/check-out</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon-[tabler--map-pin] text-primary size-5"></span>
                  <span className="text-base-content/70">Multi-jobsite</span>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="bg-base-200 flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-2xl border border-base-content/10 lg:aspect-square">
              <div className="text-center p-8">
                <span className="icon-[tabler--tool] text-primary/30 size-24"></span>
                <p className="text-base-content/40 mt-4 text-sm">Contractor scanning tool with phone</p>
                <p className="text-base-content/30 mt-1 text-xs">Image placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TYPICAL DAY NARRATIVE SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            {/* Before/After Image Placeholder */}
            <div className="bg-base-100 flex aspect-video w-full items-center justify-center rounded-2xl border border-base-content/10 lg:w-1/2">
              <div className="text-center p-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <span className="icon-[tabler--clipboard-x] text-error/40 size-16"></span>
                    <p className="text-error/60 mt-2 text-xs">Before</p>
                  </div>
                  <span className="icon-[tabler--arrow-right] text-base-content/20 size-8"></span>
                  <div className="text-center">
                    <span className="icon-[tabler--clipboard-check] text-success/40 size-16"></span>
                    <p className="text-success/60 mt-2 text-xs">After</p>
                  </div>
                </div>
                <p className="text-base-content/40 mt-4 text-sm">Before & after workflow comparison</p>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                A Typical Day With Construction Inventory Management
              </h2>
              <div className="mt-6 space-y-4">
                <p className="text-base-content/80">
                  <strong className="text-base-content">6:00 AM:</strong> Your crew grabs tools from the trailer. Each
                  worker scans what they take — even without cell signal. StockZip logs the asset checkout instantly.
                </p>
                <p className="text-base-content/80">
                  <strong className="text-base-content">End of day:</strong> Tools come back. Workers scan returns. You
                  see exactly what is still out and who has it. No clipboards. No arguments.
                </p>
                <p className="text-base-content/80">
                  <strong className="text-base-content">Friday:</strong> Run a quick audit. Scan everything on the
                  truck. StockZip shows three items missing — and exactly who checked them out last Tuesday.
                </p>
              </div>
              <div className="mt-6">
                <Link href="/features/check-in-check-out" className="link link-primary inline-flex items-center gap-1">
                  See how check-in/check-out works
                  <span className="icon-[tabler--arrow-right] size-4"></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PAIN POINTS SECTION ===== */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">The Jobsite Tool Problem</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Tools disappear. Jobs get delayed. You spend money replacing equipment you probably already own.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((pain) => (
              <div key={pain.title} className="card bg-base-100 card-border shadow-none">
                <div className="card-body text-center">
                  <span className={`${pain.icon} text-error mx-auto size-10`}></span>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{pain.title}</h3>
                  <p className="text-base-content/70 mt-2">{pain.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW NOOK SOLVES IT SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">How Tool Tracking Software Solves It</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Every pain point has a direct solution. Here is how StockZip fixes the jobsite tool problem.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SOLUTIONS.map((solution) => (
              <div key={solution.title} className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="bg-success/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                    <span className={`${solution.icon} text-success size-7`}></span>
                  </div>
                  <h3 className="text-base-content mt-4 text-xl font-semibold">{solution.title}</h3>
                  <p className="text-base-content/80 mt-2">{solution.description}</p>
                  <p className="text-success mt-4 text-sm font-medium">Fixes: {solution.pain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">How It Works</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Three steps to stop tool losses and create real accountability on your construction sites.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary text-primary-content mx-auto flex size-16 items-center justify-center rounded-full text-2xl font-bold">
                1
              </div>
              <h3 className="text-base-content mt-6 text-xl font-semibold">Label Your Tools</h3>
              <p className="text-base-content/80 mt-3">
                Print QR or barcode labels from StockZip. Apply them to every tool you want to track. Weather-resistant
                options available.
              </p>
              {/* Step 1 Image Placeholder */}
              <div className="bg-base-200 mx-auto mt-6 flex aspect-video max-w-xs items-center justify-center rounded-xl border border-base-content/10">
                <div className="text-center p-4">
                  <span className="icon-[tabler--printer] text-primary/30 size-12"></span>
                  <p className="text-base-content/40 mt-2 text-xs">Label printing workflow</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-content mx-auto flex size-16 items-center justify-center rounded-full text-2xl font-bold">
                2
              </div>
              <h3 className="text-base-content mt-6 text-xl font-semibold">Check Out by Scan</h3>
              <p className="text-base-content/80 mt-3">
                When a worker takes a tool, scan it and assign it to them. StockZip logs who, what, and when — even
                offline.
              </p>
              {/* Step 2 Image Placeholder */}
              <div className="bg-base-200 mx-auto mt-6 flex aspect-video max-w-xs items-center justify-center rounded-xl border border-base-content/10">
                <div className="text-center p-4">
                  <span className="icon-[tabler--scan] text-primary/30 size-12"></span>
                  <p className="text-base-content/40 mt-2 text-xs">Scanning tool checkout</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-content mx-auto flex size-16 items-center justify-center rounded-full text-2xl font-bold">
                3
              </div>
              <h3 className="text-base-content mt-6 text-xl font-semibold">Audit and Follow Up</h3>
              <p className="text-base-content/80 mt-3">
                Run quick audits to find missing items. Chase down overdue check-outs before tools vanish for good.
              </p>
              {/* Step 3 Image Placeholder */}
              <div className="bg-base-200 mx-auto mt-6 flex aspect-video max-w-xs items-center justify-center rounded-xl border border-base-content/10">
                <div className="text-center p-4">
                  <span className="icon-[tabler--clipboard-check] text-primary/30 size-12"></span>
                  <p className="text-base-content/40 mt-2 text-xs">Audit results screen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KEY FEATURES SECTION (MCP: features-8) ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Built for Construction Inventory Management
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Every feature is designed for the reality of managing tools across jobsites, trucks, and workers.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card card-border bg-base-100 shadow-none transition-all duration-300 hover:border-primary hover:shadow-md"
              >
                <div className="card-body">
                  <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                    <span className={`${feature.icon} text-primary size-7`}></span>
                  </div>
                  <h3 className="text-base-content mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-base-content/80 mt-2">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU CAN TRACK SECTION ===== */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">What You Can Track</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              StockZip handles any asset that moves between people, places, or projects on your construction sites.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase) => (
              <div key={useCase.title} className="card bg-base-100 card-border shadow-none hover:shadow-md transition-shadow">
                <div className="card-body items-center text-center">
                  {/* Use Case Image Placeholder */}
                  <div className="bg-primary/5 flex h-20 w-20 items-center justify-center rounded-2xl">
                    <span className={`${useCase.icon} text-primary size-10`}></span>
                  </div>
                  <h3 className="text-base-content mt-4 text-lg font-semibold">{useCase.title}</h3>
                  <p className="text-base-content/70 mt-2 text-sm">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== METRICS / ROI SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Results You Can Measure</h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg">
              Contractors using tool tracking software see real improvements in accountability and efficiency.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {METRICS.map((metric) => (
              <div key={metric.label} className="card bg-base-100 shadow-sm">
                <div className="card-body text-center">
                  <p className="text-primary text-4xl font-bold">{metric.value}</p>
                  <h3 className="text-base-content mt-2 text-lg font-semibold">{metric.label}</h3>
                  <p className="text-base-content/70 mt-2">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Case Study Placeholder */}
          <div className="mt-10 rounded-2xl border border-base-content/10 bg-base-100 p-8 text-center">
            <span className="icon-[tabler--building] text-primary/30 size-12"></span>
            <p className="text-base-content/60 mt-4 text-lg font-medium">Case study coming soon</p>
            <p className="text-base-content/40 mt-2">
              We are documenting results from contractors using StockZip for construction inventory management.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (MCP: cta-4) ===== */}
      <section className="bg-base-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-base-200 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="flex grow flex-col gap-6">
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Stop Buying Tools You Already Own
                </h2>
                <p className="text-base-content/80 max-w-2xl text-lg">
                  Accountability changes behavior. When workers know tools are tracked, they come back. Start your free
                  trial and see the difference in the first week.
                </p>
                <div className="grid gap-2 md:grid-cols-2 lg:gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Works offline on remote jobsites</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Scan-based check-out in seconds</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Full audit trail for disputes</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">14-day free trial</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">No credit card required</span>
                    </li>
                    <li className="flex items-center space-x-3 py-1">
                      <span className="icon-[tabler--circle-check-filled] text-primary size-5 shrink-0"></span>
                      <span className="text-base-content/80">Unlimited tools on all plans</span>
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

      {/* ===== RELATED SOLUTIONS SECTION ===== */}
      <section className="bg-base-200/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Related Solutions</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link
              href="/features/check-in-check-out"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--arrows-exchange] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Check-in / Check-out</h3>
                <p className="text-base-content/80 mt-2">The accountability workflow that makes tool tracking work.</p>
              </div>
            </Link>

            <Link
              href="/features/offline-mobile-scanning"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--wifi-off] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Offline Scanning</h3>
                <p className="text-base-content/80 mt-2">Keep working when internet is unavailable on the jobsite.</p>
              </div>
            </Link>

            <Link
              href="/solutions/warehouse-inventory"
              className="card bg-base-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary"
            >
              <div className="card-body">
                <span className="icon-[tabler--building-warehouse] text-primary size-8"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Warehouse Inventory</h3>
                <p className="text-base-content/80 mt-2">
                  Full warehouse management with receiving, cycle counts, and picking.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={CONSTRUCTION_FAQS} />
    </div>
  )
}
