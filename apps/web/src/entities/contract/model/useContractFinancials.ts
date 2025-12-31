/**
 * Contract Financials - Computed financial summary
 *
 * Computes financial totals from items and payments handlers.
 * Extracted from useContractSession for reusability.
 */

import type { ComputedRef } from 'vue'
import type { ItemsHandler } from './handlers/useItemsHandler'
import type { PaymentsHandler } from './handlers/usePaymentsHandler'
import { computed } from 'vue'

export interface ContractFinancials {
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  amountPaid: number
  balanceDue: number
}

/**
 * Computes financial summary from items and payments handlers
 */
export function useContractFinancials(
  items: ItemsHandler,
  payments: PaymentsHandler,
): ComputedRef<ContractFinancials> {
  const result = computed<ContractFinancials>(() => {
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
  return result
}
