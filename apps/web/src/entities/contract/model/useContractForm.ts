/**
 * useContractForm - Contract form composable with mutations
 */

import type {
  ContractFormValues,
  ContractItemFormValues,
  ContractPaymentFormValues,
} from './contractSchema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { contractApi } from '../api/contractApi'
import { getDefaultContractFormValues } from './contractSchema'
import { CONTRACTS_QUERY_KEY } from './useContracts'

interface UseContractFormOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useContractForm(
  contractId: MaybeRefOrGetter<string | null | undefined>,
  options: UseContractFormOptions = {},
) {
  const queryClient = useQueryClient()
  const isEditing = computed(() => !!toValue(contractId))

  // Load existing contract for editing
  const { data: existingContract, isLoading: isLoadingInitial } = useQuery({
    queryKey: computed(() => ['contract', toValue(contractId)] as const),
    queryFn: () => {
      const id = toValue(contractId)
      return id ? contractApi.get(id) : null
    },
    enabled: isEditing,
  })

  // Initial form values
  const initialValues = computed(() => {
    if (!isEditing.value) {
      return getDefaultContractFormValues()
    }
    if (!existingContract.value) return null

    const c = existingContract.value
    return {
      type: c.type,
      status: c.status,
      caseId: c.caseId,
      date: c.date,
      signDate: c.signDate,
      prePrintedContractNumber: c.prePrintedContractNumber,
      purchaser: {
        id: c.purchaser.id,
        firstName: c.purchaser.firstName,
        middleName: c.purchaser.middleName,
        lastName: c.purchaser.lastName,
        phone: c.purchaser.phone,
        email: c.purchaser.email,
        address: c.purchaser.address,
        relationship: c.purchaser.relationship,
      },
      coBuyers: c.coBuyers.map((cb) => ({
        id: cb.id,
        firstName: cb.firstName,
        middleName: cb.middleName,
        lastName: cb.lastName,
        phone: cb.phone,
        email: cb.email,
        relationship: cb.relationship,
      })),
      beneficiary: {
        id: c.beneficiary.id,
        firstName: c.beneficiary.firstName,
        middleName: c.beneficiary.middleName,
        lastName: c.beneficiary.lastName,
        dateOfBirth: c.beneficiary.dateOfBirth,
        dateOfDeath: c.beneficiary.dateOfDeath,
      },
      salesPersonId: c.salesPersonId,
      notes: c.notes,
    } as ContractFormValues
  })

  // Save mutation (create or update)
  const saveMutation = useMutation({
    mutationFn: async (data: ContractFormValues) => {
      const id = toValue(contractId)
      if (isEditing.value && id) {
        return contractApi.update(id, data)
      }
      return contractApi.create(data)
    },
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
      const id = toValue(contractId)
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['contract', id] })
      }
      options.onSuccess?.()
    },
    onError: (error: Error) => {
      options.onError?.(error)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const id = toValue(contractId)
      if (!id) throw new Error('No contract ID')
      return contractApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
      options.onSuccess?.()
    },
    onError: (error: Error) => {
      options.onError?.(error)
    },
  })

  // Item mutations
  const addItemMutation = useMutation({
    mutationFn: async (data: ContractItemFormValues) => {
      const id = toValue(contractId)
      if (!id) throw new Error('No contract ID')
      return contractApi.addItem(id, data)
    },
    onSuccess: () => {
      const id = toValue(contractId)
      queryClient.invalidateQueries({ queryKey: ['contract', id] })
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const id = toValue(contractId)
      if (!id) throw new Error('No contract ID')
      return contractApi.removeItem(id, itemId)
    },
    onSuccess: () => {
      const id = toValue(contractId)
      queryClient.invalidateQueries({ queryKey: ['contract', id] })
    },
  })

  // Payment mutations
  const addPaymentMutation = useMutation({
    mutationFn: async (data: ContractPaymentFormValues) => {
      const id = toValue(contractId)
      if (!id) throw new Error('No contract ID')
      return contractApi.addPayment(id, data)
    },
    onSuccess: () => {
      const id = toValue(contractId)
      queryClient.invalidateQueries({ queryKey: ['contract', id] })
    },
  })

  const removePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const id = toValue(contractId)
      if (!id) throw new Error('No contract ID')
      return contractApi.removePayment(id, paymentId)
    },
    onSuccess: () => {
      const id = toValue(contractId)
      queryClient.invalidateQueries({ queryKey: ['contract', id] })
    },
  })

  return {
    // Form state
    isEditing,
    isLoadingInitial,
    initialValues,

    // Contract mutations
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    delete: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Item mutations
    addItem: addItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    isAddingItem: addItemMutation.isPending,

    // Payment mutations
    addPayment: addPaymentMutation.mutateAsync,
    removePayment: removePaymentMutation.mutateAsync,
    isAddingPayment: addPaymentMutation.isPending,

    // Combined busy state
    isBusy: computed(
      () =>
        saveMutation.isPending.value ||
        deleteMutation.isPending.value ||
        addItemMutation.isPending.value ||
        removeItemMutation.isPending.value ||
        addPaymentMutation.isPending.value ||
        removePaymentMutation.isPending.value,
    ),
  }
}
