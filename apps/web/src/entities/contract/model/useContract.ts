/**
 * useContract - Single contract composable with Effect-based error handling
 */

import type { Contract, ContractPermissions, ContractSession } from './contract'
import { errorMessage, handleError, runEffectQuery } from '@facts/effect'

import { useQuery } from '@tanstack/vue-query'

import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { ContractApi } from '../api'

export function useContract(contractId: MaybeRefOrGetter<string | null | undefined>) {
  const queryKey = computed(() => ['contract', toValue(contractId)] as const)

  const query = useQuery<ContractSession, Error>({
    queryKey,
    queryFn: async () => {
      const id = toValue(contractId)
      if (!id || id === 'undefined') {
        throw new Error('No contract ID provided')
      }
      return runEffectQuery(ContractApi.get(id))()
    },
    enabled: computed(() => {
      const id = toValue(contractId)
      return !!id && id !== 'undefined'
    }),
  })

  // Extract contract from session
  const contract = computed<Contract | null>(() => query.data.value?.contract ?? null)

  // Extract permissions from session
  const permissions = computed<ContractPermissions>(() => ({
    canExecute: query.data.value?.executeContract ?? false,
    canFinalize: query.data.value?.finalizeContract ?? false,
    canVoid: query.data.value?.voidContract ?? false,
  }))

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
    permissions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: errorMsg,
    reload: query.refetch,
  }
}
