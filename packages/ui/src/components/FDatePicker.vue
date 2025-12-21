<template>
  <v-text-field
    v-model="model"
    type="date"
    :hide-details="hideDetails"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
/**
 * FDatePicker - Date input using native date type
 */
import { useVModel } from '@vueuse/core'

export interface FDatePickerProps {
  modelValue?: string | null
  hideDetails?: boolean | 'auto'
}

const props = withDefaults(defineProps<FDatePickerProps>(), {
  modelValue: null,
  hideDetails: 'auto',
})

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
const model = useVModel(props, 'modelValue', emit)
</script>
