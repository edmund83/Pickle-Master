'use client'

import { useState } from 'react'
import { User, Calendar, ChevronDown, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import type { StockCountWizardData } from './StockCountWizard'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface WizardStepAssignProps {
  data: StockCountWizardData
  updateData: (updates: Partial<StockCountWizardData>) => void
  teamMembers: TeamMember[]
}

export function WizardStepAssign({
  data,
  updateData,
  teamMembers,
}: WizardStepAssignProps) {
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)
  const { formatDate } = useFormatting()

  function handleTeamMemberSelect(member: TeamMember | null) {
    if (member) {
      updateData({
        assignedTo: member.id,
        assignedToName: member.full_name || member.email,
      })
    } else {
      updateData({
        assignedTo: null,
        assignedToName: null,
      })
    }
    setShowTeamDropdown(false)
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateData({ dueDate: e.target.value || null })
  }

  // Get initials for avatar
  function getInitials(name: string | null, email: string): string {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Assignment Info */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <p className="text-sm text-neutral-600">
          Optionally assign this stock count to a team member and set a due date.
          You can skip this step if you prefer.
        </p>
      </div>

      {/* Team Member Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Assign to <span className="text-neutral-400">(optional)</span>
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTeamDropdown(!showTeamDropdown)}
            className={cn(
              'w-full flex items-center gap-3 p-4',
              'rounded-xl border-2 text-left',
              'transition-all duration-200',
              data.assignedTo
                ? 'border-primary/30 bg-primary/10'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            )}
          >
            {data.assignedTo ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold text-sm">
                  {getInitials(data.assignedToName, '')}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-neutral-900">
                    {data.assignedToName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTeamMemberSelect(null)
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <User className="h-5 w-5" />
                </div>
                <span className="flex-1 text-neutral-500">
                  Select team member...
                </span>
                <ChevronDown className="h-5 w-5 text-neutral-400" />
              </>
            )}
          </button>

          {/* Dropdown */}
          {showTeamDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTeamDropdown(false)}
              />
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {teamMembers.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleTeamMemberSelect(member)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3',
                          'text-left transition-colors',
                          data.assignedTo === member.id
                            ? 'bg-primary/10'
                            : 'hover:bg-neutral-50'
                        )}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 font-medium text-sm">
                          {getInitials(member.full_name, member.email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 truncate">
                            {member.full_name || 'No name'}
                          </p>
                          <p className="text-sm text-neutral-500 truncate">
                            {member.email}
                          </p>
                        </div>
                        {data.assignedTo === member.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <User className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">
                      No team members found
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Due date <span className="text-neutral-400">(optional)</span>
        </label>

        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
          <Input
            type="date"
            value={data.dueDate || ''}
            onChange={handleDateChange}
            min={today}
            className="h-12 pl-12"
          />
        </div>

        {data.dueDate && (
          <button
            type="button"
            onClick={() => updateData({ dueDate: null })}
            className="text-sm text-neutral-500 hover:text-neutral-700 underline"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Notes <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => updateData({ notes: e.target.value })}
          placeholder="Add any instructions or notes for this count..."
          rows={3}
          className={cn(
            'w-full px-4 py-3 rounded-xl border border-neutral-300',
            'text-sm placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-all duration-200 resize-none'
          )}
        />
      </div>

      {/* Selected Summary */}
      {(data.assignedTo || data.dueDate) && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-2 animate-in fade-in duration-200">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Assignment Summary
          </p>
          {data.assignedTo && (
            <p className="text-sm text-primary">
              Assigned to: <strong>{data.assignedToName}</strong>
            </p>
          )}
          {data.dueDate && (
            <p className="text-sm text-primary">
              Due: <strong>{formatDate(data.dueDate)}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
