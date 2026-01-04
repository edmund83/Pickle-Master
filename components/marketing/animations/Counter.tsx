'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { ANIMATION_CONFIG } from '@/lib/marketing/animations'

interface CounterProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
}

export function Counter({
  value,
  suffix = '',
  prefix = '',
  className = '',
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Skip animation if reduced motion or already animated
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    if (!isInView || hasAnimated) return

    setHasAnimated(true)

    // Animate the counter
    const duration = 1500 // ms
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (value - startValue) * easeOut

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value, prefersReducedMotion, hasAnimated])

  // Format number for display
  const formatNumber = (num: number) => {
    if (Number.isInteger(value)) {
      return Math.round(num).toLocaleString()
    }
    return num.toFixed(1)
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: ANIMATION_CONFIG.duration.normal }}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </motion.span>
  )
}
