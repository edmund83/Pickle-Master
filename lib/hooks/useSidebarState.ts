'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pickle-sidebar-expanded'

export function useSidebarState() {
  // Default to expanded for better visibility
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsExpanded(stored === 'true')
    }
    // If no stored preference, keep default (expanded)
    setIsHydrated(true)
  }, [])

  // Save to localStorage when state changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, String(isExpanded))
    }
  }, [isExpanded, isHydrated])

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const expand = useCallback(() => {
    setIsExpanded(true)
  }, [])

  const collapse = useCallback(() => {
    setIsExpanded(false)
  }, [])

  return {
    isExpanded,
    isHydrated,
    toggle,
    expand,
    collapse,
    setIsExpanded,
  }
}
