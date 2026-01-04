import type { Metadata } from 'next'
import Link from 'next/link'
import { FlyonUIInit } from '@/components/marketing/FlyonUIInit'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar'

export const metadata: Metadata = {
  title: {
    template: '%s | StockZip',
    default: 'StockZip | Simple inventory management',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
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

