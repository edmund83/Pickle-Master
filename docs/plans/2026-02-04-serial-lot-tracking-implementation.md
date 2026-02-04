# Serial/Lot Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add serial/lot traceability to pick lists and delivery orders so users can answer "Which specific serials/lots did we ship to Customer X?"

**Architecture:** Inline expandable UI on pick list items for selecting serials/lots. Selections copy to delivery order on creation. DO can edit before dispatch. On dispatch, inventory updates (serials → sold, lots → quantity decreased).

**Tech Stack:** Next.js App Router, TypeScript, Supabase (migrations, RLS, RPC), Tailwind CSS, Vitest for tests

---

## Phase 1: Database Schema

### Task 1.1: Create pick_list_item_lots table

**Files:**
- Create: `supabase/migrations/00119_pick_list_item_tracking.sql`

**Step 1: Write the migration**

```sql
-- Migration: Add serial/lot tracking to pick list items
-- This creates junction tables to track which serials and lots are allocated to each pick list item

-- ============================================
-- 1. Create pick_list_item_lots table
-- ============================================
CREATE TABLE IF NOT EXISTS pick_list_item_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pick_list_item_id UUID NOT NULL REFERENCES pick_list_items(id) ON DELETE CASCADE,
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),

    UNIQUE(pick_list_item_id, lot_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pick_list_item_lots_item
    ON pick_list_item_lots(pick_list_item_id);
CREATE INDEX IF NOT EXISTS idx_pick_list_item_lots_lot
    ON pick_list_item_lots(lot_id);
CREATE INDEX IF NOT EXISTS idx_pick_list_item_lots_tenant
    ON pick_list_item_lots(tenant_id);

-- RLS
ALTER TABLE pick_list_item_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY pick_list_item_lots_tenant_isolation ON pick_list_item_lots
    FOR ALL
    USING (tenant_id = (SELECT get_user_tenant_id()))
    WITH CHECK (tenant_id = (SELECT get_user_tenant_id()));

-- ============================================
-- 2. Create pick_list_item_serials table
-- ============================================
CREATE TABLE IF NOT EXISTS pick_list_item_serials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pick_list_item_id UUID NOT NULL REFERENCES pick_list_items(id) ON DELETE CASCADE,
    serial_id UUID NOT NULL REFERENCES serial_numbers(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),

    UNIQUE(pick_list_item_id, serial_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pick_list_item_serials_item
    ON pick_list_item_serials(pick_list_item_id);
CREATE INDEX IF NOT EXISTS idx_pick_list_item_serials_serial
    ON pick_list_item_serials(serial_id);
CREATE INDEX IF NOT EXISTS idx_pick_list_item_serials_tenant
    ON pick_list_item_serials(tenant_id);

-- RLS
ALTER TABLE pick_list_item_serials ENABLE ROW LEVEL SECURITY;

CREATE POLICY pick_list_item_serials_tenant_isolation ON pick_list_item_serials
    FOR ALL
    USING (tenant_id = (SELECT get_user_tenant_id()))
    WITH CHECK (tenant_id = (SELECT get_user_tenant_id()));

-- ============================================
-- 3. Add lot tracking columns to delivery_order_item_serials
-- ============================================
-- The table already exists but needs lot quantity support
ALTER TABLE delivery_order_item_serials
    ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Add comment for clarity
COMMENT ON COLUMN delivery_order_item_serials.quantity IS
    'For lot tracking: quantity from this lot. For serials: always 1.';
```

**Step 2: Apply the migration**

Run: `npx supabase db push` or via Supabase MCP

**Step 3: Verify tables exist**

Run SQL in Supabase:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('pick_list_item_lots', 'pick_list_item_serials');
```
Expected: Both tables listed

**Step 4: Commit**

```bash
git add supabase/migrations/00119_pick_list_item_tracking.sql
git commit -m "feat(db): add serial/lot tracking tables for pick lists"
```

---

### Task 1.2: Create RPC functions for tracking allocation

**Files:**
- Create: `supabase/migrations/00120_pick_list_tracking_functions.sql`

**Step 1: Write the migration**

```sql
-- RPC functions for pick list serial/lot tracking

-- ============================================
-- 1. Allocate lots to a pick list item
-- ============================================
CREATE OR REPLACE FUNCTION allocate_pick_list_item_lots(
    p_pick_list_item_id UUID,
    p_allocations JSONB  -- Array of {lot_id, quantity}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_item_id UUID;
    v_requested_qty INTEGER;
    v_total_allocated INTEGER := 0;
    v_allocation JSONB;
BEGIN
    -- Get tenant and validate ownership
    SELECT pli.tenant_id, pli.item_id, pli.requested_quantity
    INTO v_tenant_id, v_item_id, v_requested_qty
    FROM pick_list_items pli
    JOIN pick_lists pl ON pl.id = pli.pick_list_id
    WHERE pli.id = p_pick_list_item_id
    AND pli.tenant_id = (SELECT get_user_tenant_id());

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pick list item not found');
    END IF;

    -- Clear existing allocations
    DELETE FROM pick_list_item_lots WHERE pick_list_item_id = p_pick_list_item_id;

    -- Insert new allocations
    FOR v_allocation IN SELECT * FROM jsonb_array_elements(p_allocations)
    LOOP
        INSERT INTO pick_list_item_lots (pick_list_item_id, lot_id, quantity, tenant_id)
        VALUES (
            p_pick_list_item_id,
            (v_allocation->>'lot_id')::UUID,
            (v_allocation->>'quantity')::INTEGER,
            v_tenant_id
        );
        v_total_allocated := v_total_allocated + (v_allocation->>'quantity')::INTEGER;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'total_allocated', v_total_allocated,
        'requested', v_requested_qty
    );
END;
$$;

-- ============================================
-- 2. Allocate serials to a pick list item
-- ============================================
CREATE OR REPLACE FUNCTION allocate_pick_list_item_serials(
    p_pick_list_item_id UUID,
    p_serial_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_item_id UUID;
    v_requested_qty INTEGER;
    v_serial_id UUID;
BEGIN
    -- Get tenant and validate ownership
    SELECT pli.tenant_id, pli.item_id, pli.requested_quantity
    INTO v_tenant_id, v_item_id, v_requested_qty
    FROM pick_list_items pli
    WHERE pli.id = p_pick_list_item_id
    AND pli.tenant_id = (SELECT get_user_tenant_id());

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pick list item not found');
    END IF;

    -- Clear existing allocations
    DELETE FROM pick_list_item_serials WHERE pick_list_item_id = p_pick_list_item_id;

    -- Insert new allocations
    FOREACH v_serial_id IN ARRAY p_serial_ids
    LOOP
        INSERT INTO pick_list_item_serials (pick_list_item_id, serial_id, tenant_id)
        VALUES (p_pick_list_item_id, v_serial_id, v_tenant_id);
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'total_allocated', array_length(p_serial_ids, 1),
        'requested', v_requested_qty
    );
END;
$$;

-- ============================================
-- 3. Get tracking allocations for a pick list item
-- ============================================
CREATE OR REPLACE FUNCTION get_pick_list_item_tracking(
    p_pick_list_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lots JSONB;
    v_serials JSONB;
BEGIN
    -- Get lot allocations
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', plil.id,
        'lot_id', plil.lot_id,
        'lot_number', l.lot_number,
        'batch_code', l.batch_code,
        'expiry_date', l.expiry_date,
        'quantity', plil.quantity,
        'available', l.quantity
    )), '[]'::jsonb)
    INTO v_lots
    FROM pick_list_item_lots plil
    JOIN lots l ON l.id = plil.lot_id
    WHERE plil.pick_list_item_id = p_pick_list_item_id
    AND plil.tenant_id = (SELECT get_user_tenant_id());

    -- Get serial allocations
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', plis.id,
        'serial_id', plis.serial_id,
        'serial_number', sn.serial_number,
        'status', sn.status
    )), '[]'::jsonb)
    INTO v_serials
    FROM pick_list_item_serials plis
    JOIN serial_numbers sn ON sn.id = plis.serial_id
    WHERE plis.pick_list_item_id = p_pick_list_item_id
    AND plis.tenant_id = (SELECT get_user_tenant_id());

    RETURN jsonb_build_object(
        'lots', v_lots,
        'serials', v_serials
    );
END;
$$;

-- ============================================
-- 4. Auto-allocate lots using FEFO
-- ============================================
CREATE OR REPLACE FUNCTION auto_allocate_lots_fefo(
    p_pick_list_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item_id UUID;
    v_requested_qty INTEGER;
    v_remaining INTEGER;
    v_allocations JSONB := '[]'::jsonb;
    v_lot RECORD;
    v_alloc_qty INTEGER;
BEGIN
    -- Get item details
    SELECT pli.item_id, pli.requested_quantity
    INTO v_item_id, v_requested_qty
    FROM pick_list_items pli
    WHERE pli.id = p_pick_list_item_id
    AND pli.tenant_id = (SELECT get_user_tenant_id());

    IF v_item_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;

    v_remaining := v_requested_qty;

    -- Get lots in FEFO order (earliest expiry first, nulls last)
    FOR v_lot IN
        SELECT id, lot_number, quantity, expiry_date
        FROM lots
        WHERE item_id = v_item_id
        AND status = 'active'
        AND quantity > 0
        AND tenant_id = (SELECT get_user_tenant_id())
        ORDER BY
            CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END,
            expiry_date ASC,
            created_at ASC
    LOOP
        EXIT WHEN v_remaining <= 0;

        v_alloc_qty := LEAST(v_lot.quantity, v_remaining);
        v_allocations := v_allocations || jsonb_build_object(
            'lot_id', v_lot.id,
            'quantity', v_alloc_qty
        );
        v_remaining := v_remaining - v_alloc_qty;
    END LOOP;

    -- Apply the allocations
    RETURN allocate_pick_list_item_lots(p_pick_list_item_id, v_allocations);
END;
$$;

-- ============================================
-- 5. Auto-allocate serials using FIFO
-- ============================================
CREATE OR REPLACE FUNCTION auto_allocate_serials_fifo(
    p_pick_list_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item_id UUID;
    v_requested_qty INTEGER;
    v_serial_ids UUID[];
BEGIN
    -- Get item details
    SELECT pli.item_id, pli.requested_quantity
    INTO v_item_id, v_requested_qty
    FROM pick_list_items pli
    WHERE pli.id = p_pick_list_item_id
    AND pli.tenant_id = (SELECT get_user_tenant_id());

    IF v_item_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Get serials in FIFO order
    SELECT ARRAY_AGG(id ORDER BY created_at ASC)
    INTO v_serial_ids
    FROM (
        SELECT id, created_at
        FROM serial_numbers
        WHERE item_id = v_item_id
        AND status = 'available'
        AND tenant_id = (SELECT get_user_tenant_id())
        ORDER BY created_at ASC
        LIMIT v_requested_qty
    ) sub;

    IF v_serial_ids IS NULL THEN
        v_serial_ids := ARRAY[]::UUID[];
    END IF;

    -- Apply the allocations
    RETURN allocate_pick_list_item_serials(p_pick_list_item_id, v_serial_ids);
END;
$$;
```

**Step 2: Apply the migration**

Run: `npx supabase db push` or via Supabase MCP

**Step 3: Test the functions**

```sql
-- Test: Should return empty allocations for new item
SELECT get_pick_list_item_tracking('some-pick-list-item-id'::uuid);
```

**Step 4: Commit**

```bash
git add supabase/migrations/00120_pick_list_tracking_functions.sql
git commit -m "feat(db): add RPC functions for pick list tracking allocation"
```

---

## Phase 2: Pick List Tracking UI

### Task 2.1: Create PickListItemTracking component

**Files:**
- Create: `components/pick-lists/PickListItemTracking.tsx`

**Step 1: Write the component**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  Wand2,
  Search,
  AlertTriangle,
  AlertCircle,
  Check
} from 'lucide-react'

interface LotAllocation {
  lot_id: string
  lot_number: string
  batch_code?: string
  expiry_date?: string
  quantity: number
  available: number
}

interface SerialAllocation {
  serial_id: string
  serial_number: string
  status: string
}

interface AvailableLot {
  id: string
  lot_number: string
  batch_code?: string
  expiry_date?: string
  quantity: number
  status: string
}

interface AvailableSerial {
  id: string
  serial_number: string
  status: string
}

interface PickListItemTrackingProps {
  pickListItemId: string
  itemId: string
  itemName: string
  itemSku?: string
  requestedQuantity: number
  trackingType: 'none' | 'serial' | 'lot'
  isEditable?: boolean
  onAllocationChange?: (isComplete: boolean) => void
}

export function PickListItemTracking({
  pickListItemId,
  itemId,
  itemName,
  itemSku,
  requestedQuantity,
  trackingType,
  isEditable = true,
  onAllocationChange
}: PickListItemTrackingProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Lot tracking state
  const [availableLots, setAvailableLots] = useState<AvailableLot[]>([])
  const [lotAllocations, setLotAllocations] = useState<Record<string, number>>({})

  // Serial tracking state
  const [availableSerials, setAvailableSerials] = useState<AvailableSerial[]>([])
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set())

  const supabase = createClient()

  // Calculate totals
  const totalAllocated = trackingType === 'lot'
    ? Object.values(lotAllocations).reduce((sum, qty) => sum + qty, 0)
    : selectedSerials.size

  const isComplete = totalAllocated === requestedQuantity

  // Notify parent of allocation status
  useEffect(() => {
    onAllocationChange?.(isComplete)
  }, [isComplete, onAllocationChange])

  // Load available lots/serials and current allocations
  useEffect(() => {
    if (!isExpanded) return

    async function loadData() {
      setIsLoading(true)
      try {
        if (trackingType === 'lot') {
          // Load available lots
          const { data: lots } = await supabase
            .from('lots')
            .select('id, lot_number, batch_code, expiry_date, quantity, status')
            .eq('item_id', itemId)
            .eq('status', 'active')
            .gt('quantity', 0)
            .order('expiry_date', { ascending: true, nullsFirst: false })

          setAvailableLots(lots || [])

          // Load current allocations
          const { data: tracking } = await supabase
            .rpc('get_pick_list_item_tracking', { p_pick_list_item_id: pickListItemId })

          if (tracking?.lots) {
            const allocs: Record<string, number> = {}
            tracking.lots.forEach((l: LotAllocation) => {
              allocs[l.lot_id] = l.quantity
            })
            setLotAllocations(allocs)
          }
        } else if (trackingType === 'serial') {
          // Load available serials
          const { data: serials } = await supabase
            .from('serial_numbers')
            .select('id, serial_number, status')
            .eq('item_id', itemId)
            .eq('status', 'available')
            .order('created_at', { ascending: true })

          setAvailableSerials(serials || [])

          // Load current allocations
          const { data: tracking } = await supabase
            .rpc('get_pick_list_item_tracking', { p_pick_list_item_id: pickListItemId })

          if (tracking?.serials) {
            const selected = new Set<string>()
            tracking.serials.forEach((s: SerialAllocation) => {
              selected.add(s.serial_id)
            })
            setSelectedSerials(selected)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isExpanded, itemId, pickListItemId, trackingType, supabase])

  // Auto-assign handler
  async function handleAutoAssign() {
    setIsLoading(true)
    try {
      if (trackingType === 'lot') {
        const { data } = await supabase.rpc('auto_allocate_lots_fefo', {
          p_pick_list_item_id: pickListItemId
        })
        if (data?.success) {
          // Reload allocations
          const { data: tracking } = await supabase
            .rpc('get_pick_list_item_tracking', { p_pick_list_item_id: pickListItemId })
          if (tracking?.lots) {
            const allocs: Record<string, number> = {}
            tracking.lots.forEach((l: LotAllocation) => {
              allocs[l.lot_id] = l.quantity
            })
            setLotAllocations(allocs)
          }
        }
      } else if (trackingType === 'serial') {
        const { data } = await supabase.rpc('auto_allocate_serials_fifo', {
          p_pick_list_item_id: pickListItemId
        })
        if (data?.success) {
          // Reload allocations
          const { data: tracking } = await supabase
            .rpc('get_pick_list_item_tracking', { p_pick_list_item_id: pickListItemId })
          if (tracking?.serials) {
            const selected = new Set<string>()
            tracking.serials.forEach((s: SerialAllocation) => {
              selected.add(s.serial_id)
            })
            setSelectedSerials(selected)
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Save lot allocation
  async function handleLotQuantityChange(lotId: string, quantity: number) {
    const newAllocations = { ...lotAllocations }
    if (quantity <= 0) {
      delete newAllocations[lotId]
    } else {
      newAllocations[lotId] = quantity
    }
    setLotAllocations(newAllocations)

    // Save to database
    const allocationsArray = Object.entries(newAllocations).map(([lot_id, qty]) => ({
      lot_id,
      quantity: qty
    }))

    await supabase.rpc('allocate_pick_list_item_lots', {
      p_pick_list_item_id: pickListItemId,
      p_allocations: allocationsArray
    })
  }

  // Toggle serial selection
  async function handleSerialToggle(serialId: string) {
    const newSelected = new Set(selectedSerials)
    if (newSelected.has(serialId)) {
      newSelected.delete(serialId)
    } else if (newSelected.size < requestedQuantity) {
      newSelected.add(serialId)
    }
    setSelectedSerials(newSelected)

    // Save to database
    await supabase.rpc('allocate_pick_list_item_serials', {
      p_pick_list_item_id: pickListItemId,
      p_serial_ids: Array.from(newSelected)
    })
  }

  // Get expiry status badge
  function getExpiryBadge(expiryDate?: string) {
    if (!expiryDate) return null

    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      return <Badge variant="destructive" className="ml-2"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>
    }
    if (daysUntil <= 30) {
      return <Badge variant="warning" className="ml-2"><AlertTriangle className="w-3 h-3 mr-1" />This month</Badge>
    }
    return null
  }

  // Filter serials by search
  const filteredSerials = availableSerials.filter(s =>
    s.serial_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (trackingType === 'none') {
    return null
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Badge variant={trackingType === 'lot' ? 'secondary' : 'outline'}>
            {trackingType === 'lot' ? '🏷️ Lot' : '🔢 Serial'}
          </Badge>
          <span className="font-medium">{itemName}</span>
          {itemSku && <span className="text-neutral-500 text-sm">SKU: {itemSku}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-sm font-medium",
            isComplete ? "text-green-600" : "text-amber-600"
          )}>
            {totalAllocated} / {requestedQuantity}
          </span>
          {isComplete ? (
            <Badge variant="success"><Check className="w-3 h-3 mr-1" />Assigned</Badge>
          ) : (
            <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t bg-neutral-50 p-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoAssign}
              disabled={!isEditable || isLoading}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {trackingType === 'lot' ? 'Auto-assign FEFO' : 'Auto-assign'}
            </Button>
            <span className={cn(
              "text-sm font-medium",
              isComplete ? "text-green-600" : "text-amber-600"
            )}>
              Need: {totalAllocated} / {requestedQuantity} {isComplete && '✓'}
            </span>
          </div>

          {/* Lot selection table */}
          {trackingType === 'lot' && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Lot #</th>
                    <th className="text-left px-3 py-2 font-medium">Expiry</th>
                    <th className="text-right px-3 py-2 font-medium">Available</th>
                    <th className="text-right px-3 py-2 font-medium w-32">Allocate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {availableLots.map(lot => (
                    <tr key={lot.id} className="hover:bg-neutral-50">
                      <td className="px-3 py-2">
                        <span className="font-mono">{lot.lot_number}</span>
                        {lot.batch_code && (
                          <span className="text-neutral-500 ml-2">({lot.batch_code})</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {lot.expiry_date ? (
                          <span className="flex items-center">
                            {new Date(lot.expiry_date).toLocaleDateString()}
                            {getExpiryBadge(lot.expiry_date)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right">{lot.quantity}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={lot.quantity}
                          value={lotAllocations[lot.id] || ''}
                          onChange={(e) => handleLotQuantityChange(lot.id, parseInt(e.target.value) || 0)}
                          disabled={!isEditable}
                          className="w-24 h-8 text-right ml-auto"
                        />
                      </td>
                    </tr>
                  ))}
                  {availableLots.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-neutral-500">
                        No lots available for this item
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Serial selection list */}
          {trackingType === 'serial' && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search serials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y">
                {filteredSerials.map(serial => (
                  <label
                    key={serial.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 cursor-pointer",
                      selectedSerials.has(serial.id) && "bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={selectedSerials.has(serial.id)}
                      onCheckedChange={() => handleSerialToggle(serial.id)}
                      disabled={!isEditable || (!selectedSerials.has(serial.id) && selectedSerials.size >= requestedQuantity)}
                    />
                    <span className="font-mono">{serial.serial_number}</span>
                    <Badge variant="outline" className="ml-auto">Available</Badge>
                  </label>
                ))}
                {filteredSerials.length === 0 && (
                  <div className="px-3 py-4 text-center text-neutral-500">
                    {searchQuery ? 'No serials match your search' : 'No serials available'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/pick-lists/PickListItemTracking.tsx
git commit -m "feat(ui): add PickListItemTracking component for serial/lot selection"
```

---

### Task 2.2: Integrate tracking into Pick List detail page

**Files:**
- Modify: `app/(dashboard)/tasks/pick-lists/[pickListId]/PickListDetailClient.tsx`

**Step 1: Add tracking type to item query**

Find the items query and add tracking_type from inventory_items:

```tsx
// Add to the items query - need to fetch tracking_type from inventory_items
// In the useEffect or data loading section, add:
const itemsWithTracking = await Promise.all(
  pickList.items.map(async (item) => {
    const { data: invItem } = await supabase
      .from('inventory_items')
      .select('tracking_type')
      .eq('id', item.item_id)
      .single()

    return {
      ...item,
      trackingType: invItem?.tracking_type || 'none'
    }
  })
)
```

**Step 2: Import and render PickListItemTracking**

```tsx
import { PickListItemTracking } from '@/components/pick-lists/PickListItemTracking'

// In the items list rendering, wrap each item with tracking:
{items.map((item) => (
  <div key={item.id} className="space-y-2">
    {/* Existing item card */}
    <PickListItemCard item={item} ... />

    {/* Add tracking component for tracked items */}
    {item.trackingType !== 'none' && (
      <PickListItemTracking
        pickListItemId={item.id}
        itemId={item.item_id}
        itemName={item.item_name}
        itemSku={item.item_sku}
        requestedQuantity={item.requested_quantity}
        trackingType={item.trackingType}
        isEditable={pickList.status === 'draft' || pickList.status === 'in_progress'}
      />
    )}
  </div>
))}
```

**Step 3: Add validation before completing pick list**

```tsx
// Before allowing "Complete Picking", validate all tracked items are assigned
const [trackingComplete, setTrackingComplete] = useState<Record<string, boolean>>({})

const allTrackingComplete = items
  .filter(i => i.trackingType !== 'none')
  .every(i => trackingComplete[i.id])

// Disable complete button if tracking incomplete
<Button
  disabled={!allTrackingComplete}
  onClick={handleCompletePicking}
>
  Complete Picking
</Button>
```

**Step 4: Commit**

```bash
git add app/(dashboard)/tasks/pick-lists/[pickListId]/PickListDetailClient.tsx
git commit -m "feat(ui): integrate serial/lot tracking into pick list detail"
```

---

## Phase 3: Delivery Order Tracking

### Task 3.1: Copy tracking from pick list to delivery order

**Files:**
- Modify: `app/actions/delivery-orders.ts`

**Step 1: Update createDeliveryOrder to copy tracking**

Add after creating delivery order items:

```tsx
// After inserting delivery_order_items, copy tracking from pick list items
for (const doItem of createdItems) {
  if (!doItem.pick_list_item_id) continue

  // Get tracking from pick list item
  const { data: tracking } = await supabase
    .rpc('get_pick_list_item_tracking', { p_pick_list_item_id: doItem.pick_list_item_id })

  if (!tracking) continue

  // Copy lot tracking
  if (tracking.lots?.length > 0) {
    for (const lot of tracking.lots) {
      await supabase
        .from('delivery_order_item_serials')
        .insert({
          delivery_order_item_id: doItem.id,
          lot_id: lot.lot_id,
          quantity: lot.quantity,
          serial_number: lot.lot_number // Store lot number for display
        })
    }
  }

  // Copy serial tracking
  if (tracking.serials?.length > 0) {
    for (const serial of tracking.serials) {
      await supabase
        .from('delivery_order_item_serials')
        .insert({
          delivery_order_item_id: doItem.id,
          serial_number: serial.serial_number,
          quantity: 1
        })
    }
  }
}
```

**Step 2: Commit**

```bash
git add app/actions/delivery-orders.ts
git commit -m "feat: copy serial/lot tracking from pick list to delivery order"
```

---

### Task 3.2: Display tracking on Delivery Order detail

**Files:**
- Create: `components/delivery-orders/DeliveryOrderItemTracking.tsx`
- Modify: `app/(dashboard)/tasks/delivery-orders/[id]/DeliveryOrderDetailClient.tsx`

**Step 1: Create display component**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit2, X } from 'lucide-react'

interface TrackingRecord {
  id: string
  serial_number: string
  lot_id?: string
  quantity: number
}

interface DeliveryOrderItemTrackingProps {
  deliveryOrderItemId: string
  itemName: string
  isEditable?: boolean
  sourcePickListId?: string
}

export function DeliveryOrderItemTracking({
  deliveryOrderItemId,
  itemName,
  isEditable = false,
  sourcePickListId
}: DeliveryOrderItemTrackingProps) {
  const [tracking, setTracking] = useState<TrackingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadTracking() {
      const { data } = await supabase
        .from('delivery_order_item_serials')
        .select('id, serial_number, lot_id, quantity')
        .eq('delivery_order_item_id', deliveryOrderItemId)

      setTracking(data || [])
      setIsLoading(false)
    }

    loadTracking()
  }, [deliveryOrderItemId, supabase])

  if (isLoading) {
    return <div className="text-sm text-neutral-500">Loading tracking...</div>
  }

  if (tracking.length === 0) {
    return <span className="text-neutral-400">—</span>
  }

  // Group by lot vs serial
  const lots = tracking.filter(t => t.lot_id)
  const serials = tracking.filter(t => !t.lot_id)

  return (
    <div className="space-y-1">
      {sourcePickListId && (
        <div className="text-xs text-neutral-500 mb-1">
          From Pick List
        </div>
      )}

      {/* Lot display */}
      {lots.map(lot => (
        <div key={lot.id} className="text-sm">
          <span className="font-mono">{lot.serial_number}</span>
          <span className="text-neutral-500 ml-1">({lot.quantity})</span>
        </div>
      ))}

      {/* Serial display */}
      {serials.length > 0 && (
        <div className="text-sm font-mono">
          {serials.map(s => s.serial_number).join(', ')}
        </div>
      )}

      {isEditable && (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          <Edit2 className="w-3 h-3 mr-1" />
          Edit
        </Button>
      )}
    </div>
  )
}
```

**Step 2: Add to DO detail page**

In DeliveryOrderDetailClient.tsx, add a "Tracking" column to the items table:

```tsx
import { DeliveryOrderItemTracking } from '@/components/delivery-orders/DeliveryOrderItemTracking'

// In the items table, add tracking column:
<th>Tracking</th>

// In each row:
<td>
  <DeliveryOrderItemTracking
    deliveryOrderItemId={item.id}
    itemName={item.item_name}
    isEditable={deliveryOrder.status === 'draft' || deliveryOrder.status === 'ready'}
    sourcePickListId={item.pick_list_item_id}
  />
</td>
```

**Step 3: Commit**

```bash
git add components/delivery-orders/DeliveryOrderItemTracking.tsx
git add app/(dashboard)/tasks/delivery-orders/[id]/DeliveryOrderDetailClient.tsx
git commit -m "feat(ui): display serial/lot tracking on delivery order"
```

---

## Phase 4: Inventory Updates on Dispatch

### Task 4.1: Update inventory when DO is dispatched

**Files:**
- Modify: `app/actions/delivery-orders.ts`

**Step 1: Add inventory update logic to dispatch action**

In the `updateDeliveryOrderStatus` function, when status changes to 'dispatched':

```tsx
// After updating status to 'dispatched', update inventory
if (newStatus === 'dispatched') {
  // Get all items with tracking
  const { data: items } = await supabase
    .from('delivery_order_items')
    .select(`
      id,
      item_id,
      quantity_shipped,
      delivery_order_item_serials (
        id,
        serial_number,
        lot_id,
        quantity
      )
    `)
    .eq('delivery_order_id', deliveryOrderId)

  for (const item of items || []) {
    const tracking = item.delivery_order_item_serials || []

    // Update serials to 'sold'
    const serialNumbers = tracking
      .filter(t => !t.lot_id)
      .map(t => t.serial_number)

    if (serialNumbers.length > 0) {
      await supabase.rpc('stock_out_serials', {
        p_item_id: item.item_id,
        p_serial_numbers: serialNumbers
      })
    }

    // Update lot quantities
    const lotUpdates = tracking.filter(t => t.lot_id)
    for (const lotUpdate of lotUpdates) {
      await supabase.rpc('stock_out_fifo', {
        p_item_id: item.item_id,
        p_quantity: lotUpdate.quantity,
        p_lot_id: lotUpdate.lot_id
      })
    }

    // For non-tracked items, decrease quantity directly
    if (tracking.length === 0 && item.quantity_shipped > 0) {
      await supabase
        .from('inventory_items')
        .update({
          quantity: supabase.sql`quantity - ${item.quantity_shipped}`
        })
        .eq('id', item.item_id)
    }
  }
}
```

**Step 2: Commit**

```bash
git add app/actions/delivery-orders.ts
git commit -m "feat: update inventory (serials/lots) when DO is dispatched"
```

---

## Phase 5: Testing

### Task 5.1: Write integration tests for tracking flow

**Files:**
- Create: `__tests__/integration/order-to-cash/tracking-flow.test.ts`

**Step 1: Write tests**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

describe('Serial/Lot Tracking Flow', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let testItemId: string
  let testLotId: string
  let testSerialId: string
  let testPickListId: string
  let testPickListItemId: string

  beforeAll(async () => {
    // Create test item with lot tracking
    const { data: item } = await supabase
      .from('inventory_items')
      .insert({
        name: 'Test Tracking Item',
        tenant_id: TEST_TENANT_ID,
        tracking_type: 'lot',
        quantity: 100
      })
      .select()
      .single()

    testItemId = item.id

    // Create test lot
    const { data: lot } = await supabase
      .from('lots')
      .insert({
        item_id: testItemId,
        lot_number: 'TEST-LOT-001',
        quantity: 50,
        tenant_id: TEST_TENANT_ID,
        status: 'active'
      })
      .select()
      .single()

    testLotId = lot.id
  })

  afterAll(async () => {
    // Cleanup
    await supabase.from('inventory_items').delete().eq('id', testItemId)
  })

  it('should allocate lots to pick list item', async () => {
    // Create pick list with item
    const { data: pickList } = await supabase
      .from('pick_lists')
      .insert({
        tenant_id: TEST_TENANT_ID,
        status: 'draft',
        name: 'Test Pick List'
      })
      .select()
      .single()

    testPickListId = pickList.id

    const { data: plItem } = await supabase
      .from('pick_list_items')
      .insert({
        pick_list_id: testPickListId,
        item_id: testItemId,
        requested_quantity: 25,
        tenant_id: TEST_TENANT_ID
      })
      .select()
      .single()

    testPickListItemId = plItem.id

    // Allocate lot
    const { data: result } = await supabase.rpc('allocate_pick_list_item_lots', {
      p_pick_list_item_id: testPickListItemId,
      p_allocations: [{ lot_id: testLotId, quantity: 25 }]
    })

    expect(result.success).toBe(true)
    expect(result.total_allocated).toBe(25)
  })

  it('should retrieve tracking allocations', async () => {
    const { data: tracking } = await supabase.rpc('get_pick_list_item_tracking', {
      p_pick_list_item_id: testPickListItemId
    })

    expect(tracking.lots).toHaveLength(1)
    expect(tracking.lots[0].lot_number).toBe('TEST-LOT-001')
    expect(tracking.lots[0].quantity).toBe(25)
  })

  it('should auto-allocate using FEFO', async () => {
    const { data: result } = await supabase.rpc('auto_allocate_lots_fefo', {
      p_pick_list_item_id: testPickListItemId
    })

    expect(result.success).toBe(true)
  })
})
```

**Step 2: Run tests**

```bash
npm run test __tests__/integration/order-to-cash/tracking-flow.test.ts
```

**Step 3: Commit**

```bash
git add __tests__/integration/order-to-cash/tracking-flow.test.ts
git commit -m "test: add integration tests for serial/lot tracking flow"
```

---

## Summary

| Phase | Tasks | Commits |
|-------|-------|---------|
| 1. Database | 1.1 Create tables, 1.2 Create RPCs | 2 |
| 2. Pick List UI | 2.1 Tracking component, 2.2 Integrate | 2 |
| 3. Delivery Order | 3.1 Copy tracking, 3.2 Display | 2 |
| 4. Inventory | 4.1 Update on dispatch | 1 |
| 5. Testing | 5.1 Integration tests | 1 |

**Total: 8 commits**

---

## Post-Implementation

- [ ] Update `docs/CHANGELOG.md` with feature summary
- [ ] Test full flow: SO → Pick List (assign) → DO (inherit) → Dispatch (inventory update)
- [ ] Verify PDF export includes tracking info
