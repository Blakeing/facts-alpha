/**
 * useLocation - Single location composable with Effect-based error handling
 */

import type { Location } from './location'
import { errorMessage, handleError, runEffectQuery } from '@facts/effect'

import { useQuery } from '@tanstack/vue-query'

import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { LocationApi } from '../api'

export function useLocation(locationId: MaybeRefOrGetter<string | null | undefined>) {
  const queryKey = computed(() => ['location', toValue(locationId)] as const)

  const query = useQuery<Location, Error>({
    queryKey,
    queryFn: async () => {
      const id = toValue(locationId)
      if (!id) throw new Error('No location ID provided')
      return runEffectQuery(LocationApi.get(id))()
    },
    enabled: computed(() => !!toValue(locationId)),
  })

  const location = computed<Location | null>(() => query.data.value ?? null)

  // Typed error handling
  const errorMsg = computed(() => {
    if (!query.error.value) return null
    return handleError(query.error.value, {
      NotFoundError: (e) => `Location "${e.id}" not found`,
      NetworkError: (e) => `Network error: ${e.message}`,
      default: errorMessage,
    })
  })

  return {
    location,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: errorMsg,
    reload: query.refetch,
  }
}
