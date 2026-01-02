<template>
  <v-select
    v-model="fieldValue"
    :error-messages="fieldError"
    :items="options"
    :multiple="multiple"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FSelect - Dropdown select with validation support
   *
   * Supports both single and multi-select modes via the `multiple` prop.
   * When `multiple` is true, modelValue should be an array.
   * When `multiple` is false (default), modelValue should be a single value.
   *
   * @example
   * // Single select (default)
   * <FSelect v-model="status" :options="statusOptions" field="status" />
   *
   * @example
   * // Multi-select
   * <FSelect v-model="selectedItems" :options="options" multiple />
   *
   * @see https://vuetifyjs.com/en/components/selects/
   */
  export type SelectValue = string | number | null | (string | number)[]

  export type SelectOption = {
    title: string
    value: string | number
    disabled?: boolean
  }

  export interface FSelectProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Selected value(s) - single value when multiple is false, array when multiple is true */
    modelValue?: SelectValue
    /** Select options */
    options: SelectOption[]
    /** Enable multi-select mode (default: false) */
    multiple?: boolean
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
    multiple: false,
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
