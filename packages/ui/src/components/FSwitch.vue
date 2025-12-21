<template>
  <v-switch
    v-model="model"
    :hide-details="hideDetails"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
/**
 * FSwitch - Wrapper for v-switch
 */
import { useVModel } from '@vueuse/core'

export interface FSwitchProps {
  modelValue?: boolean | string | number | null
  hideDetails?: boolean | 'auto'
}

const props = withDefaults(defineProps<FSwitchProps>(), {
  modelValue: false,
  hideDetails: 'auto',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean | string | number | null] }>()
const model = useVModel(props, 'modelValue', emit)
</script>
