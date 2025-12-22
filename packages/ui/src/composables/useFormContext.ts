import { inject, provide, type InjectionKey } from 'vue'

/**
 * Form context for automatic field error/touch binding
 */
export interface FormContext {
  /** Get error message for a field path */
  getError: (path: string) => string | undefined
  /** Mark field as touched (triggers validation) */
  touch: (path: string) => void
  /** Validate if touched (for real-time error clearing on input) */
  validateIfTouched?: (path: string) => void
}

/**
 * Injection key for form context
 */
export const FORM_CONTEXT_KEY: InjectionKey<FormContext> = Symbol('FormContext')

/**
 * Provide form context to child components
 *
 * @example
 * ```ts
 * const { getError, touch } = useFormModel(schema, defaults)
 * provideFormContext({ getError, touch })
 * ```
 */
export function provideFormContext(context: FormContext): void {
  provide(FORM_CONTEXT_KEY, context)
}

/**
 * Inject form context in child components
 * Returns undefined if no context is provided (standalone usage)
 */
export function useFormContext(): FormContext | undefined {
  return inject(FORM_CONTEXT_KEY, undefined)
}
