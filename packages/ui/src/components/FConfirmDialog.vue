<template>
  <v-dialog
    v-model="model"
    :max-width="maxWidth"
    persistent
  >
    <v-card>
      <v-toolbar
        :color="color"
        density="compact"
        flat
      >
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4">
        <slot>{{ message }}</slot>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useVModel } from '@vueuse/core'

  /**
   * FConfirmDialog - A confirmation dialog component
   *
   * Use for confirming destructive actions or prompting user decisions.
   *
   * @example
   * ```vue
   * <FConfirmDialog
   *   v-model="showConfirm"
   *   title="Unsaved Changes"
   *   message="You have unsaved changes. Discard them?"
   *   confirm-text="Discard"
   *   confirm-color="error"
   *   @confirm="handleDiscard"
   *   @cancel="showConfirm = false"
   * />
   * ```
   */
  interface Props {
    /** Controls dialog visibility */
    modelValue?: boolean
    /** Dialog title */
    title?: string
    /** Dialog message (can also use default slot) */
    message?: string
    /** Text for confirm button */
    confirmText?: string
    /** Text for cancel button */
    cancelText?: string
    /** Color of the toolbar */
    color?: string
    /** Color of the confirm button */
    confirmColor?: string
    /** Max width of the dialog */
    maxWidth?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'Yes',
    cancelText: 'No',
    color: 'primary',
    confirmColor: 'primary',
    maxWidth: 400,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    confirm: []
    cancel: []
  }>()

  const model = useVModel(props, 'modelValue', emit)

  function handleConfirm() {
    emit('confirm')
    model.value = false
  }

  function handleCancel() {
    emit('cancel')
    model.value = false
  }
</script>
