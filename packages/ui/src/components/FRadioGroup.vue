<template>
  <v-radio-group
    v-model="fieldValue"
    :label="label"
    :inline="inline"
    :error-messages="fieldError"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @blur="handleBlur"
  >
    <v-radio
      v-for="option in options"
      :key="String(option.value)"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
      :color="option.color"
    />
  </v-radio-group>
</template>

<script lang="ts" setup>
  /**
   * FRadioGroup - Radio group with options array API
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   *
   * Mirrors Vuetify's v-radio-group pattern. Attrs pass through to
   * the group (e.g., color, density, rules).
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  export type RadioOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FRadioGroupProps {
    /** Field name for vee-validate form binding */
    name?: string
    modelValue?: string | number | null
    label?: string
    options: RadioOption[]
    inline?: boolean
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FRadioGroupProps>(), {
    name: undefined,
    modelValue: null,
    label: undefined,
    inline: false,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string | number | null] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string | number | null>(nameRef as unknown as string) : null

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
