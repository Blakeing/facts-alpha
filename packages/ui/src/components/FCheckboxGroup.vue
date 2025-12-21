<template>
  <div>
    <label v-if="label" class="text-body-2 text-medium-emphasis d-block mb-2">
      {{ label }}
    </label>
    <v-checkbox
      v-for="option in options"
      :key="String(option.value)"
      v-model="model"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
      :hide-details="hideDetails"
      v-bind="$attrs"
    />
  </div>
</template>

<script lang="ts" setup>
/**
 * FCheckboxGroup - Multiple checkboxes with options array API
 */
import { useVModel } from '@vueuse/core'

export type CheckboxOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export interface FCheckboxGroupProps {
  modelValue?: (string | number)[]
  label?: string
  options: CheckboxOption[]
  hideDetails?: boolean | 'auto'
}

const props = withDefaults(defineProps<FCheckboxGroupProps>(), {
  modelValue: () => [],
  label: undefined,
  hideDetails: 'auto',
})

const emit = defineEmits<{ 'update:modelValue': [value: (string | number)[]] }>()
const model = useVModel(props, 'modelValue', emit)
</script>
