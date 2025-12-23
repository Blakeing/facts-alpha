/**
 * User Context Store - Global state for current user and location
 *
 * This Pinia store provides the current authentication context
 * and selected location for the application.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { locationApi, type LocationListing, type LocationType } from '@/entities/location'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'user'
}

export interface Location {
  id: string
  identifier: string
  name: string
  type: LocationType
}

export const useUserContextStore = defineStore('userContext', () => {
  // State
  const currentUser = ref<User | null>(null)
  const currentLocation = ref<Location | null>(null)
  const availableLocations = ref<Location[]>([])
  const locationsLoading = ref(false)
  const locationsLoaded = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!currentUser.value)
  const currentLocationId = computed(() => currentLocation.value?.id ?? null)
  const userFullName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  })
  const userInitials = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName[0]}${currentUser.value.lastName[0]}`
  })
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isManager = computed(() => currentUser.value?.role === 'manager' || isAdmin.value)

  // Only show active, non-corporate locations for selection
  const selectableLocations = computed(() =>
    availableLocations.value.filter((l) => l.type !== 'corporate'),
  )

  // Actions
  function setUser(user: User | null) {
    currentUser.value = user
  }

  function setCurrentLocation(location: Location | null) {
    currentLocation.value = location
  }

  function setAvailableLocations(locations: Location[]) {
    availableLocations.value = locations
  }

  function switchLocation(locationId: string) {
    const location = availableLocations.value.find((l) => l.id === locationId)
    if (location) {
      currentLocation.value = location
    }
  }

  function logout() {
    currentUser.value = null
    currentLocation.value = null
    availableLocations.value = []
    locationsLoaded.value = false
  }

  /**
   * Load locations from the API and set the first active location as current
   */
  async function loadLocations(): Promise<void> {
    // Skip if already loaded or loading
    if (locationsLoaded.value || locationsLoading.value) return

    locationsLoading.value = true
    try {
      const listings = await locationApi.list()

      // Convert LocationListing to our Location shape
      const locations: Location[] = listings
        .filter((l: LocationListing) => l.active)
        .map((l: LocationListing) => ({
          id: l.id,
          identifier: l.identifier,
          name: l.name,
          type: l.type,
        }))

      availableLocations.value = locations
      locationsLoaded.value = true

      // Auto-select first selectable location if none selected
      if (!currentLocation.value && selectableLocations.value.length > 0) {
        currentLocation.value = selectableLocations.value[0] ?? null
      }
    } finally {
      locationsLoading.value = false
    }
  }

  // Initialize with mock user data for development (auth will come later)
  function initMockUser() {
    currentUser.value = {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
    }
  }

  return {
    // State
    currentUser,
    currentLocation,
    availableLocations,
    locationsLoading,
    locationsLoaded,

    // Computed
    isAuthenticated,
    currentLocationId,
    userFullName,
    userInitials,
    isAdmin,
    isManager,
    selectableLocations,

    // Actions
    setUser,
    setCurrentLocation,
    setAvailableLocations,
    switchLocation,
    logout,
    loadLocations,
    initMockUser,
  }
})
