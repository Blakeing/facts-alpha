import { ref, watch, type Ref } from 'vue'

/**
 * Options for the dirty form tracking
 */
export interface DirtyFormOptions {
  /** Confirm message when closing with unsaved changes */
  confirmMessage?: string
  /** Confirm title */
  confirmTitle?: string
}

/**
 * Return type for useDirtyForm composable
 */
export interface DirtyFormReturn {
  /** Whether the form has unsaved changes */
  isDirty: Ref<boolean>
  /** The original form state (JSON string) */
  originalState: Ref<string>
  /** Mark the current state as the new "clean" baseline */
  markClean: () => void
  /** Reset to the original clean state */
  reset: () => void
  /**
   * Check if it's safe to close (prompts user if dirty)
   * @param confirmFn - Function to show confirmation dialog
   * @returns true if safe to close, false if user cancelled
   */
  canClose: (confirmFn?: () => Promise<boolean>) => Promise<boolean>
}

/**
 * Composable for tracking form dirty state
 *
 * Inspired by the legacy FACTS app's hasChanges() pattern.
 * Tracks changes to a form state object and provides confirmation
 * when attempting to close with unsaved changes.
 *
 * @example
 * ```ts
 * const formData = ref({ name: '', email: '' })
 * const { isDirty, markClean, canClose } = useDirtyForm(formData)
 *
 * // After saving
 * markClean()
 *
 * // Before closing
 * async function handleClose() {
 *   const shouldClose = await canClose(() =>
 *     confirm('You have unsaved changes. Close anyway?')
 *   )
 *   if (shouldClose) {
 *     closeDialog()
 *   }
 * }
 * ```
 */
export function useDirtyForm<T>(
  formState: Ref<T>,
  options: DirtyFormOptions = {},
): DirtyFormReturn {
  const {
    confirmMessage = 'You have unsaved changes. Are you sure you want to close?',
    // confirmTitle = 'Unsaved Changes',
  } = options

  const originalState = ref<string>('')
  const isDirty = ref(false)

  // Serialize the form state to JSON for comparison
  function serialize(state: T): string {
    return JSON.stringify(state ?? {})
  }

  // Initialize and watch for changes
  function updateDirtyState() {
    const currentState = serialize(formState.value)
    isDirty.value = currentState !== originalState.value
  }

  // Watch form state for changes
  watch(
    formState,
    () => {
      updateDirtyState()
    },
    { deep: true },
  )

  // Mark the current state as "clean"
  function markClean() {
    originalState.value = serialize(formState.value)
    isDirty.value = false
  }

  // Reset tracking (typically called when form loads)
  function reset() {
    markClean()
  }

  // Check if safe to close
  async function canClose(confirmFn?: () => Promise<boolean>): Promise<boolean> {
    if (!isDirty.value) {
      return true
    }

    if (confirmFn) {
      return await confirmFn()
    }

    // Default browser confirm
    return window.confirm(confirmMessage)
  }

  // Initialize original state
  markClean()

  return {
    isDirty,
    originalState,
    markClean,
    reset,
    canClose,
  }
}
