'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ANIMATION_CONFIG } from '@/lib/marketing/animations'

interface HoverScaleProps {
  children: React.ReactNode
  className?: string
  scale?: number
}

export function HoverScale({
  children,
  className = '',
  scale = ANIMATION_CONFIG.hover.scale,
}: HoverScaleProps) {
  const prefersReducedMotion = useReducedMotion()

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: ANIMATION_CONFIG.hover.duration,
        ease: ANIMATION_CONFIG.ease.default,
      }}
    >
      {children}
    </motion.div>
  )
}
