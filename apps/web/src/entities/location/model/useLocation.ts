/**
 * useLocation - Single location composable
 */

import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { locationApi } from '../api/locationApi'

export function useLocation(locationId: MaybeRefOrGetter<string | null | undefined>) {
  const queryKey = computed(() => ['location', toValue(locationId)] as const)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const id = toValue(locationId)
      if (!id) return null
      return locationApi.get(id)
    },
    enabled: computed(() => !!toValue(locationId)),
  })

  const location = computed(() => data.value ?? null)

  return {
    location,
    isLoading,
    error,
    reload: refetch,
  }
}
