/**
 * App Bootstrapper Store - Tracks application initialization state
 *
 * Manages the global loading state during app bootstrap:
 * - Endpoint loading
 * - Auth service initialization
 * - Router guard authentication checks
 * - User context initialization
 * - Route data loading (via Suspense)
 *
 * This ensures a single, app-level loading state takes precedence
 * over component-level loaders during initial page load.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useBootstrapperStore = defineStore('bootstrapper', () => {
  // ============================================================
  // State
  // ============================================================

  /** Whether endpoints are being loaded */
  const loadingEndpoints = ref(true) // Start as true since bootstrap begins immediately

  /** Whether auth service is being initialized */
  const initializingAuth = ref(false)

  /** Whether router guard is checking authentication */
  const checkingAuth = ref(false)

  /** Whether user context is being initialized */
  const initializingUserContext = ref(false)

  /** Whether route-level data is being loaded (after navigation) */
  const loadingRouteData = ref(false)

  /** Whether this is the initial page load (not subsequent navigation) */
  const isInitialLoad = ref(true)

  // ============================================================
  // Computed
  // ============================================================

  /**
   * True if app is still bootstrapping (any initialization step is in progress)
   * This should take precedence over component-level loaders.
   * Only shows during initial load - subsequent navigation uses component loaders.
   */
  const isBootstrapping = computed(() => {
    return (
      loadingEndpoints.value ||
      initializingAuth.value ||
      (checkingAuth.value && isInitialLoad.value) ||
      initializingUserContext.value ||
      (loadingRouteData.value && isInitialLoad.value)
    )
  })

  // ============================================================
  // Actions
  // ============================================================

  function setLoadingEndpoints(value: boolean) {
    loadingEndpoints.value = value
  }

  function setInitializingAuth(value: boolean) {
    initializingAuth.value = value
  }

  function setCheckingAuth(value: boolean) {
    checkingAuth.value = value
  }

  function setInitializingUserContext(value: boolean) {
    initializingUserContext.value = value
  }

  function setLoadingRouteData(value: boolean) {
    loadingRouteData.value = value
  }

  function setInitialLoadComplete() {
    isInitialLoad.value = false
  }

  /**
   * Reset all bootstrapper state (useful for testing or manual reset)
   */
  function reset() {
    loadingEndpoints.value = false
    initializingAuth.value = false
    checkingAuth.value = false
    initializingUserContext.value = false
    loadingRouteData.value = false
    isInitialLoad.value = true
  }

  return {
    // State (readonly access)
    loadingEndpoints,
    initializingAuth,
    checkingAuth,
    initializingUserContext,
    loadingRouteData,
    isInitialLoad,

    // Computed
    isBootstrapping,

    // Actions
    setLoadingEndpoints,
    setInitializingAuth,
    setCheckingAuth,
    setInitializingUserContext,
    setLoadingRouteData,
    setInitialLoadComplete,
    reset,
  }
})
