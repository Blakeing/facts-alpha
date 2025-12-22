import { ref, type Ref } from 'vue'

/**
 * Options for the form save handler
 */
export interface FormSaveOptions {
  /** Called before validation */
  onBeforeSave?: () => Promise<void> | void
  /** Called after successful save */
  onSuccess?: () => Promise<void> | void
  /** Called when save fails */
  onError?: (error: Error) => Promise<void> | void
  /** Called when validation fails */
  onValidationError?: (errors: Record<string, string>) => Promise<void> | void
  /** Default validation error message */
  validationErrorMessage?: string
}

/**
 * Return type for useFormSave composable
 */
export interface FormSaveReturn {
  /** Whether a save operation is in progress */
  isSaving: Ref<boolean>
  /** Current error message (if any) */
  errorMessage: Ref<string | null>
  /** Clear the current error */
  clearError: () => void
  /**
   * Try to save the form
   * @param validator - Object with validate() method (e.g., useFormModel return)
   * @param saveHandler - Function to call if validation passes
   * @returns true if save was successful, false otherwise
   */
  trySave: (
    validator: {
      validate: () =>
        | { valid: boolean; errors: Record<string, string> }
        | Promise<{ valid: boolean; errors: Record<string, string> }>
    } | null,
    saveHandler: () => Promise<void>,
  ) => Promise<boolean>
}

/**
 * Composable for handling form save operations with validation
 *
 * Inspired by the legacy FACTS app's `trySave` utility pattern.
 * Provides a standardized way to validate forms before saving,
 * handle errors, and manage loading states.
 *
 * @example
 * ```ts
 * const { model, validate } = useFormModel(schema, getDefaults)
 * const { isSaving, errorMessage, trySave } = useFormSave({
 *   onSuccess: () => emit('saved'),
 *   onError: (error) => console.error(error),
 * })
 *
 * async function handleSave() {
 *   const success = await trySave({ validate }, async () => {
 *     await api.save(model.value)
 *   })
 *   if (success) closeDialog()
 * }
 * ```
 */
export function useFormSave(options: FormSaveOptions = {}): FormSaveReturn {
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)

  const {
    onBeforeSave,
    onSuccess,
    onError,
    onValidationError,
    validationErrorMessage = 'Please correct the errors before saving',
  } = options

  function clearError() {
    errorMessage.value = null
  }

  async function trySave(
    validator: {
      validate: () =>
        | { valid: boolean; errors: Record<string, string> }
        | Promise<{ valid: boolean; errors: Record<string, string> }>
    } | null,
    saveHandler: () => Promise<void>,
  ): Promise<boolean> {
    if (!validator) {
      errorMessage.value = 'Validator not available'
      return false
    }

    clearError()

    // Run before save hook
    if (onBeforeSave) {
      await onBeforeSave()
    }

    // Validate the form (supports both sync and async)
    const { valid, errors } = await Promise.resolve(validator.validate())

    if (!valid) {
      errorMessage.value = validationErrorMessage
      if (onValidationError) {
        await onValidationError(errors)
      }
      return false
    }

    // Attempt to save
    isSaving.value = true
    try {
      await saveHandler()
      if (onSuccess) {
        await onSuccess()
      }
      return true
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errorMessage.value = err.message || 'An error occurred while saving'
      if (onError) {
        await onError(err)
      }
      return false
    } finally {
      isSaving.value = false
    }
  }

  return {
    isSaving,
    errorMessage,
    clearError,
    trySave,
  }
}
