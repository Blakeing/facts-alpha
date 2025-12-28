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

import { useUserContextStore } from '@/stores'
import { ContractApi } from '../api'
import { SaleStatus } from './contract'

export const CONTRACTS_QUERY_KEY = ['contracts'] as const

export function useContracts() {
  const userContext = useUserContextStore()

  const search = ref('')
  const statusFilter = ref<SaleStatus | null>(null)
  const needTypeFilter = ref<NeedType | null>(null)

  // Query key includes locationId for cache separation per location
  const queryKey = computed(() => ['contracts', userContext.currentLocationId] as const)

  const query = useQuery<ContractListing[], Error>({
    queryKey,
    queryFn: runEffectQuery(ContractApi.list()),
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

  // Filter by current location first
  const locationFilteredContracts = computed<ContractListing[]>(() => {
    const locationId = userContext.currentLocationId
    if (!locationId) return []
    return contracts.value.filter((c: ContractListing) => c.locationId === locationId)
  })

  // Filter by search term
  const searchedContracts = computed<ContractListing[]>(() => {
    if (!search.value) return locationFilteredContracts.value

    const term = search.value.toLowerCase()
    return locationFilteredContracts.value.filter(
      (c: ContractListing) =>
        c.contractNumber.toLowerCase().includes(term) ||
        c.primaryBuyerName.toLowerCase().includes(term) ||
        c.primaryBeneficiaryName.toLowerCase().includes(term) ||
        c.prePrintedContractNumber?.toLowerCase().includes(term),
    )
  })

  // Filter by status and need type
  const filteredContracts = computed<ContractListing[]>(() => {
    let result = searchedContracts.value

    if (statusFilter.value) {
      result = result.filter((c: ContractListing) => c.saleStatus === statusFilter.value)
    }

    if (needTypeFilter.value) {
      result = result.filter((c: ContractListing) => c.needType === needTypeFilter.value)
    }

    return result
  })

  // Group by status for counts (uses location-filtered contracts)
  const contractsByStatus = computed(() => {
    const grouped: Record<SaleStatus, ContractListing[]> = {
      [SaleStatus.DRAFT]: [],
      [SaleStatus.EXECUTED]: [],
      [SaleStatus.FINALIZED]: [],
      [SaleStatus.VOID]: [],
    }

    for (const contract of locationFilteredContracts.value) {
      const status = contract.saleStatus as SaleStatus
      if (grouped[status]) {
        grouped[status].push(contract)
      }
    }

    return grouped
  })

  // Summary stats (uses location-filtered contracts)
  const stats = computed(() => ({
    total: locationFilteredContracts.value.length,
    draft: contractsByStatus.value[SaleStatus.DRAFT]?.length ?? 0,
    executed: contractsByStatus.value[SaleStatus.EXECUTED]?.length ?? 0,
    finalized: contractsByStatus.value[SaleStatus.FINALIZED]?.length ?? 0,
    totalBalance: locationFilteredContracts.value.reduce(
      (sum: number, c: ContractListing) => sum + c.balanceDue,
      0,
    ),
  }))

  return {
    // State
    search,
    statusFilter,
    needTypeFilter,

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
