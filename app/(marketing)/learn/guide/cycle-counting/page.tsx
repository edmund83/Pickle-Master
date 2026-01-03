/**
 * Cycle Counting Guide - Educational Guide Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (guide hero with badge)
 * - Features: /marketing-ui/features/features-8 (benefits cards)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ)
 *
 * Primary keyword: "cycle counting"
 * Secondary keywords: "cycle count inventory", "cycle counting best practices", "inventory cycle count"
 * Est. volume: 185+ monthly
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'Cycle Counting | Complete Guide to Inventory Cycle Counts',
  description:
    'Learn cycle counting best practices for inventory management. Understand when to count, how to prioritize items, and how to implement an effective cycle counting program.',
  pathname: '/learn/guide/cycle-counting',
  ogType: 'article',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is cycle counting?',
    answer:
      'Cycle counting is an inventory auditing method where you count a small subset of inventory on a regular schedule, rather than shutting down to count everything at once. Over time, all inventory gets counted, but operations continue uninterrupted.',
  },
  {
    question: 'How is cycle counting different from physical inventory?',
    answer:
      'Physical inventory (wall-to-wall count) counts everything at once, usually requiring a shutdown. Cycle counting counts portions continuously throughout the year. Cycle counting is less disruptive, catches errors faster, and maintains ongoing accuracy.',
  },
  {
    question: 'How often should I cycle count?',
    answer:
      'It depends on your item classification. A-items (high value/volume) should be counted weekly or monthly. B-items quarterly. C-items (low value/volume) once or twice a year. The goal is to count all items at least once per year, with important items counted more frequently.',
  },
  {
    question: 'How many items should I count per cycle?',
    answer:
      'Count enough items daily or weekly to cover all inventory over your desired period. If you have 1,000 SKUs and want to count everything quarterly, count about 80 items per week (1,000 ÷ 12 weeks ≈ 84). Adjust for item priority.',
  },
  {
    question: 'What causes inventory count discrepancies?',
    answer:
      'Common causes include: receiving errors (wrong quantities), picking/shipping mistakes, theft or damage, returns not processed correctly, data entry errors, and items in wrong locations. Cycle counting helps identify which issues are most frequent.',
  },
  {
    question: 'What is ABC analysis for cycle counting?',
    answer:
      'ABC analysis classifies items by value/importance: A-items (top 20% by value, ~80% of total value) get counted most frequently. B-items (next 30%) moderately. C-items (bottom 50%) least frequently. This focuses counting effort where it matters most.',
  },
  {
    question: 'Should I count at random or by location?',
    answer:
      'Both methods work. Random counting covers all items unpredictably (good for catching fraud). Location-based counting is efficient for large warehouses (count one aisle at a time). Many businesses combine both approaches.',
  },
  {
    question: 'What is an acceptable inventory accuracy rate?',
    answer:
      'Most businesses target 95-99% accuracy. World-class operations achieve 99.5%+. If you are below 90%, cycle counting is essential to improve. Track your accuracy rate over time to measure improvement.',
  },
]

export default function CycleCountingGuidePage() {
  const published = '2026-01-03'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'Cycle Counting Guide', pathname: '/learn/guide/cycle-counting' },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          headline: 'Cycle Counting: Complete Guide to Inventory Cycle Counts',
          description:
            'A practical guide to implementing cycle counting for inventory management. Learn how to prioritize items, schedule counts, and maintain inventory accuracy without shutdowns.',
          pathname: '/learn/guide/cycle-counting',
          datePublished: published,
          dateModified: published,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      {/* ===== HERO SECTION ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl">
          <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">
            Inventory Guide
          </span>
          <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Cycle Counting: The Smarter Way to Audit Inventory
          </h1>
          <p className="text-base-content/80 mt-4 text-lg md:text-xl">
            Stop shutting down for annual physical inventory counts. Cycle counting lets you maintain accurate inventory
            counts throughout the year by counting small portions on a regular schedule—without disrupting operations.
          </p>
          <p className="text-base-content/60 mt-4 text-sm">Last updated: {published}</p>
        </div>
      </section>

      {/* ===== WHAT IS CYCLE COUNTING ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">What Is Cycle Counting?</h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-center text-lg">
            A continuous approach to inventory auditing that replaces disruptive annual counts.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="text-error flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--x] size-5"></span>
                  Traditional Physical Inventory
                </h3>
                <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-2 text-sm">
                  <li>Count everything at once</li>
                  <li>Requires shutdown or overtime</li>
                  <li>Errors discovered months later</li>
                  <li>Exhausting for staff</li>
                  <li>Accuracy degrades until next count</li>
                  <li>Usually annual (or dreaded more often)</li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="text-success flex items-center gap-2 font-semibold">
                  <span className="icon-[tabler--check] size-5"></span>
                  Cycle Counting
                </h3>
                <ul className="text-base-content/80 mt-4 list-inside list-disc space-y-2 text-sm">
                  <li>Count a portion at a time</li>
                  <li>Operations continue normally</li>
                  <li>Errors caught quickly</li>
                  <li>Manageable daily routine</li>
                  <li>Maintains ongoing accuracy</li>
                  <li>All items covered over time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">Benefits of Cycle Counting</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Why successful businesses prefer cycle counting over annual physical counts.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card card-border">
              <div className="card-body">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--clock-play] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 font-semibold">No Shutdowns</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Count during normal hours without stopping operations. No overtime, no lost sales, no disruption to
                  customers.
                </p>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--zoom-check] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 font-semibold">Catch Errors Early</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Discover discrepancies when they happen, not months later. Identify root causes while details are
                  fresh.
                </p>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="bg-info/10 text-info flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--chart-line] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 font-semibold">Continuous Improvement</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Track accuracy trends over time. See which products, locations, or processes cause the most
                  discrepancies.
                </p>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="bg-warning/10 text-warning flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--users] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 font-semibold">Manageable Workload</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Counting a few items daily is easier than counting everything at once. Staff can fit it into their
                  routine.
                </p>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="bg-secondary/10 text-secondary flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--target-arrow] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 font-semibold">Focus on What Matters</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Count high-value items more frequently. Spend less time on items that rarely cause issues.
                </p>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-xl">
                  <span className="icon-[tabler--shield-check] size-7"></span>
                </div>
                <h3 className="text-base-content mt-4 font-semibold">Audit-Ready</h3>
                <p className="text-base-content/80 mt-2 text-sm">
                  Demonstrate inventory control to auditors with documented, regular counts. Meet compliance
                  requirements easily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABC ANALYSIS SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Prioritize with ABC Analysis
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            Not all items need the same counting frequency. Use the 80/20 rule to focus effort.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="text-primary text-3xl font-bold">A</div>
                <h3 className="text-base-content mt-2 font-semibold">High-Value Items</h3>
                <p className="text-base-content/60 text-sm">Top 20% by value (~80% of total value)</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/80 text-sm">Count frequency</span>
                    <span className="badge badge-primary">Weekly/Monthly</span>
                  </div>
                  <p className="text-base-content/80 text-sm">
                    Your most valuable items. A 1% error here costs more than 10% error on C-items. Count often.
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="text-secondary text-3xl font-bold">B</div>
                <h3 className="text-base-content mt-2 font-semibold">Medium-Value Items</h3>
                <p className="text-base-content/60 text-sm">Next 30% by value (~15% of total value)</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/80 text-sm">Count frequency</span>
                    <span className="badge badge-secondary">Monthly/Quarterly</span>
                  </div>
                  <p className="text-base-content/80 text-sm">
                    Important but not critical. Balance counting effort with value at risk.
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="text-base-content/60 text-3xl font-bold">C</div>
                <h3 className="text-base-content mt-2 font-semibold">Low-Value Items</h3>
                <p className="text-base-content/60 text-sm">Bottom 50% by value (~5% of total value)</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/80 text-sm">Count frequency</span>
                    <span className="badge badge-neutral">Quarterly/Annual</span>
                  </div>
                  <p className="text-base-content/80 text-sm">
                    Low-cost items where errors matter less. Still count periodically to maintain overall accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COUNTING METHODS ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Cycle Counting Methods</h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            Choose a method that fits your operations. Many businesses combine approaches.
          </p>

          <div className="mt-10 space-y-6">
            {/* Method 1 */}
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">ABC-Based Counting</h3>
                <p className="text-base-content/80 mt-2">
                  Count items based on their ABC classification. A-items get counted most frequently, C-items least.
                  This is the most common approach.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-soft badge-success">Best for value optimization</span>
                  <span className="badge badge-soft badge-info">Most popular method</span>
                </div>
              </div>
            </div>

            {/* Method 2 */}
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Location-Based Counting</h3>
                <p className="text-base-content/80 mt-2">
                  Count all items in a specific location (aisle, shelf, zone) before moving to the next. Efficient for
                  large warehouses where counters can work systematically.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-soft badge-success">Best for large facilities</span>
                  <span className="badge badge-soft badge-info">Minimizes walking</span>
                </div>
              </div>
            </div>

            {/* Method 3 */}
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Random Sampling</h3>
                <p className="text-base-content/80 mt-2">
                  Select items randomly for counting. Helps detect patterns of theft or fraud because it is
                  unpredictable. Good for compliance and audit purposes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-soft badge-success">Best for fraud detection</span>
                  <span className="badge badge-soft badge-info">Audit-friendly</span>
                </div>
              </div>
            </div>

            {/* Method 4 */}
            <div className="card card-border">
              <div className="card-body">
                <h3 className="text-base-content text-lg font-semibold">Opportunity-Based Counting</h3>
                <p className="text-base-content/80 mt-2">
                  Count items when they reach zero or when you interact with them (picking, receiving). Takes advantage
                  of natural touchpoints without scheduling separate counts.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-soft badge-success">Best for busy operations</span>
                  <span className="badge badge-soft badge-info">No extra scheduling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPLEMENTATION STEPS ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Implementing Cycle Counting
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            Start small and build the habit. A consistent routine beats an ambitious plan you cannot maintain.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                1
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Classify Your Inventory (ABC)</h3>
                <p className="text-base-content/80 mt-1">
                  Sort items by annual value (units sold × cost). Top 20% = A, next 30% = B, bottom 50% = C. This
                  determines counting priority.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                2
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Set Counting Frequencies</h3>
                <p className="text-base-content/80 mt-1">
                  Decide how often to count each class. Example: A-items monthly (12×/year), B-items quarterly
                  (4×/year), C-items annually (1×/year).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                3
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Create a Schedule</h3>
                <p className="text-base-content/80 mt-1">
                  Break it down daily or weekly. If you have 100 A-items to count monthly, that is about 5 items per
                  workday. Assign specific times (e.g., first 30 minutes of day).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                4
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Assign Responsibility</h3>
                <p className="text-base-content/80 mt-1">
                  Designate who does the counting. Rotating responsibility helps catch issues different eyes might see.
                  Make it part of someone&apos;s job, not an afterthought.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                5
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Document and Investigate</h3>
                <p className="text-base-content/80 mt-1">
                  Record counts and variances. When discrepancies occur, investigate the cause—do not just adjust the
                  number. Look for patterns (certain products, locations, or shifts).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                6
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Track Accuracy Metrics</h3>
                <p className="text-base-content/80 mt-1">
                  Measure inventory accuracy rate over time. Target 95%+ for most businesses, 99%+ for high-performing
                  operations. Use trends to focus improvement efforts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BEST PRACTICES ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Cycle Counting Best Practices
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Count During Quiet Periods</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Count when items are not moving—start of day, after receiving is complete, or end of day. Avoid
                      counting while orders are being picked.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Use Blind Counts</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Do not show counters the expected quantity. Let them count first, then compare. This prevents
                      bias and catches real discrepancies.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Recount Large Variances</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      If variance exceeds threshold (e.g., 5%), have a second person recount before adjusting. This
                      catches counting errors vs. actual discrepancies.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Use Barcode Scanning</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Scan items to ensure you are counting the right product. Eliminates look-alike mistakes and
                      speeds up data entry.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Check All Locations</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Items may be in multiple locations (main shelf, overflow, damaged goods). Count all locations
                      where the item exists.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-border">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--check] text-success mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Investigate Root Causes</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Every discrepancy has a cause. Receiving error? Picking mistake? Damage not recorded? Fix the
                      process, not just the number.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-base-100 border-primary/20 border p-8 shadow-sm sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Cycle Count with Nook
                </h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  Nook makes cycle counting simple with mobile scanning, variance tracking, and adjustment history. Know
                  your accuracy rate and identify problem areas.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Mobile cycle count sheets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Barcode scanning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Variance reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Adjustment audit trail</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                  Start Free Trial
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/templates/cycle-count-sheet" className="btn btn-outline btn-secondary btn-lg">
                  Download Template
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED GUIDES ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold">Related Content</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/learn/glossary/80-20-inventory-rule"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">80/20 Inventory Rule</h3>
                <p className="text-base-content/80 text-sm">The foundation of ABC analysis.</p>
              </div>
            </Link>
            <Link
              href="/learn/guide/how-to-set-up-barcode-system"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Barcode System Setup</h3>
                <p className="text-base-content/80 text-sm">Speed up counts with scanning.</p>
              </div>
            </Link>
            <Link
              href="/learn/templates/cycle-count-sheet"
              className="card card-border shadow-none transition-colors hover:border-primary/30"
            >
              <div className="card-body">
                <h3 className="text-base-content font-semibold">Cycle Count Template</h3>
                <p className="text-base-content/80 text-sm">Free printable count sheet.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <FaqBlock items={FAQS} />
    </div>
  )
}
