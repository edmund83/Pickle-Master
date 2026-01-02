'use client'

import { Package, FolderOpen, ListChecks, User, Calendar, FileText, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockCountWizardData } from './StockCountWizard'

interface Folder {
  id: string
  name: string
  color: string | null
  parent_id: string | null
}

interface WizardStepReviewProps {
  data: StockCountWizardData
  folders: Folder[]
}

const scopeConfig = {
  full: {
    label: 'Full Inventory',
    description: 'All items in your inventory',
    icon: Package,
    color: 'nook',
  },
  folder: {
    label: 'Specific Folder',
    description: 'Items in selected folder',
    icon: FolderOpen,
    color: 'blue',
  },
  custom: {
    label: 'Custom Selection',
    description: 'Manually selected items',
    icon: ListChecks,
    color: 'purple',
  },
}

export function WizardStepReview({ data, folders }: WizardStepReviewProps) {
  const scope = scopeConfig[data.scopeType]
  const ScopeIcon = scope.icon

  // Find folder details if folder scope
  const selectedFolder = data.scopeFolderId
    ? folders.find((f) => f.id === data.scopeFolderId)
    : null

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 mx-auto">
          <ClipboardCheck className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">Ready to Start</h3>
        <p className="text-sm text-neutral-500">
          Review your stock count settings before starting
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
        {/* Name */}
        {data.name && (
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Name
              </p>
              <p className="font-medium text-neutral-900">{data.name}</p>
            </div>
          </div>
        )}

        {/* Scope */}
        <div className="flex items-center gap-4 p-4">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              scope.color === 'nook'
                ? 'bg-primary/20 text-primary'
                : scope.color === 'blue'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-purple-100 text-purple-600'
            )}
          >
            <ScopeIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Scope
            </p>
            <p className="font-medium text-neutral-900">{scope.label}</p>
            {data.scopeType === 'folder' && selectedFolder && (
              <p className="text-sm text-neutral-500">
                Folder: {selectedFolder.name}
              </p>
            )}
          </div>
          {data.scopeType === 'full' && data.estimatedItemCount > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-900 tabular-nums">
                {data.estimatedItemCount}
              </p>
              <p className="text-xs text-neutral-500">items</p>
            </div>
          )}
        </div>

        {/* Assigned To */}
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Assigned To
            </p>
            <p className="font-medium text-neutral-900">
              {data.assignedToName || 'Not assigned'}
            </p>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Due Date
            </p>
            <p className="font-medium text-neutral-900">
              {data.dueDate
                ? new Date(data.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'No due date'}
            </p>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="p-4 bg-neutral-50">
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-2">
              Notes
            </p>
            <p className="text-sm text-neutral-600 whitespace-pre-wrap">
              {data.notes}
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <p className="text-sm font-semibold text-primary mb-2">
          What happens next?
        </p>
        <ul className="text-sm text-primary space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-primary/60">1.</span>
            <span>A draft stock count will be created</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary/60">2.</span>
            <span>Click &quot;Start Counting&quot; to begin the count</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary/60">3.</span>
            <span>Count each item and record the actual quantity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary/60">4.</span>
            <span>Review variances and apply adjustments when done</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
