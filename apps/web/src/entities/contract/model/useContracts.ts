/**
 * useContracts - List composable for contracts
 *
 * Contracts are filtered by the current location from the user context store.
 */

import type { ContractListing, ContractStatus, ContractType } from './contract'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useUserContextStore } from '@/stores'
import { contractApi } from '../api/contractApi'

export const CONTRACTS_QUERY_KEY = ['contracts'] as const

export function useContracts() {
  const userContext = useUserContextStore()

  const search = ref('')
  const statusFilter = ref<ContractStatus | null>(null)
  const typeFilter = ref<ContractType | null>(null)

  // Query key includes locationId for cache separation per location
  const queryKey = computed(() => ['contracts', userContext.currentLocationId] as const)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => contractApi.list(),
  })

  const contracts = computed(() => data.value ?? [])

  // Filter by current location first
  const locationFilteredContracts = computed(() => {
    const locationId = userContext.currentLocationId
    if (!locationId) return []
    return contracts.value.filter((c) => c.locationId === locationId)
  })

  // Filter by search term
  const searchedContracts = computed(() => {
    if (!search.value) return locationFilteredContracts.value

    const term = search.value.toLowerCase()
    return locationFilteredContracts.value.filter(
      (c) =>
        c.contractNumber.toLowerCase().includes(term) ||
        c.purchaserName.toLowerCase().includes(term) ||
        c.beneficiaryName.toLowerCase().includes(term) ||
        c.prePrintedContractNumber?.toLowerCase().includes(term),
    )
  })

  // Filter by status and type
  const filteredContracts = computed(() => {
    let result = searchedContracts.value

    if (statusFilter.value) {
      result = result.filter((c) => c.status === statusFilter.value)
    }

    if (typeFilter.value) {
      result = result.filter((c) => c.type === typeFilter.value)
    }

    return result
  })

  // Group by status for counts (uses location-filtered contracts)
  const contractsByStatus = computed(() => {
    const grouped: Record<ContractStatus, ContractListing[]> = {
      draft: [],
      finalized: [],
      executed: [],
      void: [],
      cancelled: [],
    }

    for (const contract of locationFilteredContracts.value) {
      grouped[contract.status].push(contract)
    }

    return grouped
  })

  // Summary stats (uses location-filtered contracts)
  const stats = computed(() => ({
    total: locationFilteredContracts.value.length,
    draft: contractsByStatus.value.draft.length,
    finalized: contractsByStatus.value.finalized.length,
    executed: contractsByStatus.value.executed.length,
    totalBalance: locationFilteredContracts.value.reduce((sum, c) => sum + c.balanceDue, 0),
  }))

  return {
    // State
    search,
    statusFilter,
    typeFilter,

    // Data
    contracts: locationFilteredContracts,
    filteredContracts,
    contractsByStatus,
    stats,

    // Query state
    isLoading,
    error,
    reload: refetch,
  }
}
