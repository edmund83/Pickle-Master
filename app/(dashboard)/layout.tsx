import { PrimarySidebar } from '@/components/layout/primary-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Primary Sidebar - Always visible */}
      <PrimarySidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
