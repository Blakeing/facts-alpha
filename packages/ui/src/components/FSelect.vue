<template>
  <v-select
    v-model="model"
    :items="options"
    :hide-details="hideDetails"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
/**
 * FSelect - Wrapper for v-select
 */
import { useVModel } from '@vueuse/core'

export type SelectOption = {
  title: string
  value: string | number
  disabled?: boolean
}

export interface FSelectProps {
  modelValue?: string | number | (string | number)[] | null
  options: SelectOption[]
  hideDetails?: boolean | 'auto'
}

const props = withDefaults(defineProps<FSelectProps>(), {
  modelValue: null,
  hideDetails: 'auto',
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number | (string | number)[] | null] }>()
const model = useVModel(props, 'modelValue', emit)
</script>
