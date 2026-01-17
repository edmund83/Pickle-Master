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
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:gap-4 lg:px-8">
            <div className="bg-white/10 border-white/20 flex w-fit items-center gap-2.5 rounded-full border px-3 py-2">
              <span className="badge bg-white text-primary border-0 shrink-0 rounded-full">Barcode + Offline</span>
              <span className="text-white/80">Inventory that works in the real world</span>
            </div>

            <h1 className="text-white relative z-1 text-5xl leading-[1.15] font-bold max-md:text-2xl md:max-w-4xl md:text-balance">
              <span>Inventory management with barcode scanning — built for small teams</span>
              <svg
                width="223"
                height="12"
                viewBox="0 0 223 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -bottom-1.5 left-10 -z-1 max-lg:left-4 max-md:hidden"
              >
                <path
                  d="M1.30466 10.7431C39.971 5.28788 76.0949 3.02 115.082 2.30401C143.893 1.77489 175.871 0.628649 204.399 3.63102C210.113 3.92052 215.332 4.91391 221.722 6.06058"
                  stroke="url(#paint0_linear_10365_68643)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_10365_68643"
                    x1="19.0416"
                    y1="4.03539"
                    x2="42.8362"
                    y2="66.9459"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.2" stopColor="var(--color-primary)" />
                    <stop offset="1" stopColor="var(--color-primary-content)" />
                  </linearGradient>
                </defs>
              </svg>
            </h1>

            <p className="text-white/80 max-w-3xl">
              Scan, count, and track stock across locations. Check items in/out to staff. Works offline on mobile.
              Trust-first pricing with no surprise tier jumps.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-lg bg-white text-primary border-0 hover:bg-accent hover:border-0 hover:text-accent-content">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/demo" className="btn btn-outline btn-lg border-white text-white hover:bg-accent hover:border-accent hover:text-accent-content">
                Watch 90-second demo
                <span className="icon-[tabler--player-play] size-5"></span>
              </Link>
            </div>

            <p className="text-white/70 text-sm">
              No credit card • Cancel anytime • Import from CSV/Sortly
            </p>

            {/* Computer Screen Showcase Placeholder */}
            <div className="mt-4 w-full max-w-3xl lg:max-w-4xl">
              <div className="relative mx-auto shadow-2xl rounded-lg overflow-hidden">
                {/* Browser Chrome / Window Frame */}
                <div className="bg-neutral-800 px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="size-2 rounded-full bg-red-500"></span>
                      <span className="size-2 rounded-full bg-yellow-500"></span>
                      <span className="size-2 rounded-full bg-green-500"></span>
                    </div>
                    <div className="ml-2 flex-1 rounded bg-neutral-700 px-2 py-0.5 text-xs text-neutral-400">
                      app.stockzip.com
                    </div>
                  </div>
                </div>
                {/* Screen Content Placeholder */}
                <div className="aspect-video w-full bg-neutral-100 flex items-center justify-center">
                  <div className="text-center text-neutral-400">
                    <span className="icon-[tabler--photo] size-10 mb-1 block mx-auto"></span>
                    <p className="text-sm font-medium">Interface Screenshot</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-primary">
      <main className="pb-10 pt-32 md:pt-36">
        <motion.div
          className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:gap-4 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white/10 border-white/20 flex w-fit items-center gap-2.5 rounded-full border px-3 py-2"
            variants={itemVariants}
          >
            <span className="badge bg-white text-primary border-0 shrink-0 rounded-full">Barcode + Offline</span>
            <span className="text-white/80">Inventory that works in the real world</span>
          </motion.div>

          <motion.h1
            className="text-white relative z-1 text-5xl leading-[1.15] font-bold max-md:text-2xl md:max-w-4xl md:text-balance"
            variants={itemVariants}
          >
            <span>Inventory management with barcode scanning — built for small teams</span>
            <svg
              width="223"
              height="12"
              viewBox="0 0 223 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -bottom-1.5 left-10 -z-1 max-lg:left-4 max-md:hidden"
            >
              <path
                d="M1.30466 10.7431C39.971 5.28788 76.0949 3.02 115.082 2.30401C143.893 1.77489 175.871 0.628649 204.399 3.63102C210.113 3.92052 215.332 4.91391 221.722 6.06058"
                stroke="url(#paint0_linear_10365_68643)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_10365_68643"
                  x1="19.0416"
                  y1="4.03539"
                  x2="42.8362"
                  y2="66.9459"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.2" stopColor="var(--color-primary)" />
                  <stop offset="1" stopColor="var(--color-primary-content)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.h1>

          <motion.p className="text-white/80 max-w-3xl" variants={itemVariants}>
            Scan, count, and track stock across locations. Check items in/out to staff. Works offline on mobile.
            Trust-first pricing with no surprise tier jumps.
          </motion.p>

          <motion.div className="flex flex-col items-center gap-3 sm:flex-row" variants={itemVariants}>
            <Link href="/signup" className="btn btn-lg bg-white text-primary border-0 hover:bg-accent hover:border-0 hover:text-accent-content">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-lg border-white text-white hover:bg-accent hover:border-accent hover:text-accent-content">
              Watch 90-second demo
              <span className="icon-[tabler--player-play] size-5"></span>
            </Link>
          </motion.div>

          <motion.p className="text-white/70 text-sm" variants={itemVariants}>
            No credit card • Cancel anytime • Import from CSV/Sortly
          </motion.p>

          {/* Computer Screen Showcase Placeholder */}
          <motion.div className="mt-4 w-full max-w-3xl lg:max-w-4xl" variants={itemVariants}>
            <div className="relative mx-auto shadow-2xl rounded-lg overflow-hidden">
              {/* Browser Chrome / Window Frame */}
              <div className="bg-neutral-800 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="size-2 rounded-full bg-red-500"></span>
                    <span className="size-2 rounded-full bg-yellow-500"></span>
                    <span className="size-2 rounded-full bg-green-500"></span>
                  </div>
                  <div className="ml-2 flex-1 rounded bg-neutral-700 px-2 py-0.5 text-xs text-neutral-400">
                    app.stockzip.com
                  </div>
                </div>
              </div>
              {/* Screen Content Placeholder */}
              <div className="aspect-video w-full bg-neutral-100 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <span className="icon-[tabler--photo] size-10 mb-1 block mx-auto"></span>
                  <p className="text-sm font-medium">Interface Screenshot</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
