/**
 * useContract - Single contract composable with Effect-based error handling
 */

import type { Contract } from './contract'
import { errorMessage, handleError, runEffectQuery } from '@facts/effect'

import { useQuery } from '@tanstack/vue-query'

import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { ContractApi } from '../api'

export function useContract(contractId: MaybeRefOrGetter<string | null | undefined>) {
  const queryKey = computed(() => ['contract', toValue(contractId)] as const)

  const query = useQuery<Contract, Error>({
    queryKey,
    queryFn: async () => {
      const id = toValue(contractId)
      if (!id) throw new Error('No contract ID provided')
      return runEffectQuery(ContractApi.get(id))()
    },
    enabled: computed(() => !!toValue(contractId)),
  })

  const contract = computed<Contract | null>(() => query.data.value ?? null)

  // Typed error handling
  const errorMsg = computed(() => {
    if (!query.error.value) return null
    return handleError(query.error.value, {
      NotFoundError: (e) => `Contract "${e.id}" not found`,
      NetworkError: (e) => `Network error: ${e.message}`,
      UnauthorizedError: () => 'Please log in to view this contract',
      default: errorMessage,
    })
  })

  return {
    contract,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: errorMsg,
    reload: query.refetch,
  }
}
