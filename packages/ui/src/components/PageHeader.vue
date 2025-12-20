<template>
  <div class="d-flex align-center justify-space-between mb-6">
    <div>
      <h1 class="text-h4 font-weight-semibold mb-1">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-body-1 text-medium-emphasis"
      >
        {{ subtitle }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="d-flex ga-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface PageHeaderProps {
  title: string
  subtitle?: string
}

withDefaults(defineProps<PageHeaderProps>(), {
  subtitle: undefined,
})
</script>

