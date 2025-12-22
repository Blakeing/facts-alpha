/**
 * entities/case/model/useCase.ts
 *
 * Domain composable for fetching a single case.
 * Uses TanStack Query for caching and data fetching.
 *
 * @example
 * ```ts
 * const { case: caseData, isLoading, error, reload } = useCase(props.id)
 * ```
 */

import type { Case } from './case'
import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { caseApi } from '../api'

/**
 * Fetch and manage a single case by ID.
 *
 * Automatically reloads when the ID changes (reactive query key).
 * Results are cached and shared across components.
 *
 * @param id - Case ID (can be a ref or getter for reactivity)
 */
export function useCase(id: MaybeRefOrGetter<string>) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: computed(() => ['case', toValue(id)] as const),
    queryFn: () => caseApi.get(toValue(id)),
    enabled: () => !!toValue(id),
  })

  return {
    case: data,
    isLoading,
    error: computed(() => (error.value instanceof Error ? error.value.message : null)),
    reload: refetch,
  }
}
