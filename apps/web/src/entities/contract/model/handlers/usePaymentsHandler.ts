/**
 * Payments Handler - Manages contract payments within a session
 *
 * Provides reactive state for contract payments with computed totals.
 * Part of the contract session - receives shared context via parameter.
 */

import type { ContractPayment, PaymentAllocation } from '../contract'
import type { ContractSessionContext } from '../contractSessionContext'
import { computed, ref } from 'vue'

export type PaymentMethod = 'cash' | 'check' | 'credit_card' | 'insurance' | 'financing' | 'other'

export interface PaymentFormData {
  date: string
  method: PaymentMethod
  amount: number
  reference?: string
  notes?: string
  allocations?: PaymentAllocation[]
}

export function usePaymentsHandler(context: ContractSessionContext) {
  // ==========================================================================
  // State
  // ==========================================================================

  const payments = ref<ContractPayment[]>([])
  const isDirty = ref(false)

  // ==========================================================================
  // Computed
  // ==========================================================================

  const total = computed(() => payments.value.reduce((sum, p) => sum + p.amount, 0))

  const paymentCount = computed(() => payments.value.length)

  const paymentsByMethod = computed(() => {
    const grouped: Record<PaymentMethod, ContractPayment[]> = {
      cash: [],
      check: [],
      credit_card: [],
      insurance: [],
      financing: [],
      other: [],
    }

    for (const payment of payments.value) {
      grouped[payment.method].push(payment)
    }

    return grouped
  })

  const totalByMethod = computed(() => {
    const totals: Record<PaymentMethod, number> = {
      cash: 0,
      check: 0,
      credit_card: 0,
      insurance: 0,
      financing: 0,
      other: 0,
    }

    for (const payment of payments.value) {
      totals[payment.method] += payment.amount
    }

    return totals
  })

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Add a new payment
   */
  function addPayment(data: PaymentFormData): ContractPayment {
    const newPayment: ContractPayment = {
      id: crypto.randomUUID(),
      contractId: context.contractId.value,
      date: data.date,
      method: data.method,
      amount: data.amount,
      reference: data.reference,
      notes: data.notes,
      allocations: data.allocations,
    }

    payments.value.push(newPayment)
    isDirty.value = true
    return newPayment
  }

  /**
   * Remove a payment by ID
   */
  function removePayment(paymentId: string): boolean {
    const index = payments.value.findIndex((p) => p.id === paymentId)
    if (index === -1) return false

    payments.value.splice(index, 1)
    isDirty.value = true
    return true
  }

  /**
   * Update payment amount
   */
  function updatePaymentAmount(paymentId: string, amount: number): boolean {
    const payment = payments.value.find((p) => p.id === paymentId)
    if (!payment) return false

    payment.amount = amount
    isDirty.value = true
    return true
  }

  /**
   * Update payment method
   */
  function updatePaymentMethod(paymentId: string, method: PaymentMethod): boolean {
    const payment = payments.value.find((p) => p.id === paymentId)
    if (!payment) return false

    payment.method = method
    isDirty.value = true
    return true
  }

  /**
   * Update payment reference
   */
  function updatePaymentReference(paymentId: string, reference: string): boolean {
    const payment = payments.value.find((p) => p.id === paymentId)
    if (!payment) return false

    payment.reference = reference
    isDirty.value = true
    return true
  }

  /**
   * Update payment notes
   */
  function updatePaymentNotes(paymentId: string, notes: string): boolean {
    const payment = payments.value.find((p) => p.id === paymentId)
    if (!payment) return false

    payment.notes = notes
    isDirty.value = true
    return true
  }

  /**
   * Update payment date
   */
  function updatePaymentDate(paymentId: string, date: string): boolean {
    const payment = payments.value.find((p) => p.id === paymentId)
    if (!payment) return false

    payment.date = date
    isDirty.value = true
    return true
  }

  /**
   * Update payment allocations
   */
  function updatePaymentAllocations(paymentId: string, allocations: PaymentAllocation[]): boolean {
    const payment = payments.value.find((p) => p.id === paymentId)
    if (!payment) return false

    payment.allocations = allocations
    isDirty.value = true
    return true
  }

  /**
   * Get a payment by ID
   */
  function getPayment(paymentId: string): ContractPayment | undefined {
    return payments.value.find((p) => p.id === paymentId)
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply payments from server data
   */
  function applyFromServer(serverPayments: ContractPayment[]) {
    payments.value = serverPayments.map((payment) => ({ ...payment }))
    isDirty.value = false
  }

  /**
   * Get current payments for saving
   */
  function getPayments(): ContractPayment[] {
    return payments.value.map((payment) => ({ ...payment }))
  }

  /**
   * Mark payments as clean (after save)
   */
  function markClean() {
    isDirty.value = false
  }

  /**
   * Reset to empty state
   */
  function reset() {
    payments.value = []
    isDirty.value = false
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (as computed for reactivity)
    payments: computed(() => payments.value),
    isDirty: computed(() => isDirty.value),

    // Computed
    total,
    paymentCount,
    paymentsByMethod,
    totalByMethod,

    // Actions
    addPayment,
    removePayment,
    updatePaymentAmount,
    updatePaymentMethod,
    updatePaymentReference,
    updatePaymentNotes,
    updatePaymentDate,
    updatePaymentAllocations,
    getPayment,

    // Session lifecycle
    applyFromServer,
    getPayments,
    markClean,
    reset,
  }
}

export type PaymentsHandler = ReturnType<typeof usePaymentsHandler>
