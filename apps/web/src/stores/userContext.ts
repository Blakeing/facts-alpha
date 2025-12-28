/**
 * User Context Store - Global state for current user, location, and permissions
 *
 * This Pinia store provides the current authentication context,
 * selected location, and permission checking for the application.
 *
 * Permission system is aligned with legacy FACTS application.
 */

import { runEffect } from '@facts/effect'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { LocationApi, type LocationListing, LocationType } from '@/entities/location'
import { usersApi } from '@/shared/api'
import { authService } from '@/shared/lib/auth'
import {
  PermissionLevel,
  type Requirement,
  type SecurityOptionKey,
  SecurityOptionKeys,
  type UserEffectivePermissions,
} from '@/shared/lib/security'

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
  // ============================================================
  // State
  // ============================================================
  const currentUser = ref<User | null>(null)
  const currentLocation = ref<Location | null>(null)
  const availableLocations = ref<Location[]>([])
  const locationsLoading = ref(false)
  const locationsLoaded = ref(false)

  /**
   * Tenant ID from OIDC user profile
   */
  const tenantId = ref<string | undefined>(undefined)

  /**
   * User's effective permissions.
   * Fetched from BFF after authentication.
   */
  const userPermissions = ref<UserEffectivePermissions | null>(null)

  // ============================================================
  // Computed - User Info
  // ============================================================
  const isAuthenticated = computed(() => !!currentUser.value)
  const currentLocationId = computed(() => currentLocation.value?.id ?? null)
  const currentLocationType = computed(() => currentLocation.value?.type ?? null)

  const userFullName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  })

  const userInitials = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName[0]}${currentUser.value.lastName[0]}`
  })

  // ============================================================
  // Computed - Permissions
  // ============================================================

  /**
   * True if user has admin privileges (bypasses all permission checks)
   */
  const isAdmin = computed(() => {
    return userPermissions.value?.isAdmin ?? false
  })

  /**
   * True if user has manager-level access
   */
  const isManager = computed(() => currentUser.value?.role === 'manager' || isAdmin.value)

  /**
   * Array of location IDs the user can access
   */
  const accessibleLocationIds = computed(() => availableLocations.value.map((l) => l.id))

  // Only show active, non-corporate locations for selection
  const selectableLocations = computed(() =>
    availableLocations.value.filter((l) => l.type !== LocationType.CORPORATE),
  )

  // ============================================================
  // Permission Checking Methods
  // ============================================================

  /**
   * Check if user has a permission with the specified key and level.
   * Aligned with legacy SecurityValidator.userCanWithKeyNumber()
   */
  function userCanWithKey(key: SecurityOptionKey, level: PermissionLevel): boolean {
    // No permissions loaded = deny
    if (!userPermissions.value) return false

    // Admin bypasses all checks
    if (userPermissions.value.isAdmin) return true

    // Check for None/invalid key
    if (key === SecurityOptionKeys.None) return false

    // No permissions granted = deny
    if (userPermissions.value.permissionsGranted.length === 0) return false

    // Find matching permission
    const perm = userPermissions.value.permissionsGranted.find(
      (p) => p.key === key && p.level >= level,
    )

    return !!perm
  }

  /**
   * Check if user meets a permission requirement.
   * Aligned with legacy SecurityValidator.userCanWithRequirement()
   */
  function userCanWithRequirement(requirement: Requirement): boolean {
    return userCanWithKey(requirement.key, requirement.level)
  }

  /**
   * Check if user meets at least one of multiple requirements.
   * Aligned with legacy SecurityValidator.useCanWithAnyRequirement()
   */
  function userCanWithAnyRequirement(requirements: Requirement[]): boolean {
    return requirements.some((r) => userCanWithRequirement(r))
  }

  /**
   * Check if user can access a specific location.
   * Aligned with legacy SecurityValidator.userCanAccessLocation()
   */
  function userCanAccessLocation(locationId: string): boolean {
    return accessibleLocationIds.value.includes(locationId)
  }

  /**
   * Shorthand for checking read permission on a key
   */
  function canRead(key: SecurityOptionKey): boolean {
    return userCanWithKey(key, PermissionLevel.Read)
  }

  /**
   * Shorthand for checking edit permission on a key
   */
  function canEdit(key: SecurityOptionKey): boolean {
    return userCanWithKey(key, PermissionLevel.Edit)
  }

  // ============================================================
  // Actions - User & Permissions
  // ============================================================

  function setUser(user: User | null) {
    currentUser.value = user
  }

  function setUserPermissions(permissions: UserEffectivePermissions | null) {
    userPermissions.value = permissions
  }

  function setTenantId(id: string | undefined) {
    tenantId.value = id
  }

  // ============================================================
  // Actions - Location
  // ============================================================

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
      // TODO: Fetch location-specific settings
      // TODO: Emit location changed event for components to react
    }
  }

  function logout() {
    currentUser.value = null
    currentLocation.value = null
    availableLocations.value = []
    locationsLoaded.value = false
    userPermissions.value = null
    tenantId.value = undefined
  }

  /**
   * Load locations from the API and set the first active location as current
   */
  async function loadLocations(): Promise<void> {
    // Skip if already loaded or loading
    if (locationsLoaded.value || locationsLoading.value) return

    locationsLoading.value = true
    try {
      const listings = await runEffect(LocationApi.list())

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

  // ============================================================
  // Authentication Integration
  // ============================================================

  /**
   * Initialize user context from OIDC authentication.
   * This is the production authentication flow.
   */
  async function initFromAuth(): Promise<void> {
    try {
      // Get user from OIDC
      const oidcUser = await authService.getUser()
      if (!oidcUser) {
        console.warn('No OIDC user found')
        return
      }

      // Extract user details from profile
      const profile = oidcUser.profile as any
      currentUser.value = {
        id: profile.sub,
        email: profile.email || '',
        firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
        lastName: profile.family_name || profile.name?.split(' ')[1] || '',
        role: 'user', // Default role, may be determined from permissions
      }

      // Set tenant ID from profile
      tenantId.value = (profile.tenantId || profile.tenant_id) as string | undefined

      // Fetch permissions from BFF
      try {
        const permissions = await usersApi.getUserPermissions()
        userPermissions.value = permissions

        // Update role if admin
        if (permissions.isAdmin && currentUser.value) {
          currentUser.value.role = 'admin'
        }
      } catch (error) {
        console.error('Failed to load user permissions:', error)
        // Continue with empty permissions
        userPermissions.value = {
          isAdmin: false,
          permissionsGranted: [],
        }
      }

      // Load available locations
      await loadLocations()
    } catch (error) {
      console.error('Failed to initialize user context from auth:', error)
      throw error
    }
  }

  return {
    // State
    currentUser,
    currentLocation,
    availableLocations,
    locationsLoading,
    locationsLoaded,
    userPermissions,
    tenantId,

    // Computed - User Info
    isAuthenticated,
    currentLocationId,
    currentLocationType,
    userFullName,
    userInitials,

    // Computed - Permissions
    isAdmin,
    isManager,
    accessibleLocationIds,
    selectableLocations,

    // Permission Checking Methods
    userCanWithKey,
    userCanWithRequirement,
    userCanWithAnyRequirement,
    userCanAccessLocation,
    canRead,
    canEdit,

    // Actions
    setUser,
    setUserPermissions,
    setTenantId,
    setCurrentLocation,
    setAvailableLocations,
    switchLocation,
    logout,
    loadLocations,
    initFromAuth,
  }
})
