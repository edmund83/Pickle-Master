import { MobileLayoutWrapper } from '@/components/layout/mobile/MobileLayoutWrapper'
import { OfflineProvider } from '@/components/providers/OfflineProvider'
import { QuotaWarningBanner } from '@/components/QuotaWarningBanner'
import { UndoProvider } from '@/lib/hooks/useUndo'
import { UndoToast } from '@/components/UndoToast'
import { TenantSettingsProvider } from '@/contexts/TenantSettingsContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OfflineProvider>
      <TenantSettingsProvider>
        <UndoProvider>
          <div className="flex min-h-screen flex-col">
            <QuotaWarningBanner />
            <MobileLayoutWrapper>
              {children}
            </MobileLayoutWrapper>
            <UndoToast />
          </div>
        </UndoProvider>
      </TenantSettingsProvider>
    </OfflineProvider>
  )
}
