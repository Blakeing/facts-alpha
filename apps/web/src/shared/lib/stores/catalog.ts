/**
 * Catalog Store - Global state for item catalog and tax rates
 *
 * This Pinia store provides shared lookup data that's used across
 * editing sessions (items, categories, tax rates by location).
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ItemType } from '@/entities/contract'

export interface CatalogItem {
  id: string
  sku: string
  description: string
  category: ItemType
  categoryId: string
  price: number
  cost: number
  isActive: boolean
}

export interface TaxRate {
  id: string
  categoryId: string
  locationId: string
  rate: number
  description: string
}

export const useCatalogStore = defineStore('catalog', () => {
  // State
  const items = ref<CatalogItem[]>([])
  const taxRates = ref<TaxRate[]>([])
  const currentLocationId = ref<string | null>(null)
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeItems = computed(() => items.value.filter((i) => i.isActive))

  const itemsByCategory = computed(() => {
    const grouped: Record<string, CatalogItem[]> = {}
    for (const item of activeItems.value) {
      const category = item.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category]!.push(item)
    }
    return grouped
  })

  // Actions
  async function loadForLocation(locationId: string) {
    // Skip if already loaded for this location
    if (currentLocationId.value === locationId && isLoaded.value) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // TODO: Implement actual API calls to BFF
      // const [itemsData, taxData] = await Promise.all([
      //   catalogApi.getItems(locationId),
      //   catalogApi.getTaxRates(locationId),
      // ])
      // items.value = itemsData
      // taxRates.value = taxData

      // Temporary: Using mock data until catalog API is implemented
      items.value = getMockCatalogItems()
      taxRates.value = getMockTaxRates(locationId)

      currentLocationId.value = locationId
      isLoaded.value = true
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Failed to load catalog'
      throw error_
    } finally {
      isLoading.value = false
    }
  }

  function getItemById(id: string): CatalogItem | undefined {
    return items.value.find((i) => i.id === id)
  }

  function getItemBySku(sku: string): CatalogItem | undefined {
    return items.value.find((i) => i.sku === sku)
  }

  function getTaxRateForCategory(categoryId: string): number {
    const rate = taxRates.value.find((r) => r.categoryId === categoryId)
    return rate?.rate ?? 0
  }

  function reset() {
    items.value = []
    taxRates.value = []
    currentLocationId.value = null
    isLoaded.value = false
    error.value = null
  }

  return {
    // State
    items,
    taxRates,
    currentLocationId,
    isLoading,
    isLoaded,
    error,

    // Computed
    activeItems,
    itemsByCategory,

    // Actions
    loadForLocation,
    getItemById,
    getItemBySku,
    getTaxRateForCategory,
    reset,
  }
})

// =============================================================================
// Temporary Mock Data (TODO: Replace with BFF API calls)
// =============================================================================

function getMockCatalogItems(): CatalogItem[] {
  return [
    {
      id: 'item-1',
      sku: 'SVC-001',
      description: 'Professional Services',
      category: ItemType.SERVICE,
      categoryId: 'cat-service',
      price: 2500,
      cost: 0,
      isActive: true,
    },
    {
      id: 'item-2',
      sku: 'SVC-002',
      description: 'Embalming',
      category: ItemType.SERVICE,
      categoryId: 'cat-service',
      price: 895,
      cost: 0,
      isActive: true,
    },
    {
      id: 'item-3',
      sku: 'MER-001',
      description: 'Standard Casket - Oak',
      category: ItemType.MERCHANDISE,
      categoryId: 'cat-merchandise',
      price: 3500,
      cost: 1200,
      isActive: true,
    },
    {
      id: 'item-4',
      sku: 'MER-002',
      description: 'Premium Casket - Mahogany',
      category: ItemType.MERCHANDISE,
      categoryId: 'cat-merchandise',
      price: 5500,
      cost: 2000,
      isActive: true,
    },
    {
      id: 'item-5',
      sku: 'CA-001',
      description: 'Death Certificates (each)',
      category: ItemType.CASH_ADVANCE,
      categoryId: 'cat-cash-advance',
      price: 25,
      cost: 25,
      isActive: true,
    },
    {
      id: 'item-6',
      sku: 'CA-002',
      description: 'Clergy Honorarium',
      category: ItemType.CASH_ADVANCE,
      categoryId: 'cat-cash-advance',
      price: 200,
      cost: 200,
      isActive: true,
    },
  ]
}

function getMockTaxRates(locationId: string): TaxRate[] {
  // Tax rates vary by location and category
  const baseRate = locationId.includes('IL') ? 0.0625 : 0.07

  return [
    {
      id: 'tax-1',
      categoryId: 'cat-service',
      locationId,
      rate: 0, // Services typically not taxed
      description: 'Services Tax',
    },
    {
      id: 'tax-2',
      categoryId: 'cat-merchandise',
      locationId,
      rate: baseRate, // Merchandise is taxed
      description: 'Merchandise Tax',
    },
    {
      id: 'tax-3',
      categoryId: 'cat-cash-advance',
      locationId,
      rate: 0, // Cash advances not taxed (pass-through)
      description: 'Cash Advance Tax',
    },
  ]
}
