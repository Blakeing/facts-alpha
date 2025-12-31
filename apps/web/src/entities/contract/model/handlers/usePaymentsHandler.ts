/**
 * Payments Handler - Manages contract payments within a session
 *
 * Provides reactive state for contract payments with computed totals.
 * Part of the contract session - receives shared context via parameter.
 *
 * @see docs/data-models.md for ContractPayment structure
 */

import type { ContractPayment } from '../contract'
import type { ContractSession } from '../useContractSession'
import { computed } from 'vue'
import { PaymentMethod } from '../contract'
import { createBaseHandler } from './createBaseHandler'

// PaymentFormData removed - using edit session pattern instead

export function usePaymentsHandler(session: ContractSession) {
  // ==========================================================================
  // Base Handler - Common state and operations
  // ==========================================================================

  const base = createBaseHandler<ContractPayment>({ session })

  // ==========================================================================
  // Computed
  // ==========================================================================

  const total = computed(() => base.items.value.reduce((sum, p) => sum + p.amount, 0))

  const paymentCount = computed(() => base.items.value.length)

  const paymentsByMethod = computed(() => {
    const grouped: Record<PaymentMethod, ContractPayment[]> = {
      [PaymentMethod.CASH]: [],
      [PaymentMethod.CHECK]: [],
      [PaymentMethod.CREDIT_CARD]: [],
      [PaymentMethod.ACH]: [],
      [PaymentMethod.INSURANCE]: [],
      [PaymentMethod.FINANCING]: [],
      [PaymentMethod.OTHER]: [],
    }

    for (const payment of base.items.value) {
      if (grouped[payment.method]) {
        grouped[payment.method].push(payment)
      }
    }

    return grouped
  })

  const totalByMethod = computed(() => {
    const totals: Record<PaymentMethod, number> = {
      [PaymentMethod.CASH]: 0,
      [PaymentMethod.CHECK]: 0,
      [PaymentMethod.CREDIT_CARD]: 0,
      [PaymentMethod.ACH]: 0,
      [PaymentMethod.INSURANCE]: 0,
      [PaymentMethod.FINANCING]: 0,
      [PaymentMethod.OTHER]: 0,
    }

    for (const payment of base.items.value) {
      if (totals[payment.method] !== undefined) {
        totals[payment.method] += payment.amount
      }
    }

    return totals
  })

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Add a new payment
   */
  function addPayment(): ContractPayment {
    const now = new Date().toISOString()
    const newPayment: ContractPayment = {
      id: '0',
      contractId: session.contractId.value || '',
      date: now.split('T')[0] || now, // Today's date
      method: PaymentMethod.CASH,
      amount: 0,
      dateCreated: now,
      dateLastModified: now,
    }

    base.addItem(newPayment)
    return newPayment
  }

  /**
   * Remove a payment by ID
   */
  function removePayment(paymentId: string): boolean {
    return base.removeById(paymentId)
  }

  /**
   * Get a payment by ID
   */
  function getPayment(paymentId: string): ContractPayment | undefined {
    return base.findById(paymentId)
  }

  /**
   * Apply an updated payment to canonical state
   * Finds the payment by ID and replaces it
   */
  function applyPaymentUpdate(payment: ContractPayment): boolean {
    return base.applyUpdate(payment)
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply payments from server data
   *
   * IMPORTANT: Deep clone server data to create mutable copies.
   * Vue Query returns readonly reactive proxies that cannot be mutated directly.
   */
  function applyFromServer(serverPayments: ContractPayment[]) {
    base.applyFromServer(serverPayments)
  }

  /**
   * Get current payments for saving
   */
  function getPayments(): ContractPayment[] {
    return base.getAll()
  }

  /**
   * Mark payments as clean (after save)
   */
  function markClean() {
    base.markClean()
  }

  /**
   * Reset to empty state
   */
  function reset() {
    base.reset()
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (from base handler)
    payments: base.items,
    isDirty: base.isDirty,

    // Computed
    total,
    paymentCount,
    paymentsByMethod,
    totalByMethod,

    // Actions
    addPayment,
    removePayment,
    getPayment,
    applyPaymentUpdate,

    // Session lifecycle
    applyFromServer,
    getPayments,
    markClean,
    reset,
  }
}

export type PaymentsHandler = ReturnType<typeof usePaymentsHandler>
