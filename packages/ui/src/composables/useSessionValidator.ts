import { ref, type Ref } from 'vue'
import type { z, ZodError, ZodIssue } from 'zod'

/**
 * Return type for useSessionValidator composable
 */
export interface UseSessionValidatorReturn {
  /** Current validation errors by field path */
  errors: Ref<Record<string, string>>
  /** Set of touched field paths */
  touched: Ref<Set<string>>
  /** Whether the form is currently valid (no errors) */
  isValid: Ref<boolean>
  /** Validate a single field (call on blur) */
  validateField: (path: string) => void
  /** Validate field only if already touched (call on input for real-time clearing) */
  validateIfTouched: (path: string) => void
  /** Validate all fields (call on save) */
  validate: () => { valid: boolean; errors: Record<string, string> }
  /** Get error message for a field path */
  getError: (path: string) => string | undefined
  /** Mark field as touched and validate it */
  touch: (path: string) => void
  /** Clear error for a field */
  clearError: (path: string) => void
  /** Clear all errors */
  clearErrors: () => void
  /** Check if a field has been touched */
  isTouched: (path: string) => boolean
}

/**
 * Extract field-level errors from a ZodError
 * Converts Zod's issue array into a flat path -> message map
 */
function extractFieldErrors(zodError: ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of zodError.issues) {
    const path = issue.path.join('.')
    // Only keep first error per field
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}

/**
 * Find issues for a specific field path from ZodError
 */
function getIssuesForPath(issues: ZodIssue[], targetPath: string): ZodIssue[] {
  return issues.filter((issue) => {
    const issuePath = issue.path.join('.')
    // Match exact path or parent path (for nested validation)
    return issuePath === targetPath || issuePath.startsWith(`${targetPath}.`)
  })
}

/**
 * useSessionValidator - Validates external data against Zod schema
 *
 * Unlike useFormModel which owns its data, this validates data you provide.
 * Use this when your data lives elsewhere (like useContractSession).
 *
 * @example
 * ```ts
 * const session = useContractSession(...)
 *
 * const { getError, touch, validateIfTouched, validate } = useSessionValidator(
 *   contractSchema,
 *   () => session.toValidationData() // getter for current session state
 * )
 *
 * // Use with FFormProvider
 * <FFormProvider :get-error="getError" :touch="touch" :validate-if-touched="validateIfTouched">
 *   <ContractGeneral :session="session" />
 * </FFormProvider>
 * ```
 */
export function useSessionValidator<TSchema extends z.ZodType>(
  schema: TSchema,
  getData: () => z.infer<TSchema>,
): UseSessionValidatorReturn {
  // Reactive state
  const errors = ref<Record<string, string>>({})
  const touched = ref<Set<string>>(new Set())
  const isValid = ref(true)

  /**
   * Validate a single field path
   */
  function validateField(path: string): void {
    // Clear existing error for this field
    delete errors.value[path]

    // Validate the entire model (Zod validates the whole schema)
    const result = schema.safeParse(getData())

    if (!result.success) {
      // Find errors for this specific path
      const fieldIssues = getIssuesForPath(result.error.issues, path)
      for (const issue of fieldIssues) {
        const issuePath = issue.path.join('.')
        if (!errors.value[issuePath]) {
          errors.value[issuePath] = issue.message
        }
      }
    }

    // Update overall validity
    isValid.value = Object.keys(errors.value).length === 0
  }

  /**
   * Validate field only if it has been touched
   * Call this on input for real-time error clearing
   */
  function validateIfTouched(path: string): void {
    if (touched.value.has(path)) {
      validateField(path)
    }
  }

  /**
   * Validate all fields (for save)
   */
  function validate(): { valid: boolean; errors: Record<string, string> } {
    const result = schema.safeParse(getData())

    if (result.success) {
      errors.value = {}
      isValid.value = true
      return { valid: true, errors: {} }
    }

    const fieldErrors = extractFieldErrors(result.error)
    errors.value = fieldErrors
    isValid.value = false

    // Mark all error fields as touched
    for (const path of Object.keys(fieldErrors)) {
      touched.value.add(path)
    }

    return { valid: false, errors: fieldErrors }
  }

  /**
   * Get error message for a field
   */
  function getError(path: string): string | undefined {
    return errors.value[path]
  }

  /**
   * Mark field as touched and validate it
   */
  function touch(path: string): void {
    touched.value.add(path)
    validateField(path)
  }

  /**
   * Clear error for a specific field
   */
  function clearError(path: string): void {
    delete errors.value[path]
    isValid.value = Object.keys(errors.value).length === 0
  }

  /**
   * Clear all errors
   */
  function clearErrors(): void {
    errors.value = {}
    isValid.value = true
  }

  /**
   * Check if a field has been touched
   */
  function isTouched(path: string): boolean {
    return touched.value.has(path)
  }

  return {
    errors,
    touched,
    isValid: isValid as Ref<boolean>,
    validateField,
    validateIfTouched,
    validate,
    getError,
    touch,
    clearError,
    clearErrors,
    isTouched,
  }
}
