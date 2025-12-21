<template>
  <v-checkbox
    v-model="fieldValue"
    :indeterminate="indeterminate"
    :error-messages="fieldError"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
  /**
   * FCheckbox - Wrapper for v-checkbox
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   *
   * Attrs pass through to v-checkbox (label, color, true-value, false-value, etc.)
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  type CheckboxValue = boolean | string | number | null

  export interface FCheckboxProps {
    /** Field name for vee-validate form binding */
    name?: string
    modelValue?: CheckboxValue
    indeterminate?: boolean
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FCheckboxProps>(), {
    name: undefined,
    modelValue: false,
    indeterminate: false,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: CheckboxValue] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<CheckboxValue>(nameRef as unknown as string) : null

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
