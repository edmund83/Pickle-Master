'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessAnimationProps {
  show: boolean
  onComplete?: () => void
}

export function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setIsAnimating(true)

      // Hide after animation
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(() => {
          setIsVisible(false)
          onComplete?.()
        }, 200)
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100]',
        'flex items-center justify-center',
        'pointer-events-none',
        'transition-opacity duration-200',
        isAnimating ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Success circle */}
      <div
        className={cn(
          'relative flex items-center justify-center',
          'w-32 h-32',
          'rounded-full',
          'bg-green-500',
          'shadow-2xl shadow-green-500/50',
          isAnimating ? 'animate-bounce-in' : ''
        )}
      >
        {/* Checkmark */}
        <Check
          className={cn(
            'w-16 h-16 text-white',
            'stroke-[3]',
            isAnimating ? 'animate-check-draw' : ''
          )}
        />

        {/* Expanding ring */}
        <div
          className={cn(
            'absolute inset-0',
            'rounded-full',
            'border-4 border-green-400',
            isAnimating ? 'animate-ring-expand' : ''
          )}
        />

        {/* Confetti particles */}
        {isAnimating && <Confetti />}
      </div>
    </div>
  )
}

/**
 * Simple confetti particles
 */
function Confetti() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * (Math.PI / 180),
    color: ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5],
    delay: i * 50,
  }))

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            'absolute w-3 h-3 rounded-full',
            particle.color,
            'animate-confetti'
          )}
          style={{
            '--angle': `${particle.angle}rad`,
            animationDelay: `${particle.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </>
  )
}

/**
 * Smaller inline success checkmark
 */
interface InlineSuccessProps {
  show: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function InlineSuccess({ show, size = 'md' }: InlineSuccessProps) {
  if (!show) return null

  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'rounded-full',
        'bg-green-500',
        'animate-bounce-in',
        sizes[size]
      )}
    >
      <Check className={cn('text-white stroke-[3]', iconSizes[size])} />
    </div>
  )
}

/**
 * Error animation component
 */
interface ErrorAnimationProps {
  show: boolean
  onComplete?: () => void
}

export function ErrorAnimation({ show, onComplete }: ErrorAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setIsAnimating(true)

      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(() => {
          setIsVisible(false)
          onComplete?.()
        }, 200)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100]',
        'flex items-center justify-center',
        'pointer-events-none',
        'transition-opacity duration-200',
        isAnimating ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="absolute inset-0 bg-black/10" />

      <div
        className={cn(
          'relative flex items-center justify-center',
          'w-32 h-32',
          'rounded-full',
          'bg-red-500',
          'shadow-2xl shadow-red-500/50',
          isAnimating ? 'animate-shake' : ''
        )}
      >
        <span className="text-5xl text-white font-bold">✕</span>
      </div>
    </div>
  )
}
