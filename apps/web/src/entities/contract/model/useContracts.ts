/**
 * useContracts - List composable for contracts with Effect-based error handling
 *
 * Contracts are filtered by the current location from the user context store.
 *
 * @see docs/data-models.md for Contract structure
 */

import type { ContractListing, NeedType } from './contract'
import { errorMessage, handleError, runEffectQuery } from '@facts/effect'

import { useQuery } from '@tanstack/vue-query'

import { computed, ref } from 'vue'

import { useUserContextStore } from '@/shared/lib'
import { ContractApi } from '../api'

export const CONTRACTS_QUERY_KEY = ['contracts'] as const

/** Status string values from BFF */
export type ContractStatusString = 'Draft' | 'Executed' | 'Finalized' | 'Void' | 'Cancelled'

export interface DateRange {
  from?: string
  to?: string
}

export function useContracts() {
  const userContext = useUserContextStore()

  const search = ref('')
  const statusFilter = ref<ContractStatusString | null>(null)
  const needTypeFilter = ref<NeedType | null>(null)
  const dateRange = ref<DateRange | null>(null)

  // Query key includes locationId, needType, and dateRange for cache separation
  const queryKey = computed(
    () =>
      [
        'contracts',
        userContext.currentLocationId,
        needTypeFilter.value,
        dateRange.value?.from,
        dateRange.value?.to,
      ] as const,
  )

  const query = useQuery<ContractListing[], Error>({
    queryKey,
    queryFn: () => {
      const locationId = userContext.currentLocationId
      if (!locationId) {
        return Promise.resolve([])
      }
      return runEffectQuery(
        ContractApi.list(locationId, {
          fromDate: dateRange.value?.from,
          toDate: dateRange.value?.to,
          needType: needTypeFilter.value ?? undefined,
        }),
      )()
    },
    enabled: computed(() => !!userContext.currentLocationId),
  })

  const contracts = computed<ContractListing[]>(() => query.data.value ?? [])

  // Typed error handling
  const errorMsg = computed(() => {
    if (!query.error.value) return null
    return handleError(query.error.value, {
      NetworkError: (e) => `Network error: ${e.message}`,
      UnauthorizedError: () => 'Please log in to view contracts',
      default: errorMessage,
    })
  })

  // BFF already filters by locationId, so contracts are already location-filtered
  const locationFilteredContracts = computed<ContractListing[]>(() => contracts.value)

  /**
   * Normalize text by removing diacritics/accents (matches legacy normalizeText)
   * Example: "José" -> "Jose"
   */
  function normalizeText(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036F]/g, '')
  }

  // Filter by search term (matches legacy ContractList.vue search logic)
  const searchedContracts = computed<ContractListing[]>(() => {
    if (!search.value) return locationFilteredContracts.value

    const s = search.value.toLowerCase()
    const normalizedSearch = normalizeText(s)

    return locationFilteredContracts.value.filter((c: ContractListing) => {
      // Normalized purchaser match (legacy uses normalizeText for purchaser)
      const purchaser = c.purchaser?.toLowerCase() || ''
      if (normalizeText(purchaser).includes(normalizedSearch)) return true

      // Direct string matches
      if (c.contractNumber?.toLowerCase().includes(s)) return true
      if (c.prePrintedContractNumber?.toLowerCase().includes(s)) return true
      if (c.purchaser?.toLowerCase().includes(s)) return true
      if (c.beneficiary?.toLowerCase().includes(s)) return true
      if (c.status?.toLowerCase().includes(s)) return true
      if (c.salesPerson?.toLowerCase().includes(s)) return true

      // Co-buyers array search
      if (c.cobuyers?.some((b: string) => b.toLowerCase().includes(s))) return true

      // Date searches (formatted as MM/DD/YYYY)
      if (c.date) {
        const dateStr = new Date(c.date).toLocaleDateString('en-US')
        if (dateStr.includes(s)) return true
      }
      if (c.beneficiaryDateOfDeath) {
        const dodStr = new Date(c.beneficiaryDateOfDeath).toLocaleDateString('en-US')
        if (dodStr.includes(s)) return true
      }

      return false
    })
  })

  // Filter by status and need type
  const filteredContracts = computed<ContractListing[]>(() => {
    let result = searchedContracts.value

    if (statusFilter.value !== null) {
      result = result.filter((c: ContractListing) => c.status === statusFilter.value)
    }

    if (needTypeFilter.value) {
      result = result.filter((c: ContractListing) => c.needType === needTypeFilter.value)
    }

    return result
  })

  // Group by status string for counts (uses location-filtered contracts)
  const contractsByStatus = computed(() => {
    const grouped: Record<ContractStatusString, ContractListing[]> = {
      Draft: [],
      Executed: [],
      Finalized: [],
      Void: [],
      Cancelled: [],
    }

    for (const contract of locationFilteredContracts.value) {
      const status = (contract.status || 'Draft') as ContractStatusString
      if (grouped[status]) {
        grouped[status].push(contract)
      }
    }

    return grouped
  })

  // Summary stats (uses location-filtered contracts)
  const stats = computed(() => ({
    total: locationFilteredContracts.value.length,
    draft: contractsByStatus.value.Draft?.length ?? 0,
    executed: contractsByStatus.value.Executed?.length ?? 0,
    finalized: contractsByStatus.value.Finalized?.length ?? 0,
    totalBalance: locationFilteredContracts.value.reduce(
      (sum: number, c: ContractListing) => sum + (c.balanceDue ?? 0),
      0,
    ),
  }))

  return {
    // State
    search,
    statusFilter,
    needTypeFilter,
    dateRange,

    // Data
    contracts: locationFilteredContracts,
    filteredContracts,
    contractsByStatus,
    stats,

    // Query state
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: errorMsg,
    reload: query.refetch,
  }
}
