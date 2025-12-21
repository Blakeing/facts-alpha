<template>
  <v-textarea
    v-model="fieldValue"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FTextarea - Multiline text input with vee-validate integration
   *
   * Thin wrapper around v-textarea. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/textareas/
   *
   * @example
   * // Standalone
   * <FTextarea v-model="notes" label="Notes" />
   *
   * @example
   * // Form-integrated
   * <FTextarea name="description" label="Description" auto-grow />
   */
  export interface FTextareaProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Value for standalone v-model usage */
    modelValue?: string
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FTextareaProps>(), {
    name: undefined,
    modelValue: '',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<string>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val as string
      } else {
        emit('update:modelValue', val as string)
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
