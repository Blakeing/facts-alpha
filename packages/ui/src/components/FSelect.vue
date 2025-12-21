<template>
  <v-select
    v-model="fieldValue"
    :items="options"
    :error-messages="fieldError"
    v-bind="$attrs"
    @blur="handleBlur"
  />
</template>

<script lang="ts">
  /**
   * FSelect - Dropdown select with vee-validate integration
   *
   * Thin wrapper around v-select. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/selects/
   *
   * @example
   * // Standalone
   * <FSelect v-model="status" :options="statusOptions" label="Status" />
   *
   * @example
   * // Form-integrated
   * <FSelect name="role" :options="roleOptions" label="Role" />
   */
  export type SelectOption = {
    title: string
    value: string | number
    disabled?: boolean
  }

  type SelectValue = string | number | (string | number)[] | null

  export interface FSelectProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Selected value */
    modelValue?: SelectValue
    /** Select options */
    options: SelectOption[]
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FSelectProps>(), {
    name: undefined,
    modelValue: null,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: SelectValue] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<SelectValue>(nameRef as unknown as string) : null

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
