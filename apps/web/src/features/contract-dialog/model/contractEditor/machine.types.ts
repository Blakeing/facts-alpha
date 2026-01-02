/**
 * features/contract-dialog/model/contractEditor/machine.types.ts
 *
 * Type definitions for the contract editor state machine
 */

import type { Contract, ContractDraft, ContractSection } from '@/entities/contract'

export interface ContractEditorContext {
  contractId: string
  server: Contract | null // Loaded server contract
  draft: ContractDraft | null // Working draft
  initialDraft: ContractDraft | null // Snapshot of initial state for dirty tracking
  activeTab: ContractSection
  dirty: boolean
  validity: Record<ContractSection, boolean>
  errorsByPath: Record<string, string>
  lastError?: string
  touchedFields: Set<string> // Track which fields have been touched/interacted with
}

export type ContractEditorEvent =
  | { type: 'LOAD_SUCCESS'; contract: Contract }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'CREATE_NEW'; locationId?: string }
  | { type: 'SET_TAB'; tab: ContractSection }
  | { type: 'UPDATE_FIELD'; path: string; value: unknown }
  | { type: 'TOUCH_FIELD'; path: string }
  | { type: 'VALIDATE_SECTION'; section: ContractSection }
  | { type: 'VALIDATE_ALL' }
  | { type: 'SAVE' }
  | { type: 'SAVE_SUCCESS'; contract: Contract }
  | { type: 'SAVE_ERROR'; message: string }
  | { type: 'RESET_DRAFT' }

export type ContractEditorInput = {
  contractId: string
  locationId?: string
}
