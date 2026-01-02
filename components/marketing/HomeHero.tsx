import Link from 'next/link'

export function HomeHero() {
  return (
    <div className="bg-base-100">
      <main className="h-screen">
        <div className="flex h-full flex-col justify-between gap-18 overflow-x-hidden pt-40 md:gap-24 md:pt-45 lg:gap-35 lg:pt-47.5">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 justify-self-center px-4 text-center sm:px-6 lg:px-8">
            <div className="bg-base-200 border-base-content/20 flex w-fit items-center gap-2.5 rounded-full border px-3 py-2">
              <span className="badge badge-primary shrink-0 rounded-full">Barcode + Offline</span>
              <span className="text-base-content/80">Inventory that works in the real world</span>
            </div>

            <h1 className="text-base-content relative z-1 text-5xl leading-[1.15] font-bold max-md:text-2xl md:max-w-4xl md:text-balance">
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

            <p className="text-base-content/80 max-w-3xl">
              Scan, count, and track stock across locations. Check items in/out to staff. Works offline on mobile.
              Trust-first pricing with no surprise tier jumps.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-gradient btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/demo" className="btn btn-outline btn-secondary btn-lg">
                Watch 90-second demo
                <span className="icon-[tabler--player-play] size-5"></span>
              </Link>
            </div>

            <p className="text-base-content/70 text-sm">
              No credit card • Cancel anytime • Import from CSV/Sortly
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=80"
            alt="Warehouse inventory shelves"
            className="min-h-67 w-full object-cover"
          />
        </div>
      </main>
    </div>
  )
}

