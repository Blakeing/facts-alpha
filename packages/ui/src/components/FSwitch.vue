<template>
  <v-switch
    v-model="fieldValue"
    :error-messages="fieldError"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
  /**
   * FSwitch - Wrapper for v-switch
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  type SwitchValue = boolean | string | number | null

  export interface FSwitchProps {
    /** Field name for vee-validate form binding */
    name?: string
    modelValue?: SwitchValue
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FSwitchProps>(), {
    name: undefined,
    modelValue: false,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: SwitchValue] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<SwitchValue>(nameRef as unknown as string) : null

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
