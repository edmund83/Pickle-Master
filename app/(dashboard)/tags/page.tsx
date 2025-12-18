'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tag as TagIcon, Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Tag } from '@/types/database.types'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#78716c', '#71717a',
]

export default function TagsPage() {
  const [tags, setTags] = useState<(Tag & { item_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6' })
  const [saving, setSaving] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
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

      // Get tags with item counts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tagsData } = await (supabase as any)
        .from('tags')
        .select('*, item_tags(count)')
        .eq('tenant_id', profile.tenant_id)
        .order('name', { ascending: true })

      const tagsWithCounts = (tagsData || []).map((tag: Tag & { item_tags: { count: number }[] }) => ({
        ...tag,
        item_count: tag.item_tags?.[0]?.count || 0,
      }))

      setTags(tagsWithCounts)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!formData.name.trim() || !tenantId) return

    setSaving(true)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('tags')
        .insert({
          tenant_id: tenantId,
          name: formData.name.trim(),
          color: formData.color,
        })

      if (!error) {
        setShowCreateForm(false)
        setFormData({ name: '', color: '#3b82f6' })
        loadTags()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!formData.name.trim()) return

    setSaving(true)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('tags')
        .update({
          name: formData.name.trim(),
          color: formData.color,
        })
        .eq('id', id)

      if (!error) {
        setEditingId(null)
        setFormData({ name: '', color: '#3b82f6' })
        loadTags()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tag?')) return

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('tags')
      .delete()
      .eq('id', id)

    if (!error) {
      loadTags()
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setFormData({ name: tag.name, color: tag.color })
    setShowCreateForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormData({ name: '', color: '#3b82f6' })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Tags</h1>
            <p className="mt-1 text-neutral-500">
              Organize your inventory with custom tags
            </p>
          </div>
          <Button onClick={() => { setShowCreateForm(true); setEditingId(null); setFormData({ name: '', color: '#3b82f6' }); }}>
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </div>
      </div>

      <div className="p-8">
        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-neutral-900">Create New Tag</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-neutral-700">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tag name"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Color</label>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-6 w-6 rounded-full border-2 ${formData.color === color ? 'border-neutral-900' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
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
              {tags.map((tag) => (
                <li key={tag.id} className="flex items-center justify-between px-6 py-4">
                  {editingId === tag.id ? (
                    <div className="flex flex-1 items-center gap-4">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="max-w-xs"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {PRESET_COLORS.slice(0, 10).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`h-6 w-6 rounded-full border-2 ${formData.color === color ? 'border-neutral-900' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="ml-auto flex gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleUpdate(tag.id)} disabled={saving}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium text-neutral-900">{tag.name}</span>
                        <span className="text-sm text-neutral-500">
                          {tag.item_count} item{tag.item_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(tag)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(tag.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <TagIcon className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">No tags yet</h3>
            <p className="mt-1 text-neutral-500">
              Create tags to organize your inventory items
            </p>
            <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first tag
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
