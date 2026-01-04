'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ANIMATION_CONFIG } from '@/lib/marketing/animations'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
}

export function FadeIn({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = ANIMATION_CONFIG.duration.normal,
  once = true,
  amount = ANIMATION_CONFIG.viewport.default,
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()

  // Calculate initial offset based on direction
  const getOffset = () => {
    const offset = ANIMATION_CONFIG.offset.medium
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
      initial={{ opacity: 0, ...getOffset() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: ANIMATION_CONFIG.ease.default,
      }}
    >
      {children}
    </motion.div>
  )
}
