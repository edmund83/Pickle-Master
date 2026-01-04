'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'stockzip-sidebar-expanded'
const STORAGE_VERSION_KEY = 'stockzip-sidebar-version'
const CURRENT_VERSION = '2' // Bump this to reset user preferences

export function useSidebarState() {
  // Default to expanded for better visibility
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    // Check version - if outdated, reset to new default (expanded)
    const version = localStorage.getItem(STORAGE_VERSION_KEY)
    if (version !== CURRENT_VERSION) {
      // Reset to expanded for new version
      localStorage.setItem(STORAGE_KEY, 'true')
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
      setIsExpanded(true)
    } else {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        setIsExpanded(stored === 'true')
      }
    }
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
