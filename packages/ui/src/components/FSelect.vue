<template>
  <v-select
    v-model="fieldValue"
    :error-messages="fieldError"
    :items="options"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FSelect - Dropdown select with validation support
   *
   * @example
   * // With form context (recommended)
   * <FFormProvider :get-error="getError" :touch="touch">
   *   <FSelect v-model="model.status" field="status" :options="statusOptions" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FSelect v-model="status" :options="statusOptions" label="Status" />
   */
  type SelectValue = string | number | null | (string | number)[]

  export type SelectOption = {
    title: string
    value: string | number
    disabled?: boolean
  }

  export interface FSelectProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Selected value */
    modelValue?: SelectValue
    /** Select options */
    options: SelectOption[]
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FSelectProps>(), {
    field: undefined,
    modelValue: null,
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: SelectValue]
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
