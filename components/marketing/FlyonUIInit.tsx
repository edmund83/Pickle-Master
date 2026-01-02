'use client'

import { useEffect } from 'react'

export function FlyonUIInit() {
  useEffect(() => {
    let cancelled = false

    void import('flyonui/dist/index.mjs').then((flyonui) => {
      if (cancelled) return

      flyonui.HSCollapse?.autoInit?.()
      flyonui.HSAccordion?.autoInit?.()
      flyonui.HSDropdown?.autoInit?.()
      flyonui.HSCarousel?.autoInit?.()
      flyonui.HSTabs?.autoInit?.()
      flyonui.HSTooltip?.autoInit?.()
    })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}

