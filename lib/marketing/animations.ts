// Centralized animation configuration for consistency across marketing pages
export const ANIMATION_CONFIG = {
  // Timing durations (in seconds)
  duration: {
    fast: 0.2,
    normal: 0.5,
    slow: 0.8,
  },

  // Stagger delays between children (in seconds)
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },

  // Easing - using string names for SSR compatibility
  ease: {
    default: 'easeOut' as const,
    smooth: 'easeInOut' as const,
    bounce: 'backOut' as const,
  },

  // Slide distances (in pixels)
  offset: {
    small: 16,
    medium: 24,
    large: 40,
  },

  // Viewport thresholds (0-1, percentage of element visible to trigger)
  viewport: {
    eager: 0.1,
    default: 0.3,
    lazy: 0.5,
  },

  // Hover effects
  hover: {
    scale: 1.02,
    duration: 0.2,
  },
} as const

// Type exports for components
export type AnimationDuration = keyof typeof ANIMATION_CONFIG.duration
export type AnimationEase = keyof typeof ANIMATION_CONFIG.ease
export type AnimationOffset = keyof typeof ANIMATION_CONFIG.offset
