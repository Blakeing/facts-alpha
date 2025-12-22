/**
 * entities/case/model/useCaseForm.ts
 *
 * Domain composable for case create/edit form lifecycle.
 * Uses TanStack Query for mutations and cache invalidation.
 *
 * @example
 * ```ts
 * // Create mode
 * const { save, isSaving, saveError, initialValues } = useCaseForm()
 *
 * // Edit mode
 * const { save, isSaving, saveError, initialValues, isEditing } = useCaseForm(caseId)
 * ```
 */

import type { Case } from './case'
import type { CaseFormValues } from './caseSchema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { caseApi } from '../api'
import { caseToFormValues, getDefaultCaseFormValues } from './caseSchema'
import { CASES_QUERY_KEY } from './useCases'

export interface UseCaseFormOptions {
  /**
   * Called after successful save
   */
  onSuccess?: (result: Case) => void

  /**
   * Called when save fails
   */
  onError?: (error: unknown) => void
}

/**
 * Create a form state for case create/edit.
 *
 * @param caseId - If provided, loads the case for editing. Otherwise creates a new case.
 * @param options - Optional callbacks for success/error
 */
export function useCaseForm(caseId?: string, options: UseCaseFormOptions = {}) {
  const isEditing = !!caseId
  const queryClient = useQueryClient()

  // Load initial values for edit mode (uses cache if available)
  const { data: initialData, isLoading: isLoadingInitial } = useQuery({
    queryKey: ['case', caseId] as const,
    queryFn: () => caseApi.get(caseId!),
    enabled: isEditing,
  })

  // Computed initial values for the form
  const initialValues = computed(() =>
    isEditing && initialData.value
      ? caseToFormValues(initialData.value)
      : getDefaultCaseFormValues(),
  )

  // Save mutation with cache invalidation
  const mutation = useMutation({
    mutationFn: (data: CaseFormValues) =>
      isEditing ? caseApi.update(caseId!, data) : caseApi.create(data),
    onSuccess: (result) => {
      // Invalidate list cache
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY })
      // Invalidate single case cache if editing
      if (caseId) {
        queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      }
      options.onSuccess?.(result)
    },
    onError: options.onError,
  })

  return {
    // Form state
    isEditing,
    caseId,
    initialValues,
    isLoadingInitial,

    // Mutation state
    isSaving: computed(() => mutation.isPending.value),
    saveError: computed(() =>
      mutation.error.value instanceof Error ? mutation.error.value.message : null,
    ),

    // Actions
    save: mutation.mutateAsync,
    clearError: mutation.reset,
  }
}
