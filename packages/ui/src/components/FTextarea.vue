<template>
  <v-textarea
    v-model="fieldValue"
    :error-messages="fieldError"
    :hide-details="hideDetails"
    :auto-grow="autoGrow"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
  /**
   * FTextarea - Wrapper for v-textarea
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  export interface FTextareaProps {
    /** Field name for vee-validate form binding */
    name?: string
    modelValue?: string
    hideDetails?: boolean | 'auto'
    autoGrow?: boolean
  }

  const props = withDefaults(defineProps<FTextareaProps>(), {
    name: undefined,
    modelValue: '',
    hideDetails: 'auto',
    autoGrow: true,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val as string
      } else {
        emit('update:modelValue', val as string)
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
