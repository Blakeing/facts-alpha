import { ref, type Ref } from 'vue'

/**
 * Options for the confirmation dialog
 */
export interface ConfirmOptions {
  /** Dialog title */
  title?: string
  /** Dialog message */
  message?: string
  /** Text for confirm button */
  confirmText?: string
  /** Text for cancel button */
  cancelText?: string
  /** Color of the toolbar */
  color?: string
  /** Color of the confirm button */
  confirmColor?: string
}

/**
 * State for the confirmation dialog
 */
export interface ConfirmState {
  /** Whether the dialog is visible */
  isOpen: Ref<boolean>
  /** Current dialog options */
  options: Ref<ConfirmOptions>
}

/**
 * Return type for useConfirm composable
 */
export interface UseConfirmReturn extends ConfirmState {
  /**
   * Show a confirmation dialog and wait for user response
   * @param options - Dialog options or just a message string
   * @returns true if confirmed, false if cancelled
   */
  confirm: (options: ConfirmOptions | string) => Promise<boolean>
  /** Handle user confirming */
  handleConfirm: () => void
  /** Handle user cancelling */
  handleCancel: () => void
}

/**
 * Composable for programmatic confirmation dialogs
 *
 * Provides a promise-based API for showing confirmation dialogs.
 * Use with FConfirmDialog component.
 *
 * @example
 * ```vue
 * <template>
 *   <FConfirmDialog
 *     v-model="isOpen"
 *     v-bind="options"
 *     @confirm="handleConfirm"
 *     @cancel="handleCancel"
 *   />
 *   <v-btn @click="handleDelete">Delete</v-btn>
 * </template>
 *
 * <script setup>
 * const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm()
 *
 * async function handleDelete() {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     confirmText: 'Delete',
 *     confirmColor: 'error',
 *   })
 *
 *   if (confirmed) {
 *     await deleteItem()
 *   }
 * }
 * </script>
 * ```
 */
export function useConfirm(): UseConfirmReturn {
  const isOpen = ref(false)
  const options = ref<ConfirmOptions>({})
  let resolvePromise: ((value: boolean) => void) | null = null

  async function confirm(opts: ConfirmOptions | string): Promise<boolean> {
    // Normalize options
    if (typeof opts === 'string') {
      options.value = { message: opts }
    } else {
      options.value = opts
    }

    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleConfirm() {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  function handleCancel() {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
