/**
 * Contract Status Management - Extracted from useContractSession
 *
 * Manages contract status state and derived booleans, matching legacy
 * ContractSession pattern where status is derived from primary sale.
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import { type Contract, type Sale, SaleStatus } from './contract'

export interface ContractStatusReturn {
  // State
  saleStatus: Ref<SaleStatus>
  dateSigned: Ref<string | undefined>
  dateExecuted: Ref<string | undefined>
  isCancelled: Ref<boolean>

  // Derived booleans (like legacy ContractSession)
  status: ComputedRef<SaleStatus>
  isExecuted: ComputedRef<boolean>
  isVoided: ComputedRef<boolean>
  isFinalized: ComputedRef<boolean>
  hasFinalizedStatus: ComputedRef<boolean>
  hasDraftStatus: ComputedRef<boolean>
  isEditable: ComputedRef<boolean>

  // Status actions
  finalize: () => void
  execute: () => void
  voidContract: (reason?: string) => void
  backToDraft: () => void

  // Apply from server
  applyStatus: (sale: Sale | undefined, contract: Contract) => void
}

export function useContractStatus(): ContractStatusReturn {
  // ==========================================================================
  // State
  // ==========================================================================

  const saleStatus = ref<SaleStatus>(SaleStatus.DRAFT)
  const dateSigned = ref<string | undefined>(undefined)
  const dateExecuted = ref<string | undefined>(undefined)
  const isCancelled = ref(false)

  // ==========================================================================
  // Derived Status Booleans (matches legacy ContractSession pattern)
  // ==========================================================================

  const status = computed(() => saleStatus.value)

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
  // Status Actions - Simple status updates (like legacy setters)
  // ==========================================================================

  function finalize(): void {
    if (hasDraftStatus.value && !isVoided.value) {
      saleStatus.value = SaleStatus.FINALIZED
    }
  }

  function execute(): void {
    if (hasFinalizedStatus.value && !isVoided.value && dateSigned.value) {
      saleStatus.value = SaleStatus.EXECUTED
      dateExecuted.value = new Date().toISOString()
    }
  }

  function voidContract(_reason = 'Voided by user'): void {
    if (!isVoided.value && !hasDraftStatus.value) {
      saleStatus.value = SaleStatus.VOID
      // Note: voidReason would be stored separately if needed
    }
  }

  function backToDraft(): void {
    if (hasFinalizedStatus.value && !isExecuted.value && !isVoided.value) {
      saleStatus.value = SaleStatus.DRAFT
    }
  }

  // ==========================================================================
  // Apply Status from Server
  // ==========================================================================

  /**
   * Apply status from server data (sale and contract)
   */
  function applyStatus(sale: Sale | undefined, contract: Contract): void {
    // Apply status from primary sale or contract state
    saleStatus.value = sale?.saleStatus ?? SaleStatus.DRAFT
    dateSigned.value = contract.dateSigned
    dateExecuted.value = contract.dateExecuted
    isCancelled.value = contract.isCancelled
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State
    saleStatus,
    dateSigned,
    dateExecuted,
    isCancelled,

    // Derived booleans
    status,
    isExecuted,
    isVoided,
    isFinalized,
    hasFinalizedStatus,
    hasDraftStatus,
    isEditable,

    // Status actions
    finalize,
    execute,
    voidContract,
    backToDraft,

    // Apply from server
    applyStatus,
  }
}
