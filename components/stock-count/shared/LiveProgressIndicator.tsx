'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TeamMemberAvatar, TeamMemberAvatarGroup } from './TeamMemberAvatar'

interface TeamMemberProgress {
  id: string
  name: string | null
  countedItems: number
  lastActivity?: Date
}

interface LiveProgressIndicatorProps {
  stockCountId: string
  totalItems: number
  countedItems: number
  teamProgress?: TeamMemberProgress[]
  isLive?: boolean
  className?: string
}

export function LiveProgressIndicator({
  stockCountId,
  totalItems,
  countedItems,
  teamProgress = [],
  isLive = false,
  className,
}: LiveProgressIndicatorProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const percent = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0

  // Simulate live updates (in a real app, this would use Supabase Realtime)
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }

  // Get active counters (last activity within 5 minutes)
  const activeCounters = teamProgress.filter((tp) => {
    if (!tp.lastActivity) return false
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(tp.lastActivity) > fiveMinutesAgo
  })

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-neutral-500" />
          <h3 className="font-medium text-neutral-900">Team Progress</h3>
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'p-1.5 rounded-lg',
            'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
            'transition-colors duration-200',
            isRefreshing && 'animate-spin'
          )}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-neutral-500">Overall Progress</span>
          <span className="font-semibold text-neutral-900">
            {countedItems} of {totalItems}
          </span>
        </div>
        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              percent === 100 ? 'bg-green-500' : 'bg-pickle-500'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Active Counters */}
      {activeCounters.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-neutral-500 mb-2">Currently counting:</p>
          <div className="flex items-center gap-2">
            <TeamMemberAvatarGroup
              members={activeCounters.map((tc) => ({
                id: tc.id,
                name: tc.name,
              }))}
              size="sm"
            />
            <span className="text-sm text-neutral-600">
              {activeCounters.length} active
            </span>
          </div>
        </div>
      )}

      {/* Team Member Breakdown */}
      {teamProgress.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Individual progress:</p>
          {teamProgress.map((member) => {
            const memberPercent =
              totalItems > 0
                ? Math.round((member.countedItems / totalItems) * 100)
                : 0
            return (
              <div key={member.id} className="flex items-center gap-2">
                <TeamMemberAvatar name={member.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-neutral-700 truncate">
                      {member.name || 'Unknown'}
                    </span>
                    <span className="text-neutral-500 ml-2">
                      {member.countedItems} items
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pickle-400 rounded-full transition-all duration-300"
                      style={{ width: `${memberPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {teamProgress.length === 0 && (
        <div className="text-center py-4">
          <Users className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">
            No team members assigned yet
          </p>
        </div>
      )}

      {/* Last Updated */}
      <p className="text-xs text-neutral-400 mt-3 text-center">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </p>
    </div>
  )
}
