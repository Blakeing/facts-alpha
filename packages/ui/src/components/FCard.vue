<template>
  <v-card
    :variant="computedVariant"
    :elevation="computedElevation"
    :rounded="rounded"
    :color="color"
    :class="cardClass"
    v-bind="$attrs"
  >
    <v-card-item v-if="title || subtitle || $slots.prepend || $slots.append">
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>

      <v-card-title v-if="title">{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>

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

export type CardVariant = 'elevated' | 'flat' | 'outlined' | 'tonal'

export interface FCardProps {
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Visual variant */
  variant?: CardVariant
  /** Elevation (shadow depth) - only for elevated variant */
  elevation?: string | number
  /** Border radius */
  rounded?: string | number | boolean
  /** Background color */
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

const computedVariant = computed(() => props.variant)

const computedElevation = computed(() => {
  if (props.variant === 'elevated') {
    return props.elevation ?? 2
  }
  return props.elevation ?? 0
})

const cardClass = computed(() => ({
  'f-card': true,
}))

const contentClass = computed(() => ({
  'pa-0': props.noPadding,
}))

const actionsClass = computed(() => ({
  'justify-end': props.actionsEnd,
}))
</script>

<style scoped>
.f-card {
  overflow: hidden;
}
</style>

