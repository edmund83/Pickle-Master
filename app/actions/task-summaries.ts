'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/auth/server-auth'

export interface RecentDraft {
    id: string
    display_id: string | null
    type: 'purchase_order' | 'receive' | 'pick_list' | 'stock_count'
    title: string
    updated_at: string
    href: string
}

export interface AssignedTask {
    id: string
    display_id: string | null
    type: 'pick_list' | 'stock_count'
    title: string
    status: string
    due_date: string | null
    href: string
}

export interface TaskSummary {
    recentDrafts: RecentDraft[]
    assignedTasks: AssignedTask[]
    counts: {
        draftPOs: number
        draftReceives: number
        draftPickLists: number
        draftStockCounts: number
        assignedPickLists: number
        assignedStockCounts: number
    }
}

const EMPTY_SUMMARY: TaskSummary = {
    recentDrafts: [],
    assignedTasks: [],
    counts: {
        draftPOs: 0,
        draftReceives: 0,
        draftPickLists: 0,
        draftStockCounts: 0,
        assignedPickLists: 0,
        assignedStockCounts: 0,
    }
}

export async function getTaskSummary(): Promise<TaskSummary> {
    try {
        const authResult = await getAuthContext()
        if (!authResult.success) {
            return EMPTY_SUMMARY
        }

        const { context } = authResult
        const supabase = await createClient()

        // Fetch recent drafts from all task types (last 5 each, sorted by updated_at)
        const [
            draftPOs,
            draftReceives,
            draftPickLists,
            draftStockCounts,
            assignedPickLists,
            assignedStockCounts,
        ] = await Promise.all([
            // Draft POs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
                .from('purchase_orders')
                .select('id, display_id, order_number, updated_at')
                .eq('tenant_id', context.tenantId)
                .eq('status', 'draft')
                .order('updated_at', { ascending: false })
                .limit(5),

            // Draft Receives
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
                .from('receives')
                .select('id, display_id, delivery_note_number, updated_at')
                .eq('tenant_id', context.tenantId)
                .eq('status', 'draft')
                .order('updated_at', { ascending: false })
                .limit(5),

            // Draft Pick Lists
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
                .from('pick_lists')
                .select('id, display_id, name, updated_at')
                .eq('tenant_id', context.tenantId)
                .eq('status', 'draft')
                .order('updated_at', { ascending: false })
                .limit(5),

            // Draft Stock Counts
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
                .from('stock_counts')
                .select('id, display_id, name, updated_at')
                .eq('tenant_id', context.tenantId)
                .eq('status', 'draft')
                .order('updated_at', { ascending: false })
                .limit(5),

            // Assigned Pick Lists (to current user)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
                .from('pick_lists')
                .select('id, display_id, name, status, due_date')
                .eq('tenant_id', context.tenantId)
                .eq('assigned_to', context.userId)
                .in('status', ['draft', 'pending', 'in_progress'])
                .order('due_date', { ascending: true, nullsFirst: false })
                .limit(10),

            // Assigned Stock Counts (to current user)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
                .from('stock_counts')
                .select('id, display_id, name, status, due_date')
                .eq('tenant_id', context.tenantId)
                .eq('assigned_to', context.userId)
                .in('status', ['draft', 'in_progress', 'review'])
                .order('due_date', { ascending: true, nullsFirst: false })
                .limit(10),
        ])

        // Transform to RecentDraft format
        const recentDrafts: RecentDraft[] = []

        if (draftPOs.data) {
            for (const po of draftPOs.data) {
                recentDrafts.push({
                    id: po.id,
                    display_id: po.display_id,
                    type: 'purchase_order',
                    title: po.display_id || po.order_number || `PO-${po.id.slice(0, 8)}`,
                    updated_at: po.updated_at,
                    href: `/tasks/purchase-orders/${po.id}`,
                })
            }
        }

        if (draftReceives.data) {
            for (const rcv of draftReceives.data) {
                recentDrafts.push({
                    id: rcv.id,
                    display_id: rcv.display_id,
                    type: 'receive',
                    title: rcv.display_id || rcv.delivery_note_number || `RCV-${rcv.id.slice(0, 8)}`,
                    updated_at: rcv.updated_at,
                    href: `/tasks/receives/${rcv.id}`,
                })
            }
        }

        if (draftPickLists.data) {
            for (const pl of draftPickLists.data) {
                recentDrafts.push({
                    id: pl.id,
                    display_id: pl.display_id,
                    type: 'pick_list',
                    title: pl.display_id || pl.name || `PL-${pl.id.slice(0, 8)}`,
                    updated_at: pl.updated_at,
                    href: `/tasks/pick-lists/${pl.id}`,
                })
            }
        }

        if (draftStockCounts.data) {
            for (const sc of draftStockCounts.data) {
                recentDrafts.push({
                    id: sc.id,
                    display_id: sc.display_id,
                    type: 'stock_count',
                    title: sc.display_id || sc.name || `SC-${sc.id.slice(0, 8)}`,
                    updated_at: sc.updated_at,
                    href: `/tasks/stock-count/${sc.id}`,
                })
            }
        }

        // Sort all drafts by updated_at desc and take top 8
        recentDrafts.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        const topDrafts = recentDrafts.slice(0, 8)

        // Transform assigned tasks
        const assignedTasks: AssignedTask[] = []

        if (assignedPickLists.data) {
            for (const pl of assignedPickLists.data) {
                assignedTasks.push({
                    id: pl.id,
                    display_id: pl.display_id,
                    type: 'pick_list',
                    title: pl.display_id || pl.name || `PL-${pl.id.slice(0, 8)}`,
                    status: pl.status,
                    due_date: pl.due_date,
                    href: `/tasks/pick-lists/${pl.id}`,
                })
            }
        }

        if (assignedStockCounts.data) {
            for (const sc of assignedStockCounts.data) {
                assignedTasks.push({
                    id: sc.id,
                    display_id: sc.display_id,
                    type: 'stock_count',
                    title: sc.display_id || sc.name || `SC-${sc.id.slice(0, 8)}`,
                    status: sc.status,
                    due_date: sc.due_date,
                    href: `/tasks/stock-count/${sc.id}`,
                })
            }
        }

        // Sort assigned tasks by due date (soonest first)
        assignedTasks.sort((a, b) => {
            if (!a.due_date && !b.due_date) return 0
            if (!a.due_date) return 1
            if (!b.due_date) return -1
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })

        return {
            recentDrafts: topDrafts,
            assignedTasks,
            counts: {
                draftPOs: draftPOs.data?.length || 0,
                draftReceives: draftReceives.data?.length || 0,
                draftPickLists: draftPickLists.data?.length || 0,
                draftStockCounts: draftStockCounts.data?.length || 0,
                assignedPickLists: assignedPickLists.data?.length || 0,
                assignedStockCounts: assignedStockCounts.data?.length || 0,
            }
        }
    } catch (error) {
        console.error('Failed to fetch task summary:', error)
        return EMPTY_SUMMARY
    }
}
