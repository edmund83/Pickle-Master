'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive media query detection
 * Returns null during SSR/hydration to avoid mismatch, then the actual value after mount
 * @param query - CSS media query string (e.g., '(min-width: 1024px)')
 * @returns boolean indicating if the query matches, or null during SSR
 */
export function useMediaQuery(query: string): boolean | null {
  // Start with null to indicate "not yet determined" - avoids hydration mismatch
  const [matches, setMatches] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value after mount
    setMatches(media.matches)

    // Create listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Pre-configured hooks for common breakpoints
 * Returns null during SSR/hydration, then the actual value after mount
 */
export function useIsMobile(): boolean | null {
  const matches = useMediaQuery('(min-width: 640px)')
  if (matches === null) return null
  return !matches
}

export function useIsTablet(): boolean | null {
  const isAboveMobile = useMediaQuery('(min-width: 640px)')
  const isBelowDesktop = useMediaQuery('(min-width: 1024px)')
  if (isAboveMobile === null || isBelowDesktop === null) return null
  return isAboveMobile && !isBelowDesktop
}

export function useIsDesktop(): boolean | null {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}
