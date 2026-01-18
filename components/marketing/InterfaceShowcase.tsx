'use client'

import Image from 'next/image'

export function InterfaceShowcase() {
  return (
    <section className="bg-base-200 py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">
            Everything your team needs —
            <span className="relative z-[1] font-bold">
              {' '}nothing they don't
              <span
                className="from-primary absolute start-0 bottom-0 -z-[1] h-0.5 w-full bg-gradient-to-r to-transparent to-100% max-sm:hidden"
                aria-hidden="true"
              ></span>
            </span>
          </h2>
          <p className="text-base-content/80 text-xl">
            Built for speed and clarity. Your team is productive on day one — no training required.
          </p>
        </div>

        {/* Feature Section */}
        <div className="grid items-center gap-15 xl:grid-cols-3">
          {/* Feature Left */}
          <div className="flex flex-col items-center space-y-9 md:items-end">
            <div className="intersect-once intersect:motion-preset-slide-right-md intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-300 flex items-center gap-4 p-6">
              <div className="flex flex-col gap-2 text-end">
                <h5 className="text-base-content text-lg font-semibold">One-Tap Scanning</h5>
                <p className="text-base-content/80">
                  Scan barcodes with your phone camera. Find items, adjust stock, or add new — in seconds.
                </p>
              </div>
              <div className="rounded-box border-primary bg-primary/20 text-primary flex size-[3.875rem] shrink-0 items-center justify-center border transition-transform duration-200 hover:scale-110">
                <span className="icon-[tabler--scan] size-8"></span>
              </div>
            </div>
            <div className="intersect-once intersect:motion-preset-slide-right-md intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-600 flex items-center gap-4 p-6">
              <div className="flex flex-col gap-2 text-end">
                <h5 className="text-base-content text-lg font-semibold">Clear Stock Status</h5>
                <p className="text-base-content/80">
                  Green, yellow, red at a glance. Large numbers you can read across the room.
                </p>
              </div>
              <div className="rounded-box border-primary bg-primary/20 text-primary flex size-[3.875rem] shrink-0 items-center justify-center border transition-transform duration-200 hover:scale-110">
                <span className="icon-[tabler--eye] size-8"></span>
              </div>
            </div>
            <div className="intersect-once intersect:motion-preset-slide-right-md intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-[900ms] flex items-center gap-4 p-6">
              <div className="flex flex-col gap-2 text-end">
                <h5 className="text-base-content text-lg font-semibold">Low-Stock Alerts</h5>
                <p className="text-base-content/80">
                  Set thresholds, get notified before you run out. Email, push, or in-app notifications.
                </p>
              </div>
              <div className="rounded-box border-primary bg-primary/20 text-primary flex size-[3.875rem] shrink-0 items-center justify-center border transition-transform duration-200 hover:scale-110">
                <span className="icon-[tabler--bell-ringing] size-8"></span>
              </div>
            </div>
          </div>

          {/* Feature Center - App Screenshot */}
          <div className="intersect-once intersect:motion-preset-expand intersect:motion-duration-[900ms] intersect:motion-opacity-in-0">
            <Image
              src="/images/Mobile Inventory Management.png"
              alt="StockZip Inventory Management System"
              width={332}
              height={670}
              className="mx-auto object-cover"
              priority
            />
          </div>

          {/* Feature Right */}
          <div className="space-y-9">
            <div className="intersect-once intersect:motion-preset-slide-left-md intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-300 flex items-center gap-4 p-6">
              <div className="rounded-box border-primary bg-primary/20 text-primary flex size-[3.875rem] shrink-0 items-center justify-center border transition-transform duration-200 hover:scale-110">
                <span className="icon-[tabler--device-mobile] size-8"></span>
              </div>
              <div className="flex flex-col gap-2">
                <h5 className="text-base-content text-lg font-semibold">Mobile-First Design</h5>
                <p className="text-base-content/80">
                  Large buttons, one-handed use. Built for the warehouse floor, not the desk.
                </p>
              </div>
            </div>
            <div className="intersect-once intersect:motion-preset-slide-left-md intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-600 flex items-center gap-4 p-6">
              <div className="rounded-box border-primary bg-primary/20 text-primary flex size-[3.875rem] shrink-0 items-center justify-center border transition-transform duration-200 hover:scale-110">
                <span className="icon-[tabler--users-group] size-8"></span>
              </div>
              <div className="flex flex-col gap-2">
                <h5 className="text-base-content text-lg font-semibold">Team Sync</h5>
                <p className="text-base-content/80">
                  Everyone sees changes instantly. No file locking, no version conflicts, no training.
                </p>
              </div>
            </div>
            <div className="intersect-once intersect:motion-preset-slide-left-md intersect:motion-duration-800 intersect:motion-opacity-in-0 intersect:motion-delay-[900ms] flex items-center gap-4 p-6">
              <div className="rounded-box border-primary bg-primary/20 text-primary flex size-[3.875rem] shrink-0 items-center justify-center border transition-transform duration-200 hover:scale-110">
                <span className="icon-[tabler--wifi-off] size-8"></span>
              </div>
              <div className="flex flex-col gap-2">
                <h5 className="text-base-content text-lg font-semibold">Offline-First</h5>
                <p className="text-base-content/80">
                  Works without WiFi. Queue changes offline, sync automatically when connected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
