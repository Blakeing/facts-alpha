<template>
  <div class="f-checkbox-group">
    <div v-if="label" class="f-checkbox-group__label text-body-2 text-medium-emphasis mb-2">
      {{ label }}
    </div>
    <div :class="groupClass">
      <v-checkbox
        v-for="option in options"
        :key="String(option.value)"
        v-model="model"
        :label="option.label"
        :value="option.value"
        :disabled="disabled || option.disabled"
        :color="color"
        :density="density"
        hide-details
        v-bind="$attrs"
      />
    </div>
    <div v-if="hint && !hideDetails" class="f-checkbox-group__hint text-caption text-medium-emphasis mt-1">
      {{ hint }}
    </div>
    <div v-if="errorMessages?.length" class="f-checkbox-group__error text-caption text-error mt-1">
      {{ Array.isArray(errorMessages) ? errorMessages[0] : errorMessages }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export type CheckboxDensity = 'default' | 'comfortable' | 'compact'

export interface CheckboxOption {
  /** Option value */
  value: string | number
  /** Option display label */
  label: string
  /** Disable this specific option */
  disabled?: boolean
}

export interface FCheckboxGroupProps {
  /** v-model binding (array of selected values) */
  modelValue?: (string | number)[]
  /** Group label */
  label?: string
  /** Available options */
  options: CheckboxOption[]
  /** Disable all checkboxes */
  disabled?: boolean
  /** Checkbox color */
  color?: string
  /** Checkbox density */
  density?: CheckboxDensity
  /** Display inline (horizontal) */
  inline?: boolean
  /** Hint text */
  hint?: string
  /** Hide validation messages */
  hideDetails?: boolean
  /** External error messages */
  errorMessages?: string | string[]
}

const props = withDefaults(defineProps<FCheckboxGroupProps>(), {
  modelValue: () => [],
  label: undefined,
  disabled: false,
  color: 'primary',
  density: 'compact',
  inline: false,
  hint: undefined,
  hideDetails: false,
  errorMessages: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: (string | number)[]) => emit('update:modelValue', value),
})

const groupClass = computed(() => ({
  'f-checkbox-group__options': true,
  'd-flex flex-wrap ga-4': props.inline,
}))
</script>

<style scoped>
.f-checkbox-group__options:not(.d-flex) {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>

