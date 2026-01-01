/**
 * features/contract-dialog/model/useContractEditor.ts
 *
 * Main composable that integrates Vue Query + XState
 * Provides the contract editing workflow with state management and API integration
 */

import type {
  Contract,
  ContractDraft,
  ContractSection,
  ContractSessionSaveModel,
} from '@/entities/contract'
import { runEffect, runEffectQuery } from '@facts/effect'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useMachine } from '@xstate/vue'
import { computed, nextTick, watch } from 'vue'
import { draftToContract, validateDraftPreConditions } from '@/entities/contract'
import { ContractApi } from '@/entities/contract/api/contractApi'
import { nextIds } from '@/shared/api'
import { EntityState } from '@/shared/lib/entity'
import { useToast } from '@/shared/ui'
import { useUserContextStore } from '@/stores/userContext'
import { contractEditorMachine } from './contractEditor.machine'

/**
 * Build a ContractSessionSaveModel from a ContractDraft
 * This matches the structure expected by the backend validate/save endpoints
 */
async function buildSaveModel(draft: ContractDraft): Promise<ContractSessionSaveModel> {
  const contractData = draftToContract(draft)
  const isNew = !contractData.id || contractData.id === 'new'

  // For new contracts, we need to generate IDs for the comment feed
  let commentFeedId = '0'
  let commentFeedOwnerId = contractData.commentFeedOwnerId || '0'

  if (isNew) {
    // Generate 2 IDs: one for the comment feed, one for its owner
    const ids = await runEffect(nextIds(2))
    commentFeedId = ids[0]
    commentFeedOwnerId = ids[1]
  }

  return {
    executeContract: false, // Draft save - no execution
    finalizeContract: false, // Draft save - no finalization
    voidContract: false, // Not voiding
    contract: {
      id: contractData.id,
      locationId: contractData.locationId || '',
      needType: contractData.needType,
      dateSigned: contractData.dateSigned,
      dateExecuted: contractData.dateExecuted,
      contractNumber: contractData.contractNumber,
      prePrintedContractNumber: contractData.prePrintedContractNumber,
      isConditionalSale: contractData.isConditionalSale,
      isCancelled: contractData.isCancelled,
      notes: contractData.notes,
      people: contractData.people || [],
      sales: contractData.sales || [],
      financing: contractData.financing,
      contractTypeId: contractData.contractTypeId,
      contractSaleTypeId: contractData.contractSaleTypeId,
      leadSourceId: contractData.leadSourceId,
      atNeedType: contractData.atNeedType,
      preNeedFundingType: contractData.preNeedFundingType,
      salesPersonId: contractData.salesPersonId,
      marketingAgentId: contractData.marketingAgentId,
      contractReferenceId: contractData.contractReferenceId,
      firstCallId: contractData.firstCallId,
      commentFeedOwnerId,
    },
    payments: (contractData.payments || []).map((payment) => ({
      state: payment.id ? EntityState.Modified : EntityState.New,
      payment,
    })),
    // Required by backend - comment feed for contract notes
    commentFeed: {
      id: commentFeedId,
      feedType: 'Contract',
      ownerId: commentFeedOwnerId,
      entries: [],
    },
    // Required by backend - serialized to contract.contractData
    data: {
      forms: [],
      attributeValues: {},
      nonMappedFormValues: {},
      commissionLog: {},
      trustLog: {},
    },
  }
}

export function useContractEditor(contractId: string, locationId?: string) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const userContext = useUserContextStore()
  const isNewContract = contractId === 'new' || !contractId

  // For new contracts, use current location from store if no locationId provided
  const effectiveLocationId = computed(() => {
    if (locationId) {
      return locationId
    }
    if (isNewContract) {
      return userContext.currentLocationId ?? undefined
    }
    return undefined
  })

  // Vue Query: fetch contract (skip for new contracts)
  const {
    data: serverContract,
    isPending,
    error: queryError,
  } = useQuery({
    queryKey: ['contract', contractId] as const,
    queryFn: () => runEffectQuery(ContractApi.get(contractId))(),
    enabled: !!contractId && !isNewContract,
  })

  // XState: start machine
  const { snapshot, send } = useMachine(contractEditorMachine, {
    input: {
      contractId: contractId || 'new',
      locationId: effectiveLocationId.value,
    },
  })

  // For new contracts, create empty draft immediately
  // Watch effectiveLocationId to handle cases where location loads asynchronously
  watch(
    effectiveLocationId,
    (newLocationId) => {
      if (isNewContract && snapshot.value.matches('loading') && newLocationId) {
        send({ type: 'CREATE_NEW', locationId: newLocationId })
      }
    },
    { immediate: true },
  )

  // Watch query result and send to machine (immediate: true to handle cached data)
  watch(
    serverContract,
    (contract) => {
      if (contract) {
        // Only send LOAD_SUCCESS if machine is in loading state
        // OR if the contract ID doesn't match (contract changed)
        const currentContractId = snapshot.value?.context.contractId
        if (snapshot.value.matches('loading') || currentContractId !== contractId) {
          send({ type: 'LOAD_SUCCESS', contract })
        }
      }
    },
    { immediate: true },
  )

  // Watch query error and send to machine (immediate: true to handle existing errors)
  watch(
    queryError,
    (error) => {
      if (
        error && // Only send LOAD_ERROR if machine is in loading state
        // OR if we're loading a different contract
        (snapshot.value.matches('loading') || snapshot.value?.context.contractId !== contractId)
      ) {
        send({ type: 'LOAD_ERROR', message: error.message || 'Failed to load contract' })
      }
    },
    { immediate: true },
  )

  // Watch contractId changes - ensure machine state is correct
  watch(
    () => contractId,
    (newId, oldId) => {
      if (
        newId !== oldId && // Contract ID changed - if we're in ready/editing state, we need to reset
        // The query will refetch and trigger LOAD_SUCCESS/LOAD_ERROR
        // But if query is already done and we're still in ready state, force transition
        !isNewContract &&
        !isPending.value &&
        snapshot.value.matches('ready')
      ) {
        // Query finished but machine is still in ready state from old contract
        // This shouldn't happen, but if it does, check if we have the right contract
        const currentContractId = snapshot.value?.context.contractId
        if (currentContractId !== newId && serverContract.value?.id === newId) {
          // We have the right contract data, but machine is out of sync
          send({ type: 'LOAD_SUCCESS', contract: serverContract.value })
        }
      }
    },
  )

  // Mutation: save contract using two-step validate-then-save flow (matches legacy app)
  const saveMutation = useMutation({
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

  // Computed values from machine state
  const draft = computed(() => snapshot.value?.context.draft ?? null)
  const activeTab = computed(() => snapshot.value?.context.activeTab ?? 'general')
  const dirty = computed(() => snapshot.value?.context.dirty ?? false)
  const validity = computed(
    () =>
      snapshot.value?.context.validity ?? {
        general: true,
        people: true,
        items: true,
        payments: true,
        review: true,
      },
  )
  const errorsByPath = computed(() => snapshot.value?.context.errorsByPath ?? {})
  const lastError = computed(() => snapshot.value?.context.lastError)
  const isSaving = computed(() => snapshot.value?.matches({ ready: 'saving' }) ?? false)

  // Watch for when location becomes available after draft is created
  watch([effectiveLocationId, draft], ([newLocationId, currentDraft]) => {
    if (
      isNewContract &&
      newLocationId &&
      currentDraft &&
      !currentDraft.locationId &&
      snapshot.value.matches('ready')
    ) {
      // Location became available after draft was created, update it
      send({ type: 'UPDATE_FIELD', path: 'locationId', value: newLocationId })
    }
  })
  const isLoadingState = computed(() => {
    // For new contracts, don't show loading if draft already exists
    if (isNewContract && draft.value) {
      return false
    }

    // If we have an error state, don't show loading
    if (snapshot.value?.matches('error')) {
      return false
    }

    // If we're in ready state with a draft, don't show loading
    if (snapshot.value?.matches('ready') && draft.value) {
      return false
    }

    // For existing contracts: show loading if machine is in loading state
    // OR if query is pending and we don't have a draft yet
    const machineLoading = snapshot.value?.matches('loading') ?? false
    const queryLoading = isPending.value ?? false

    // Show loading if:
    // 1. Machine is in loading state, OR
    // 2. Query is loading and we don't have a draft (for existing contracts)
    if (machineLoading) {
      return true
    }

    if (!isNewContract && queryLoading && !draft.value) {
      return true
    }

    return false
  })

  // Actions
  const setTab = (tab: ContractSection) => {
    send({ type: 'SET_TAB', tab })
  }

  const setField = (path: string, value: unknown) => {
    send({ type: 'UPDATE_FIELD', path, value })
  }

  const touchField = (path: string) => {
    send({ type: 'TOUCH_FIELD', path })
  }

  const validateSection = (section: ContractSection) => {
    send({ type: 'VALIDATE_SECTION', section })
  }

  const save = async () => {
    if (!draft.value) {
      toast.error('Cannot save: no contract data available')
      return undefined
    }

    // Validate draft pre-conditions (matches legacy preValidate behavior)
    // This includes: location type, sale date, date validations, deceased validations, etc.
    const preConditionErrors = validateDraftPreConditions(
      draft.value,
      userContext.currentLocationType,
    )

    if (preConditionErrors.errors.length > 0) {
      // Show first error or combine them
      const errorMessage =
        preConditionErrors.errors.length === 1
          ? (preConditionErrors.errors[0] ?? 'Validation failed')
          : `Please fix the following errors:\n${preConditionErrors.errors.join('\n')}`

      toast.error(errorMessage)
      return undefined
    }

    // Validate all sections first (Zod schema validation)
    send({ type: 'VALIDATE_ALL' })

    // Wait for Vue to update the reactive snapshot after XState action
    await nextTick()

    // Check validation (XState actions are synchronous, but Vue reactivity needs a tick)
    const validity = snapshot.value?.context.validity ?? {
      general: true,
      people: true,
      items: true,
      payments: true,
      review: true,
    }
    const errorsByPath = snapshot.value?.context.errorsByPath ?? {}
    const allValid = Object.values(validity).every(Boolean)

    if (!allValid) {
      // Build user-friendly error message
      const errorMessages: string[] = []

      if (!validity.general) {
        const generalErrors = Object.entries(errorsByPath)
          .filter(([path]) => path === 'locationId' || path === 'needType')
          .map(([_, message]) => message)
        if (generalErrors.length > 0) {
          errorMessages.push(...generalErrors)
        } else {
          errorMessages.push('General information is incomplete')
        }
      }

      if (!validity.people) {
        const peopleErrors = Object.entries(errorsByPath)
          .filter(([path]) => path.startsWith('people'))
          .map(([_, message]) => message)
        if (peopleErrors.length > 0) {
          errorMessages.push(...peopleErrors)
        } else {
          errorMessages.push('People section is incomplete (requires buyer and beneficiary)')
        }
      }

      if (!validity.items) {
        const itemsErrors = Object.entries(errorsByPath)
          .filter(([path]) => path.startsWith('sale.items'))
          .map(([_, message]) => message)
        if (itemsErrors.length > 0) {
          errorMessages.push(...itemsErrors)
        } else {
          errorMessages.push('At least one item is required')
        }
      }

      // Show toast with validation errors
      const errorMessage =
        errorMessages.length > 0
          ? `Please fix the following errors:\n${errorMessages.join('\n')}`
          : 'Please complete all required fields before saving'

      toast.error(errorMessage)

      // Switch to the first invalid section tab to help user find the issue
      if (!validity.general) {
        send({ type: 'SET_TAB', tab: 'general' })
      } else if (!validity.people) {
        send({ type: 'SET_TAB', tab: 'people' })
      } else if (!validity.items) {
        send({ type: 'SET_TAB', tab: 'items' })
      }

      return undefined
    }

    // All validations passed, proceed with save
    send({ type: 'SAVE' })
    return new Promise<Contract | undefined>((resolve) => {
      saveMutation.mutate(draft.value!, {
        onSuccess: (savedContract) => {
          resolve(savedContract)
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to save contract')
          resolve(undefined)
        },
      })
    })
  }

  const reset = () => {
    send({ type: 'RESET_DRAFT' })
  }

  // Helper to get errors for a specific path
  const errorsFor = (path: string): string[] => {
    const error = errorsByPath.value[path]
    return error ? [error] : []
  }

  return {
    // State
    draft,
    activeTab,
    dirty,
    validity,
    errorsByPath,
    lastError,
    isSaving,
    isLoading: isLoadingState,
    isNewContract: computed(() => isNewContract),

    // Actions
    setTab,
    setField,
    touchField,
    validateSection,
    save,
    reset,
    errorsFor,
  }
}
