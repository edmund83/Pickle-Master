'use client'

import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem } from './animations'

interface FeatureBullet {
  icon: string
  text: string
}

interface Feature {
  category: string
  categoryIcon: string
  title: string
  bullets: FeatureBullet[]
  imageAlt: string
}

const FEATURES: Feature[] = [
  {
    category: 'Organizing',
    categoryIcon: 'icon-[tabler--layout-grid]',
    title: 'Organize and automate your inventory at the touch of a button.',
    bullets: [
      { icon: 'icon-[tabler--upload]', text: 'Easily upload your existing inventory list into StockZip.' },
      { icon: 'icon-[tabler--folder]', text: 'Organize inventory folders by location, type, and more.' },
      { icon: 'icon-[tabler--checkbox]', text: 'Add critical item details with custom fields.' },
    ],
    imageAlt: 'StockZip inventory organization interface',
  },
  {
    category: 'Managing',
    categoryIcon: 'icon-[tabler--box]',
    title: 'Track and manage your entire inventory with one easy app.',
    bullets: [
      { icon: 'icon-[tabler--scan]', text: 'Speed up inventory counts with in-app barcode and QR code scanner.' },
      { icon: 'icon-[tabler--photo]', text: 'Upload high-resolution photos to visually track each item.' },
      { icon: 'icon-[tabler--bell]', text: "Get alerted when you're running low on stock." },
    ],
    imageAlt: 'StockZip inventory management dashboard',
  },
  {
    category: 'Reporting',
    categoryIcon: 'icon-[tabler--chart-bar]',
    title: 'Get real-time reporting insights.',
    bullets: [
      { icon: 'icon-[tabler--file-analytics]', text: 'Get in-depth data on items, folders, and user histories.' },
      { icon: 'icon-[tabler--file-export]', text: 'Easily export custom PDF or CSV reports.' },
      { icon: 'icon-[tabler--clipboard-check]', text: 'Perfect for audits, budgeting, and forecasting.' },
    ],
    imageAlt: 'StockZip reporting and analytics view',
  },
  {
    category: 'Synchronization',
    categoryIcon: 'icon-[tabler--refresh]',
    title: 'Automatically sync your inventory across all devices, all teams.',
    bullets: [
      {
        icon: 'icon-[tabler--devices]',
        text: 'Use StockZip on mobile, desktop, or tablet, thanks to automatic, cloud-based syncing.',
      },
      {
        icon: 'icon-[tabler--users]',
        text: 'You and your team can update inventory in real time from any location.',
      },
    ],
    imageAlt: 'StockZip multi-device synchronization',
  },
]

function FeatureSection({ feature, index }: { feature: Feature; index: number }) {
  const isReversed = index % 2 === 1

  return (
    <FadeIn>
      <div
        className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
          isReversed ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {/* Text Content */}
        <div className={`space-y-6 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span className={`${feature.categoryIcon} size-4`}></span>
            {feature.category}
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-semibold text-base-content md:text-3xl lg:text-4xl">
            {feature.title}
          </h2>

          {/* Bullets */}
          <StaggerContainer className="space-y-4">
            {feature.bullets.map((bullet, bulletIndex) => (
              <StaggerItem key={bulletIndex}>
                <div className="flex items-start gap-3">
                  <span className={`${bullet.icon} text-primary mt-0.5 size-5 shrink-0`}></span>
                  <p className="text-base-content/80">{bullet.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/signup" className="btn btn-primary">
              Start Free Trial
            </Link>
            <Link href="/features" className="link link-primary link-animated flex items-center gap-1">
              See All Features
              <span className="icon-[tabler--chevron-right] size-4"></span>
            </Link>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-base-200 shadow-sm">
            <span className="text-sm text-base-content/40">Image: 600 × 450</span>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

export function FeaturesShowcase() {
  return (
    <div className="bg-base-100 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:space-y-24 lg:px-8">
        {FEATURES.map((feature, index) => (
          <FeatureSection key={feature.category} feature={feature} index={index} />
        ))}
      </div>
    </div>
  )
}
