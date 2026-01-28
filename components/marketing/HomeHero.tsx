import Link from 'next/link'
import Image from 'next/image'

export function HomeHero() {
  return (
    <div className="bg-primary">
      <main className="pb-10 pt-40 md:pt-44">
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

          {/* AWS Badge */}
          <div className="flex items-center gap-2 text-white/60 text-xs motion-safe:animate-hero-fade-in motion-safe:[animation-delay:600ms]">
            <svg className="h-4 w-auto shrink-0" viewBox="-12 10 90 45" aria-label="AWS" role="img">
              <path d="M13.2 32.4c0 1.1.1 2 .3 2.6.2.7.5 1.4.9 2.2.1.2.2.5.2.7 0 .3-.2.6-.6.9l-2 1.3c-.3.2-.5.3-.8.3-.3 0-.6-.2-.9-.5-.4-.5-.8-.9-1.1-1.4-.3-.5-.6-1.1-1-1.8-2.4 2.9-5.5 4.3-9.2 4.3-2.6 0-4.7-.7-6.3-2.2-1.5-1.5-2.3-3.5-2.3-6 0-2.6.9-4.8 2.8-6.4 1.9-1.6 4.4-2.4 7.6-2.4 1.1 0 2.2.1 3.3.2 1.1.2 2.3.4 3.6.7v-2.3c0-2.4-.5-4-1.5-5-1-.9-2.7-1.4-5.1-1.4-1.1 0-2.2.1-3.4.4-1.1.3-2.3.6-3.4 1.1-.5.2-.9.3-1.1.4-.2.1-.4.1-.5.1-.4 0-.7-.3-.7-1v-1.5c0-.5.1-.9.2-1.1.2-.2.4-.4.9-.6 1.1-.6 2.4-1 3.9-1.4 1.5-.4 3.2-.6 4.9-.6 3.7 0 6.5.8 8.2 2.5 1.7 1.7 2.6 4.3 2.6 7.9v10.4h-.4zm-12.7 4.7c1 0 2.1-.2 3.2-.5 1.1-.4 2.1-1.1 3-2 .5-.6.9-1.2 1.1-2 .2-.7.3-1.6.3-2.7v-1.3c-.9-.2-1.9-.4-2.9-.5-1-.1-2-.2-2.9-.2-2.1 0-3.6.4-4.6 1.2-1 .8-1.5 2-1.5 3.6 0 1.5.4 2.6 1.1 3.3.8.8 1.9 1.1 3.2 1.1zm25.1 3.4c-.5 0-.9-.1-1.2-.3-.3-.2-.5-.6-.6-1.2l-7-23c-.2-.5-.2-.8-.2-1 0-.4.2-.6.6-.6h3.1c.6 0 1 .1 1.2.3.3.2.5.6.6 1.2l5 19.7 4.6-19.7c.1-.6.3-1 .6-1.2.3-.2.7-.3 1.2-.3h2.5c.6 0 1 .1 1.2.3.3.2.5.6.6 1.2l4.7 19.9 5.1-19.9c.2-.6.3-1 .6-1.2.3-.2.7-.3 1.2-.3h2.9c.4 0 .7.2.7.6 0 .1 0 .3-.1.4 0 .2-.1.4-.2.6l-7.2 23c-.2.6-.3 1-.6 1.2-.3.2-.7.3-1.2.3h-2.7c-.5 0-.9-.1-1.2-.3-.3-.2-.5-.6-.6-1.2l-4.6-19.1-4.6 19.1c-.1.6-.3 1-.6 1.2-.3.2-.7.3-1.2.3h-2.8zm40.1 1c-1.6 0-3.2-.2-4.8-.6-1.6-.4-2.8-.8-3.6-1.2-.5-.3-.8-.5-1-.8-.1-.3-.2-.5-.2-.8v-1.6c0-.7.3-1 .7-1 .2 0 .4 0 .6.1.2.1.5.2.8.3 1.1.5 2.2.9 3.4 1.1 1.2.3 2.5.4 3.7.4 2 0 3.5-.3 4.6-1 1.1-.7 1.6-1.7 1.6-3 0-.9-.3-1.6-.8-2.2-.6-.6-1.6-1.1-3.2-1.6l-4.5-1.4c-2.3-.7-4-1.8-5-3.2-1-1.4-1.6-2.9-1.6-4.5 0-1.3.3-2.5.8-3.5.6-1 1.3-1.9 2.3-2.6.9-.7 2-1.2 3.2-1.6 1.2-.4 2.5-.5 3.9-.5.7 0 1.4 0 2.1.1.7.1 1.4.2 2 .3.6.1 1.2.3 1.8.5.6.2 1 .4 1.3.6.4.2.7.5.9.8.2.3.3.6.3 1v1.5c0 .7-.3 1-.7 1-.3 0-.7-.1-1.2-.4-1.8-.8-3.8-1.2-6-1.2-1.8 0-3.2.3-4.2.9-1 .6-1.5 1.5-1.5 2.8 0 .9.3 1.6.9 2.2.6.6 1.8 1.2 3.4 1.7l4.4 1.4c2.3.7 3.9 1.7 4.9 3 1 1.3 1.4 2.8 1.4 4.3 0 1.3-.3 2.5-.8 3.6-.5 1.1-1.3 2-2.3 2.7-1 .8-2.1 1.3-3.5 1.7-1.4.5-2.9.7-4.5.7z" fill="currentColor"/>
              <path d="M60.6 45.5C55 49.5 46.8 51.6 39.8 51.6c-9.9 0-18.8-3.7-25.5-9.8-.5-.5-.1-1.1.6-.8 7.3 4.2 16.2 6.8 25.5 6.8 6.3 0 13.1-1.3 19.5-4 1-.4 1.7.6.7 1.7z" fill="#FF9900"/>
              <path d="M62.9 42.9c-.7-.9-4.8-.4-6.6-.2-.6.1-.6-.4-.1-.8 3.2-2.3 8.5-1.6 9.2-.9.6.8-.2 6.1-3.2 8.6-.5.4-.9.2-.7-.3.7-1.7 2.1-5.5 1.4-6.4z" fill="#FF9900"/>
            </svg>
            <span>Hosted on AWS infrastructure</span>
          </div>
        </div>
      </main>
    </div>
  )
}
