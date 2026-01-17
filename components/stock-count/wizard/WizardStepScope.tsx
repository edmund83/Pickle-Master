'use client'

import { useState } from 'react'
import { Package, FolderOpen, ListChecks, ChevronRight, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { StockCountWizardData } from './StockCountWizard'

interface Folder {
  id: string
  name: string
  color: string | null
  parent_id: string | null
}

interface WizardStepScopeProps {
  data: StockCountWizardData
  updateData: (updates: Partial<StockCountWizardData>) => void
  folders: Folder[]
  totalItemCount: number
}

const SCOPE_OPTIONS = [
  {
    id: 'full' as const,
    title: 'Full Inventory',
    description: 'Count all items in your inventory',
    icon: Package,
    color: 'primary',
  },
  {
    id: 'folder' as const,
    title: 'Specific Folder',
    description: 'Count items in a selected folder',
    icon: FolderOpen,
    color: 'blue',
  },
  {
    id: 'custom' as const,
    title: 'Custom Selection',
    description: 'Manually select which items to count',
    icon: ListChecks,
    color: 'purple',
  },
]

export function WizardStepScope({
  data,
  updateData,
  folders,
  totalItemCount,
}: WizardStepScopeProps) {
  const [showFolderPicker, setShowFolderPicker] = useState(data.scopeType === 'folder')

  function handleScopeSelect(scopeType: 'full' | 'folder' | 'custom') {
    if (scopeType === 'folder') {
      setShowFolderPicker(true)
      updateData({
        scopeType,
        estimatedItemCount: 0, // Will be updated when folder is selected
      })
    } else {
      setShowFolderPicker(false)
      updateData({
        scopeType,
        scopeFolderId: null,
        scopeFolderName: null,
        estimatedItemCount: scopeType === 'full' ? totalItemCount : 0,
      })
    }
  }

  function handleFolderSelect(folder: Folder) {
    updateData({
      scopeFolderId: folder.id,
      scopeFolderName: folder.name,
      // Note: In a real implementation, we'd fetch the item count for this folder
      // For now, we'll show "Items in folder" without a count
    })
  }

  // Get root folders (no parent) for the picker
  const rootFolders = folders.filter(f => f.parent_id === null)

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Name Input (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Count Name <span className="text-neutral-400">(optional)</span>
        </label>
        <Input
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="e.g., Monthly Inventory Check"
          className="h-12"
        />
        <p className="text-xs text-neutral-500">
          Give your stock count a name to easily identify it later
        </p>
      </div>

      {/* Scope Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">
          What do you want to count?
        </label>

        <div className="space-y-3">
          {SCOPE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = data.scopeType === option.id

            return (
              <button
                key={option.id}
                onClick={() => handleScopeSelect(option.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4',
                  'rounded-2xl border-2 text-left',
                  'transition-all duration-200',
                  'active:scale-[0.98]',
                  isSelected
                    ? option.color === 'primary'
                      ? 'border-primary bg-primary/10'
                      : option.color === 'blue'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-purple-500 bg-purple-50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    isSelected
                      ? option.color === 'primary'
                        ? 'bg-primary text-white'
                        : option.color === 'blue'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white'
                      : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900">{option.title}</h4>
                  <p className="text-sm text-neutral-500">{option.description}</p>
                </div>

                {isSelected && (
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      option.color === 'primary'
                        ? 'bg-primary'
                        : option.color === 'blue'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    )}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Folder Picker (shown when 'folder' scope is selected) */}
      {showFolderPicker && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-sm font-medium text-neutral-700">
            Select a folder
          </label>

          {rootFolders.length > 0 ? (
            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
              {rootFolders.map((folder) => {
                const isSelected = data.scopeFolderId === folder.id

                return (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderSelect(folder)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4',
                      'text-left transition-colors',
                      isSelected
                        ? 'bg-blue-50'
                        : 'hover:bg-neutral-50'
                    )}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: folder.color
                          ? `${folder.color}20`
                          : '#f5f5f5',
                      }}
                    >
                      <FolderOpen
                        className="h-5 w-5"
                        style={{
                          color: folder.color || '#737373',
                        }}
                      />
                    </div>

                    <span className="flex-1 font-medium text-neutral-900">
                      {folder.name}
                    </span>

                    {isSelected ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <ChevronRight className="h-5 w-5 text-neutral-300" />
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center border border-neutral-200 rounded-xl bg-neutral-50">
              <FolderOpen className="h-8 w-8 text-accent mx-auto mb-2" fill="oklch(95% 0.08 85.79)" />
              <p className="text-sm text-neutral-500">
                No folders found. Create folders in your inventory first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Custom Selection Notice */}
      {data.scopeType === 'custom' && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl animate-in fade-in duration-200">
          <p className="text-sm text-purple-700">
            After creating the stock count, you&apos;ll be able to select specific items to include.
          </p>
        </div>
      )}

      {/* Item Count Preview */}
      {data.scopeType === 'full' && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary">Items to count</span>
            <span className="text-lg font-bold text-primary tabular-nums">
              {totalItemCount}
            </span>
          </div>
        </div>
      )}

      {data.scopeType === 'folder' && data.scopeFolderId && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Selected: <strong>{data.scopeFolderName}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
