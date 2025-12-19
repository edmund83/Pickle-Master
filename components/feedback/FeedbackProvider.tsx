'use client'

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
} from 'react'
import { HapticProvider, useHaptic } from './HapticProvider'
import { SoundProvider, useSound } from './SoundProvider'
import { SuccessAnimation } from './SuccessAnimation'

interface FeedbackContextType {
  // Combined feedback actions
  success: (message?: string) => void
  error: (message?: string) => void
  warning: (message?: string) => void
  tap: () => void

  // Animation state
  showSuccessAnimation: boolean

  // Toast state
  toast: { message: string; type: 'success' | 'error' | 'warning' } | null
  clearToast: () => void
}

const FeedbackContext = createContext<FeedbackContextType | null>(null)

function FeedbackProviderInner({ children }: { children: ReactNode }) {
  const haptic = useHaptic()
  const sound = useSound()
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  const clearToast = useCallback(() => {
    setToast(null)
  }, [])

  const success = useCallback(
    (message?: string) => {
      haptic.vibrate('success')
      sound.playSound('success')
      setShowSuccessAnimation(true)

      if (message) {
        setToast({ message, type: 'success' })
        setTimeout(clearToast, 3000)
      }

      setTimeout(() => setShowSuccessAnimation(false), 1500)
    },
    [haptic, sound, clearToast]
  )

  const error = useCallback(
    (message?: string) => {
      haptic.vibrate('error')
      sound.playSound('error')

      if (message) {
        setToast({ message, type: 'error' })
        setTimeout(clearToast, 4000)
      }
    },
    [haptic, sound, clearToast]
  )

  const warning = useCallback(
    (message?: string) => {
      haptic.vibrate('warning')
      sound.playSound('warning')

      if (message) {
        setToast({ message, type: 'warning' })
        setTimeout(clearToast, 3500)
      }
    },
    [haptic, sound, clearToast]
  )

  const tap = useCallback(() => {
    haptic.vibrate('light')
    sound.playSound('tap')
  }, [haptic, sound])

  return (
    <FeedbackContext.Provider
      value={{
        success,
        error,
        warning,
        tap,
        showSuccessAnimation,
        toast,
        clearToast,
      }}
    >
      {children}

      {/* Success Animation Overlay */}
      <SuccessAnimation
        show={showSuccessAnimation}
        onComplete={() => setShowSuccessAnimation(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={clearToast}
        />
      )}
    </FeedbackContext.Provider>
  )
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  return (
    <HapticProvider>
      <SoundProvider>
        <FeedbackProviderInner>{children}</FeedbackProviderInner>
      </SoundProvider>
    </HapticProvider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)

  if (!context) {
    // Return no-op if used outside provider
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      tap: () => {},
      showSuccessAnimation: false,
      toast: null,
      clearToast: () => {},
    }
  }

  return context
}

/**
 * Toast component for feedback messages
 */
interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning'
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
  }

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down"
      role="alert"
    >
      <div
        className={`
          flex items-center gap-3
          px-5 py-3
          rounded-2xl
          shadow-lg
          ${colors[type]}
          min-w-[200px] max-w-[90vw]
        `}
      >
        <span className="text-xl font-bold">{icons[type]}</span>
        <span className="font-medium text-base">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Re-export hooks from sub-providers
export { useHaptic } from './HapticProvider'
export { useSound } from './SoundProvider'
