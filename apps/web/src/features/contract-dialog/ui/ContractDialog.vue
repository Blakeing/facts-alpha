<template>
  <FFullScreenDialog
    v-model="model"
    :busy="isBusy"
    :error="errorMessage"
    :title="dialogTitle"
    @close="handleClose"
  >
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
        @click="triggerSave"
      >
        Save
      </FButton>
    </template>

    <!-- Contract content with tabs -->
    <FForm
      v-if="contract || !contractId"
      ref="formRef"
      class="contract-dialog-content"
      :initial-values="initialValues"
      :schema="contractFormSchema"
      @submit="handleSave"
    >
      <template #default>
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
              <ContractGeneral :contract="contract" />
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
      </template>
    </FForm>

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
  import { FButton, FForm, FFullScreenDialog, FTabs } from '@/shared/ui'
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

  const model = useVModel(props, 'modelValue', emit)
  const activeTab = ref('general')
  const errorMessage = ref<string | null>(null)
  const formRef = ref<InstanceType<typeof FForm> | null>(null)

  // Load contract data if editing
  const {
    contract,
    items,
    payments,
    financials,
    isLoading: isLoadingContract,
  } = useContract(computed(() => props.contractId))

  // Form state
  const {
    initialValues: loadedInitialValues,
    save,
    isSaving,
    addItem,
    removeItem,
    addPayment,
    removePayment,
    isBusy: isMutating,
  } = useContractForm(props.contractId, {
    onSuccess: () => {
      emit('saved')
    },
    onError: (error) => {
      errorMessage.value = error.message || 'An error occurred'
    },
  })

  // Initial values for the form
  const initialValues = computed(() => {
    return loadedInitialValues.value ?? getDefaultContractFormValues()
  })

  // Reset form when dialog opens
  watch(model, (visible: boolean) => {
    if (visible) {
      activeTab.value = 'general'
      errorMessage.value = null
    }
  })

  const isBusy = computed(() => isLoadingContract.value || isSaving.value || isMutating.value)

  const dialogTitle = computed(() => {
    if (props.contractId && contract.value) {
      return contract.value.contractNumber
    }
    return 'New Contract'
  })

  async function triggerSave() {
    if (!formRef.value) return

    // Validate first and show error if invalid
    const result = await formRef.value.validate()
    if (!result.valid) {
      errorMessage.value = 'Please fix the validation errors before saving'
      return
    }

    formRef.value.submitForm()
  }

  async function handleSave(values: Record<string, unknown>) {
    try {
      await save(values as ContractFormValues)
    } catch {
      // Error handled by onError callback
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

  function handleClose() {
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
