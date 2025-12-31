<template>
  <FFullScreenDialog
    v-model="dialogModel"
    :busy="isBusy"
    :error="errorMessage"
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
        v-if="!session.isNewContract.value"
        class="ml-3"
        :color="getSaleStatusColor(session.status.value)"
        size="small"
        variant="elevated"
      >
        {{ saleStatusController.getDescription(session.status.value) }}
      </v-chip>
    </template>

    <template #toolbar>
      <!-- Save Button (hidden when executed/voided - like legacy canSaveDraftOrFinal) -->
      <FButton
        v-if="!session.isLoading.value && session.canSaveDraftOrFinal.value"
        class="mr-2"
        :disabled="isBusy"
        prepend-icon="mdi-content-save"
        @click="handleSave"
      >
        Save
      </FButton>

      <!-- Actions Menu (hidden for new contracts - only save is available) -->
      <FActionsMenu
        v-if="!session.isLoading.value && !session.isNewContract.value"
        :disabled="isBusy"
        :items="actionMenuItems"
        tooltip="More Actions"
      />
    </template>

    <!-- Validation errors snackbar (shows on failed save) -->
    <FFormErrorsSnackbar
      v-model="showErrors"
      :errors="formErrors"
    />

    <!-- Contract content with vertical sidebar tabs -->
    <div
      v-if="!session.isLoading.value"
      class="contract-dialog-content"
    >
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
              v-if="session.items.itemCount.value > 0"
              class="ml-2"
              color="primary"
              :content="session.items.itemCount.value"
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
              v-if="session.payments.paymentCount.value > 0"
              class="ml-2"
              color="success"
              :content="session.payments.paymentCount.value"
              inline
            />
          </v-tab>

          <v-tab
            class="contract-sidebar-tab"
            prepend-icon="mdi-account-group"
            value="people"
          >
            People
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
              <FFormProvider
                :get-error="getError"
                :touch="touch"
                :validate-if-touched="validateIfTouched"
              >
                <ContractGeneral />
              </FFormProvider>
            </div>
          </v-window-item>

          <v-window-item value="items">
            <div class="content-panel">
              <ContractItems
                :contract-id="props.contractId"
                :is-editable="session.isEditable.value"
                :items="session.items.items.value as SaleItem[]"
                @add="handleAddItem"
                @remove="handleRemoveItem"
              />
            </div>
          </v-window-item>

          <v-window-item value="payments">
            <div class="content-panel">
              <ContractPayments
                :contract-id="props.contractId"
                :financials="session.financials.value"
                :is-editable="session.isEditable.value"
                :payments="session.payments.payments.value as ContractPayment[]"
                @add="handleAddPayment"
                @remove="handleRemovePayment"
              />
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

    <!-- Loading state -->
    <div
      v-else-if="session.isLoading.value"
      class="d-flex flex-column align-center justify-center pa-12"
    >
      <v-progress-circular
        indeterminate
        size="48"
      />
      <p class="text-body-2 text-medium-emphasis mt-4">Loading contract...</p>
    </div>

    <!-- Not found / Error state -->
    <div
      v-else-if="session.isError.value"
      class="d-flex flex-column align-center justify-center pa-12"
    >
      <v-icon
        color="grey"
        icon="mdi-file-document-alert-outline"
        size="64"
      />
      <h3 class="text-h6 mt-4">Contract Not Found</h3>
      <p class="text-body-2 text-medium-emphasis">
        The contract you're looking for doesn't exist or has been removed.
      </p>
    </div>
  </FFullScreenDialog>
</template>

<script lang="ts" setup>
  import { useVModel } from '@vueuse/core'
  import { computed, onErrorCaptured, ref, watch } from 'vue'
  import {
    contractFormSchema,
    type ContractPayment,
    type ContractPaymentFormValues,
    getSaleStatusColor,
    type ItemType,
    type PaymentMethod,
    type SaleItem,
    useContractSession,
  } from '@/entities/contract'
  import { saleStatusController } from '@/shared/lib/enums/contract'
  import {
    type ActionMenuItem,
    FActionsMenu,
    FButton,
    FConfirmDialog,
    FFormErrorsSnackbar,
    FFormProvider,
    FFullScreenDialog,
    useConfirm,
    useSessionValidator,
  } from '@/shared/ui'
  import ContractGeneral from './ContractGeneral.vue'
  import ContractItems from './ContractItems.vue'
  import ContractPayments from './ContractPayments.vue'
  import ContractPeople from './ContractPeople.vue'

  interface Props {
    modelValue?: boolean
    contractId?: string | null
    /** Initial tab to display (supports route query param: ?tab=payments) */
    initialTab?: 'general' | 'items' | 'payments' | 'people'
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    contractId: null,
    initialTab: 'general',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: [contractId?: string]
    closed: []
    'tab-change': [tab: string]
    'after-leave': []
  }>()

  const dialogModel = useVModel(props, 'modelValue', emit)
  const errorMessage = ref<string | null>(null)

  // Global error handler for this component
  function errorHandler(error: Error) {
    console.error('[ContractDialog] Global error handler caught:', error)
    console.error('[ContractDialog] Error stack:', error.stack)
  }

  // Set up global error handler for this component
  onErrorCaptured(errorHandler)

  // Tab state - internal state, initialized from prop
  const activeTab = ref<'general' | 'items' | 'payments' | 'people'>(
    (props.initialTab as 'general' | 'items' | 'payments' | 'people') || 'general',
  )

  // Sync with prop when it changes (e.g., route update)
  watch(
    () => props.initialTab,
    (newTab) => {
      try {
        activeTab.value = newTab
      } catch (error) {
        console.error('[ContractDialog] Error in initialTab watcher:', error)
        throw error
      }
    },
  )

  // Emit tab changes for parent to optionally update route
  watch(activeTab, (tab) => {
    try {
      emit('tab-change', tab)
    } catch (error) {
      console.error('[ContractDialog] Error in activeTab watcher:', error)
      throw error
    }
  })

  // Confirmation dialog for unsaved changes
  const confirmDialog = useConfirm()

  // ==========================================================================
  // Contract Session - Main orchestration
  // ==========================================================================

  const session = useContractSession(
    computed(() => props.contractId),
    {
      onSave: (contract) => {
        emit('saved', contract.id)
      },
      onSaveError: (error) => {
        errorMessage.value = error.message
      },
    },
  )

  // ==========================================================================
  // Form Validation (for General tab) - using useSessionValidator
  // ==========================================================================

  const {
    errors: formErrors,
    validate,
    getError,
    touch,
    validateIfTouched,
  } = useSessionValidator(contractFormSchema, () => session.toValidationData())

  // Show errors snackbar only on failed save
  const showErrors = ref(false)

  // Combined busy state
  const isBusy = computed(() => session.isLoading.value || session.isSaving.value)

  // ==========================================================================
  // Computed
  // ==========================================================================

  const dialogTitle = computed(() => {
    if (session.isNewContract.value) {
      return 'New Contract'
    }
    const contractNum = session.contractNumber.value
    return contractNum ? `Contract ${contractNum}` : 'Contract'
  })

  // Actions menu items (like legacy app's save menu)
  const actionMenuItems = computed<ActionMenuItem[]>(() => [
    {
      key: 'save-close',
      label: 'Save & Close',
      handler: handleSaveAndClose,
      visible: session.canSaveDraftOrFinal.value,
    },
    {
      key: 'finalize',
      label: 'Finalize',
      handler: handleFinalize,
      visible: session.canFinalize.value,
      divider: true,
    },
    {
      key: 'finalize-close',
      label: 'Finalize & Close',
      handler: handleFinalizeAndClose,
      visible: session.canFinalize.value,
    },
    {
      key: 'execute',
      label: 'Execute',
      handler: handleExecute,
      visible: session.canExecute.value,
      divider: true,
    },
    {
      key: 'execute-close',
      label: 'Execute & Close',
      handler: handleExecuteAndClose,
      visible: session.canExecute.value,
    },
    {
      key: 'back-to-draft',
      label: 'Back to Draft',

      handler: handleBackToDraft,
      visible: session.canBackToDraft.value,
      divider: true,
    },
    {
      key: 'void',
      label: 'Void Contract',
      color: 'error',
      handler: handleVoid,
      visible: session.canVoid.value && !session.isNewContract.value,
      divider: true,
    },
  ])

  // ==========================================================================
  // Handlers
  // ==========================================================================

  /**
   * Validate session data
   * @returns true if validation passed, false otherwise
   */
  function validateAndSync(): boolean {
    console.log('🔍 ContractDialog.validateAndSync - Starting validation')
    const result = validate()
    if (!result.valid) {
      console.log('❌ ContractDialog.validateAndSync - Validation failed:', result.errors)
      showErrors.value = true
      return false
    }
    console.log('✅ ContractDialog.validateAndSync - Validation passed')
    return true
  }

  /**
   * Save the contract (validates first)
   * Like legacy: doSave(false, false, false, false)
   */
  async function handleSave() {
    console.log('🔍 ContractDialog.handleSave - Starting save process')
    if (!validateAndSync()) {
      console.log('❌ ContractDialog.handleSave - Validation failed')
      return
    }
    console.log('✅ ContractDialog.handleSave - Validation passed, saving...')
    await session.save()
    console.log('💾 ContractDialog.handleSave - Save completed')
  }

  /**
   * Save and close the dialog
   * Like legacy: doSave(false, false, false, true)
   */
  async function handleSaveAndClose() {
    if (!validateAndSync()) return
    await session.save()
    if (!session.saveError.value) {
      closeDialog()
    }
  }

  /**
   * Finalize the contract (validates, confirms, changes status, saves)
   */
  async function handleFinalize() {
    if (!validateAndSync()) return

    const confirmed = await confirmDialog.confirm({
      title: 'Finalize Contract',
      message: 'Finalizing will lock the contract from further editing. Continue?',
      confirmText: 'Finalize',
      cancelText: 'Cancel',
      confirmColor: 'warning',
    })
    if (!confirmed) return

    session.finalize()
    await session.save()
  }

  /**
   * Finalize and close
   */
  async function handleFinalizeAndClose() {
    if (!validateAndSync()) return

    const confirmed = await confirmDialog.confirm({
      title: 'Finalize Contract',
      message: 'Finalizing will lock the contract from further editing. Continue?',
      confirmText: 'Finalize',
      cancelText: 'Cancel',
      confirmColor: 'warning',
    })
    if (!confirmed) return

    session.finalize()
    await session.save()
    if (!session.saveError.value) {
      closeDialog()
    }
  }

  /**
   * Handle person name updates from ContractPeople - NO LONGER NEEDED with edit model
   * The edit model is mutated directly by child components
   */
  // REMOVED: handlePersonNameUpdate

  /**
   * Execute the contract
   */
  async function handleExecute() {
    if (!validateAndSync()) return

    const confirmed = await confirmDialog.confirm({
      title: 'Execute Contract',
      message: 'Executing marks this contract as complete. This action is final. Continue?',
      confirmText: 'Execute',
      cancelText: 'Cancel',
      confirmColor: 'success',
    })
    if (!confirmed) return

    session.execute()
    await session.save()
  }

  /**
   * Execute and close
   */
  async function handleExecuteAndClose() {
    if (!validateAndSync()) return

    const confirmed = await confirmDialog.confirm({
      title: 'Execute Contract',
      message: 'Executing marks this contract as complete. This action is final. Continue?',
      confirmText: 'Execute',
      cancelText: 'Cancel',
      confirmColor: 'success',
    })
    if (!confirmed) return

    session.execute()
    await session.save()
    if (!session.saveError.value) {
      closeDialog()
    }
  }

  /**
   * Move contract back to draft status (no confirmation needed - reversible)
   */
  async function handleBackToDraft() {
    session.backToDraft()
    await session.save()
  }

  /**
   * Void the contract - this one DOES need confirmation since it's destructive
   * Like legacy: Contract.vue void() method with confirmation
   */
  async function handleVoid() {
    const confirmed = await confirmDialog.confirm({
      title: 'Void Contract',
      message: 'Are you sure you want to void this contract? This action cannot be undone.',
      confirmText: 'Void Contract',
      cancelText: 'Cancel',
      confirmColor: 'error',
    })

    if (!confirmed) return

    session.voidContract('Voided by user')
    await session.save()
    if (!session.saveError.value) {
      closeDialog()
    }
  }

  function closeDialog() {
    session.reset()
    dialogModel.value = false
    emit('closed')
  }

  function handleAddItem(data: {
    sku: string
    description: string
    itemType: ItemType
    quantity: number
    unitPrice: number
  }) {
    session.items.addCustomItem({
      sku: data.sku,
      description: data.description,
      itemType: data.itemType,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    })
  }

  function handleRemoveItem(itemId: string) {
    session.items.removeItem(itemId)
  }

  function handleAddPayment(data: ContractPaymentFormValues) {
    const payment = session.payments.addPayment()
    // Update the payment with provided data
    payment.date = data.date
    payment.method = data.method as PaymentMethod
    payment.amount = data.amount
    payment.reference = data.reference
    payment.notes = data.notes
  }

  function handleRemovePayment(paymentId: string) {
    session.payments.removePayment(paymentId)
  }

  async function handleClose() {
    if (session.isDirty.value) {
      const shouldClose = await confirmDialog.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        confirmText: 'Discard',
        cancelText: 'Cancel',
        confirmColor: 'error',
      })

      if (!shouldClose) return
    }

    closeDialog()
  }
</script>
<style scoped>
  .contract-dialog-content {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  /* Sidebar Navigation */
  .contract-sidebar {
    min-width: 250px;
    background: rgb(var(--v-theme-surface));
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow-y: auto;
    padding-top: 16px;
  }

  .contract-sidebar :deep(.v-tabs) {
    width: 100%;
  }

  /* Main Content Area */
  .contract-main-content {
    flex: 1;
    overflow-y: auto;
    background: rgb(var(--v-theme-background));
  }

  .content-panel {
    padding: 24px;
    /* max-width: 1200px; */
  }

  /* Window should fill height */
  .contract-main-content :deep(.v-window) {
    height: 100%;
  }

  .contract-main-content :deep(.v-window__container) {
    height: 100%;
  }

  .contract-main-content :deep(.v-window-item) {
    height: 100%;
    overflow-y: auto;
  }
</style>
