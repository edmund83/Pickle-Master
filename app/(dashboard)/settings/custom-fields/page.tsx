'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Database,
  GripVertical,
  Type,
  Hash,
  Calendar,
  Clock,
  ToggleLeft,
  List,
  ListChecks,
  Link2,
  Mail,
  Phone,
  DollarSign,
  Percent,
} from 'lucide-react'
import type { CustomFieldDefinition, Folder } from '@/types/database.types'
import { FolderIcon } from 'lucide-react'

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type, description: 'Single line text' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric value' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'datetime', label: 'Date & Time', icon: Clock, description: 'Date and time picker' },
  { value: 'boolean', label: 'Yes/No', icon: ToggleLeft, description: 'Toggle switch' },
  { value: 'select', label: 'Dropdown', icon: List, description: 'Single selection from options' },
  { value: 'multi_select', label: 'Multi-Select', icon: ListChecks, description: 'Multiple selections' },
  { value: 'url', label: 'URL', icon: Link2, description: 'Web link' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email address' },
  { value: 'phone', label: 'Phone', icon: Phone, description: 'Phone number' },
  { value: 'currency', label: 'Currency', icon: DollarSign, description: 'Money value' },
  { value: 'percentage', label: 'Percentage', icon: Percent, description: 'Percentage value' },
] as const

const MAX_CUSTOM_FIELDS = 20

const SUGGESTED_FIELDS = [
  { name: 'Serial Number', field_type: 'text' as const, icon: Type },
  { name: 'Model/Part Number', field_type: 'text' as const, icon: Type },
  { name: 'Purchase Date', field_type: 'date' as const, icon: Calendar },
  { name: 'Expiry Date', field_type: 'date' as const, icon: Calendar },
  { name: 'Product Link', field_type: 'url' as const, icon: Link2 },
  { name: 'Size', field_type: 'text' as const, icon: Type },
  { name: 'Purchase Price', field_type: 'currency' as const, icon: DollarSign },
  { name: 'Warranty Expiry', field_type: 'date' as const, icon: Calendar },
  { name: 'Supplier/Vendor', field_type: 'text' as const, icon: Type },
  { name: 'Condition', field_type: 'select' as const, icon: List, options: ['New', 'Good', 'Fair', 'Poor'] },
]

type FieldType = typeof FIELD_TYPES[number]['value']

interface FormData {
  name: string
  field_type: FieldType
  required: boolean
  options: string[]
  folderIds: string[] // Empty array = all folders (global)
}

const defaultFormData: FormData = {
  name: '',
  field_type: 'text',
  required: false,
  options: [],
  folderIds: [],
}

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [fieldFolders, setFieldFolders] = useState<Record<string, string[]>>({}) // fieldId -> folderIds
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optionInput, setOptionInput] = useState('')

  const loadFields = useCallback(async () => {
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
      setTenantId(profile.tenant_id)

      // Load custom fields, folders, and field-folder associations in parallel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [fieldsResult, foldersResult, fieldFoldersResult] = await Promise.all([
        (supabase as any)
          .from('custom_field_definitions')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('sort_order', { ascending: true }),
        (supabase as any)
          .from('folders')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('name', { ascending: true }),
        (supabase as any)
          .from('custom_field_folders')
          .select('custom_field_id, folder_id')
          .eq('tenant_id', profile.tenant_id),
      ])

      setFields((fieldsResult.data || []) as CustomFieldDefinition[])
      setFolders((foldersResult.data || []) as Folder[])

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
  }, [])

  useEffect(() => {
    loadFields()
  }, [loadFields])

  const handleCreate = async () => {
    if (!formData.name.trim() || !tenantId) return

    if (fields.length >= MAX_CUSTOM_FIELDS) {
      setError(`Maximum of ${MAX_CUSTOM_FIELDS} custom fields allowed`)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const maxSortOrder = fields.length > 0
        ? Math.max(...fields.map(f => f.sort_order || 0))
        : 0

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newField, error: insertError } = await (supabase as any)
        .from('custom_field_definitions')
        .insert({
          tenant_id: tenantId,
          name: formData.name.trim(),
          field_type: formData.field_type,
          required: formData.required,
          options: formData.options.length > 0 ? formData.options : null,
          sort_order: maxSortOrder + 1,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      // Save folder associations if any folders are selected
      if (formData.folderIds.length > 0 && newField?.id) {
        const folderAssociations = formData.folderIds.map(folderId => ({
          custom_field_id: newField.id,
          folder_id: folderId,
          tenant_id: tenantId,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('custom_field_folders')
          .insert(folderAssociations)
      }

      setShowForm(false)
      setFormData(defaultFormData)
      setOptionInput('')
      loadFields()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create field')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim() || !tenantId) return

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('custom_field_definitions')
        .update({
          name: formData.name.trim(),
          field_type: formData.field_type,
          required: formData.required,
          options: formData.options.length > 0 ? formData.options : null,
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Update folder associations: delete existing and insert new
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('custom_field_folders')
        .delete()
        .eq('custom_field_id', id)

      if (formData.folderIds.length > 0) {
        const folderAssociations = formData.folderIds.map(folderId => ({
          custom_field_id: id,
          folder_id: folderId,
          tenant_id: tenantId,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('custom_field_folders')
          .insert(folderAssociations)
      }

      setEditingId(null)
      setFormData(defaultFormData)
      setOptionInput('')
      loadFields()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom field? This will remove the field from all items.')) return

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('custom_field_definitions')
      .delete()
      .eq('id', id)

    if (!deleteError) {
      loadFields()
    }
  }

  const handleAddSuggested = async (suggested: typeof SUGGESTED_FIELDS[number]) => {
    // Skip if field with same name already exists
    if (fields.some(f => f.name.toLowerCase() === suggested.name.toLowerCase())) {
      return
    }

    if (!tenantId) return

    if (fields.length >= MAX_CUSTOM_FIELDS) {
      setError(`Maximum of ${MAX_CUSTOM_FIELDS} custom fields allowed`)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const maxSortOrder = fields.length > 0
        ? Math.max(...fields.map(f => f.sort_order || 0))
        : 0

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('custom_field_definitions')
        .insert({
          tenant_id: tenantId,
          name: suggested.name,
          field_type: suggested.field_type,
          required: false,
          options: 'options' in suggested ? suggested.options : null,
          sort_order: maxSortOrder + 1,
        })

      if (insertError) throw insertError

      loadFields()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add field')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (field: CustomFieldDefinition) => {
    setEditingId(field.id)
    setFormData({
      name: field.name,
      field_type: field.field_type as FieldType,
      required: field.required || false,
      options: Array.isArray(field.options) ? field.options as string[] : [],
      folderIds: fieldFolders[field.id] || [],
    })
    setShowForm(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData(defaultFormData)
    setOptionInput('')
    setError(null)
  }

  const addOption = () => {
    if (!optionInput.trim()) return
    if (formData.options.includes(optionInput.trim())) return
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, optionInput.trim()],
    }))
    setOptionInput('')
  }

  const removeOption = (option: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(o => o !== option),
    }))
  }

  const getFieldIcon = (fieldType: string) => {
    const type = FIELD_TYPES.find(t => t.value === fieldType)
    return type?.icon || Type
  }

  const needsOptions = formData.field_type === 'select' || formData.field_type === 'multi_select'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-900">Custom Fields</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
              fields.length >= MAX_CUSTOM_FIELDS
                ? 'bg-red-100 text-red-700'
                : 'bg-neutral-100 text-neutral-600'
            }`}>
              {fields.length}/{MAX_CUSTOM_FIELDS}
            </span>
          </div>
          <p className="text-neutral-500">
            Define custom fields to capture additional data for your inventory items
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData(defaultFormData)
            setOptionInput('')
          }}
          disabled={showForm || fields.length >= MAX_CUSTOM_FIELDS}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Field
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium text-neutral-900">Create New Field</h3>
          <FieldForm
            formData={formData}
            setFormData={setFormData}
            optionInput={optionInput}
            setOptionInput={setOptionInput}
            addOption={addOption}
            removeOption={removeOption}
            needsOptions={needsOptions}
            saving={saving}
            onSave={handleCreate}
            onCancel={() => {
              setShowForm(false)
              setFormData(defaultFormData)
              setOptionInput('')
              setError(null)
            }}
            folders={folders}
          />
        </div>
      )}

      {/* Quick Add */}
      {(() => {
        const availableSuggestions = SUGGESTED_FIELDS.filter(
          s => !fields.some(f => f.name.toLowerCase() === s.name.toLowerCase())
        )
        const remainingSlots = MAX_CUSTOM_FIELDS - fields.length
        // Hide Quick Add if at limit or no suggestions available
        if (availableSuggestions.length === 0 || remainingSlots <= 0) return null
        return (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Quick Add
              </p>
              {remainingSlots < 5 && (
                <p className="text-xs text-amber-600">
                  {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {availableSuggestions.map((suggested) => {
                const Icon = suggested.icon
                return (
                  <button
                    key={suggested.name}
                    onClick={() => handleAddSuggested(suggested)}
                    disabled={saving || remainingSlots <= 0}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left transition-all hover:border-pickle-500 hover:bg-pickle-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">{suggested.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Fields List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : fields.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-200">
            {fields.map((field) => {
              const Icon = getFieldIcon(field.field_type)
              const isEditing = editingId === field.id

              return (
                <li key={field.id} className="px-6 py-4">
                  {isEditing ? (
                    <FieldForm
                      formData={formData}
                      setFormData={setFormData}
                      optionInput={optionInput}
                      setOptionInput={setOptionInput}
                      addOption={addOption}
                      removeOption={removeOption}
                      needsOptions={needsOptions}
                      saving={saving}
                      onSave={() => handleUpdate(field.id)}
                      onCancel={cancelEdit}
                      folders={folders}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-4 w-4 text-neutral-300 cursor-grab" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                          <Icon className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{field.name}</span>
                            {field.required && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-500">
                            {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
                            {Array.isArray(field.options) && field.options.length > 0 && (
                              <span className="ml-2 text-neutral-400">
                                ({field.options.length} options)
                              </span>
                            )}
                          </p>
                          {/* Folder chips */}
                          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                            <FolderIcon className="h-3 w-3" />
                            {fieldFolders[field.id]?.length > 0 ? (
                              <span>
                                {fieldFolders[field.id]
                                  .map(fid => folders.find(f => f.id === fid)?.name)
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            ) : (
                              <span>All folders</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(field)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(field.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Database className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No custom fields yet</h3>
          <p className="mt-1 text-neutral-500">
            Create custom fields to capture additional item data
          </p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first field
          </Button>
        </div>
      )}
    </div>
  )
}

interface FieldFormProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  optionInput: string
  setOptionInput: React.Dispatch<React.SetStateAction<string>>
  addOption: () => void
  removeOption: (option: string) => void
  needsOptions: boolean
  saving: boolean
  onSave: () => void
  onCancel: () => void
  folders: Folder[]
}

function FieldForm({
  formData,
  setFormData,
  optionInput,
  setOptionInput,
  addOption,
  removeOption,
  needsOptions,
  saving,
  onSave,
  onCancel,
  folders,
}: FieldFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Field Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Field Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Serial Number, Warranty Date"
            autoFocus
          />
        </div>

        {/* Field Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Field Type
          </label>
          <select
            value={formData.field_type}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              field_type: e.target.value as FieldType,
              options: [],
            }))}
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Options (for select/multi_select) */}
      {needsOptions && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Options
          </label>
          <div className="flex gap-2">
            <Input
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              placeholder="Add an option..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addOption()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addOption}>
              Add
            </Button>
          </div>
          {formData.options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.options.map((option) => (
                <span
                  key={option}
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm"
                >
                  {option}
                  <button
                    type="button"
                    onClick={() => removeOption(option)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Required Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={formData.required}
          onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
          className="h-4 w-4 rounded border-neutral-300 text-pickle-600 focus:ring-pickle-500"
        />
        <label htmlFor="required" className="text-sm text-neutral-700">
          This field is required when adding/editing items
        </label>
      </div>

      {/* Folder Selection */}
      {folders.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Applies to Folders
          </label>
          <p className="mb-2 text-xs text-neutral-500">
            Leave empty to show this field for all items, or select specific folders
          </p>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2">
            {folders.map((folder) => (
              <label
                key={folder.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={formData.folderIds.includes(folder.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        folderIds: [...prev.folderIds, folder.id],
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        folderIds: prev.folderIds.filter(id => id !== folder.id),
                      }))
                    }
                  }}
                  className="h-4 w-4 rounded border-neutral-300 text-pickle-600 focus:ring-pickle-500"
                />
                <FolderIcon className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-700">{folder.name}</span>
              </label>
            ))}
          </div>
          {formData.folderIds.length > 0 && (
            <p className="mt-1 text-xs text-pickle-600">
              {formData.folderIds.length} folder{formData.folderIds.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving || !formData.name.trim()}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  )
}
