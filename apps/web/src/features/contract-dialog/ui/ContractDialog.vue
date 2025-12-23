<template>
  <FFullScreenDialog
    v-model="dialogModel"
    :busy="isBusy"
    :error="errorMessage"
    :title="dialogTitle"
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
        v-if="contract"
        class="ml-3"
        :color="getContractStatusColor(contract.status)"
        size="small"
        variant="elevated"
      >
        {{ getContractStatusLabel(contract.status) }}
      </v-chip>
    </template>

    <template #toolbar>
      <FButton
        v-if="contract || !contractId"
        :disabled="isBusy"
        prepend-icon="mdi-content-save"
        @click="handleSave"
      >
        Save
      </FButton>
    </template>

    <!-- Validation errors snackbar (shows on failed save) -->
    <FFormErrorsSnackbar
      v-model="showErrors"
      :errors="errors"
    />

    <!-- Contract content with tabs -->
    <div
      v-if="contract || !contractId"
      class="contract-dialog-content"
    >
      <FTabs v-model="activeTab">
        <v-tab
          rounded="0"
          value="general"
        >
          General
        </v-tab>
        <v-tab
          rounded="0"
          value="items"
        >
          Items
          <v-badge
            v-if="items.length > 0"
            class="ml-2"
            color="primary"
            :content="items.length"
            inline
          />
        </v-tab>
        <v-tab
          rounded="0"
          value="payments"
        >
          Payments
          <v-badge
            v-if="payments.length > 0"
            class="ml-2"
            color="success"
            :content="payments.length"
            inline
          />
        </v-tab>
      </FTabs>

      <v-window v-model="activeTab">
        <v-window-item value="general">
          <div class="pa-6">
            <FFormProvider
              :get-error="getError"
              :touch="touch"
              :validate-if-touched="validateIfTouched"
            >
              <ContractGeneral
                v-model="model"
                :contract="contract"
              />
            </FFormProvider>
          </div>
        </v-window-item>

        <v-window-item value="items">
          <div class="pa-6">
            <ContractItems
              :contract-id="contractId"
              :items="items"
              @add="handleAddItem"
              @remove="handleRemoveItem"
            />
          </div>
        </v-window-item>

        <v-window-item value="payments">
          <div class="pa-6">
            <ContractPayments
              :contract-id="contractId"
              :financials="financials"
              :payments="payments"
              @add="handleAddPayment"
              @remove="handleRemovePayment"
            />
          </div>
        </v-window-item>
      </v-window>
    </div>

    <!-- Not found state -->
    <div
      v-else
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
  import { computed, ref, watch } from 'vue'
  import {
    contractFormSchema,
    type ContractFormValues,
    getContractStatusColor,
    getContractStatusLabel,
    getDefaultContractFormValues,
    useContract,
    useContractForm,
  } from '@/entities/contract'
  import {
    FButton,
    FConfirmDialog,
    FFormErrorsSnackbar,
    FFormProvider,
    FFullScreenDialog,
    FTabs,
    useConfirm,
    useDirtyForm,
    useFormModel,
  } from '@/shared/ui'
  import ContractGeneral from './ContractGeneral.vue'
  import ContractItems from './ContractItems.vue'
  import ContractPayments from './ContractPayments.vue'

  interface Props {
    modelValue?: boolean
    contractId?: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    contractId: null,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: []
    closed: []
  }>()

  const dialogModel = useVModel(props, 'modelValue', emit)
  const activeTab = ref('general')
  const errorMessage = ref<string | null>(null)

  // Confirmation dialog for unsaved changes
  const confirmDialog = useConfirm()

  // Load contract data if editing
  const {
    contract,
    items,
    payments,
    financials,
    isLoading: isLoadingContract,
  } = useContract(computed(() => props.contractId))

  // Form state with useContractForm for API operations
  const {
    initialValues: loadedInitialValues,
    save: saveContract,
    isSaving,
    addItem,
    removeItem,
    addPayment,
    removePayment,
    isBusy: isMutating,
  } = useContractForm(computed(() => props.contractId))

  // Live model form state
  const { model, errors, validate, getError, touch, validateIfTouched, reset } = useFormModel(
    contractFormSchema,
    () => loadedInitialValues.value ?? getDefaultContractFormValues(),
  )

  // Show errors snackbar only on failed save
  const showErrors = ref(false)

  // Track dirty state for close confirmation (snapshot-based like legacy FACTS app)
  const { takeSnapshot, canClose } = useDirtyForm(() => model.value)

  const isBusy = computed(() => isLoadingContract.value || isSaving.value || isMutating.value)

  // Reset form when dialog opens and take snapshot
  watch(dialogModel, (visible: boolean) => {
    if (visible) {
      activeTab.value = 'general'
      errorMessage.value = null
      // Reset form to loaded values
      reset(loadedInitialValues.value ?? getDefaultContractFormValues())
      // Take snapshot after a tick to ensure form is initialized
      setTimeout(() => takeSnapshot(), 0)
    }
  })

  // Update form when contract data loads
  watch(loadedInitialValues, (newValues) => {
    if (newValues && dialogModel.value) {
      reset(newValues)
      setTimeout(() => takeSnapshot(), 0)
    }
  })

  const dialogTitle = computed(() => {
    if (props.contractId && contract.value) {
      return contract.value.contractNumber
    }
    return 'New Contract'
  })

  async function handleSave() {
    // Validate all fields
    const result = validate()
    if (!result.valid) {
      showErrors.value = true
      return
    }

    try {
      await saveContract(model.value as ContractFormValues)
      // Take new snapshot after successful save (resets dirty state)
      takeSnapshot()
      emit('saved')
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'An error occurred'
    }
  }

  async function handleAddItem(data: Parameters<typeof addItem>[0]) {
    try {
      await addItem(data)
    } catch {
      errorMessage.value = 'Failed to add item'
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      await removeItem(itemId)
    } catch {
      errorMessage.value = 'Failed to remove item'
    }
  }

  async function handleAddPayment(data: Parameters<typeof addPayment>[0]) {
    try {
      await addPayment(data)
    } catch {
      errorMessage.value = 'Failed to add payment'
    }
  }

  async function handleRemovePayment(paymentId: string) {
    try {
      await removePayment(paymentId)
    } catch {
      errorMessage.value = 'Failed to remove payment'
    }
  }

  async function handleClose() {
    const shouldClose = await canClose(() =>
      confirmDialog.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        confirmText: 'Discard',
        cancelText: 'Cancel',
        confirmColor: 'error',
      }),
    )

    if (!shouldClose) return

    dialogModel.value = false
    emit('closed')
  }
</script>

<style scoped>
  .contract-dialog-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
