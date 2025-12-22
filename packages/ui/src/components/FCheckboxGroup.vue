<template>
  <div v-bind="$attrs">
    <v-label
      v-if="label"
      class="mb-2"
    >
      {{ label }}
    </v-label>
    <div :class="['d-flex', inline ? 'flex-row flex-wrap ga-4' : 'flex-column']">
      <v-checkbox
        v-for="option in options"
        :key="String(option.value)"
        v-model="fieldValue"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
        :color="option.color"
        :error-messages="fieldError"
        hide-details="auto"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<script lang="ts">
  /**
   * FCheckboxGroup - Multiple checkboxes with validation support
   *
   * @example
   * // With form context
   * <FFormProvider :get-error="getError" :touch="touch">
   *   <FCheckboxGroup v-model="model.services" field="services" :options="options" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FCheckboxGroup v-model="selected" :options="options" label="Select" inline />
   */
  export type CheckboxOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FCheckboxGroupProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Selected values array */
    modelValue?: (string | number)[]
    /** Group label */
    label?: string
    /** Checkbox options */
    options: CheckboxOption[]
    /** Display checkboxes horizontally */
    inline?: boolean
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FCheckboxGroupProps>(), {
    field: undefined,
    modelValue: () => [],
    label: undefined,
    inline: false,
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: (string | number)[]]
    blur: [event: FocusEvent]
  }>()

  const formContext = useFormContext()

  const fieldValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val as (string | number)[]),
  })

  const fieldError = computed(() => {
    if (props.field && formContext) {
      return formContext.getError(props.field)
    }
    return props.error
  })

  // Real-time validation for touched fields
  watch(
    () => props.modelValue,
    () => {
      if (props.field && formContext?.validateIfTouched) {
        formContext.validateIfTouched(props.field)
      }
    },
    { deep: true },
  )

  function handleBlur(e: FocusEvent) {
    if (props.field && formContext) {
      formContext.touch(props.field)
    }
    emit('blur', e)
  }
</script>
