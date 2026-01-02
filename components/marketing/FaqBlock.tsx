import type { FaqItem } from '@/lib/marketing/jsonld'

export const DEFAULT_FAQS: FaqItem[] = [
  {
    question: 'Do you work with barcodes and QR codes?',
    answer:
      'Yes. You can scan with a phone camera or compatible Bluetooth scanners. Use barcodes or QR codes depending on your labels and workflow.',
  },
  {
    question: 'Will it work when my team has no internet?',
    answer:
      'Yes. Pickle is built for offline-first mobile workflows. You can keep scanning and updating, then sync when you’re back online.',
  },
  {
    question: 'Can I migrate from Sortly?',
    answer:
      'Yes. Import via CSV and we’ll help map fields, folders/locations, tags, and custom data so you can go live quickly.',
  },
  {
    question: 'Do you have surprise pricing jumps or SKU cliffs?',
    answer:
      'No. Pricing is designed to be predictable so you can grow your catalog without suddenly being forced into an expensive tier.',
  },
]

export function FaqBlock({ items = DEFAULT_FAQS }: { items?: FaqItem[] }) {
  return (
    <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            Need help? We&apos;ve got answers
          </h2>
          <p className="text-base-content/80 text-xl">
            Common questions about scanning, offline mode, pricing, and migration.
          </p>
        </div>

        <div className="accordion divide-neutral/20 w-full divide-y">
          {items.map((faq, index) => {
            const id = `faq-${index + 1}`
            const contentId = `${id}-collapse`
            const isActive = index === 0

            return (
              <div key={faq.question} className={`accordion-item${isActive ? ' active' : ''}`} id={id}>
                <button
                  className="accordion-toggle inline-flex items-center justify-between text-start"
                  aria-controls={contentId}
                  aria-expanded="false"
                >
                  {faq.question}
                  <span className="icon-[tabler--plus] accordion-item-active:hidden text-base-content block size-4.5 shrink-0"></span>
                  <span className="icon-[tabler--minus] accordion-item-active:block text-base-content hidden size-4.5 shrink-0"></span>
                </button>
                <div
                  id={contentId}
                  className={`accordion-content transition-height w-full overflow-hidden duration-300${isActive ? '' : ' hidden'}`}
                  aria-labelledby={id}
                  role="region"
                >
                  <div className="px-5 pb-4">
                    <p className="text-base-content/80">{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
