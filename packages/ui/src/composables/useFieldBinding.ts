/**
 * useFieldBinding - Connects vee-validate fields to Vuetify components
 *
 * This composable bridges vee-validate's useField with Vuetify's
 * form component API, providing:
 * - Value binding via v-model
 * - Error message display
 * - Validation trigger on blur/input
 *
 * @example
 * // In a form component using vee-validate's form context
 * const { value, errorMessage, attrs } = useFieldBinding<string>('user.email')
 *
 * <v-text-field v-model="value" v-bind="attrs" />
 */

import { useField } from 'vee-validate'
import { computed, type MaybeRefOrGetter } from 'vue'

export interface FieldBindingOptions {
  /** Validate on blur instead of on change */
  validateOnBlur?: boolean
  /** Custom label for error messages */
  label?: string
}

export interface FieldBinding<T> {
  /** The field value for v-model binding */
  value: ReturnType<typeof useField<T>>['value']
  /** The error message string (empty if valid) */
  errorMessage: ReturnType<typeof useField<T>>['errorMessage']
  /** Props to spread onto Vuetify components */
  attrs: {
    'error-messages': string | undefined
    onBlur: () => void
  }
  /** Mark field as touched (triggers validation) */
  handleBlur: () => void
  /** Full vee-validate field meta */
  meta: ReturnType<typeof useField<T>>['meta']
}

/**
 * Creates a field binding for use with Vuetify form components
 *
 * @param name - The field path in the form (e.g., 'decedent.firstName')
 * @param options - Optional configuration
 * @returns Field binding with value, error message, and Vuetify attrs
 */
export function useFieldBinding<T = string>(
  name: MaybeRefOrGetter<string>,
  options: FieldBindingOptions = {},
): FieldBinding<T> {
  const { value, errorMessage, handleBlur, meta } = useField<T>(name, undefined, {
    // Sync with the form's validation schema
    syncVModel: false,
    label: options.label,
  })

  const attrs = computed(() => ({
    'error-messages': errorMessage.value || undefined,
    onBlur: handleBlur,
  }))

  return {
    value,
    errorMessage,
    attrs: attrs as unknown as FieldBinding<T>['attrs'],
    handleBlur,
    meta,
  }
}

/**
 * Creates multiple field bindings at once
 *
 * @example
 * const fields = useFieldBindings({
 *   firstName: 'user.firstName',
 *   lastName: 'user.lastName',
 *   email: 'user.email',
 * })
 *
 * <v-text-field v-model="fields.firstName.value" v-bind="fields.firstName.attrs" />
 */
export function useFieldBindings<T extends Record<string, string>>(
  fieldPaths: T,
): { [K in keyof T]: FieldBinding<string> } {
  const result = {} as { [K in keyof T]: FieldBinding<string> }

  for (const [key, path] of Object.entries(fieldPaths)) {
    result[key as keyof T] = useFieldBinding<string>(path)
  }

  return result
}
