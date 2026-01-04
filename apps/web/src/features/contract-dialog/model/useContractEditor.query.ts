/**
 * features/contract-dialog/model/useContractEditor.query.ts
 *
 * Vue Query setup and watchers for contract editor
 */

import { runEffectQuery } from '@facts/effect'
import { useQuery } from '@tanstack/vue-query'
import { useMachine } from '@xstate/vue'
import { computed, watch } from 'vue'
import { ContractApi } from '@/entities/contract'
import { useUserContextStore } from '@/shared/lib'
import { contractEditorMachine } from './contractEditor'

/**
 * Setup Vue Query and XState machine for contract editor
 * Returns query state, machine state, and watchers
 */
export function useContractEditorQuery(contractId: string, locationId?: string) {
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
    isFetched,
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
    (session) => {
      if (session) {
        // Only send LOAD_SUCCESS if machine is in loading state
        // OR if the contract ID doesn't match (contract changed)
        const currentContractId = snapshot.value?.context.contractId
        if (snapshot.value.matches('loading') || currentContractId !== contractId) {
          send({ type: 'LOAD_SUCCESS', session })
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
        if (currentContractId !== newId && serverContract.value?.contract.id === newId) {
          // We have the right contract data, but machine is out of sync
          send({ type: 'LOAD_SUCCESS', session: serverContract.value })
        }
      }
    },
  )

  // Watch for when location becomes available after draft is created
  const draft = computed(() => snapshot.value?.context.draft ?? null)
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

  return {
    snapshot,
    send,
    serverContract,
    isPending,
    isFetched,
    queryError,
    effectiveLocationId,
    isNewContract,
    draft,
  }
}
