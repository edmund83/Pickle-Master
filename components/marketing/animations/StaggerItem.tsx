'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ANIMATION_CONFIG } from '@/lib/marketing/animations'

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function StaggerItem({
  children,
  className = '',
  direction = 'up',
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()

  // Calculate initial offset based on direction
  const getOffset = () => {
    const offset = ANIMATION_CONFIG.offset.small
    switch (direction) {
      case 'up':
        return { y: offset }
      case 'down':
        return { y: -offset }
      case 'left':
        return { x: offset }
      case 'right':
        return { x: -offset }
      case 'none':
      default:
        return {}
    }
  }

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...getOffset() },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: ANIMATION_CONFIG.duration.normal,
            ease: ANIMATION_CONFIG.ease.default,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
