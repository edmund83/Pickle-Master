import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PieChart, BarChart3 } from 'lucide-react'
import type { Profile, InventoryItem, ActivityLog, Folder } from '@/types/database.types'
import { InventorySummaryChart } from '@/components/dashboard/inventory-summary-chart'
import { InventoryValueChart } from '@/components/dashboard/inventory-value-chart'
import { WorkflowShortcuts } from '@/components/dashboard/workflow-shortcuts'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { FormattedStatCards } from '@/components/dashboard/FormattedStatCards'

interface DashboardData {
  profile: Profile | null
  stats: {
    totalItems: number
    totalValue: number
    totalProfit: number
    lowStock: number
    outOfStock: number
  } | null
  chartData: {
    statusData: { name: string; value: number; color: string }[]
    valueByFolder: { name: string; value: number }[]
  }
  recentActivity: ActivityLog[]
}

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

   
  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  if (!profile || !profile.tenant_id) {
    return {
      profile,
      stats: null,
      chartData: { statusData: [], valueByFolder: [] },
      recentActivity: []
    }
  }

  // Get inventory stats
   
  const { data: items } = await (supabase as any)
    .from('inventory_items')
    .select('id, quantity, status, price, cost_price, folder_id')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  const itemsList = (items || []) as Pick<InventoryItem, 'id' | 'quantity' | 'status' | 'price' | 'cost_price' | 'folder_id'>[]

  // Get folders for mapping
   
  const { data: folders } = await (supabase as any)
    .from('folders')
    .select('id, name')
    .eq('tenant_id', profile.tenant_id)

  const foldersMap = new Map<string, string>()
  if (folders) {
    (folders as Folder[]).forEach(f => foldersMap.set(f.id, f.name))
  }

  // --- Aggregate Stats ---
  const stats = {
    totalItems: itemsList.length,
    totalValue: itemsList.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0),
    totalProfit: itemsList.reduce((sum, item) => {
      if (item.cost_price && item.cost_price > 0) {
        const margin = (item.price || 0) - item.cost_price
        return sum + (margin * item.quantity)
      }
      return sum
    }, 0),
    lowStock: itemsList.filter(item => item.status === 'low_stock').length,
    outOfStock: itemsList.filter(item => item.status === 'out_of_stock').length,
  }

  // --- Chart Data: Status ---
  const inStock = itemsList.filter(item => item.status === 'in_stock' || !item.status).length
  const lowStock = stats.lowStock
  const outOfStock = stats.outOfStock
  // We don't seemingly have "checked_out" status on item level directly unless quantity decremented or generic.
  // The system earlier decided: "Available" vs "Checked Out" logic.
  // For this chart, let's stick to the Item Status enum.

  const statusData = [
    { name: 'In Stock', value: inStock, color: '#10B981' }, // Green
    { name: 'Low Stock', value: lowStock, color: '#F59E0B' }, // Amber
    { name: 'Out of Stock', value: outOfStock, color: '#EF4444' }, // Red
  ].filter(d => d.value > 0)

  // --- Chart Data: Value by Folder ---
  const valueByFolderMap = new Map<string, number>()
  itemsList.forEach(item => {
    const folderName = item.folder_id ? (foldersMap.get(item.folder_id) || 'Uncategorized') : 'Uncategorized'
    const itemValue = (item.price || 0) * item.quantity
    valueByFolderMap.set(folderName, (valueByFolderMap.get(folderName) || 0) + itemValue)
  })

  const valueByFolder = Array.from(valueByFolderMap.entries()).map(([name, value]) => ({ name, value }))

  // Get recent activity
   
  const { data: recentActivity } = await (supabase as any)
    .from('activity_logs')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile,
    stats,
    chartData: { statusData, valueByFolder },
    recentActivity: (recentActivity || []) as ActivityLog[]
  }
}

export default async function DashboardPage() {
  const { profile, stats, chartData, recentActivity } = await getDashboardData()

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header - Mobile optimized */}
      <div className="border-b border-neutral-200 bg-white px-4 py-4 lg:px-8 lg:py-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm lg:text-base text-neutral-500">
          Here&apos;s what&apos;s happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid - Uses tenant settings for currency formatting */}
      <div className="p-4 lg:p-8">
        <FormattedStatCards stats={stats} />

        {/* Workflow Shortcuts */}
        <WorkflowShortcuts />

        {/* Charts Grid - Hide on mobile, show on tablet+ */}
        <div className="hidden md:grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900">Inventory Status</h2>
            </div>
            <InventorySummaryChart data={chartData.statusData} />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900">Top Value Categories</h2>
            </div>
            <InventoryValueChart data={chartData.valueByFolder} />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  )
}
