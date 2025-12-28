/**
 * Contract Session - Main composable for contract editing sessions
 *
 * This composable orchestrates the entire contract editing experience:
 * - Manages contract status with simple computed properties (like legacy app)
 * - Creates and coordinates handler composables (items, payments, people)
 * - Provides computed financials from handler data
 * - Handles save operations across all handlers
 * - Provides session context via Vue's provide/inject
 *
 * @see docs/data-models.md for Contract structure
 */

import { runEffect, runEffectQuery } from '@facts/effect'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, inject, type MaybeRefOrGetter, provide, ref, toValue, watch } from 'vue'
import { ContractApi } from '../api/contractApi'
import {
  type Contract,
  getCoBuyers,
  getPrimaryBeneficiary,
  getPrimaryBuyer,
  NeedType,
  SaleStatus,
  SaleType,
} from './contract'
import { ContractSaveModelBuilder } from './ContractSaveModelBuilder'
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
  const needType = ref<NeedType>(NeedType.AT_NEED)
  const contractDate = ref<string>(new Date().toISOString().split('T')[0] ?? '')
  const locationId = ref<string>('')

  // ==========================================================================
  // Status - Based on primary sale status (like backend)
  // ==========================================================================

  const saleStatus = ref<SaleStatus>(SaleStatus.DRAFT)
  const dateSigned = ref<string | undefined>(undefined)
  const dateExecuted = ref<string | undefined>(undefined)
  const isCancelled = ref(false)

  // Derived status booleans (matches legacy ContractSession pattern)
  const isExecuted = computed(() => saleStatus.value === SaleStatus.EXECUTED)
  const isVoided = computed(() => saleStatus.value === SaleStatus.VOID || isCancelled.value)
  const isFinalized = computed(
    () => saleStatus.value === SaleStatus.FINALIZED || saleStatus.value === SaleStatus.EXECUTED,
  )
  const hasFinalizedStatus = computed(() => saleStatus.value === SaleStatus.FINALIZED)
  const hasDraftStatus = computed(() => saleStatus.value === SaleStatus.DRAFT)

  // Editable = not executed and not voided (like legacy)
  const isEditable = computed(() => !isExecuted.value && !isVoided.value && hasDraftStatus.value)

  // ==========================================================================
  // Validation
  // ==========================================================================

  const hasRequiredFields = computed(() => people.hasPurchaser.value && people.hasBeneficiary.value)
  const hasSignature = computed(() => !!dateSigned.value)

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
  const statusComputed = computed(() => saleStatus.value)

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

  // For new contracts, set up a temporary sale context so items can be added before first save
  if (isNewContract.value) {
    items.setSaleContext('temp-sale-id', needType.value)
  }

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
    queryFn: async () => {
      const id = contractId.value
      console.log('[useContractSession] queryFn called with id:', id)
      if (!id || id === 'undefined') {
        throw new Error('No contract ID provided')
      }
      const result = await runEffectQuery(ContractApi.get(id))()
      console.log('[useContractSession] API returned:', result)
      console.log('[useContractSession] result.people:', result.people)
      console.log('[useContractSession] result.sales:', result.sales)
      return result
    },
    enabled: computed(() => {
      const id = contractId.value
      const enabled = !isNewContract.value && !!id && id !== 'undefined'
      console.log(
        '[useContractSession] query enabled:',
        enabled,
        'id:',
        id,
        'isNew:',
        isNewContract.value,
      )
      return enabled
    }),
  })

  // Apply server data to handlers when loaded
  watch(
    existingContract,
    (contract) => {
      console.log('[useContractSession] watch existingContract fired:', contract)
      if (contract) {
        // Get sale items from primary sale
        const primarySale = contract.sales?.find((s) => s.saleType === SaleType.CONTRACT)
        const saleItems = primarySale?.items ?? []
        console.log('[useContractSession] primarySale:', primarySale)
        console.log('[useContractSession] saleItems:', saleItems)

        // Set the sale context for items handler
        if (primarySale) {
          items.setSaleContext(primarySale.id, contract.needType)
        }

        // Apply data to handlers
        items.applyFromServer(saleItems)
        payments.applyFromServer(contract.payments ?? [])

        // Get people by role
        const contractPeople = contract.people ?? []
        console.log('[useContractSession] contractPeople:', contractPeople)
        const buyer = getPrimaryBuyer(contractPeople)
        const beneficiary = getPrimaryBeneficiary(contractPeople)
        const coBuyers = getCoBuyers(contractPeople)
        console.log('[useContractSession] buyer:', buyer)
        console.log('[useContractSession] beneficiary:', beneficiary)

        people.applyFromServer(buyer, beneficiary, coBuyers)
        console.log(
          '[useContractSession] after applyFromServer - purchaser:',
          people.purchaser.value,
        )

        // Apply metadata
        needType.value = contract.needType
        contractDate.value = contract.dateExecuted ?? contract.dateSigned ?? ''
        locationId.value = contract.locationId

        // Apply status from primary sale or contract state
        saleStatus.value = primarySale?.saleStatus ?? SaleStatus.DRAFT
        dateSigned.value = contract.dateSigned
        dateExecuted.value = contract.dateExecuted
        isCancelled.value = contract.isCancelled
      }
    },
    { immediate: true },
  )

  // ==========================================================================
  // Contract Number - From loaded contract
  // ==========================================================================

  const contractNumber = computed(() => existingContract.value?.contractNumber ?? '')

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
      saleStatus.value = SaleStatus.FINALIZED
    }
  }

  function execute() {
    if (canExecute.value) {
      saleStatus.value = SaleStatus.EXECUTED
      dateExecuted.value = new Date().toISOString()
    }
  }

  function voidContract(_reason = 'Voided by user') {
    if (canVoid.value) {
      saleStatus.value = SaleStatus.VOID
      // Note: voidReason would be stored separately if needed
    }
  }

  function backToDraft() {
    if (canBackToDraft.value) {
      saleStatus.value = SaleStatus.DRAFT
    }
  }

  // ==========================================================================
  // Save Operation - Helper Functions
  // ==========================================================================

  /**
   * Apply server response back to session (like legacy apply() pattern)
   * Updates all handlers with fresh server data after save
   */
  function applyServerResponse(contract: Contract): void {
    // Update metadata
    needType.value = contract.needType
    contractDate.value = contract.dateSigned ?? contract.dateExecuted ?? ''
    locationId.value = contract.locationId

    // Get primary sale and update items
    const primarySale = contract.sales?.find((s) => s.saleType === SaleType.CONTRACT)
    if (primarySale) {
      items.setSaleContext(primarySale.id, contract.needType)
      items.applyFromServer(primarySale.items ?? [])
      saleStatus.value = primarySale.saleStatus ?? SaleStatus.DRAFT
    }

    // Update payments
    payments.applyFromServer(contract.payments ?? [])

    // Apply people
    const buyer = getPrimaryBuyer(contract.people ?? [])
    const beneficiary = getPrimaryBeneficiary(contract.people ?? [])
    const coBuyers = getCoBuyers(contract.people ?? [])
    people.applyFromServer(buyer, beneficiary, coBuyers)

    // Update status fields
    dateSigned.value = contract.dateSigned
    dateExecuted.value = contract.dateExecuted
    isCancelled.value = contract.isCancelled
  }

  // ==========================================================================
  // Save Operation - Main Function
  // ==========================================================================

  async function save(): Promise<Contract | null> {
    if (isSaving.value) return null

    isSaving.value = true
    saveError.value = null

    try {
      // Build complete save model using builder (like legacy buildSaveModel)
      const saveModel = ContractSaveModelBuilder.buildSaveModel({
        contractId,
        contractNumber,
        status: saleStatus,
        needType,
        contractDate,
        locationId,
        items,
        payments,
        people,
      } as any)

      // Single API call to BFF
      const result = await runEffect(ContractApi.saveDraft(saveModel))

      // Apply response back to session (like legacy apply())
      applyServerResponse(result)

      // Mark all handlers as clean
      items.markClean()
      payments.markClean()
      people.markClean()

      // Invalidate queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['contracts'] })

      options.onSave?.(result)
      return result
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
    needType.value = NeedType.AT_NEED
    contractDate.value = new Date().toISOString().split('T')[0] ?? ''
    locationId.value = ''
    saveError.value = null
    saleStatus.value = SaleStatus.DRAFT
    dateSigned.value = undefined
    dateExecuted.value = undefined
    isCancelled.value = false
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Core state
    contractId,
    contractNumber,
    isNewContract,
    isLoading,
    isError,
    loadError,
    isSaving,
    saveError,

    // Contract metadata
    needType,
    contractDate,
    locationId,

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
