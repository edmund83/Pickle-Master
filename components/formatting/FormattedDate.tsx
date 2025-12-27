'use client'

import { useFormatting } from '@/hooks/useFormatting'

interface FormattedDateProps {
  date: string | Date | null | undefined
  className?: string
}

interface FormattedDateTimeProps {
  date: string | Date | null | undefined
  className?: string
}

interface FormattedShortDateProps {
  date: string | Date | null | undefined
  className?: string
}

interface FormattedRelativeDateProps {
  date: string | Date | null | undefined
  className?: string
}

export function FormattedDate({ date, className }: FormattedDateProps) {
  const { formatDate } = useFormatting()
  return <span className={className}>{formatDate(date)}</span>
}

export function FormattedDateTime({ date, className }: FormattedDateTimeProps) {
  const { formatDateTime } = useFormatting()
  return <span className={className}>{formatDateTime(date)}</span>
}

export function FormattedShortDate({ date, className }: FormattedShortDateProps) {
  const { formatShortDate } = useFormatting()
  return <span className={className}>{formatShortDate(date)}</span>
}

export function FormattedRelativeDate({ date, className }: FormattedRelativeDateProps) {
  const { formatRelativeDate } = useFormatting()
  return <span className={className}>{formatRelativeDate(date)}</span>
}
