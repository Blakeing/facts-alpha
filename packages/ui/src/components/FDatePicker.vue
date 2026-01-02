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
   * Accepts ISO date strings (YYYY-MM-DD) or full ISO datetime strings (e.g., "2024-01-15T00:00:00Z").
   * Automatically normalizes to YYYY-MM-DD format internally. Handles Date conversion internally.
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
    /** Date value as ISO string (YYYY-MM-DD or full ISO datetime) or null */
    modelValue?: string | null
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { formatDate } from '@facts/utils'
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

  /**
   * Normalize date string to YYYY-MM-DD format
   * Handles both full ISO strings (e.g., "2024-01-15T00:00:00Z") and date-only strings
   */
  function normalizeDateString(date: string | null | undefined): string | null {
    if (!date) return null
    // Use formatDate to normalize - it handles parsing and formatting
    return formatDate(date, 'iso') || null
  }

  // Convert ISO string <-> Date for v-date-input
  const internalValue = computed({
    get: () => {
      // If field prop is set and context provides getValue, use it
      let dateValue = props.modelValue
      if (props.field && formContext?.getValue) {
        const contextValue = formContext.getValue(props.field)
        dateValue = contextValue !== undefined ? (contextValue as string | null) : null
      }
      // Normalize the date string to YYYY-MM-DD format before parsing
      const normalized = normalizeDateString(dateValue)
      return normalized ? adapter.parseISO(normalized) : null
    },
    set: (val: Date | null) => {
      const strVal = val ? adapter.toISO(val) : null
      emit('update:modelValue', strVal)
      // Also update context if available
      if (props.field && formContext?.onUpdate) {
        formContext.onUpdate(props.field, strVal)
      }
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
