'use client'

import { useEffect } from 'react'
import { useItemCacheSync } from '@/lib/hooks/useItemCacheSync'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'

interface OfflineProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that initializes offline capabilities
 *
 * - Starts background item cache sync
 * - Sets up online/offline detection
 * - Should be placed high in the component tree (e.g., in a layout)
 */
export function OfflineProvider({ children }: OfflineProviderProps) {
  // Initialize online status tracking
  useOnlineStatus()

  // Initialize cache sync
  const { sync } = useItemCacheSync({
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // Sync every 5 minutes
  })

  // Log when provider mounts
  useEffect(() => {
    console.log('[OfflineProvider] Initialized')

    // Sync cache on mount
    sync()

    return () => {
      console.log('[OfflineProvider] Unmounted')
    }
  }, [sync])

  return <>{children}</>
}

export default OfflineProvider
