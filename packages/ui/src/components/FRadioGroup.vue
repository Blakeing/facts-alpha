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
   * FRadioGroup - Radio button group with vee-validate integration
   *
   * Provides options array API for radio buttons.
   * All v-radio-group props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/radio-buttons/
   *
   * @example
   * // Standalone
   * <FRadioGroup
   *   v-model="size"
   *   label="Size"
   *   :options="[
   *     { label: 'Small', value: 'sm' },
   *     { label: 'Medium', value: 'md' },
   *     { label: 'Large', value: 'lg' }
   *   ]"
   * />
   *
   * @example
   * // Form-integrated
   * <FRadioGroup name="priority" :options="priorityOptions" inline />
   */
  export type RadioOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FRadioGroupProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Selected value */
    modelValue?: string | number | null
    /** Radio options */
    options: RadioOption[]
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FRadioGroupProps>(), {
    name: undefined,
    modelValue: null,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string | number | null] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string | number | null>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val
      } else {
        emit('update:modelValue', val)
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
