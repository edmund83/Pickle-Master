'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react' // Import useEffect
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  className?: string
  placeholder?: string
  id?: string
}

export function SearchInput({ className, placeholder = 'Search...', id = 'search-input' }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')

  // Create a query string with the new search value
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )


  // Debounce the URL update
  useEffect(() => {
    const timer = setTimeout(() => {
       // Only push if the value matches what's already in the URL to avoid loops,
       // BUT here we want to push if it's DIFFERENT.
       // The value state is the source of truth for the input.
       // The URL state is the source of truth for the app.
       const currentQ = searchParams.get('q') || ''
       if (value !== currentQ) {
         router.push(`?${createQueryString('q', value)}`)
       }
    }, 300)

    return () => clearTimeout(timer)
  }, [value, router, createQueryString, searchParams])


  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
