<template>
  <div v-bind="$attrs">
    <v-label
      v-if="label"
      class="mb-2"
    >
      {{ label }}
    </v-label>
    <div :class="['d-flex', inline ? 'flex-row flex-wrap ga-4' : 'flex-column']">
    <v-checkbox
      v-for="option in options"
      :key="String(option.value)"
      v-model="fieldValue"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
      :color="option.color"
      :error-messages="fieldError"
        hide-details="auto"
      @blur="handleBlur"
    />
    </div>
  </div>
</template>

<script lang="ts">
  /**
   * FCheckboxGroup - Multiple checkboxes with vee-validate integration
   *
   * Provides options array API for checkbox groups.
   * v-model is an array; each checkbox value is added/removed from it.
   *
   * @example
   * // Standalone
   * <FCheckboxGroup
   *   v-model="selectedTags"
   *   label="Tags"
   *   :options="[
   *     { label: 'Urgent', value: 'urgent' },
   *     { label: 'Featured', value: 'featured' }
   *   ]"
   *   inline
   * />
   *
   * @example
   * // Form-integrated
   * <FCheckboxGroup name="permissions" :options="permissionOptions" />
   */
  export type CheckboxOption = {
    label: string
    value: string | number
    disabled?: boolean
    color?: string
  }

  export interface FCheckboxGroupProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Selected values array */
    modelValue?: (string | number)[]
    /** Group label */
    label?: string
    /** Checkbox options */
    options: CheckboxOption[]
    /** Display checkboxes horizontally */
    inline?: boolean
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FCheckboxGroupProps>(), {
    name: undefined,
    modelValue: () => [],
    label: undefined,
    inline: false,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: (string | number)[]] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<(string | number)[]>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => (field ? field.value.value : props.modelValue),
    set: (val) => {
      if (field) {
        field.value.value = val as (string | number)[]
      } else {
        emit('update:modelValue', val as (string | number)[])
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  function handleBlur(e: FocusEvent) {
    field?.handleBlur(e)
  }
</script>
