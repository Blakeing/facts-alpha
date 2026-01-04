<template>
  <v-overlay
    :model-value="effectiveLoading"
    class="f-loader-overlay"
    contained
    persistent
    :scrim="scrim"
  >
    <v-progress-circular
      :color="color"
      indeterminate
      :size="size"
      :width="width"
    />
  </v-overlay>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useAppContext } from '../composables'

  /**
   * FLoader - Loading indicator overlay component
   *
   * Covers parent container with a spinner. Parent must have position: relative.
   * Automatically suppresses itself when app is bootstrapping (if app context is provided).
   *
   * @example
   * <!-- Place inside a card/container with position: relative -->
   * <FCard style="position: relative">
   *   <FLoader v-model="isBusy" />
   *   ...content stays visible but covered...
   * </FCard>
   */

  interface Props {
    /** Whether the loader is visible */
    modelValue?: boolean
    /** Spinner color */
    color?: string
    /** Spinner size in pixels */
    size?: number
    /** Spinner stroke width */
    width?: number
    /** Show scrim background */
    scrim?: boolean
    /** Suppress loader when app is bootstrapping (default: true) */
    suppressWhenBootstrapping?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: true,
    color: 'primary',
    size: 48,
    width: 4,
    scrim: true,
    suppressWhenBootstrapping: true,
  })

  // Inject app context if provided (only once at setup)
  const appContext = useAppContext()

  // Compute effective loading state: suppress if bootstrapping and suppression is enabled
  // Optimized: early returns to minimize computation
  const effectiveLoading = computed(() => {
    if (!props.modelValue) return false
    if (props.suppressWhenBootstrapping && appContext?.isBootstrapping.value) {
      return false
    }
    return props.modelValue
  })
</script>

<style scoped>
  .f-loader-overlay :deep(.v-overlay__content) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
