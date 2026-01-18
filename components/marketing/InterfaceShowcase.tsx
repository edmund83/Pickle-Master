'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ANIMATION_CONFIG } from '@/lib/marketing/animations'

export function InterfaceShowcase() {
  const prefersReducedMotion = useReducedMotion()

  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.slow,
        ease: ANIMATION_CONFIG.ease.default,
      },
    },
  }

  // Browser frame content - shared between animated and static versions
  const BrowserFrame = () => (
    <div className="relative mx-auto shadow-2xl rounded-xl overflow-hidden">
      {/* Browser Chrome / Window Frame */}
      <div className="bg-neutral-800 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-500"></span>
            <span className="size-3 rounded-full bg-yellow-500"></span>
            <span className="size-3 rounded-full bg-green-500"></span>
          </div>
          <div className="ml-2 flex-1 max-w-md rounded-md bg-neutral-700 px-3 py-1 text-sm text-neutral-400">
            app.stockzip.com
          </div>
        </div>
      </div>
      {/* Screen Content Placeholder */}
      <div className="aspect-video w-full bg-neutral-100 flex items-center justify-center">
        <div className="text-center text-neutral-400">
          <span className="icon-[tabler--photo] size-12 mb-2 block mx-auto"></span>
          <p className="text-base font-medium">Interface Screenshot</p>
        </div>
      </div>
    </div>
  )

  // If reduced motion preferred, render without animations
  if (prefersReducedMotion) {
    return (
      <section className="bg-base-200 py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <BrowserFrame />
        </div>
      </section>
    )
  }

  return (
    <section className="bg-base-200 py-12 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <BrowserFrame />
        </motion.div>
      </div>
    </section>
  )
}
