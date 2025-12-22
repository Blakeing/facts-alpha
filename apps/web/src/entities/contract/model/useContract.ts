/**
 * useContract - Single contract composable
 */

import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { contractApi } from '../api/contractApi'

export function useContract(contractId: MaybeRefOrGetter<string | null | undefined>) {
  const queryKey = computed(() => ['contract', toValue(contractId)] as const)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const id = toValue(contractId)
      if (!id) return null
      return contractApi.get(id)
    },
    enabled: computed(() => !!toValue(contractId)),
  })

  const contract = computed(() => data.value ?? null)
  const items = computed(() => data.value?.items ?? [])
  const payments = computed(() => data.value?.payments ?? [])

  // Financial summary
  const financials = computed(() => {
    if (!data.value) {
      return {
        subtotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: 0,
        amountPaid: 0,
        balanceDue: 0,
      }
    }
    return {
      subtotal: data.value.subtotal,
      taxTotal: data.value.taxTotal,
      discountTotal: data.value.discountTotal,
      grandTotal: data.value.grandTotal,
      amountPaid: data.value.amountPaid,
      balanceDue: data.value.balanceDue,
    }
  })

  return {
    contract,
    items,
    payments,
    financials,
    isLoading,
    error,
    reload: refetch,
  }
}
