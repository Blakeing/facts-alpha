<template>
  <v-switch
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FSwitch - Toggle switch with validation support
   *
   * @example
   * // With form context
   * <FFormProvider :get-error="getError" :touch="touch">
   *   <FSwitch v-model="model.enabled" field="enabled" label="Enable" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FSwitch v-model="enabled" label="Enable notifications" />
   */
  type SwitchValue = boolean | string | number | null

  export interface FSwitchProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Switch value */
    modelValue?: SwitchValue
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FSwitchProps>(), {
    field: undefined,
    modelValue: false,
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: SwitchValue]
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
