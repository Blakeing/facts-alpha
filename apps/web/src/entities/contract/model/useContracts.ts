/**
 * useContracts - List composable for contracts
 */

import type { ContractListing, ContractStatus, ContractType } from './contract'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { contractApi } from '../api/contractApi'

export const CONTRACTS_QUERY_KEY = ['contracts'] as const

export function useContracts() {
  const search = ref('')
  const statusFilter = ref<ContractStatus | null>(null)
  const typeFilter = ref<ContractType | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CONTRACTS_QUERY_KEY,
    queryFn: () => contractApi.list(),
  })

  const contracts = computed(() => data.value ?? [])

  // Filter by search term
  const searchedContracts = computed(() => {
    if (!search.value) return contracts.value

    const term = search.value.toLowerCase()
    return contracts.value.filter(
      (c) =>
        c.contractNumber.toLowerCase().includes(term) ||
        c.purchaserName.toLowerCase().includes(term) ||
        c.beneficiaryName.toLowerCase().includes(term) ||
        c.prePrintedContractNumber?.toLowerCase().includes(term),
    )
  })

  // Filter by status
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

  // Group by status for counts
  const contractsByStatus = computed(() => {
    const grouped: Record<ContractStatus, ContractListing[]> = {
      draft: [],
      finalized: [],
      executed: [],
      void: [],
      cancelled: [],
    }

    for (const contract of contracts.value) {
      grouped[contract.status].push(contract)
    }

    return grouped
  })

  // Summary stats
  const stats = computed(() => ({
    total: contracts.value.length,
    draft: contractsByStatus.value.draft.length,
    finalized: contractsByStatus.value.finalized.length,
    executed: contractsByStatus.value.executed.length,
    totalBalance: contracts.value.reduce((sum, c) => sum + c.balanceDue, 0),
  }))

  return {
    // State
    search,
    statusFilter,
    typeFilter,

    // Data
    contracts,
    filteredContracts,
    contractsByStatus,
    stats,

    // Query state
    isLoading,
    error,
    reload: refetch,
  }
}
