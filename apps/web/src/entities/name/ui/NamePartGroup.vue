<template>
  <v-card
    class="mb-4"
    elevation="0"
    variant="outlined"
  >
    <v-card-title class="d-flex align-center pa-3 pb-2">
      <span class="text-subtitle-1 font-weight-medium">{{ label }}</span>
      <v-spacer />
      <slot name="actions" />
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-4">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  defineProps<{
    label: string
  }>()
</script>
