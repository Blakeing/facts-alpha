<template>
  <v-text-field
    v-model="displayValue"
    :label="label"
    :placeholder="placeholder || 'MM/DD/YYYY'"
    :hint="hint"
    :persistent-hint="persistentHint"
    :variant="variant"
    :density="density"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :prepend-inner-icon="prependInnerIcon"
    :rules="rules"
    :error-messages="errorMessages"
    :hide-details="hideDetails"
    type="date"
    v-bind="$attrs"
    @update:model-value="handleInput"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export type DatePickerVariant = 'outlined' | 'filled' | 'underlined' | 'solo' | 'solo-filled'
export type DatePickerDensity = 'default' | 'comfortable' | 'compact'
export type ValidationRule = (value: string | null) => boolean | string

export interface FDatePickerProps {
  /** v-model binding (ISO date string: YYYY-MM-DD) */
  modelValue?: string | null
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Hint text below field */
  hint?: string
  /** Always show hint */
  persistentHint?: boolean
  /** Visual variant */
  variant?: DatePickerVariant
  /** Field density */
  density?: DatePickerDensity
  /** Disable the field */
  disabled?: boolean
  /** Read-only mode */
  readonly?: boolean
  /** Show clear button */
  clearable?: boolean
  /** Icon inside field start */
  prependInnerIcon?: string
  /** Minimum selectable date (YYYY-MM-DD) */
  min?: string
  /** Maximum selectable date (YYYY-MM-DD) */
  max?: string
  /** Validation rules */
  rules?: ValidationRule[]
  /** External error messages */
  errorMessages?: string | string[]
  /** Hide validation messages */
  hideDetails?: boolean | 'auto'
}

const props = withDefaults(defineProps<FDatePickerProps>(), {
  modelValue: null,
  label: undefined,
  placeholder: undefined,
  hint: undefined,
  persistentHint: false,
  variant: 'outlined',
  density: 'compact',
  disabled: false,
  readonly: false,
  clearable: false,
  prependInnerIcon: 'mdi-calendar',
  min: undefined,
  max: undefined,
  rules: () => [],
  errorMessages: undefined,
  hideDetails: 'auto',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Display value for the native date input (YYYY-MM-DD format)
const displayValue = computed(() => props.modelValue || '')

function handleInput(value: string | null) {
  emit('update:modelValue', value || null)
}
</script>

