<template>
  <v-chip
    v-bind="$attrs"
    @click:close="$emit('close')"
  >
    <slot />
  </v-chip>
</template>

<script lang="ts">
  /**
   * FChip - Compact element for tags, filters, and selections
   *
   * Thin wrapper around v-chip. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/chips/
   *
   * @example
   * // Basic chip
   * <FChip color="success">Active</FChip>
   *
   * @example
   * // Closable filter chip
   * <FChip closable @close="removeFilter">Status: Active</FChip>
   *
   * @example
   * // With icons (use Vuetify props)
   * <FChip prepend-icon="mdi-account">John Doe</FChip>
   */
</script>

<script lang="ts" setup>
  defineEmits<{ close: [] }>()
</script>
