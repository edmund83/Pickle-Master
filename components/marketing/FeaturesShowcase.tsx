'use client'

import Image from 'next/image'
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
  imageSrc?: string
}

const FEATURES: Feature[] = [
  {
    category: 'Easy to Use',
    categoryIcon: 'icon-[tabler--sparkles]',
    title: 'Organize like folders. Find like photos.',
    bullets: [
      {
        icon: 'icon-[tabler--folders]',
        text: 'Put items in folders just like your computer. Warehouse, shelf, bin—organize your way.',
      },
      {
        icon: 'icon-[tabler--photo]',
        text: 'See your inventory at a glance with photo cards. No more guessing which "Widget A" is which.',
      },
      {
        icon: 'icon-[tabler--user-check]',
        text: 'If your team can use a smartphone, they can use StockZip. Zero training required.',
      },
    ],
    imageAlt: 'StockZip folder-style inventory with photo cards',
    imageSrc: '/images/Folder Style Inventory.png',
  },
  {
    category: 'Scanning',
    categoryIcon: 'icon-[tabler--barcode]',
    title: 'Scan barcodes. Update stock. Done.',
    bullets: [
      {
        icon: 'icon-[tabler--scan]',
        text: 'Use your phone camera, Bluetooth scanner, or rugged warehouse device. Any scanner works.',
      },
      {
        icon: 'icon-[tabler--wifi-off]',
        text: 'Count inventory with no signal. Real offline mode syncs everything when you reconnect.',
      },
      {
        icon: 'icon-[tabler--bell-ringing]',
        text: 'Get notified before you run out. Set custom low-stock thresholds per item or location.',
      },
    ],
    imageAlt: 'StockZip barcode scanning and offline inventory tracking',
  },
  {
    category: 'Accountability',
    categoryIcon: 'icon-[tabler--clipboard-check]',
    title: 'Know who has what. Always.',
    bullets: [
      {
        icon: 'icon-[tabler--arrow-autofit-content]',
        text: 'Check-in and check-out tools, equipment, and assets with due dates. End the "who took it?" mystery.',
      },
      {
        icon: 'icon-[tabler--history]',
        text: 'Every stock change is logged—who, when, and why. Full audit trail for compliance.',
      },
      {
        icon: 'icon-[tabler--file-export]',
        text: 'Download CSV or PDF reports for audits, insurance, or budgeting in one click.',
      },
    ],
    imageAlt: 'StockZip check-in check-out and audit trail features',
  },
  {
    category: 'Team Sync',
    categoryIcon: 'icon-[tabler--users-group]',
    title: 'Your whole team, one source of truth.',
    bullets: [
      {
        icon: 'icon-[tabler--refresh]',
        text: 'When someone updates stock in the field, everyone sees it instantly. No version conflicts.',
      },
      {
        icon: 'icon-[tabler--map-pin]',
        text: 'Warehouse, van, job site, store—track inventory wherever it lives with multi-location support.',
      },
      {
        icon: 'icon-[tabler--currency-dollar]',
        text: 'Add unlimited team members. No per-seat surprises as you grow. Predictable pricing.',
      },
    ],
    imageAlt: 'StockZip real-time team collaboration and multi-location tracking',
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

        {/* Image */}
        <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
          {feature.imageSrc ? (
            <div className="overflow-hidden rounded-2xl shadow-sm">
              <Image
                src={feature.imageSrc}
                alt={feature.imageAlt}
                width={600}
                height={450}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-base-200 shadow-sm">
              <span className="text-sm text-base-content/40">Image: 600 × 450</span>
            </div>
          )}
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
