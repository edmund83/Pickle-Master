'use client'

import { useEffect } from 'react'

// Initialize FlyonUI global collections to prevent "Cannot read properties of undefined" errors
// FlyonUI expects these to exist before its internal autoInit runs
function initFlyonUIGlobals() {
  if (typeof window === 'undefined') return

  const collections = [
    '$hsOverlayCollection',
    '$hsDropdownCollection',
    '$hsCollapseCollection',
    '$hsAccordionCollection',
    '$hsCarouselCollection',
    '$hsTabsCollection',
    '$hsTooltipCollection',
    '$hsScrollspyCollection',
    '$hsSelectCollection',
    '$hsInputNumberCollection',
    '$hsStrongPasswordCollection',
    '$hsPinInputCollection',
    '$hsFileUploadCollection',
    '$hsRangeSliderCollection',
    '$hsRemoveElementCollection',
    '$hsStepperCollection',
    '$hsToggleCountCollection',
    '$hsTogglePasswordCollection',
    '$hsTreeViewCollection',
  ] as const

  collections.forEach((name) => {
    if (!(window as unknown as Record<string, unknown>)[name]) {
      ;(window as unknown as Record<string, unknown>)[name] = []
    }
  })
}

export function FlyonUIInit() {
  useEffect(() => {
    let cancelled = false

    // Initialize globals first to prevent errors during module load
    initFlyonUIGlobals()

    // Wait for DOM to be fully loaded before initializing FlyonUI
    const initFlyonUI = async () => {
      if (cancelled) return

      try {
        const flyonui = await import('flyonui/dist/index.mjs')
        if (cancelled) return

        // Wrap each autoInit in try-catch to prevent errors when components don't exist
        const safeInit = (component: { autoInit?: () => void } | undefined) => {
          try {
            component?.autoInit?.()
          } catch {
            // Component may not exist on this page, ignore
          }
        }

        // Use requestAnimationFrame to ensure DOM is painted
        requestAnimationFrame(() => {
          if (cancelled) return
          safeInit(flyonui.HSCollapse)
          safeInit(flyonui.HSAccordion)
          safeInit(flyonui.HSDropdown)
          safeInit(flyonui.HSCarousel)
          safeInit(flyonui.HSTabs)
          safeInit(flyonui.HSTooltip)
        })
      } catch {
        // FlyonUI import failed, ignore
      }
    }

    // Only init when document is ready
    if (document.readyState === 'complete') {
      void initFlyonUI()
    } else {
      window.addEventListener('load', () => void initFlyonUI(), { once: true })
    }

    return () => {
      cancelled = true
    }
  }, [])

  return null
}

