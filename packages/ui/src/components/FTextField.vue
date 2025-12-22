<template>
  <v-text-field
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FTextField - Text input with validation support
   *
   * Thin wrapper around v-text-field. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/text-fields/
   *
   * @example
   * // With form context (recommended - auto error/blur + real-time clearing)
   * <FFormProvider :get-error="getError" :touch="touch" :validate-if-touched="validateIfTouched">
   *   <FTextField v-model="model.email" field="email" label="Email" />
   * </FFormProvider>
   *
   * @example
   * // Standalone (no validation)
   * <FTextField v-model="email" label="Email" />
   */
  export interface FTextFieldProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Value for v-model binding */
    modelValue?: string | number
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FTextFieldProps>(), {
    field: undefined,
    modelValue: '',
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number]
    blur: [event: FocusEvent]
  }>()

  // Inject form context (if provided by parent)
  const formContext = useFormContext()

  const fieldValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val as string | number),
  })

  // Error: form context (via field prop) > manual error prop
  const fieldError = computed(() => {
    if (props.field && formContext) {
      return formContext.getError(props.field)
    }
    return props.error
  })

  // Real-time validation: validate on input if field has been touched
  // This allows errors to clear immediately as user fixes them
  watch(
    () => props.modelValue,
    () => {
      if (props.field && formContext?.validateIfTouched) {
        formContext.validateIfTouched(props.field)
      }
    },
  )

  function handleBlur(e: FocusEvent) {
    // Auto-touch via form context if field prop is set
    if (props.field && formContext) {
      formContext.touch(props.field)
    }
    emit('blur', e)
  }
</script>
