import { FileText, Tag } from 'lucide-react'
import { ItemDetailCard } from './item-detail-card'
import { TagsManager } from './tags-manager'
import type { Tag as TagType } from '@/types/database.types'

interface ItemDetailsCardProps {
  itemId: string
  description: string | null
  notes: string | null
  tags: TagType[]
}

export function ItemDetailsCard({
  itemId,
  description,
  notes,
  tags,
}: ItemDetailsCardProps) {
  const hasContent = description || notes || tags.length > 0

  return (
    <ItemDetailCard
      title="Details"
      icon={<FileText className="h-5 w-5" />}
      action={
        <TagsManager
          itemId={itemId}
          currentTagIds={tags.map(t => t.id)}
        />
      }
    >
      <div className="space-y-4">
        {/* Description */}
        {description && (
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase mb-1">Description</p>
            <p className="text-neutral-700">{description}</p>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className={description ? 'border-t border-neutral-100 pt-4' : ''}>
            <p className="text-xs font-medium text-neutral-500 uppercase mb-1">Notes</p>
            <p className="text-neutral-600 whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {/* Tags */}
        <div className={(description || notes) ? 'border-t border-neutral-100 pt-4' : ''}>
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-500 uppercase">Tags</span>
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color || '#6b7280',
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color || '#6b7280' }}
                  />
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 italic">No tags assigned</p>
          )}
        </div>

        {/* Empty state when nothing is set */}
        {!hasContent && (
          <p className="text-neutral-400 italic">No details added</p>
        )}
      </div>
    </ItemDetailCard>
  )
}
