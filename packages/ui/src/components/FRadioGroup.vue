<template>
  <v-radio-group
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
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

<script lang="ts">
  /**
   * FRadioGroup - Radio button group with validation support
   *
   * @example
   * // With form context
   * <FFormProvider :get-error="getError" :touch="touch">
   *   <FRadioGroup v-model="model.priority" field="priority" :options="options" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FRadioGroup v-model="priority" :options="priorityOptions" label="Priority" />
   */
  export type RadioOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FRadioGroupProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Selected value */
    modelValue?: string | number | null
    /** Radio options */
    options: RadioOption[]
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FRadioGroupProps>(), {
    field: undefined,
    modelValue: null,
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | null]
    blur: [event: FocusEvent]
  }>()

  const formContext = useFormContext()

  const fieldValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
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
  )

  function handleBlur(e: FocusEvent) {
    if (props.field && formContext) {
      formContext.touch(props.field)
    }
    emit('blur', e)
  }
</script>
