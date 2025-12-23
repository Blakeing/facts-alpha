/**
 * User Context Store - Global state for current user and location
 *
 * This Pinia store provides the current authentication context
 * and selected location for the application.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'user'
}

export interface Location {
  id: string
  name: string
  type: 'funeral' | 'cemetery' | 'corporate'
}

export const useUserContextStore = defineStore('userContext', () => {
  // State
  const currentUser = ref<User | null>(null)
  const currentLocation = ref<Location | null>(null)
  const availableLocations = ref<Location[]>([])

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
  }

  // Initialize with mock data for development
  function initMockData() {
    currentUser.value = {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
    }

    availableLocations.value = [
      { id: 'loc-1', name: 'Springfield Funeral Home', type: 'funeral' },
      { id: 'loc-2', name: 'Riverside Cemetery', type: 'cemetery' },
      { id: 'loc-3', name: 'Corporate Office', type: 'corporate' },
    ]

    currentLocation.value = availableLocations.value[0] ?? null
  }

  return {
    // State
    currentUser,
    currentLocation,
    availableLocations,

    // Computed
    isAuthenticated,
    currentLocationId,
    userFullName,
    userInitials,
    isAdmin,
    isManager,

    // Actions
    setUser,
    setCurrentLocation,
    setAvailableLocations,
    switchLocation,
    logout,
    initMockData,
  }
})
