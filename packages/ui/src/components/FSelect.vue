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
    get: () => {
      // If field prop is set and context provides getValue, use it
      if (props.field && formContext?.getValue) {
        const contextValue = formContext.getValue(props.field)
        // getValue already converts undefined to null
        // Convert boolean false to null (invalid for selects)
        if (typeof contextValue === 'boolean') return null
        // Preserve valid falsy values like 0 (valid enum value)
        return contextValue as SelectValue
      }
      return props.modelValue
    },
    set: (val) => {
      emit('update:modelValue', val)
      // Also update context if available
      if (props.field && formContext?.onUpdate) {
        formContext.onUpdate(props.field, val)
      }
    },
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
