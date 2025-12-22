<template>
  <v-checkbox
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FCheckbox - Checkbox with validation support
   *
   * @example
   * // With form context
   * <FFormProvider :get-error="getError" :touch="touch">
   *   <FCheckbox v-model="model.agreed" field="agreed" label="I agree" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FCheckbox v-model="agreed" label="I agree to terms" />
   */
  type CheckboxValue = boolean | string | number | null

  export interface FCheckboxProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Checkbox value */
    modelValue?: CheckboxValue
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FCheckboxProps>(), {
    field: undefined,
    modelValue: false,
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: CheckboxValue]
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
