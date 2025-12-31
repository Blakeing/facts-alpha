/**
 * Base Handler Factory - Common patterns for contract session handlers
 *
 * Provides reusable state management and operations for handlers that manage
 * arrays of entities (items, payments, etc.). This reduces duplication and
 * ensures consistent behavior across handlers.
 *
 * Pattern matches legacy BaseHandler class but uses Vue Composition API.
 */

import type { ComputedRef, Ref } from 'vue'
import type { ContractSession } from '../useContractSession'
import { computed, ref } from 'vue'
import { deepCopy } from '@/shared/lib/utilities/clone'

export interface BaseHandlerOptions {
  session: ContractSession
}

export interface BaseHandlerReturn<T> {
  // State (as computed for reactivity)
  items: ComputedRef<T[]>
  isDirty: ComputedRef<boolean>

  // Internal state access (for extensions)
  _items: Ref<T[]>
  _isDirty: Ref<boolean>

  // Common operations
  guardEdit: () => boolean
  applyFromServer: (data: T[]) => void
  findById: (id: string) => T | undefined
  applyUpdate: (item: T) => boolean
  addItem: (item: T) => void
  removeById: (id: string) => boolean
  markClean: () => void
  reset: () => void
  getAll: () => T[]
}

/**
 * Creates a base handler with common state management and operations
 *
 * @template T - Entity type that must have an `id` field and optionally `dateLastModified`
 */
export function createBaseHandler<T extends { id: string; dateLastModified?: string }>(
  options: BaseHandlerOptions,
): BaseHandlerReturn<T> {
  // ==========================================================================
  // State
  // ==========================================================================

  const items = ref<T[]>([]) as Ref<T[]>
  const isDirty = ref(false)

  // ==========================================================================
  // Edit Guard - Reusable check
  // ==========================================================================

  /**
   * Check if editing is allowed (session is editable)
   */
  function guardEdit(): boolean {
    return options.session.isEditable.value
  }

  // ==========================================================================
  // Common Operations
  // ==========================================================================

  /**
   * Apply data from server (deep clone to make mutable)
   *
   * IMPORTANT: Deep clone server data to create mutable copies.
   * Vue Query returns readonly reactive proxies that cannot be mutated directly.
   */
  function applyFromServer(data: T[]): void {
    items.value = deepCopy(data)
    isDirty.value = false
  }

  /**
   * Find an item by ID
   */
  function findById(id: string): T | undefined {
    return items.value.find((item) => item.id === id)
  }

  /**
   * Apply an updated item to canonical state
   * Finds the item by ID and replaces it, updating timestamp
   */
  function applyUpdate(item: T): boolean {
    if (!guardEdit()) return false

    const now = new Date().toISOString()
    if ('dateLastModified' in item) {
      ;(item as T & { dateLastModified: string }).dateLastModified = now
    }

    const index = items.value.findIndex((i) => i.id === item.id)
    if (index !== -1) {
      items.value[index] = item
      isDirty.value = true
      return true
    }

    return false
  }

  /**
   * Add an item to the collection
   */
  function addItem(item: T): void {
    if (!guardEdit()) return

    items.value.push(item)
    isDirty.value = true
  }

  /**
   * Remove an item by ID
   */
  function removeById(id: string): boolean {
    if (!guardEdit()) return false

    const index = items.value.findIndex((i) => i.id === id)
    if (index === -1) return false

    items.value.splice(index, 1)
    isDirty.value = true
    return true
  }

  /**
   * Mark handler as clean (after save)
   */
  function markClean(): void {
    isDirty.value = false
  }

  /**
   * Reset to empty state
   */
  function reset(): void {
    items.value = []
    isDirty.value = false
  }

  /**
   * Get all items (shallow copy for safety)
   */
  function getAll(): T[] {
    return items.value.map((item) => ({ ...item }))
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (as computed for reactivity)
    items: computed(() => items.value),
    isDirty: computed(() => isDirty.value),

    // Internal state access (for extensions)
    _items: items,
    _isDirty: isDirty,

    // Common operations
    guardEdit,
    applyFromServer,
    findById,
    applyUpdate,
    addItem,
    removeById,
    markClean,
    reset,
    getAll,
  }
}
