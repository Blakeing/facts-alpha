/**
 * features/contract-dialog/model/useContractEditor.mutation.ts
 *
 * Save mutation logic for contract editor
 */

import type { ContractEditorEvent } from './contractEditor'
import type { Contract, ContractDraft } from '@/entities/contract'
import { runEffect } from '@facts/effect'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ContractApi } from '@/entities/contract'
import { buildSaveModel } from './contractEditor.helpers'

/**
 * Create save mutation for contract editor
 */
export function useContractEditorMutation(send: (event: ContractEditorEvent) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (draft: ContractDraft) => {
      // Build the save model structure expected by backend (async for ID generation)
      const saveModel = await buildSaveModel(draft)

      // Step 1: Validate the contract - backend stores it and returns a token
      const validation = await runEffect(ContractApi.validateDraft(saveModel))

      // Check for validation errors from backend
      if (validation.errors && validation.errors.length > 0) {
        throw new Error(validation.errors.join('\n'))
      }

      if (!validation.saveToken) {
        throw new Error('Validation did not return a save token')
      }

      // Step 2: Save with the token
      return await runEffect(ContractApi.saveDraft(validation.saveToken))
    },
    onSuccess: (savedContract) => {
      queryClient.setQueryData(['contract', savedContract.id], savedContract)
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      send({ type: 'SAVE_SUCCESS', contract: savedContract })
      return savedContract
    },
    onError: (error: Error) => {
      // Use error message directly - backend validation errors are already in message
      const errorMessage = error.message || 'Failed to save contract'
      send({ type: 'SAVE_ERROR', message: errorMessage })
    },
  })
}
