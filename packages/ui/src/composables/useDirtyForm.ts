import { cloneDeep, isEqual } from '@facts/utils'
import { ref } from 'vue'

/**
 * Return type for useDirtyForm composable
 */
export interface UseDirtyFormReturn {
  /** Check if there are actual changes since last snapshot */
  hasChanges: () => boolean
  /** Take a snapshot of current values (call when form opens or after save) */
  takeSnapshot: () => void
  /** Check if safe to close, prompting user if there are changes */
  canClose: (confirmFn: () => Promise<boolean>) => Promise<boolean>
}

/**
 * Composable for tracking form dirty state using snapshot comparison.
 *
 * Inspired by the legacy FACTS app's approach:
 * 1. Take a snapshot when form opens
 * 2. Compare current values to snapshot
 * 3. Same object structure = reliable comparison
 *
 * @example
 * ```ts
 * const { model } = useFormModel(schema, getDefaults)
 * const { hasChanges, takeSnapshot, canClose } = useDirtyForm(() => model.value)
 *
 * // When dialog opens
 * watch(dialogOpen, (open) => {
 *   if (open) setTimeout(() => takeSnapshot(), 0)
 * })
 *
 * // After save
 * async function handleSave() {
 *   await save(model.value)
 *   takeSnapshot() // Reset dirty state
 * }
 *
 * // Before close
 * async function handleClose() {
 *   if (!await canClose(() => confirm('Discard changes?'))) return
 *   closeDialog()
 * }
 * ```
 */
export function useDirtyForm(getCurrentValues: () => unknown): UseDirtyFormReturn {
  const snapshot = ref<unknown>(null)

  function takeSnapshot() {
    const values = getCurrentValues()
    // Deep clone to capture current state
    snapshot.value = values ? cloneDeep(values) : null
  }

  function hasChanges(): boolean {
    const current = getCurrentValues()
    if (!current || !snapshot.value) return false
    // Compare current to snapshot - same structure, reliable comparison
    return !isEqual(cloneDeep(current), snapshot.value)
  }

  async function canClose(confirmFn: () => Promise<boolean>): Promise<boolean> {
    if (!hasChanges()) return true
    return await confirmFn()
  }

  return {
    hasChanges,
    takeSnapshot,
    canClose,
  }
}
