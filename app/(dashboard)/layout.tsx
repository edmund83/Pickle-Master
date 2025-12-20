import { MobileLayoutWrapper } from '@/components/layout/mobile/MobileLayoutWrapper'
import { OfflineProvider } from '@/components/providers/OfflineProvider'
import { QuotaWarningBanner } from '@/components/QuotaWarningBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OfflineProvider>
      <div className="flex min-h-screen flex-col">
        <QuotaWarningBanner />
        <MobileLayoutWrapper>
          {children}
        </MobileLayoutWrapper>
      </div>
    </OfflineProvider>
  )
}
