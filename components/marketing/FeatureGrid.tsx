'use client'

import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from './animations'

const FEATURES = [
  {
    icon: 'icon-[tabler--scan]',
    title: 'Barcode scanning',
    description: 'Scan to find and update items fast — receiving, picking, and audits.',
    href: '/features/barcode-scanning',
  },
  {
    icon: 'icon-[tabler--wifi-off]',
    title: 'Offline-first mobile',
    description: "Keep scanning on jobsites and warehouses. Sync when you're back online.",
    href: '/features/offline-mobile-scanning',
  },
  {
    icon: 'icon-[tabler--arrow-left-right]',
    title: 'Check-in / check-out',
    description: 'Issue tools/assets to staff with accountability — no folder hacks.',
    href: '/features/check-in-check-out',
  },
  {
    icon: 'icon-[tabler--table]',
    title: 'Bulk edits with guardrails',
    description: 'Excel-grade edits with preview + undo to prevent expensive mistakes.',
    href: '/features/bulk-editing',
  },
  {
    icon: 'icon-[tabler--bell-ringing]',
    title: 'Low-stock alerts',
    description: 'Set reorder points and get notified before you run out.',
    href: '/features/low-stock-alerts',
  },
  {
    icon: 'icon-[tabler--switch-3]',
    title: 'Guided migration',
    description: 'Bring your data over fast with CSV import and field mapping.',
    href: '/migration',
  },
]

export function FeatureGrid() {
  return (
    <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 space-y-4 sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            All essentials in one place — without ERP complexity
          </h2>
          <p className="text-base-content/80 max-w-4xl text-xl">
            Built around how small teams actually manage inventory: scanning, counting, issuing, and staying accurate
            over time.
          </p>
          <div className="flex items-center gap-1.5">
            <Link href="/features" className="link link-primary link-animated text-lg font-medium">
              See all features
            </Link>
            <span className="icon-[tabler--arrow-right] text-primary size-5"></span>
          </div>
        </FadeIn>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <HoverScale>
                <Link
                  href={feature.href}
                  className="card card-border hover:border-primary border-primary/30 shadow-none transition-colors duration-300 block h-full"
                >
                  <div className="card-body">
                    <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-xl">
                      <span className={`${feature.icon} text-primary size-7`}></span>
                    </div>
                    <h3 className="card-title text-lg">{feature.title}</h3>
                    <p className="text-base-content/80">{feature.description}</p>
                  </div>
                </Link>
              </HoverScale>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  )
}
