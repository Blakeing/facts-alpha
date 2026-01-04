<template>
  <v-dialog
    v-model="model"
    fullscreen
    persistent
    :transition="effectiveTransition"
    v-bind="$attrs"
    @keydown.escape="handleEscape"
    @after-leave="handleAfterLeave"
  >
    <v-card
      class="f-fullscreen-dialog"
      rounded="0"
    >
      <FLoader :model-value="busy" />

      <v-toolbar
        :color="color"
        flat
        rounded="0"
      >
        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="busy"
          @click="handleClose"
        />

        <v-toolbar-title class="px-2">
          {{ title }}
          <slot name="subtitle" />
        </v-toolbar-title>

        <v-spacer />

        <slot name="toolbar" />
      </v-toolbar>

      <div class="f-fullscreen-dialog__content">
        <slot />
      </div>
    </v-card>

    <v-snackbar
      v-model="showError"
      color="error"
      location="top"
      :timeout="5000"
    >
      {{ error }}
      <template #actions>
        <v-btn
          variant="text"
          @click="showError = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script lang="ts" setup>
  /**
   * FFullScreenDialog - Full-screen dialog for complex editing workflows
   *
   * Provides a consistent pattern for master-detail ERP workflows with:
   * - Full-screen overlay with slide-up transition
   * - Toolbar with close button, title, and action slots
   * - Built-in loading overlay and error snackbar
   * - Keyboard support (Escape to close when not busy)
   * - Auto-skips transition on first route after bootstrap (if app context is provided)
   *
   * @example
   * ```vue
   * <FFullScreenDialog
   *   v-model="dialogVisible"
   *   title="Contract #12345"
   *   :busy="isSaving"
   *   :error="errorMessage"
   * >
   *   <template #toolbar>
   *     <FButton @click="save">Save</FButton>
   *   </template>
   *   <v-tabs>...</v-tabs>
   * </FFullScreenDialog>
   * ```
   */
  import { computed, ref, watch } from 'vue'
  import { useVModel } from '@vueuse/core'
  import { useAppContext } from '../composables'
  import FLoader from './FLoader.vue'

  export interface FFullScreenDialogProps {
    /** Dialog visibility (v-model) */
    modelValue?: boolean
    /** Toolbar title */
    title: string
    /** Shows loading overlay when true */
    busy?: boolean
    /** Error message - shows in snackbar when set */
    error?: string | null
    /** Toolbar color */
    color?: string
    /** Dialog transition name. Set to 'none' to disable animation */
    transition?: string
  }

  const props = withDefaults(defineProps<FFullScreenDialogProps>(), {
    modelValue: false,
    busy: false,
    error: null,
    color: 'primary',
    transition: 'dialog-bottom-transition',
  })

  // Inject app context if provided
  // Capture isFirstRoute at setup time (non-reactive) so it doesn't change mid-render
  const appContext = useAppContext()
  const skipTransition = appContext?.isFirstRoute ?? false

  // Effective transition: disable if this component mounted during first route render
  // Computed is needed because props.transition could change, but skipTransition is constant
  const effectiveTransition = computed(() => {
    return skipTransition ? 'none' : props.transition
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    close: []
    'after-leave': []
  }>()

  const model = useVModel(props, 'modelValue', emit)
  const showError = ref(false)

  // Watch error prop and show snackbar
  watch(
    () => props.error,
    (newError: string | null | undefined) => {
      if (newError) {
        showError.value = true
      }
    },
  )

  function handleClose() {
    if (props.busy) return
    // Only emit close event - let parent decide whether to actually close
    // Parent should set modelValue to false to close the dialog
    emit('close')
  }

  function handleAfterLeave() {
    // Emitted when close animation completes - useful for navigation timing
    emit('after-leave')
  }

  // Handle Escape key - use Vuetify's built-in event
  function handleEscape(e: KeyboardEvent) {
    if (!props.busy) {
      e.preventDefault()
      e.stopPropagation()
      handleClose()
    }
  }
</script>

<style scoped>
  .f-fullscreen-dialog {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .f-fullscreen-dialog__content {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }
</style>
