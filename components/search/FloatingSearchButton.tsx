'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, GripVertical, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useZoe } from '@/contexts/ZoeContext'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'

const POSITION_STORAGE_KEY = 'stockzip-search-button-position'

interface Position {
  x: number
  y: number
}

function getStoredPosition(): Position | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(POSITION_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parsing errors
  }
  return null
}

function savePosition(position: Position) {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position))
  } catch {
    // Ignore storage errors
  }
}

export function FloatingSearchButton() {
  const { openSearch } = useGlobalSearch()
  const { openZoe } = useZoe()
  const isDesktop = useIsDesktop()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null)

  // Load saved position on mount
  useEffect(() => {
    const stored = getStoredPosition()
    if (stored) {
      setPosition(stored)
    }
  }, [])

  // Handle mouse down on drag handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const currentX = position?.x ?? window.innerWidth - rect.width - 24
    const currentY = position?.y ?? 16

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: currentX,
      posY: currentY,
    }
    setIsDragging(true)
  }, [position])

  // Handle mouse move while dragging
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !buttonRef.current) return

      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y

      const newX = dragStartRef.current.posX + deltaX
      const newY = dragStartRef.current.posY + deltaY

      // Constrain to viewport
      const button = buttonRef.current
      const rect = button.getBoundingClientRect()
      const maxX = window.innerWidth - rect.width - 8
      const maxY = window.innerHeight - rect.height - 8

      const constrainedX = Math.max(8, Math.min(newX, maxX))
      const constrainedY = Math.max(8, Math.min(newY, maxY))

      setPosition({ x: constrainedX, y: constrainedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragStartRef.current = null

      // Save position
      if (position) {
        savePosition(position)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, position])

  // Only show on desktop - mobile has search in MobileHeader
  if (!isDesktop) {
    return null
  }

  const style: React.CSSProperties = position
    ? { left: position.x, top: position.y, right: 'auto' }
    : { right: 24, top: 16 }

  return (
    <div
      ref={buttonRef}
      className={cn(
        'fixed z-40',
        'flex items-center',
        'bg-white/95 backdrop-blur-sm',
        'border border-neutral-200 rounded-full',
        'shadow-lg shadow-neutral-200/50',
        isDragging ? 'cursor-grabbing shadow-xl' : 'hover:shadow-xl',
        'transition-shadow duration-200'
      )}
      style={style}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'flex items-center justify-center h-full px-2 py-2',
          'cursor-grab text-neutral-400 hover:text-neutral-600',
          'border-r border-neutral-200',
          'rounded-l-full',
          isDragging && 'cursor-grabbing'
        )}
        title="Drag to reposition"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Search Button */}
      <button
        onClick={openSearch}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'text-sm text-neutral-600',
          'hover:bg-neutral-50',
          'border-r border-neutral-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        aria-label="Search inventory"
      >
        <Search className="h-4 w-4 text-neutral-500" />
        <span className="hidden sm:inline text-neutral-500">Search...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-neutral-400 bg-neutral-100 rounded">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Zoe AI Button */}
      <button
        onClick={openZoe}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'text-sm',
          'hover:bg-violet-50',
          'rounded-r-full',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
          'group'
        )}
        aria-label="Ask Zoe AI"
      >
        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 group-hover:from-violet-600 group-hover:to-purple-700 transition-colors">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <span className="hidden lg:inline text-violet-600 font-medium">Zoe</span>
      </button>
    </div>
  )
}
