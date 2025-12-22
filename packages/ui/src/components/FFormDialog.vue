<template>
  <v-dialog
    v-model="model"
    :max-width="computedWidth"
    persistent
    v-bind="$attrs"
  >
    <v-card
      rounded="xl"
      style="position: relative"
    >
      <FLoader :model-value="busy" />

      <v-card-title v-if="title">{{ title }}</v-card-title>

      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions class="justify-end pa-4">
        <FButton
          intent="text"
          @click="handleCancel"
        >
          {{ cancelText }}
        </FButton>
        <FButton
          :disabled="saveDisabled || busy"
          intent="primary"
          :loading="busy"
          @click="handleSave"
        >
          {{ saveText }}
        </FButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  /**
   * FFormDialog - Dialog wrapper for forms with loading overlay and action buttons
   *
   * Provides a consistent dialog pattern for form editing with:
   * - Loading overlay via `busy` prop
   * - Built-in Save/Cancel buttons
   * - Error handling via event emission
   *
   * @example
   * ```vue
   * <FFormDialog
   *   v-model="showDialog"
   *   title="Edit Case"
   *   :busy="isSaving"
   *   @save="handleSave"
   *   @cancel="handleCancel"
   * >
   *   <FTextField v-model="form.name" label="Name" />
   * </FFormDialog>
   * ```
   */
  import { computed, watch } from 'vue'
  import { useVModel } from '@vueuse/core'
  import FButton from './FButton.vue'
  import FLoader from './FLoader.vue'

  type DialogWidth = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number

  interface Props {
    /** Dialog visibility (v-model) */
    modelValue?: boolean
    /** Dialog title */
    title?: string
    /** Dialog width preset or number */
    width?: DialogWidth
    /** Shows loading overlay when true */
    busy?: boolean
    /** Error message - emits 'error' event when set */
    error?: string | null
    /** Save button text */
    saveText?: string
    /** Cancel button text */
    cancelText?: string
    /** Disable save button */
    saveDisabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    title: undefined,
    width: 'md',
    busy: false,
    error: null,
    saveText: 'Save',
    cancelText: 'Cancel',
    saveDisabled: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: []
    cancel: []
    error: [message: string]
  }>()

  const model = useVModel(props, 'modelValue', emit)

  const widthMap = {
    sm: 600,
    md: 780,
    lg: 920,
    xl: 1080,
    xxl: 1280,
  } as const

  const computedWidth = computed(() =>
    typeof props.width === 'number' ? props.width : widthMap[props.width],
  )

  // Watch error prop and emit event for toast handling
  watch(
    () => props.error,
    (newError) => {
      if (newError) {
        emit('error', newError)
      }
    },
  )

  function handleSave() {
    emit('save')
  }

  function handleCancel() {
    emit('cancel')
    model.value = false
  }
</script>
