/**
 * Haptic and audio feedback utilities for scanner interactions
 */

// Cached audio context and buffer for scan beep
let audioContext: AudioContext | null = null
let scanBeepBuffer: AudioBuffer | null = null

/**
 * Initialize the audio context (must be called from a user interaction)
 */
export function initAudioContext(): void {
  if (typeof window === 'undefined') return
  if (audioContext) return

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    // Pre-generate the beep sound
    generateScanBeep()
  } catch (e) {
    console.warn('Audio context not supported:', e)
  }
}

/**
 * Generate a short beep sound buffer
 */
function generateScanBeep(): void {
  if (!audioContext) return

  const duration = 0.1 // 100ms beep
  const frequency = 1800 // Hz - a pleasant, audible beep
  const sampleRate = audioContext.sampleRate
  const numSamples = duration * sampleRate

  scanBeepBuffer = audioContext.createBuffer(1, numSamples, sampleRate)
  const channel = scanBeepBuffer.getChannelData(0)

  for (let i = 0; i < numSamples; i++) {
    // Sine wave with envelope (fade in/out to avoid clicks)
    const t = i / sampleRate
    const envelope = Math.min(1, Math.min(t / 0.01, (duration - t) / 0.01))
    channel[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
  }
}

/**
 * Play the scan success beep
 */
export function playScanBeep(): void {
  if (!audioContext || !scanBeepBuffer) {
    initAudioContext()
    if (!audioContext || !scanBeepBuffer) return
  }

  // Resume audio context if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  try {
    const source = audioContext.createBufferSource()
    source.buffer = scanBeepBuffer
    source.connect(audioContext.destination)
    source.start()
  } catch (e) {
    console.warn('Failed to play scan beep:', e)
  }
}

/**
 * Trigger haptic feedback (vibration)
 * @param pattern - Vibration pattern in ms. Default is a short 50ms pulse.
 */
export function triggerHaptic(pattern: number | number[] = 50): void {
  if (typeof navigator === 'undefined') return
  if (!navigator.vibrate) return

  try {
    navigator.vibrate(pattern)
  } catch (e) {
    // Vibration API not supported or blocked
  }
}

/**
 * Combined feedback for successful scan - haptic + audio
 */
export function scanSuccessFeedback(): void {
  triggerHaptic(50)
  playScanBeep()
}

/**
 * Feedback for errors - longer vibration pattern
 */
export function scanErrorFeedback(): void {
  triggerHaptic([100, 50, 100])
}
