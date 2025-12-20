<template>
  <v-btn
    :variant="computedVariant"
    :color="computedColor"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :rounded="rounded"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

/**
 * Button intent determines the visual style and semantic meaning
 */
export type ButtonIntent = 'primary' | 'secondary' | 'danger' | 'ghost' | 'text'

/**
 * Button size options
 */
export type ButtonSize = 'x-small' | 'small' | 'default' | 'large' | 'x-large'

export interface FButtonProps {
  /** Visual intent/purpose of the button */
  intent?: ButtonIntent
  /** Size of the button */
  size?: ButtonSize
  /** Show loading spinner */
  loading?: boolean
  /** Disable the button */
  disabled?: boolean
  /** Full width button */
  block?: boolean
  /** Border radius style */
  rounded?: string | number | boolean
  /** Icon before text */
  prependIcon?: string
  /** Icon after text */
  appendIcon?: string
}

const props = withDefaults(defineProps<FButtonProps>(), {
  intent: 'primary',
  size: 'default',
  loading: false,
  disabled: false,
  block: false,
  rounded: undefined,
  prependIcon: undefined,
  appendIcon: undefined,
})

const intentConfig = {
  primary: { variant: 'flat', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  danger: { variant: 'flat', color: 'error' },
  ghost: { variant: 'tonal', color: 'primary' },
  text: { variant: 'text', color: 'primary' },
} as const

const computedVariant = computed(() => intentConfig[props.intent].variant)
const computedColor = computed(() => intentConfig[props.intent].color)
</script>

