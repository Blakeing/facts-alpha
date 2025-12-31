/**
 * Items Handler - Manages sale items within a contract session
 *
 * Provides reactive state for sale items with computed totals.
 * Part of the contract session - receives shared context via parameter.
 *
 * Note: In the new structure, items belong to Sales, not directly to Contracts.
 * This handler works with items from the primary Sale.
 *
 * @see docs/data-models.md for SaleItem structure
 */

import type { SaleItem } from '../contract'
import type { ContractSession } from '../useContractSession'
import { computed, ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { NeedType } from '../contract'
import { createBaseHandler } from './createBaseHandler'

export interface ItemsHandlerState {
  items: SaleItem[]
  isDirty: boolean
}

function createEmptySaleItem(saleId: string, needType: NeedType, ordinal: number): SaleItem {
  const now = new Date().toISOString()
  return {
    id: '0',
    saleId,
    itemId: '',
    description: '',
    needType,
    quantity: 1,
    unitPrice: 0,
    bookPrice: 0,
    cost: 0,
    bookCost: 0,
    salesTaxEnabled: true,
    isCancelled: false,
    ordinal,
    salesTax: [],
    discounts: [],
    trust: [],
    dateCreated: now,
    dateLastModified: now,
  }
}

export function useItemsHandler(session: ContractSession) {
  const catalog = useCatalogStore()

  // ==========================================================================
  // Base Handler - Common state and operations
  // ==========================================================================

  const base = createBaseHandler<SaleItem>({ session })

  // ==========================================================================
  // Additional State
  // ==========================================================================

  const currentSaleId = ref<string>('')
  const currentNeedType = ref<NeedType>(NeedType.AT_NEED)

  // ==========================================================================
  // Computed Totals - Reactive, no events needed!
  // ==========================================================================

  const activeItems = computed(() => base.items.value.filter((item) => !item.isCancelled))

  const subtotal = computed(() =>
    activeItems.value.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  )

  const taxTotal = computed(() =>
    activeItems.value.reduce(
      (sum, item) => sum + (item.salesTax?.reduce((t, tax) => t + tax.taxAmount, 0) ?? 0),
      0,
    ),
  )

  const discountTotal = computed(() =>
    activeItems.value.reduce(
      (sum, item) => sum + (item.discounts?.reduce((d, disc) => d + disc.amount, 0) ?? 0),
      0,
    ),
  )

  const itemCount = computed(() => activeItems.value.length)

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Add an item from the catalog
   */
  function addItem(catalogItemId: string): SaleItem | null {
    if (!base.guardEdit()) return null

    const catalogItem = catalog.getItemById(catalogItemId)
    if (!catalogItem) return null

    const now = new Date().toISOString()
    const taxRate = catalog.getTaxRateForCategory(catalogItem.categoryId)
    const taxAmount = catalogItem.price * taxRate

    // Use temp saleId for new items so they get saved (real saleId means already saved)
    // If currentSaleId is a real ID (not temp), use 'temp-sale-id' for new items
    const tempSaleId =
      currentSaleId.value && currentSaleId.value !== 'temp-sale-id' && currentSaleId.value !== ''
        ? 'temp-sale-id'
        : currentSaleId.value || 'temp-sale-id'

    const newItem: SaleItem = {
      id: '0',
      saleId: tempSaleId,
      itemId: catalogItemId,
      description: catalogItem.description,
      needType: currentNeedType.value,
      quantity: 1,
      unitPrice: catalogItem.price,
      bookPrice: catalogItem.price,
      cost: catalogItem.cost ?? 0,
      bookCost: catalogItem.cost ?? 0,
      salesTaxEnabled: true,
      isCancelled: false,
      ordinal: base._items.value.length,
      sku: catalogItem.sku,
      itemDescription: catalogItem.description,
      itemType: catalogItem.category,
      salesTax:
        taxRate > 0
          ? [
              {
                id: '0',
                saleItemId: '',
                taxProfileItemId: 'default-tax',
                taxRate: taxRate * 100,
                taxAmount,
              },
            ]
          : [],
      discounts: [],
      trust: [],
      dateCreated: now,
      dateLastModified: now,
    }

    base.addItem(newItem)
    return newItem
  }

  /**
   * Add a custom item (not from catalog)
   */
  function addCustomItem(
    data: Partial<Omit<SaleItem, 'id' | 'saleId' | 'dateCreated' | 'dateLastModified'>>,
  ): SaleItem | null {
    if (!base.guardEdit()) return null

    // Use temp saleId for new items so they get saved (real saleId means already saved)
    // If currentSaleId is a real ID (not temp), use 'temp-sale-id' for new items
    const tempSaleId =
      currentSaleId.value && currentSaleId.value !== 'temp-sale-id' && currentSaleId.value !== ''
        ? 'temp-sale-id'
        : currentSaleId.value || 'temp-sale-id'

    const now = new Date().toISOString()
    const baseItem = createEmptySaleItem(tempSaleId, currentNeedType.value, base._items.value.length)

    const newItem: SaleItem = {
      ...baseItem,
      ...data,
      dateCreated: now,
      dateLastModified: now,
    }

    base.addItem(newItem)
    return newItem
  }

  /**
   * Remove an item by ID (marks as cancelled rather than delete)
   */
  function removeItem(itemId: string): boolean {
    if (!base.guardEdit()) return false

    const item = base.findById(itemId)
    if (!item) return false

    item.isCancelled = true
    item.dateLastModified = new Date().toISOString()
    base._isDirty.value = true
    return true
  }

  /**
   * Hard delete an item (for items not yet saved)
   */
  function deleteItem(itemId: string): boolean {
    return base.removeById(itemId)
  }

  /**
   * Get an item by ID
   */
  function getItem(itemId: string): SaleItem | undefined {
    return base.findById(itemId)
  }

  /**
   * Apply an updated item to canonical state
   * Finds the item by ID and replaces it, recalculating tax if needed
   */
  function applyItemUpdate(item: SaleItem): boolean {
    if (!base.guardEdit()) return false

    // Recalculate tax if price or quantity changed
    recalculateItemTax(item)

    return base.applyUpdate(item)
  }

  /**
   * Add a discount to an item
   */
  function addItemDiscount(itemId: string, description: string, amount: number): boolean {
    if (!base.guardEdit()) return false

    const item = base.findById(itemId)
    if (!item) return false

    // Ensure discounts array exists
    if (!item.discounts) {
      item.discounts = []
    }

    item.discounts.push({
      id: '0',
      saleItemId: itemId,
      description,
      amount,
    })
    item.dateLastModified = new Date().toISOString()
    base._isDirty.value = true
    return true
  }

  /**
   * Remove a discount from an item
   */
  function removeItemDiscount(itemId: string, discountId: string): boolean {
    if (!base.guardEdit()) return false

    const item = base.findById(itemId)
    if (!item || !item.discounts) return false

    const index = item.discounts.findIndex((d) => d.id === discountId)
    if (index === -1) return false

    item.discounts.splice(index, 1)
    item.dateLastModified = new Date().toISOString()
    base._isDirty.value = true
    return true
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  /**
   * Recalculate item tax
   */
  function recalculateItemTax(item: SaleItem) {
    if (!item.salesTaxEnabled || !item.salesTax || item.salesTax.length === 0) return

    const baseAmount = item.quantity * item.unitPrice
    for (const tax of item.salesTax) {
      tax.taxAmount = baseAmount * (tax.taxRate / 100)
    }
  }

  /**
   * Recalculate all items (e.g., when tax rates change)
   */
  function recalculateAll() {
    for (const item of base._items.value) {
      recalculateItemTax(item)
    }
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply items from server data
   * 
   * IMPORTANT: Deep clone server data to create mutable copies.
   * Vue Query returns readonly reactive proxies that cannot be mutated directly.
   */
  function applyFromServer(serverItems: SaleItem[]) {
    // Process items to ensure arrays are initialized
    const processedItems = serverItems.map((item) => ({
      ...item,
      salesTax: item.salesTax ?? [],
      discounts: item.discounts ?? [],
      trust: item.trust ?? [],
    }))
    base.applyFromServer(processedItems)
  }

  /**
   * Set the current sale context
   */
  function setSaleContext(saleId: string, needType: NeedType) {
    currentSaleId.value = saleId
    currentNeedType.value = needType
  }

  /**
   * Get current items for saving
   */
  function getItems(): SaleItem[] {
    return base.getAll()
  }

  /**
   * Mark items as clean (after save)
   */
  function markClean() {
    base.markClean()
  }

  /**
   * Reset to empty state
   */
  function reset() {
    base.reset()
    currentSaleId.value = ''
    currentNeedType.value = NeedType.AT_NEED
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (from base handler)
    items: base.items,
    activeItems,
    isDirty: base.isDirty,

    // Computed totals
    subtotal,
    taxTotal,
    discountTotal,
    itemCount,

    // Actions
    addItem,
    addCustomItem,
    removeItem,
    deleteItem,
    addItemDiscount,
    removeItemDiscount,
    getItem,
    applyItemUpdate,
    recalculateAll,

    // Session lifecycle
    applyFromServer,
    setSaleContext,
    getItems,
    markClean,
    reset,
  }
}

export type ItemsHandler = ReturnType<typeof useItemsHandler>
