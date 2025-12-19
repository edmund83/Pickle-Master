'use client'

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from 'react'

type SoundType = 'success' | 'error' | 'tap' | 'scan' | 'warning' | 'pop'

interface SoundContextType {
  playSound: (type: SoundType) => void
  isMuted: boolean
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  volume: number
  setVolume: (volume: number) => void
}

const SoundContext = createContext<SoundContextType | null>(null)

// Using Web Audio API for more reliable, low-latency sounds
const soundFrequencies: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
  success: { freq: 880, duration: 150, type: 'sine' },      // A5 - pleasant high note
  error: { freq: 220, duration: 200, type: 'square' },      // A3 - buzzy low note
  tap: { freq: 1200, duration: 30, type: 'sine' },          // Quick tick
  scan: { freq: 1000, duration: 100, type: 'sine' },        // Beep
  warning: { freq: 440, duration: 150, type: 'triangle' },  // A4 - warning tone
  pop: { freq: 600, duration: 50, type: 'sine' },           // Pop sound
}

interface SoundProviderProps {
  children: ReactNode
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [isMuted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Load preferences on mount
  useEffect(() => {
    const storedMuted = localStorage.getItem('sound-muted')
    const storedVolume = localStorage.getItem('sound-volume')

    if (storedMuted !== null) {
      setMuted(storedMuted === 'true')
    }
    if (storedVolume !== null) {
      setVolume(parseFloat(storedVolume))
    }
  }, [])

  // Save preferences when changed
  useEffect(() => {
    localStorage.setItem('sound-muted', String(isMuted))
  }, [isMuted])

  useEffect(() => {
    localStorage.setItem('sound-volume', String(volume))
  }, [volume])

  // Initialize AudioContext on first user interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return

      try {
        const ctx = getAudioContext()

        // Resume context if suspended (autoplay policy)
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const sound = soundFrequencies[type]
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.type = sound.type
        oscillator.frequency.setValueAtTime(sound.freq, ctx.currentTime)

        // Create an envelope for a nicer sound
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + sound.duration / 1000)

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + sound.duration / 1000)

        // Play success with a second harmonic for a richer sound
        if (type === 'success') {
          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()

          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(sound.freq * 1.5, ctx.currentTime) // Fifth above

          gain2.gain.setValueAtTime(0, ctx.currentTime)
          gain2.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.01)
          gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + sound.duration / 1000)

          osc2.connect(gain2)
          gain2.connect(ctx.destination)

          osc2.start(ctx.currentTime + 0.05) // Slight delay
          osc2.stop(ctx.currentTime + sound.duration / 1000 + 0.05)
        }
      } catch {
        // Silently fail if audio is not supported
      }
    },
    [isMuted, volume, getAudioContext]
  )

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev)
  }, [])

  return (
    <SoundContext.Provider
      value={{
        playSound,
        isMuted,
        toggleMute,
        setMuted,
        volume,
        setVolume,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)

  if (!context) {
    // Return a no-op if used outside provider
    return {
      playSound: () => {},
      isMuted: true,
      toggleMute: () => {},
      setMuted: () => {},
      volume: 0,
      setVolume: () => {},
    }
  }

  return context
}
