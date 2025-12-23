/**
 * Items Handler - Manages contract items within a session
 *
 * Provides reactive state for contract items with computed totals.
 * Part of the contract session - receives shared context via parameter.
 */

import type { ContractItem } from '../contract'
import type { ContractSessionContext } from '../contractSessionContext'
import { computed, ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'

export interface ItemsHandlerState {
  items: ContractItem[]
  isDirty: boolean
}

export function useItemsHandler(context: ContractSessionContext) {
  const catalog = useCatalogStore()

  // ==========================================================================
  // State
  // ==========================================================================

  const items = ref<ContractItem[]>([])
  const isDirty = ref(false)

  // ==========================================================================
  // Computed Totals - Reactive, no events needed!
  // ==========================================================================

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  )

  const taxTotal = computed(() => items.value.reduce((sum, item) => sum + item.tax, 0))

  const discountTotal = computed(() => items.value.reduce((sum, item) => sum + item.discount, 0))

  const itemCount = computed(() => items.value.length)

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Add an item from the catalog
   */
  function addItem(catalogItemId: string): ContractItem | null {
    if (!context.isEditable.value) return null

    const catalogItem = catalog.getItemById(catalogItemId)
    if (!catalogItem) return null

    const taxRate = catalog.getTaxRateForCategory(catalogItem.categoryId)
    const baseAmount = catalogItem.price
    const tax = baseAmount * taxRate

    const newItem: ContractItem = {
      id: crypto.randomUUID(),
      contractId: context.contractId.value,
      itemNumber: catalogItem.sku,
      description: catalogItem.description,
      category: catalogItem.category,
      quantity: 1,
      unitPrice: catalogItem.price,
      discount: 0,
      tax,
      total: baseAmount + tax,
    }

    items.value.push(newItem)
    isDirty.value = true
    return newItem
  }

  /**
   * Add a custom item (not from catalog)
   */
  function addCustomItem(
    data: Omit<ContractItem, 'id' | 'contractId' | 'tax' | 'total'>,
  ): ContractItem | null {
    if (!context.isEditable.value) return null

    const taxRate = catalog.getTaxRateForCategory(`cat-${data.category}`)
    const baseAmount = data.quantity * data.unitPrice - data.discount
    const tax = baseAmount * taxRate

    const newItem: ContractItem = {
      id: crypto.randomUUID(),
      contractId: context.contractId.value,
      ...data,
      tax,
      total: baseAmount + tax,
    }

    items.value.push(newItem)
    isDirty.value = true
    return newItem
  }

  /**
   * Remove an item by ID
   */
  function removeItem(itemId: string): boolean {
    if (!context.isEditable.value) return false

    const index = items.value.findIndex((i) => i.id === itemId)
    if (index === -1) return false

    items.value.splice(index, 1)
    isDirty.value = true
    return true
  }

  /**
   * Update item quantity
   */
  function updateItemQuantity(itemId: string, quantity: number): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    item.quantity = quantity
    recalculateItem(item)
    isDirty.value = true
    return true
  }

  /**
   * Update item unit price
   */
  function updateItemPrice(itemId: string, unitPrice: number): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    item.unitPrice = unitPrice
    recalculateItem(item)
    isDirty.value = true
    return true
  }

  /**
   * Update item discount
   */
  function updateItemDiscount(itemId: string, discount: number): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    item.discount = discount
    recalculateItem(item)
    isDirty.value = true
    return true
  }

  /**
   * Update item description
   */
  function updateItemDescription(itemId: string, description: string): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    item.description = description
    isDirty.value = true
    return true
  }

  /**
   * Update item notes
   */
  function updateItemNotes(itemId: string, notes: string): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    item.notes = notes
    isDirty.value = true
    return true
  }

  /**
   * Get an item by ID
   */
  function getItem(itemId: string): ContractItem | undefined {
    return items.value.find((i) => i.id === itemId)
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  /**
   * Recalculate item tax and total
   */
  function recalculateItem(item: ContractItem) {
    const taxRate = catalog.getTaxRateForCategory(`cat-${item.category}`)
    const baseAmount = item.quantity * item.unitPrice - item.discount
    item.tax = baseAmount * taxRate
    item.total = baseAmount + item.tax
  }

  /**
   * Recalculate all items (e.g., when tax rates change)
   */
  function recalculateAll() {
    for (const item of items.value) {
      recalculateItem(item)
    }
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply items from server data
   */
  function applyFromServer(serverItems: ContractItem[]) {
    items.value = serverItems.map((item) => ({ ...item }))
    isDirty.value = false
  }

  /**
   * Get current items for saving
   */
  function getItems(): ContractItem[] {
    return items.value.map((item) => ({ ...item }))
  }

  /**
   * Mark items as clean (after save)
   */
  function markClean() {
    isDirty.value = false
  }

  /**
   * Reset to empty state
   */
  function reset() {
    items.value = []
    isDirty.value = false
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (as computed for reactivity)
    items: computed(() => items.value),
    isDirty: computed(() => isDirty.value),

    // Computed totals
    subtotal,
    taxTotal,
    discountTotal,
    itemCount,

    // Actions
    addItem,
    addCustomItem,
    removeItem,
    updateItemQuantity,
    updateItemPrice,
    updateItemDiscount,
    updateItemDescription,
    updateItemNotes,
    getItem,
    recalculateAll,

    // Session lifecycle
    applyFromServer,
    getItems,
    markClean,
    reset,
  }
}

export type ItemsHandler = ReturnType<typeof useItemsHandler>
