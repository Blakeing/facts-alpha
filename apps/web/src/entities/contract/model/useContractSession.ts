/**
 * Contract Session - Main composable for contract editing sessions
 *
 * This composable orchestrates the entire contract editing experience:
 * - Manages contract status with simple computed properties (like legacy app)
 * - Creates and coordinates handler composables (items, payments, people)
 * - Provides computed financials from handler data
 * - Handles save operations across all handlers
 * - Provides session context via Vue's provide/inject
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, inject, type MaybeRefOrGetter, provide, ref, toValue, watch } from 'vue'
import { contractApi } from '../api/contractApi'
import { type Contract, ContractStatus, ContractType } from './contract'
import { CONTRACT_SESSION_KEY, type ContractSessionContext } from './contractSessionContext'
import { useItemsHandler } from './handlers/useItemsHandler'
import { usePaymentsHandler } from './handlers/usePaymentsHandler'
import { usePeopleHandler } from './handlers/usePeopleHandler'

// =============================================================================
// Types
// =============================================================================

export interface UseContractSessionOptions {
  /** Callback when contract is saved */
  onSave?: (contract: Contract) => void
  /** Callback when save fails */
  onSaveError?: (error: Error) => void
}

export interface ContractFinancials {
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  amountPaid: number
  balanceDue: number
}

// =============================================================================
// Main Composable
// =============================================================================

export function useContractSession(
  contractIdRef: MaybeRefOrGetter<string | null | undefined>,
  options: UseContractSessionOptions = {},
) {
  const queryClient = useQueryClient()

  // ==========================================================================
  // Core State
  // ==========================================================================

  const contractId = computed(() => toValue(contractIdRef) ?? '')
  const isNewContract = computed(() => !toValue(contractIdRef))
  const isSaving = ref(false)
  const saveError = ref<Error | null>(null)

  // Contract metadata
  const contractType = ref<ContractType>(ContractType.AT_NEED_FUNERAL)
  const contractDate = ref<string>(new Date().toISOString().split('T')[0] ?? '')
  const caseId = ref<string | undefined>(undefined)

  // ==========================================================================
  // Status - Simple ref, server is source of truth (like legacy app)
  // ==========================================================================

  const status = ref<ContractStatus>(ContractStatus.DRAFT)
  const signDate = ref<string | undefined>(undefined)

  // Derived status booleans (matches legacy ContractSession pattern)
  const isExecuted = computed(() => status.value === ContractStatus.EXECUTED)
  const isVoided = computed(
    () => status.value === ContractStatus.VOID || status.value === ContractStatus.CANCELLED,
  )
  const isFinalized = computed(
    () => status.value === ContractStatus.FINALIZED || status.value === ContractStatus.EXECUTED,
  )
  const hasFinalizedStatus = computed(() => status.value === ContractStatus.FINALIZED)
  const hasDraftStatus = computed(() => status.value === ContractStatus.DRAFT)

  // Editable = not executed and not voided (like legacy)
  const isEditable = computed(() => !isExecuted.value && !isVoided.value && hasDraftStatus.value)

  // ==========================================================================
  // Validation
  // ==========================================================================

  const hasRequiredFields = computed(() => people.hasPurchaser.value && people.hasBeneficiary.value)
  const hasSignature = computed(() => !!signDate.value)

  // ==========================================================================
  // Can-do checks (like legacy: combines status + validation)
  // ==========================================================================

  // Can save as draft or finalize = not executed, not voided
  const canSaveDraftOrFinal = computed(() => !isExecuted.value && !isVoided.value)

  // Can finalize = can save + is in draft + has required fields
  const canFinalize = computed(
    () => canSaveDraftOrFinal.value && hasDraftStatus.value && hasRequiredFields.value,
  )

  // Can execute = can save + is finalized (not draft) + has signature
  const canExecute = computed(
    () => canSaveDraftOrFinal.value && hasFinalizedStatus.value && hasSignature.value,
  )

  // Can void = is finalized or executed (not draft, not already voided)
  const canVoid = computed(() => !isVoided.value && !hasDraftStatus.value)

  // Can go back to draft = is finalized (not executed, not voided)
  const canBackToDraft = computed(
    () => hasFinalizedStatus.value && !isExecuted.value && !isVoided.value,
  )

  // ==========================================================================
  // Session Context - Shared with handlers via provide/inject
  // ==========================================================================

  // Need to create a computed for status to pass to context
  const statusComputed = computed(() => status.value)

  const context: ContractSessionContext = {
    contractId,
    isNewContract,
    status: statusComputed,
    isEditable,
  }

  // Provide context to child components
  provide(CONTRACT_SESSION_KEY, context)

  // ==========================================================================
  // Handler Composables
  // ==========================================================================

  const items = useItemsHandler(context)
  const payments = usePaymentsHandler(context)
  const people = usePeopleHandler(context)

  // ==========================================================================
  // Query for Existing Contract
  // ==========================================================================

  const {
    data: existingContract,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: computed(() => ['contract', contractId.value] as const),
    queryFn: () => contractApi.get(contractId.value),
    enabled: computed(() => !isNewContract.value && !!contractId.value),
  })

  // Apply server data to handlers when loaded
  watch(
    existingContract,
    (contract) => {
      if (contract) {
        // Apply data to handlers
        items.applyFromServer(contract.items ?? [])
        payments.applyFromServer(contract.payments ?? [])
        people.applyFromServer(contract.purchaser, contract.beneficiary, contract.coBuyers)

        // Apply metadata
        contractType.value = contract.type
        contractDate.value = contract.date
        caseId.value = contract.caseId

        // Apply status directly from server (source of truth)
        status.value = contract.status
        signDate.value = contract.signDate
      }
    },
    { immediate: true },
  )

  // ==========================================================================
  // Computed Financials - Derived from handlers
  // ==========================================================================

  const financials = computed<ContractFinancials>(() => {
    const grandTotal = items.subtotal.value + items.taxTotal.value - items.discountTotal.value
    return {
      subtotal: items.subtotal.value,
      taxTotal: items.taxTotal.value,
      discountTotal: items.discountTotal.value,
      grandTotal,
      amountPaid: payments.total.value,
      balanceDue: grandTotal - payments.total.value,
    }
  })

  // ==========================================================================
  // Dirty Tracking - Aggregated from all handlers
  // ==========================================================================

  const isDirty = computed(
    () => items.isDirty.value || payments.isDirty.value || people.isDirty.value,
  )

  // ==========================================================================
  // Status Actions - Simple status updates (like legacy setters)
  // ==========================================================================

  function finalize() {
    if (canFinalize.value) {
      status.value = ContractStatus.FINALIZED
    }
  }

  function execute() {
    if (canExecute.value) {
      status.value = ContractStatus.EXECUTED
    }
  }

  function voidContract(_reason = 'Voided by user') {
    if (canVoid.value) {
      status.value = ContractStatus.VOID
      // Note: voidReason would be stored separately if needed
    }
  }

  function backToDraft() {
    if (canBackToDraft.value) {
      status.value = ContractStatus.DRAFT
    }
  }

  // ==========================================================================
  // Save Operation
  // ==========================================================================

  async function save(): Promise<Contract | null> {
    if (isSaving.value) return null

    isSaving.value = true
    saveError.value = null

    try {
      const peopleData = people.getFormValues()

      const data = {
        type: contractType.value,
        status: status.value,
        date: contractDate.value,
        caseId: caseId.value,
        purchaser: {
          firstName: peopleData.purchaser.firstName,
          lastName: peopleData.purchaser.lastName,
          middleName: peopleData.purchaser.middleName,
          phone: peopleData.purchaser.phone,
          email: peopleData.purchaser.email,
          address: peopleData.purchaser.address,
          relationship: peopleData.purchaser.relationship,
          dateOfBirth: peopleData.purchaser.dateOfBirth,
          dateOfDeath: peopleData.purchaser.dateOfDeath,
        },
        beneficiary: {
          firstName: peopleData.beneficiary.firstName,
          lastName: peopleData.beneficiary.lastName,
          middleName: peopleData.beneficiary.middleName,
          phone: peopleData.beneficiary.phone,
          email: peopleData.beneficiary.email,
          address: peopleData.beneficiary.address,
          relationship: peopleData.beneficiary.relationship,
          dateOfBirth: peopleData.beneficiary.dateOfBirth,
          dateOfDeath: peopleData.beneficiary.dateOfDeath,
        },
        coBuyers: peopleData.coBuyers.map((cb) => ({
          firstName: cb.firstName,
          lastName: cb.lastName,
          middleName: cb.middleName,
          phone: cb.phone,
          email: cb.email,
          address: cb.address,
          relationship: cb.relationship,
          dateOfBirth: cb.dateOfBirth,
          dateOfDeath: cb.dateOfDeath,
        })),
      }

      const savedContract = await (isNewContract.value
        ? contractApi.create(data)
        : contractApi.update(contractId.value, data))

      // Mark all handlers as clean
      items.markClean()
      payments.markClean()
      people.markClean()

      // Refetch queries to ensure fresh data before navigation
      // Using refetchQueries instead of invalidateQueries to wait for completion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['contracts'] }),
        queryClient.refetchQueries({ queryKey: ['contract', contractId.value] }),
      ])

      options.onSave?.(savedContract)
      return savedContract
    } catch (error_) {
      const error = error_ instanceof Error ? error_ : new Error('Failed to save contract')
      saveError.value = error
      options.onSaveError?.(error)
      return null
    } finally {
      isSaving.value = false
    }
  }

  // ==========================================================================
  // Reset Session
  // ==========================================================================

  function reset() {
    items.reset()
    payments.reset()
    people.reset()
    contractType.value = ContractType.AT_NEED_FUNERAL
    contractDate.value = new Date().toISOString().split('T')[0] ?? ''
    caseId.value = undefined
    saveError.value = null
    status.value = ContractStatus.DRAFT
    signDate.value = undefined
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Core state
    contractId,
    isNewContract,
    isLoading,
    isError,
    loadError,
    isSaving,
    saveError,

    // Contract metadata
    contractType,
    contractDate,
    caseId,

    // Status (simple ref + derived booleans)
    status: statusComputed,
    isEditable,
    isExecuted,
    isVoided,
    isFinalized,
    hasFinalizedStatus,
    hasDraftStatus,

    // Can-do checks
    canSaveDraftOrFinal,
    canFinalize,
    canExecute,
    canVoid,
    canBackToDraft,

    // Computed
    financials,
    isDirty,
    hasRequiredFields,
    hasSignature,

    // Handlers (expose full handler objects)
    items,
    payments,
    people,

    // Status actions
    finalize,
    execute,
    voidContract,
    backToDraft,

    // Session actions
    save,
    reset,
  }
}

// =============================================================================
// Context Hook for Child Components
// =============================================================================

/**
 * Hook for child components to access the contract session context
 *
 * @throws Error if called outside of a contract session
 */
export function useContractSessionContext(): ContractSessionContext {
  const context = inject(CONTRACT_SESSION_KEY)
  if (!context) {
    throw new Error('useContractSessionContext must be used within a ContractSession provider')
  }
  return context
}

// =============================================================================
// Types Export
// =============================================================================

export type ContractSession = ReturnType<typeof useContractSession>
