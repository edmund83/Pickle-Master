// Default folder colors for color picker
export const FOLDER_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
] as const

export type FolderColor = (typeof FOLDER_COLORS)[number]
