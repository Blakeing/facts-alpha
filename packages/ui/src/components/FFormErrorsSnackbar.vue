<template>
  <v-snackbar
    v-model="isOpen"
    color="error"
    location="top"
    :timeout="-1"
    multi-line
  >
    <div class="d-flex align-start">
      <v-icon
        class="mr-3"
        icon="mdi-alert-circle"
      />
      <div class="flex-grow-1">
        <div class="text-subtitle-2 mb-1">{{ title }}</div>
        <ul class="pl-4 mb-0 text-body-2">
          <li
            v-for="(error, field) in errors"
            :key="field"
          >
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <template #actions>
      <v-btn
        variant="text"
        @click="isOpen = false"
      >
        Dismiss
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
  /**
   * FFormErrorsSnackbar - Dismissable form validation error snackbar
   *
   * Shows validation errors in a snackbar that appears on failed save.
   * User can dismiss it, and errors clear automatically as fields are fixed.
   *
   * @example
   * ```vue
   * const { errors, validate } = useFormModel(schema, defaults)
   * const showErrors = ref(false)
   *
   * async function handleSave() {
   *   const { valid } = validate()
   *   if (!valid) {
   *     showErrors.value = true
   *     return
   *   }
   *   await save()
   * }
   *
   * <FFormErrorsSnackbar v-model="showErrors" :errors="errors" />
   * ```
   */
  export interface FFormErrorsSnackbarProps {
    /** Control visibility (v-model) */
    modelValue?: boolean
    /** Error messages by field path */
    errors: Record<string, string>
    /** Snackbar title */
    title?: string
  }
</script>

<script lang="ts" setup>
  import { computed, watch } from 'vue'

  const props = withDefaults(defineProps<FFormErrorsSnackbarProps>(), {
    modelValue: false,
    title: 'Please correct the following errors:',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  // Auto-dismiss when all errors are resolved
  watch(
    () => Object.keys(props.errors).length,
    (count) => {
      if (count === 0 && isOpen.value) {
        isOpen.value = false
      }
    },
  )
</script>
