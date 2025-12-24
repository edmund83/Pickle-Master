import { getAllReminders, getReminderStats } from './actions/reminder-actions'
import { RemindersClient } from './components/reminders-client'

export const dynamic = 'force-dynamic'

export default async function RemindersPage() {
  const [remindersResult, stats] = await Promise.all([
    getAllReminders(),
    getReminderStats(),
  ])

  return (
    <RemindersClient
      initialReminders={remindersResult.reminders}
      initialTotal={remindersResult.total}
      initialStats={stats}
    />
  )
}
