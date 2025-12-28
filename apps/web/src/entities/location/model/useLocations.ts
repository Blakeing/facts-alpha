/**
 * useLocations - List composable for locations with Effect-based error handling
 */

import { errorMessage, handleError, runEffectQuery } from '@facts/effect'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { LocationApi } from '../api'
import { type LocationListing, LocationType } from './location'

export const LOCATIONS_QUERY_KEY = ['locations'] as const

export function useLocations() {
  const search = ref('')
  const typeFilter = ref<LocationType | null>(null)
  const activeFilter = ref<boolean | null>(null)

  const query = useQuery({
    queryKey: LOCATIONS_QUERY_KEY,
    queryFn: runEffectQuery(LocationApi.list()),
  })

  const locations = computed(() => query.data.value ?? [])

  // Typed error handling
  const errorMsg = computed(() => {
    if (!query.error.value) return null
    return handleError(query.error.value, {
      NetworkError: (e) => `Network error: ${e.message}`,
      default: errorMessage,
    })
  })

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
      [LocationType.FUNERAL]: [],
      [LocationType.CEMETERY]: [],
      [LocationType.CORPORATE]: [],
    }

    for (const location of locations.value) {
      grouped[location.type].push(location)
    }

    return grouped
  })

  // Summary stats
  const stats = computed(() => ({
    total: locations.value.length,
    funeral: locationsByType.value[LocationType.FUNERAL].length,
    cemetery: locationsByType.value[LocationType.CEMETERY].length,
    corporate: locationsByType.value[LocationType.CORPORATE].length,
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
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: errorMsg,
    reload: query.refetch,
  }
}
