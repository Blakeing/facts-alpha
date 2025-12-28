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
  ContractPersonRole,
  getCoBuyers,
  getPrimaryBeneficiary,
  getPrimaryBuyer,
  NeedType,
  SaleStatus,
  SaleType,
} from './contract'
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
    queryFn: runEffectQuery(ContractApi.get(contractId.value)),
    enabled: computed(() => !isNewContract.value && !!contractId.value),
  })

  // Apply server data to handlers when loaded
  watch(
    existingContract,
    (contract) => {
      if (contract) {
        // Get sale items from primary sale
        const primarySale = contract.sales?.find((s) => s.saleType === SaleType.CONTRACT)
        const saleItems = primarySale?.items ?? []

        // Set the sale context for items handler
        if (primarySale) {
          items.setSaleContext(primarySale.id, contract.needType)
        }

        // Apply data to handlers
        items.applyFromServer(saleItems)
        payments.applyFromServer(contract.payments ?? [])

        // Get people by role
        const contractPeople = contract.people ?? []
        const buyer = getPrimaryBuyer(contractPeople)
        const beneficiary = getPrimaryBeneficiary(contractPeople)
        const coBuyers = getCoBuyers(contractPeople)

        people.applyFromServer(buyer, beneficiary, coBuyers)

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
   * Build contract form data from current session state
   * (Similar to legacy ContractSaveModelBuilder.buildSaveModel)
   *
   * For updates, preserves existing contract fields that aren't being changed
   */
  function buildContractFormData() {
    const peopleData = people.getFormValues()
    const existing = existingContract.value

    return {
      locationId: locationId.value,
      // Preserve existing values for updates, use empty string as fallback for required fields
      prePrintedContractNumber: existing?.prePrintedContractNumber ?? '',
      needType: needType.value,
      dateSigned: contractDate.value || undefined,
      isConditionalSale: existing?.isConditionalSale ?? false,
      notes: existing?.notes ?? '',
      primaryBuyer: {
        firstName: peopleData.purchaser.firstName,
        lastName: peopleData.purchaser.lastName,
        middleName: peopleData.purchaser.middleName ?? '',
        prefix: '',
        suffix: '',
        nickname: '',
        companyName: '',
        phone: peopleData.purchaser.phone ?? '',
        email: peopleData.purchaser.email ?? '',
        address: peopleData.purchaser.address,
        dateOfBirth: peopleData.purchaser.dateOfBirth ?? '',
        dateOfDeath: peopleData.purchaser.dateOfDeath ?? '',
        nationalIdentifier: '',
        driversLicense: '',
        driversLicenseState: '',
        isVeteran: false,
        roles: [ContractPersonRole.PRIMARY_BUYER],
        addedAfterContractExecution: false,
      },
      coBuyers: peopleData.coBuyers.map((cb) => ({
        firstName: cb.firstName,
        lastName: cb.lastName,
        middleName: cb.middleName ?? '',
        prefix: '',
        suffix: '',
        nickname: '',
        companyName: '',
        phone: cb.phone ?? '',
        email: cb.email ?? '',
        address: cb.address,
        dateOfBirth: cb.dateOfBirth ?? '',
        dateOfDeath: cb.dateOfDeath ?? '',
        nationalIdentifier: '',
        driversLicense: '',
        driversLicenseState: '',
        isVeteran: false,
        roles: [ContractPersonRole.CO_BUYER],
        addedAfterContractExecution: false,
      })),
      primaryBeneficiary: {
        firstName: peopleData.beneficiary.firstName,
        lastName: peopleData.beneficiary.lastName,
        middleName: peopleData.beneficiary.middleName ?? '',
        prefix: '',
        suffix: '',
        nickname: '',
        companyName: '',
        phone: peopleData.beneficiary.phone ?? '',
        email: peopleData.beneficiary.email ?? '',
        address: peopleData.beneficiary.address,
        dateOfBirth: peopleData.beneficiary.dateOfBirth ?? '',
        dateOfDeath: peopleData.beneficiary.dateOfDeath ?? '',
        nationalIdentifier: '',
        driversLicense: '',
        driversLicenseState: '',
        isVeteran: false,
        roles: [ContractPersonRole.PRIMARY_BENEFICIARY],
        addedAfterContractExecution: false,
      },
      additionalBeneficiaries: [],
      fundingDetails: [],
      // Preserve existing contract fields for updates
      contractTypeId: existing?.contractTypeId,
      contractSaleTypeId: existing?.contractSaleTypeId,
      leadSourceId: existing?.leadSourceId,
      atNeedType: existing?.atNeedType,
      preNeedFundingType: existing?.preNeedFundingType,
      salesPersonId: existing?.salesPersonId,
      marketingAgentId: existing?.marketingAgentId,
      isCancelled: existing?.isCancelled ?? false,
      contractReferenceId: existing?.contractReferenceId,
      firstCallId: existing?.firstCallId,
      commentFeedOwnerId: existing?.commentFeedOwnerId,
      dateApproved: existing?.dateApproved,
    }
  }

  /**
   * Ensure primary sale exists for items/payments
   * Handles JSON Server timing issues by fetching or creating if needed
   */
  async function ensurePrimarySale(contract: Contract) {
    // 1. Check if sale exists in saved contract response
    let primarySale = contract.sales?.find((s) => s.saleType === SaleType.CONTRACT)

    // 2. If not found, fetch directly (handles JSON Server timing)
    if (!primarySale) {
      try {
        const sales = await runEffect(ContractApi.getSales(contract.id))
        primarySale = sales.find((s) => s.saleType === SaleType.CONTRACT)
      } catch {
        // Silently continue - will create new sale below
      }
    }

    // 3. If still missing, create it
    if (!primarySale) {
      try {
        const now = new Date().toISOString()
        const saleNumber = `S-${contract.contractNumber.split('-')[1]}-${contract.contractNumber.split('-')[2]}`
        primarySale = await runEffect(
          ContractApi.addSale(contract.id, {
            saleNumber,
            saleDate: contract.dateSigned || now,
            saleType: SaleType.CONTRACT,
            saleStatus: SaleStatus.DRAFT,
            accountingPeriod: new Date(now).toISOString().split('T')[0],
            memo: '',
            items: [],
          }),
        )
      } catch {
        // Failed to create primary sale - items/payments won't be saved
      }
    }

    return primarySale || null
  }

  /**
   * Persist new and modified items to the server
   */
  async function persistNewItems(contractId: string, saleId: string): Promise<void> {
    // Save new items (not yet on server)
    const newItems = items.getNewItems()
    for (const item of newItems) {
      try {
        await runEffect(
          ContractApi.addSaleItem(contractId, saleId, {
            itemId: item.itemId,
            description: item.description,
            needType: item.needType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            bookPrice: item.bookPrice,
            cost: item.cost,
            bookCost: item.bookCost,
            size: item.size,
            statedCare: item.statedCare,
            salesTaxEnabled: item.salesTaxEnabled,
            serialNumber: item.serialNumber,
            isCancelled: item.isCancelled,
            ordinal: item.ordinal,
            sku: item.sku,
            itemDescription: item.itemDescription,
            itemType: item.itemType,
            salesTax: item.salesTax,
            discounts: item.discounts,
            trust: item.trust,
          }),
        )
      } catch {
        // Continue with other items even if one fails
      }
    }

    // Update modified items (existed on server, now changed)
    const modifiedItems = items.getModifiedItems()
    for (const item of modifiedItems) {
      try {
        await runEffect(
          ContractApi.updateSaleItem(contractId, saleId, item.id, {
            itemId: item.itemId,
            description: item.description,
            needType: item.needType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            bookPrice: item.bookPrice,
            cost: item.cost,
            bookCost: item.bookCost,
            size: item.size,
            statedCare: item.statedCare,
            salesTaxEnabled: item.salesTaxEnabled,
            serialNumber: item.serialNumber,
            isCancelled: item.isCancelled,
            ordinal: item.ordinal,
            sku: item.sku,
            itemDescription: item.itemDescription,
            itemType: item.itemType,
            salesTax: item.salesTax,
            discounts: item.discounts,
            trust: item.trust,
          }),
        )
      } catch {
        // Continue with other items even if one fails
      }
    }
  }

  /**
   * Persist new and modified payments to the server
   */
  async function persistNewPayments(contractId: string): Promise<void> {
    // Save new payments (not yet on server)
    const newPayments = payments.getNewPayments()
    for (const payment of newPayments) {
      try {
        await runEffect(
          ContractApi.addPayment(contractId, {
            date: payment.date,
            method: payment.method,
            amount: payment.amount,
            reference: payment.reference || '',
            checkNumber: payment.checkNumber || '',
            notes: payment.notes || '',
          }),
        )
      } catch {
        // Continue with other payments even if one fails
      }
    }

    // Update modified payments (existed on server, now changed)
    const modifiedPayments = payments.getModifiedPayments()
    for (const payment of modifiedPayments) {
      try {
        await runEffect(
          ContractApi.updatePayment(contractId, payment.id, {
            date: payment.date,
            method: payment.method,
            amount: payment.amount,
            reference: payment.reference || '',
            checkNumber: payment.checkNumber || '',
            notes: payment.notes || '',
          }),
        )
      } catch {
        // Continue with other payments even if one fails
      }
    }
  }

  /**
   * Persist people changes (new and modified)
   */
  async function persistPeopleChanges(contractId: string): Promise<void> {
    const peopleData = people.getFormValues()

    // Helper to save/update a person
    const savePerson = async (person: any, roles: ContractPersonRole[]) => {
      const personData = {
        firstName: person.firstName,
        lastName: person.lastName,
        middleName: person.middleName ?? '',
        prefix: '',
        suffix: '',
        nickname: '',
        companyName: '',
        phone: person.phone ?? '',
        email: person.email ?? '',
        address: person.address,
        dateOfBirth: person.dateOfBirth ?? '',
        dateOfDeath: person.dateOfDeath ?? '',
        nationalIdentifier: '',
        driversLicense: '',
        driversLicenseState: '',
        isVeteran: false,
        roles,
        addedAfterContractExecution: false,
      }

      // Check if this person is new or existing
      await (people.isPersonNew(person.id)
        ? runEffect(ContractApi.addPerson(contractId, personData))
        : runEffect(ContractApi.updatePerson(contractId, person.id, personData)))
    }

    // Save/update purchaser
    try {
      await savePerson(peopleData.purchaser, [ContractPersonRole.PRIMARY_BUYER])
    } catch {
      // Failed to save/update purchaser
    }

    // Save/update beneficiary
    try {
      await savePerson(peopleData.beneficiary, [ContractPersonRole.PRIMARY_BENEFICIARY])
    } catch {
      // Failed to save/update beneficiary
    }

    // Save/update co-buyers
    for (const coBuyer of peopleData.coBuyers) {
      try {
        await savePerson(coBuyer, [ContractPersonRole.CO_BUYER])
      } catch {
        // Failed to save/update co-buyer
      }
    }
  }

  // ==========================================================================
  // Save Operation - Main Function
  // ==========================================================================

  async function save(): Promise<Contract | null> {
    if (isSaving.value) return null

    isSaving.value = true
    saveError.value = null

    try {
      // 1. Build form data
      const data = buildContractFormData()

      // 2. Save contract
      const savedContract = await runEffect(
        isNewContract.value ? ContractApi.create(data) : ContractApi.update(contractId.value, data),
      )

      // 3. Ensure primary sale exists
      const primarySale = await ensurePrimarySale(savedContract)

      if (primarySale) {
        // 4. Update sale status if it has changed
        if (primarySale.saleStatus !== saleStatus.value) {
          try {
            await runEffect(
              ContractApi.updateSale(savedContract.id, primarySale.id, {
                saleStatus: saleStatus.value,
              }),
            )
          } catch {
            // Failed to update sale status - continue with other saves
          }
        }

        // 5. Persist new items and payments
        await persistNewItems(savedContract.id, primarySale.id)
        await persistNewPayments(savedContract.id)

        // 6. Persist people changes
        await persistPeopleChanges(savedContract.id)

        // 7. Refetch contract to get updated items/payments/status from server
        const updatedContract = await runEffect(ContractApi.get(savedContract.id))

        // Update handlers with fresh server data
        const updatedPrimarySale = updatedContract.sales?.find(
          (s) => s.saleType === SaleType.CONTRACT,
        )
        if (updatedPrimarySale) {
          // Update sale context for items handler
          items.setSaleContext(updatedPrimarySale.id, updatedContract.needType)
          items.applyFromServer(updatedPrimarySale.items ?? [])
          payments.applyFromServer(updatedContract.payments ?? [])

          // Sync status from server (in case it was updated)
          saleStatus.value = updatedPrimarySale.saleStatus ?? SaleStatus.DRAFT
        }
      }
      // If no primary sale found, items/payments won't be saved

      // 8. Mark all handlers as clean
      items.markClean()
      payments.markClean()
      people.markClean()

      // 7. Refetch queries to ensure fresh data before navigation
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['contracts'] }),
        queryClient.refetchQueries({ queryKey: ['contract', savedContract.id] }),
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
