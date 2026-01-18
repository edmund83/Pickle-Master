'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CustomFieldInput } from './CustomFieldInput'
import type { CustomFieldDefinition } from '@/types/database.types'
import Link from 'next/link'

interface CustomFieldsSectionProps {
  values: Record<string, unknown>
  onChange: (values: Record<string, unknown>) => void
  disabled?: boolean
  folderId?: string | null // Current item's folder - used to filter fields
}

export function CustomFieldsSection({ values, onChange, disabled, folderId }: CustomFieldsSectionProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const [fieldFolders, setFieldFolders] = useState<Record<string, string[]>>({}) // fieldId -> folderIds
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-expand if any custom field has a value
  useEffect(() => {
    if (Object.keys(values).some(key => values[key] !== null && values[key] !== undefined && values[key] !== '')) {
      setIsExpanded(true)
    }
  }, [values])

  useEffect(() => {
    async function loadFields() {
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

        // Load custom fields and field-folder associations in parallel
         
        const [fieldsResult, fieldFoldersResult] = await Promise.all([
          (supabase as any)
            .from('custom_field_definitions')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .order('sort_order', { ascending: true }),
          (supabase as any)
            .from('custom_field_folders')
            .select('custom_field_id, folder_id')
            .eq('tenant_id', profile.tenant_id),
        ])

        setFields((fieldsResult.data || []) as CustomFieldDefinition[])

        // Build fieldId -> folderIds map
        const ffMap: Record<string, string[]> = {}
        for (const row of (fieldFoldersResult.data || [])) {
          if (!ffMap[row.custom_field_id]) {
            ffMap[row.custom_field_id] = []
          }
          ffMap[row.custom_field_id].push(row.folder_id)
        }
        setFieldFolders(ffMap)
      } finally {
        setLoading(false)
      }
    }

    loadFields()
  }, [])

  const handleFieldChange = (fieldId: string, value: unknown) => {
    onChange({
      ...values,
      [fieldId]: value,
    })
  }

  // Filter fields based on folder association
  // A field shows if:
  // 1. It has no folder associations (global field), OR
  // 2. It's associated with the current folder
  const relevantFields = fields.filter(field => {
    const associatedFolders = fieldFolders[field.id] || []
    // Global field (no folder associations) - shows for all items
    if (associatedFolders.length === 0) return true
    // Folder-specific field - only show if item is in one of the associated folders
    if (folderId && associatedFolders.includes(folderId)) return true
    // Item has no folder, only show global fields
    return false
  })

  // Don't render anything if no relevant custom fields
  if (!loading && relevantFields.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* Header - Collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-neutral-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-neutral-500" />
          )}
          <h3 className="text-lg font-medium text-neutral-900">Custom Fields</h3>
          {relevantFields.length > 0 && (
            <span className="text-sm text-neutral-500">
              ({relevantFields.length} field{relevantFields.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <Link
          href="/settings/custom-fields"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary"
        >
          <Settings className="h-4 w-4" />
          Manage
        </Link>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 px-6 py-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-neutral-200 rounded" />
              <div className="h-10 bg-neutral-200 rounded" />
            </div>
          ) : (
            <div className="space-y-4">
              {relevantFields.map((field) => (
                <div key={field.id}>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    {field.name}
                    {field.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </label>
                  <CustomFieldInput
                    field={field}
                    value={values[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
