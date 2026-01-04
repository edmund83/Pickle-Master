'use client'

import type { FaqItem } from '@/lib/marketing/jsonld'
import { DEFAULT_FAQS } from '@/lib/marketing/faqs'
import { FadeIn } from './animations'

export function FaqBlock({ items = DEFAULT_FAQS }: { items?: FaqItem[] }) {
  return (
    <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            Need help? We&apos;ve got answers
          </h2>
          <p className="text-base-content/80 text-xl">
            Common questions about scanning, offline mode, pricing, and migration.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
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
        </FadeIn>
      </div>
    </div>
  )
}
