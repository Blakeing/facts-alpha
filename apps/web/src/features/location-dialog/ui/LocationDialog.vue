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
        v-if="location"
        class="ml-3"
        :color="getLocationTypeColor(location.type)"
        size="small"
        variant="elevated"
      >
        {{ getLocationTypeLabel(location.type) }}
      </v-chip>
      <v-chip
        v-if="location && !location.active"
        class="ml-2"
        color="error"
        size="small"
        variant="outlined"
      >
        Inactive
      </v-chip>
    </template>

    <template #toolbar>
      <FButton
        v-if="location || !locationId"
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

    <!-- Location content -->
    <div
      v-if="location || !locationId"
      class="location-dialog-content"
    >
      <div class="pa-6">
        <FFormProvider
          :get-error="getError"
          :touch="touch"
          :validate-if-touched="validateIfTouched"
        >
          <LocationGeneral v-model="model" />
        </FFormProvider>
      </div>
    </div>

    <!-- Not found state -->
    <div
      v-else
      class="d-flex flex-column align-center justify-center pa-12"
    >
      <v-icon
        color="grey"
        icon="mdi-map-marker-alert-outline"
        size="64"
      />
      <h3 class="text-h6 mt-4">Location Not Found</h3>
      <p class="text-body-2 text-medium-emphasis">
        The location you're looking for doesn't exist or has been removed.
      </p>
    </div>
  </FFullScreenDialog>
</template>

<script lang="ts" setup>
  import { useVModel } from '@vueuse/core'
  import { computed, ref, watch } from 'vue'
  import {
    getDefaultLocationFormValues,
    getLocationTypeColor,
    getLocationTypeLabel,
    locationFormSchema,
    type LocationFormValues,
    useLocation,
    useLocationForm,
  } from '@/entities/location'
  import {
    FButton,
    FConfirmDialog,
    FFormErrorsSnackbar,
    FFormProvider,
    FFullScreenDialog,
    useConfirm,
    useDirtyForm,
    useFormModel,
  } from '@/shared/ui'
  import LocationGeneral from './LocationGeneral.vue'

  interface Props {
    modelValue?: boolean
    locationId?: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    locationId: null,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: []
    closed: []
  }>()

  const dialogModel = useVModel(props, 'modelValue', emit)
  const errorMessage = ref<string | null>(null)

  // Confirmation dialog for unsaved changes
  const confirmDialog = useConfirm()

  // Load location data if editing
  const { location, isLoading: isLoadingLocation } = useLocation(computed(() => props.locationId))

  // Form state with useLocationForm for API operations
  const {
    initialValues: loadedInitialValues,
    save: saveLocation,
    isSaving,
  } = useLocationForm(computed(() => props.locationId))

  // Live model form state
  const { model, errors, validate, getError, touch, validateIfTouched, reset } = useFormModel(
    locationFormSchema,
    () => loadedInitialValues.value ?? getDefaultLocationFormValues(),
  )

  // Show errors snackbar only on failed save
  const showErrors = ref(false)

  // Track dirty state for close confirmation
  const { takeSnapshot, canClose } = useDirtyForm(() => model.value)

  const isBusy = computed(() => isLoadingLocation.value || isSaving.value)

  // Reset form when dialog opens and take snapshot
  watch(dialogModel, (visible: boolean) => {
    if (visible) {
      errorMessage.value = null
      // Reset form to loaded values
      reset(loadedInitialValues.value ?? getDefaultLocationFormValues())
      // Take snapshot after a tick to ensure form is initialized
      setTimeout(() => takeSnapshot(), 0)
    }
  })

  // Update form when location data loads
  watch(loadedInitialValues, (newValues) => {
    if (newValues && dialogModel.value) {
      reset(newValues)
      setTimeout(() => takeSnapshot(), 0)
    }
  })

  const dialogTitle = computed(() => {
    if (props.locationId && location.value) {
      return `${location.value.identifier} - ${location.value.name}`
    }
    return 'New Location'
  })

  async function handleSave() {
    // Validate all fields
    const result = validate()
    if (!result.valid) {
      showErrors.value = true
      return
    }

    try {
      await saveLocation(model.value as LocationFormValues)
      // Take new snapshot after successful save (resets dirty state)
      takeSnapshot()
      emit('saved')
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'An error occurred'
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
  .location-dialog-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
  }
</style>
