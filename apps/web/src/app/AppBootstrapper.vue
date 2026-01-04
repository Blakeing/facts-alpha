<template>
  <v-overlay
    class="app-bootstrapper-overlay"
    :model-value="bootstrapper.isBootstrapping"
    persistent
    :scrim="true"
    scroll-strategy="none"
    z-index="9999"
  >
    <div class="d-flex flex-column align-center ga-4">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
        width="4"
      />
      <div class="text-body-1 text-medium-emphasis">Loading application...</div>
    </div>
  </v-overlay>
</template>

<script lang="ts" setup>
  import { useBootstrapperStore } from '@/shared/lib'

  const bootstrapper = useBootstrapperStore()
</script>

<style scoped>
  .app-bootstrapper-overlay :deep(.v-overlay__content) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>

