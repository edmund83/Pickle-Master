import type { Metadata } from 'next'
import { FlyonUIInit } from '@/components/marketing/FlyonUIInit'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar'

export const metadata: Metadata = {
  title: {
    template: '%s | Pickle',
    default: 'Pickle | Simple inventory management',
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
      <header className="border-base-content/20 bg-base-100 fixed top-0 z-10 w-full border-b py-0.25">
        <MarketingNavbar />
      </header>
      {children}
      <MarketingFooter />
    </div>
  )
}

