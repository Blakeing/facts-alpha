<template>
  <FSelect
    :model-value="modelValue"
    :options="controller.selectItems"
    :label="label"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
  import type { EnumController } from '@/shared/lib/enums'
  import FSelect from './FSelect.vue'

  defineProps<{
    modelValue: string | null
    controller: EnumController
    label?: string
  }>()

  defineEmits<{
    'update:modelValue': [value: string | null]
  }>()
</script>
