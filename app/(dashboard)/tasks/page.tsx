import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Clock, User, FileText, Package, BarChart3, ChevronRight, PackagePlus, PackageMinus, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { getTaskSummary } from '@/app/actions/task-summaries'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'

// This page uses cookies for authentication, so it must be rendered dynamically
export const dynamic = 'force-dynamic'

const quickActions = [
  {
    href: '/tasks/inbound',
    title: 'Stock In',
    description: 'Receive inventory from purchases',
    icon: PackagePlus,
  },
  {
    href: '/tasks/fulfillment',
    title: 'Stock Out',
    description: 'Fulfill orders and shipments',
    icon: PackageMinus,
  },
  {
    href: '/tasks/inventory-operations',
    title: 'Adjustments',
    description: 'Modify stock levels and corrections',
    icon: SlidersHorizontal,
  },
  {
    href: '/tasks/reorder-suggestions',
    title: 'Reorder',
    description: 'Items running low and need restocking',
    icon: RefreshCw,
  },
]

const typeIcons = {
  purchase_order: FileText,
  receive: Package,
  pick_list: ClipboardList,
  stock_count: BarChart3,
}

const typeLabels = {
  purchase_order: 'PO',
  receive: 'Receive',
  pick_list: 'Pick List',
  stock_count: 'Stock Count',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  in_progress: 'bg-primary/10 text-primary',
  review: 'bg-amber-100 text-amber-700',
}

export default async function TasksPage() {
  const summary = await getTaskSummary()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-neutral-900">Tasks</h1>
        <p className="text-neutral-500">Manage inventory operations</p>
      </div>

      <div className="space-y-6 p-6">
        {/* Recent Drafts Section */}
        {summary.recentDrafts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-neutral-400" />
              <h2 className="text-xs font-semibold tracking-wider text-primary uppercase">Recent Drafts</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {summary.recentDrafts.map((draft) => {
                const Icon = typeIcons[draft.type]
                return (
                  <Link
                    key={draft.id}
                    href={draft.href}
                    aria-label={`Continue ${typeLabels[draft.type]}: ${draft.title}`}
                    className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 transition-all hover:border-neutral-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-neutral-200" aria-hidden="true">
                      <Icon className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">{draft.title}</p>
                      <p className="text-xs text-neutral-500">
                        {typeLabels[draft.type]} · <FormattedShortDate date={draft.updated_at} />
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Assigned to Me Section */}
        {summary.assignedTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-neutral-400" />
              <h2 className="text-xs font-semibold tracking-wider text-primary uppercase">Assigned to Me</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {summary.assignedTasks.slice(0, 8).map((task) => {
                const Icon = typeIcons[task.type]
                return (
                  <Link
                    key={task.id}
                    href={task.href}
                    aria-label={`View assigned ${task.type === 'pick_list' ? 'Pick List' : 'Stock Count'}: ${task.title}`}
                    className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 transition-all hover:border-neutral-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15" aria-hidden="true">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[task.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-neutral-500">
                            Due <FormattedShortDate date={task.due_date} />
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                      <Icon className="h-5 w-5 text-neutral-600" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
