/**
 * features/contract-dialog/model/useContractEditorContext.ts
 *
 * Composable to inject contract editor context
 * Used by child components to access editor state and actions
 */

import { inject } from 'vue'
import { CONTRACT_EDITOR_KEY, type ContractEditorContext } from './contractEditorContext'

/**
 * Injects contract editor context from parent component
 * @returns Contract editor context
 * @throws Error if context is not provided
 */
export function useContractEditorContext(): ContractEditorContext {
  const context = inject(CONTRACT_EDITOR_KEY)

  if (!context) {
    throw new Error(
      'useContractEditorContext must be used within a component that provides contractEditorContext',
    )
  }

  return context
}

