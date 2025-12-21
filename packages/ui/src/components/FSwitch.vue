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
   * FSwitch - Toggle switch with vee-validate integration
   *
   * Thin wrapper around v-switch. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/switches/
   *
   * @example
   * // Standalone
   * <FSwitch v-model="notifications" label="Enable notifications" />
   *
   * @example
   * // Form-integrated
   * <FSwitch name="settings.darkMode" label="Dark Mode" />
   */
  type SwitchValue = boolean | string | number | null

  export interface FSwitchProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Switch value */
    modelValue?: SwitchValue
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, toRef } from 'vue'

  const props = withDefaults(defineProps<FSwitchProps>(), {
    name: undefined,
    modelValue: false,
  })

  const emit = defineEmits<{ 'update:modelValue': [value: SwitchValue] }>()

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<SwitchValue>(nameRef as unknown as string) : null

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
