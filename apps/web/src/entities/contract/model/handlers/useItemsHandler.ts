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
import type { ContractSessionContext } from '../contractSessionContext'
import { computed, ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { NeedType } from '../contract'

export interface ItemsHandlerState {
  items: SaleItem[]
  isDirty: boolean
}

function createEmptySaleItem(saleId: string, needType: NeedType, ordinal: number): SaleItem {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
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
    createdAt: now,
    updatedAt: now,
  }
}

export function useItemsHandler(context: ContractSessionContext) {
  const catalog = useCatalogStore()

  // ==========================================================================
  // State
  // ==========================================================================

  const items = ref<SaleItem[]>([])
  const isDirty = ref(false)
  const currentSaleId = ref<string>('')
  const currentNeedType = ref<NeedType>(NeedType.AT_NEED)

  // Track original item IDs from server to distinguish new vs modified
  const originalItemIds = ref<Set<string>>(new Set())

  // ==========================================================================
  // Computed Totals - Reactive, no events needed!
  // ==========================================================================

  const activeItems = computed(() => items.value.filter((item) => !item.isCancelled))

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
    if (!context.isEditable.value) return null

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
      id: crypto.randomUUID(),
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
      ordinal: items.value.length,
      sku: catalogItem.sku,
      itemDescription: catalogItem.description,
      itemType: catalogItem.category as 'service' | 'merchandise' | 'cash_advance' | 'property',
      salesTax:
        taxRate > 0
          ? [
              {
                id: crypto.randomUUID(),
                saleItemId: '',
                taxProfileItemId: 'default-tax',
                taxRate: taxRate * 100,
                taxAmount,
              },
            ]
          : [],
      discounts: [],
      trust: [],
      createdAt: now,
      updatedAt: now,
    }

    items.value.push(newItem)
    isDirty.value = true
    return newItem
  }

  /**
   * Add a custom item (not from catalog)
   */
  function addCustomItem(
    data: Partial<Omit<SaleItem, 'id' | 'saleId' | 'createdAt' | 'updatedAt'>>,
  ): SaleItem | null {
    if (!context.isEditable.value) return null

    // Use temp saleId for new items so they get saved (real saleId means already saved)
    // If currentSaleId is a real ID (not temp), use 'temp-sale-id' for new items
    const tempSaleId =
      currentSaleId.value && currentSaleId.value !== 'temp-sale-id' && currentSaleId.value !== ''
        ? 'temp-sale-id'
        : currentSaleId.value || 'temp-sale-id'

    const now = new Date().toISOString()
    const baseItem = createEmptySaleItem(tempSaleId, currentNeedType.value, items.value.length)

    const newItem: SaleItem = {
      ...baseItem,
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    items.value.push(newItem)
    isDirty.value = true
    return newItem
  }

  /**
   * Remove an item by ID (marks as cancelled rather than delete)
   */
  function removeItem(itemId: string): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    item.isCancelled = true
    item.updatedAt = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Hard delete an item (for items not yet saved)
   */
  function deleteItem(itemId: string): boolean {
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
    recalculateItemTax(item)
    item.updatedAt = new Date().toISOString()
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
    recalculateItemTax(item)
    item.updatedAt = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Add a discount to an item
   */
  function addItemDiscount(itemId: string, description: string, amount: number): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    // Ensure discounts array exists
    if (!item.discounts) {
      item.discounts = []
    }

    item.discounts.push({
      id: crypto.randomUUID(),
      saleItemId: itemId,
      description,
      amount,
    })
    item.updatedAt = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Remove a discount from an item
   */
  function removeItemDiscount(itemId: string, discountId: string): boolean {
    if (!context.isEditable.value) return false

    const item = items.value.find((i) => i.id === itemId)
    if (!item || !item.discounts) return false

    const index = item.discounts.findIndex((d) => d.id === discountId)
    if (index === -1) return false

    item.discounts.splice(index, 1)
    item.updatedAt = new Date().toISOString()
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
    item.updatedAt = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Get an item by ID
   */
  function getItem(itemId: string): SaleItem | undefined {
    return items.value.find((i) => i.id === itemId)
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
    for (const item of items.value) {
      recalculateItemTax(item)
    }
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply items from server data
   */
  function applyFromServer(serverItems: SaleItem[]) {
    items.value = serverItems.map((item) => ({
      ...item,
      // Ensure arrays are initialized if missing from server data
      salesTax: item.salesTax ?? [],
      discounts: item.discounts ?? [],
      trust: item.trust ?? [],
    }))
    // Track original IDs to identify new vs modified items on save
    originalItemIds.value = new Set(serverItems.map((item) => item.id))
    isDirty.value = false
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
    return items.value.map((item) => ({ ...item }))
  }

  /**
   * Get new items (added in UI, not yet saved to server)
   */
  function getNewItems(): SaleItem[] {
    return items.value.filter((item) => !originalItemIds.value.has(item.id))
  }

  /**
   * Get modified items (existed on server, modified in UI)
   */
  function getModifiedItems(): SaleItem[] {
    return items.value.filter((item) => originalItemIds.value.has(item.id))
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
    currentSaleId.value = ''
    currentNeedType.value = NeedType.AT_NEED
    originalItemIds.value = new Set()
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (as computed for reactivity)
    items: computed(() => items.value),
    activeItems,
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
    deleteItem,
    updateItemQuantity,
    updateItemPrice,
    addItemDiscount,
    removeItemDiscount,
    updateItemDescription,
    getItem,
    recalculateAll,

    // Session lifecycle
    applyFromServer,
    setSaleContext,
    getItems,
    getNewItems,
    getModifiedItems,
    markClean,
    reset,
  }
}

export type ItemsHandler = ReturnType<typeof useItemsHandler>
