<template>
  <v-card
    :variant="computedVariant"
    :elevation="computedElevation"
    :rounded="rounded"
    :color="computedColor"
    v-bind="$attrs"
  >
    <v-card-item v-if="title || subtitle || $slots.prepend || $slots.append">
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>

      <v-card-title v-if="title">
        {{ title }}
      </v-card-title>
      <v-card-subtitle v-if="subtitle">
        {{ subtitle }}
      </v-card-subtitle>

      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
    </v-card-item>

    <v-card-text v-if="$slots.default" :class="contentClass">
      <slot />
    </v-card-text>

    <v-card-actions v-if="$slots.actions" :class="actionsClass">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

/**
 * M3 Card Variants
 *
 * - elevated: Has shadow, surface color background
 * - filled: Surface-container background, no shadow
 * - outlined: Border, surface color background
 */
export type CardVariant = 'elevated' | 'filled' | 'outlined'

export interface FCardProps {
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /**
   * M3 card variant:
   * - elevated: shadow elevation
   * - filled: surface-container background
   * - outlined: border (default)
   */
  variant?: CardVariant
  /** Elevation (shadow depth) - only for elevated variant */
  elevation?: string | number
  /** Border radius */
  rounded?: string | number | boolean
  /** Background color override */
  color?: string
  /** Remove default padding */
  noPadding?: boolean
  /** Align actions to the end */
  actionsEnd?: boolean
}

const props = withDefaults(defineProps<FCardProps>(), {
  title: undefined,
  subtitle: undefined,
  variant: 'outlined',
  elevation: undefined,
  rounded: 'lg',
  color: undefined,
  noPadding: false,
  actionsEnd: true,
})

/**
 * Map M3 variants to Vuetify variants
 */
const computedVariant = computed(() => {
  switch (props.variant) {
    case 'elevated':
      return 'elevated'
    case 'filled':
      return 'flat'
    case 'outlined':
    default:
      return 'outlined'
  }
})

/**
 * M3 elevation levels
 */
const computedElevation = computed(() => {
  if (props.elevation !== undefined) {
    return props.elevation
  }
  if (props.variant === 'elevated') {
    return 1
  }
  return 0
})

/**
 * M3 surface colors by variant
 */
const computedColor = computed(() => {
  if (props.color) {
    return props.color
  }
  switch (props.variant) {
    case 'filled':
      return 'surface-variant'
    case 'elevated':
    case 'outlined':
    default:
      return 'surface'
  }
})

const contentClass = computed(() => ({
  'pa-0': props.noPadding,
}))

const actionsClass = computed(() => ({
  'justify-end': props.actionsEnd,
}))
</script>
