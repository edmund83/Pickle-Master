'use client'

import { FadeIn, StaggerContainer, StaggerItem, Counter } from './animations'

const STATS = [
  { value: 12500, suffix: '+', label: 'Items tracked daily' },
  { value: 65, suffix: '%', label: 'Time saved on counts' },
  { value: 99.9, suffix: '%', label: 'Uptime reliability' },
  { value: 4.9, suffix: '/5', label: 'Customer rating' },
]

export function StatsSection() {
  return (
    <div className="bg-base-200 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8 text-center sm:mb-12">
          <p className="text-primary text-sm font-medium uppercase tracking-wide">Trusted by teams</p>
          <h2 className="text-base-content mt-2 text-2xl font-semibold md:text-3xl">
            Built for real inventory workflows
          </h2>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <div className="text-primary text-3xl font-bold sm:text-4xl lg:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-base-content/70 mt-2 text-sm sm:text-base">{stat.label}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  )
}
