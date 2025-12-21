<template>
  <v-switch
    v-model="model"
    :label="label"
    :color="color"
    :disabled="disabled"
    :readonly="readonly"
    :inset="inset"
    :true-value="trueValue"
    :false-value="falseValue"
    :density="density"
    :hide-details="hideDetails"
    :rules="rules"
    :error-messages="errorMessages"
    v-bind="$attrs"
  >
    <template
      v-if="$slots.label"
      #label
    >
      <slot name="label" />
    </template>
  </v-switch>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  export type SwitchDensity = 'default' | 'comfortable' | 'compact'
  export type ValidationRule = (value: unknown) => boolean | string

  export interface FSwitchProps {
    /** v-model binding */
    modelValue?: boolean | string | number | null
    /** Switch label */
    label?: string
    /** Switch color when on */
    color?: string
    /** Disable the switch */
    disabled?: boolean
    /** Read-only mode */
    readonly?: boolean
    /** Use inset style */
    inset?: boolean
    /** Value when on */
    trueValue?: boolean | string | number
    /** Value when off */
    falseValue?: boolean | string | number
    /** Switch density */
    density?: SwitchDensity
    /** Hide validation messages */
    hideDetails?: boolean | 'auto'
    /** Validation rules */
    rules?: ValidationRule[]
    /** External error messages */
    errorMessages?: string | string[]
  }

  const props = withDefaults(defineProps<FSwitchProps>(), {
    modelValue: false,
    label: undefined,
    color: 'primary',
    disabled: false,
    readonly: false,
    inset: false,
    trueValue: true,
    falseValue: false,
    density: 'compact',
    hideDetails: 'auto',
    rules: () => [],
    errorMessages: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean | string | number | null]
  }>()

  const model = computed({
    get: () => props.modelValue,
    set: (value: boolean | string | number | null) => emit('update:modelValue', value),
  })
</script>
