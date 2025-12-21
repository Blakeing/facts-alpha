<template>
  <v-checkbox
    v-model="model"
    :hide-details="hideDetails"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
/**
 * FCheckbox - Wrapper for v-checkbox
 */
import { useVModel } from '@vueuse/core'

export interface FCheckboxProps {
  modelValue?: boolean | string | number | null
  hideDetails?: boolean | 'auto'
}

const props = withDefaults(defineProps<FCheckboxProps>(), {
  modelValue: false,
  hideDetails: 'auto',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean | string | number | null] }>()
const model = useVModel(props, 'modelValue', emit)
</script>
