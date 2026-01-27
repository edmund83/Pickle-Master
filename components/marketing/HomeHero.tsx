import Link from 'next/link'
import Image from 'next/image'

export function HomeHero() {
  return (
    <div className="bg-primary">
      <main className="pb-10 pt-32 md:pt-36">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:gap-5 lg:px-8">
          {/* Logo with staggered animation */}
          <div className="motion-safe:animate-hero-fade-in motion-safe:[animation-delay:0ms]">
            <Image
              src="/images/logo.png"
              alt="StockZip Logo"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>

          {/* H1 - staggered */}
          <h1 className="text-white text-5xl leading-[1.15] font-bold max-md:text-3xl md:max-w-4xl md:text-balance motion-safe:animate-hero-fade-in motion-safe:[animation-delay:100ms]">
            StockZip<span className="text-lg font-light align-super opacity-60">™</span> - Inventory management with barcode scanning
          </h1>

          {/* Description */}
          <p className="text-white/80 max-w-3xl text-lg motion-safe:animate-hero-fade-in motion-safe:[animation-delay:200ms]">
            Built for small business teams. Scan on mobile, get low-stock alerts, and track check-in/check-out —
            works offline and syncs when you&apos;re back online.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-3 sm:flex-row motion-safe:animate-hero-fade-in motion-safe:[animation-delay:300ms]">
            <Link href="/signup" className="btn btn-lg bg-white text-primary border-0 hover:bg-accent hover:border-0 hover:text-accent-content group">
              Start Free Trial
              <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180 motion-safe:animate-arrow-bounce"></span>
            </Link>
            <Link href="/demo" className="btn btn-outline btn-lg border-white text-white hover:bg-accent hover:border-accent hover:text-accent-content">
              Watch demo
              <span className="icon-[tabler--player-play] size-5"></span>
            </Link>
          </div>

          {/* AI Badge */}
          <Link
            href="/ai-assistant"
            className="bg-white/10 border-white/20 text-white/90 hover:bg-white/15 hover:border-white/30 flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors motion-safe:animate-hero-fade-in motion-safe:[animation-delay:400ms]"
          >
            <span className="icon-[tabler--sparkles] size-4"></span>
            <span className="font-medium">Now with Ask Zoe AI assistant</span>
            <span className="icon-[tabler--arrow-right] size-4 rtl:rotate-180"></span>
          </Link>

          {/* Trust signals */}
          <p className="text-white/70 text-sm motion-safe:animate-hero-fade-in motion-safe:[animation-delay:500ms]">
            No credit card • Cancel anytime • Import Excel/CSV in minutes
          </p>
        </div>
      </main>
    </div>
  )
}
