<template>
  <v-textarea
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FTextarea - Multiline text input with validation support
   *
   * @example
   * // With form context (recommended)
   * <FFormProvider :get-error="getError" :touch="touch">
   *   <FTextarea v-model="model.notes" field="notes" label="Notes" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FTextarea v-model="notes" label="Notes" />
   */
  export interface FTextareaProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Value for v-model binding */
    modelValue?: string
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FTextareaProps>(), {
    field: undefined,
    modelValue: '',
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    blur: [event: FocusEvent]
  }>()

  const formContext = useFormContext()

  const fieldValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val as string),
  })

  const fieldError = computed(() => {
    if (props.field && formContext) {
      return formContext.getError(props.field)
    }
    return props.error
  })

  // Real-time validation for touched fields
  watch(
    () => props.modelValue,
    () => {
      if (props.field && formContext?.validateIfTouched) {
        formContext.validateIfTouched(props.field)
      }
    },
  )

  function handleBlur(e: FocusEvent) {
    if (props.field && formContext) {
      formContext.touch(props.field)
    }
    emit('blur', e)
  }
</script>
