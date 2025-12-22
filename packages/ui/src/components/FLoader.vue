<template>
  <v-overlay
    :model-value="modelValue"
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
  /**
   * FLoader - Loading indicator overlay component
   *
   * Covers parent container with a spinner. Parent must have position: relative.
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
  }

  withDefaults(defineProps<Props>(), {
    modelValue: true,
    color: 'primary',
    size: 48,
    width: 4,
    scrim: true,
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
