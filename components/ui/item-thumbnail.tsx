'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface ItemThumbnailProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  fallbackClassName?: string
}

const sizeConfig = {
  xs: { dimension: 24, iconSize: 'h-3 w-3', containerClass: 'h-6 w-6' },
  sm: { dimension: 32, iconSize: 'h-4 w-4', containerClass: 'h-8 w-8' },
  md: { dimension: 40, iconSize: 'h-5 w-5', containerClass: 'h-10 w-10' },
  lg: { dimension: 48, iconSize: 'h-6 w-6', containerClass: 'h-12 w-12' },
}

export function ItemThumbnail({
  src,
  alt,
  size = 'md',
  className,
  fallbackClassName,
}: ItemThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const config = sizeConfig[size]
  const shouldShowImage = src && !hasError

  // Fallback placeholder when no image or error
  if (!shouldShowImage) {
    return (
      <div
        className={cn(
          config.containerClass,
          'rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0',
          fallbackClassName || className
        )}
      >
        <Package className={cn(config.iconSize, 'text-neutral-400')} />
      </div>
    )
  }

  return (
    <div className={cn(config.containerClass, 'relative flex-shrink-0', className)}>
      {/* Skeleton while loading */}
      {isLoading && (
        <Skeleton className={cn(config.containerClass, 'absolute inset-0 rounded-lg')} />
      )}

      <Image
        src={src}
        alt={alt}
        width={config.dimension}
        height={config.dimension}
        loading="lazy"
        className={cn(
          config.containerClass,
          'rounded-lg object-cover',
          isLoading && 'opacity-0'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}

// Pre-sized skeleton for loading states in lists
export function ItemThumbnailSkeleton({
  size = 'md',
  className
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const config = sizeConfig[size]
  return <Skeleton className={cn(config.containerClass, 'rounded-lg', className)} />
}
