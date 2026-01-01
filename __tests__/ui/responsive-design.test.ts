import { describe, it, expect } from 'vitest'

/**
 * Responsive Design Tests
 *
 * Tests for responsive design breakpoints and layouts:
 * - Mobile (< 640px)
 * - Tablet (640-1023px)
 * - Desktop (>= 1024px)
 * - Touch targets
 */

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

interface LayoutConfig {
  breakpoint: Breakpoint
  width: number
  showSidebar: boolean
  showMobileNav: boolean
  gridColumns: number
  cardLayout: 'list' | 'grid'
  fontSize: 'base' | 'sm'
}

interface TouchTarget {
  element: string
  width: number
  height: number
  meetsMinimum: boolean
}

// Determine breakpoint from width
function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Get layout configuration for width
function getLayoutConfig(width: number): LayoutConfig {
  const breakpoint = getBreakpoint(width)

  switch (breakpoint) {
    case 'mobile':
      return {
        breakpoint,
        width,
        showSidebar: false,
        showMobileNav: true,
        gridColumns: 1,
        cardLayout: 'list',
        fontSize: 'base',
      }
    case 'tablet':
      return {
        breakpoint,
        width,
        showSidebar: true,
        showMobileNav: false,
        gridColumns: 2,
        cardLayout: 'grid',
        fontSize: 'base',
      }
    case 'desktop':
      return {
        breakpoint,
        width,
        showSidebar: true,
        showMobileNav: false,
        gridColumns: 3,
        cardLayout: 'grid',
        fontSize: 'sm',
      }
  }
}

// Check if touch target meets minimum size
function checkTouchTarget(width: number, height: number): TouchTarget {
  const MIN_TOUCH_TARGET = 44 // 44px is the recommended minimum

  return {
    element: 'button',
    width,
    height,
    meetsMinimum: width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET,
  }
}

// Get touch target requirements for device type
function getTouchTargetRequirements(isTouchDevice: boolean): {
  minWidth: number
  minHeight: number
  required: boolean
} {
  if (isTouchDevice) {
    return { minWidth: 44, minHeight: 44, required: true }
  }
  return { minWidth: 24, minHeight: 24, required: false }
}

// Validate button sizes
function validateButtonSizes(
  buttons: Array<{ name: string; width: number; height: number }>,
  isTouchDevice: boolean
): Array<{ name: string; valid: boolean; reason?: string }> {
  const requirements = getTouchTargetRequirements(isTouchDevice)

  return buttons.map((button) => {
    if (isTouchDevice) {
      if (button.width < requirements.minWidth) {
        return {
          name: button.name,
          valid: false,
          reason: `Width ${button.width}px is below minimum ${requirements.minWidth}px`,
        }
      }
      if (button.height < requirements.minHeight) {
        return {
          name: button.name,
          valid: false,
          reason: `Height ${button.height}px is below minimum ${requirements.minHeight}px`,
        }
      }
    }
    return { name: button.name, valid: true }
  })
}

// Get responsive class names
function getResponsiveClasses(breakpoint: Breakpoint): {
  container: string
  grid: string
  sidebar: string
  card: string
} {
  switch (breakpoint) {
    case 'mobile':
      return {
        container: 'px-4',
        grid: 'grid-cols-1',
        sidebar: 'hidden',
        card: 'w-full',
      }
    case 'tablet':
      return {
        container: 'px-6',
        grid: 'grid-cols-2',
        sidebar: 'w-64',
        card: 'w-1/2',
      }
    case 'desktop':
      return {
        container: 'px-8',
        grid: 'grid-cols-3',
        sidebar: 'w-72',
        card: 'w-1/3',
      }
  }
}

describe('Responsive Design', () => {
  describe('Mobile (< 640px)', () => {
    it('shows mobile layout', () => {
      const config = getLayoutConfig(375) // iPhone SE width

      expect(config.breakpoint).toBe('mobile')
      expect(config.showMobileNav).toBe(true)
      expect(config.showSidebar).toBe(false)
    })

    it('uses single column grid', () => {
      const config = getLayoutConfig(320)

      expect(config.gridColumns).toBe(1)
    })

    it('uses list card layout', () => {
      const config = getLayoutConfig(414) // iPhone XR width

      expect(config.cardLayout).toBe('list')
    })

    it('applies mobile-specific classes', () => {
      const classes = getResponsiveClasses('mobile')

      expect(classes.grid).toBe('grid-cols-1')
      expect(classes.sidebar).toBe('hidden')
    })
  })

  describe('Tablet (640-1023px)', () => {
    it('shows tablet layout', () => {
      const config = getLayoutConfig(768) // iPad width

      expect(config.breakpoint).toBe('tablet')
      expect(config.showSidebar).toBe(true)
      expect(config.showMobileNav).toBe(false)
    })

    it('uses two column grid', () => {
      const config = getLayoutConfig(834) // iPad Pro 11" width

      expect(config.gridColumns).toBe(2)
    })

    it('uses grid card layout', () => {
      const config = getLayoutConfig(1000)

      expect(config.cardLayout).toBe('grid')
    })

    it('applies tablet-specific classes', () => {
      const classes = getResponsiveClasses('tablet')

      expect(classes.grid).toBe('grid-cols-2')
      expect(classes.sidebar).toBe('w-64')
    })
  })

  describe('Desktop (>= 1024px)', () => {
    it('shows full desktop layout', () => {
      const config = getLayoutConfig(1440)

      expect(config.breakpoint).toBe('desktop')
      expect(config.showSidebar).toBe(true)
      expect(config.showMobileNav).toBe(false)
    })

    it('uses three column grid', () => {
      const config = getLayoutConfig(1920)

      expect(config.gridColumns).toBe(3)
    })

    it('uses smaller font size', () => {
      const config = getLayoutConfig(1280)

      expect(config.fontSize).toBe('sm')
    })

    it('applies desktop-specific classes', () => {
      const classes = getResponsiveClasses('desktop')

      expect(classes.grid).toBe('grid-cols-3')
      expect(classes.sidebar).toBe('w-72')
    })
  })

  describe('Touch Targets', () => {
    it('buttons are 44px minimum on touch devices', () => {
      const target = checkTouchTarget(44, 44)

      expect(target.meetsMinimum).toBe(true)
    })

    it('rejects buttons smaller than 44px', () => {
      const target = checkTouchTarget(32, 32)

      expect(target.meetsMinimum).toBe(false)
    })

    it('validates all buttons for touch devices', () => {
      const buttons = [
        { name: 'Primary Button', width: 120, height: 44 },
        { name: 'Icon Button', width: 44, height: 44 },
        { name: 'Small Button', width: 32, height: 32 },
      ]

      const results = validateButtonSizes(buttons, true)

      expect(results[0].valid).toBe(true)
      expect(results[1].valid).toBe(true)
      expect(results[2].valid).toBe(false)
      expect(results[2].reason).toContain('32px')
    })

    it('relaxes requirements for non-touch devices', () => {
      const buttons = [{ name: 'Small Button', width: 32, height: 32 }]

      const results = validateButtonSizes(buttons, false)

      expect(results[0].valid).toBe(true)
    })

    it('gets correct requirements for touch devices', () => {
      const requirements = getTouchTargetRequirements(true)

      expect(requirements.minWidth).toBe(44)
      expect(requirements.minHeight).toBe(44)
      expect(requirements.required).toBe(true)
    })

    it('gets relaxed requirements for non-touch devices', () => {
      const requirements = getTouchTargetRequirements(false)

      expect(requirements.minWidth).toBe(24)
      expect(requirements.minHeight).toBe(24)
      expect(requirements.required).toBe(false)
    })
  })

  describe('Breakpoint Transitions', () => {
    it('transitions correctly at 640px', () => {
      expect(getBreakpoint(639)).toBe('mobile')
      expect(getBreakpoint(640)).toBe('tablet')
    })

    it('transitions correctly at 1024px', () => {
      expect(getBreakpoint(1023)).toBe('tablet')
      expect(getBreakpoint(1024)).toBe('desktop')
    })

    it('handles edge case widths', () => {
      expect(getBreakpoint(0)).toBe('mobile')
      expect(getBreakpoint(1)).toBe('mobile')
      expect(getBreakpoint(4096)).toBe('desktop')
    })
  })
})
