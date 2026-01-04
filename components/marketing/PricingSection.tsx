'use client'

import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from './animations'

export function PricingSection() {
  return (
    <div className="bg-base-200 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 flex flex-col items-center space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            Trust-first pricing that scales with you
          </h2>
          <p className="text-base-content/80 text-xl">
            No surprise tier jumps. No hard SKU cliffs. Start small and grow without penalties.
          </p>
        </FadeIn>

        <StaggerContainer className="grid gap-6 lg:grid-cols-3">
          <StaggerItem>
            <HoverScale>
              <div className="card card-border shadow-none h-full">
                <div className="card-body gap-6">
                  <div className="space-y-1">
                    <h3 className="text-base-content text-xl font-semibold">Starter</h3>
                    <p className="text-base-content/70">For solo operators &amp; small teams.</p>
                  </div>
                  <div className="text-base-content text-4xl font-semibold">
                    $19 <span className="text-base-content/50 text-base font-normal">/month</span>
                  </div>
                  <ul className="space-y-3 text-base-content/80">
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Barcode scanning</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Offline mobile mode</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Low-stock alerts</li>
                  </ul>
                  <Link href="/signup" className="btn btn-primary">
                    Start free trial
                  </Link>
                </div>
              </div>
            </HoverScale>
          </StaggerItem>

          <StaggerItem>
            <HoverScale>
              <div className="card card-border shadow-none border-primary/40 h-full">
                <div className="card-body gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base-content text-xl font-semibold">Team</h3>
                      <span className="badge badge-primary badge-soft rounded-full">Most popular</span>
                    </div>
                    <p className="text-base-content/70">For teams who need accountability.</p>
                  </div>
                  <div className="text-base-content text-4xl font-semibold">
                    $49 <span className="text-base-content/50 text-base font-normal">/month</span>
                  </div>
                  <ul className="space-y-3 text-base-content/80">
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Check-in / check-out workflow</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Roles &amp; permissions</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Audit trail</li>
                  </ul>
                  <Link href="/signup" className="btn btn-primary">
                    Start free trial
                  </Link>
                </div>
              </div>
            </HoverScale>
          </StaggerItem>

          <StaggerItem>
            <HoverScale>
              <div className="card card-border shadow-none h-full">
                <div className="card-body gap-6">
                  <div className="space-y-1">
                    <h3 className="text-base-content text-xl font-semibold">Business</h3>
                    <p className="text-base-content/70">For multi-location inventory operations.</p>
                  </div>
                  <div className="text-base-content text-4xl font-semibold">
                    $99 <span className="text-base-content/50 text-base font-normal">/month</span>
                  </div>
                  <ul className="space-y-3 text-base-content/80">
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Multiple locations</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Advanced reports</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Priority support</li>
                  </ul>
                  <Link href="/signup" className="btn btn-primary">
                    Start free trial
                  </Link>
                </div>
              </div>
            </HoverScale>
          </StaggerItem>
        </StaggerContainer>

        <FadeIn delay={0.4} className="mt-10 text-center">
          <Link href="/pricing" className="link link-primary link-animated text-lg font-medium">
            See full pricing details
          </Link>
        </FadeIn>
      </div>
    </div>
  )
}
