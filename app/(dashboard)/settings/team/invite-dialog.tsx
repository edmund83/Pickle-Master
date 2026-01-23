'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Loader2, Copy, Check, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createInvitation } from '@/app/actions/invitations'

interface InviteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Role = 'staff' | 'viewer'

const roleDescriptions: Record<Role, string> = {
  staff: 'Can create, edit, and delete inventory items',
  viewer: 'Can only view inventory and reports',
}

export function InviteDialog({ isOpen, onClose, onSuccess }: InviteDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('staff')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setRole('staff')
      setError('')
      setInviteUrl(null)
      setCopied(false)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await createInvitation({ email, role })

      if (!result.success) {
        setError(result.error || 'Failed to send invitation')
        return
      }

      // Show success with invite link
      const fullUrl = `${window.location.origin}${result.invite_url}`
      setInviteUrl(fullUrl)
      onSuccess?.()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function copyInviteLink() {
    if (!inviteUrl) return

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-dialog-title"
        className={cn(
          'relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl',
          'animate-in duration-200 zoom-in-95 fade-in-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 id="invite-dialog-title" className="text-lg font-semibold text-neutral-900">
              Invite Team Member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {inviteUrl ? (
          // Success state - show invite link
          <div className="px-6 py-6 space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
                <Check className="h-8 w-8" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-neutral-900">Invitation created!</p>
              <p className="mt-1 text-sm text-neutral-500">
                Share this link with <span className="font-medium">{email}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="flex-1 text-sm bg-neutral-50"
              />
              <Button
                type="button"
                variant="outline"
                onClick={copyInviteLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-neutral-400 text-center">
              This link expires in 7 days
            </p>
          </div>
        ) : (
          // Form state
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="invite-email" className="text-sm font-medium text-neutral-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['staff', 'viewer'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      disabled={isLoading}
                      className={cn(
                        'flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left',
                        role === r
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <span className={cn(
                        'text-sm font-medium capitalize',
                        role === r ? 'text-primary' : 'text-neutral-900'
                      )}>
                        {r}
                      </span>
                      <span className="text-xs text-neutral-500 mt-0.5">
                        {roleDescriptions[r]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="flex-1 h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Close button for success state */}
        {inviteUrl && (
          <div className="px-6 pb-4">
            <Button
              type="button"
              onClick={onClose}
              className="w-full h-11"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
