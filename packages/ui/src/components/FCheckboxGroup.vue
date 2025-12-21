<template>
  <div
    :class="['d-flex', inline ? 'flex-row flex-wrap ga-4' : 'flex-column']"
    v-bind="$attrs"
  >
    <v-label
      v-if="label"
      class="mb-2"
      >{{ label }}</v-label
    >
    <v-checkbox
      v-for="option in options"
      :key="String(option.value)"
      v-model="fieldValue"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
      :color="option.color"
      :error-messages="fieldError"
      :hide-details="hideDetails"
      @blur="handleBlur"
    />
  </div>
</template>

<script lang="ts" setup>
  /**
   * FCheckboxGroup - Multiple checkboxes with options array API
   *
   * Supports two modes:
   * 1. Standalone: Use v-model for value binding
   * 2. Form-integrated: Provide `name` prop to auto-bind to vee-validate form context
   *
   * Mirrors Vuetify's checkbox array pattern where v-model is an array
   * and each checkbox's value is added/removed from it.
   */
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  export type CheckboxOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FCheckboxGroupProps {
    /** Field name for vee-validate form binding */
    name?: string
    modelValue?: (string | number)[]
    label?: string
    options: CheckboxOption[]
    inline?: boolean
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FCheckboxGroupProps>(), {
    name: undefined,
    modelValue: () => [],
    label: undefined,
    inline: false,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: (string | number)[]] }>()

  // Form-integrated mode
  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<(string | number)[]>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val as (string | number)[]
      } else {
        emit('update:modelValue', val as (string | number)[])
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
