'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, FolderOpen, Package, Loader2, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ActivityLog } from '@/types/database.types'

export default function StockMovementPage() {
  const [movements, setMovements] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    loadMovements()
  }, [dateRange])

  async function loadMovements() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

       
      const { data } = await (supabase as any)
        .from('activity_logs')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .in('action_type', ['move', 'adjust_quantity'])
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(200)

      setMovements((data || []) as ActivityLog[])
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    const headers = ['Date', 'User', 'Item', 'Action', 'From', 'To', 'Quantity Change']
    const rows = movements.map(m => [
      m.created_at ? new Date(m.created_at).toLocaleString() : '',
      m.user_name || 'System',
      m.entity_name || '',
      m.action_type,
      m.from_folder_name || '-',
      m.to_folder_name || '-',
      m.quantity_delta ? `${m.quantity_delta > 0 ? '+' : ''}${m.quantity_delta}` : '-',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-movement-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Calculate summary stats
  const totalMoves = movements.filter(m => m.action_type === 'move').length
  const totalAdjustments = movements.filter(m => m.action_type === 'adjust_quantity').length
  const netQuantityChange = movements.reduce((sum, m) => sum + (m.quantity_delta || 0), 0)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Stock Movement Report</h1>
            <p className="mt-1 text-neutral-500">
              Track item movements and quantity adjustments
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <Button variant="outline" onClick={exportCSV} disabled={movements.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-500">Total Moves</p>
            <p className="text-2xl font-semibold text-purple-600">{totalMoves}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-500">Quantity Adjustments</p>
            <p className="text-2xl font-semibold text-blue-600">{totalAdjustments}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-500">Net Quantity Change</p>
            <p className={`text-2xl font-semibold ${
              netQuantityChange > 0 ? 'text-green-600' : netQuantityChange < 0 ? 'text-red-600' : 'text-neutral-600'
            }`}>
              {netQuantityChange > 0 ? '+' : ''}{netQuantityChange}
            </p>
          </div>
        </div>

        {/* Movement List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : movements.length > 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white">
            <ul className="divide-y divide-neutral-200">
              {movements.map((movement) => (
                <li key={movement.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    movement.action_type === 'move'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {movement.action_type === 'move' ? (
                      <ArrowRight className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900">
                      {movement.entity_name || 'Unknown Item'}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                      {movement.action_type === 'move' && movement.from_folder_name && movement.to_folder_name ? (
                        <>
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3 text-accent" fill="oklch(95% 0.08 85.79)" />
                            {movement.from_folder_name}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3 text-accent" fill="oklch(95% 0.08 85.79)" />
                            {movement.to_folder_name}
                          </span>
                        </>
                      ) : movement.quantity_delta ? (
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                          movement.quantity_delta > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {movement.quantity_delta > 0 ? '+' : ''}{movement.quantity_delta} quantity
                        </span>
                      ) : null}
                      <span className="text-neutral-400">•</span>
                      <span>{movement.user_name || 'System'}</span>
                    </div>
                  </div>

                  <span className="flex-shrink-0 text-sm text-neutral-400">
                    {movement.created_at ? new Date(movement.created_at).toLocaleString() : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <ArrowRight className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">No stock movements</h3>
            <p className="mt-1 text-neutral-500">
              No items have been moved or adjusted in the selected period
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
