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
   * FCheckbox - Checkbox with vee-validate integration
   *
   * Thin wrapper around v-checkbox. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/checkboxes/
   *
   * @example
   * // Standalone
   * <FCheckbox v-model="agreed" label="I agree to terms" />
   *
   * @example
   * // Form-integrated
   * <FCheckbox name="acceptTerms" label="Accept terms and conditions" />
   */
  type CheckboxValue = boolean | string | number | null

  export interface FCheckboxProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Checkbox value */
    modelValue?: CheckboxValue
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FCheckboxProps>(), {
    name: undefined,
    modelValue: false,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: CheckboxValue] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<CheckboxValue>(nameRef as unknown as string) : null

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
