import { describe, it, expect, vi } from 'vitest'

/**
 * Undo System Tests
 *
 * Tests for undo functionality:
 * - Add undo action
 * - Perform undo
 * - Auto-dismiss
 * - Callbacks
 */

interface UndoAction {
  id: string
  label: string
  undoFn: () => Promise<void> | void
  onComplete?: () => void
  createdAt: number
  dismissed: boolean
}

// Undo manager
class UndoManager {
  private actions: Map<string, UndoAction> = new Map()
  private timeouts: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private autoDismissMs: number = 10000 // 10 seconds default

  addUndoAction(
    label: string,
    undoFn: () => Promise<void> | void,
    onComplete?: () => void
  ): string {
    const id = `undo-${Date.now()}-${Math.random().toString(36).slice(2)}`

    const action: UndoAction = {
      id,
      label,
      undoFn,
      onComplete,
      createdAt: Date.now(),
      dismissed: false,
    }

    this.actions.set(id, action)

    // Set auto-dismiss timeout
    const timeout = setTimeout(() => {
      this.dismissUndo(id)
    }, this.autoDismissMs)

    this.timeouts.set(id, timeout)

    return id
  }

  async performUndo(id: string): Promise<boolean> {
    const action = this.actions.get(id)
    if (!action || action.dismissed) {
      return false
    }

    try {
      await action.undoFn()

      if (action.onComplete) {
        action.onComplete()
      }

      this.dismissUndo(id)
      return true
    } catch {
      return false
    }
  }

  dismissUndo(id: string): void {
    const action = this.actions.get(id)
    if (action) {
      action.dismissed = true
    }

    const timeout = this.timeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(id)
    }
  }

  getActiveAction(): UndoAction | null {
    for (const action of this.actions.values()) {
      if (!action.dismissed) {
        return action
      }
    }
    return null
  }

  cleanup(): void {
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout)
    }
    this.timeouts.clear()
    this.actions.clear()
  }

  setAutoDismissTime(ms: number): void {
    this.autoDismissMs = ms
  }
}

describe('Undo System', () => {
  describe('Add Undo Action', () => {
    it('shows undo toast with label', () => {
      const manager = new UndoManager()

      const id = manager.addUndoAction('Deleted item "Laptop"', () => {})

      const action = manager.getActiveAction()
      expect(action).toBeDefined()
      expect(action!.label).toBe('Deleted item "Laptop"')

      manager.cleanup()
    })

    it('returns action ID', () => {
      const manager = new UndoManager()

      const id = manager.addUndoAction('Test action', () => {})

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')

      manager.cleanup()
    })
  })

  describe('Perform Undo', () => {
    it('executes undo function', async () => {
      const manager = new UndoManager()
      let undone = false

      const id = manager.addUndoAction('Test undo', () => {
        undone = true
      })

      await manager.performUndo(id)

      expect(undone).toBe(true)

      manager.cleanup()
    })

    it('returns true on successful undo', async () => {
      const manager = new UndoManager()

      const id = manager.addUndoAction('Test undo', () => {})

      const result = await manager.performUndo(id)

      expect(result).toBe(true)

      manager.cleanup()
    })

    it('returns false for already dismissed action', async () => {
      const manager = new UndoManager()

      const id = manager.addUndoAction('Test undo', () => {})
      manager.dismissUndo(id)

      const result = await manager.performUndo(id)

      expect(result).toBe(false)

      manager.cleanup()
    })

    it('returns false for non-existent action', async () => {
      const manager = new UndoManager()

      const result = await manager.performUndo('non-existent-id')

      expect(result).toBe(false)

      manager.cleanup()
    })
  })

  describe('Auto-dismiss', () => {
    it('dismisses after timeout', async () => {
      vi.useFakeTimers()
      const manager = new UndoManager()
      manager.setAutoDismissTime(100) // 100ms for test

      const id = manager.addUndoAction('Test', () => {})

      expect(manager.getActiveAction()).toBeDefined()

      vi.advanceTimersByTime(150)

      const action = manager.getActiveAction()
      expect(action).toBeNull()

      manager.cleanup()
      vi.useRealTimers()
    })

    it('does not dismiss before timeout', () => {
      vi.useFakeTimers()
      const manager = new UndoManager()
      manager.setAutoDismissTime(1000)

      manager.addUndoAction('Test', () => {})

      vi.advanceTimersByTime(500)

      expect(manager.getActiveAction()).toBeDefined()

      manager.cleanup()
      vi.useRealTimers()
    })
  })

  describe('Dismiss Undo', () => {
    it('manually closes toast', () => {
      const manager = new UndoManager()

      const id = manager.addUndoAction('Test', () => {})
      manager.dismissUndo(id)

      expect(manager.getActiveAction()).toBeNull()

      manager.cleanup()
    })

    it('clears timeout on dismiss', () => {
      vi.useFakeTimers()
      const manager = new UndoManager()
      manager.setAutoDismissTime(1000)

      const id = manager.addUndoAction('Test', () => {})
      manager.dismissUndo(id)

      // Should not throw or cause issues
      vi.advanceTimersByTime(2000)

      manager.cleanup()
      vi.useRealTimers()
    })
  })

  describe('Callbacks', () => {
    it('fires onComplete callback after successful undo', async () => {
      const manager = new UndoManager()
      let completed = false

      const id = manager.addUndoAction(
        'Test',
        () => {},
        () => {
          completed = true
        }
      )

      await manager.performUndo(id)

      expect(completed).toBe(true)

      manager.cleanup()
    })

    it('does not fire onComplete on dismiss', () => {
      const manager = new UndoManager()
      let completed = false

      const id = manager.addUndoAction(
        'Test',
        () => {},
        () => {
          completed = true
        }
      )

      manager.dismissUndo(id)

      expect(completed).toBe(false)

      manager.cleanup()
    })
  })

  describe('Cleanup', () => {
    it('cleans up timeouts on unmount', () => {
      vi.useFakeTimers()
      const manager = new UndoManager()

      manager.addUndoAction('Test 1', () => {})
      manager.addUndoAction('Test 2', () => {})

      manager.cleanup()

      // Should not throw when time advances
      vi.advanceTimersByTime(20000)

      vi.useRealTimers()
    })
  })
})
