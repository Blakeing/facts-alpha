<template>
  <v-radio-group
    v-model="model"
    :label="label"
    :disabled="disabled"
    :readonly="readonly"
    :inline="inline"
    :density="density"
    :hide-details="hideDetails"
    :rules="rules"
    :error-messages="errorMessages"
    v-bind="$attrs"
  >
    <v-radio
      v-for="option in options"
      :key="String(option.value)"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
      :color="color"
    />
  </v-radio-group>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export type RadioDensity = 'default' | 'comfortable' | 'compact'
export type ValidationRule = (value: unknown) => boolean | string

export interface RadioOption {
  /** Option value */
  value: string | number | boolean
  /** Option display label */
  label: string
  /** Disable this specific option */
  disabled?: boolean
}

export interface FRadioGroupProps {
  /** v-model binding */
  modelValue?: string | number | boolean | null
  /** Group label */
  label?: string
  /** Available options */
  options: RadioOption[]
  /** Radio button color */
  color?: string
  /** Disable all radio buttons */
  disabled?: boolean
  /** Read-only mode */
  readonly?: boolean
  /** Display inline (horizontal) */
  inline?: boolean
  /** Radio group density */
  density?: RadioDensity
  /** Hide validation messages */
  hideDetails?: boolean | 'auto'
  /** Validation rules */
  rules?: ValidationRule[]
  /** External error messages */
  errorMessages?: string | string[]
}

const props = withDefaults(defineProps<FRadioGroupProps>(), {
  modelValue: null,
  label: undefined,
  color: 'primary',
  disabled: false,
  readonly: false,
  inline: false,
  density: 'compact',
  hideDetails: 'auto',
  rules: () => [],
  errorMessages: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean | null]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: string | number | boolean | null) => emit('update:modelValue', value),
})
</script>

