/**
 * useTypedForm - Type-safe form management with vee-validate and Zod
 *
 * This composable provides a streamlined API for creating forms with:
 * - Zod schema validation
 * - Type-safe form values
 * - Submission handling
 * - Reset functionality
 *
 * @example
 * const { handleSubmit, resetForm, values, isSubmitting, errors } = useTypedForm({
 *   schema: caseFormSchema,
 *   initialValues: getDefaultCaseFormValues(),
 * })
 *
 * // In template: <form @submit="handleSubmit(onSuccess)">
 * const onSuccess = (values) => console.log(values)
 */

import { toTypedSchema } from '@vee-validate/zod'
import { useForm, type FormContext } from 'vee-validate'
import { computed, type ComputedRef } from 'vue'
import type { z } from 'zod'

export interface TypedFormOptions<TSchema extends z.ZodType> {
  /** Zod schema for validation */
  schema: TSchema
  /** Initial form values */
  initialValues?: z.infer<TSchema>
  /** Validate on mount */
  validateOnMount?: boolean
}

export interface TypedFormReturn<TSchema extends z.ZodType> {
  /** Current form values (reactive) */
  values: FormContext<z.infer<TSchema>>['values']
  /** Form errors by field path */
  errors: FormContext<z.infer<TSchema>>['errors']
  /** Whether the form is currently submitting */
  isSubmitting: FormContext<z.infer<TSchema>>['isSubmitting']
  /** Whether the form has been modified */
  meta: FormContext<z.infer<TSchema>>['meta']
  /** Submit handler - pass your success callback and get back an event handler */
  handleSubmit: (
    onSuccess: (values: z.infer<TSchema>) => void | Promise<void>,
  ) => (e?: Event) => Promise<void>
  /** Reset form to initial values */
  resetForm: FormContext<z.infer<TSchema>>['resetForm']
  /** Set a specific field value */
  setFieldValue: FormContext<z.infer<TSchema>>['setFieldValue']
  /** Set multiple field values */
  setValues: FormContext<z.infer<TSchema>>['setValues']
  /** Validate the entire form */
  validate: FormContext<z.infer<TSchema>>['validate']
  /** Validate a specific field */
  validateField: FormContext<z.infer<TSchema>>['validateField']
  /** Whether the form is valid (readonly computed) */
  isValid: ComputedRef<boolean>
  /** The underlying vee-validate form context */
  formContext: FormContext<z.infer<TSchema>>
}

/**
 * Creates a type-safe form with Zod validation
 */
export function useTypedForm<TSchema extends z.ZodType>(
  options: TypedFormOptions<TSchema>,
): TypedFormReturn<TSchema> {
  const { schema, initialValues, validateOnMount = false } = options

  // Convert Zod schema to vee-validate schema
  const validationSchema = toTypedSchema(schema)

  // Create the form
  const form = useForm<z.infer<TSchema>>({
    validationSchema,
    initialValues,
    validateOnMount,
  })

  // Wrap handleSubmit to provide type-safe callback handling
  const handleSubmit = (onSuccess: (values: z.infer<TSchema>) => void | Promise<void>) => {
    return form.handleSubmit(async (values) => {
      await onSuccess(values)
    }) as (e?: Event) => Promise<void>
  }

  // Computed validity check
  const isValid = computed(() => form.meta.value.valid)

  return {
    values: form.values,
    errors: form.errors,
    isSubmitting: form.isSubmitting,
    meta: form.meta,
    handleSubmit,
    resetForm: form.resetForm,
    setFieldValue: form.setFieldValue,
    setValues: form.setValues,
    validate: form.validate,
    validateField: form.validateField,
    isValid,
    formContext: form,
  }
}
