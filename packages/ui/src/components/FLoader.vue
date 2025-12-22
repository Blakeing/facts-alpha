<template>
  <!-- Overlay mode - place inside a container with position: relative -->
  <v-overlay
    v-if="overlay"
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

  <!-- Inline mode - centered loading state (use with v-if to replace content) -->
  <div
    v-else-if="modelValue"
    class="f-loader d-flex flex-column align-center justify-center"
    :style="{ minHeight }"
  >
    <v-progress-circular
      :color="color"
      indeterminate
      :size="size"
      :width="width"
    />
    <p
      v-if="text"
      class="text-body-2 mt-3 text-medium-emphasis"
    >
      {{ text }}
    </p>
  </div>
</template>

<script lang="ts" setup>
  /**
   * FLoader - Loading indicator component
   *
   * Two modes:
   * 1. Overlay (like legacy Wait) - covers parent container
   * 2. Inline (default) - centered spinner, replaces content
   *
   * @example
   * <!-- Overlay: place inside a card/container with position: relative -->
   * <FCard style="position: relative">
   *   <FLoader v-model="isBusy" overlay />
   *   ...content stays visible but covered...
   * </FCard>
   *
   * <!-- Inline: use with v-if to replace content while loading -->
   * <FLoader v-if="isLoading" text="Loading..." />
   * <div v-else>...content...</div>
   */

  interface Props {
    /** Whether the loader is visible */
    modelValue?: boolean
    /** Use overlay mode (covers parent - requires parent position: relative) */
    overlay?: boolean
    /** Loading text (inline mode only) */
    text?: string
    /** Spinner color */
    color?: string
    /** Spinner size in pixels */
    size?: number
    /** Spinner stroke width */
    width?: number
    /** Minimum height for inline mode */
    minHeight?: string
    /** Show scrim background in overlay mode */
    scrim?: boolean
  }

  withDefaults(defineProps<Props>(), {
    modelValue: true,
    overlay: false,
    text: undefined,
    color: 'primary',
    size: 44,
    width: 4,
    minHeight: '200px',
    scrim: true,
  })
</script>

<style scoped>
  .f-loader {
    padding: 24px;
    width: 100%;
  }

  .f-loader-overlay :deep(.v-overlay__content) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
