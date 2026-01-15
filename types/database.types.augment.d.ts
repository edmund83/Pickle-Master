import type { Enums, Tables } from './database.types'

declare module '@/types/database.types' {
  export type Profile = Tables<'profiles'>
  export type Folder = Tables<'folders'>
  export type InventoryItem = Tables<'inventory_items'>
  export type ActivityLog = Tables<'activity_logs'>
  export type Notification = Tables<'notifications'>
  export type CustomFieldDefinition = Tables<'custom_field_definitions'>
  export type Tag = Tables<'tags'>
  export type Vendor = Tables<'vendors'>
  export type Tenant = Tables<'tenants'>
  export type Alert = Tables<'alerts'>
  export type Job = Tables<'jobs'>

  export type InventoryItemWithTags = Tables<'items_with_tags'>
  export type TagListItem = Pick<Tag, 'id' | 'name' | 'color'>

  export type ItemCondition = Enums<'item_condition'>
  export type ComparisonOperator = Enums<'comparison_operator_enum'>
  export type ReminderType = Enums<'reminder_type_enum'>
  export type ReminderRecurrence = Enums<'reminder_recurrence_enum'>
  export type ReminderStatus = Enums<'reminder_status_enum'>

  export type ItemTrackingMode = 'none' | 'serialized' | 'lot_expiry'

  export type PurchaseOrder = Tables<'purchase_orders'>
  export type PickList = Tables<'pick_lists'>

  export type PurchaseOrderWithRelations = PurchaseOrder & {
    vendors?: Pick<Vendor, 'id' | 'name'> | null
    created_by_profile?: Pick<Profile, 'id' | 'full_name'> | null
    submitted_by_profile?: Pick<Profile, 'id' | 'full_name'> | null
  }

  export type PickListWithRelations = PickList & {
    assigned_to_profile?: Pick<Profile, 'id' | 'full_name'> | null
    created_by_profile?: Pick<Profile, 'id' | 'full_name'> | null
  }

  export interface ItemReminderWithDetails {
    id: string
    source_type: 'item' | 'folder'
    item_id: string | null
    folder_id: string | null
    item_name: string | null
    folder_name: string | null
    reminder_type: ReminderType
    title: string | null
    message: string | null
    threshold: number | null
    comparison_operator: ComparisonOperator | null
    days_before_expiry: number | null
    scheduled_at: string | null
    recurrence: ReminderRecurrence | null
    recurrence_end_date: string | null
    notify_in_app: boolean
    notify_email: boolean
    notify_user_ids: string[] | null
    status: ReminderStatus
    last_triggered_at: string | null
    next_trigger_at: string | null
    trigger_count: number | null
    trigger_description: string
    created_at: string
    updated_at: string | null
    created_by: string
    created_by_name: string | null
  }

  export interface CreateReminderInput {
    itemId: string
    reminderType: ReminderType
    title?: string
    message?: string
    threshold?: number
    daysBeforeExpiry?: number
    scheduledAt?: string
    recurrence?: ReminderRecurrence
    recurrenceEndDate?: string
    notifyInApp?: boolean
    notifyEmail?: boolean
    notifyUserIds?: string[]
    comparisonOperator?: ComparisonOperator
  }
}

