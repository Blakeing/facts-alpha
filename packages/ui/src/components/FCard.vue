<template>
  <v-card v-bind="$attrs">
    <v-card-item v-if="title || subtitle || $slots.prepend || $slots.append">
      <template
        v-if="$slots.prepend"
        #prepend
      >
        <slot name="prepend" />
      </template>

      <v-card-title v-if="title">{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>

      <template
        v-if="$slots.append"
        #append
      >
        <slot name="append" />
      </template>
    </v-card-item>

    <v-card-text v-if="$slots.default">
      <slot />
    </v-card-text>

    <v-card-actions
      v-if="$slots.actions"
      class="justify-end"
    >
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  /**
   * FCard - Card wrapper with title/subtitle slots
   *
   * Provides convenient title/subtitle props and action slot.
   * All other v-card props pass through via $attrs.
   */

  export type CardVariant = 'elevated' | 'filled' | 'outlined'

  export interface FCardProps {
    title?: string
    subtitle?: string
    /** Card variant - defaults to outlined */
    variant?: CardVariant
    /** Border radius - defaults to lg */
    rounded?: string | number | boolean
  }

  const props = withDefaults(defineProps<FCardProps>(), {
    title: undefined,
    subtitle: undefined,
    variant: 'outlined',
    rounded: 'lg',
  })
</script>
