'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { updateItemTags } from '@/app/actions/inventory'
import type { Tag } from '@/types/database.types'

interface TagsManagerProps {
  itemId: string
  currentTagIds: string[]
}

export function TagsManager({ itemId, currentTagIds }: TagsManagerProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set(currentTagIds))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load all tags when modal opens
  useEffect(() => {
    if (!showModal) return

    async function loadTags() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

         
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single()

        if (!profile?.tenant_id) return

         
        const { data } = await (supabase as any)
          .from('tags')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('name')

        setAllTags((data || []) as Tag[])
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [showModal])

  // Reset selection when modal opens
  useEffect(() => {
    if (showModal) {
      setSelectedTagIds(new Set(currentTagIds))
    }
  }, [showModal, currentTagIds])

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev)
      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        next.add(tagId)
      }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateItemTags(itemId, Array.from(selectedTagIds))
      if (result.success) {
        setShowModal(false)
        router.refresh()
      } else {
        console.error('Failed to update tags:', result.error)
      }
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    const current = new Set(currentTagIds)
    if (current.size !== selectedTagIds.size) return true
    for (const id of current) {
      if (!selectedTagIds.has(id)) return true
    }
    return false
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-neutral-100"
        onClick={() => setShowModal(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <h2 className="text-lg font-semibold">Manage Tags</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
              ) : allTags.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-neutral-500">No tags available</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    Create tags in Settings → Tags
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
                    >
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded border-2 transition-colors"
                        style={{
                          borderColor: selectedTagIds.has(tag.id) ? (tag.color || '#6b7280') : '#d1d5db',
                          backgroundColor: selectedTagIds.has(tag.id) ? (tag.color || '#6b7280') : 'transparent',
                        }}
                      >
                        {selectedTagIds.has(tag.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className="flex items-center gap-2"
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#6b7280' }}
                        />
                        {tag.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 p-4">
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges()}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
