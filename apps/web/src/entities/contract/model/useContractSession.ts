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

import type { ItemsHandler } from './handlers/useItemsHandler'
import type { PaymentsHandler } from './handlers/usePaymentsHandler'
import type { PeopleHandler } from './handlers/usePeopleHandler'
import { runEffect, runEffectQuery } from '@facts/effect'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  computed,
  type ComputedRef,
  inject,
  type InjectionKey,
  type MaybeRefOrGetter,
  provide,
  ref,
  type Ref,
  toValue,
  watch,
} from 'vue'
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
import { type ContractFormValues, getDefaultContractFormValues } from './contractSchema'
import { useItemsHandler } from './handlers/useItemsHandler'
import { usePaymentsHandler } from './handlers/usePaymentsHandler'
import { usePeopleHandler } from './handlers/usePeopleHandler'
import { type ContractFinancials, useContractFinancials } from './useContractFinancials'
import { useContractStatus } from './useContractStatus'

// =============================================================================
// Types
// =============================================================================

/**
 * Injection key for the full contract session
 *
 * Components should use useSession() helper for type-safe access.
 * Using 'any' here to avoid circular dependency - actual type comes from useContractSession.
 */
export const CONTRACT_SESSION_KEY: InjectionKey<any> = Symbol('contractSession')

/**
 * Full contract session interface - matches legacy ContractSession pattern
 * Handlers receive this to access full session state and other handlers
 */
export interface ContractSession {
  // Core IDs
  contractId: ComputedRef<string>
  contractNumber: ComputedRef<string>
  locationId: Ref<string>
  isNewContract: ComputedRef<boolean>

  // Loading state
  isLoading: ComputedRef<boolean>
  isError: ComputedRef<boolean>
  loadError: Ref<Error | null>
  isSaving: Ref<boolean>
  saveError: Ref<Error | null>

  // Contract metadata
  needType: Ref<NeedType>
  contractDate: Ref<string> // Date signed (on Contract)
  saleDate: Ref<string> // Sale/Service date (on Sale)
  prePrintedContractNumber: Ref<string>

  // Status
  status: ComputedRef<SaleStatus>
  isEditable: ComputedRef<boolean>
  isExecuted: ComputedRef<boolean>
  isVoided: ComputedRef<boolean>
  isFinalized: ComputedRef<boolean>
  hasFinalizedStatus: ComputedRef<boolean>
  hasDraftStatus: ComputedRef<boolean>

  // Can-do checks
  canSaveDraftOrFinal: ComputedRef<boolean>
  canFinalize: ComputedRef<boolean>
  canExecute: ComputedRef<boolean>
  canVoid: ComputedRef<boolean>
  canBackToDraft: ComputedRef<boolean>

  // Computed
  financials: ComputedRef<ContractFinancials>
  isDirty: ComputedRef<boolean>
  hasRequiredFields: ComputedRef<boolean>
  hasSignature: ComputedRef<boolean>

  // Handlers (cross-accessible like legacy)
  items: ItemsHandler
  payments: PaymentsHandler
  people: PeopleHandler

  // Status actions
  finalize: () => void
  execute: () => void
  voidContract: (reason?: string) => void
  backToDraft: () => void

  // Session actions
  save: () => Promise<Contract | null>
  reset: () => void
  toValidationData: () => ContractFormValues
}

export interface UseContractSessionOptions {
  /** Callback when contract is saved */
  onSave?: (contract: Contract) => void
  /** Callback when save fails */
  onSaveError?: (error: Error) => void
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
  const contractDate = ref<string>(new Date().toISOString().split('T')[0] ?? '') // Date signed
  const saleDate = ref<string>(new Date().toISOString().split('T')[0] ?? '') // Sale/Service date
  const locationId = ref<string>('')
  const prePrintedContractNumber = ref<string>('')

  // ==========================================================================
  // Status Management - Extracted to composable
  // ==========================================================================

  const status = useContractStatus()

  // ==========================================================================
  // Session Context - Create partial session object for handlers
  // ==========================================================================

  // Create partial session object (handlers will be attached later)
  const session = {
    // Core IDs
    contractId,
    contractNumber: computed(() => ''), // Will be set after query
    locationId,
    isNewContract,

    // Loading state (will be set after query)
    isLoading: computed(() => false),
    isError: computed(() => false),
    loadError: ref<Error | null>(null),
    isSaving,
    saveError,

    // Contract metadata
    needType,
    contractDate,
    saleDate,
    prePrintedContractNumber,

    // Status (from status composable)
    status: status.status,
    isEditable: status.isEditable,
    isExecuted: status.isExecuted,
    isVoided: status.isVoided,
    isFinalized: status.isFinalized,
    hasFinalizedStatus: status.hasFinalizedStatus,
    hasDraftStatus: status.hasDraftStatus,

    // Can-do checks (will be set after handlers)
    canSaveDraftOrFinal: computed(() => false),
    canFinalize: computed(() => false),
    canExecute: computed(() => false),
    canVoid: computed(() => false),
    canBackToDraft: computed(() => false),

    // Computed (will be set after handlers)
    financials: computed(() => ({
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
    })),
    isDirty: computed(() => false),
    hasRequiredFields: computed(() => false),
    hasSignature: computed(() => !!status.dateSigned.value),

    // Handlers (will be attached after creation)
    items: null as any,
    payments: null as any,
    people: null as any,

    // Status actions (will be set later)
    finalize: () => {},
    execute: () => {},
    voidContract: (_reason?: string) => {},
    backToDraft: () => {},

    // Session actions (will be set later)
    save: async () => null as Contract | null,
    reset: () => {},
    toValidationData: () => getDefaultContractFormValues(''),
  } as ContractSession

  // ==========================================================================
  // Handler Composables - Pass full session (like legacy)
  // ==========================================================================

  const items = useItemsHandler(session)
  const payments = usePaymentsHandler(session)
  const people = usePeopleHandler(session)

  // Attach handlers to session
  session.items = items
  session.payments = payments
  session.people = people

  // ==========================================================================
  // Validation
  // ==========================================================================

  const hasRequiredFields = computed(() => people.hasPurchaser.value && people.hasBeneficiary.value)
  const hasSignature = computed(() => !!status.dateSigned.value)

  // ==========================================================================
  // Can-do checks (like legacy: combines status + validation)
  // ==========================================================================

  // Can save as draft or finalize = not executed, not voided
  const canSaveDraftOrFinal = computed(() => !status.isExecuted.value && !status.isVoided.value)

  // Can finalize = can save + is in draft + has required fields
  const canFinalize = computed(
    () => canSaveDraftOrFinal.value && status.hasDraftStatus.value && hasRequiredFields.value,
  )

  // Can execute = can save + is finalized (not draft) + has signature
  const canExecute = computed(
    () => canSaveDraftOrFinal.value && status.hasFinalizedStatus.value && hasSignature.value,
  )

  // Can void = is finalized or executed (not draft, not already voided)
  const canVoid = computed(() => !status.isVoided.value && !status.hasDraftStatus.value)

  // Can go back to draft = is finalized (not executed, not voided)
  const canBackToDraft = computed(
    () => status.hasFinalizedStatus.value && !status.isExecuted.value && !status.isVoided.value,
  )

  // Update session with computed values
  session.canSaveDraftOrFinal = canSaveDraftOrFinal
  session.canFinalize = canFinalize
  session.canExecute = canExecute
  session.canVoid = canVoid
  session.canBackToDraft = canBackToDraft
  session.hasRequiredFields = hasRequiredFields
  session.hasSignature = hasSignature

  // For new contracts, set up a temporary sale context so items can be added before first save
  if (isNewContract.value) {
    items.setSaleContext('temp-sale-id', needType.value)
  }

  // Update session with computed values that depend on handlers
  session.hasRequiredFields = hasRequiredFields

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
        contractDate.value = contract.dateSigned ?? contract.dateExecuted ?? ''
        // Convert ISO datetime to date-only string for date picker
        const saleDateValue = primarySale?.saleDate
        saleDate.value = saleDateValue ? saleDateValue.split('T')[0] || '' : ''
        locationId.value = contract.locationId

        // Apply status from primary sale or contract state
        status.applyStatus(primarySale, contract)
      }
    },
    { immediate: true },
  )

  // ==========================================================================
  // Contract Number - From loaded contract
  // ==========================================================================

  const contractNumber = computed(() => existingContract.value?.contractNumber ?? '')
  session.contractNumber = contractNumber

  // Update session with query state (useQuery returns ComputedRef)
  session.isLoading = isLoading as ComputedRef<boolean>
  session.isError = isError as ComputedRef<boolean>
  session.loadError = loadError as Ref<Error | null>

  // ==========================================================================
  // Computed Financials - Derived from handlers (extracted to composable)
  // ==========================================================================

  const financials = useContractFinancials(items, payments)
  session.financials = financials

  // ==========================================================================
  // Dirty Tracking - Aggregated from all handlers
  // ==========================================================================

  const isDirty = computed(
    () => items.isDirty.value || payments.isDirty.value || people.isDirty.value,
  )
  session.isDirty = isDirty

  // ==========================================================================
  // Status Actions - From status composable
  // ==========================================================================

  // Attach status actions to session (from status composable)
  session.finalize = status.finalize
  session.execute = status.execute
  session.voidContract = status.voidContract
  session.backToDraft = status.backToDraft

  // ==========================================================================
  // Save Operation - Helper Functions
  // ==========================================================================

  /**
   * Apply server response back to session (like legacy apply() pattern)
   * Updates all handlers with fresh server data after save
   */
  function applyServerResponse(contract: Contract): void {
    // Get primary sale
    const primarySale = contract.sales?.find((s) => s.saleType === SaleType.CONTRACT)

    // Update metadata
    needType.value = contract.needType
    contractDate.value = contract.dateSigned ?? contract.dateExecuted ?? ''
    // Convert ISO datetime to date-only string for date picker
    const saleDateValue = primarySale?.saleDate
    saleDate.value = saleDateValue ? saleDateValue.split('T')[0] || '' : ''
    locationId.value = contract.locationId
    prePrintedContractNumber.value = contract.prePrintedContractNumber ?? ''

    // Update items from primary sale
    if (primarySale) {
      items.setSaleContext(primarySale.id, contract.needType)
      items.applyFromServer(primarySale.items ?? [])
    }

    // Update payments
    payments.applyFromServer(contract.payments ?? [])

    // Apply people
    const buyer = getPrimaryBuyer(contract.people ?? [])
    const beneficiary = getPrimaryBeneficiary(contract.people ?? [])
    const coBuyers = getCoBuyers(contract.people ?? [])
    people.applyFromServer(buyer, beneficiary, coBuyers)

    // Update status (from status composable)
    status.applyStatus(primarySale, contract)
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
        status: status.saleStatus,
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
    saleDate.value = new Date().toISOString().split('T')[0] ?? ''
    locationId.value = ''
    prePrintedContractNumber.value = ''
    saveError.value = null
    // Reset status (status composable manages its own state)
    status.saleStatus.value = SaleStatus.DRAFT
    status.dateSigned.value = undefined
    status.dateExecuted.value = undefined
    status.isCancelled.value = false
  }

  // ==========================================================================
  // Validation Data Conversion
  // ==========================================================================

  /**
   * Convert session state to ContractFormValues for validation
   * This allows useSessionValidator to validate session data against the schema
   */
  function toValidationData(): ContractFormValues {
    const peopleData = people.getFormValues()
    const defaults = getDefaultContractFormValues(locationId.value)

    return {
      locationId: locationId.value,
      prePrintedContractNumber: prePrintedContractNumber.value,
      needType: needType.value,
      atNeedType: defaults.atNeedType, // TODO: Add to session if needed
      salesPersonId: '', // TODO: Add to session if needed
      marketingAgentId: '', // TODO: Add to session if needed
      dateSigned: status.dateSigned.value ?? contractDate.value ?? '',
      isConditionalSale: false, // TODO: Add to session if needed
      primaryBuyer: peopleData.purchaser,
      coBuyers: peopleData.coBuyers,
      primaryBeneficiary: peopleData.beneficiary,
      additionalBeneficiaries: peopleData.additionalBeneficiaries,
      financing: defaults.financing, // TODO: Add financing handler if needed
      fundingDetails: defaults.fundingDetails, // TODO: Add funding details handler if needed
    }
  }

  // ==========================================================================
  // Attach Session Actions
  // ==========================================================================

  session.save = save
  session.reset = reset
  session.toValidationData = toValidationData

  // ==========================================================================
  // Provide and Return
  // ==========================================================================

  // Provide full session to child components via inject
  provide(CONTRACT_SESSION_KEY, session)

  return session
}

// =============================================================================
// Session Hook for Child Components
// =============================================================================

/**
 * Hook for child components to access the full contract session
 *
 * @throws Error if called outside of a ContractDialog
 */
export function useSession(): ContractSession {
  const session = inject(CONTRACT_SESSION_KEY) as ContractSession | undefined
  if (!session) {
    throw new Error('useSession must be used within ContractDialog')
  }
  return session
}

// =============================================================================
// Types Export
// =============================================================================

// ContractSession is defined as an interface above, not a type alias
// This ensures handlers can reference it before the composable is fully defined
