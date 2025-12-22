/**
 * useContractForm - Contract form composable with mutations
 */

import type {
  ContractFormValues,
  ContractItemFormValues,
  ContractPaymentFormValues,
} from './contractSchema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { contractApi } from '../api/contractApi'
import { getDefaultContractFormValues } from './contractSchema'
import { CONTRACTS_QUERY_KEY } from './useContracts'

interface UseContractFormOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useContractForm(contractId?: string | null, options: UseContractFormOptions = {}) {
  const queryClient = useQueryClient()
  const isEditing = !!contractId

  // Load existing contract for editing
  const { data: existingContract, isLoading: isLoadingInitial } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => (contractId ? contractApi.get(contractId) : null),
    enabled: isEditing,
  })

  // Initial form values
  const initialValues = computed(() => {
    if (!isEditing) {
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
      if (isEditing && contractId) {
        return contractApi.update(contractId, data)
      }
      return contractApi.create(data)
    },
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
      if (contractId) {
        queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
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
      if (!contractId) throw new Error('No contract ID')
      return contractApi.delete(contractId)
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
      if (!contractId) throw new Error('No contract ID')
      return contractApi.addItem(contractId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!contractId) throw new Error('No contract ID')
      return contractApi.removeItem(contractId, itemId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
    },
  })

  // Payment mutations
  const addPaymentMutation = useMutation({
    mutationFn: async (data: ContractPaymentFormValues) => {
      if (!contractId) throw new Error('No contract ID')
      return contractApi.addPayment(contractId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
    },
  })

  const removePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      if (!contractId) throw new Error('No contract ID')
      return contractApi.removePayment(contractId, paymentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
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
