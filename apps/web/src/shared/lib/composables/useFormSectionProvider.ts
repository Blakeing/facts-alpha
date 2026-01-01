/**
 * shared/lib/composables/useFormSectionProvider.ts
 *
 * Composable to provide form context for form sections
 * Bridges section-level context to field-level components using the standard FormContext
 */

import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import { provideFormContext, type FormContext } from '@facts/ui'

export interface FormSectionEmits {
  (e: 'set-field', path: string, value: unknown): void
  (e: 'touch-field', path: string): void
  (e: 'validate'): void
}

/**
 * Provides form context for form section components
 * @param errorsByPath - Reactive errors by path (can be Ref or computed)
 * @param getValueFn - Function to get a value by path from the draft
 * @param emit - Emit function from defineEmits or compatible object
 */
export function useFormSectionProvider(
  errorsByPath: Ref<Record<string, string>> | ComputedRef<Record<string, string>>,
  getValueFn: (path: string) => unknown,
  emit:
    | FormSectionEmits
    | {
        'set-field': (path: string, value: unknown) => void
        'touch-field': (path: string) => void
        validate: () => void
      },
): void {
  const errorsByPathComputed = computed(() => {
    return 'value' in errorsByPath ? errorsByPath.value : errorsByPath
  })

  // Handle both function-style emit and object-style emit
  const onSetField =
    typeof emit === 'function'
      ? (path: string, value: unknown) => emit('set-field', path, value)
      : emit['set-field']

  const onTouchField =
    typeof emit === 'function' ? (path: string) => emit('touch-field', path) : emit['touch-field']

  const onValidate = typeof emit === 'function' ? () => emit('validate') : emit.validate

  // Provide standard FormContext with enhanced value support
  // Note: provide() must be called synchronously during setup, not in watchers or lifecycle hooks
  const context: FormContext = {
    getError: (path: string) => errorsByPathComputed.value[path],
    touch: onTouchField,
    validateIfTouched: (path: string) => {
      // If field is touched, validate it
      if (errorsByPathComputed.value[path]) {
        onValidate()
      }
    },
    getValue: (path: string) => {
      try {
        const value = getValueFn(path)
        // Ensure we return proper types - convert undefined to null, preserve valid falsy values like 0
        if (value === undefined || value === null) return null
        // Convert boolean false to null (invalid for form fields that expect string/number)
        if (typeof value === 'boolean') return null
        return value
      } catch {
        return null
      }
    },
    onUpdate: onSetField,
  }
  
  provideFormContext(context)
}

