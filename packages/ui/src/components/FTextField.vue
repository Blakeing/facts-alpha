<template>
  <v-text-field
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  >
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData || {}"
      />
    </template>
  </v-text-field>
</template>

<script lang="ts">
  /**
   * FTextField - Text input with validation support
   *
   * Thin wrapper around v-text-field. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/text-fields/
   *
   * @example
   * // With form context (recommended - auto error/blur + real-time clearing)
   * <FFormProvider :get-error="getError" :touch="touch" :validate-if-touched="validateIfTouched">
   *   <FTextField v-model="model.email" field="email" label="Email" />
   * </FFormProvider>
   *
   * @example
   * // Standalone (no validation)
   * <FTextField v-model="email" label="Email" />
   */
  export interface FTextFieldProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Value for v-model binding */
    modelValue?: string | number | null
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  // Ensure directives pass through to the underlying input
  defineOptions({
    inheritAttrs: true,
  })

  const props = withDefaults(defineProps<FTextFieldProps>(), {
    field: undefined,
    modelValue: '',
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | null]
    blur: [event: FocusEvent]
  }>()

  // Inject form context (if provided by parent)
  const formContext = useFormContext()

  // Check if we're using form context for data binding
  const useFormContextBinding = computed(
    () => props.field && formContext?.getValue && formContext?.onUpdate,
  )

  const fieldValue = computed({
    get: () => {
      // If field prop is set and context provides getValue, use it
      if (useFormContextBinding.value && formContext?.getValue && props.field) {
        const contextValue = formContext.getValue(props.field)
        return contextValue != null ? String(contextValue) : ''
      }
      return props.modelValue ?? ''
    },
    set: (val) => {
      // When using form context, ONLY update via context (not v-model)
      // This prevents conflicts between v-model mutations and form context cloning
      if (useFormContextBinding.value && formContext?.onUpdate && props.field) {
        formContext.onUpdate(props.field, val)
      } else {
        emit('update:modelValue', val)
      }
    },
  })

  // Error: form context (via field prop) > manual error prop
  const fieldError = computed(() => {
    if (props.field && formContext) {
      return formContext.getError(props.field)
    }
    return props.error
  })

  // Real-time validation: validate on input if field has been touched
  // This allows errors to clear immediately as user fixes them
  watch(
    () => props.modelValue,
    () => {
      if (props.field && formContext?.validateIfTouched) {
        formContext.validateIfTouched(props.field)
      }
    },
  )

  function handleBlur(e: FocusEvent) {
    // Auto-touch via form context if field prop is set
    if (props.field && formContext) {
      formContext.touch(props.field)
    }
    emit('blur', e)
  }
</script>
