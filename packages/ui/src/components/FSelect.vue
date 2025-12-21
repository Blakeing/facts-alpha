<template>
  <v-select
    v-model="fieldValue"
    :items="options"
    :error-messages="fieldError"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
  /**
   * FSelect - Wrapper for v-select
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  export type SelectOption = {
    title: string
    value: string | number
    disabled?: boolean
  }

  type SelectValue = string | number | (string | number)[] | null

  export interface FSelectProps {
    /** Field name for vee-validate form binding */
    name?: string
    modelValue?: SelectValue
    options: SelectOption[]
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FSelectProps>(), {
    name: undefined,
    modelValue: null,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: SelectValue] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<SelectValue>(nameRef as unknown as string) : null

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
