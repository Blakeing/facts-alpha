<template>
  <v-tooltip v-bind="$attrs">
    <template #activator="{ props: activatorProps }">
      <slot
        name="activator"
        :props="activatorProps"
      />
    </template>
    <slot />
  </v-tooltip>
</template>

<script lang="ts">
  /**
   * FTooltip - Hover hint for additional context
   *
   * Thin wrapper around v-tooltip. All Vuetify props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/tooltips/
   *
   * @example
   * <FTooltip text="Save changes" location="top">
   *   <template #activator="{ props }">
   *     <FButton v-bind="props" icon="mdi-content-save" />
   *   </template>
   * </FTooltip>
   */
</script>

<script lang="ts" setup></script>
