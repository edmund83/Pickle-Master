/**
 * How to Set Reorder Points - Educational Guide Page
 * Built from FlyonUI MCP templates:
 * - Hero: /marketing-ui/hero/hero-12 (business SaaS hero with badge)
 * - Features: /marketing-ui/features/features-8 (feature cards with icons)
 * - CTA: /marketing-ui/cta/cta-4 (benefits checklist with dual CTA)
 * - FAQ: /marketing-ui/faq/faq-1 (collapsible FAQ accordion)
 *
 * Primary keyword: "reorder points" / "how to set reorder points"
 * Secondary keywords: reorder point formula, low stock alerts, safety stock calculation, inventory reorder level
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqBlock } from '@/components/marketing/FaqBlock'
import { JsonLd } from '@/components/marketing/JsonLd'
import { marketingMetadata } from '@/lib/marketing/metadata'
import type { FaqItem } from '@/lib/marketing/jsonld'
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/marketing/jsonld'

export const metadata: Metadata = marketingMetadata({
  title: 'How to Set Reorder Points and Low Stock Alerts | Complete Guide',
  description:
    'Learn how to calculate reorder points and set up low stock alerts to prevent stockouts. Includes the reorder point formula, safety stock calculation, and best practices for small businesses.',
  pathname: '/learn/guide/how-to-set-reorder-points',
  ogType: 'article',
})

const FAQS: FaqItem[] = [
  {
    question: 'What is a reorder point?',
    answer:
      'A reorder point is the inventory level at which you should place a new order with your supplier. When stock drops to this level, you trigger a reorder to avoid running out before the next shipment arrives. It accounts for lead time and includes a safety buffer for unexpected demand.',
  },
  {
    question: 'How do I calculate a reorder point?',
    answer:
      'Use the formula: Reorder Point = (Average Daily Sales × Lead Time) + Safety Stock. For example, if you sell 10 units/day, lead time is 7 days, and safety stock is 20 units, your reorder point is (10 × 7) + 20 = 90 units. When inventory hits 90, place your order.',
  },
  {
    question: 'What is safety stock and how much do I need?',
    answer:
      "Safety stock is extra inventory you keep as a buffer against unexpected demand spikes or supplier delays. A simple starting point is 1-2 weeks of average sales. Increase for critical items where stockouts hurt badly, decrease for low-value items that are easy to rush-order.",
  },
  {
    question: 'Should I set reorder points for every item?',
    answer:
      'Start with your top movers and critical items — the products that matter most to your revenue and customers. If an item sells rarely or is easy to restock quickly, you may not need a formal reorder point. Prioritize items where stockouts cause real pain.',
  },
  {
    question: 'How often should I review and update reorder points?',
    answer:
      "Review quarterly or when demand patterns change significantly. Seasonal items may need adjustments before peak periods. If you're regularly stocking out (reorder point too low) or holding too much inventory (reorder point too high), it's time to recalculate.",
  },
  {
    question: 'What is the difference between reorder point and reorder quantity?',
    answer:
      'Reorder point tells you WHEN to order — the inventory level that triggers a purchase. Reorder quantity (also called Economic Order Quantity or EOQ) tells you HOW MUCH to order. Both work together: when stock hits the reorder point, you order the reorder quantity.',
  },
]

export default function HowToSetReorderPointsPage() {
  const published = '2026-01-02'

  return (
    <div className="bg-base-100 pt-28 md:pt-32">
      {/* JSON-LD Structured Data */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', pathname: '/' },
          { name: 'Learn', pathname: '/learn' },
          { name: 'How to Set Reorder Points', pathname: '/learn/guide/how-to-set-reorder-points' },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          headline: 'How to Set Reorder Points and Low Stock Alerts',
          description:
            'A practical guide for small businesses: calculate reorder points, set safety stock levels, and configure low stock alerts to prevent stockouts.',
          pathname: '/learn/guide/how-to-set-reorder-points',
          datePublished: published,
          dateModified: published,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQS)} />

      {/* ===== HERO SECTION (MCP: hero-12) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl">
          <span className="badge badge-soft badge-primary mb-4 rounded-full font-medium uppercase">
            Inventory Guide
          </span>
          <h1 className="text-base-content text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            How to Set Reorder Points and Low Stock Alerts
          </h1>
          <p className="text-base-content/80 mt-4 text-lg md:text-xl">
            Stockouts cost you sales, customer trust, and scrambling time. Learn how to calculate reorder points and
            set up alerts so you order at the right time — not too early (tying up cash) and not too late (running
            out).
          </p>
          <p className="text-base-content/60 mt-4 text-sm">Last updated: {published}</p>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Why Reorder Points Matter for Your Business
            </h2>
            <p className="text-base-content/80 mx-auto mt-4 max-w-3xl text-lg">
              Without proper reorder points, you&apos;re either stocking out or tying up cash in excess inventory.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--shopping-cart-off] text-error mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Stockouts Kill Sales</h3>
                <p className="text-base-content/70 mt-2">
                  When you run out, customers go elsewhere. Repeat customers become one-time customers. Revenue
                  disappears.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--coins] text-warning mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Overstock Ties Up Cash</h3>
                <p className="text-base-content/70 mt-2">
                  Ordering too early or too much means money sitting on shelves instead of working for your business.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body text-center">
                <span className="icon-[tabler--clock-exclamation] text-info mx-auto size-10"></span>
                <h3 className="text-base-content mt-4 text-lg font-semibold">Guessing Wastes Time</h3>
                <p className="text-base-content/70 mt-2">
                  Without data-driven reorder points, you&apos;re constantly checking stock levels and making
                  last-minute orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REORDER POINT FORMULA SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            The Reorder Point Formula
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            A simple calculation that tells you exactly when to reorder.
          </p>

          <div className="mt-10 rounded-box bg-primary/5 border-primary/20 border p-8 text-center">
            <p className="text-base-content font-mono text-xl font-semibold md:text-2xl">
              Reorder Point = (Average Daily Sales × Lead Time) + Safety Stock
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-base-content">Variable</th>
                  <th className="text-base-content">What It Means</th>
                  <th className="text-base-content">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-base-content font-medium">Average Daily Sales</td>
                  <td className="text-base-content/80">How many units you sell per day on average</td>
                  <td className="text-base-content/80">10 units/day</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Lead Time</td>
                  <td className="text-base-content/80">Days from ordering to receiving inventory</td>
                  <td className="text-base-content/80">7 days</td>
                </tr>
                <tr>
                  <td className="text-base-content font-medium">Safety Stock</td>
                  <td className="text-base-content/80">Buffer for demand spikes or supplier delays</td>
                  <td className="text-base-content/80">20 units</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="text-base-content font-semibold">Reorder Point</td>
                  <td className="text-base-content/80">When to place the order</td>
                  <td className="text-base-content font-semibold">(10 × 7) + 20 = 90 units</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card card-border mt-8 shadow-none">
            <div className="card-body">
              <h3 className="text-base-content text-lg font-semibold">Real-World Example</h3>
              <p className="text-base-content/80 mt-2">
                You sell an average of <strong>10 units per day</strong> of Widget A. Your supplier takes{' '}
                <strong>7 days</strong> to deliver. You want <strong>20 units of safety stock</strong> as a buffer.
              </p>
              <p className="text-base-content/80 mt-3">
                <strong>Reorder Point = (10 × 7) + 20 = 90 units</strong>
              </p>
              <p className="text-base-content/80 mt-3">
                When your inventory of Widget A drops to 90 units, place your order. During the 7-day lead time,
                you&apos;ll sell approximately 70 units, leaving you with your 20-unit safety buffer when the shipment
                arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SAFETY STOCK SECTION (MCP: features-8 pattern) ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">How to Calculate Safety Stock</h2>
            <p className="text-base-content/80 mt-4 text-lg">
              Safety stock protects you from uncertainty. Here&apos;s a practical approach for small businesses.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-primary bg-primary/10 rounded-field size-12">
                    <span className="icon-[tabler--number-1] size-7"></span>
                  </div>
                </div>
                <h3 className="text-base-content font-semibold">Start with 1-2 Weeks</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Begin with 1-2 weeks of average sales as your safety stock baseline. This covers most normal
                  variations.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-success bg-success/10 rounded-field size-12">
                    <span className="icon-[tabler--arrow-up] size-7"></span>
                  </div>
                </div>
                <h3 className="text-base-content font-semibold">Increase for Critical Items</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Add more buffer for items where stockouts hurt badly — your top sellers, seasonal products, or items
                  with unreliable suppliers.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-warning bg-warning/10 rounded-field size-12">
                    <span className="icon-[tabler--arrow-down] size-7"></span>
                  </div>
                </div>
                <h3 className="text-base-content font-semibold">Decrease for Low-Value</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  Reduce safety stock for items that are easy to rush-order, have multiple suppliers, or don&apos;t
                  significantly impact revenue if temporarily out.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="avatar avatar-placeholder mb-2">
                  <div className="text-info bg-info/10 rounded-field size-12">
                    <span className="icon-[tabler--refresh] size-7"></span>
                  </div>
                </div>
                <h3 className="text-base-content font-semibold">Adjust Based on Experience</h3>
                <p className="text-base-content/70 mt-2 text-sm">
                  If you&apos;re regularly stocking out, add more buffer. If you always have excess when orders arrive,
                  reduce it. Let data guide you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SETTING UP ALERTS SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">
            Setting Up Low Stock Alerts
          </h2>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-center text-lg">
            Once you have reorder points calculated, configure your inventory software to alert you automatically.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                1
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Set the Minimum Stock Level</h3>
                <p className="text-base-content/80 mt-1">
                  Enter your calculated reorder point as the minimum stock level for each key item. This is the
                  threshold that triggers alerts.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                2
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Enable Notifications</h3>
                <p className="text-base-content/80 mt-1">
                  Turn on email, SMS, or in-app notifications so you get alerted immediately when stock drops below the
                  threshold.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                3
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Review the Low Stock Report</h3>
                <p className="text-base-content/80 mt-1">
                  Check the low stock report regularly — daily or weekly depending on your sales volume. This gives you
                  a consolidated view of everything that needs reordering.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-content flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                4
              </div>
              <div>
                <h3 className="text-base-content text-lg font-semibold">Act on Alerts Promptly</h3>
                <p className="text-base-content/80 mt-1">
                  The whole point of reorder points is early warning. When you get an alert, act on it — place the
                  order before you run out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMON MISTAKES SECTION ===== */}
      <section className="bg-base-200 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base-content text-center text-2xl font-semibold md:text-3xl">Common Mistakes to Avoid</h2>
          <p className="text-base-content/80 mt-4 text-center text-lg">
            Even simple reorder point systems can fail if you make these errors.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Setting Once and Forgetting</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Demand changes. Suppliers change lead times. Review reorder points quarterly or when you notice
                      issues.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Ignoring Lead Time Variability</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Different suppliers have different lead times. Account for this when calculating reorder points
                      for each item.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Same Safety Stock for All Items</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      A critical top-seller needs more buffer than a slow-moving accessory. Adjust safety stock based on
                      item importance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <span className="icon-[tabler--x] text-error mt-1 size-5 shrink-0"></span>
                  <div>
                    <h3 className="text-base-content font-semibold">Not Accounting for Seasonality</h3>
                    <p className="text-base-content/70 mt-1 text-sm">
                      Holiday rushes, summer slowdowns — seasonal items need adjusted reorder points before peak
                      periods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (MCP: cta-4) ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-box bg-primary/5 border-primary/20 border p-8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
                  Let StockZip Handle Your Reorder Alerts
                </h2>
                <p className="text-base-content/80 mt-4 max-w-2xl text-lg">
                  StockZip makes it easy to set minimum stock levels and get notified before you run out. See what needs
                  attention at a glance with the low stock report.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Set min/max thresholds per item</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Email and in-app notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Low stock report dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="icon-[tabler--check] text-success size-5"></span>
                    <span className="text-base-content/80">Track supplier lead times</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/features/low-stock-alerts" className="btn btn-primary btn-gradient btn-lg">
                  Learn About Alerts
                  <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
                </Link>
                <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION (MCP: faq-1) ===== */}
      <FaqBlock items={FAQS} />
    </div>
  )
}
