<template>
  <v-textarea
    v-model="model"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :persistent-hint="persistentHint"
    :variant="variant"
    :density="density"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :rows="rows"
    :max-rows="maxRows"
    :auto-grow="autoGrow"
    :no-resize="noResize"
    :counter="counter"
    :rules="rules"
    :error-messages="errorMessages"
    :hide-details="hideDetails"
    :autofocus="autofocus"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export type TextareaVariant = 'outlined' | 'filled' | 'underlined' | 'solo' | 'solo-filled'
export type TextareaDensity = 'default' | 'comfortable' | 'compact'
export type ValidationRule = (value: string) => boolean | string

export interface FTextareaProps {
  /** v-model binding */
  modelValue?: string
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Hint text below field */
  hint?: string
  /** Always show hint */
  persistentHint?: boolean
  /** Visual variant */
  variant?: TextareaVariant
  /** Field density */
  density?: TextareaDensity
  /** Disable the field */
  disabled?: boolean
  /** Read-only mode */
  readonly?: boolean
  /** Show clear button */
  clearable?: boolean
  /** Number of rows */
  rows?: string | number
  /** Maximum rows when auto-grow is enabled */
  maxRows?: string | number
  /** Auto-grow height based on content */
  autoGrow?: boolean
  /** Disable manual resize */
  noResize?: boolean
  /** Show character counter */
  counter?: boolean | number | string
  /** Validation rules */
  rules?: ValidationRule[]
  /** External error messages */
  errorMessages?: string | string[]
  /** Hide validation messages */
  hideDetails?: boolean | 'auto'
  /** Auto focus on mount */
  autofocus?: boolean
}

const props = withDefaults(defineProps<FTextareaProps>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  hint: undefined,
  persistentHint: false,
  variant: 'outlined',
  density: 'compact',
  disabled: false,
  readonly: false,
  clearable: false,
  rows: 3,
  maxRows: undefined,
  autoGrow: false,
  noResize: false,
  counter: false,
  rules: () => [],
  errorMessages: undefined,
  hideDetails: 'auto',
  autofocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

