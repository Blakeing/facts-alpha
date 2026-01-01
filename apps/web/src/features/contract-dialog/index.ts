/**
 * features/contract-dialog/index.ts
 *
 * Contract dialog feature - full-screen editing dialog for contracts
 */

// Route handling
export { type ContractTab, useContractDialogRoute } from './model/useContractDialogRoute'

// XState machine and workflow
export { contractEditorMachine } from './model/contractEditor.machine'
export type { ContractEditorContext, ContractEditorEvent } from './model/contractEditor.machine'

// Context
export { CONTRACT_EDITOR_KEY, type ContractEditorContext as ContractEditorContextType } from './model/contractEditorContext'

// Composables
export { useContractEditor } from './model/useContractEditor'
export { useContractEditorContext } from './model/useContractEditorContext'

// Components
export { default as ContractDialog } from './ui/ContractDialog.vue'
