<template>
  <v-text-field
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FTextField - Text input with vee-validate integration
   *
   * Thin wrapper around v-text-field. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/text-fields/
   *
   * @example
   * // Standalone
   * <FTextField v-model="email" label="Email" />
   *
   * @example
   * // Form-integrated (within FForm context)
   * <FTextField name="user.email" label="Email" />
   */
  export interface FTextFieldProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Value for standalone v-model usage */
    modelValue?: string | number
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FTextFieldProps>(), {
    name: undefined,
    modelValue: '',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string | number>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val as string | number
      } else {
        emit('update:modelValue', val as string | number)
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
