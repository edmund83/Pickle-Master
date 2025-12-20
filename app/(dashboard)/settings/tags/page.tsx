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
  Tag,
} from 'lucide-react'
import type { Tag as TagType } from '@/types/database.types'

const TAG_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6b7280', label: 'Gray' },
]

export default function TagsSettingsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadTags = useCallback(async () => {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('tags')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name', { ascending: true })

      setTags((data || []) as TagType[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  async function handleCreate() {
    if (!formData.name.trim() || !tenantId) return

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('tags')
        .insert({
          tenant_id: tenantId,
          name: formData.name.trim(),
          color: formData.color,
        })

      if (insertError) throw insertError

      setShowForm(false)
      setFormData({ name: '', color: '#3b82f6' })
      loadTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!formData.name.trim()) return

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('tags')
        .update({
          name: formData.name.trim(),
          color: formData.color,
        })
        .eq('id', id)

      if (updateError) throw updateError

      setEditingId(null)
      setFormData({ name: '', color: '#3b82f6' })
      loadTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('tags')
      .delete()
      .eq('id', id)

    if (!deleteError) {
      setDeleteConfirm(null)
      loadTags()
    }
  }

  function startEdit(tag: TagType) {
    setEditingId(tag.id)
    setFormData({
      name: tag.name,
      color: tag.color || '#3b82f6',
    })
    setShowForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormData({ name: '', color: '#3b82f6' })
    setError(null)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Tags</h1>
          <p className="text-neutral-500">
            Manage tags to organize and categorize your inventory items
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ name: '', color: '#3b82f6' })
          }}
          disabled={showForm}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Tag
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
          <h3 className="mb-4 text-lg font-medium text-neutral-900">Create New Tag</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Tag Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fragile, High Value, Perishable"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Color
              </label>
              <div className="flex gap-1">
                {TAG_COLORS.map(({ value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: value }))}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      formData.color === value
                        ? 'border-neutral-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowForm(false)
                setFormData({ name: '', color: '#3b82f6' })
                setError(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving || !formData.name.trim()}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : tags.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-200">
            {tags.map((tag) => {
              const isEditing = editingId === tag.id

              return (
                <li key={tag.id} className="px-6 py-4">
                  {isEditing ? (
                    <div className="flex items-center gap-4">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {TAG_COLORS.map(({ value }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color: value }))}
                            className={`h-6 w-6 rounded-full border-2 transition-all ${
                              formData.color === value
                                ? 'border-neutral-900 scale-110'
                                : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: value }}
                          />
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(tag.id)} disabled={saving}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: tag.color || '#6b7280' }}
                        />
                        <span className="font-medium text-neutral-900">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {deleteConfirm === tag.id ? (
                          <>
                            <span className="text-sm text-red-600 mr-2">Delete?</span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(tag.id)}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              No
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => startEdit(tag)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(tag.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
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
            <Tag className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No tags yet</h3>
          <p className="mt-1 text-neutral-500">
            Create tags to categorize and filter your inventory items
          </p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first tag
          </Button>
        </div>
      )}
    </div>
  )
}
