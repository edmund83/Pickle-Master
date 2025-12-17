
import { Folder, InventoryItem, ItemStatus, Tenant, ActivityLog } from './types';

export const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'Global Warehouse Solutions', logo: 'https://picsum.photos/seed/warehouse/100/100' },
  { id: 't2', name: 'Creative Studio Supplies', logo: 'https://picsum.photos/seed/studio/100/100' },
];

export const MOCK_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Main Warehouse', parentId: null, itemCount: 120, color: '#4f46e5' },
  { id: 'f2', name: 'Showroom', parentId: null, itemCount: 45, color: '#0891b2' },
  { id: 'f3', name: 'IT Equipment', parentId: 'f1', itemCount: 30, color: '#7c3aed' },
  { id: 'f4', name: 'Cleaning Supplies', parentId: 'f1', itemCount: 15, color: '#db2777' },
  { id: 'f5', name: 'Smartphones', parentId: 'f3', itemCount: 12, color: '#2563eb' },
];

export const MOCK_ITEMS: InventoryItem[] = [
  {
    id: 'i1',
    name: 'iPhone 15 Pro Max',
    sku: 'IPH-15-PM-512',
    serialNumber: 'SN-992031-X',
    quantity: 12,
    minQuantity: 5,
    price: 1199.00,
    folderId: 'f5',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=300&auto=format&fit=crop',
    barcode: 'QR-IPH-15-2024',
    status: ItemStatus.IN_STOCK,
    lastUpdated: '2024-02-15',
    location: 'Aisle 4, Bin 22',
    tags: ['electronics', 'apple', 'mobile'],
    notes: 'Fragile handling required. Pre-loaded with standard apps.',
    customFields: { "Warranty": "2 Years", "Supplier": "Apple Inc" }
  },
  {
    id: 'i2',
    name: 'Ergonomic Mesh Chair',
    sku: 'FURN-CHR-04',
    quantity: 3,
    minQuantity: 10,
    price: 349.00,
    folderId: 'f2',
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300&auto=format&fit=crop',
    barcode: 'BC-CHR-004',
    status: ItemStatus.LOW_STOCK,
    lastUpdated: '2024-02-10',
    location: 'Display Floor',
    tags: ['furniture', 'office', 'ergonomic'],
    notes: 'Customer display model.'
  },
  {
    id: 'i3',
    name: 'MacBook Pro 14"',
    sku: 'MBP-14-M3',
    serialNumber: 'SN-AAPL-M3-441',
    quantity: 0,
    minQuantity: 2,
    price: 1999.00,
    folderId: 'f3',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop',
    barcode: 'QR-MBP-14',
    status: ItemStatus.OUT_OF_STOCK,
    lastUpdated: '2024-01-28',
    location: 'Tech Locker 1',
    tags: ['laptop', 'workstation', 'tech'],
  },
];

export const MOCK_HISTORY: ActivityLog[] = [
  { id: 'h1', itemId: 'i1', itemName: 'iPhone 15 Pro Max', type: 'QUANTITY_CHANGE', delta: 5, timestamp: '2024-02-15T14:30:00Z', user: 'Alex Carter' },
  { id: 'h2', itemId: 'i2', itemName: 'Ergonomic Mesh Chair', type: 'MOVED', from: 'Warehouse A', to: 'Showroom', timestamp: '2024-02-14T09:15:00Z', user: 'Sam Smith' },
  { id: 'h3', itemId: 'i1', itemName: 'iPhone 15 Pro Max', type: 'ADDED', timestamp: '2024-02-10T11:00:00Z', user: 'Alex Carter' },
];
