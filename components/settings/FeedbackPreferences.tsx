'use client'

import { useState, useEffect } from 'react'
import { Volume2, Vibrate, VolumeX, Info } from 'lucide-react'
import { SettingsSection, SettingsToggle } from '@/components/settings'
import {
  getFeedbackPreferences,
  setFeedbackPreferences,
  tapFeedback,
  successFeedback,
  type FeedbackPreferences as FeedbackPrefsType,
} from '@/lib/utils/feedback'

// Check if device supports haptic feedback (Android only)
function supportsHaptic(): boolean {
  if (typeof navigator === 'undefined') return false
  return typeof navigator.vibrate === 'function'
}

// Detect iOS
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function FeedbackPreferences() {
  const [prefs, setPrefs] = useState<FeedbackPrefsType>({
    hapticEnabled: true,
    soundEnabled: true,
    soundVolume: 0.7,
  })
  const [mounted, setMounted] = useState(false)
  const [hasHaptic, setHasHaptic] = useState(true)
  const [isiOSDevice, setIsiOSDevice] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    setMounted(true)
    setPrefs(getFeedbackPreferences())
    setHasHaptic(supportsHaptic())
    setIsiOSDevice(isIOS())
  }, [])

  const handleHapticToggle = (checked: boolean) => {
    setFeedbackPreferences({ hapticEnabled: checked })
    setPrefs((prev) => ({ ...prev, hapticEnabled: checked }))
    // Play feedback to demonstrate (only if enabling)
    if (checked) {
      tapFeedback()
    }
  }

  const handleSoundToggle = (checked: boolean) => {
    setFeedbackPreferences({ soundEnabled: checked })
    setPrefs((prev) => ({ ...prev, soundEnabled: checked }))
    // Play feedback to demonstrate (only if enabling)
    if (checked) {
      setTimeout(() => successFeedback(), 100)
    }
  }

  const handleVolumeChange = (volume: number) => {
    setFeedbackPreferences({ soundVolume: volume })
    setPrefs((prev) => ({ ...prev, soundVolume: volume }))
    // Play a test sound at the new volume
    if (prefs.soundEnabled) {
      setTimeout(() => tapFeedback(), 50)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <SettingsSection
      title="Feedback Preferences"
      description="Configure sound and vibration feedback for interactions"
      icon={Volume2}
    >
      <div className="space-y-3">
        {/* iOS notice */}
        {isiOSDevice && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-blue-700">
              iOS doesn&apos;t support vibration. Sound effects are your primary feedback on this device.
            </p>
          </div>
        )}

        {/* Only show haptic toggle if device supports it */}
        {hasHaptic && (
          <SettingsToggle
            icon={Vibrate}
            label="Haptic Feedback"
            description="Vibration feedback on button presses, scans, and quantity changes"
            checked={prefs.hapticEnabled}
            onChange={handleHapticToggle}
          />
        )}

        <SettingsToggle
          icon={prefs.soundEnabled ? Volume2 : VolumeX}
          label="Sound Effects"
          description="Audio feedback for scans, success notifications, and errors"
          checked={prefs.soundEnabled}
          onChange={handleSoundToggle}
        />

        {prefs.soundEnabled && (
          <div className="ml-12 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Sound Volume
            </label>
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4 text-neutral-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={prefs.soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary"
              />
              <Volume2 className="h-4 w-4 text-neutral-400" />
              <span className="w-12 text-right text-sm text-neutral-500">
                {Math.round(prefs.soundVolume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  )
}
