
export enum ItemStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock'
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  serialNumber?: string;
  quantity: number;
  minQuantity: number;
  price: number;
  folderId: string;
  imageUrl?: string;
  barcode?: string;
  status: ItemStatus;
  lastUpdated: string;
  location?: string;
  tags: string[];
  notes?: string;
  customFields?: Record<string, string>;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  itemCount?: number;
  color?: string;
}

export interface ActivityLog {
  id: string;
  itemId: string;
  itemName: string;
  type: 'ADDED' | 'REMOVED' | 'MOVED' | 'QUANTITY_CHANGE' | 'EDITED';
  delta?: number;
  from?: string;
  to?: string;
  timestamp: string;
  user: string;
}

export interface Tenant {
  id: string;
  name: string;
  logo: string;
}
