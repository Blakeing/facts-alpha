/**
 * useContractMutations - Effect-based CRUD operations for contracts
 *
 * Provides create, update, and delete mutations with typed error handling.
 * Use alongside useContracts for list operations or useContractSession for complex editing.
 */

import type { Contract } from './contract'
import type { ContractFormValues } from './contractSchema'

import { errorMessage, runEffectMutation } from '@facts/effect'

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { ContractApi } from '../api'
import { CONTRACTS_QUERY_KEY } from './useContracts'

/**
 * Update mutation variables type
 */
interface UpdateContractVariables {
  id: string
  data: Partial<ContractFormValues>
}

/**
 * Effect-enabled contract mutations
 *
 * Provides create, update, and delete operations with typed error handling.
 * Automatically invalidates queries on success.
 *
 * @returns Contract mutation functions with typed errors
 */
export function useContractMutations() {
  const queryClient = useQueryClient()

  // Create mutation
  const createMutation = useMutation<Contract, Error, ContractFormValues>({
    mutationFn: runEffectMutation((data: ContractFormValues) => ContractApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
    },
  })

  // Update mutation
  const updateMutation = useMutation<Contract, Error, UpdateContractVariables>({
    mutationFn: runEffectMutation(({ id, data }: UpdateContractVariables) =>
      ContractApi.update(id, data),
    ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: runEffectMutation((id: string) => ContractApi.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
    },
  })

  // Error message helpers
  const createErrorMsg = computed(() =>
    createMutation.error.value ? errorMessage(createMutation.error.value) : null,
  )

  const updateErrorMsg = computed(() =>
    updateMutation.error.value ? errorMessage(updateMutation.error.value) : null,
  )

  const deleteErrorMsg = computed(() =>
    deleteMutation.error.value ? errorMessage(deleteMutation.error.value) : null,
  )

  return {
    // Mutations
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // User-friendly error messages
    createErrorMessage: createErrorMsg,
    updateErrorMessage: updateErrorMsg,
    deleteErrorMessage: deleteErrorMsg,

    // Reset functions
    resetCreateError: createMutation.reset,
    resetUpdateError: updateMutation.reset,
    resetDeleteError: deleteMutation.reset,
  }
}
