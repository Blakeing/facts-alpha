<!--
  features/contract-dialog/ui/ContractDialog.vue

  Contract editor dialog - full-screen dialog for creating and editing contracts
  Refactored to use XState + Context pattern
  Uses inject to get editor context from ContractEditorProvider
-->

<template>
  <FFullScreenDialog
    v-model="dialogModel"
    :busy="editor.isSaving.value"
    :title="dialogTitle"
    @after-leave="emit('after-leave')"
    @close="handleClose"
  >
    <!-- Unsaved changes confirmation dialog -->
    <FConfirmDialog
      v-model="confirmDialog.isOpen.value"
      v-bind="confirmDialog.options.value"
      @cancel="confirmDialog.handleCancel"
      @confirm="confirmDialog.handleConfirm"
    />

    <template #subtitle>
      <v-chip
        v-if="!editor.isNewContract.value && draft"
        class="ml-3"
        :color="getStatusColor(draft.meta.status)"
        size="small"
        variant="elevated"
      >
        {{ getStatusLabel(draft.meta.status) }}
      </v-chip>
    </template>

    <template #toolbar>
      <!-- Save Button -->
      <FButton
        v-if="draft && !isReadOnly"
        class="mr-2"
        :disabled="editor.isSaving.value"
        prepend-icon="mdi-content-save"
        @click="handleSave"
      >
        Save
      </FButton>
    </template>

    <!-- Contract content with vertical sidebar tabs -->
    <div class="contract-dialog-content">
      <!-- Sidebar Navigation -->
      <aside class="contract-sidebar">
        <v-tabs
          v-model="activeTab"
          color="primary"
          direction="vertical"
        >
          <v-tab
            class="contract-sidebar-tab"
            prepend-icon="mdi-file-document-outline"
            value="general"
          >
            General
          </v-tab>

          <v-tab
            class="contract-sidebar-tab"
            prepend-icon="mdi-package-variant"
            value="items"
          >
            Items
            <v-badge
              v-if="draft && draft.sale.items.length > 0"
              class="ml-2"
              color="primary"
              :content="draft.sale.items.length"
              inline
            />
          </v-tab>

          <v-tab
            class="contract-sidebar-tab"
            prepend-icon="mdi-credit-card-outline"
            value="payments"
          >
            Payments
            <v-badge
              v-if="draft && draft.payments.length > 0"
              class="ml-2"
              color="success"
              :content="draft.payments.length"
              inline
            />
          </v-tab>

          <v-tab
            class="contract-sidebar-tab"
            prepend-icon="mdi-account-group"
            value="people"
          >
            People
            <v-badge
              v-if="draft && draft.people.length > 0"
              class="ml-2"
              color="info"
              :content="draft.people.length"
              inline
            />
          </v-tab>
        </v-tabs>
      </aside>

      <!-- Main Content Area -->
      <main class="contract-main-content">
        <v-window
          v-model="activeTab"
          class="h-100"
        >
          <v-window-item value="general">
            <div class="content-panel">
              <ContractGeneral />
            </div>
          </v-window-item>

          <v-window-item value="items">
            <div class="content-panel">
              <ContractItems />
            </div>
          </v-window-item>

          <v-window-item value="payments">
            <div class="content-panel">
              <ContractPayments />
            </div>
          </v-window-item>

          <v-window-item value="people">
            <div class="content-panel">
              <ContractPeople />
            </div>
          </v-window-item>
        </v-window>
      </main>
    </div>
  </FFullScreenDialog>
</template>

<script lang="ts" setup>
  import { useVModel } from '@vueuse/core'
  import { computed, watch } from 'vue'
  import { getSaleStatusColor, SaleStatus } from '@/entities/contract'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { saleStatusController } from '@/shared/lib/enums/contract'
  import { FButton, FConfirmDialog, FFullScreenDialog, useConfirm } from '@/shared/ui'
  import ContractGeneral from './ContractGeneral.vue'
  import ContractItems from './ContractItems.vue'
  import ContractPayments from './ContractPayments.vue'
  import ContractPeople from './ContractPeople.vue'

  interface Props {
    modelValue?: boolean
    /** Initial tab to display */
    initialTab?: 'general' | 'items' | 'payments' | 'people'
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    initialTab: 'general',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: [contractId?: string]
    closed: []
    'tab-change': [tab: string]
    'after-leave': []
  }>()

  // Inject editor context
  const editor = useContractEditorContext()

  // Dialog state
  const dialogModel = useVModel(props, 'modelValue', emit)
  const confirmDialog = useConfirm()

  // Draft shorthand
  const draft = computed(() => editor.draft.value)

  // Tab state - synced with editor context
  const activeTab = computed({
    get: () => editor.activeTab.value,
    set: (value) => editor.setTab(value),
  })

  // Initialize from prop
  watch(
    () => props.initialTab,
    (newTab) => {
      if (newTab) {
        editor.setTab(newTab)
      }
    },
    { immediate: true },
  )

  // Emit tab changes
  watch(activeTab, (tab) => {
    emit('tab-change', tab)
  })

  // Dialog title
  const dialogTitle = computed(() => {
    if (editor.isNewContract.value) {
      return 'New Contract'
    }
    return draft.value ? `Contract ${draft.value.contractNumber}` : 'Edit Contract'
  })

  // Read-only check
  const isReadOnly = computed(() => {
    return (
      draft.value?.meta.status === SaleStatus.EXECUTED ||
      draft.value?.meta.status === SaleStatus.VOID
    )
  })

  // Status helpers
  function getStatusColor(status: SaleStatus): string {
    return getSaleStatusColor(status)
  }

  function getStatusLabel(status: SaleStatus): string {
    return saleStatusController.getDescription(status)
  }

  // Save handler
  async function handleSave() {
    const savedContract = await editor.save()
    if (savedContract) {
      emit('saved', savedContract.id)
    }
  }

  // Close handler with dirty check
  async function handleClose() {
    if (editor.dirty.value) {
      const confirmed = await confirmDialog.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        confirmText: 'Discard Changes',
        cancelText: 'Keep Editing',
        confirmColor: 'error',
      })
      if (!confirmed) {
        return
      }
    }

    dialogModel.value = false
    emit('closed')
  }
</script>

<style scoped>
  .contract-dialog-content {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  .contract-sidebar {
    flex: 0 0 auto;
    width: 200px;
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background-color: rgb(var(--v-theme-surface));
    overflow-y: auto;
  }

  .contract-sidebar-tab {
    justify-content: flex-start;
    text-transform: none;
    font-weight: 500;
  }

  .contract-main-content {
    flex: 1 1 auto;
    overflow: hidden;
    background-color: rgb(var(--v-theme-background));
  }

  .content-panel {
    height: 100%;
    overflow-y: auto;
    padding: 24px;
  }

  /* Scrollbar styling */
  .contract-sidebar::-webkit-scrollbar,
  .content-panel::-webkit-scrollbar {
    width: 8px;
  }

  .contract-sidebar::-webkit-scrollbar-thumb,
  .content-panel::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .contract-sidebar::-webkit-scrollbar-thumb:hover,
  .content-panel::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
</style>
