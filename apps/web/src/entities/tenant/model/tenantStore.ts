/**
 * entities/tenant/model/tenantStore.ts
 *
 * Pinia store for tenant state
 */

import type { Tenant } from './tenant'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTenantStore = defineStore('tenant', () => {
  const currentTenant = ref<Tenant | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const tenantId = computed(() => currentTenant.value?.id ?? null)
  const tenantName = computed(() => currentTenant.value?.name ?? '')
  const isAuthenticated = computed(() => currentTenant.value !== null)

  function setTenant(tenant: Tenant) {
    currentTenant.value = tenant
    error.value = null
  }

  function clearTenant() {
    currentTenant.value = null
  }

  function setError(message: string) {
    error.value = message
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  return {
    // State
    currentTenant,
    isLoading,
    error,

    // Getters
    tenantId,
    tenantName,
    isAuthenticated,

    // Actions
    setTenant,
    clearTenant,
    setError,
    setLoading,
  }
})
