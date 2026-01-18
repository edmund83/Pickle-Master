'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { ANIMATION_CONFIG } from '@/lib/marketing/animations'

export function HomeHero() {
  const prefersReducedMotion = useReducedMotion()

  // Animation variants for staggered children
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.normal,
        ease: ANIMATION_CONFIG.ease.default,
      },
    },
  }

  // If reduced motion preferred, render without animations
  if (prefersReducedMotion) {
    return (
      <div className="bg-primary">
        <main className="pb-10 pt-32 md:pt-36">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:gap-5 lg:px-8">
            <Link
              href="/ai-assistant"
              className="bg-white/10 border-white/20 text-white/90 hover:bg-white/15 hover:border-white/30 flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors"
            >
              <span className="icon-[tabler--sparkles] size-4"></span>
              <span className="font-medium">Now with Ask Zoe AI assistant</span>
              <span className="icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
            </Link>

            <h1 className="text-white text-5xl leading-[1.15] font-bold max-md:text-3xl md:max-w-4xl md:text-balance">
              Inventory management with barcode scanning
            </h1>

            <p className="text-white/80 max-w-3xl text-lg">
              Built for small business teams. Scan on mobile, get low-stock alerts, and track check-in/check-out —
              works offline and syncs when you're back online.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-lg bg-white text-primary border-0 hover:bg-accent hover:border-0 hover:text-accent-content">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/demo" className="btn btn-outline btn-lg border-white text-white hover:bg-accent hover:border-accent hover:text-accent-content">
                Watch demo
                <span className="icon-[tabler--player-play] size-5"></span>
              </Link>
            </div>

            <p className="text-white/70 text-sm">
              No credit card • Cancel anytime • Import Excel/CSV in minutes
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-primary">
      <main className="pb-10 pt-32 md:pt-36">
        <motion.div
          className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:gap-5 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link
              href="/ai-assistant"
              className="bg-white/10 border-white/20 text-white/90 hover:bg-white/15 hover:border-white/30 flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors"
            >
              <span className="icon-[tabler--sparkles] size-4"></span>
              <span className="font-medium">Now with Ask Zoe AI assistant</span>
              <span className="icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
            </Link>
          </motion.div>

          <motion.h1
            className="text-white text-5xl leading-[1.15] font-bold max-md:text-3xl md:max-w-4xl md:text-balance"
            variants={itemVariants}
          >
            Inventory management with barcode scanning
          </motion.h1>

          <motion.p className="text-white/80 max-w-3xl text-lg" variants={itemVariants}>
            Built for small business teams. Scan on mobile, get low-stock alerts, and track check-in/check-out —
            works offline and syncs when you're back online.
          </motion.p>

          <motion.div className="flex flex-col items-center gap-3 sm:flex-row" variants={itemVariants}>
            <Link href="/signup" className="btn btn-lg bg-white text-primary border-0 hover:bg-accent hover:border-0 hover:text-accent-content">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-lg border-white text-white hover:bg-accent hover:border-accent hover:text-accent-content">
              Watch demo
              <span className="icon-[tabler--player-play] size-5"></span>
            </Link>
          </motion.div>

          <motion.p className="text-white/70 text-sm" variants={itemVariants}>
            No credit card • Cancel anytime • Import Excel/CSV in minutes
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}
