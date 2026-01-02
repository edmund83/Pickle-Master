'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createFolder } from '@/app/actions/folders'
import { FOLDER_COLORS } from '@/lib/constants/folder-colors'

interface InlineFolderFormProps {
  parentId?: string | null
  onSuccess?: (folder: { id: string; name: string; color: string }) => void
  onCancel: () => void
  className?: string
}

export function InlineFolderForm({
  parentId = null,
  onSuccess,
  onCancel,
  className,
}: InlineFolderFormProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>(FOLDER_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await createFolder({
        name: name.trim(),
        color: selectedColor,
        parentId,
      })

      if (result.success && result.data) {
        onSuccess?.(result.data)
        // Reset form
        setName('')
        setSelectedColor(FOLDER_COLORS[0])
      } else {
        setError(result.error || 'Failed to create folder')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      className={cn(
        'mx-2 rounded-lg border border-primary/30 bg-white p-3 shadow-sm',
        className
      )}
    >
      {/* Name Input */}
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: selectedColor }}
        />
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Folder name..."
          disabled={isPending}
          className={cn(
            'flex-1 bg-transparent text-sm outline-none',
            'placeholder:text-neutral-400',
            error && 'text-red-600'
          )}
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded',
              'text-primary hover:bg-primary/10',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
            aria-label="Create folder"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded',
              'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600',
              'disabled:opacity-50',
              'transition-colors'
            )}
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Color Picker Row */}
      <div className="mt-2 flex items-center gap-1.5">
        {FOLDER_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setSelectedColor(color)}
            disabled={isPending}
            className={cn(
              'h-5 w-5 rounded-full transition-all',
              'hover:scale-110',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              selectedColor === color && 'ring-2 ring-offset-1',
              isPending && 'opacity-50'
            )}
            style={{
              backgroundColor: color,
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {/* Keyboard Hint */}
      <p className="mt-2 text-xs text-neutral-400">
        Press Enter to create, Escape to cancel
      </p>
    </div>
  )
}
