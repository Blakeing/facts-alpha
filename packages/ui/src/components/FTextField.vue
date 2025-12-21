<template>
  <v-text-field
    v-model="model"
    :hide-details="hideDetails"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
/**
 * FTextField - Wrapper for v-text-field
 */
import { useVModel } from '@vueuse/core'

export interface FTextFieldProps {
  modelValue?: string | number
  hideDetails?: boolean | 'auto'
}

const props = withDefaults(defineProps<FTextFieldProps>(), {
  modelValue: '',
  hideDetails: 'auto',
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const model = useVModel(props, 'modelValue', emit)
</script>
