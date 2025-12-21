<template>
  <v-text-field
    v-model="fieldValue"
    :error-messages="fieldError"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
  /**
   * FTextField - Wrapper for v-text-field
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   *
   * @example
   * // Standalone mode
   * <FTextField v-model="email" label="Email" />
   *
   * // Form-integrated mode (within useTypedForm context)
   * <FTextField name="user.email" label="Email" />
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  export interface FTextFieldProps {
    /** Field name for vee-validate form binding (enables form mode) */
    name?: string
    /** Value for standalone v-model usage */
    modelValue?: string | number
    /** Control error message visibility */
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FTextFieldProps>(), {
    name: undefined,
    modelValue: '',
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

  // Form-integrated mode: use vee-validate's useField
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string | number>(nameRef as unknown as string) : null

  // Computed value that switches between vee-validate and v-model
  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val as string | number
      } else {
        emit('update:modelValue', val as string | number)
      }
    },
  })

  // Error message from vee-validate (only in form mode)
  const fieldError = computed(() => field?.errorMessage.value)

  // Blur handler for validation trigger
  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
