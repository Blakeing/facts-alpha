/**
 * widgets/contract-editor/ui/ContractEditorProvider.vue
 *
 * Provider component that sets up contract editor context
 * Wraps the contract dialog and provides workflow state to children
 */

<script setup lang="ts">
import { computed, provide } from 'vue'
import { useContractEditor } from '@/features/contract-dialog'
import { CONTRACT_EDITOR_KEY } from '@/features/contract-dialog'
import type { ContractEditorContext } from '@/features/contract-dialog'

interface Props {
  contractId: string
  locationId?: string
}

const props = defineProps<Props>()

// Initialize the editor with Vue Query + XState
const editor = useContractEditor(props.contractId, props.locationId)

// Provide context to child components
const context: ContractEditorContext = {
  // State
  draft: editor.draft,
  activeTab: editor.activeTab,
  dirty: editor.dirty,
  validity: editor.validity,
  errorsByPath: editor.errorsByPath,
  isSaving: editor.isSaving,
  isLoading: editor.isLoading,
  isNewContract: editor.isNewContract,
  lastError: editor.lastError,

  // Actions
  setTab: editor.setTab,
  setField: editor.setField,
  touchField: editor.touchField,
  validateSection: editor.validateSection,
  save: editor.save,
  reset: editor.reset,
  errorsFor: editor.errorsFor,
}

provide(CONTRACT_EDITOR_KEY, context)

// Expose loading state for parent to show skeleton/spinner
defineExpose({
  isLoading: editor.isLoading,
})
</script>

<template>
  <div class="contract-editor-provider">
    <!-- Loading State -->
    <div
      v-if="editor.isLoading.value"
      class="d-flex align-center justify-center pa-8"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </div>

    <!-- Error State -->
    <div
      v-else-if="editor.lastError.value"
      class="d-flex flex-column align-center justify-center pa-8"
    >
      <v-icon
        color="error"
        size="64"
      >
        mdi-alert-circle-outline
      </v-icon>
      <div class="text-h6 mt-4">
        Failed to load contract
      </div>
      <div class="text-body-2 text-medium-emphasis mt-2">
        {{ editor.lastError.value }}
      </div>
    </div>

    <!-- Loaded: Render children with context -->
    <slot v-else />
  </div>
</template>

<style scoped>
.contract-editor-provider {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

