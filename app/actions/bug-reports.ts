'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/auth/server-auth'
import { z } from 'zod'
import { sendAdminBugReportNotification } from './email'

// ============================================
// Types
// ============================================

// Categories defined inline for validation (not exported - 'use server' files can only export async functions)
const bugReportCategories = [
  'bug',
  'feature_request',
  'performance',
  'ui_ux',
  'data',
  'other',
] as const

type BugReportCategory = (typeof bugReportCategories)[number]

interface BugReport {
  id: string
  tenant_id: string
  user_id: string
  category: BugReportCategory
  subject: string
  description: string
  page_url: string | null
  browser_info: string | null
  status: string
  created_at: string
  updated_at: string
}

// ============================================
// Validation schemas
// ============================================

const bugReportSchema = z.object({
  category: z.enum(bugReportCategories),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(255, 'Subject must be less than 255 characters'),
  description: z.string().min(10, 'Please provide more detail (at least 10 characters)').max(2000, 'Description must be less than 2000 characters'),
  pageUrl: z.string().max(500).optional(),
  browserInfo: z.string().max(500).optional(),
})

type BugReportInput = z.infer<typeof bugReportSchema>

// ============================================
// Server Actions
// ============================================

/**
 * Submit a bug report
 */
export async function submitBugReport(input: BugReportInput): Promise<{
  success: boolean
  error?: string
  data?: { id: string }
}> {
  // 1. Authenticate user
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { userId, tenantId } = authResult.context

  // 2. Validate input
  const validation = bugReportSchema.safeParse(input)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || 'Invalid input' }
  }

  // 3. Insert into database
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('bug_reports')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      category: validation.data.category,
      subject: validation.data.subject,
      description: validation.data.description,
      page_url: validation.data.pageUrl || null,
      browser_info: validation.data.browserInfo || null,
      status: 'new',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to submit bug report:', error)
    return { success: false, error: 'Failed to submit report. Please try again.' }
  }

  // 4. Send admin email notification (non-blocking)
  const { data: userData } = await supabase.auth.getUser()
  const userEmail = userData?.user?.email || 'unknown'

  sendAdminBugReportNotification(
    data.id,
    validation.data.category,
    validation.data.subject,
    validation.data.description,
    userEmail,
    validation.data.pageUrl || null
  ).catch((err) => {
    // Log but don't fail the request
    console.error('Failed to send admin notification:', err)
  })

  return { success: true, data: { id: data.id } }
}

/**
 * Get user's bug reports
 */
export async function getUserBugReports(): Promise<{
  success: boolean
  data?: BugReport[]
  error?: string
}> {
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('bug_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get bug reports:', error)
    return { success: false, error: 'Failed to load reports.' }
  }

  return { success: true, data: data as BugReport[] }
}
