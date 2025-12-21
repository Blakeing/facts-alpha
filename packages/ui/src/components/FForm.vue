<script lang="ts">
  /**
   * FForm - Form wrapper component with vee-validate + Zod integration
   *
   * Provides form context to child F* components and exposes form state
   * via scoped slots for flexible form UI composition.
   *
   * @example
   * <FForm
   *   :schema="userSchema"
   *   :initial-values="{ name: '', email: '' }"
   *   @submit="handleSubmit"
   * >
   *   <template #default="{ isValid, isDirty, isSubmitting }">
   *     <FTextField name="name" label="Name" />
   *     <FTextField name="email" label="Email" />
   *     <FButton :disabled="!isValid" :loading="isSubmitting" type="submit">
   *       Save
   *     </FButton>
   *   </template>
   * </FForm>
   */
  import type { z } from 'zod'

  // Form context injection key
  export const FORM_CONTEXT_KEY = Symbol('FFormContext')

  export interface FFormProps<T extends z.ZodType = z.ZodType> {
    /** Zod schema for validation */
    schema: T
    /** Initial form values */
    initialValues?: z.infer<T>
    /** Validate all fields on mount */
    validateOnMount?: boolean
  }

  export interface FFormSlotProps<T extends z.ZodType = z.ZodType> {
    /** Current form values */
    values: z.infer<T>
    /** Validation errors by field path */
    errors: Record<string, string | undefined>
    /** Whether form has been modified from initial values */
    isDirty: boolean
    /** Whether all validations pass */
    isValid: boolean
    /** Whether form is currently submitting */
    isSubmitting: boolean
    /** Map of touched field paths */
    touched: Record<string, boolean>
    /** Reset form to initial values */
    reset: (state?: { values?: z.infer<T> }) => void
    /** Submit the form programmatically */
    submit: () => Promise<void>
    /** Set a single field value */
    setFieldValue: (field: string, value: unknown) => void
    /** Set multiple field values */
    setValues: (values: Partial<z.infer<T>>) => void
    /** Validate all fields */
    validate: () => Promise<{ valid: boolean; errors: Record<string, string> }>
  }
</script>

<script lang="ts" setup>
  import { toTypedSchema } from '@vee-validate/zod'
  import { useForm } from 'vee-validate'
  import { computed, provide } from 'vue'
  import type { ZodType } from 'zod'

  const props = withDefaults(
    defineProps<{
      /** Zod schema for validation */
      schema: ZodType
      /** Initial form values */
      initialValues?: Record<string, unknown>
      /** Validate all fields on mount */
      validateOnMount?: boolean
    }>(),
    {
      initialValues: undefined,
      validateOnMount: false,
    },
  )

  const emit = defineEmits<{
    submit: [values: Record<string, unknown>]
  }>()

  // Convert Zod schema to vee-validate schema
  const validationSchema = computed(() => toTypedSchema(props.schema))

  // Create the form
  const form = useForm({
    validationSchema: validationSchema.value,
    initialValues: props.initialValues,
    validateOnMount: props.validateOnMount,
  })

  // Provide form context to child components
  provide(FORM_CONTEXT_KEY, form)

  // Computed states
  const isValid = computed(() => form.meta.value.valid)
  const isDirty = computed(() => form.meta.value.dirty)
  const isSubmitting = computed(() => form.isSubmitting.value)
  const touched = computed(() => {
    const result: Record<string, boolean> = {}
    const meta = form.meta.value
    if (meta.touched && typeof meta.touched === 'object') {
      for (const [key, value] of Object.entries(meta.touched)) {
        if (typeof value === 'boolean') {
          result[key] = value
        }
      }
    }
    return result
  })

  // Form values and errors
  const values = form.values
  const errors = form.errors

  // Form actions
  const resetForm = (state?: { values?: Record<string, unknown> }) => {
    form.resetForm(state)
  }

  const setFieldValue = form.setFieldValue
  const setValues = form.setValues
  const validate = form.validate

  // Internal submit handler
  const onFormSubmit = form.handleSubmit(async (formValues) => {
    emit('submit', formValues)
  })

  // Programmatic submit
  const submitForm = async () => {
    await onFormSubmit()
  }

  // Expose for parent component access
  defineExpose({
    values,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    touched,
    resetForm,
    submitForm,
    setFieldValue,
    setValues,
    validate,
    formContext: form,
  })
</script>

<template>
  <form @submit="onFormSubmit">
    <slot
      :errors="errors"
      :is-dirty="isDirty"
      :is-submitting="isSubmitting"
      :is-valid="isValid"
      :reset="resetForm"
      :set-field-value="setFieldValue"
      :set-values="setValues"
      :submit="submitForm"
      :touched="touched"
      :validate="validate"
      :values="values"
    />
  </form>
</template>
