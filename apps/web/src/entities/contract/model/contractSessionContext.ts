/**
 * Contract Session Context - Shared context for contract editing session
 *
 * This context is provided by useContractSession and injected into
 * all handler composables via Vue's provide/inject.
 */

import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { SaleStatus } from './contract'

/**
 * Context shared across all handlers in a contract session
 */
export interface ContractSessionContext {
  /** The contract ID (empty string for new contracts) */
  contractId: Ref<string>

  /** Whether this is a new contract (not yet saved) */
  isNewContract: ComputedRef<boolean>

  /** Current sale status (Draft, Executed, Finalized, Void) */
  status: ComputedRef<SaleStatus>

  /** Whether the contract can be edited (draft status) */
  isEditable: ComputedRef<boolean>
}

/**
 * Injection key for the contract session context
 */
export const CONTRACT_SESSION_KEY: InjectionKey<ContractSessionContext> = Symbol('contractSession')
