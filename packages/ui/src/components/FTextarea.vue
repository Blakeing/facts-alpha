<template>
  <v-textarea
    v-model="model"
    :hide-details="hideDetails"
    :auto-grow="autoGrow"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
/**
 * FTextarea - Wrapper for v-textarea
 */
import { useVModel } from '@vueuse/core'

export interface FTextareaProps {
  modelValue?: string
  hideDetails?: boolean | 'auto'
  autoGrow?: boolean
}

const props = withDefaults(defineProps<FTextareaProps>(), {
  modelValue: '',
  hideDetails: 'auto',
  autoGrow: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const model = useVModel(props, 'modelValue', emit)
</script>
