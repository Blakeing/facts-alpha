<template>
  <v-checkbox
    v-model="model"
    :label="label"
    :color="color"
    :disabled="disabled"
    :readonly="readonly"
    :indeterminate="indeterminate"
    :true-value="trueValue"
    :false-value="falseValue"
    :density="density"
    :hide-details="hideDetails"
    :rules="rules"
    :error-messages="errorMessages"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export type CheckboxDensity = 'default' | 'comfortable' | 'compact'
export type ValidationRule = (value: unknown) => boolean | string

export interface FCheckboxProps {
  /** v-model binding */
  modelValue?: boolean | string | number | null
  /** Checkbox label */
  label?: string
  /** Checkbox color */
  color?: string
  /** Disable the checkbox */
  disabled?: boolean
  /** Read-only mode */
  readonly?: boolean
  /** Show indeterminate state */
  indeterminate?: boolean
  /** Value when checked */
  trueValue?: unknown
  /** Value when unchecked */
  falseValue?: unknown
  /** Checkbox density */
  density?: CheckboxDensity
  /** Hide validation messages */
  hideDetails?: boolean | 'auto'
  /** Validation rules */
  rules?: ValidationRule[]
  /** External error messages */
  errorMessages?: string | string[]
}

const props = withDefaults(defineProps<FCheckboxProps>(), {
  modelValue: false,
  label: undefined,
  color: 'primary',
  disabled: false,
  readonly: false,
  indeterminate: false,
  trueValue: true,
  falseValue: false,
  density: 'compact',
  hideDetails: 'auto',
  rules: () => [],
  errorMessages: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string | number | null]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: boolean | string | number | null) => emit('update:modelValue', value),
})
</script>

