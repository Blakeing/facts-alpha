import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type ComputedRef, type MaybeRefOrGetter, type Ref, toValue } from 'vue'

/**
 * API interface that entity forms expect
 *
 * Note: TFormValues for update accepts both full and partial values,
 * as APIs may accept Partial<TFormValues> for updates.
 */
export interface EntityApi<TEntity, TFormValues> {
  get: (id: string) => Promise<TEntity | null>
  create: (data: TFormValues) => Promise<TEntity>
  update: (id: string, data: TFormValues | Partial<TFormValues>) => Promise<TEntity>
  delete?: (id: string) => Promise<void>
}

/**
 * Options for useEntityForm
 */
export interface UseEntityFormOptions<TEntity, TFormValues> {
  /** The entity ID (null for new entities) */
  entityId: MaybeRefOrGetter<string | null | undefined>
  /** API client with get/create/update/delete methods */
  api: EntityApi<TEntity, TFormValues>
  /** Query key for individual entity (e.g., (id) => ['contract', id]) */
  queryKey: (id: string) => readonly unknown[]
  /** Query key for the list (for invalidation after save) */
  listQueryKey: readonly unknown[]
  /** Transform entity to form values */
  toFormValues: (entity: TEntity) => TFormValues
  /** Get default form values for new entity */
  getDefaults: () => TFormValues
  /** Callback on successful save */
  onSuccess?: () => void
  /** Callback on error */
  onError?: (error: Error) => void
}

/**
 * Return type for useEntityForm
 */
export interface UseEntityFormReturn<TFormValues> {
  /** Whether we're editing an existing entity */
  isEditing: ComputedRef<boolean>
  /** Whether initial data is loading */
  isLoadingInitial: Ref<boolean>
  /** Initial form values (null while loading for edit) */
  initialValues: ComputedRef<TFormValues | null>
  /** Save the entity (create or update) */
  save: (data: TFormValues) => Promise<unknown>
  /** Whether save is in progress */
  isSaving: Ref<boolean>
  /** Delete the entity (if supported) */
  delete: () => Promise<void>
  /** Whether delete is in progress */
  isDeleting: Ref<boolean>
  /** Combined busy state */
  isBusy: ComputedRef<boolean>
}

/**
 * useEntityForm - Generic entity form composable with mutations
 *
 * Provides a standardized pattern for entity CRUD operations with TanStack Query.
 * Handles loading existing entities, creating new ones, updating, and deleting.
 *
 * @example
 * ```ts
 * // In useContractForm.ts - now just a thin wrapper
 * export function useContractForm(
 *   contractId: MaybeRefOrGetter<string | null | undefined>,
 *   options: { onSuccess?: () => void; onError?: (error: Error) => void } = {}
 * ) {
 *   const base = useEntityForm({
 *     entityId: contractId,
 *     api: contractApi,
 *     queryKey: (id) => ['contract', id],
 *     listQueryKey: CONTRACTS_QUERY_KEY,
 *     toFormValues: contractToFormValues,
 *     getDefaults: getDefaultContractFormValues,
 *     ...options,
 *   })
 *
 *   // Add contract-specific mutations (items, payments)
 *   const addItemMutation = useMutation({ ... })
 *
 *   return {
 *     ...base,
 *     addItem: addItemMutation.mutateAsync,
 *   }
 * }
 * ```
 */
export function useEntityForm<TEntity, TFormValues>(
  options: UseEntityFormOptions<TEntity, TFormValues>,
): UseEntityFormReturn<TFormValues> {
  const { entityId, api, queryKey, listQueryKey, toFormValues, getDefaults, onSuccess, onError } =
    options

  const queryClient = useQueryClient()
  const isEditing = computed(() => !!toValue(entityId))

  // Load existing entity for editing
  const { data: existingEntity, isLoading: isLoadingInitial } = useQuery({
    queryKey: computed(() => {
      const id = toValue(entityId)
      return id ? queryKey(id) : ['entity', 'none']
    }),
    queryFn: () => {
      const id = toValue(entityId)
      return id ? api.get(id) : null
    },
    enabled: isEditing,
  })

  // Initial form values
  const initialValues = computed((): TFormValues | null => {
    if (!isEditing.value) {
      return getDefaults()
    }
    if (!existingEntity.value) return null
    return toFormValues(existingEntity.value)
  })

  // Save mutation (create or update)
  const saveMutation = useMutation({
    mutationFn: async (data: TFormValues) => {
      const id = toValue(entityId)
      if (isEditing.value && id) {
        return api.update(id, data)
      }
      return api.create(data)
    },
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: listQueryKey })
      const id = toValue(entityId)
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKey(id) })
      }
      onSuccess?.()
    },
    onError: (error: Error) => {
      onError?.(error)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const id = toValue(entityId)
      if (!id) throw new Error('No entity ID')
      if (!api.delete) throw new Error('Delete not supported')
      return api.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey })
      onSuccess?.()
    },
    onError: (error: Error) => {
      onError?.(error)
    },
  })

  return {
    // Form state
    isEditing,
    isLoadingInitial,
    initialValues,

    // Mutations
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    delete: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Combined busy state
    isBusy: computed(() => saveMutation.isPending.value || deleteMutation.isPending.value),
  }
}
