/**
 * entities/case/model/caseStore.ts
 *
 * Pinia store for case state management
 */

import type { Case, CaseStatus } from './case'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockCases } from './mockData'

export const useCaseStore = defineStore('case', () => {
  // Initialize with mock data for development
  const cases = ref<Case[]>(mockCases)
  const currentCase = ref<Case | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const caseCount = computed(() => cases.value.length)

  const activeCases = computed(() =>
    cases.value.filter((c) => c.status === 'active' || c.status === 'in_progress'),
  )

  const pendingCases = computed(() => cases.value.filter((c) => c.status === 'pending'))

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

  // Actions
  function setCases(newCases: Case[]) {
    cases.value = newCases
  }

  function addCase(newCase: Case) {
    cases.value.push(newCase)
  }

  function updateCase(id: string, updates: Partial<Case>) {
    const index = cases.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      cases.value[index] = { ...cases.value[index], ...updates } as Case
    }
  }

  function removeCase(id: string) {
    cases.value = cases.value.filter((c) => c.id !== id)
  }

  function setCurrentCase(caseItem: Case | null) {
    currentCase.value = caseItem
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(message: string | null) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    cases,
    currentCase,
    isLoading,
    error,

    // Getters
    caseCount,
    activeCases,
    pendingCases,
    casesByStatus,

    // Actions
    setCases,
    addCase,
    updateCase,
    removeCase,
    setCurrentCase,
    setLoading,
    setError,
    clearError,
  }
})
