<template>
  <v-btn
    :variant="computedVariant"
    :color="computedColor"
    :rounded="rounded"
    :elevation="0"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts" setup>
  /**
   * FButton - Intent-based button wrapper
   *
   * Maps semantic `intent` to Vuetify's variant + color.
   * All other v-btn props pass through via $attrs.
   */
  import { computed } from 'vue'

  export type ButtonIntent = 'primary' | 'secondary' | 'tonal' | 'danger' | 'ghost' | 'text'

  export interface FButtonProps {
    /** Semantic intent - maps to variant + color */
    intent?: ButtonIntent
    /** Border radius - defaults to pill */
    rounded?: string | number | boolean
  }

  const props = withDefaults(defineProps<FButtonProps>(), {
    intent: 'primary',
    rounded: 'pill',
  })

  const intentConfig = {
    primary: { variant: 'flat', color: 'primary' },
    secondary: { variant: 'outlined', color: 'primary' },
    tonal: { variant: 'tonal', color: 'primary' },
    danger: { variant: 'flat', color: 'error' },
    ghost: { variant: 'tonal', color: 'default' },
    text: { variant: 'text', color: 'primary' },
  } as const

  const computedVariant = computed(() => intentConfig[props.intent].variant)
  const computedColor = computed(() => intentConfig[props.intent].color)
</script>
