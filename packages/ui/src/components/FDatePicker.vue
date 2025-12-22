<template>
  <v-date-input
    v-model="internalValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FDatePicker - Date input with calendar popup and validation support
   *
   * Uses ISO date strings (YYYY-MM-DD) externally, handles Date conversion internally.
   *
   * @example
   * // With form context (recommended)
   * <FFormProvider :get-error="getError" :touch="touch">
   *   <FDatePicker v-model="model.birthDate" field="birthDate" label="Birth Date" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FDatePicker v-model="date" label="Date" />
   */
  export interface FDatePickerProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Date value as ISO string (YYYY-MM-DD) or null */
    modelValue?: string | null
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useDate } from 'vuetify'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FDatePickerProps>(), {
    field: undefined,
    modelValue: null,
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | null]
    blur: [event: FocusEvent]
  }>()

  const formContext = useFormContext()
  const adapter = useDate()

  // Convert ISO string <-> Date for v-date-input
  const internalValue = computed({
    get: () => (props.modelValue ? adapter.parseISO(props.modelValue) : null),
    set: (val: Date | null) => {
      const strVal = val ? adapter.toISO(val) : null
      emit('update:modelValue', strVal)
    },
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
