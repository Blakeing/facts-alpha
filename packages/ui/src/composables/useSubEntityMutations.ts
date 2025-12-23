import type { MaybeRefOrGetter, Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue } from 'vue'

/**
 * API for sub-entity operations (e.g., contract items, contract payments)
 */
export interface SubEntityApi<TSubEntity, TCreateValues> {
  add: (parentId: string, data: TCreateValues) => Promise<TSubEntity>
  remove: (parentId: string, subEntityId: string) => Promise<void>
  update?: (
    parentId: string,
    subEntityId: string,
    data: Partial<TCreateValues>,
  ) => Promise<TSubEntity>
}

/**
 * Options for useSubEntityMutations
 */
export interface UseSubEntityMutationsOptions<TSubEntity, TCreateValues> {
  /** Parent entity ID */
  parentId: MaybeRefOrGetter<string | null | undefined>
  /** API with add/remove/update methods */
  api: SubEntityApi<TSubEntity, TCreateValues>
  /** Query key for the parent entity (for invalidation) */
  parentQueryKey: (id: string) => readonly unknown[]
}

/**
 * Return type for useSubEntityMutations
 */
export interface UseSubEntityMutationsReturn<TSubEntity, TCreateValues> {
  add: (data: TCreateValues) => Promise<TSubEntity>
  remove: (subEntityId: string) => Promise<void>
  update: ((subEntityId: string, data: Partial<TCreateValues>) => Promise<TSubEntity>) | undefined
  isAdding: Ref<boolean>
  isRemoving: Ref<boolean>
  isUpdating: Ref<boolean>
  isBusy: Ref<boolean>
}

/**
 * useSubEntityMutations - Generic mutations for nested/sub-entities
 *
 * Useful for managing items, payments, comments, attachments, etc.
 * that belong to a parent entity.
 *
 * @example
 * ```ts
 * // Contract items
 * const itemMutations = useSubEntityMutations({
 *   parentId: contractId,
 *   api: {
 *     add: (parentId, data) => contractApi.addItem(parentId, data),
 *     remove: (parentId, itemId) => contractApi.removeItem(parentId, itemId),
 *   },
 *   parentQueryKey: (id) => ['contract', id],
 * })
 *
 * // Usage
 * await itemMutations.add({ description: 'Casket', quantity: 1, ... })
 * await itemMutations.remove(itemId)
 * ```
 */
export function useSubEntityMutations<TSubEntity, TCreateValues>(
  options: UseSubEntityMutationsOptions<TSubEntity, TCreateValues>,
): UseSubEntityMutationsReturn<TSubEntity, TCreateValues> {
  const { parentId, api, parentQueryKey } = options
  const queryClient = useQueryClient()

  // Helper to invalidate parent
  const invalidateParent = () => {
    const id = toValue(parentId)
    if (id) {
      queryClient.invalidateQueries({ queryKey: parentQueryKey(id) })
    }
  }

  // Helper to get parent ID or throw
  const requireParentId = (): string => {
    const id = toValue(parentId)
    if (!id) throw new Error('No parent entity ID')
    return id
  }

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: TCreateValues) => {
      return api.add(requireParentId(), data)
    },
    onSuccess: invalidateParent,
  })

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: async (subEntityId: string) => {
      return api.remove(requireParentId(), subEntityId)
    },
    onSuccess: invalidateParent,
  })

  // Update mutation (optional)
  const updateMutation = useMutation({
    mutationFn: async ({
      subEntityId,
      data,
    }: {
      subEntityId: string
      data: Partial<TCreateValues>
    }) => {
      if (!api.update) throw new Error('Update not supported')
      return api.update(requireParentId(), subEntityId, data)
    },
    onSuccess: invalidateParent,
  })

  return {
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    update: api.update
      ? (subEntityId: string, data: Partial<TCreateValues>) =>
          updateMutation.mutateAsync({ subEntityId, data })
      : undefined,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isUpdating: updateMutation.isPending,
    isBusy: computed(
      () =>
        addMutation.isPending.value ||
        removeMutation.isPending.value ||
        updateMutation.isPending.value,
    ),
  }
}
