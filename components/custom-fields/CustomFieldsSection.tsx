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
}

export function CustomFieldsSection({ values, onChange, disabled }: CustomFieldsSectionProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single()

        if (!profile?.tenant_id) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('custom_field_definitions')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('sort_order', { ascending: true })

        setFields((data || []) as CustomFieldDefinition[])
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

  // Don't render anything if no custom fields are defined
  if (!loading && fields.length === 0) {
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
          {fields.length > 0 && (
            <span className="text-sm text-neutral-500">
              ({fields.length} field{fields.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <Link
          href="/settings/custom-fields"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-pickle-600 hover:text-pickle-700"
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
              {fields.map((field) => (
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
