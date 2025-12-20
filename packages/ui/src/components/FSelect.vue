<template>
  <v-select
    v-model="model"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :persistent-hint="persistentHint"
    :variant="variant"
    :density="density"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :multiple="multiple"
    :chips="chips"
    :prepend-inner-icon="prependInnerIcon"
    :rules="rules"
    :error-messages="errorMessages"
    :hide-details="hideDetails"
    :return-object="returnObject"
    v-bind="$attrs"
  >
    <template v-if="$slots.item" #item="slotProps">
      <slot name="item" v-bind="slotProps" />
    </template>
    <template v-if="$slots.selection" #selection="slotProps">
      <slot name="selection" v-bind="slotProps" />
    </template>
  </v-select>
</template>

<script lang="ts" setup generic="T">
export type SelectVariant = 'outlined' | 'filled' | 'underlined' | 'solo' | 'solo-filled'
export type SelectDensity = 'default' | 'comfortable' | 'compact'
export type ValidationRule = (value: unknown) => boolean | string

export interface FSelectProps<T> {
  /** v-model binding */
  modelValue?: T | T[] | null
  /** Array of items to select from */
  items: T[]
  /** Property name for display text (or function) */
  itemTitle?: string | ((item: T) => string)
  /** Property name for value (or function) */
  itemValue?: string | ((item: T) => unknown)
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Hint text below field */
  hint?: string
  /** Always show hint */
  persistentHint?: boolean
  /** Visual variant */
  variant?: SelectVariant
  /** Field density */
  density?: SelectDensity
  /** Disable the field */
  disabled?: boolean
  /** Read-only mode */
  readonly?: boolean
  /** Show clear button */
  clearable?: boolean
  /** Allow multiple selections */
  multiple?: boolean
  /** Show selections as chips */
  chips?: boolean
  /** Icon inside field start */
  prependInnerIcon?: string
  /** Validation rules */
  rules?: ValidationRule[]
  /** External error messages */
  errorMessages?: string | string[]
  /** Hide validation messages */
  hideDetails?: boolean | 'auto'
  /** Return full object instead of just value */
  returnObject?: boolean
}

const props = withDefaults(defineProps<FSelectProps<T>>(), {
  modelValue: null,
  itemTitle: 'title',
  itemValue: 'value',
  label: undefined,
  placeholder: undefined,
  hint: undefined,
  persistentHint: false,
  variant: 'outlined',
  density: 'comfortable',
  disabled: false,
  readonly: false,
  clearable: false,
  multiple: false,
  chips: false,
  prependInnerIcon: undefined,
  rules: () => [],
  errorMessages: undefined,
  hideDetails: 'auto',
  returnObject: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: T | T[] | null]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

