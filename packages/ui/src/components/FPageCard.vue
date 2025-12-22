<template>
  <div :class="['f-page-card-wrapper', { 'f-page-card-wrapper--fill': fillHeight }]">
    <FLoader :model-value="busy" />

    <FCard
      :class="['f-page-card', { 'f-page-card--fill': fillHeight }]"
      :subtitle="subtitle"
      :title="title"
      v-bind="$attrs"
    >
      <template
        v-if="$slots.prepend"
        #prepend
      >
        <slot name="prepend" />
      </template>

      <template
        v-if="$slots.commands"
        #append
      >
        <div class="d-flex ga-2">
          <slot name="commands" />
        </div>
      </template>

      <slot />
    </FCard>
  </div>
</template>

<script lang="ts" setup>
  /**
   * FPageCard - Page/section wrapper with loading overlay
   *
   * Provides a card with toolbar, loading overlay via `busy` prop,
   * and error handling via `error` prop (emits event for toast).
   *
   * @example
   * ```vue
   * <FPageCard title="Cases" :busy="isLoading" :error="error" @error="toast.error($event)">
   *   <template #commands>
   *     <FButton @click="add">Add</FButton>
   *   </template>
   *   <FDataTable :items="cases" />
   * </FPageCard>
   * ```
   */
  import { watch } from 'vue'
  import FCard from './FCard.vue'
  import FLoader from './FLoader.vue'

  interface Props {
    /** Section title */
    title?: string
    /** Section subtitle */
    subtitle?: string
    /** Shows loading overlay when true */
    busy?: boolean
    /** Error message - emits 'error' event when set */
    error?: string | null
    /** Fill available height */
    fillHeight?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: undefined,
    subtitle: undefined,
    busy: false,
    error: null,
    fillHeight: false,
  })

  const emit = defineEmits<{
    /** Emitted when error prop changes to a truthy value */
    error: [message: string]
  }>()

  // Watch error prop and emit event for toast handling
  watch(
    () => props.error,
    (newError) => {
      if (newError) {
        emit('error', newError)
      }
    },
  )
</script>

<style scoped>
  .f-page-card-wrapper {
    position: relative;
  }

  .f-page-card {
    overflow: visible;
  }

  /* Fill-height mode: use grid to propagate height */
  .f-page-card-wrapper--fill {
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
  }

  .f-page-card--fill {
    min-height: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .f-page-card--fill :deep(.v-card-text) {
    min-height: 0;
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
  }
</style>
