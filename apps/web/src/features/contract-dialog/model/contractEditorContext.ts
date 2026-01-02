/**
 * features/contract-dialog/model/contractEditorContext.ts
 *
 * Context for contract editor to eliminate prop drilling
 * Provides workflow state and actions to child components
 */

import type { ComputedRef, InjectionKey } from 'vue'
import type { Contract, ContractDraft, ContractSection } from '@/entities/contract'

export interface ContractEditorContext {
  // State
  draft: ComputedRef<ContractDraft | null>
  activeTab: ComputedRef<ContractSection>
  dirty: ComputedRef<boolean>
  validity: ComputedRef<Record<ContractSection, boolean>>
  errorsByPath: ComputedRef<Record<string, string>>
  isSaving: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isNewContract: ComputedRef<boolean>
  lastError: ComputedRef<string | undefined>

  // Actions
  setTab: (tab: ContractSection) => void
  setField: (path: string, value: unknown) => void
  touchField: (path: string) => void
  validateSection: (section: ContractSection) => void
  save: () => Promise<Contract | undefined>
  reset: () => void
  errorsFor: (path: string) => string[]
}

export const CONTRACT_EDITOR_KEY: InjectionKey<ContractEditorContext> =
  Symbol('contractEditorContext')
