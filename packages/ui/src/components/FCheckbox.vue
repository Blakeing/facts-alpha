<template>
  <v-checkbox
    v-model="model"
    :indeterminate="indeterminate"
    :hide-details="hideDetails"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
  /**
   * FCheckbox - Wrapper for v-checkbox
   *
   * Attrs pass through to v-checkbox (label, color, true-value, false-value, etc.)
   */
  import { useVModel } from '@vueuse/core'

  export interface FCheckboxProps {
    modelValue?: boolean | string | number | null
    indeterminate?: boolean
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FCheckboxProps>(), {
    modelValue: false,
    indeterminate: false,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: boolean | string | number | null] }>()
  const model = useVModel(props, 'modelValue', emit)
</script>
