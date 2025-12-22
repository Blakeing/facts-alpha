<template>
  <slot />
</template>

<script lang="ts">
  /**
   * FFormProvider - Provides form context to child F* components
   *
   * Wrap form sections with this component to enable automatic
   * error display and blur validation via the `field` prop.
   *
   * @example
   * ```vue
   * const { model, getError, touch, validateIfTouched } = useFormModel(schema, defaults)
   *
   * <FFormProvider :get-error="getError" :touch="touch" :validate-if-touched="validateIfTouched">
   *   <FTextField v-model="model.name" field="name" label="Name" />
   *   <FTextField v-model="model.email" field="email" label="Email" />
   * </FFormProvider>
   * ```
   */
  export interface FFormProviderProps {
    /** Get error message for a field path */
    getError: (path: string) => string | undefined
    /** Mark field as touched (triggers validation) */
    touch: (path: string) => void
    /** Validate if touched (for real-time error clearing) */
    validateIfTouched?: (path: string) => void
  }
</script>

<script lang="ts" setup>
  import { provideFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FFormProviderProps>(), {
    validateIfTouched: undefined,
  })

  // Provide context to all child F* components
  provideFormContext({
    getError: props.getError,
    touch: props.touch,
    validateIfTouched: props.validateIfTouched,
  })
</script>
