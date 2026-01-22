'use client'

import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from './animations'

export function PricingSection() {
  return (
    <div className="bg-base-200 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 flex flex-col items-center space-y-4 text-center sm:mb-16 lg:mb-24">
          <span className="badge badge-soft badge-accent rounded-full font-medium uppercase">
            Early Access — Limited Spots
          </span>
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            Try StockZip Free for 3 Months
          </h2>
          <p className="text-base-content/80 text-xl">
            Simple pricing that scales with you. No surprise tier jumps. Cancel anytime.
          </p>
        </FadeIn>

        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Early Access Plan */}
          <StaggerItem>
            <HoverScale>
              <div className="card shadow-xl ring-2 ring-accent h-full">
                <div className="card-body gap-6">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base-content text-xl font-bold">Early Access</h3>
                      <span className="badge badge-accent rounded-full text-xs text-white">
                        <span className="icon-[tabler--rocket] mr-1 size-3"></span>
                        Early Bird
                      </span>
                    </div>
                    <p className="text-base-content/70">3 months free for early supporters.</p>
                  </div>
                  <div className="text-base-content text-4xl font-bold">
                    $0 <span className="text-base-content/50 text-base font-normal">for 3 months</span>
                  </div>
                  <div className="bg-accent/10 -mx-2 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Items</span>
                      <span className="text-base-content font-semibold">1,200</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Users</span>
                      <span className="text-base-content font-semibold">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Locations</span>
                      <span className="text-accent font-semibold">Up to 3</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-base-content/80">
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-success size-5"></span>All Scale features included</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-success size-5"></span>Lot &amp; serial tracking</li>
                    <li className="flex gap-2"><span className="icon-[tabler--sparkles] text-primary size-5"></span>500 AskZoe AI questions/mo</li>
                  </ul>
                  <Link href="/signup?plan=early_access" className="btn btn-accent">
                    Join Early Access
                  </Link>
                </div>
              </div>
            </HoverScale>
          </StaggerItem>

          {/* Starter Plan */}
          <StaggerItem>
            <HoverScale>
              <div className="card card-border shadow-none h-full">
                <div className="card-body gap-6">
                  <div className="space-y-1">
                    <h3 className="text-base-content text-xl font-semibold">Starter</h3>
                    <p className="text-base-content/70">Perfect for getting started.</p>
                  </div>
                  <div className="text-base-content text-4xl font-semibold">
                    $18 <span className="text-base-content/50 text-base font-normal">/month</span>
                  </div>
                  <div className="bg-base-200/50 -mx-2 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Items</span>
                      <span className="text-base-content font-medium">1,200</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Users</span>
                      <span className="text-base-content font-medium">3</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-base-content/80">
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Barcode &amp; QR scanning</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Mobile app + offline mode</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Low-stock alerts</li>
                  </ul>
                  <Link href="/signup?plan=starter" className="btn btn-primary">
                    Start free trial
                  </Link>
                </div>
              </div>
            </HoverScale>
          </StaggerItem>

          {/* Growth Plan (Recommended) */}
          <StaggerItem>
            <HoverScale>
              <div className="card card-border shadow-none border-primary/40 ring-2 ring-primary h-full">
                <div className="card-body gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base-content text-xl font-bold">Growth</h3>
                      <span className="badge badge-primary rounded-full text-white">
                        <span className="icon-[tabler--star-filled] mr-1 size-3"></span>
                        Recommended
                      </span>
                    </div>
                    <p className="text-base-content/70">Best value for growing teams.</p>
                  </div>
                  <div className="text-base-content text-4xl font-bold">
                    $39 <span className="text-base-content/50 text-base font-normal">/month</span>
                  </div>
                  <div className="bg-primary/10 -mx-2 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Items</span>
                      <span className="text-base-content font-semibold">3,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Users</span>
                      <span className="text-base-content font-semibold">5</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-base-content/80">
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Multi-location inventory</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Purchase orders &amp; receiving</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>100 AskZoe AI questions/mo</li>
                  </ul>
                  <Link href="/signup?plan=growth" className="btn btn-primary">
                    Start free trial
                  </Link>
                </div>
              </div>
            </HoverScale>
          </StaggerItem>

          {/* Scale Plan */}
          <StaggerItem>
            <HoverScale>
              <div className="card card-border shadow-none h-full">
                <div className="card-body gap-6">
                  <div className="space-y-1">
                    <h3 className="text-base-content text-xl font-semibold">Scale</h3>
                    <p className="text-base-content/70">For teams needing control &amp; compliance.</p>
                  </div>
                  <div className="text-base-content text-4xl font-semibold">
                    $89 <span className="text-base-content/50 text-base font-normal">/month</span>
                  </div>
                  <div className="bg-base-200/50 -mx-2 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Items</span>
                      <span className="text-base-content font-medium">8,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Users</span>
                      <span className="text-base-content font-medium">8</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-base-content/80">
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Lot &amp; serial tracking</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>Audit trail &amp; approvals</li>
                    <li className="flex gap-2"><span className="icon-[tabler--circle-check] text-primary size-5"></span>500 AskZoe AI questions/mo</li>
                  </ul>
                  <Link href="/signup?plan=scale" className="btn btn-primary">
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
