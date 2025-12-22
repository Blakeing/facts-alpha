<template>
  <v-alert
    v-if="hasErrors"
    type="error"
    variant="tonal"
    density="compact"
    class="mb-4"
  >
    <template #title>
      {{ title }}
    </template>
    <ul class="pl-4 mb-0">
      <li
        v-for="(error, field) in errors"
        :key="field"
      >
        {{ error }}
      </li>
    </ul>
  </v-alert>
</template>

<script lang="ts">
  /**
   * FFormErrors - Form validation error summary
   *
   * Displays a list of validation errors in an alert banner.
   * Typically placed at the top of a form to show all errors at once.
   *
   * @example
   * // With useFormModel
   * const { errors } = useFormModel(schema, getDefaults)
   *
   * <FFormErrors :errors="errors" />
   * <FTextField v-model="model.name" :error="getError('name')" />
   */
  export interface FFormErrorsProps {
    /** Error messages by field path */
    errors: Record<string, string>
    /** Alert title */
    title?: string
  }
</script>

<script lang="ts" setup>
  import { computed } from 'vue'

  const props = withDefaults(defineProps<FFormErrorsProps>(), {
    title: 'Please correct the following errors:',
  })

  const hasErrors = computed(() => Object.keys(props.errors).length > 0)
</script>
