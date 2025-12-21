<template>
  <v-radio-group
    v-model="model"
    :label="label"
    :inline="inline"
    :hide-details="hideDetails"
    v-bind="$attrs"
  >
    <v-radio
      v-for="option in options"
      :key="String(option.value)"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
      :color="option.color"
    />
  </v-radio-group>
</template>

<script lang="ts" setup>
  /**
   * FRadioGroup - Radio group with options array API
   *
   * Mirrors Vuetify's v-radio-group pattern. Attrs pass through to
   * the group (e.g., color, density, rules).
   */
  import { useVModel } from '@vueuse/core'

  export type RadioOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FRadioGroupProps {
    modelValue?: string | number | null
    label?: string
    options: RadioOption[]
    inline?: boolean
    hideDetails?: boolean | 'auto'
  }

  const props = withDefaults(defineProps<FRadioGroupProps>(), {
    modelValue: null,
    label: undefined,
    inline: false,
    hideDetails: 'auto',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string | number | null] }>()
  const model = useVModel(props, 'modelValue', emit)
</script>
