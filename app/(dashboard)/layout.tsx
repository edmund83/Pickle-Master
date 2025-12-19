import { MobileLayoutWrapper } from '@/components/layout/mobile/MobileLayoutWrapper'
import { OfflineProvider } from '@/components/providers/OfflineProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OfflineProvider>
      <MobileLayoutWrapper>
        {children}
      </MobileLayoutWrapper>
    </OfflineProvider>
  )
}
