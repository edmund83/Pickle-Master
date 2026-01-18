import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { FlyonUIInit } from '@/components/marketing/FlyonUIInit'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar'

export const metadata: Metadata = {
  title: {
    template: '%s | StockZip',
    default: 'StockZip | Simple inventory management',
  },
}

// Inline script to initialize FlyonUI globals before module loads
const flyonuiGlobalsScript = `
(function() {
  var collections = [
    '$hsOverlayCollection',
    '$hsDropdownCollection',
    '$hsCollapseCollection',
    '$hsAccordionCollection',
    '$hsCarouselCollection',
    '$hsTabsCollection',
    '$hsTooltipCollection',
    '$hsScrollspyCollection',
    '$hsSelectCollection',
    '$hsInputNumberCollection',
    '$hsStrongPasswordCollection',
    '$hsPinInputCollection',
    '$hsFileUploadCollection',
    '$hsRangeSliderCollection',
    '$hsRemoveElementCollection',
    '$hsStepperCollection',
    '$hsToggleCountCollection',
    '$hsTogglePasswordCollection',
    '$hsTreeViewCollection'
  ];
  collections.forEach(function(name) {
    if (!window[name]) window[name] = [];
  });
})();
`

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Script id="flyonui-globals" strategy="beforeInteractive">
        {flyonuiGlobalsScript}
      </Script>
      <Script
        src="https://unpkg.com/tailwindcss-intersect@2.x.x/dist/observer.min.js"
        strategy="afterInteractive"
      />
      <FlyonUIInit />
      <div className="fixed top-0 z-10 w-full">
        {/* Announcement Banner */}
        <div className="bg-accent text-accent-content text-center py-2.5 px-4 text-sm font-medium">
          New Members Get 30% Off Annual Plan
          <Link href="/pricing" className="ml-4 btn btn-xs bg-white text-accent-content rounded-full border-0 hover:bg-white/90">
            Read more
          </Link>
        </div>
        {/* Navigation */}
        <header className="bg-primary w-full">
          <MarketingNavbar />
        </header>
      </div>
      {children}
      <MarketingFooter />
    </div>
  )
}

