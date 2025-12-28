/**
 * useLocationMutations - Effect-based CRUD operations for locations
 *
 * Provides create, update, and delete mutations with typed error handling.
 * Use alongside useLocations for list operations or useLocationForm for form handling.
 */

import type { Location } from './location'
import type { LocationFormValues } from './locationSchema'

import { errorMessage, runEffectMutation } from '@facts/effect'

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { LocationApi } from '../api'
import { LOCATIONS_QUERY_KEY } from './useLocations'

/**
 * Update mutation variables type
 */
interface UpdateLocationVariables {
  id: string
  data: Partial<LocationFormValues>
}

/**
 * Effect-enabled location mutations
 *
 * Provides create, update, and delete operations with typed error handling.
 * Automatically invalidates queries on success.
 *
 * @returns Location mutation functions with typed errors
 */
export function useLocationMutations() {
  const queryClient = useQueryClient()

  // Create mutation
  const createMutation = useMutation<Location, Error, LocationFormValues>({
    mutationFn: runEffectMutation((data) => LocationApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
    },
  })

  // Update mutation
  const updateMutation = useMutation<Location, Error, UpdateLocationVariables>({
    mutationFn: runEffectMutation(({ id, data }) => LocationApi.update(id, data)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['location', variables.id] })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: runEffectMutation((id) => LocationApi.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
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
