<template>
  <!-- Error state -->
  <div
    v-if="error"
    class="f-route-page-error d-flex flex-column align-center justify-center"
    style="min-height: 400px; padding: 2rem"
  >
    <v-icon
      color="error"
      size="64"
    >
      mdi-alert-circle-outline
    </v-icon>
    <div class="text-h6 mt-4">Something went wrong</div>
    <div class="text-body-2 text-medium-emphasis mt-2">
      {{ errorMessage }}
    </div>
    <FButton
      class="mt-4"
      @click="emit('retry')"
    >
      Try Again
    </FButton>
  </div>

  <!-- Content -->
  <slot v-else />
</template>

<script lang="ts" setup>

  import { computed } from 'vue'
  import FButton from './FButton.vue'

  interface Props {
    /** Error to display (Error instance, string, or null) */
    error?: Error | string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    error: null,
  })

  const emit = defineEmits<{
    retry: []
  }>()

  // Extract error message - handles Error instances, strings, or null
  const errorMessage = computed(() => {
    if (!props.error) return 'An unexpected error occurred'
    if (props.error instanceof Error) return props.error.message
    return String(props.error)
  })
</script>

<style scoped>
  .f-route-page-error {
    text-align: center;
  }
</style>
