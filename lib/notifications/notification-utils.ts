import {
  Bell,
  AlertTriangle,
  Package,
  Settings,
  Users,
  MessageCircle,
  AtSign,
  Calendar,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'

/**
 * Icon mapping for all notification types
 */
export const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  low_stock: AlertTriangle,
  order_update: Package,
  system: Settings,
  team: Users,
  alert: Bell,
  reminder_low_stock: AlertTriangle,
  reminder_expiry: Calendar,
  reminder_restock: RefreshCw,
  chatter: MessageCircle,
}

/**
 * Color mapping for notification types (Tailwind classes)
 */
export const NOTIFICATION_COLORS: Record<string, string> = {
  low_stock: 'bg-yellow-100 text-yellow-600',
  order_update: 'bg-blue-100 text-blue-600',
  system: 'bg-neutral-100 text-neutral-600',
  team: 'bg-purple-100 text-purple-600',
  alert: 'bg-red-100 text-red-600',
  reminder_low_stock: 'bg-yellow-100 text-yellow-600',
  reminder_expiry: 'bg-orange-100 text-orange-600',
  reminder_restock: 'bg-blue-100 text-blue-600',
  chatter: 'bg-green-100 text-green-600',
}

/**
 * Special colors for chatter notification subtypes
 */
export const CHATTER_SUBTYPE_COLORS: Record<string, string> = {
  mention: 'bg-indigo-100 text-indigo-600',
  message: 'bg-green-100 text-green-600',
}

/**
 * Get the route for an entity based on its type and ID
 */
export function getEntityRoute(
  entityType: string | null | undefined,
  entityId: string | null | undefined
): string {
  if (!entityType || !entityId) return '/notifications'

  const routes: Record<string, string> = {
    item: `/inventory/${entityId}`,
    checkout: `/tasks/checkouts/${entityId}`,
    stock_count: `/tasks/stock-count/${entityId}`,
    purchase_order: `/tasks/purchase-orders/${entityId}`,
    pick_list: `/tasks/pick-lists/${entityId}`,
    receive: `/tasks/receives/${entityId}`,
    customer: `/settings/customers/${entityId}`,
    sales_order: `/tasks/sales-orders/${entityId}`,
    delivery_order: `/tasks/delivery-orders/${entityId}`,
    invoice: `/tasks/invoices/${entityId}`,
  }

  return routes[entityType] || '/notifications'
}

/**
 * Get the appropriate icon for a notification
 * For chatter notifications, uses AtSign for mentions, MessageCircle for regular messages
 */
export function getNotificationIcon(
  notificationType: string,
  notificationSubtype?: string | null
): LucideIcon {
  if (notificationType === 'chatter' && notificationSubtype === 'mention') {
    return AtSign
  }
  return NOTIFICATION_ICONS[notificationType] || Bell
}

/**
 * Get the appropriate color class for a notification
 * For chatter notifications, uses special colors based on subtype
 */
export function getNotificationColor(
  notificationType: string,
  notificationSubtype?: string | null
): string {
  if (notificationType === 'chatter' && notificationSubtype) {
    return CHATTER_SUBTYPE_COLORS[notificationSubtype] || NOTIFICATION_COLORS.chatter
  }
  return NOTIFICATION_COLORS[notificationType] || NOTIFICATION_COLORS.system
}
