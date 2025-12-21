<template>
  <v-text-field
    v-model="fieldValue"
    type="date"
    :error-messages="fieldError"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
  /**
   * FDatePicker - Date input using native date type
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  export interface FDatePickerProps {
    /** Field name for vee-validate form binding */
    name?: string
    modelValue?: string | null
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FDatePickerProps>(), {
    name: undefined,
    modelValue: null,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string | null>(nameRef as unknown as string) : null

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
