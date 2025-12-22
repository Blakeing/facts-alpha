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
   * FDatePicker - Date input with calendar popup
   *
   * Thin wrapper around Vuetify's v-date-input with vee-validate integration.
   * Uses ISO date strings (YYYY-MM-DD) externally, handles Date conversion internally
   * via Vuetify's date composable.
   *
   * @see https://vuetifyjs.com/en/components/date-inputs/
   *
   * @example
   * // Standalone
   * <FDatePicker v-model="date" label="Birth Date" />
   *
   * @example
   * // Form-integrated (auto-binds to vee-validate)
   * <FForm :schema="schema">
   *   <FDatePicker name="birthDate" label="Birth Date" />
   * </FForm>
   */
  export interface FDatePickerProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Date value as ISO string (YYYY-MM-DD) or null */
    modelValue?: string | null
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'
  import { useDate } from 'vuetify'

  const props = withDefaults(defineProps<FDatePickerProps>(), {
    name: undefined,
    modelValue: null,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string | null>(nameRef as unknown as string) : null

  // Use Vuetify's date adapter for consistent parsing/formatting
  const adapter = useDate()

  // Internal value for v-date-input (handles Date <-> ISO string conversion)
  const internalValue = computed({
    get: () => {
      const value = field ? field.value.value : props.modelValue
      // Convert ISO string to Date for v-date-input
      return value ? adapter.parseISO(value) : null
    },
    set: (val: Date | null) => {
      // Convert Date back to ISO string
      const strVal = val ? adapter.toISO(val) : null
      if (field) {
        field.value.value = strVal
      } else {
        emit('update:modelValue', strVal)
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
