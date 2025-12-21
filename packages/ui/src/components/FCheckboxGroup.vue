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
      v-model="model"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
      :color="option.color"
      :hide-details="hideDetails"
    />
  </div>
</template>

<script lang="ts" setup>
  /**
   * FCheckboxGroup - Multiple checkboxes with options array API
   *
   * Mirrors Vuetify's checkbox array pattern where v-model is an array
   * and each checkbox's value is added/removed from it.
   */
  import { useVModel } from '@vueuse/core'

  export type CheckboxOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FCheckboxGroupProps {
    modelValue?: (string | number)[]
    label?: string
    options: CheckboxOption[]
    inline?: boolean
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FCheckboxGroupProps>(), {
    modelValue: () => [],
    label: undefined,
    inline: false,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: (string | number)[]] }>()
  const model = useVModel(props, 'modelValue', emit)
</script>
