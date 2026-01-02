<template>
  <FSelect
    v-model="fieldValue"
    :options="controller.selectItems"
    :label="label"
    :multiple="multiple"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import FSelect from './FSelect.vue'

  /**
   * Interface for enum controllers used by FEnumSelect
   * Matches the EnumController interface from the web app
   */
  export interface EnumController {
    selectItems: Array<{ title: string; value: number }>
  }

  type EnumValue = string | number | null | (string | number)[]

  const props = defineProps<{
    /** Selected enum value(s) - single value when multiple is false, array when multiple is true */
    modelValue: EnumValue
    controller: EnumController
    label?: string
    /** Enable multi-select mode (default: false) */
    multiple?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: EnumValue]
  }>()

  const fieldValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })
</script>
