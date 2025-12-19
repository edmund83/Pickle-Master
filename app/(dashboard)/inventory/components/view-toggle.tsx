'use client'

import { LayoutGrid, Table as TableIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'grid'

  const setView = (newView: 'grid' | 'table') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('grid')}
        className={cn(
          'h-7 px-2',
          view === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500'
        )}
        title="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('table')}
        className={cn(
          'h-7 px-2',
          view === 'table' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500'
        )}
        title="Table View"
      >
        <TableIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
