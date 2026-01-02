/**
 * features/contract-dialog/model/useContractEditor.ts
 *
 * Main composable that integrates Vue Query + XState
 * Provides the contract editing workflow with state management and API integration
 */

import type { Contract, ContractSection } from '@/entities/contract'
import { computed, nextTick } from 'vue'
import { validateDraftPreConditions } from '@/entities/contract'
import { useUserContextStore } from '@/shared/lib'
import { useToast } from '@/shared/ui'
import { buildValidationErrorMessage } from './contractEditor.helpers'
import { useContractEditorMutation } from './useContractEditor.mutation'
import { useContractEditorQuery } from './useContractEditor.query'

export function useContractEditor(contractId: string, locationId?: string) {
  const toast = useToast()
  const userContext = useUserContextStore()

  // Setup Vue Query and XState machine
  const { snapshot, send, isPending, isNewContract, draft } = useContractEditorQuery(
    contractId,
    locationId,
  )

  // Setup save mutation
  const saveMutation = useContractEditorMutation(send)

  // Computed values from machine state
  const activeTab = computed(() => snapshot.value?.context.activeTab ?? 'general')
  const dirty = computed(() => snapshot.value?.context.dirty ?? false)
  const validity = computed(
    () =>
      snapshot.value?.context.validity ?? {
        general: true,
        people: true,
        items: true,
        payments: true,
        review: true,
      },
  )
  const permissions = computed(
    () =>
      snapshot.value?.context.permissions ?? {
        canExecute: true,
        canFinalize: true,
        canVoid: false,
      },
  )
  const errorsByPath = computed(() => snapshot.value?.context.errorsByPath ?? {})
  const lastError = computed(() => snapshot.value?.context.lastError)
  const isSaving = computed(() => snapshot.value?.matches({ ready: 'saving' }) ?? false)

  const isLoadingState = computed(() => {
    // For new contracts, don't show loading if draft already exists
    if (isNewContract && draft.value) {
      return false
    }

    // If we have an error state, don't show loading
    if (snapshot.value?.matches('error')) {
      return false
    }

    // If we're in ready state with a draft, don't show loading
    if (snapshot.value?.matches('ready') && draft.value) {
      return false
    }

    // For existing contracts: show loading if machine is in loading state
    // OR if query is pending and we don't have a draft yet
    const machineLoading = snapshot.value?.matches('loading') ?? false
    const queryLoading = isPending.value ?? false

    // Show loading if:
    // 1. Machine is in loading state, OR
    // 2. Query is loading and we don't have a draft (for existing contracts)
    if (machineLoading) {
      return true
    }

    if (!isNewContract && queryLoading && !draft.value) {
      return true
    }

    return false
  })

  // Actions
  const setTab = (tab: ContractSection) => {
    send({ type: 'SET_TAB', tab })
  }

  const setField = (path: string, value: unknown) => {
    send({ type: 'UPDATE_FIELD', path, value })
  }

  const touchField = (path: string) => {
    send({ type: 'TOUCH_FIELD', path })
  }

  const validateSection = (section: ContractSection) => {
    send({ type: 'VALIDATE_SECTION', section })
  }

  const save = async () => {
    if (!draft.value) {
      toast.error('Cannot save: no contract data available')
      return undefined
    }

    // Validate draft pre-conditions (matches legacy preValidate behavior)
    // This includes: location type, sale date, date validations, deceased validations, etc.
    const preConditionErrors = validateDraftPreConditions(
      draft.value,
      userContext.currentLocationType,
    )

    if (preConditionErrors.errors.length > 0) {
      // Show first error or combine them
      const errorMessage =
        preConditionErrors.errors.length === 1
          ? (preConditionErrors.errors[0] ?? 'Validation failed')
          : `Please fix the following errors:\n${preConditionErrors.errors.join('\n')}`

      toast.error(errorMessage)
      return undefined
    }

    // Validate all sections first (Zod schema validation)
    send({ type: 'VALIDATE_ALL' })

    // Wait for Vue to update the reactive snapshot after XState action
    await nextTick()

    // Check validation (XState actions are synchronous, but Vue reactivity needs a tick)
    const currentValidity = snapshot.value?.context.validity ?? {
      general: true,
      people: true,
      items: true,
      payments: true,
      review: true,
    }
    const currentErrorsByPath = snapshot.value?.context.errorsByPath ?? {}
    const allValid = Object.values(currentValidity).every(Boolean)

    if (!allValid) {
      // Build user-friendly error message
      const errorMessage = buildValidationErrorMessage(currentValidity, currentErrorsByPath)

      toast.error(errorMessage)

      // Switch to the first invalid section tab to help user find the issue
      if (!currentValidity.general) {
        send({ type: 'SET_TAB', tab: 'general' })
      } else if (!currentValidity.people) {
        send({ type: 'SET_TAB', tab: 'people' })
      } else if (!currentValidity.items) {
        send({ type: 'SET_TAB', tab: 'items' })
      }

      return undefined
    }

    // All validations passed, proceed with save
    send({ type: 'SAVE' })
    return new Promise<Contract | undefined>((resolve) => {
      saveMutation.mutate(draft.value!, {
        onSuccess: (savedSession) => {
          // Return just the contract for callers that need it
          resolve(savedSession.contract)
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to save contract')
          resolve(undefined)
        },
      })
    })
  }

  const reset = () => {
    send({ type: 'RESET_DRAFT' })
  }

  // Helper to get errors for a specific path
  const errorsFor = (path: string): string[] => {
    const error = errorsByPath.value[path]
    return error ? [error] : []
  }

  return {
    // State
    draft,
    activeTab,
    dirty,
    validity,
    permissions,
    errorsByPath,
    lastError,
    isSaving,
    isLoading: isLoadingState,
    isNewContract: computed(() => isNewContract),

    // Actions
    setTab,
    setField,
    touchField,
    validateSection,
    save,
    reset,
    errorsFor,
  }
}
