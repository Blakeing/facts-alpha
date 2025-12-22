/**
 * entities/case/model/useCases.ts
 *
 * Domain composable for case list management.
 * Uses TanStack Query for caching and data fetching.
 *
 * @example
 * ```ts
 * const { cases, isLoading, error, search, load, activeCases } = useCases()
 * ```
 */

import type { Case, CaseStatus } from './case'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { caseApi } from '../api'

/** Query key for cases list - exported for cache invalidation */
export const CASES_QUERY_KEY = ['cases'] as const

export function useCases() {
  const search = ref('')
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CASES_QUERY_KEY,
    queryFn: () => caseApi.list(),
  })

  // Base cases computed
  const cases = computed(() => data.value ?? [])

  // Client-side filtering
  const filteredCases = computed(() => {
    if (!search.value) return cases.value
    const searchLower = search.value.toLowerCase()
    return cases.value.filter(
      (c) =>
        c.caseNumber.toLowerCase().includes(searchLower) ||
        c.decedent.firstName.toLowerCase().includes(searchLower) ||
        c.decedent.lastName.toLowerCase().includes(searchLower) ||
        c.nextOfKin.firstName.toLowerCase().includes(searchLower) ||
        c.nextOfKin.lastName.toLowerCase().includes(searchLower),
    )
  })

  // Domain-specific computed properties
  const activeCases = computed(() =>
    cases.value.filter((c) => c.status === 'active' || c.status === 'in_progress'),
  )

  const pendingCases = computed(() => cases.value.filter((c) => c.status === 'pending'))

  const completedCases = computed(() => cases.value.filter((c) => c.status === 'completed'))

  const casesByStatus = computed(() => {
    const grouped: Record<CaseStatus, Case[]> = {
      pending: [],
      active: [],
      in_progress: [],
      completed: [],
      archived: [],
    }
    for (const c of cases.value) {
      grouped[c.status].push(c)
    }
    return grouped
  })

  const isEmpty = computed(() => filteredCases.value.length === 0)
  const totalCount = computed(() => cases.value.length)

  // Domain-specific actions
  async function deleteCase(id: string): Promise<void> {
    await caseApi.delete(id)
    // Invalidate cache to trigger refetch
    queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY })
  }

  return {
    // Data
    cases,
    filteredCases,
    isLoading,
    error: computed(() => (error.value instanceof Error ? error.value.message : null)),
    search,
    isEmpty,
    totalCount,

    // Actions
    load: refetch,
    refresh: refetch,

    // Domain-specific
    activeCases,
    pendingCases,
    completedCases,
    casesByStatus,
    deleteCase,
  }
}
