<template>
  <v-date-input
    v-model="fieldValue"
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
   * All v-date-input props are supported via v-bind="$attrs".
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
   *
   * @example
   * // With Vuetify props (all passed through)
   * <FDatePicker
   *   v-model="date"
   *   label="Appointment"
   *   :min="minDate"
   *   :max="maxDate"
   *   prepend-inner-icon="mdi-calendar"
   *   hide-details="auto"
   * />
   */
  export interface FDatePickerProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Date value (Date object or ISO string) */
    modelValue?: Date | string | null
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FDatePickerProps>(), {
    name: undefined,
    modelValue: null,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: Date | string | null] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<Date | string | null>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val
      } else {
        emit('update:modelValue', val)
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
