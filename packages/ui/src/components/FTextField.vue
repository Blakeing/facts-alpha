<template>
  <v-text-field
    v-model="model"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :persistent-hint="persistentHint"
    :type="type"
    :variant="variant"
    :density="density"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :prepend-inner-icon="prependInnerIcon"
    :append-inner-icon="appendInnerIcon"
    :rules="rules"
    :error-messages="errorMessages"
    :hide-details="hideDetails"
    :autofocus="autofocus"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
export type TextFieldVariant = 'outlined' | 'filled' | 'underlined' | 'solo' | 'solo-filled'
export type TextFieldDensity = 'default' | 'comfortable' | 'compact'
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
export type ValidationRule = (value: string) => boolean | string

export interface FTextFieldProps {
  /** v-model binding */
  modelValue?: string | number
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Hint text below field */
  hint?: string
  /** Always show hint */
  persistentHint?: boolean
  /** Input type */
  type?: InputType
  /** Visual variant */
  variant?: TextFieldVariant
  /** Field density */
  density?: TextFieldDensity
  /** Disable the field */
  disabled?: boolean
  /** Read-only mode */
  readonly?: boolean
  /** Show clear button */
  clearable?: boolean
  /** Icon inside field start */
  prependInnerIcon?: string
  /** Icon inside field end */
  appendInnerIcon?: string
  /** Validation rules */
  rules?: ValidationRule[]
  /** External error messages */
  errorMessages?: string | string[]
  /** Hide validation messages */
  hideDetails?: boolean | 'auto'
  /** Auto focus on mount */
  autofocus?: boolean
}

const props = withDefaults(defineProps<FTextFieldProps>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  hint: undefined,
  persistentHint: false,
  type: 'text',
  variant: 'outlined',
  density: 'comfortable',
  disabled: false,
  readonly: false,
  clearable: false,
  prependInnerIcon: undefined,
  appendInnerIcon: undefined,
  rules: () => [],
  errorMessages: undefined,
  hideDetails: 'auto',
  autofocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

