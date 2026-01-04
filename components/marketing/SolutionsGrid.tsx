'use client'

import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from './animations'

const SOLUTIONS = [
  {
    title: 'Warehouse',
    description: 'Fast receiving, counts, and picking — with scans you can trust.',
    href: '/solutions/warehouse-inventory',
  },
  {
    title: 'Ecommerce',
    description: 'Prevent stockouts and stay accurate across locations and channels.',
    href: '/solutions/ecommerce-inventory',
  },
  {
    title: 'Construction & Tools',
    description: 'Issue and return tools by scan — stop losses and disputes.',
    href: '/solutions/construction-tools',
  },
  {
    title: 'Small business',
    description: 'Replace spreadsheets in minutes — no training required.',
    href: '/solutions/small-business',
  },
]

export function SolutionsGrid() {
  return (
    <div className="bg-base-100 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8 text-center sm:mb-12">
          <p className="text-primary text-sm font-medium uppercase tracking-wide">Solutions</p>
          <h2 className="text-base-content mt-2 text-2xl font-semibold md:text-3xl">
            Built for how you work
          </h2>
        </FadeIn>

        <StaggerContainer className="grid gap-6 md:grid-cols-4">
          {SOLUTIONS.map((solution) => (
            <StaggerItem key={solution.title}>
              <HoverScale>
                <Link
                  href={solution.href}
                  className="card card-border shadow-none hover:border-primary transition-colors block h-full"
                >
                  <div className="card-body">
                    <h3 className="text-base-content text-lg font-semibold">{solution.title}</h3>
                    <p className="text-base-content/80">{solution.description}</p>
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
