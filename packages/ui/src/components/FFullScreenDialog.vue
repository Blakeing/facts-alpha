<template>
  <v-dialog
    v-model="model"
    fullscreen
    persistent
    transition="dialog-bottom-transition"
    v-bind="$attrs"
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
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { useVModel } from '@vueuse/core'
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
  }

  const props = withDefaults(defineProps<FFullScreenDialogProps>(), {
    modelValue: false,
    busy: false,
    error: null,
    color: 'primary',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    close: []
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
    emit('close')
    model.value = false
  }

  // Keyboard support
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && model.value && !props.busy) {
      handleClose()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
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
