/**
 * Haptic and audio feedback utilities for app-wide interactions
 * Provides consistent tactile and audio feedback across the app
 */

// ============================================================================
// Types
// ============================================================================

export type FeedbackType =
  | 'tap'           // Light button tap
  | 'success'       // Action completed successfully
  | 'error'         // Error occurred
  | 'warning'       // Warning/caution
  | 'increase'      // Quantity increased
  | 'decrease'      // Quantity decreased
  | 'boundary'      // Hit min/max limit
  | 'selection'     // Item selected
  | 'deselection'   // Item deselected
  | 'scan'          // Scan success (special beep)
  | 'scanError'     // Scan failed
  | 'delete'        // Destructive action
  | 'complete'      // Task/workflow completed

// ============================================================================
// Haptic Patterns (in milliseconds)
// ============================================================================

export const HAPTIC_PATTERNS: Record<FeedbackType, number | number[]> = {
  tap: 15,
  success: [30, 20, 30],
  error: [80, 40, 80],
  warning: [40, 60, 40],
  increase: 20,
  decrease: 25,
  boundary: [60, 30, 60],
  selection: 12,
  deselection: 8,
  scan: [40, 20, 40],
  scanError: [100, 50, 100],
  delete: [50, 30, 50],
  complete: [30, 20, 30, 20, 30],
}

// ============================================================================
// Sound Configuration
// ============================================================================

interface SoundConfig {
  frequency: number
  duration: number
  volume: number
  type: OscillatorType
  // For multi-tone sounds
  frequencies?: number[]
}

// Sound configs - made more prominent for iOS where haptic isn't available
const SOUND_CONFIGS: Record<FeedbackType, SoundConfig> = {
  tap: { frequency: 800, duration: 0.04, volume: 0.25, type: 'sine' },
  success: { frequency: 880, duration: 0.15, volume: 0.35, type: 'sine', frequencies: [880, 1100, 1320] },
  error: { frequency: 200, duration: 0.2, volume: 0.4, type: 'square', frequencies: [200, 150] },
  warning: { frequency: 400, duration: 0.12, volume: 0.35, type: 'triangle' },
  increase: { frequency: 1200, duration: 0.06, volume: 0.3, type: 'sine' },
  decrease: { frequency: 600, duration: 0.06, volume: 0.3, type: 'sine' },
  boundary: { frequency: 250, duration: 0.1, volume: 0.35, type: 'square' },
  selection: { frequency: 1400, duration: 0.05, volume: 0.25, type: 'sine' },
  deselection: { frequency: 700, duration: 0.04, volume: 0.2, type: 'sine' },
  scan: { frequency: 1800, duration: 0.12, volume: 0.4, type: 'sine', frequencies: [1800, 2200] },
  scanError: { frequency: 250, duration: 0.25, volume: 0.4, type: 'square', frequencies: [250, 200, 150] },
  delete: { frequency: 300, duration: 0.12, volume: 0.35, type: 'triangle' },
  complete: { frequency: 880, duration: 0.2, volume: 0.4, type: 'sine', frequencies: [660, 880, 1100, 1320] },
}

// ============================================================================
// User Preferences (persisted in localStorage)
// ============================================================================

const STORAGE_KEY = 'feedback-preferences'

export interface FeedbackPreferences {
  hapticEnabled: boolean
  soundEnabled: boolean
  soundVolume: number // 0 to 1
}

const DEFAULT_PREFERENCES: FeedbackPreferences = {
  hapticEnabled: true,
  soundEnabled: true,
  soundVolume: 1.0, // Full volume by default for better feedback
}

let cachedPreferences: FeedbackPreferences | null = null

export function getFeedbackPreferences(): FeedbackPreferences {
  if (cachedPreferences) return cachedPreferences
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
      cachedPreferences = parsed
      return parsed
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_PREFERENCES
}

export function setFeedbackPreferences(prefs: Partial<FeedbackPreferences>): void {
  const current = getFeedbackPreferences()
  const updated = { ...current, ...prefs }
  cachedPreferences = updated

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore localStorage errors
    }
  }
}

export function toggleHaptic(enabled?: boolean): boolean {
  const current = getFeedbackPreferences()
  const newValue = enabled ?? !current.hapticEnabled
  setFeedbackPreferences({ hapticEnabled: newValue })
  return newValue
}

export function toggleSound(enabled?: boolean): boolean {
  const current = getFeedbackPreferences()
  const newValue = enabled ?? !current.soundEnabled
  setFeedbackPreferences({ soundEnabled: newValue })
  return newValue
}

// ============================================================================
// Audio Engine
// ============================================================================

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Audio context not supported:', e)
      return null
    }
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

/**
 * Initialize the audio context (should be called from a user interaction)
 */
export function initAudioContext(): void {
  getAudioContext()
}

/**
 * Play a tone based on the sound configuration
 */
function playTone(config: SoundConfig, volumeMultiplier: number = 1): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const prefs = getFeedbackPreferences()
  if (!prefs.soundEnabled) return

  const finalVolume = config.volume * prefs.soundVolume * volumeMultiplier

  try {
    if (config.frequencies && config.frequencies.length > 1) {
      // Play multi-tone sequence
      let delay = 0
      const toneDuration = config.duration / config.frequencies.length

      config.frequencies.forEach((freq) => {
        setTimeout(() => playSingleTone(ctx, freq, toneDuration, finalVolume, config.type), delay * 1000)
        delay += toneDuration * 0.8 // Slight overlap for smoother sound
      })
    } else {
      playSingleTone(ctx, config.frequency, config.duration, finalVolume, config.type)
    }
  } catch (e) {
    console.warn('Failed to play sound:', e)
  }
}

function playSingleTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType
): void {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

  // Envelope to avoid clicks
  const now = ctx.currentTime
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.01)
  gainNode.gain.linearRampToValueAtTime(volume, now + duration - 0.01)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

// ============================================================================
// Haptic Engine
// ============================================================================

/**
 * Trigger haptic feedback (vibration)
 */
export function triggerHaptic(pattern: number | number[] = 50): void {
  if (typeof navigator === 'undefined') return
  if (!navigator.vibrate) return

  const prefs = getFeedbackPreferences()
  if (!prefs.hapticEnabled) return

  try {
    navigator.vibrate(pattern)
  } catch {
    // Vibration API not supported or blocked
  }
}

// ============================================================================
// Main Feedback API
// ============================================================================

/**
 * Trigger combined haptic and sound feedback
 * @param type - The type of feedback to trigger
 * @param options - Optional overrides for haptic/sound
 */
export function feedback(
  type: FeedbackType,
  options?: { haptic?: boolean; sound?: boolean }
): void {
  const hapticEnabled = options?.haptic ?? true
  const soundEnabled = options?.sound ?? true

  if (hapticEnabled) {
    const pattern = HAPTIC_PATTERNS[type]
    triggerHaptic(pattern)
  }

  if (soundEnabled) {
    const config = SOUND_CONFIGS[type]
    playTone(config)
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/** Light tap feedback for button presses */
export function tapFeedback(): void {
  feedback('tap')
}

/** Success feedback for completed actions */
export function successFeedback(): void {
  feedback('success')
}

/** Error feedback for failed actions */
export function errorFeedback(): void {
  feedback('error')
}

/** Warning feedback for caution states */
export function warningFeedback(): void {
  feedback('warning')
}

/** Feedback for quantity increase */
export function increaseFeedback(): void {
  feedback('increase')
}

/** Feedback for quantity decrease */
export function decreaseFeedback(): void {
  feedback('decrease')
}

/** Feedback when hitting min/max boundary */
export function boundaryFeedback(): void {
  feedback('boundary')
}

/** Feedback for item selection */
export function selectionFeedback(): void {
  feedback('selection')
}

/** Feedback for item deselection */
export function deselectionFeedback(): void {
  feedback('deselection')
}

/** Combined feedback for successful scan - haptic + audio */
export function scanSuccessFeedback(): void {
  feedback('scan')
}

/** Feedback for scan errors */
export function scanErrorFeedback(): void {
  feedback('scanError')
}

/** Feedback for destructive actions (delete, etc.) */
export function deleteFeedback(): void {
  feedback('delete')
}

/** Feedback for completed tasks/workflows */
export function completeFeedback(): void {
  feedback('complete')
}

// Legacy alias for backward compatibility
export const playScanBeep = scanSuccessFeedback
