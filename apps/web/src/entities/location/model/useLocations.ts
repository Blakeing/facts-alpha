/**
 * useLocations - List composable for locations
 */

import type { LocationListing, LocationType } from './location'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { locationApi } from '../api/locationApi'

export const LOCATIONS_QUERY_KEY = ['locations'] as const

export function useLocations() {
  const search = ref('')
  const typeFilter = ref<LocationType | null>(null)
  const activeFilter = ref<boolean | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: LOCATIONS_QUERY_KEY,
    queryFn: () => locationApi.list(),
  })

  const locations = computed(() => data.value ?? [])

  // Filter by search term
  const searchedLocations = computed(() => {
    if (!search.value) return locations.value

    const term = search.value.toLowerCase()
    return locations.value.filter(
      (l) =>
        l.identifier.toLowerCase().includes(term) ||
        l.name.toLowerCase().includes(term) ||
        l.city.toLowerCase().includes(term) ||
        l.state.toLowerCase().includes(term),
    )
  })

  // Apply all filters
  const filteredLocations = computed(() => {
    let result = searchedLocations.value

    if (typeFilter.value) {
      result = result.filter((l) => l.type === typeFilter.value)
    }

    if (activeFilter.value !== null) {
      result = result.filter((l) => l.active === activeFilter.value)
    }

    return result
  })

  // Group by type for counts
  const locationsByType = computed(() => {
    const grouped: Record<LocationType, LocationListing[]> = {
      funeral: [],
      cemetery: [],
      corporate: [],
    }

    for (const location of locations.value) {
      grouped[location.type].push(location)
    }

    return grouped
  })

  // Summary stats
  const stats = computed(() => ({
    total: locations.value.length,
    funeral: locationsByType.value.funeral.length,
    cemetery: locationsByType.value.cemetery.length,
    corporate: locationsByType.value.corporate.length,
    active: locations.value.filter((l) => l.active).length,
    inactive: locations.value.filter((l) => !l.active).length,
  }))

  return {
    // State
    search,
    typeFilter,
    activeFilter,

    // Data
    locations,
    filteredLocations,
    locationsByType,
    stats,

    // Query state
    isLoading,
    error,
    reload: refetch,
  }
}
