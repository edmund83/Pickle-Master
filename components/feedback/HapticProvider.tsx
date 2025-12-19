'use client'

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
  useEffect,
} from 'react'

type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'

interface HapticContextType {
  vibrate: (intensity: HapticIntensity) => void
  isSupported: boolean
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
}

const HapticContext = createContext<HapticContextType | null>(null)

// Vibration patterns in milliseconds
const hapticPatterns: Record<HapticIntensity, number | number[]> = {
  light: 10,           // Quick tap
  medium: 25,          // Normal button press
  heavy: 50,           // Significant action
  success: [10, 50, 10, 50, 20], // Celebratory pattern
  error: [50, 30, 50, 30, 50],   // Alert pattern
  warning: [30, 20, 30],         // Warning pattern
}

interface HapticProviderProps {
  children: ReactNode
}

export function HapticProvider({ children }: HapticProviderProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setEnabled] = useState(true)

  // Check for vibration support on mount
  useEffect(() => {
    setIsSupported(
      typeof navigator !== 'undefined' && 'vibrate' in navigator
    )

    // Load preference from localStorage
    const stored = localStorage.getItem('haptic-enabled')
    if (stored !== null) {
      setEnabled(stored === 'true')
    }
  }, [])

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem('haptic-enabled', String(isEnabled))
  }, [isEnabled])

  const vibrate = useCallback(
    (intensity: HapticIntensity) => {
      if (!isSupported || !isEnabled) return

      try {
        navigator.vibrate(hapticPatterns[intensity])
      } catch {
        // Silently fail if vibration is not allowed
      }
    },
    [isSupported, isEnabled]
  )

  return (
    <HapticContext.Provider
      value={{
        vibrate,
        isSupported,
        isEnabled,
        setEnabled,
      }}
    >
      {children}
    </HapticContext.Provider>
  )
}

export function useHaptic() {
  const context = useContext(HapticContext)

  if (!context) {
    // Return a no-op if used outside provider
    return {
      vibrate: () => {},
      isSupported: false,
      isEnabled: false,
      setEnabled: () => {},
    }
  }

  return context
}

/**
 * Hook to add haptic feedback to an event handler
 */
export function useHapticCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  intensity: HapticIntensity = 'light'
): T {
  const { vibrate } = useHaptic()

  return useCallback(
    ((...args: unknown[]) => {
      vibrate(intensity)
      return callback(...args)
    }) as T,
    [callback, vibrate, intensity]
  )
}
