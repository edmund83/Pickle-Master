import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import type { Profile, InventoryItem, ActivityLog } from '@/types/database.types'

interface DashboardData {
  profile: Profile | null
  stats: {
    totalItems: number
    totalValue: number
    lowStock: number
    outOfStock: number
  } | null
  recentActivity: ActivityLog[]
}

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  if (!profile || !profile.tenant_id) {
    return { profile, stats: null, recentActivity: [] }
  }

  // Get inventory stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase as any)
    .from('inventory_items')
    .select('id, quantity, status, price')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  const itemsList = (items || []) as Pick<InventoryItem, 'id' | 'quantity' | 'status' | 'price'>[]

  const stats = {
    totalItems: itemsList.length,
    totalValue: itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    lowStock: itemsList.filter(item => item.status === 'low_stock').length,
    outOfStock: itemsList.filter(item => item.status === 'out_of_stock').length,
  }

  // Get recent activity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentActivity } = await (supabase as any)
    .from('activity_logs')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile,
    stats,
    recentActivity: (recentActivity || []) as ActivityLog[]
  }
}

export default async function DashboardPage() {
  const { profile, stats, recentActivity } = await getDashboardData()

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-neutral-500">
          Here&apos;s what&apos;s happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Items"
            value={stats?.totalItems || 0}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Total Value"
            value={`RM ${(stats?.totalValue || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Low Stock"
            value={stats?.lowStock || 0}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Out of Stock"
            value={stats?.outOfStock || 0}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Recent Activity</h2>
          <div className="rounded-xl border border-neutral-200 bg-white">
            {recentActivity.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {activity.action_type.replace('_', ' ')} - {activity.entity_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          by {activity.user_name || 'System'}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-neutral-500">No recent activity</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Activity will appear here when you start managing inventory
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
