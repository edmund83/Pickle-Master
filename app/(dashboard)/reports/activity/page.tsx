'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, Filter, Download, Loader2, User, Package, FolderOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ActivityLog } from '@/types/database.types'

const ACTION_ICONS: Record<string, React.ElementType> = {
  create: Package,
  update: Settings,
  delete: Package,
  move: FolderOpen,
  adjust_quantity: Package,
  login: User,
  logout: User,
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  delete: 'bg-red-100 text-red-600',
  move: 'bg-purple-100 text-purple-600',
  adjust_quantity: 'bg-yellow-100 text-yellow-600',
  login: 'bg-neutral-100 text-neutral-600',
  logout: 'bg-neutral-100 text-neutral-600',
}

export default function ActivityReportPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    actionType: '',
    entityType: '',
    dateRange: '7', // days
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [filter])

  async function loadActivities() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      // Calculate date range
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(filter.dateRange))

      // Build query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('activity_logs')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(200)

      if (filter.actionType) {
        query = query.eq('action_type', filter.actionType)
      }
      if (filter.entityType) {
        query = query.eq('entity_type', filter.entityType)
      }

      const { data } = await query
      setActivities((data || []) as ActivityLog[])
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity Name', 'Details']
    const rows = activities.map(a => [
      new Date(a.created_at).toLocaleString(),
      a.user_name || 'System',
      a.action_type,
      a.entity_type,
      a.entity_name || '',
      a.quantity_delta ? `Qty: ${a.quantity_delta > 0 ? '+' : ''}${a.quantity_delta}` : '',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Activity Log</h1>
            <p className="mt-1 text-neutral-500">
              Track all actions and changes in your inventory
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" onClick={exportCSV} disabled={activities.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Action:</label>
              <select
                value={filter.actionType}
                onChange={(e) => setFilter({ ...filter, actionType: e.target.value })}
                className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="move">Move</option>
                <option value="adjust_quantity">Adjust Quantity</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Entity:</label>
              <select
                value={filter.entityType}
                onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
                className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="">All Types</option>
                <option value="item">Items</option>
                <option value="folder">Folders</option>
                <option value="tag">Tags</option>
                <option value="pick_list">Pick Lists</option>
                <option value="purchase_order">Purchase Orders</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Period:</label>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : activities.length > 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white">
            <ul className="divide-y divide-neutral-200">
              {activities.map((activity) => {
                const Icon = ACTION_ICONS[activity.action_type] || Activity
                const colorClass = ACTION_COLORS[activity.action_type] || 'bg-neutral-100 text-neutral-600'

                return (
                  <li key={activity.id} className="flex items-start gap-4 px-6 py-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-neutral-900">
                            <span className="font-medium">{activity.user_name || 'System'}</span>
                            {' '}
                            <span className="text-neutral-600">
                              {activity.action_type.replace('_', ' ')}
                            </span>
                            {' '}
                            {activity.entity_name && (
                              <span className="font-medium">{activity.entity_name}</span>
                            )}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                            <span className="rounded bg-neutral-100 px-2 py-0.5">
                              {activity.entity_type}
                            </span>
                            {activity.quantity_delta && (
                              <span className={`rounded px-2 py-0.5 ${
                                activity.quantity_delta > 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {activity.quantity_delta > 0 ? '+' : ''}{activity.quantity_delta} qty
                              </span>
                            )}
                            {activity.from_folder_name && activity.to_folder_name && (
                              <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-700">
                                {activity.from_folder_name} → {activity.to_folder_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs text-neutral-400">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Activity className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">No activity found</h3>
            <p className="mt-1 text-neutral-500">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
